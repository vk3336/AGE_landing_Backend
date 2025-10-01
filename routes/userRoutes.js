const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

/**
 * @route   POST /api/users/request-otp
 * @desc    Request OTP for registration
 * @access  Public
 * @body    {email: string, [name: string], [organisation: string], [phone: string], 
 *           [address: string], [city: string], [state: string], [country: string]}
 */
router.post('/request-otp', userController.requestOTP);

/**
 * @route   POST /api/users/verify-otp
 * @desc    Verify OTP and complete registration
 * @access  Public
 * @body    {email: string, otp: string}
 */
router.post('/verify-otp', userController.verifyOTPAndRegister);

module.exports = router;
