import Course from '../models/Course.js';
import User from '../models/User.js';

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res) => {
  try {
    console.log('GET /api/courses - Fetching all courses...');
    const courses = await Course.find({});
    console.log(`Found ${courses.length} courses`);
    res.json(courses);
  } catch (error) {
    console.error('Error in getCourses:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Public
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user enrolled courses
// @route   GET /api/courses/enrolled
// @access  Private
export const getEnrolledCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('courses');
    
    if (user) {
      res.json(user.courses);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Check if user is enrolled in a course
// @route   GET /api/courses/:id/enrolled
// @access  Private
export const checkEnrollment = async (req, res) => {
  try {
    const courseId = req.params.id;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isEnrolled = user.courses.includes(courseId);
    res.json({ isEnrolled });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add sample courses (for development)
// @route   POST /api/courses/sample
// @access  Public
export const addSampleCourses = async (req, res) => {
  try {
    const sampleCourses = [
      {
        title: 'Complete Web Development Bootcamp',
        description: 'Learn HTML, CSS, JavaScript, React, Node.js and more to become a full-stack web developer. This comprehensive course covers both frontend and backend technologies.',
        price: 999,
        image: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        instructor: 'John Smith',
        duration: '48 hours',
        level: 'Beginner',
        topics: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Express', 'MongoDB'],
        curriculum: [
          {
            title: 'HTML Fundamentals',
            lessons: [
              { title: 'Introduction to HTML', duration: '15 min', videoUrl: 'https://example.com/video1' },
              { title: 'HTML Elements', duration: '25 min', videoUrl: 'https://example.com/video2' }
            ]
          },
          {
            title: 'CSS Styling',
            lessons: [
              { title: 'CSS Basics', duration: '20 min', videoUrl: 'https://example.com/video3' },
              { title: 'Flexbox and Grid', duration: '30 min', videoUrl: 'https://example.com/video4' }
            ]
          }
        ]
      },
      {
        title: 'Data Science Fundamentals',
        description: 'Master the skills needed to analyze data and gain meaningful insights. Learn Python, statistics, data visualization, and machine learning techniques.',
        price: 1499,
        image: 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        instructor: 'Emily Johnson',
        duration: '56 hours',
        level: 'Intermediate',
        topics: ['Python', 'Statistics', 'Data Analysis', 'Machine Learning', 'Data Visualization'],
        curriculum: [
          {
            title: 'Python for Data Science',
            lessons: [
              { title: 'Python Basics', duration: '30 min', videoUrl: 'https://example.com/video5' },
              { title: 'Numpy and Pandas', duration: '45 min', videoUrl: 'https://example.com/video6' }
            ]
          },
          {
            title: 'Statistical Analysis',
            lessons: [
              { title: 'Descriptive Statistics', duration: '25 min', videoUrl: 'https://example.com/video7' },
              { title: 'Hypothesis Testing', duration: '35 min', videoUrl: 'https://example.com/video8' }
            ]
          }
        ]
      }
    ];
    
    const courses = await Course.insertMany(sampleCourses);
    res.status(201).json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}; 