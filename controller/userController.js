const User = require('../model/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// In-memory store for OTPs (in production, use Redis or similar)
const otpStore = new Map();
const loginOtpStore = new Map();

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

// Login user with email/name and password (simple version for testing)
const login = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        console.log('Login attempt for:', identifier);

        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email/Username and password are required'
            });
        }

        // Find user by email or name (case-insensitive)
        const user = await User.findOne({
            $or: [
                { email: { $regex: new RegExp('^' + identifier + '$', 'i') } },
                { name: { $regex: new RegExp('^' + identifier + '$', 'i') } }
            ]
        }).select('+password');

        console.log('User found:', user ? 'Yes' : 'No');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email/username or password'
            });
        }

        // Simple direct password comparison
        if (user.password !== password) {
            console.log('Password mismatch. Stored:', user.password, 'Received:', password);
            return res.status(401).json({
                success: false,
                message: 'Invalid email/username or password'
            });
        }

        // Set user in session
        req.session.user = {
            id: user._id,
            email: user.email,
            name: user.name
        };

        // Remove password from output
        user.password = undefined;

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user,
            sessionId: req.sessionID
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during login',
            error: error.message
        });
    }
};

// Logout user by session ID
const logout = (req, res) => {
    const { sessionId } = req.params;
    
    // Check if session ID is provided
    if (!sessionId) {
        return res.status(400).json({
            success: false,
            message: 'Session ID is required'
        });
    }

    // Get the session store
    const sessionStore = req.sessionStore;
    
    // First, check if the session exists
    sessionStore.get(sessionId, (err, session) => {
        if (err) {
            console.error('Error checking session:', err);
            return res.status(500).json({
                success: false,
                message: 'Error checking session',
                error: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }

        // If session doesn't exist, return 404
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found',
                sessionId: sessionId
            });
        }

        // Session exists, now destroy it
        sessionStore.destroy(sessionId, (err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error logging out',
                    error: process.env.NODE_ENV === 'development' ? err.message : undefined
                });
            }
            
            // If we're destroying the current session, clear the cookie
            if (req.sessionID === sessionId) {
                res.clearCookie('connect.sid', {
                    path: '/',
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax'
                });
            }
            
            console.log('Session destroyed:', sessionId);
            res.status(200).json({
                success: true,
                message: 'Session terminated successfully',
                sessionId: sessionId
            });
        });
    });
};

// Check if user is authenticated
const getCurrentUser = (req, res) => {
    if (req.session.user) {
        res.status(200).json({
            success: true,
            user: req.session.user
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Not authenticated'
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

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

        // Store OTP
        loginOtpStore.set(email, {
            otp,
            expiry: otpExpiry,
            userId: user._id
        });

        // Send OTP to email
        const emailSent = await sendOTPEmail(email, otp);
        if (!emailSent) {
            loginOtpStore.delete(email);
            return res.status(500).json({
                success: false,
                message: 'Failed to send OTP'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Login OTP sent successfully',
            email: email
        });

    } catch (error) {
        console.error('Request login OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login OTP request'
        });
    }
};

// Verify OTP and login user
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
        if (!otpData) {
            return res.status(400).json({
                success: false,
                message: 'OTP expired or invalid'
            });
        }

        // Check if OTP is expired
        if (Date.now() > otpData.expiry) {
            loginOtpStore.delete(email);
            return res.status(400).json({
                success: false,
                message: 'OTP has expired'
            });
        }

        // Verify OTP
        if (otp !== otpData.otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        // Get user
        const user = await User.findById(otpData.userId).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Create session
        req.session.userId = user._id;
        const sessionId = req.sessionID;

        // Clear used OTP
        loginOtpStore.delete(email);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: user,
            sessionId: sessionId
        });

    } catch (error) {
        console.error('Verify login OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during OTP verification'
        });
    }
};

// Simple update user method
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Find and update user
        const user = await User.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        ).select('-password -otp -__v');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            user
        });

    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user',
            error: error.message
        });
    }
};

// Get user by session ID
const getUserBySession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Session ID is required'
            });
        }

        // In a real application, you would typically use a session store to validate the session
        // This is a simplified example - in production, use a proper session store like Redis
        req.sessionStore.get(sessionId, async (err, session) => {
            if (err || !session) {
                return res.status(404).json({
                    success: false,
                    message: 'Session not found or expired'
                });
            }

            if (!session.user || !session.user.id) {
                return res.status(404).json({
                    success: false,
                    message: 'User session data not found'
                });
            }

            try {
                const user = await User.findById(session.user.id).select('-password -otp -__v');
                
                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: 'User not found'
                    });
                }

                res.status(200).json({
                    success: true,
                    user
                });
            } catch (error) {
                console.error('Error fetching user:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error fetching user details',
                    error: error.message
                });
            }
        });
    } catch (error) {
        console.error('Session validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating session',
            error: error.message
        });
    }
};

module.exports = {
    requestOTP,
    verifyOTPAndRegister,
    requestLoginOTP,
    verifyLoginOTP,
    login,
    logout,
    getCurrentUser,
    updateUser,
    getUserBySession
};
