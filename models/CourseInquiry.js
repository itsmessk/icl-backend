import mongoose from 'mongoose';

const courseInquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId ,
    ref: 'Course',
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  organization: { 
    type: String,
    required: true
  },
  degree: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ['pending', 'contacted', 'enrolled', 'canceled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  razorpayOrderId: {
    type: String
  },
  razorpayPaymentId: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const CourseInquiry = mongoose.model('CourseInquiry', courseInquirySchema);

export default CourseInquiry; 
