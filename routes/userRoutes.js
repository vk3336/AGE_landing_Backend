const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

// Authentication routes
router.post('/login', (req, res) => userController.login(req, res));
router.delete('/logout/:sessionId', (req, res) => userController.logout(req, res));

// Get all users (admin only)
router.get('/', (req, res) => userController.getAllUsers(req, res));


// Get user by ID
router.get('/:id', (req, res) => userController.getUserById(req, res));

// Registration OTP routes
router.post('/request-otp', (req, res) => userController.requestOTP(req, res));
router.post('/verify-otp', (req, res) => userController.verifyOTPAndRegister(req, res));

// Login with OTP routes
router.post('/request-login-otp', (req, res) => userController.requestLoginOTP(req, res));
router.post('/verify-login-otp', (req, res) => userController.verifyLoginOTP(req, res));

// Update user route
router.put(
  '/:id',
  userController.upload.single('userImage'),
  userController.validate,
  (req, res) => userController.updateUser(req, res)
);

// Delete user by ID
router.delete('/:id', (req, res) => userController.deleteUser(req, res));

// Delete user's image
router.delete('/:id/image', (req, res) => userController.deleteUserImage(req, res));


module.exports = router;
