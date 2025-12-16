# Inquiry Dashboard API Documentation

## Overview
This API provides comprehensive features for managing course inquiries with a powerful dashboard, analytics, filtering, and bulk operations.

---

## Base URL
```
/api/course-inquiries
```

---

## Authentication
Most endpoints require authentication using JWT token:
```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 1. Dashboard Statistics
**GET** `/api/course-inquiries/dashboard/stats`

**Auth Required:** Yes

**Description:** Get comprehensive dashboard statistics including counts, trends, and breakdowns.

**Response:**
```json
{
  "totalInquiries": 150,
  "todayInquiries": 5,
  "weekInquiries": 23,
  "monthInquiries": 67,
  "conversionRate": 45.5,
  "totalRevenue": 125000,
  "followUpCount": 12,
  "statusBreakdown": {
    "pending": 45,
    "contacted": 30,
    "enrolled": 60,
    "canceled": 15
  },
  "paymentBreakdown": {
    "pending": 50,
    "completed": 85,
    "failed": 15
  },
  "priorityBreakdown": {
    "low": 30,
    "medium": 80,
    "high": 35,
    "urgent": 5
  },
  "topCourses": [
    {
      "_id": "Web Development Bootcamp",
      "count": 45
    },
    {
      "_id": "Data Science Fundamentals",
      "count": 38
    }
  ],
  "last7DaysTrend": [
    {
      "date": "2025-12-10",
      "count": 8
    },
    {
      "date": "2025-12-11",
      "count": 12
    }
    // ... 7 days
  ]
}
```

---

### 2. Get Filtered Inquiries (with Pagination)
**GET** `/api/course-inquiries/filter`

**Auth Required:** Yes

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page
- `status` (string) - Filter by status: pending, contacted, enrolled, canceled
- `paymentStatus` (string) - Filter by payment: pending, completed, failed
- `priority` (string) - Filter by priority: low, medium, high, urgent
- `source` (string) - Filter by source: website, referral, social_media, advertisement, other
- `courseName` (string) - Search by course name
- `search` (string) - Search in name, email, phone, organization
- `sortBy` (string, default: createdAt) - Field to sort by
- `sortOrder` (string, default: desc) - Sort order: asc or desc
- `startDate` (string) - Filter from date (YYYY-MM-DD)
- `endDate` (string) - Filter to date (YYYY-MM-DD)
- `assignedTo` (string) - Filter by assigned user ID

**Example Request:**
```
GET /api/course-inquiries/filter?page=1&limit=20&status=pending&priority=high&search=john
```

**Response:**
```json
{
  "inquiries": [
    {
      "_id": "648f8a9e5d4c2b1234567890",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "courseName": "Web Development",
      "organization": "Tech University",
      "degree": "Bachelor",
      "department": "Computer Science",
      "year": "2024",
      "status": "pending",
      "paymentStatus": "pending",
      "priority": "high",
      "source": "website",
      "assignedTo": {
        "_id": "user123",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "tags": ["urgent", "follow-up"],
      "notes": [
        {
          "text": "Interested in early enrollment",
          "addedBy": "Admin",
          "addedAt": "2025-12-16T10:30:00Z"
        }
      ],
      "followUpDate": "2025-12-20T00:00:00Z",
      "createdAt": "2025-12-15T14:22:00Z",
      "updatedAt": "2025-12-16T10:30:00Z"
    }
    // ... more inquiries
  ],
  "currentPage": 1,
  "totalPages": 5,
  "totalInquiries": 87,
  "hasMore": true
}
```

---

### 3. Get Single Inquiry
**GET** `/api/course-inquiries/:id`

**Auth Required:** Yes

**Response:**
```json
{
  "_id": "648f8a9e5d4c2b1234567890",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "courseId": {
    "_id": "course123",
    "title": "Web Development Bootcamp",
    "price": 2500
  },
  "courseName": "Web Development Bootcamp",
  "organization": "Tech University",
  "degree": "Bachelor",
  "department": "Computer Science",
  "year": "2024",
  "status": "pending",
  "paymentStatus": "pending",
  "priority": "high",
  "source": "website",
  "assignedTo": {
    "_id": "user123",
    "name": "Admin User",
    "email": "admin@example.com"
  },
  "tags": ["urgent", "follow-up"],
  "notes": [
    {
      "text": "Initial contact made",
      "addedBy": "Admin",
      "addedAt": "2025-12-16T10:30:00Z",
      "_id": "note123"
    }
  ],
  "followUpDate": "2025-12-20T00:00:00Z",
  "razorpayOrderId": "order_123",
  "razorpayPaymentId": "pay_123",
  "createdAt": "2025-12-15T14:22:00Z",
  "updatedAt": "2025-12-16T10:30:00Z"
}
```

---

### 4. Update Inquiry Status
**PATCH** `/api/course-inquiries/:id/status`

**Auth Required:** Yes

**Request Body:**
```json
{
  "status": "contacted"
}
```

**Valid Status Values:** pending, contacted, enrolled, canceled

**Response:**
```json
{
  "_id": "648f8a9e5d4c2b1234567890",
  "status": "contacted",
  "updatedAt": "2025-12-16T11:00:00Z"
  // ... other fields
}
```

---

### 5. Update Inquiry Priority
**PATCH** `/api/course-inquiries/:id/priority`

**Auth Required:** Yes

**Request Body:**
```json
{
  "priority": "urgent"
}
```

**Valid Priority Values:** low, medium, high, urgent

**Response:**
```json
{
  "_id": "648f8a9e5d4c2b1234567890",
  "priority": "urgent",
  "updatedAt": "2025-12-16T11:00:00Z"
  // ... other fields
}
```

---

### 6. Assign Inquiry to User
**PATCH** `/api/course-inquiries/:id/assign`

**Auth Required:** Yes

**Request Body:**
```json
{
  "userId": "648f8a9e5d4c2b1234567891"
}
```

**Note:** Set `userId` to `null` to unassign

**Response:**
```json
{
  "_id": "648f8a9e5d4c2b1234567890",
  "assignedTo": {
    "_id": "648f8a9e5d4c2b1234567891",
    "name": "Sales Rep",
    "email": "sales@example.com"
  },
  "updatedAt": "2025-12-16T11:00:00Z"
  // ... other fields
}
```

---

### 7. Add Note to Inquiry
**POST** `/api/course-inquiries/:id/notes`

**Auth Required:** Yes

**Request Body:**
```json
{
  "text": "Called customer, very interested in the course",
  "addedBy": "Admin Name"
}
```

**Response:**
```json
{
  "_id": "648f8a9e5d4c2b1234567890",
  "notes": [
    {
      "text": "Called customer, very interested in the course",
      "addedBy": "Admin Name",
      "addedAt": "2025-12-16T11:30:00Z",
      "_id": "note456"
    }
    // ... previous notes
  ],
  "updatedAt": "2025-12-16T11:30:00Z"
  // ... other fields
}
```

---

### 8. Set Follow-Up Date
**PATCH** `/api/course-inquiries/:id/follow-up`

**Auth Required:** Yes

**Request Body:**
```json
{
  "followUpDate": "2025-12-25T10:00:00Z"
}
```

**Note:** Set `followUpDate` to `null` to remove follow-up

**Response:**
```json
{
  "_id": "648f8a9e5d4c2b1234567890",
  "followUpDate": "2025-12-25T10:00:00Z",
  "updatedAt": "2025-12-16T11:30:00Z"
  // ... other fields
}
```

---

### 9. Update Inquiry Tags
**PATCH** `/api/course-inquiries/:id/tags`

**Auth Required:** Yes

**Request Body:**
```json
{
  "tags": ["vip", "early-bird", "corporate"]
}
```

**Response:**
```json
{
  "_id": "648f8a9e5d4c2b1234567890",
  "tags": ["vip", "early-bird", "corporate"],
  "updatedAt": "2025-12-16T11:30:00Z"
  // ... other fields
}
```

---

### 10. Bulk Update Inquiries
**PATCH** `/api/course-inquiries/bulk-update`

**Auth Required:** Yes

**Request Body:**
```json
{
  "inquiryIds": [
    "648f8a9e5d4c2b1234567890",
    "648f8a9e5d4c2b1234567891",
    "648f8a9e5d4c2b1234567892"
  ],
  "updates": {
    "status": "contacted",
    "priority": "high",
    "assignedTo": "user123",
    "tags": ["batch-update"]
  }
}
```

**Allowed Update Fields:** status, priority, assignedTo, tags

**Response:**
```json
{
  "message": "Bulk update successful",
  "modifiedCount": 3
}
```

---

### 11. Get Follow-Ups Due
**GET** `/api/course-inquiries/follow-ups`

**Auth Required:** Yes

**Description:** Get all inquiries that have a follow-up date on or before today and are not yet enrolled or canceled.

**Response:**
```json
[
  {
    "_id": "648f8a9e5d4c2b1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "followUpDate": "2025-12-16T00:00:00Z",
    "status": "contacted",
    "assignedTo": {
      "_id": "user123",
      "name": "Sales Rep",
      "email": "sales@example.com"
    }
    // ... other fields
  }
  // ... more inquiries
]
```

---

### 12. Export Inquiries to CSV
**GET** `/api/course-inquiries/export`

**Auth Required:** Yes

**Query Parameters:**
- `startDate` (string) - Filter from date (YYYY-MM-DD)
- `endDate` (string) - Filter to date (YYYY-MM-DD)
- `status` (string) - Filter by status
- `paymentStatus` (string) - Filter by payment status

**Example Request:**
```
GET /api/course-inquiries/export?startDate=2025-12-01&endDate=2025-12-31&status=enrolled
```

**Response:** CSV file download with headers:
```
ID,Name,Email,Phone,Course,Organization,Degree,Department,Year,Status,Payment Status,Priority,Source,Assigned To,Created At
```

---

### 13. Get Analytics
**GET** `/api/course-inquiries/analytics`

**Auth Required:** Yes

**Query Parameters:**
- `period` (number, default: 30) - Number of days to analyze

**Example Request:**
```
GET /api/course-inquiries/analytics?period=60
```

**Response:**
```json
{
  "period": 60,
  "inquiriesByDate": [
    {
      "_id": "2025-12-01",
      "count": 8
    },
    {
      "_id": "2025-12-02",
      "count": 12
    }
    // ... daily counts
  ],
  "funnelData": [
    {
      "_id": "pending",
      "count": 45
    },
    {
      "_id": "contacted",
      "count": 30
    },
    {
      "_id": "enrolled",
      "count": 60
    },
    {
      "_id": "canceled",
      "count": 15
    }
  ],
  "coursePerformance": [
    {
      "_id": "648f8a9e5d4c2b1234567890",
      "courseName": "Web Development",
      "totalInquiries": 45,
      "enrolled": 20,
      "pending": 15,
      "conversionRate": 44.44
    }
    // ... more courses
  ],
  "sourceStats": [
    {
      "_id": "website",
      "count": 80,
      "enrolled": 35
    },
    {
      "_id": "referral",
      "count": 30,
      "enrolled": 20
    },
    {
      "_id": "social_media",
      "count": 25,
      "enrolled": 10
    }
  ]
}
```

---

### 14. Create Course Inquiry
**POST** `/api/course-inquiries`

**Auth Required:** No (Public endpoint)

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "courseId": "648f8a9e5d4c2b1234567890",
  "organization": "Tech University",
  "degree": "Bachelor",
  "department": "Computer Science",
  "year": "2024"
}
```

**Response:**
```json
{
  "_id": "648f8a9e5d4c2b1234567890",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "organization": "Tech University",
  "degree": "Bachelor",
  "department": "Computer Science",
  "year": "2024",
  "courseId": "648f8a9e5d4c2b1234567890",
  "courseName": "Web Development Bootcamp",
  "message": "Inquiry received successfully"
}
```

---

### 15. Delete Inquiry
**DELETE** `/api/course-inquiries/:id`

**Auth Required:** Yes

**Response:**
```json
{
  "message": "Inquiry deleted successfully"
}
```

---

### 16. Get All Inquiries (Basic)
**GET** `/api/course-inquiries`

**Auth Required:** Yes

**Description:** Get all inquiries sorted by creation date (newest first)

**Response:**
```json
[
  {
    "_id": "648f8a9e5d4c2b1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "courseName": "Web Development",
    "status": "pending",
    "createdAt": "2025-12-16T14:22:00Z"
    // ... all fields
  }
  // ... more inquiries
]
```

---

## Data Models

### CourseInquiry Schema
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, validated),
  phone: String (required),
  courseId: ObjectId (ref: Course, required),
  courseName: String (required),
  organization: String (required),
  degree: String (required),
  department: String (required),
  year: String (required),
  status: String (enum: ['pending', 'contacted', 'enrolled', 'canceled'], default: 'pending'),
  paymentStatus: String (enum: ['pending', 'completed', 'failed'], default: 'pending'),
  razorpayOrderId: String,
  razorpayPaymentId: String,
  priority: String (enum: ['low', 'medium', 'high', 'urgent'], default: 'medium'),
  notes: [{
    text: String,
    addedBy: String,
    addedAt: Date,
    _id: ObjectId
  }],
  followUpDate: Date,
  source: String (enum: ['website', 'referral', 'social_media', 'advertisement', 'other'], default: 'website'),
  assignedTo: ObjectId (ref: User),
  tags: [String],
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

