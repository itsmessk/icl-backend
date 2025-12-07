import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendEmail = async (options) => {
  try {
    // In development mode, skip actual email sending and return mock success
    if (process.env.NODE_ENV === 'development') {
      console.log('DEV MODE: Email sending skipped');
      console.log(`Would have sent email to: ${options.email}`);
      console.log(`Subject: ${options.subject}`);
      return {
        messageId: 'mock-email-id-' + Date.now(),
        mock: true,
        to: options.email,
        success: true
      };
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
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

export default { sendVerificationEmail, sendPasswordResetEmail }; 