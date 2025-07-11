const express = require('express');
const User = require('../models/User');
const { sendOTPEmail } = require('../services/emailService');

const router = express.Router();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Request OTP for password reset
router.post('/request-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email address' });
    }

    // Generate OTP and set expiration (10 minutes)
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with OTP fields using findOneAndUpdate to bypass validation
    await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { 
        resetOTP: otp,
        resetOTPExpires: otpExpires
      },
      { runValidators: false } // Skip validation to avoid password length check
    );

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.status(200).json({ 
      message: 'OTP sent to your email address',
      email: email 
    });

  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP. Please try again later.' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Find user with valid OTP
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      resetOTP: otp,
      resetOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    res.status(200).json({ 
      message: 'OTP verified successfully',
      token: otp // We'll use this as a temporary token for password reset
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Find user with valid OTP
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      resetOTP: otp,
      resetOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Update password and clear OTP fields using findOneAndUpdate (plain text password)
    await User.findOneAndUpdate(
      { 
        email: email.toLowerCase(),
        resetOTP: otp,
        resetOTPExpires: { $gt: Date.now() }
      },
      {
        password: newPassword, // Store plain text password
        resetOTP: null,
        resetOTPExpires: null
      },
      { runValidators: false } // Skip validation since we're manually validating
    );

    res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

module.exports = router;