---

## Payment Endpoints (Existing)

### Create Payment Order
**POST** `/api/course-inquiries/:id/create-order`

### Verify Payment
**POST** `/api/course-inquiries/verify-payment`

### Simple Payment Verification
**POST** `/api/course-inquiries/verify-payment-simple`

---

## Frontend Implementation Tips

### 1. Dashboard Page
Use the `/dashboard/stats` endpoint to display:
- Key metrics cards (total, today, week, month)
- Conversion rate gauge
- Revenue counter
- Status pie chart
- Priority distribution
- 7-day trend line chart
- Top courses table
- Follow-ups alert badge

### 2. Inquiries List Page
Use `/filter` endpoint with:
- Pagination controls
- Search bar
- Filter dropdowns (status, priority, payment status, source)
- Date range picker
- Sort options
- Bulk select checkboxes
- Action buttons (assign, change status, delete)

### 3. Inquiry Detail Page
Use `/:id` endpoint to show:
- Full inquiry information
- Status timeline
- Notes section with add note form
- Priority selector
- Assignment dropdown
- Follow-up date picker
- Tags input
- Action buttons

### 4. Analytics Page
Use `/analytics` endpoint to display:
- Time period selector
- Inquiries over time chart
- Conversion funnel visualization
- Course performance table
- Source effectiveness chart

