import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';

dotenv.config();

const infoziantCourses = [
  {
    title: 'Cybersecurity Essentials - IgnitePro Plus',
    subtitle: 'Where Aspirations Meet Action',
    description: '45-Day Virtual Tech Immersion Program focused on Cybersecurity. Develop your security toolkit with hands-on training in VAPT, Network Security, SOC Operations, and Digital Forensics. Includes real-time project and CTF challenges. Get 12 months of placement support with access to 1600+ active HR connects.',
    price: 2950,
    duration: '45 Days (1.5 Hours/Day)',
    level: 'Advanced',
    image: 'https://www.itpt.co.uk/wp-content/uploads/2023/09/Cyber-Security-Essential.jpg',
    instructor: 'Infoziant Security Experts',
    topics: [
      'Advanced Networking (Routing, Switching, VLAN, VPN)',
      'Linux Advanced + System Hardening',
      'VAPT Fundamentals (Recon, Scanning, Enumeration)',
      'Vulnerability Scanning (Nessus, Nuclei)',
      'Web App Security - OWASP Top 10',
      'Exploitation (Burp Suite, SQLMap, DirSearch)',
      'Network Attacks (MITM, DNS Spoofing, ARP Poisoning)',
      'Cryptography & Steganography',
      'Malware Analysis (Static + Dynamic)',
      'Mobile App VAPT (Android)',
      'SOC Operations (SIEM, Log Analysis, MITRE ATT&CK)',
      'Digital Forensics Basics',
      'CTF Challenges + HackQuest Preparation',
      'Real-Time Cybersecurity Project'
    ],
    benefits: [
      '45 Days intensive training with 3 Credits',
      'Real-Time Project Included for hands-on experience',
      '12 Months Placement Support with 1600+ active HR connects',
      'Weekly assessments via Infoziant Assessment Portal',
      'Access to curated learning materials and practice modules',
      'Live doubt-clearing sessions (1.5 hours/day)',
      'Career opportunities: Cybersecurity Analyst, SOC Defender, VAPT Specialist',
      'Placement in companies offering CTCs up to ₹80 LPA',
      'Average CTC of ₹7 LPA across placements',
      'Access to 320+ companies above ₹20 LPA range',
      'Industry-recognized certificate upon completion',
      'Ability to secure and analyze complex networks',
      'Conduct penetration testing using industry-standard tools',
      'Detect threats, analyze logs, respond to incidents effectively'
    ],
    curriculum: [
      {
        title: 'Foundation & Infrastructure Security',
        lessons: [
          { title: 'Advanced Networking - Routing & Switching', duration: '3 hours' },
          { title: 'VLAN and VPN Implementation', duration: '2 hours' },
          { title: 'Linux System Hardening', duration: '4 hours' },
          { title: 'Bash Automation Scripts', duration: '2 hours' }
        ]
      },
      {
        title: 'Offensive Security & VAPT',
        lessons: [
          { title: 'Reconnaissance and Information Gathering', duration: '3 hours' },
          { title: 'Scanning with Nmap and Netcat', duration: '2 hours' },
          { title: 'Enumeration Techniques', duration: '2 hours' },
          { title: 'Vulnerability Assessment with Nessus', duration: '3 hours' }
        ]
      },
      {
        title: 'Web Application Security',
        lessons: [
          { title: 'OWASP Top 10 Vulnerabilities', duration: '4 hours' },
          { title: 'Burp Suite Fundamentals', duration: '3 hours' },
          { title: 'SQL Injection with SQLMap', duration: '2 hours' },
          { title: 'Directory Enumeration with DirSearch', duration: '2 hours' }
        ]
      },
      {
        title: 'Advanced Exploitation & Analysis',
        lessons: [
          { title: 'Network Attack Vectors - MITM & DNS Spoofing', duration: '3 hours' },
          { title: 'Cryptography & Hash Cracking', duration: '3 hours' },
          { title: 'Static & Dynamic Malware Analysis', duration: '4 hours' },
          { title: 'Mobile Application VAPT (Android)', duration: '3 hours' }
        ]
      },
      {
        title: 'Defensive Security & Operations',
        lessons: [
          { title: 'SOC Operations & SIEM', duration: '4 hours' },
          { title: 'Log Analysis & Threat Detection', duration: '3 hours' },
          { title: 'MITRE ATT&CK Framework', duration: '2 hours' },
          { title: 'Digital Forensics Investigation', duration: '3 hours' }
        ]
      },
      {
        title: 'Practical Application & Assessment',
        lessons: [
          { title: 'CTF Challenges & HackQuest', duration: '5 hours' },
          { title: 'Real-Time Cybersecurity Project', duration: '10 hours' },
          { title: 'Assessment Report & Remediation Plan', duration: '3 hours' }
        ]
      }
    ],
    rating: 4.8,
    enrollmentCount: 2643,
    featured: true
  },
  {
    title: 'Applied AI Mastery - IgnitePro Plus',
    subtitle: 'From Models to Production',
    description: '45-Day Virtual Tech Immersion Program in Artificial Intelligence. Master GenAI, LLMs, and production-ready AI applications. From transformer architecture to deployment on cloud platforms. Build real-world RAG systems and multi-agent AI workflows with 12 months placement support.',
    price: 2950,
    duration: '45 Days (1.5 Hours/Day)',
    level: 'Advanced',
    image: 'https://static.wixstatic.com/media/10b020_c97dcecb33534f4fb3bd88ae124e9165~mv2.jpg/v1/fill/w_936,h_624,al_c,q_85/10b020_c97dcecb33534f4fb3bd88ae124e9165~mv2.jpg',
    instructor: 'Infoziant AI Specialists',
    topics: [
      'Transformer & LLM Architecture',
      'LangChain Advanced (Agents, Tools, Retrievers)',
      'Prompt Engineering (Zero-shot, Few-shot, CoT)',
      'Vector Databases (FAISS, Pinecone, Weaviate)',
      'API Integration & External Data Sources',
      'Multi-Agent AI Systems',
      'Deployment (FastAPI/Flask + AWS/GCP/Azure)',
      'GenAI Application Optimization',
      'AI Ethics, Safety & Data Security',
      'Real-Time AI Project'
    ],
    benefits: [
      '45 Days intensive training with 3 Credits',
      'Real-Time AI Project with deployment experience',
      '12 Months Placement Support with leading AI companies',
      'Weekly assessments and progress tracking',
      'Cloud deployment on AWS/GCP/Azure platforms',
      'Industry-standard tools: LangChain, FAISS, Pinecone',
      'Career roles: GenAI Engineer, LLM Engineer, AI/ML Engineer',
      'Access to companies building the future of AI',
      'Average CTC of ₹7 LPA, with packages up to ₹80 LPA',
      'Learn to build production-ready AI applications',
      'Master RAG systems with structured embeddings',
      'Build safe, compliant, and ethical AI systems',
      'Create deployable GenAI apps (chatbots, agents)',
      'Certificate upon successful completion'
    ],
    curriculum: [
      {
        title: 'AI Foundations & Architecture',
        lessons: [
          { title: 'Transformer Architecture Deep Dive', duration: '4 hours' },
          { title: 'Understanding LLM Internals - Attention & Tokens', duration: '3 hours' },
          { title: 'Model Training vs Fine-tuning', duration: '2 hours' }
        ]
      },
      {
        title: 'LangChain & AI Engineering',
        lessons: [
          { title: 'LangChain Basics - Chains & Prompts', duration: '3 hours' },
          { title: 'Advanced Agents & Tools', duration: '4 hours' },
          { title: 'Retrievers & Document Processing', duration: '3 hours' },
          { title: 'Building Multi-step AI Pipelines', duration: '3 hours' }
        ]
      },
      {
        title: 'Prompt Engineering Mastery',
        lessons: [
          { title: 'Zero-shot & Few-shot Learning', duration: '2 hours' },
          { title: 'Chain of Thought (CoT) Prompting', duration: '2 hours' },
          { title: 'Prompt Optimization Techniques', duration: '2 hours' }
        ]
      },
      {
        title: 'Vector Databases & RAG Systems',
        lessons: [
          { title: 'Vector Embeddings Fundamentals', duration: '3 hours' },
          { title: 'FAISS Implementation', duration: '2 hours' },
          { title: 'Pinecone & Weaviate Setup', duration: '2 hours' },
          { title: 'Building Production RAG Systems', duration: '4 hours' }
        ]
      },
      {
        title: 'Integration & Deployment',
        lessons: [
          { title: 'API Integration with External Data Sources', duration: '3 hours' },
          { title: 'Multi-Agent AI System Design', duration: '4 hours' },
          { title: 'FastAPI/Flask Backend Development', duration: '3 hours' },
          { title: 'Cloud Deployment - AWS/GCP/Azure', duration: '4 hours' }
        ]
      },
      {
        title: 'Optimization & Production Best Practices',
        lessons: [
          { title: 'Performance Optimization & Caching', duration: '3 hours' },
          { title: 'Latency Reduction Techniques', duration: '2 hours' },
          { title: 'AI Ethics, Safety & Data Security', duration: '3 hours' },
          { title: 'Real-Time AI Project - Build & Deploy', duration: '10 hours' }
        ]
      }
    ],
    rating: 4.9,
    enrollmentCount: 3421,
    featured: true
  },
  {
    title: 'Full Stack Engineering - IgnitePro Plus (MERN)',
    subtitle: 'Build It. Deploy It. Scale It.',
    description: '45-Day Virtual Tech Immersion Program for Full Stack Development. Master MERN stack with production deployment, Docker, CI/CD, and real-world project experience. Build scalable applications with modern DevOps practices and get 12 months placement support.',
    price: 2950,
    duration: '45 Days (1.5 Hours/Day)',
    level: 'Advanced',
    image: 'https://miro.medium.com/0*XH3rLskyOsCqVV-j.jpg',
    instructor: 'Infoziant Full Stack Developers',
    topics: [
      'Advanced React (Hooks, Routing, Context API)',
      'State Management (Redux/Context)',
      'Node.js + Express (JWT Auth, Middleware, API Security)',
      'MongoDB (Schemas, Relations, Aggregation Pipelines)',
      'Git Workflow (Branching, PRs, GitHub Projects)',
      'Deployment (Vercel, Netlify, Render)',
      'Docker Basics & CI/CD (GitHub Actions)',
      'API Testing & Postman Workflows',
      'Full-Stack Live Project'
    ],
    benefits: [
      '45 Days intensive MERN stack training with 3 Credits',
      'Full-Stack Live Project with production deployment',
      '12 Months Placement Support with top product companies',
      'Weekly assessments and coding challenges',
      'Production deployment on Vercel, Netlify, Render',
      'DevOps automation with Docker and CI/CD',
      'Career roles: Full Stack Developer, React/Node.js Developer',
      'Companies that love builders - Average CTC ₹7 LPA',
      'Packages ranging up to ₹80 LPA in top companies',
      'Build interactive single-page applications',
      'Master secure backend API development with JWT',
      'Design production-grade MongoDB databases',
      'Automate builds, testing, and deployments',
      'Certificate upon successful completion'
    ],
    curriculum: [
      {
        title: 'Frontend Mastery - React Advanced',
        lessons: [
          { title: 'React Hooks - useState, useEffect, useContext', duration: '3 hours' },
          { title: 'React Router - Dynamic Routing', duration: '2 hours' },
          { title: 'Context API & Props Management', duration: '2 hours' },
          { title: 'Custom Hooks & Performance Optimization', duration: '3 hours' }
        ]
      },
      {
        title: 'State Management at Scale',
        lessons: [
          { title: 'Redux Fundamentals - Store, Actions, Reducers', duration: '3 hours' },
          { title: 'Redux Toolkit Modern Approach', duration: '2 hours' },
          { title: 'Context API for Smaller Apps', duration: '2 hours' },
          { title: 'Managing Complex State Flows', duration: '3 hours' }
        ]
      },
      {
        title: 'Backend Engineering - Node.js & Express',
        lessons: [
          { title: 'Express.js Fundamentals & Routing', duration: '3 hours' },
          { title: 'Middleware Architecture & Custom Middleware', duration: '2 hours' },
          { title: 'JWT Authentication & Authorization', duration: '3 hours' },
          { title: 'API Security Best Practices', duration: '2 hours' }
        ]
      },
      {
        title: 'Database Design - MongoDB',
        lessons: [
          { title: 'MongoDB Schema Design Patterns', duration: '3 hours' },
          { title: 'Relationships & References', duration: '2 hours' },
          { title: 'Aggregation Pipelines', duration: '3 hours' },
          { title: 'Database Indexing & Optimization', duration: '2 hours' }
        ]
      },
      {
        title: 'DevOps & Deployment',
        lessons: [
          { title: 'Git Workflow - Branching & Pull Requests', duration: '2 hours' },
          { title: 'GitHub Projects & Team Collaboration', duration: '2 hours' },
          { title: 'Docker Basics & Containerization', duration: '3 hours' },
          { title: 'CI/CD with GitHub Actions', duration: '3 hours' },
          { title: 'Production Deployment - Vercel/Netlify/Render', duration: '3 hours' }
        ]
      },
      {
        title: 'Testing & Live Project',
        lessons: [
          { title: 'API Testing with Postman', duration: '2 hours' },
          { title: 'Automated Testing Workflows', duration: '2 hours' },
          { title: 'Full-Stack Live Project - Planning & Architecture', duration: '3 hours' },
          { title: 'Full-Stack Live Project - Development', duration: '10 hours' },
          { title: 'Full-Stack Live Project - Deployment & Presentation', duration: '3 hours' }
        ]
      }
    ],
    rating: 4.7,
    enrollmentCount: 2643,
    featured: true
  },
  {
    title: 'Data Structures & Algorithms Essentials',
    subtitle: 'Code Confidently with Strong Foundations',
    description: '45-Day program for II Year students to build strong foundations in DSA. Master problem-solving with coding practice, algorithm fundamentals, and modern tech awareness including Git, APIs, and AI basics. Perfect foundation for advanced specializations.',
    price: 2950,
    duration: '45 Days (1.5 Hours/Day)',
    level: 'Intermediate',
    image: 'https://towardsdatascience.com/wp-content/uploads/2020/08/1-EFdnPuVrwUOmYte11v0OA.png',
    instructor: 'Infoziant Programming Experts',
    topics: [
      'Algorithm Basics & Complexity (Big-O)',
      'Arrays & Strings',
      'Searching & Sorting',
      'Recursion & Backtracking Basics',
      'Linked Lists',
      'Stacks & Queues',
      'Hashing Basics',
      'Trees & Graphs (Intro)',
      'Problem-Solving Practice',
      'Git & GitHub Essentials',
      'VS Code Developer Setup',
      'API Fundamentals (GET/POST)',
      'Python/JavaScript Scripting',
      'Gen AI Basics & Prompting',
      'Tech Awareness: AI, Cyber, Cloud'
    ],
    benefits: [
      '45 Days comprehensive DSA training for II Year students',
      'Weekly assessments via Infoziant Assessment Portal',
      'Build and maintain GitHub coding portfolio',
      'Modern developer tools: VS Code, Git, GitHub',
      'Tech awareness: AI, Cybersecurity, Cloud Computing',
      'Foundation for competitive programming',
      'Prepare for technical interviews at top companies',
      'Understand Big-O complexity and optimization',
      'Master essential data structures and algorithms',
      'Hands-on with APIs and client-server communication',
      'Introduction to Gen AI and LLM prompting',
      'Career clarity for future specialization paths',
      'Certificate upon completion',
      'Foundation for advanced IgnitePro programs'
    ],
    curriculum: [
      {
        title: 'Algorithmic Foundations',
        lessons: [
          { title: 'Algorithm Basics & Problem Solving', duration: '2 hours' },
          { title: 'Time & Space Complexity Analysis', duration: '3 hours' },
          { title: 'Big-O Notation Mastery', duration: '2 hours' }
        ]
      },
      {
        title: 'Core Data Structures - Part 1',
        lessons: [
          { title: 'Arrays & String Manipulation', duration: '3 hours' },
          { title: 'Two Pointer & Sliding Window Techniques', duration: '3 hours' },
          { title: 'Searching Algorithms - Linear & Binary', duration: '2 hours' },
          { title: 'Sorting Algorithms - Bubble, Selection, Insertion', duration: '3 hours' },
          { title: 'Advanced Sorting - Merge Sort, Quick Sort', duration: '3 hours' }
        ]
      },
      {
        title: 'Core Data Structures - Part 2',
        lessons: [
          { title: 'Recursion Fundamentals', duration: '3 hours' },
          { title: 'Backtracking Basics', duration: '2 hours' },
          { title: 'Linked Lists - Singly & Doubly', duration: '3 hours' },
          { title: 'Stacks - Implementation & Applications', duration: '2 hours' },
          { title: 'Queues - Implementation & Applications', duration: '2 hours' }
        ]
      },
      {
        title: 'Advanced Structures',
        lessons: [
          { title: 'Hashing & Hash Maps', duration: '3 hours' },
          { title: 'Trees - Binary Trees Basics', duration: '3 hours' },
          { title: 'Graphs - Introduction & Representation', duration: '2 hours' }
        ]
      },
      {
        title: 'Developer Tools & Modern Tech',
        lessons: [
          { title: 'Git & GitHub Essentials', duration: '3 hours' },
          { title: 'VS Code Setup & Productivity', duration: '2 hours' },
          { title: 'API Fundamentals - GET/POST Requests', duration: '2 hours' },
          { title: 'Python/JavaScript Scripting Basics', duration: '3 hours' },
          { title: 'Gen AI Basics & LLM Prompting', duration: '2 hours' }
        ]
      },
      {
        title: 'Practice & Tech Awareness',
        lessons: [
          { title: 'Problem-Solving Practice Sessions', duration: '8 hours' },
          { title: 'Tech Awareness - AI, Cybersecurity, Cloud', duration: '3 hours' },
          { title: 'Career Planning & Specialization Paths', duration: '2 hours' }
        ]
      }
    ],
    rating: 4.8,
    enrollmentCount: 1759,
    featured: false
  }
];

const seedInfoziantCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected...');

    // Delete existing Infoziant courses
    await Course.deleteMany({ 
      instructor: { $regex: /Infoziant/i } 
    });
    console.log('Existing Infoziant courses removed');

    // Create new courses
    const courses = await Course.insertMany(infoziantCourses);
    console.log(`${courses.length} Infoziant IgnitePro courses created successfully!`);
    
    courses.forEach(course => {
      console.log(`✓ ${course.title} - ₹${course.price}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding Infoziant courses:', error);
    process.exit(1);
  }
};

seedInfoziantCourses();
