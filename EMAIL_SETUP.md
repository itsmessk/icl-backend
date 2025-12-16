# Email Notification Setup

## Overview
Automatic email notifications are sent to users after successful payment verification and enrollment.

---

## What Gets Sent

When a payment is successfully verified, the user receives a **beautiful enrollment confirmation email** containing:

✅ Congratulations message  
✅ Course details (name, organization)  
✅ Payment confirmation  
✅ Enrollment confirmation  
✅ Next steps information  
✅ Link to dashboard  

---

## Email Configuration

### Option 1: Gmail (Recommended for Testing)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password

3. **Update .env file**:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Infoziant
```

### Option 2: Other Email Services

#### SendGrid
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Infoziant
```

#### Mailgun
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASSWORD=your-mailgun-password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Infoziant
```

#### Custom SMTP Server
```env
EMAIL_HOST=mail.yourdomain.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Infoziant
```

---

## Development Mode

When `NODE_ENV=development`, emails are **not actually sent**. Instead:
- Email details are logged to console
- Mock success response is returned
- No SMTP connection is made

This allows testing without email configuration.

To enable actual emails in development:
```env
NODE_ENV=production
```

---

## When Emails Are Sent

Emails are automatically sent after successful payment verification in:

1. **Standard Payment Verification** (`/api/course-inquiries/verify-payment`)
   - After Razorpay signature verification
   - When payment status becomes "completed"
   - When enrollment status becomes "enrolled"

2. **Simple Payment Verification** (`/api/course-inquiries/verify-payment-simple`)
   - After Razorpay payment verification
   - In test mode when payment is marked successful

---

## Email Content Example

```
Subject: Enrollment Confirmation - Web Development Bootcamp

🎉 Enrollment Successful!

Hello John Doe,

Congratulations! Your payment has been successfully processed and you are now enrolled in:

Course Details
--------------
Course: Web Development Bootcamp
Organization: Tech University

✓ Payment Status: Completed
✓ Enrollment Status: Confirmed

What's Next?
• You will receive course access details within 24 hours
• Check your email for further instructions from our team
• Prepare any required materials or prerequisites
• Join our student community for support and networking

[Visit Dashboard Button]

Thank you for choosing Infoziant!

Best regards,
The Infoziant Team
```

---

## Testing Emails

### Test in Development Mode:
```bash
# Check console output
node server.js

# You'll see:
# DEV MODE: Email sending skipped
# Would have sent email to: user@example.com
# Subject: Enrollment Confirmation - Course Name
```

### Test with Real Emails:
1. Set `NODE_ENV=production` in .env
2. Configure email credentials
3. Make a test payment
4. Check the user's email inbox

---

## Troubleshooting

### Common Issues:

**1. "Invalid login" error with Gmail**
- ✓ Make sure 2FA is enabled
- ✓ Use App Password, not regular password
- ✓ App Password should be 16 characters (no spaces)

**2. Emails not being sent**
- ✓ Check NODE_ENV is set to "production"
- ✓ Verify SMTP credentials are correct
- ✓ Check server console for error messages
- ✓ Ensure port 587 is not blocked by firewall

**3. Emails going to spam**
- ✓ Use a proper "from" email address
- ✓ Consider using a professional email service (SendGrid, Mailgun)
- ✓ Add SPF/DKIM records to your domain

**4. "Connection timeout" errors**
- ✓ Check if port 587 is open
- ✓ Try port 465 with EMAIL_SECURE=true
- ✓ Check if your hosting provider blocks SMTP

---

## Error Handling

The system is designed to **continue working even if emails fail**:
- Payment verification still succeeds
- User is enrolled successfully
- Error is logged to console
- Application continues normally

This ensures that email issues don't block the enrollment process.

---

## Customization

To customize the email template, edit:
```
backend/utils/emailUtils.js
```

Find the `sendEnrollmentSuccessEmail` function and modify the HTML content.

### Available Variables:
- `name` - Student name
- `email` - Student email
- `courseName` - Enrolled course name
- `organization` - Student's organization
- `process.env.CLIENT_URL` - Your website URL

---

## Security Best Practices

1. **Never commit .env file** to version control
2. **Use App Passwords** instead of regular passwords
3. **Use environment variables** for all credentials
4. **Enable 2FA** on email accounts
5. **Use dedicated email** for sending (noreply@domain.com)
6. **Monitor email sending** for abuse

---

## Production Recommendations

For production environments, consider using:

1. **Professional Email Service**
   - SendGrid (99% delivery rate)
   - Mailgun (powerful API)
   - AWS SES (cost-effective)
   - Postmark (transactional emails)

2. **Benefits:**
   - Better deliverability
   - Analytics and tracking
   - Higher sending limits
   - Professional support
   - Reputation monitoring

---

## Quick Start

1. Update `.env` with your email credentials
2. Restart your server
3. Make a test payment
4. Check the user's email inbox
5. Done! ✅

---

## Support

If emails are not working:
1. Check server console for errors
2. Verify .env configuration
3. Test SMTP connection separately
4. Check email service status
5. Review firewall settings

The enrollment email system is now fully integrated and ready to use! 🚀
