const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

// Authentication routes
router.post('/login', userController.login);
router.delete('/logout/:sessionId', userController.logout);
router.get('/me', userController.getCurrentUser);

// Registration OTP routes
router.post('/request-otp', userController.requestOTP);
router.post('/verify-otp', userController.verifyOTPAndRegister);

// Login with OTP routes
router.post('/request-login-otp', userController.requestLoginOTP);
router.post('/verify-login-otp', userController.verifyLoginOTP);

// Update user route
router.put(
  '/:id',
  userController.upload.single('userImage'),
  userController.validate,
  userController.updateUser
);

// Get user by session ID
router.get('/session/:sessionId', userController.getUserBySession);

module.exports = router;
