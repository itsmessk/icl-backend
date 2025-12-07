import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailUtils.js';

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      isVerified: !process.env.REQUIRE_EMAIL_VERIFICATION // Skip verification in development if not required
    });
    
    if (user) {
      // Generate verification token if email verification is required
      if (process.env.REQUIRE_EMAIL_VERIFICATION === 'true') {
        // Generate and save verification token
        const verificationToken = user.generateVerificationToken();
        await user.save();
        
        // Create verification URL
        const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
        
        // For development environment, return the token directly
        if (process.env.NODE_ENV === 'development') {
          return res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            requiresVerification: true,
            message: 'DEV MODE: Use the token below to verify your account',
            verificationToken,
            verificationUrl
          });
        }
        
        // Send verification email
        try {
          const emailResult = await sendVerificationEmail(user.email, user.name, verificationUrl);
          if (emailResult.error) {
            console.warn(`Verification email could not be sent: ${emailResult.message}`);
          }
        } catch (emailError) {
          console.error('Failed to send verification email:', emailError);
          // Continue with registration despite email failure
        }
        
        // Return success but don't send token yet
        return res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          requiresVerification: true,
          message: 'Registration successful! Please check your email to verify your account.',
          devToken: process.env.NODE_ENV === 'development' ? verificationToken : undefined
        });
      }
      
      // If no verification required, log user in automatically
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check for user email
    const user = await User.findOne({ email });
    
    // Check if user exists and password matches
    if (user && (await user.comparePassword(password))) {
      // Check if user is verified
      if (process.env.REQUIRE_EMAIL_VERIFICATION === 'true' && !user.isVerified) {
        return res.status(403).json({ 
          message: 'Your email is not verified. Please check your inbox for verification email.',
          needsVerification: true
        });
      }
      
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('courses');
    
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        phone: user.phone,
        courses: user.courses
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user) {
      user.name = req.body.name || user.name;
      
      // If email is being changed, set isVerified to false and send new verification email
      if (req.body.email && user.email !== req.body.email) {
        // Check if new email already exists
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists) {
          return res.status(400).json({ message: 'Email already in use' });
        }
        
        user.email = req.body.email;
        
        if (process.env.REQUIRE_EMAIL_VERIFICATION === 'true') {
          user.isVerified = false;
          const verificationToken = user.generateVerificationToken();
          
          // Create verification URL
          const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
          
          // For development environment, include verification info in response
          if (process.env.NODE_ENV === 'development') {
            const updatedUser = await user.save();
            
            return res.json({
              _id: updatedUser._id,
              name: updatedUser.name,
              email: updatedUser.email,
              profilePicture: updatedUser.profilePicture,
              phone: updatedUser.phone,
              token: generateToken(updatedUser._id),
              verificationRequired: true,
              message: 'DEV MODE: Email changed, use the token below to verify your new email',
              verificationToken,
              verificationUrl
            });
          }
          
          // Send verification email
          try {
            const emailResult = await sendVerificationEmail(user.email, user.name, verificationUrl);
            if (emailResult.error) {
              console.warn(`Verification email could not be sent: ${emailResult.message}`);
            }
          } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            // Continue with profile update despite email failure
          }
        }
      }
      
      user.phone = req.body.phone || user.phone;
      user.profilePicture = req.body.profilePicture || user.profilePicture;
      
      const updatedUser = await user.save();
      
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture,
        phone: updatedUser.phone,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if current password matches
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Verify email with token
// @route   GET /api/users/verify-email/:token
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Hash token
    const verificationToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user by verification token and check if it's still valid
    const user = await User.findOne({
      verificationToken,
      verificationTokenExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }
    
    // Activate user
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    
    await user.save();
    
    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Resend verification email
// @route   POST /api/users/resend-verification
// @access  Public
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      // Return 200 even if user not found for security reasons
      return res.status(200).json({ message: 'Verification email sent if user exists' });
    }
    
    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }
    
    // Generate new verification token
    const verificationToken = user.generateVerificationToken();
    await user.save();
    
    // Create verification URL
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    
    // For development environment, return the token directly
    if (process.env.NODE_ENV === 'development') {
      return res.status(200).json({
        message: 'DEV MODE: Use the token below to verify your account',
        verificationToken,
        verificationUrl
      });
    }
    
    // Send verification email
    try {
      const emailResult = await sendVerificationEmail(user.email, user.name, verificationUrl);
      if (emailResult.error) {
        console.warn(`Verification email could not be sent: ${emailResult.message}`);
        return res.status(500).json({ 
          message: 'Failed to send verification email. Please try again later.',
          devToken: process.env.NODE_ENV === 'development' ? verificationToken : undefined
        });
      }
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return res.status(500).json({ 
        message: 'Failed to send verification email. Please try again later.',
        devToken: process.env.NODE_ENV === 'development' ? verificationToken : undefined
      });
    }
    
    res.status(200).json({ message: 'Verification email sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Forgot password - send reset link
// @route   POST /api/users/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      // Return 200 even if user not found for security reasons
      return res.status(200).json({ message: 'Password reset email sent if user exists' });
    }
    
    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();
    
    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    
    // In development, return token directly without attempting email
    if (process.env.NODE_ENV === 'development') {
      console.log('DEV MODE: Bypassing email for password reset');
      return res.status(200).json({
        message: 'DEV MODE: Use the token below to reset your password',
        resetToken,
        resetUrl
      });
    }
    
    // Send password reset email for production only
    try {
      const emailResult = await sendPasswordResetEmail(user.email, user.name, resetUrl);
      if (emailResult.error) {
        console.warn(`Password reset email could not be sent: ${emailResult.message}`);
        return res.status(500).json({ 
          message: 'Failed to send password reset email. Please try again later.',
          devToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
        });
      }
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      return res.status(500).json({ 
        message: 'Failed to send password reset email. Please try again later.',
        devToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
      });
    }
    
    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Verify reset token
// @route   GET /api/users/reset-password/:token/verify
// @access  Public
export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Hash token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user by reset token and check if it's still valid
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    
    res.status(200).json({ message: 'Valid reset token' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Reset password with token
// @route   POST /api/users/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }
    
    // Hash token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user by reset token and check if it's still valid
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    
    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();
    
    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}; 