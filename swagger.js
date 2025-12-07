import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VTA Platform API',
      version: '1.0.0',
      description: 'API documentation for VTA Platform Backend Server',
      contact: {
        name: 'API Support',
        email: 'support@vta.com'
      }
    },
    tags: [
      {
        name: 'Users',
        description: 'User authentication and profile management'
      },
      {
        name: 'Courses',
        description: 'Course management and enrollment'
      },
      {
        name: 'Payments',
        description: 'Payment processing and history'
      },
      {
        name: 'Course Inquiries',
        description: 'Course inquiry management'
      }
    ],
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://aicl.infoziant.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin'] },
            phone: { type: 'string' },
            profilePicture: { type: 'string' },
            isVerified: { type: 'boolean' },
            courses: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Course: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            duration: { type: 'string' },
            level: { type: 'string' },
            category: { type: 'string' },
            image: { type: 'string' },
            instructor: { type: 'string' },
            syllabus: { type: 'array', items: { type: 'string' } },
            prerequisites: { type: 'array', items: { type: 'string' } },
            enrolledStudents: { type: 'number' },
            rating: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Payment: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { type: 'string' },
            course: { type: 'string' },
            amount: { type: 'number' },
            currency: { type: 'string' },
            razorpayOrderId: { type: 'string' },
            razorpayPaymentId: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'completed', 'failed'] },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        CourseInquiry: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            courseName: { type: 'string' },
            message: { type: 'string' },
            status: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            error: { type: 'string' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
