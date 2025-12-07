import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Course description is required']
  },
  price: {
    type: Number,
    required: [true, 'Course price is required'],
    min: [0, 'Price cannot be negative']
  },
  image: {
    type: String,
    required: [true, 'Course image is required']
  },
  instructor: {
    type: String,
    required: [true, 'Instructor name is required']
  },
  duration: {
    type: String,
    required: [true, 'Course duration is required']
  },
  level: {
    type: String,
    required: [true, 'Course level is required'],
    // enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  topics: [{
    type: String
  }],
  benefits: [{
    type: String
  }],
  curriculum: [{
    title: String,
    lessons: [{
      title: String,
      duration: String,
      videoUrl: String
    }]
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  enrollmentCount: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Course = mongoose.model('Course', courseSchema);

export default Course; 