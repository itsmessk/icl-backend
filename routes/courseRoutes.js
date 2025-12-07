import express from 'express';
import {
  getCourses,
  getCourseById,
  getEnrolledCourses,
  checkEnrollment,
  addSampleCourses
} from '../controllers/courseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/courses:
 *   get:
 *     tags: [Courses]
 *     summary: Get all courses
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *         description: Filter by level
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and description
 *     responses:
 *       200:
 *         description: List of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 */
router.get('/', getCourses);

/**
 * @swagger
 * /api/courses/sample:
 *   post:
 *     tags: [Courses]
 *     summary: Add sample courses (Development only)
 *     responses:
 *       201:
 *         description: Sample courses added
 */
router.post('/sample', addSampleCourses);

/**
 * @swagger
 * /api/courses/user/enrolled:
 *   get:
 *     tags: [Courses]
 *     summary: Get user's enrolled courses
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of enrolled courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       401:
 *         description: Unauthorized
 */
router.get('/user/enrolled', protect, getEnrolledCourses);

/**
 * @swagger
 * /api/courses/{id}/enrolled:
 *   get:
 *     tags: [Courses]
 *     summary: Check if user is enrolled in a course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Enrollment status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 enrolled:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 */
router.get('/:id/enrolled', protect, checkEnrollment);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     tags: [Courses]
 *     summary: Get course by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 */
router.get('/:id', getCourseById);

export default router; 