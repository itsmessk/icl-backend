# Batch Email System (LOCAL/OFFLINE ONLY)

## 🔥 IMPORTANT: Production Safety
- **All automatic email sending is now DISABLED in production**
- Batch email endpoints **ONLY work in LOCAL/DEVELOPMENT environment**
- Production will reject batch email requests with 403 Forbidden
- This ensures you have full control over when emails are sent

---

## ✅ What Changed

### 1. **Automatic Emails Disabled**
All automatic enrollment email sending has been commented out in:
- `verifyInquiryPayment()` - Payment webhook verification
- `verifyPaymentSimple()` - Simple payment verification  
- `manuallyVerifyPayment()` - Manual admin verification

### 2. **Email Tracking Added**
New fields in `CourseInquiry` model:
```javascript
{
  enrollmentEmailSent: Boolean,      // Has email been sent?
  enrollmentEmailSentAt: Date       // When was it sent?
}
```

### 3. **New Batch Email Endpoints**
Four new endpoints for manual email management (LOCAL ONLY).

---

## 📋 API Endpoints

### 1. Get Pending Emails
**GET** `/api/course-inquiries/emails/pending`

Get list of enrolled students who haven't received enrollment email yet.

**Query Parameters:**
- `limit` - Max results (default: 100)
- `skip` - Offset for pagination (default: 0)

**Response:**
```json
{
  "success": true,
  "count": 25,
  "totalPending": 25,
  "inquiries": [
    {
      "_id": "64a1b2c3d4e5f6789",
      "name": "John Doe",
      "email": "john@example.com",
      "courseName": "Python Full Stack",
      "organization": "ABC College",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "enrollmentEmailSent": false
    }
  ]
}
```

---

### 2. Send Batch Emails
**POST** `/api/course-inquiries/emails/send-batch`

Send enrollment emails to specific students (max 100 at once).

**Request Body:**
```json
{
  "inquiryIds": [
    "64a1b2c3d4e5f6789",
    "64a1b2c3d4e5f6790",
    "64a1b2c3d4e5f6791"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Batch email complete: 3 sent, 0 failed, 0 already sent",
  "results": {
    "total": 3,
    "sent": [
      {
        "id": "64a1b2c3d4e5f6789",
        "email": "john@example.com",
        "name": "John Doe",
        "course": "Python Full Stack"
      }
    ],
    "failed": [],
    "alreadySent": []
  }
}
```

---

### 3. Send All Pending Emails
**POST** `/api/course-inquiries/emails/send-all`

Send emails to ALL enrolled students who haven't received email.

**Request Body (Optional):**
```json
{
  "dryRun": true  // Set to true for preview without sending
}
```

**Dry Run Response:**
```json
{
  "success": true,
  "dryRun": true,
  "message": "Dry run complete. 50 emails would be sent.",
  "totalToSend": 50,
  "recipients": [
    {
      "id": "64a1b2c3d4e5f6789",
      "name": "John Doe",
      "email": "john@example.com",
      "course": "Python Full Stack"
    }
  ]
}
```

---

### 4. Get Email Statistics
**GET** `/api/course-inquiries/emails/stats`

