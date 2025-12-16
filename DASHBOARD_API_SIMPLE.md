# Inquiry Dashboard API - Simple Version

## Overview
This dashboard uses only the existing data fields in your database. No model changes required.

## 🔧 Manual Payment Verification
If automatic payment verification fails, admins can manually verify payments using the **Manual Verify** endpoint. This will:
- ✅ Mark payment as completed
- ✅ Enroll the student
- ✅ Send enrollment confirmation email automatically

---

## Base URL
```
/api/course-inquiries
```

---

## Dashboard Endpoints

### 1. Get Dashboard Statistics ⭐
**GET** `/api/course-inquiries/dashboard/stats`

**Auth Required:** Yes

**Description:** Get comprehensive statistics from your existing inquiry data.

**Response:**
```json
{
  "totalInquiries": 150,
  "todayInquiries": 5,
  "weekInquiries": 23,
  "monthInquiries": 67,
  "conversionRate": 45.5,
  "paymentCompletionRate": 56.7,
  "totalRevenue": 125000,
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
  "topCourses": [
    {
      "_id": "Web Development Bootcamp",
      "count": 45,
      "enrolled": 20
    },
    {
      "_id": "Data Science Fundamentals",
      "count": 38,
      "enrolled": 18
    }
  ],
  "topOrganizations": [
    {
      "_id": "Tech University",
      "count": 30
    },
    {
      "_id": "Business College",
      "count": 25
    }
  ],
  "topDepartments": [
    {
      "_id": "Computer Science",
      "count": 40
    },
    {
      "_id": "Engineering",
      "count": 35
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
    },
    {
      "date": "2025-12-12",
      "count": 15
    },
    {
      "date": "2025-12-13",
      "count": 10
    },
    {
      "date": "2025-12-14",
      "count": 14
    },
    {
      "date": "2025-12-15",
      "count": 11
    },
    {
      "date": "2025-12-16",
      "count": 9
    }
  ]
}
```

**Dashboard Metrics Explained:**
- **totalInquiries**: Total count of all inquiries in database
- **todayInquiries**: Inquiries created today
- **weekInquiries**: Inquiries created this week
- **monthInquiries**: Inquiries created this month
- **conversionRate**: Percentage of inquiries that became enrolled (enrolled / total × 100)
- **paymentCompletionRate**: Percentage of inquiries with completed payment (completed / total × 100)
- **totalRevenue**: Sum of course prices for all completed payments
- **statusBreakdown**: Count by inquiry status (pending, contacted, enrolled, canceled)
- **paymentBreakdown**: Count by payment status (pending, completed, failed)
- **topCourses**: Top 5 courses by inquiry count with enrollment numbers
- **topOrganizations**: Top 5 organizations submitting inquiries
- **topDepartments**: Top 5 departments submitting inquiries
- **last7DaysTrend**: Daily inquiry count for the past 7 days

---

### 2. Get Filtered Inquiries with Pagination
**GET** `/api/course-inquiries/filter`

**Auth Required:** Yes

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page
- `status` (string) - Filter by: pending, contacted, enrolled, canceled
- `paymentStatus` (string) - Filter by: pending, completed, failed
- `courseName` (string) - Search in course name
- `search` (string) - Search in name, email, phone, organization
- `sortBy` (string, default: createdAt) - Field to sort by
- `sortOrder` (string, default: desc) - asc or desc
- `startDate` (string) - Filter from date (YYYY-MM-DD)
- `endDate` (string) - Filter to date (YYYY-MM-DD)

