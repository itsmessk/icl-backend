# Quick Start Guide - Batch Email System

## 🚀 Setup (5 minutes)

### 1. Update .env for Local Testing
```env
NODE_ENV=development  # ← MUST be 'development' for batch emails!
```

### 2. Restart Server
```bash
npm run dev
```

### 3. Get Your Admin Token
Login to get JWT token, or use existing token from your admin panel.

---

## 📧 Send Emails in 3 Steps

### Step 1: Check Statistics
```bash
curl http://localhost:5000/api/course-inquiries/emails/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Example Response:**
```json
{
  "success": true,
  "stats": {
    "totalEnrolledStudents": 50,
    "emailsSent": 0,
    "emailsPending": 50,      ← 50 students need emails!
    "retroactiveEmails": 50   ← All enrolled before email feature
  }
}
```

---

### Step 2: Preview Who Will Get Emails (Dry Run)
```bash
curl -X POST http://localhost:5000/api/course-inquiries/emails/send-all \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": true}'
```

**Example Response:**
```json
{
  "success": true,
  "dryRun": true,
  "message": "Dry run complete. 50 emails would be sent.",
  "recipients": [
    {
      "id": "67603f65f54088f94d7c2e8f",
      "name": "John Doe",
      "email": "john@example.com",
      "course": "Python Full Stack"
    },
    // ... 49 more
  ]
}
```

---

### Step 3: Send Emails!

#### Option A: Send to EVERYONE
```bash
curl -X POST http://localhost:5000/api/course-inquiries/emails/send-all \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": false}'
```

#### Option B: Send to Specific People
```bash
curl -X POST http://localhost:5000/api/course-inquiries/emails/send-batch \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "inquiryIds": [
      "67603f65f54088f94d7c2e8f",
      "67603f65f54088f94d7c2e90"
    ]
  }'
```

**Success Response:**
```json
{
  "success": true,
  "message": "Batch email complete: 50 sent, 0 failed, 0 already sent",
  "results": {
    "total": 50,
    "sent": [
      {
        "id": "67603f65f54088f94d7c2e8f",
        "email": "john@example.com",
        "name": "John Doe",
        "course": "Python Full Stack"
      }
      // ... 49 more
    ],
    "failed": [],
    "alreadySent": []
  }
}
```

---

## 📊 Check Progress

### Get List of Pending Emails
```bash
curl http://localhost:5000/api/course-inquiries/emails/pending \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Check Stats Again
```bash
curl http://localhost:5000/api/course-inquiries/emails/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

After sending, you'll see:
```json
{
  "emailsSent": 50,       ← Now 50!
  "emailsPending": 0      ← None pending!
}
```

---

## 🎯 Postman Collection

### 1. Email Stats
```
GET http://localhost:5000/api/course-inquiries/emails/stats
Headers:
  Authorization: Bearer {{token}}
```

### 2. Pending List
```
GET http://localhost:5000/api/course-inquiries/emails/pending?limit=100
Headers:
  Authorization: Bearer {{token}}
```

### 3. Dry Run Test
```
POST http://localhost:5000/api/course-inquiries/emails/send-all
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json
Body (raw JSON):
{
  "dryRun": true
}
```

### 4. Send All Emails
```
POST http://localhost:5000/api/course-inquiries/emails/send-all
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json
Body (raw JSON):
{
  "dryRun": false
}
```

### 5. Send Batch (Specific IDs)
```
POST http://localhost:5000/api/course-inquiries/emails/send-batch
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json
Body (raw JSON):
{
  "inquiryIds": [
    "PASTE_ID_1_HERE",
    "PASTE_ID_2_HERE"
  ]
}
```

---

## ✅ What You Get

### Email Template Includes:
- ✉️ Congratulations message
- 📚 Course name and organization
- ✅ Payment confirmed
- 🎓 Enrollment confirmed
- 📋 Next steps
- 🔗 Dashboard link
- 💬 Support contact

---

## ⚠️ Important Notes

1. **Local Only**: These endpoints won't work on Railway/production
2. **No Duplicates**: Won't send email twice to same person
3. **Safe**: One email failure doesn't stop the batch
4. **Rate Limited**: 500ms delay between emails (Gmail likes this)
5. **Max Batch**: 100 emails per request (send multiple batches if needed)

---

## 🐛 Troubleshooting

### "403 Forbidden" Error
```
❌ Problem: Batch email features are only available in local/development
✅ Solution: Check .env has NODE_ENV=development
```

### Emails Not Sending
```
❌ Problem: Email configuration in .env
✅ Solution: Verify EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD are correct
✅ For Gmail: Use App Password, not regular password
```

### "Already Sent" in Results
```
✅ This is GOOD! Means you already sent email to that person
✅ System prevents duplicates automatically
```

---

## 🎉 Done!

You can now:
- ✅ View who needs emails
- ✅ Send emails in batches
- ✅ Track who received emails
- ✅ Never send duplicates
- ✅ Control everything manually

**No more surprise emails in production!** 🚀