Get statistics about email sending.

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalEnrolledStudents": 100,
    "emailsSent": 75,
    "emailsPending": 25,
    "recentEmailsSent7Days": 20,
    "retroactiveEmails": 50,
    "successRate": "75.00%"
  }
}
```

**Stats Explained:**
- `totalEnrolledStudents` - All students with status=enrolled and payment=completed
- `emailsSent` - Students who received enrollment email
- `emailsPending` - Students who need email
- `recentEmailsSent7Days` - Emails sent in last 7 days
- `retroactiveEmails` - Old students (enrolled before email feature)
- `successRate` - Percentage of enrolled students who got email

---

## 🚀 Usage Workflow

### Step 1: Check Who Needs Emails
```bash
# In Postman or your API client (LOCAL environment only)
GET http://localhost:5000/api/course-inquiries/emails/stats
Authorization: Bearer YOUR_JWT_TOKEN
```

### Step 2: Preview Pending Emails
```bash
GET http://localhost:5000/api/course-inquiries/emails/pending?limit=100
Authorization: Bearer YOUR_JWT_TOKEN
```

### Step 3: Test with Dry Run
```bash
POST http://localhost:5000/api/course-inquiries/emails/send-all
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "dryRun": true
}
```

### Step 4: Send Emails (Small Batch First)
```bash
POST http://localhost:5000/api/course-inquiries/emails/send-batch
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "inquiryIds": ["INQUIRY_ID_1", "INQUIRY_ID_2"]
}
```

### Step 5: Send All Remaining
```bash
POST http://localhost:5000/api/course-inquiries/emails/send-all
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "dryRun": false
}
```

---

## 🛡️ Safety Features

1. **Production Block** - All batch endpoints return 403 in production
2. **Duplicate Prevention** - Won't send email if already sent
3. **Eligibility Check** - Only sends to enrolled students with completed payment
4. **Batch Limit** - Max 100 emails per batch request
5. **Rate Limiting** - 500ms delay between each email
6. **Error Isolation** - One failed email won't stop the batch
7. **Detailed Results** - Shows exactly which emails sent/failed/skipped

---

## 📊 Email Tracking

After sending, the system tracks:
- `enrollmentEmailSent: true` - Email was sent
- `enrollmentEmailSentAt: Date` - Timestamp when sent

You can always check who received emails:
```bash
GET http://localhost:5000/api/course-inquiries/filter?limit=100
```

Filter response will include `enrollmentEmailSent` field for each inquiry.

---

## 🔧 Environment Setup

Make sure your `.env` has email configuration:

```env
NODE_ENV=development  # Must be 'development' for batch emails!

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=support@icl.today
EMAIL_FROM_NAME=ICL
```

---

## 💡 Use Cases

### 1. **Send to Old Students (Retroactive)**
Students who enrolled before email feature was added:
```javascript
// Get stats first
GET /api/course-inquiries/emails/stats
// Look at "retroactiveEmails" count

// Send to all pending
POST /api/course-inquiries/emails/send-all
{ "dryRun": false }
```

### 2. **Send to Specific Group**
Target specific students manually:
```javascript
// Get pending list
GET /api/course-inquiries/emails/pending

// Pick IDs and send
POST /api/course-inquiries/emails/send-batch
{
  "inquiryIds": ["id1", "id2", "id3"]
}
```

### 3. **Weekly Batch Processing**
Run locally once a week:
```bash
# Check how many pending
curl localhost:5000/api/course-inquiries/emails/stats -H "Authorization: Bearer TOKEN"

# Send all
curl -X POST localhost:5000/api/course-inquiries/emails/send-all \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": false}'
```

---

## ⚠️ Important Notes

1. **Local Only**: These endpoints will NOT work on Railway/production
2. **Manual Control**: You decide when to send emails
3. **No Automation**: Emails are never sent automatically anymore
4. **Tracking**: System tracks who got emails to prevent duplicates
5. **Idempotent**: Safe to run multiple times (won't resend)
6. **Existing Students**: Can send emails to anyone enrolled before this feature

---

## 🎯 Frontend Integration

Create an "Email Management" page in admin dashboard:

```javascript
// Get pending count
const stats = await fetch('/api/course-inquiries/emails/stats', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Show button: "Send 25 Pending Emails"
// On click:
await fetch('/api/course-inquiries/emails/send-all', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ dryRun: false })
});
```

---

## 📝 Summary

✅ **Automatic emails disabled** - No surprise emails in production
✅ **Full control** - Send emails when YOU want
✅ **Batch processing** - Handle 100s of emails efficiently  
✅ **Email tracking** - Know exactly who got emails
✅ **Retroactive support** - Send to old students too
✅ **Safety first** - Production blocked, duplicate prevention, error handling

**Run your backend locally and use these endpoints to manage enrollment emails manually!** 🎉
