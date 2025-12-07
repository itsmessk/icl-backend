import CourseInquiry from '../models/CourseInquiry.js';
import Course from '../models/Course.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay with configurable credentials based on environment
const isTestMode = process.env.RAZORPAY_MODE !== 'production';

// Determine if Razorpay credentials are available
const hasRazorpayCredentials = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

// Configure Razorpay with appropriate credentials if available
let razorpay;
if (hasRazorpayCredentials) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  console.log(`Payment Gateway running in ${isTestMode ? 'TEST' : 'PRODUCTION'} mode`);
} else {
  console.warn('Warning: Razorpay credentials not found. Payment functionality will be limited.');
}

// @desc    Create a course inquiry
// @route   POST /api/course-inquiries
// @access  Public
export const createCourseInquiry = async (req, res) => {
  try {
    const { name, email, phone, courseId, organization, degree, department, year } = req.body;
    
    if (!name || !email || !phone || !courseId || !organization || !degree || !department || !year) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Create inquiry record
    const inquiry = await CourseInquiry.create({
      name,
      email,
      phone,
      organization,
      degree,
      department,
      year,
      courseId,
      courseName: course.title
    });
    
    res.status(201).json({
      _id: inquiry._id,
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      organization: inquiry.organization, 
      degree: inquiry.degree,
      department: inquiry.department,
      year: inquiry.year,

      courseId: inquiry.courseId,
      courseName: inquiry.courseName,
      message: 'Inquiry received successfully'
    });
    
  } catch (error) {
    console.error('Error creating course inquiry:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create Razorpay order for a course inquiry
// @route   POST /api/course-inquiries/:id/create-order
// @access  Public
export const createInquiryOrder = async (req, res) => {
  try {
    // Check if Razorpay is configured
    if (!razorpay) {
      return res.status(500).json({ message: 'Payment service not configured. Please contact administrator.' });
    }
    
    const { id } = req.params;
    
    // Find the inquiry
    const inquiry = await CourseInquiry.findById(id);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    
    // Find the course
    const course = await Course.findById(inquiry.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const amount = course.price;
    
    // Create Razorpay order
    const options = {
      amount: amount * 100, // Amount in smallest currency unit (paise)
      currency: 'INR',
      receipt: `receipt_inquiry_${id}_${Date.now()}`
    };
    
    // Create order in Razorpay
    const order = await razorpay.orders.create(options);
    
    // Update inquiry with order ID
    inquiry.razorpayOrderId = order.id;
    await inquiry.save();
    
    // Return order details including Razorpay key for the frontend
    res.status(200).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      inquiryId: inquiry._id,
      key_id: process.env.RAZORPAY_KEY_ID,
      prefill: {
        name: inquiry.name,
        email: inquiry.email,
        contact: inquiry.phone
      },
      isTestMode
    });
    
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Verify Razorpay payment for inquiry
// @route   POST /api/course-inquiries/verify-payment
// @access  Public
export const verifyInquiryPayment = async (req, res) => {
  try {
    // Check if Razorpay is configured
    if (!razorpay) {
      return res.status(500).json({ message: 'Payment service not configured. Please contact administrator.' });
    }
    
    // Handle different parameter naming from Razorpay
    // From direct API: razorpayOrderId, razorpayPaymentId, razorpaySignature
    // From redirect URL: razorpay_order_id, razorpay_payment_id, razorpay_signature
    const razorpayOrderId = req.body.razorpayOrderId || req.body.razorpay_order_id;
    const razorpayPaymentId = req.body.razorpayPaymentId || req.body.razorpay_payment_id;
    const razorpaySignature = req.body.razorpaySignature || req.body.razorpay_signature;
    const inquiryId = req.body.inquiryId;
    const organization = req.body.organization;
    
    // Log the received payment details
    console.log('Payment verification details:', {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature, 
      inquiryId,
      organization  
    });
    
    // Find the inquiry
    const inquiry = await CourseInquiry.findById(inquiryId);
    if (!inquiry) {
      return res.status(404).json({ 
        success: false,
        message: 'Inquiry not found' 
      });
    }
    
    let isAuthentic = false;
    
    if (isTestMode) {
      // For testing, consider all payments authentic
      isAuthentic = true;
      console.log('Running in test mode - payment considered authentic');
    } else {
      // In production, verify the signature
      const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
      hmac.update(razorpayOrderId + '|' + razorpayPaymentId);
      const generatedSignature = hmac.digest('hex');
      isAuthentic = generatedSignature === razorpaySignature;
      console.log('Signature verification:', isAuthentic);
    }
    
    if (isAuthentic) {
      // Update inquiry status
      inquiry.razorpayPaymentId = razorpayPaymentId;
      inquiry.razorpayOrderId = razorpayOrderId;
      inquiry.razorpaySignature = razorpaySignature;
      inquiry.paymentStatus = 'completed';
      inquiry.status = 'enrolled';
      if (organization) {
        inquiry.organization = organization;
      }
      await inquiry.save();
      
      console.log(`Payment for inquiry ${inquiryId} verified successfully`);
      
      res.status(200).json({ 
        success: true, 
        message: 'Payment verified successfully',
        inquiry: {
          _id: inquiry._id,
          name: inquiry.name,
          email: inquiry.email,
          phone: inquiry.phone,
          organization: inquiry.organization,
          courseName: inquiry.courseName,
          status: inquiry.status
        }
      });
    } else {
      // Update inquiry status to failed
      inquiry.paymentStatus = 'failed';
      await inquiry.save();
      
      console.log(`Payment verification failed for inquiry ${inquiryId}`);
      
      res.status(400).json({ 
        success: false, 
        message: 'Payment verification failed' 
      });
    }
    
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server Error' 
    });
  }
};

// @desc    Simplified verification with only payment ID (for redirects from Razorpay)
// @route   POST /api/course-inquiries/verify-payment-simple
// @access  Public
export const verifyPaymentSimple = async (req, res) => {
  try {
    // Check if Razorpay is configured
    if (!razorpay) {
      return res.status(500).json({ 
        success: false,
        message: 'Payment service not configured. Please contact administrator.' 
      });
    }
    
    const { paymentId, inquiryId, organization } = req.body;
    
    console.log('Simple payment verification with:', { paymentId, inquiryId, organization });
    
    if (!paymentId || !inquiryId) {
      return res.status(400).json({ 
        success: false,
        message: 'Payment ID and Inquiry ID are required' 
      });
    }
    
    // Find the inquiry
    const inquiry = await CourseInquiry.findById(inquiryId);
    if (!inquiry) {
      return res.status(404).json({ 
        success: false,
        message: 'Inquiry not found' 
      });
    }
    
    try {
      // In test mode, we can skip verification, but in production, 
      // we can try to fetch the payment from Razorpay to verify it
      let paymentVerified = isTestMode;
      
      if (!isTestMode) {
        // Fetch payment details from Razorpay to verify it exists
        const paymentDetails = await razorpay.payments.fetch(paymentId);
        console.log('Payment details from Razorpay:', paymentDetails);
        
        // Check if payment is captured/authorized
        paymentVerified = paymentDetails && 
                          (paymentDetails.status === 'captured' || 
                           paymentDetails.status === 'authorized');
      }
      
      if (paymentVerified) {
        // Update inquiry status
        inquiry.razorpayPaymentId = paymentId;
        inquiry.paymentStatus = 'completed';
        inquiry.status = 'enrolled';
        if (organization) {
          inquiry.organization = organization;
        }
        await inquiry.save();
        
        console.log(`Payment ${paymentId} for inquiry ${inquiryId} verified successfully`);
        
        return res.status(200).json({ 
          success: true, 
          message: 'Payment verified successfully',
          inquiry: {
            _id: inquiry._id,
            name: inquiry.name,
            email: inquiry.email,
            phone: inquiry.phone,
            organization: inquiry.organization,
            degree: inquiry.degree,
            department: inquiry.department,
            year: inquiry.year,
            courseName: inquiry.courseName,
            status: inquiry.status
          }
        });
      } else {
        inquiry.paymentStatus = 'failed';
        await inquiry.save();
        
        console.log(`Payment verification failed for ${paymentId}`);
        
        return res.status(400).json({ 
          success: false, 
          message: 'Payment verification failed' 
        });
      }
    } catch (razorpayError) {
      console.error('Error verifying payment with Razorpay:', razorpayError);
      
      // If in test mode, consider the payment successful despite the error
      if (isTestMode) {
        inquiry.razorpayPaymentId = paymentId;
        inquiry.paymentStatus = 'completed';
        inquiry.status = 'enrolled';
        if (organization) {
          inquiry.organization = organization;
        }
        await inquiry.save();
        
        console.log(`Test mode: Payment ${paymentId} for inquiry ${inquiryId} marked as successful`);
        
        return res.status(200).json({ 
          success: true, 
          message: 'Payment verified successfully (test mode)',
          inquiry: {
            _id: inquiry._id,
            name: inquiry.name,
            email: inquiry.email,
            phone: inquiry.phone,
            organization: inquiry.organization,
            degree: inquiry.degree,
            department: inquiry.department,
            year: inquiry.year,
            courseName: inquiry.courseName,
            status: inquiry.status
          }
        });
      }
      
      return res.status(400).json({ 
        success: false, 
        message: 'Payment verification failed: Could not verify with Razorpay' 
      });
    }
  } catch (error) {
    console.error('Error in simple payment verification:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server Error' 
    });
  }
};

// @desc    Get all course inquiries
// @route   GET /api/course-inquiries
// @access  Private/Admin
export const getInquiries = async (req, res) => {
  try {
    const inquiries = await CourseInquiry.find().sort({ createdAt: -1 });
    res.status(200).json(inquiries);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ message: 'Server Error' });
  }
}; 


export const deleteEnquiry = async (req, res) => {
  try {
    const inquiryId = req.params.id;
    
    // Check if the inquiry exists
    const inquiry = await CourseInquiry.findById(inquiryId);
      
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    // Delete the inquiry
    await CourseInquiry.findByIdAndDelete(inquiryId);
    
    res.status(200).json({ message: 'Inquiry deleted successfully' });
  }
  catch (error) {
    console.error('Error deleting inquiry:', error);
    res.status(500).json({ message: 'Server Error' });
  }
}


export const deleteitems = async (req, res) => {
  try {
    const date = '2025-04-27';
    // Expected date format: YYYY-MM-DD (ISO format)
    
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }
    
    const targetDate = new Date(date);
    
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    
    // Delete all inquiries created before the specified date
    const result = await CourseInquiry.deleteMany({ 
      createdAt: { $lt: targetDate } 
    });
    
    res.status(200).json({ 
      message: `Successfully deleted ${result.deletedCount} inquiries created before ${targetDate.toISOString().split('T')[0]}` 
    });
  } catch (error) {
    console.error('Error deleting inquiries:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};