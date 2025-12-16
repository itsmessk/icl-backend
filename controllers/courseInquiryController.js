import CourseInquiry from '../models/CourseInquiry.js';
import Course from '../models/Course.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { sendEnrollmentSuccessEmail } from '../utils/emailUtils.js';

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
      
      // Send enrollment success email
      try {
        await sendEnrollmentSuccessEmail(
          inquiry.email,
          inquiry.name,
          inquiry.courseName,
          inquiry.organization
        );
        console.log(`Enrollment email sent to ${inquiry.email}`);
      } catch (emailError) {
        console.error('Failed to send enrollment email:', emailError);
        // Continue even if email fails
      }
      
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
        
        // Send enrollment success email
        try {
          await sendEnrollmentSuccessEmail(
            inquiry.email,
            inquiry.name,
            inquiry.courseName,
            inquiry.organization
          );
          console.log(`Enrollment email sent to ${inquiry.email}`);
        } catch (emailError) {
          console.error('Failed to send enrollment email:', emailError);
          // Continue even if email fails
        }
        
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
        
        // Send enrollment success email
        try {
          await sendEnrollmentSuccessEmail(
            inquiry.email,
            inquiry.name,
            inquiry.courseName,
            inquiry.organization
          );
          console.log(`Enrollment email sent to ${inquiry.email}`);
        } catch (emailError) {
          console.error('Failed to send enrollment email:', emailError);
          // Continue even if email fails
        }
        
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

