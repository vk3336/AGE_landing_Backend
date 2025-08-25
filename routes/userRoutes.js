const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

// OTP Login Flow
router.post('/login/otp/request', userController.requestLoginOTP);
router.post('/login/otp/verify', userController.verifyLoginOTP);

// Password Login

// User login
router.post('/login', userController.login);

// User logout
router.post('/logout/:userId', userController.logout);

// Get session information
router.get('/:userId/session', userController.isLoggedIn, userController.getSessionInfo);

// Step 1: Send OTP for registration
router.post('/send-otp', userController.sendRegistrationOTP);

// Step 2: Verify OTP and complete registration
router.post('/verify-otp', userController.verifyOTPAndRegister);

// Get user profile (protected route)
router.get('/:userId', userController.isLoggedIn, userController.getUserProfile);

// Update user profile (protected route)
router.put('/:userId', userController.updateUserProfile);

module.exports = router;
