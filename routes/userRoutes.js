const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

// Authentication routes
router.post('/login', userController.login);
router.delete('/logout/:sessionId', userController.logout); // Changed to DELETE with sessionId
router.get('/me', userController.getCurrentUser);

// OTP routes
router.post('/request-otp', userController.requestOTP);
router.post('/verify-otp', userController.verifyOTPAndRegister);

// Test route to verify session
router.get('/test-session', (req, res) => {
  if (!req.session.views) {
    req.session.views = 1;
  } else {
    req.session.views++;
  }
  
  res.json({
    sessionId: req.sessionID,
    views: req.session.views,
    session: req.session
  });
});

module.exports = router;