### 5. Follow-Ups Page
Use `/follow-ups` endpoint to show:
- List of inquiries due for follow-up
- Quick action buttons
- Sort by follow-up date

---

## Example Frontend API Calls

### Fetch Dashboard Stats
```javascript
const fetchDashboardStats = async () => {
  const response = await fetch('/api/course-inquiries/dashboard/stats', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data;
};
```

### Filter Inquiries
```javascript
const fetchInquiries = async (filters) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/course-inquiries/filter?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data;
};

// Usage
const inquiries = await fetchInquiries({
  page: 1,
  limit: 20,
  status: 'pending',
  search: 'john',
  sortBy: 'createdAt',
  sortOrder: 'desc'
});
```

### Update Status
```javascript
const updateStatus = async (inquiryId, status) => {
  const response = await fetch(`/api/course-inquiries/${inquiryId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
  return await response.json();
};
```

### Bulk Update
```javascript
const bulkUpdate = async (inquiryIds, updates) => {
  const response = await fetch('/api/course-inquiries/bulk-update', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ inquiryIds, updates })
  });
  return await response.json();
};
```

### Export CSV
```javascript
const exportInquiries = async (filters) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/course-inquiries/export?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const blob = await response.blob();
  
  // Create download link
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'inquiries.csv';
  a.click();
};
```

---

## Feature Summary

✅ **Dashboard Features:**
- Real-time statistics
- Status breakdown
- Payment breakdown
- Priority breakdown
- Top courses
- 7-day trend
- Conversion rate
- Total revenue

✅ **Inquiry Management:**
- Advanced filtering
- Pagination
- Search functionality
- Sort options
- Status updates
- Priority management
- Assignment to users
- Notes/comments
- Follow-up dates
- Tags
- Bulk operations

✅ **Analytics:**
- Time-based trends
- Conversion funnel
- Course performance
- Source effectiveness
- Custom date ranges

✅ **Export:**
- CSV export with filters
- Custom date range export

✅ **Follow-Ups:**
- Due follow-ups list
- Automated alerts

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

---

## Notes

1. All authenticated endpoints require JWT token in Authorization header
2. Dates should be in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)
3. All timestamps are in UTC
4. The `protect` middleware checks authentication
5. Consider implementing role-based access control for different admin levels
6. Implement real-time updates using WebSockets for dashboard
7. Add email notifications for follow-ups
8. Consider implementing inquiry activity logs
