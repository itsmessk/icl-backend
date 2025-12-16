import express from 'express';
import {
  createCourseInquiry,
  createInquiryOrder,
  verifyInquiryPayment,
  verifyPaymentSimple,
  getInquiries,
  deleteEnquiry,
  deleteitems,
  getDashboardStats,
  getFilteredInquiries,
  getInquiryById,
  updateInquiryStatus,
  manuallyVerifyPayment,
  updatePaymentStatus,
  exportInquiries,
  getPendingEmails,
  sendBatchEmails,
  sendAllPendingEmails,
  getEmailStats
} from '../controllers/courseInquiryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/course-inquiries:
 *   post:
 *     tags: [Course Inquiries]
 *     summary: Create a course inquiry
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - courseName
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               courseName:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Inquiry created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', createCourseInquiry);

/**
 * @swagger
 * /api/course-inquiries/{id}/create-order:
 *   post:
 *     tags: [Course Inquiries]
 *     summary: Create payment order for inquiry
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Inquiry ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *                 default: INR
 *     responses:
 *       201:
 *         description: Order created successfully
 *       404:
 *         description: Inquiry not found
 */
router.post('/:id/create-order', createInquiryOrder);

/**
 * @swagger
 * /api/course-inquiries/verify-payment:
 *   post:
 *     tags: [Course Inquiries]
 *     summary: Verify inquiry payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - razorpay_order_id
 *               - razorpay_payment_id
 *               - razorpay_signature
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *               razorpay_payment_id:
 *                 type: string
 *               razorpay_signature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *       400:
 *         description: Invalid payment signature
 */
router.post('/verify-payment', verifyInquiryPayment);

/**
 * @swagger
 * /api/course-inquiries/verify-payment-simple:
 *   post:
 *     tags: [Course Inquiries]
 *     summary: Simple payment verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Payment verified
 */
router.post('/verify-payment-simple', verifyPaymentSimple);

/**
 * @swagger
 * /api/course-inquiries:
 *   get:
 *     tags: [Course Inquiries]
 *     summary: Get all inquiries (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all course inquiries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CourseInquiry'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/', protect, getInquiries);

// Dashboard Routes
router.get('/dashboard/stats', protect, getDashboardStats);
router.get('/export', protect, exportInquiries);

// Filtered inquiries with pagination
router.get('/filter', protect, getFilteredInquiries);

// Single inquiry operations
router.get('/:id', protect, getInquiryById);
router.patch('/:id/status', protect, updateInquiryStatus);
router.patch('/:id/payment-status', protect, updatePaymentStatus);
router.patch('/:id/manual-verify', protect, manuallyVerifyPayment);
router.delete('/:id', protect, deleteEnquiry);

// ============================================
// BATCH EMAIL ROUTES (LOCAL/OFFLINE ONLY)
// ============================================
// Get students who need enrollment emails
router.get('/emails/pending', protect, getPendingEmails);

// Get email statistics and tracking
router.get('/emails/stats', protect, getEmailStats);

// Send emails to specific students (batch)
router.post('/emails/send-batch', protect, sendBatchEmails);

// Send emails to ALL eligible students
router.post('/emails/send-all', protect, sendAllPendingEmails);

export default router; 