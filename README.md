# VTA Platform Server

This is the backend server for the VTA (Virtual Teaching Academy) platform, a learning management system for online courses.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation Steps

1. Clone the repository:
```
git clone <repository-url>
cd vta/server
```

2. Install dependencies:
```
npm install
```

3. Set up environment variables:
- Create a `.env` file in the root directory
- Copy the contents from `.env.example` (if available) or add the following variables:

```
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/vta

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_change_in_production

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=your_email@gmail.com
EMAIL_FROM_NAME=VTA Platform
REQUIRE_EMAIL_VERIFICATION=false

# Client URL (for email verification links)
CLIENT_URL=http://localhost:3000

# Razorpay Payment Gateway
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. Seed the database with sample courses and admin user:
```
npm run seed
```

## Running the Server

### Development Mode
```
npm run dev
```

### Production Mode
```
npm start
```

## API Endpoints

### User Routes
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login a user
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)
- `PUT /api/users/change-password` - Change password (protected)
- `GET /api/users/verify-email/:token` - Verify email
- `POST /api/users/resend-verification` - Resend verification email
- `POST /api/users/forgot-password` - Send password reset email
- `GET /api/users/reset-password/:token/verify` - Verify reset token
- `POST /api/users/reset-password/:token` - Reset password

### Course Routes
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `GET /api/courses/user/enrolled` - Get user's enrolled courses (protected)
- `GET /api/courses/:id/enrolled` - Check if user is enrolled in a course (protected)

### Payment Routes
- `POST /api/payments/create-order` - Create a payment order (protected)
- `POST /api/payments/verify` - Verify a payment (protected)
- `GET /api/payments/history` - Get payment history (protected) 