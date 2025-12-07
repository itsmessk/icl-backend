import express from 'express';
import {
  createOrder,
  verifyPayment,
  getPaymentHistory
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/payments/create-order:
 *   post:
 *     tags: [Payments]
 *     summary: Create a payment order
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *               - amount
 *             properties:
 *               courseId:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *                 default: INR
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderId:
 *                   type: string
 *                 amount:
 *                   type: number
 *                 currency:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
router.post('/create-order', protect, createOrder);

/**
 * @swagger
 * /api/payments/verify:
 *   post:
 *     tags: [Payments]
 *     summary: Verify payment
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Unauthorized
 */
router.post('/verify', protect, verifyPayment);

/**
 * @swagger
 * /api/payments/history:
 *   get:
 *     tags: [Payments]
 *     summary: Get payment history
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user payments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Payment'
 *       401:
 *         description: Unauthorized
 */
router.get('/history', protect, getPaymentHistory);

export default router; 