**Example Requests:**
```
GET /api/course-inquiries/filter?page=1&limit=20
GET /api/course-inquiries/filter?status=pending&paymentStatus=pending
GET /api/course-inquiries/filter?search=john&sortBy=createdAt&sortOrder=desc
GET /api/course-inquiries/filter?startDate=2025-12-01&endDate=2025-12-31
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
      "courseName": "Web Development Bootcamp",
      "organization": "Tech University",
      "degree": "Bachelor",
      "department": "Computer Science",
      "year": "2024",
      "status": "pending",
      "paymentStatus": "pending",
      "razorpayOrderId": null,
      "razorpayPaymentId": null,
      "createdAt": "2025-12-15T14:22:00Z"
    }
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
  "razorpayOrderId": null,
  "razorpayPaymentId": null,
  "createdAt": "2025-12-15T14:22:00Z"
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

**Valid Values:** pending, contacted, enrolled, canceled

**Response:**
```json
{
  "_id": "648f8a9e5d4c2b1234567890",
  "status": "contacted",
  "name": "John Doe",
  "email": "john@example.com"
  // ... other fields
}
```

---

### 5. Manually Verify Payment & Enroll Student ⭐
**PATCH** `/api/course-inquiries/:id/manual-verify`

**Auth Required:** Yes

**Description:** Manually verify payment and enroll student when automatic verification fails. This will:
- Update payment status to "completed"
- Update enrollment status to "enrolled"
- Send enrollment confirmation email

**Request Body:**
```json
{
  "paymentId": "pay_123456789",
  "notes": "Manual verification by admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment manually verified and student enrolled successfully",
  "inquiry": {
    "_id": "648f8a9e5d4c2b1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "organization": "Tech University",
    "courseName": "Web Development Bootcamp",
    "status": "enrolled",
    "paymentStatus": "completed"
  }
}
```

---

### 6. Update Payment Status Only
**PATCH** `/api/course-inquiries/:id/payment-status`

**Auth Required:** Yes

**Description:** Update only the payment status without changing enrollment status.

**Request Body:**
```json
{
  "paymentStatus": "completed",
  "razorpayPaymentId": "pay_123456789"
}
```

**Valid Payment Status Values:** pending, completed, failed

**Response:**
```json
{
  "_id": "648f8a9e5d4c2b1234567890",
  "paymentStatus": "completed",
  "razorpayPaymentId": "pay_123456789"
  // ... other fields
}
```

---

### 7. Export Inquiries to CSV
**GET** `/api/course-inquiries/export`

**Auth Required:** Yes

**Query Parameters:**
- `startDate` (string) - YYYY-MM-DD
- `endDate` (string) - YYYY-MM-DD
- `status` (string) - pending/contacted/enrolled/canceled
- `paymentStatus` (string) - pending/completed/failed

**Example:**
```
GET /api/course-inquiries/export?startDate=2025-12-01&endDate=2025-12-31
```

**Response:** CSV file download with columns:
```
ID, Name, Email, Phone, Course, Organization, Degree, Department, Year, Status, Payment Status, Created At
```

---

### 8. Get All Inquiries (Simple List)
**GET** `/api/course-inquiries`

**Auth Required:** Yes

**Response:** Array of all inquiries sorted by newest first.

---

### 9. Delete Inquiry
**DELETE** `/api/course-inquiries/:id`

**Auth Required:** Yes

**Response:**
```json
{
  "message": "Inquiry deleted successfully"
}
```

---

## Existing Data Structure (No Changes Made)

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  courseId: ObjectId,
  courseName: String,
  organization: String,
  degree: String,
  department: String,
  year: String,
  status: String, // 'pending' | 'contacted' | 'enrolled' | 'canceled'
  paymentStatus: String, // 'pending' | 'completed' | 'failed'
  razorpayOrderId: String,
  razorpayPaymentId: String,
  createdAt: Date
}
```

---

## Frontend Implementation Guide

### Dashboard Page Components:

#### 1. Overview Cards
```javascript
// Fetch dashboard stats
const stats = await fetch('/api/course-inquiries/dashboard/stats', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

// Display:
// - Total Inquiries: stats.totalInquiries
// - Today: stats.todayInquiries
// - This Week: stats.weekInquiries
// - This Month: stats.monthInquiries
// - Conversion Rate: stats.conversionRate%
// - Revenue: ₹stats.totalRevenue
```

#### 2. Status Breakdown (Pie Chart)
```javascript
// Data for chart:
{
  labels: ['Pending', 'Contacted', 'Enrolled', 'Canceled'],
  data: [
    stats.statusBreakdown.pending,
    stats.statusBreakdown.contacted,
    stats.statusBreakdown.enrolled,
    stats.statusBreakdown.canceled
  ]
}
```

#### 3. Payment Status (Donut Chart)
```javascript
// Data for chart:
{
  labels: ['Pending', 'Completed', 'Failed'],
  data: [
    stats.paymentBreakdown.pending,
    stats.paymentBreakdown.completed,
    stats.paymentBreakdown.failed
  ]
}
```

#### 4. 7-Day Trend (Line Chart)
```javascript
// Data for chart:
{
  labels: stats.last7DaysTrend.map(d => d.date),
  data: stats.last7DaysTrend.map(d => d.count)
}
```

#### 5. Top Courses Table
```javascript
// Table data:
stats.topCourses.forEach(course => {
  // Display: course._id (name), course.count (inquiries), course.enrolled
});
```

#### 6. Top Organizations & Departments
```javascript
// Display as bar charts or lists:
stats.topOrganizations // Top 5 organizations
stats.topDepartments   // Top 5 departments
```

---

### Inquiries List Page:

```javascript
// Fetch with filters
const fetchInquiries = async (filters) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/course-inquiries/filter?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};

// Example usage:
const data = await fetchInquiries({
  page: 1,
  limit: 20,
  status: 'pending',
  search: 'john'
});

// Display:
// - Table with data.inquiries
// - Pagination: data.currentPage / data.totalPages
// - Total count: data.totalInquiries
```

---

### Update Status:

```javascript
const updateStatus = async (inquiryId, newStatus) => {
  const response = await fetch(`/api/course-inquiries/${inquiryId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status: newStatus })
  });
  return await response.json();
};

// Usage:
await updateStatus('648f8a9e5d4c2b1234567890', 'contacted');
```

---

### Manually Verify Payment:

```javascript
const manuallyVerifyPayment = async (inquiryId, paymentId) => {
  const response = await fetch(`/api/course-inquiries/${inquiryId}/manual-verify`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ 
      paymentId: paymentId,
      notes: 'Verified by admin'
    })
  });
  return await response.json();
};

