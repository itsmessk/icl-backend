import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendEmail = async (options) => {
  try {
    // In PRODUCTION mode, block email sending completely
    if (process.env.NODE_ENV === 'production') {
      console.log('⛔ PRODUCTION MODE: Email sending blocked');
      console.log(`Would have sent email to: ${options.email}`);
      console.log(`Subject: ${options.subject}`);
      return {
        messageId: 'blocked-production-' + Date.now(),
        blocked: true,
        to: options.email,
        success: true,
        message: 'Email blocked in production - use local environment'
      };
    }

    // DEVELOPMENT MODE: Actually send emails
    console.log('📧 DEVELOPMENT MODE: Sending email...');
    
    // Create transporter with connection timeout and retry logic
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      // Add timeouts and connection options for Railway/cloud platforms
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000,
      // Disable TLS certificate validation if needed (not recommended for production)
      tls: {
        rejectUnauthorized: process.env.EMAIL_TLS_REJECT_UNAUTHORIZED !== 'false'
      }
    });

    // Define email options
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    
    return info;
  } catch (error) {
    console.error('Email sending error:', error.message);
    // Don't throw the error - this allows the application to continue even if email fails
    return { error: true, message: error.message };
  }
};

// Send verification email
export const sendVerificationEmail = async (email, name, verificationUrl) => {
  try {
    const subject = 'Email Verification - Infoziant';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a5568;">Verify Your Email Address</h2>
        <p>Hello ${name},</p>
        <p>Thank you for registering with Infoziant. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4a5568; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a>
        </div>
        <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not create an account, please ignore this email.</p>
        <p>Best regards,<br>The Infoziant Team</p>
      </div>
    `;

    return await sendEmail({
      email,
      subject,
      html,
    });
  } catch (error) {
    console.error('Verification email error:', error.message);
    return { error: true, message: error.message };
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, name, resetUrl) => {
  try {
    const subject = 'Password Reset - Infoziant';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a5568;">Reset Your Password</h2>
        <p>Hello ${name},</p>
        <p>You requested a password reset for your Infoziant account. Please click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4a5568; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        </div>
        <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 10 minutes.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <p>Best regards,<br>The Infoziant Team</p>
      </div>
    `;

    return await sendEmail({
      email,
      subject,
      html,
    });
  } catch (error) {
    console.error('Password reset email error:', error.message);
    return { error: true, message: error.message };
  }
};

// Send enrollment success email
export const sendEnrollmentSuccessEmail = async (email, name, courseName, organization) => {
  try {
    const subject = `Enrollment Confirmation - ${courseName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10b981; margin: 0;">🎉 Enrollment Successful!</h1>
          </div>
          
          <h2 style="color: #4a5568;">Hello ${name},</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
            Congratulations! Your payment has been successfully processed and you are now enrolled in:
          </p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0;">Course Details</h3>
            <p style="margin: 5px 0; color: #4b5563;">
              <strong>Course:</strong> ${courseName}
            </p>
            <p style="margin: 5px 0; color: #4b5563;">
              <strong>Institution:</strong> ${organization}
            </p>
          </div>
          
          <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #065f46;">
              <strong>✓ Payment Status:</strong> Completed
            </p>
            <p style="margin: 5px 0; color: #065f46;">
              <strong>✓ Enrollment Status:</strong> Confirmed
            </p>
          </div>
          
          <h3 style="color: #4a5568; margin-top: 30px;">What's Next?</h3>
          <ul style="color: #4b5563; line-height: 1.8;">
            <li>Check your email/WhatsApp for further instructions from our team</li>
            <li>Your classes details will be shared to you shortly</li>
          </ul>
          
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;">
              <strong>📧 Keep this email for your records</strong><br>
              This serves as confirmation of your enrollment and payment.
            </p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin-top: 30px;">
            If you have any questions or concerns, please don't hesitate to contact our support team.
          </p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 25px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0;">📞 Contact Support</h3>
            <p style="margin: 8px 0; color: #4b5563;">
              <strong>Email:</strong> <a href="mailto:support@icl.today" style="color: #2563eb; text-decoration: none;">Support@icl.today</a>
            </p>
            <p style="margin: 8px 0; color: #4b5563;">
              <strong>Phone:</strong> <a href="tel:+918667214326" style="color: #2563eb; text-decoration: none;">+91 86672 14326</a>
            </p>
            <p style="margin: 8px 0; color: #4b5563;">
              <strong>Phone:</strong> <a href="tel:+919176771711" style="color: #2563eb; text-decoration: none;">+91 91767 71711</a>
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            Thank you for choosing ICL! We're excited to have you as part of our learning community.
          </p>
          
          <p style="color: #6b7280; font-size: 14px;">
            Best regards,<br>
            <strong>The ICL Team</strong>
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
          <p>This is an automated confirmation email. Please do not reply to this message.</p>
        </div>
      </div>
    `;

    return await sendEmail({
      email,
      subject,
      html,
    });
  } catch (error) {
    console.error('Enrollment email error:', error.message);
    return { error: true, message: error.message };
  }
};

export default { sendVerificationEmail, sendPasswordResetEmail, sendEnrollmentSuccessEmail }; 