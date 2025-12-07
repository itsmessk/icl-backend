import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect("mongodb+srv://sundarinfoziant:ceahzJvShvxIE3tM@infoziant.byupx6p.mongodb.net/?retryWrites=true&w=majority&appName=infoziant")
  .then(() => console.log('MongoDB connected for seeding data'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Sample courses data
const coursesData = [
  {
    title: 'International Summer Tech Camp for Kids',
    description: 'Live Virtual Program for Kids aged 6-16. Learn coding, robotics, and AI with hands-on projects. Join us for a fun-filled summer of learning and creativity!',
    image: 'https://www.nsec.ac.in/images/aiml-homepage-01.jpg?w=800&auto=format&fit=crop',
    instructor: 'AICL Infoziant Team',
    price: 2999,
    duration: '15 days',
    level: 'Beginner',
    topics: [
      'Game Development',
      'App Development',
      '3D Modeling & Animation',
      'Augmented & Virtual Reality (AR/VR)',
      'Introduction to Artificial Intelligence (AI)',
    ],
    rating: 4.8,
    enrollmentCount: 850,
    featured: true,
  },
];


// Sample admin user
const adminUser = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'admin123',
  role: 'admin'
};

// Seed function
const seedDatabase = async () => {
  try {
    
    
    // Add courses
    const courses = await Course.insertMany(coursesData);
    console.log(`${courses.length} courses added successfully`);
    
    // Check if admin user exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    
    if (!existingAdmin) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminUser.password, salt);
      
      // Create admin user
      const newAdmin = await User.create({
        ...adminUser,
        password: hashedPassword
      });
      
      console.log(`Admin user created: ${newAdmin.email}`);
    } else {
      console.log('Admin user already exists');
    }
    
    console.log('Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase(); 