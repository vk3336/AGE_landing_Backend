const User = require('../model/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// In-memory store for temporary user data (in production, use Redis or similar)
const tempUserStore = new Map();

// In-memory store for login OTPs
const loginOtpStore = new Map();

// Helper function to send OTP email
const sendLoginOTPEmail = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Login OTP',
            text: `Your OTP for login is: ${otp}. This OTP is valid for 10 minutes.`
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return false;
    }
};

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Generate OTP
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

// Send OTP to user's email
const sendOTP = async (email, otp) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP for Registration',
            text: `Your OTP for registration is: ${otp}. It will expire in 10 minutes.`
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending OTP:', error);
        return false;
    }
};

// Step 1: Send OTP for registration
const sendRegistrationOTP = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

        // Store user data temporarily with OTP
        tempUserStore.set(email, {
            ...req.body,
            otp,
            otpExpiry
        });

        // Send OTP to email
        const otpSent = await sendOTP(email, otp);
        if (!otpSent) {
            tempUserStore.delete(email);
            return res.status(500).json({ message: 'Failed to send OTP' });
        }

        res.status(200).json({ 
            message: 'OTP sent to your email',
            email: email
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// Step 2: Verify OTP and complete registration
const verifyOTPAndRegister = async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        // Get temporary user data
        const tempUser = tempUserStore.get(email);
        
        // Validate OTP
        if (!tempUser || tempUser.otp !== otp || new Date(tempUser.otpExpiry) < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Create new user
        const { otp: _, otpExpiry, ...userData } = tempUser;
        const user = new User({
            ...userData,
            isEmailVerified: true
        });

        // Save user to database
        await user.save();

        // Remove from temporary store
        tempUserStore.delete(email);

        res.status(201).json({ 
            message: 'Registration successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ message: 'Server error during OTP verification' });
    }
};

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password -otp -otpExpiry');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const updates = { ...req.body };
        delete updates.email; // Prevent email updates
        delete updates.otp; // Prevent OTP updates
        delete updates.otpExpiry;
        
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password -otp -otpExpiry');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// User login with email/name and password
const login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'Please provide both identifier (email/name) and password' 
            });
        }

        // Find user by email or name
        const user = await User.findOne({
            $or: [
                { email: identifier },
                { name: identifier }
            ]
        });

        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        // Check if password matches using the model method
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        // Remove sensitive data before sending response
        const userObj = user.toObject();
        delete userObj.password;
        delete userObj.otp;
        delete userObj.otpExpiry;

        // Store user in session
        req.session.user = userObj;
        
        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: userObj,
            session: req.session // Sending session info in response
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during login' 
        });
    }
};

// User logout
const logout = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Check if user is logged in
        if (req.session.user && req.session.user._id === userId) {
            // Destroy the session
            req.session.destroy(err => {
                if (err) {
                    console.error('Error destroying session:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Error logging out'
                    });
                }
                res.status(200).json({
                    success: true,
                    message: 'Logout successful'
                });
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'No active session found for this user'
            });
        }
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during logout'
        });
    }
};

// Get session information for a user
const getSessionInfo = (req, res) => {
    try {
        const userId = req.params.userId;
        
        if (!req.session.user) {
            return res.status(404).json({
                success: false,
                message: 'No active session found'
            });
        }

        // Check if the requested session belongs to the user
        if (req.session.user._id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access to session information'
            });
        }

        // Return session information
        res.status(200).json({
            success: true,
            session: {
                id: req.sessionID,
                user: req.session.user,
                cookie: req.session.cookie,
                // Add any other session information you want to expose
                createdAt: req.session.createdAt,
                expiresAt: req.session.cookie._expires
            }
        });
    } catch (error) {
        console.error('Error getting session info:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving session information'
        });
    }
};

// Middleware to check if user is logged in
const isLoggedIn = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({
            success: false,
            message: 'Please log in to continue'
        });
    }
};

// Request OTP for login
const requestLoginOTP = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email is required' 
            });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'No user found with this email' 
            });
        }

        // Generate OTP (6 digits)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store OTP (in production, use Redis)
        loginOtpStore.set(email, {
            otp,
            otpExpiry,
            userId: user._id
        });

        // Send OTP via email
        await sendLoginOTPEmail(email, otp);

        res.status(200).json({
            success: true,
            message: 'OTP sent to email',
            // Don't send OTP in response in production
            otp: process.env.NODE_ENV === 'development' ? otp : undefined
        });

    } catch (error) {
        console.error('Error in requestLoginOTP:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error sending OTP' 
        });
    }
};

// Verify OTP and login
const verifyLoginOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        if (!email || !otp) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and OTP are required' 
            });
        }

        // Get stored OTP data
        const otpData = loginOtpStore.get(email);
        
        // Check if OTP exists and is not expired
        if (!otpData || otpData.otpExpiry < new Date()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid or expired OTP' 
            });
        }

        // Verify OTP
        if (otpData.otp !== otp) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid OTP' 
            });
        }

        // Get user
        const user = await User.findById(otpData.userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Create session (same as password login)
        const userObj = user.toObject();
        delete userObj.password;
        delete userObj.otp;
        delete userObj.otpExpiry;
        
        req.session.user = userObj;

        // Clear used OTP
        loginOtpStore.delete(email);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: userObj,
            session: req.session
        });

    } catch (error) {
        console.error('Error in verifyLoginOTP:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error verifying OTP' 
        });
    }
};

module.exports = {
    sendRegistrationOTP,
    verifyOTPAndRegister,
    getUserProfile,
    updateUserProfile,
    login,
    logout,
    isLoggedIn,
    getSessionInfo,
    requestLoginOTP,
    verifyLoginOTP
};
