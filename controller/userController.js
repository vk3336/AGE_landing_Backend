const User = require('../model/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// In-memory store for OTPs (in production, use Redis or similar)
const otpStore = new Map();

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail', // e.g., 'gmail', 'outlook', etc.
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Generate OTP
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

// Send OTP to email
const sendOTPEmail = async (email, otp) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP for Registration',
            text: `Your OTP for registration is: ${otp}. This OTP will expire in 10 minutes.`
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return false;
    }
};

// Request OTP for registration
const requestOTP = async (req, res) => {
    try {
        const { email, ...otherFields } = req.body;

        // Check if email is provided
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required for OTP verification'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

        // Store OTP and user data temporarily
        otpStore.set(email, {
            otp,
            expiry: otpExpiry,
            userData: otherFields // Store other form fields
        });

        // Send OTP to email
        const emailSent = await sendOTPEmail(email, otp);
        if (!emailSent) {
            otpStore.delete(email);
            return res.status(500).json({
                success: false,
                message: 'Failed to send OTP'
            });
        }

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            email: email
        });

    } catch (error) {
        console.error('Request OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during OTP request'
        });
    }
};

// Verify OTP and register user
const verifyOTPAndRegister = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Validate input
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        // Get stored OTP data
        const otpData = otpStore.get(email);
        if (!otpData) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Check if OTP matches and is not expired
        if (otpData.otp !== otp || Date.now() > otpData.expiry) {
            otpStore.delete(email);
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Create user with stored data
        const userData = {
            email,
            ...otpData.userData
        };

        const user = new User(userData);
        await user.save();

        // Clear OTP data
        otpStore.delete(email);

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.otp;

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: userResponse
        });

    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    requestOTP,
    verifyOTPAndRegister
};
