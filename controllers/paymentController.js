import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Razorpay from 'razorpay';
import CourseInquiry from '../models/CourseInquiry.js';

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

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private
export const createOrder = async (req, res) => {
  try {
    // Check if Razorpay is configured
    if (!razorpay) {
      return res.status(500).json({ message: 'Payment service not configured. Please contact administrator.' });
    }

    const { courseId } = req.body;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if user already enrolled in this course
    const user = await User.findById(req.user._id);
    if (user.courses.includes(courseId)) {
      return res.status(400).json({ message: 'You are already enrolled in this course' });
    }
    
    const amount = course.price;
    
    // Create Razorpay order
    const options = {
      amount: amount * 100, // Amount in smallest currency unit (paise)
      currency: 'INR',
      receipt: `receipt_order_${courseId}_${Date.now()}`
    };
    
    // Create order in Razorpay
    const order = await razorpay.orders.create(options);
    
    // Save payment record in database
    const payment = await Payment.create({
      user: req.user._id,
      course: courseId,
      amount,
      razorpayOrderId: order.id,
      status: 'pending'
    });
    
    // Return order details including Razorpay key for the frontend
    res.status(200).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      paymentId: payment._id,
      key_id: process.env.RAZORPAY_KEY_ID,
      isTestMode
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req, res) => {
  try {
    // Check if Razorpay is configured
    if (!razorpay) {
      return res.status(500).json({ message: 'Payment service not configured. Please contact administrator.' });
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentId } = req.body;
    
    // Finding the payment record
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    let isAuthentic = false;
    
    if (isTestMode) {
      // For testing, consider all payments authentic
      isAuthentic = true;
    } else {
      // In production, verify the signature
      const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
      hmac.update(razorpayOrderId + '|' + razorpayPaymentId);
      const generatedSignature = hmac.digest('hex');
      isAuthentic = generatedSignature === razorpaySignature;
    }
    
    if (isAuthentic) {
      // Update payment status
      payment.razorpayPaymentId = razorpayPaymentId;
      payment.razorpaySignature = razorpaySignature;
      payment.status = 'completed';
      await payment.save();
      
      // Add course to user's enrolled courses
      const user = await User.findById(req.user._id);
      
      // Check if course is already in user's courses
      if (!user.courses.includes(payment.course)) {
        user.courses.push(payment.course);
        await user.save();
      }
      
      res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
      // Update payment status to failed
      payment.status = 'failed';
      await payment.save();
      
      res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
export const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('course', 'title image instructor')
      .sort({ createdAt: -1 });
    
    res.status(200).json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Verify Razorpay payment for inquiry
// @route   POST /api/payments/verify-inquiry
// @access  Private
export const verifyInquiryPayment = async (req, res) => {
  try {
    // Check if Razorpay is configured
    if (!razorpay) {
      return res.status(500).json({ message: 'Payment service not configured. Please contact administrator.' });
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, inquiryId } = req.body;
    
    // Finding the inquiry record
    const inquiry = await CourseInquiry.findById(inquiryId);
    
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    
    let isAuthentic = false;
    
    if (isTestMode) {
      // For testing, consider all payments authentic
      isAuthentic = true;
    } else {
      // In production, verify the signature
      const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
      hmac.update(razorpayOrderId + '|' + razorpayPaymentId);
      const generatedSignature = hmac.digest('hex');
      isAuthentic = generatedSignature === razorpaySignature;
    }
    
    if (isAuthentic) {
      // Update inquiry payment status
      inquiry.paymentStatus = 'paid';
      inquiry.razorpayPaymentId = razorpayPaymentId;
      inquiry.razorpayOrderId = razorpayOrderId;
      inquiry.razorpaySignature = razorpaySignature;
      await inquiry.save();
      
      res.status(200).json({ success: true, message: 'Inquiry payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create Razorpay order for inquiry
// @route   POST /api/payments/create-inquiry-order
// @access  Private
export const createInquiryOrder = async (req, res) => {
  try {
    // Check if Razorpay is configured
    if (!razorpay) {
      return res.status(500).json({ message: 'Payment service not configured. Please contact administrator.' });
    }

    const { inquiryId, amount } = req.body;
    
    // Check if inquiry exists
    const inquiry = await CourseInquiry.findById(inquiryId);
    
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    
    // Create Razorpay order
    const options = {
      amount: amount * 100, // Amount in smallest currency unit (paise)
      currency: 'INR',
      receipt: `receipt_inquiry_${inquiryId}_${Date.now()}`
    };
    
    // Create order in Razorpay
    const order = await razorpay.orders.create(options);
    
    // Update inquiry with order details
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
      isTestMode
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}; 