// Usage:
await manuallyVerifyPayment('648f8a9e5d4c2b1234567890', 'pay_abc123');
```

---

### Update Payment Status:

```javascript
const updatePaymentStatus = async (inquiryId, status, paymentId) => {
  const response = await fetch(`/api/course-inquiries/${inquiryId}/payment-status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ 
      paymentStatus: status,
      razorpayPaymentId: paymentId
    })
  });
  return await response.json();
};

// Usage:
await updatePaymentStatus('648f8a9e5d4c2b1234567890', 'completed', 'pay_abc123');
```

---

### Export to CSV:

```javascript
const exportData = async (filters) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/course-inquiries/export?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `inquiries_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

// Usage:
await exportData({ 
  startDate: '2025-12-01', 
  endDate: '2025-12-31',
  status: 'enrolled'
});
```

---

## Summary

✅ **Dashboard Features:**
- Total inquiries count
- Today/Week/Month breakdown
- Conversion rate (inquiry → enrolled)
- Payment completion rate
- Total revenue from completed payments
- Status breakdown
- Payment status breakdown
- Top 5 courses with enrollment data
- Top 5 organizations
- Top 5 departments
- 7-day inquiry trend

✅ **Inquiry Management:**
- Filtered list with pagination
- Search functionality
- Date range filtering
- Status updates
- **Manual payment verification** 🆕
- **Payment status updates** 🆕
- CSV export
- Delete inquiries

✅ **Manual Payment Verification:**
- One-click verify button for failed payments
- Automatically enrolls student
- Sends enrollment email
- Updates all statuses

✅ **All data from existing fields - NO MODEL CHANGES!**

---

## Frontend Implementation - Edit Button Example

### In Your Inquiries Table:

```javascript
// Add an "Actions" column with Edit/Verify buttons
const InquiriesTable = ({ inquiries }) => {
  const handleManualVerify = async (inquiryId) => {
    const paymentId = prompt('Enter Razorpay Payment ID (optional):');
    
    const confirmed = confirm('Manually verify this payment and enroll student?');
    if (!confirmed) return;
    
    try {
      const response = await fetch(`/api/course-inquiries/${inquiryId}/manual-verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          paymentId: paymentId || undefined,
          notes: 'Verified by admin'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Payment verified! Enrollment email sent to student.');
        // Refresh the table
        fetchInquiries();
      } else {
        alert('Failed to verify payment');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error verifying payment');
    }
  };
  
  const handleUpdatePaymentStatus = async (inquiryId, currentStatus) => {
    const newStatus = prompt('Enter new payment status (pending/completed/failed):', currentStatus);
    if (!newStatus) return;
    
    try {
      const response = await fetch(`/api/course-inquiries/${inquiryId}/payment-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ paymentStatus: newStatus })
      });
      
      const result = await response.json();
      alert('Payment status updated!');
      fetchInquiries();
    } catch (error) {
      console.error('Error:', error);
      alert('Error updating payment status');
    }
  };
  
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Course</th>
          <th>Status</th>
          <th>Payment Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {inquiries.map(inquiry => (
          <tr key={inquiry._id}>
            <td>{inquiry.name}</td>
            <td>{inquiry.email}</td>
            <td>{inquiry.courseName}</td>
            <td>{inquiry.status}</td>
            <td>
              <span className={`badge ${inquiry.paymentStatus === 'completed' ? 'success' : 'warning'}`}>
                {inquiry.paymentStatus}
              </span>
            </td>
            <td>
              {/* Show Manual Verify button if payment is pending or failed */}
              {inquiry.paymentStatus !== 'completed' && (
                <button 
                  onClick={() => handleManualVerify(inquiry._id)}
                  className="btn btn-success btn-sm"
                  title="Manually verify payment and enroll student"
                >
                  ✓ Verify & Enroll
                </button>
              )}
              
              {/* Edit payment status button */}
              <button 
                onClick={() => handleUpdatePaymentStatus(inquiry._id, inquiry.paymentStatus)}
                className="btn btn-secondary btn-sm ml-2"
                title="Update payment status"
              >
                Edit Payment
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

### Button States:

1. **Pending Payment** → Show "✓ Verify & Enroll" button (green)
2. **Failed Payment** → Show "✓ Verify & Enroll" button (green)
3. **Completed Payment** → Hide verify button, show "Edit Payment" only

### What Happens When Admin Clicks "Verify & Enroll":

1. ✅ Payment status → `completed`
2. ✅ Enrollment status → `enrolled`
3. ✅ Enrollment email sent to student
4. ✅ Table refreshes automatically
5. ✅ Success message displayed

---

## Quick Test

Test the dashboard endpoint:
```bash
# Get dashboard stats
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/course-inquiries/dashboard/stats

# Get filtered inquiries
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/course-inquiries/filter?page=1&limit=10&status=pending"
```