// @desc    Get dashboard statistics with existing data
// @route   GET /api/course-inquiries/dashboard/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    // Total inquiries
    const totalInquiries = await CourseInquiry.countDocuments();
    
    // Inquiries by status
    const statusCounts = await CourseInquiry.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Inquiries by payment status
    const paymentStatusCounts = await CourseInquiry.aggregate([
      { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
    ]);
    
    // Today's inquiries
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayInquiries = await CourseInquiry.countDocuments({
      createdAt: { $gte: startOfDay }
    });
    
    // This week's inquiries
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const weekInquiries = await CourseInquiry.countDocuments({
      createdAt: { $gte: startOfWeek }
    });
    
    // This month's inquiries
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const monthInquiries = await CourseInquiry.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    
    // Conversion rate (enrolled / total)
    const enrolledCount = await CourseInquiry.countDocuments({ status: 'enrolled' });
    const conversionRate = totalInquiries > 0 ? ((enrolledCount / totalInquiries) * 100).toFixed(2) : 0;
    
    // Payment completion rate
    const completedPayments = await CourseInquiry.countDocuments({ paymentStatus: 'completed' });
    const paymentCompletionRate = totalInquiries > 0 ? ((completedPayments / totalInquiries) * 100).toFixed(2) : 0;
    
    // Revenue (completed payments)
    const revenueData = await CourseInquiry.aggregate([
      {
        $match: { paymentStatus: 'completed' }
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course'
        }
      },
      {
        $unwind: '$course'
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$course.price' }
        }
      }
    ]);
    
    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
    
    // Top courses by inquiry count
    const topCourses = await CourseInquiry.aggregate([
      {
        $group: {
          _id: '$courseName',
          count: { $sum: 1 },
          enrolled: {
            $sum: { $cond: [{ $eq: ['$status', 'enrolled'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Recent activity (last 7 days trend)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const count = await CourseInquiry.countDocuments({
        createdAt: { $gte: date, $lt: nextDate }
      });
      
      last7Days.push({
        date: date.toISOString().split('T')[0],
        count
      });
    }
    
    // Organization breakdown
    const topOrganizations = await CourseInquiry.aggregate([
      {
        $group: {
          _id: '$organization',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Department breakdown
    const topDepartments = await CourseInquiry.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    res.status(200).json({
      totalInquiries,
      todayInquiries,
      weekInquiries,
      monthInquiries,
      conversionRate: parseFloat(conversionRate),
      paymentCompletionRate: parseFloat(paymentCompletionRate),
      totalRevenue,
      statusBreakdown: statusCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      paymentBreakdown: paymentStatusCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      topCourses,
      topOrganizations,
      topDepartments,
      last7DaysTrend: last7Days
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get inquiries with filtering and pagination
// @route   GET /api/course-inquiries/filter
// @access  Private/Admin
export const getFilteredInquiries = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      paymentStatus,
      courseName,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      startDate,
      endDate
    } = req.query;
    
    // Build filter query
    const filter = {};
    
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (courseName) filter.courseName = { $regex: courseName, $options: 'i' };
    
    // Search in name, email, or phone
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Execute query
    const inquiries = await CourseInquiry.find(filter)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip);
    
    // Get total count for pagination
    const total = await CourseInquiry.countDocuments(filter);
    
    res.status(200).json({
      inquiries,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalInquiries: total,
      hasMore: skip + inquiries.length < total
    });
  } catch (error) {
    console.error('Error fetching filtered inquiries:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single inquiry by ID
// @route   GET /api/course-inquiries/:id
// @access  Private/Admin
export const getInquiryById = async (req, res) => {
  try {
    const inquiry = await CourseInquiry.findById(req.params.id)
      .populate('courseId');
    
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    
    res.status(200).json(inquiry);
  } catch (error) {
    console.error('Error fetching inquiry:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update inquiry status
// @route   PATCH /api/course-inquiries/:id/status
// @access  Private/Admin
export const updateInquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'contacted', 'enrolled', 'canceled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const inquiry = await CourseInquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    
    res.status(200).json(inquiry);
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Manually verify payment and enroll student
// @route   PATCH /api/course-inquiries/:id/manual-verify
// @access  Private/Admin
export const manuallyVerifyPayment = async (req, res) => {
  try {
    const { paymentId, notes } = req.body;
    
    const inquiry = await CourseInquiry.findById(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    
    // Update inquiry status
    inquiry.paymentStatus = 'completed';
    inquiry.status = 'enrolled';
    
    if (paymentId) {
      inquiry.razorpayPaymentId = paymentId;
    }
    
    await inquiry.save();
    
    console.log(`Payment manually verified for inquiry ${inquiry._id} by admin`);
    
    // Send enrollment success email
    try {
      await sendEnrollmentSuccessEmail(
        inquiry.email,
        inquiry.name,
        inquiry.courseName,
        inquiry.organization
      );
      console.log(`Enrollment email sent to ${inquiry.email} after manual verification`);
    } catch (emailError) {
      console.error('Failed to send enrollment email:', emailError);
      // Continue even if email fails
    }
    
    res.status(200).json({
      success: true,
      message: 'Payment manually verified and student enrolled successfully',
      inquiry: {
        _id: inquiry._id,
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        organization: inquiry.organization,
        courseName: inquiry.courseName,
        status: inquiry.status,
        paymentStatus: inquiry.paymentStatus
      }
    });
  } catch (error) {
    console.error('Error manually verifying payment:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update payment status only
// @route   PATCH /api/course-inquiries/:id/payment-status
// @access  Private/Admin
export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, razorpayPaymentId } = req.body;
    
    if (!['pending', 'completed', 'failed'].includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }
    
    const updateData = { paymentStatus };
    if (razorpayPaymentId) {
      updateData.razorpayPaymentId = razorpayPaymentId;
    }
    
    const inquiry = await CourseInquiry.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    
    res.status(200).json(inquiry);
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Export inquiries to CSV
// @route   GET /api/course-inquiries/export
// @access  Private/Admin
export const exportInquiries = async (req, res) => {
  try {
    const { startDate, endDate, status, paymentStatus } = req.query;
    
    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }
    
    const inquiries = await CourseInquiry.find(filter)
      .sort({ createdAt: -1 });
    
    // Convert to CSV format
    const csvHeaders = [
      'ID', 'Name', 'Email', 'Phone', 'Course', 'Organization', 
      'Degree', 'Department', 'Year', 'Status', 'Payment Status', 'Created At'
    ].join(',');
    
    const csvRows = inquiries.map(inquiry => [
      inquiry._id,
      inquiry.name,
      inquiry.email,
      inquiry.phone,
      inquiry.courseName,
      inquiry.organization,
      inquiry.degree,
      inquiry.department,
      inquiry.year,
      inquiry.status,
      inquiry.paymentStatus,
      new Date(inquiry.createdAt).toLocaleDateString()
    ].join(','));
    
    const csv = [csvHeaders, ...csvRows].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=inquiries.csv');
    res.status(200).send(csv);
  } catch (error) {
    console.error('Error exporting inquiries:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};