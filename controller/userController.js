const User = require('../model/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { cloudinaryServices } = require('../services/cloudinary.service');
const multer = require('multer');
const { body, validationResult } = require('express-validator');

// Configure multer for file uploads
const storage = multer.memoryStorage();
// Parse allowed extensions from environment variable or default to common image formats
const allowedExtensions = process.env.ALLOWED_IMAGE_EXTENSIONS 
    ? process.env.ALLOWED_IMAGE_EXTENSIONS.split(',').map(ext => ext.trim().toLowerCase())
    : ['jpeg', 'jpg', 'png', 'gif'];

// Convert array to regex pattern
const filetypes = new RegExp(allowedExtensions.join('|'));

// Get max file size from environment variable or default to 5MB
const maxFileSize = parseInt(process.env.MAX_IMAGE_SIZE) || 5 * 1024 * 1024;

const upload = multer({
    storage: storage,
    limits: { fileSize: maxFileSize },
    fileFilter: (req, file, cb) => {
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(file.originalname.toLowerCase().split('.').pop());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error(`Only image files (${allowedExtensions.join(', ')}) are allowed!`));
    }
});

// Validation rules for user update
const validate = [
    body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').optional().isEmail().withMessage('Please provide a valid email')
];

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

        // Check if user exists and is not invalid
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No user found with this email'
            });
        }

        // Check if user is marked as invalid at OTP request time
        if (user.invalidUser === 'yes') {
            return res.status(403).json({
                success: false,
                message: 'This account has been deactivated. Please contact support for assistance.'
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

        // Check if user is marked as invalid
        if (user.invalidUser === 'yes') {
            return res.status(403).json({
                success: false,
                message: 'This account has been deactivated. Please contact support for assistance.'
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

// Update user with Cloudinary image upload support
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const file = req.file;
        // Avoid directly trusting req.body for image fields
        const updates = { ...req.body };
        // If no file is provided, ignore any userImage/userImagePublicId coming from body (e.g., base64 previews)
        if (!file) {
            delete updates.userImage;
            delete updates.userImagePublicId;
        }

        // Load existing user for image operations and validation
        const existingUser = await User.findById(id).select('userImage userImagePublicId');
        if (!existingUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // If client requests image removal explicitly (without uploading a new file)
        if (!file && (updates.removeImage === true || updates.removeImage === 'true')) {
            try {
                // Prefer stored public id; fallback to folder/filename from URL
                let publicId = existingUser.userImagePublicId;
                if (!publicId && existingUser.userImage) {
                    const urlParts = existingUser.userImage.split('/');
                    const filename = urlParts[urlParts.length - 1];
                    const nameWithoutExt = filename.split('.')[0];
                    publicId = `userprofile/${nameWithoutExt}`;
                }
                if (publicId) {
                    await cloudinaryServices.cloudinaryImageDelete(publicId);
                }
            } catch (deleteError) {
                console.error('Error deleting profile picture from Cloudinary:', deleteError);
                // Continue; we still clear fields to detach reference
            }

            updates.userImage = '';
            updates.userImagePublicId = '';
        }

        // If there's a file in the request, upload it to Cloudinary
        // Also fetch current user to know previous image public id for safe deletion later
        let previousPublicId = null;
        if (file) {
            if (existingUser && existingUser.userImagePublicId) {
                previousPublicId = existingUser.userImagePublicId;
            } else if (existingUser && existingUser.userImage) {
                // Fallback: infer previous public id with folder
                const urlParts = existingUser.userImage.split('/');
                const filename = urlParts[urlParts.length - 1];
                const nameWithoutExt = filename.split('.')[0];
                previousPublicId = `userprofile/${nameWithoutExt}`;
            }
            try {
                // Upload the new image to Cloudinary
                const uploadResult = await cloudinaryServices.cloudinaryImageUpload(
                    file.buffer,
                    file.originalname,
                    'userprofile',
                    true
                );

                // Add the Cloudinary URL to the updates
                updates.userImage = uploadResult.secure_url;
                updates.userImagePublicId = uploadResult.public_id;
            } catch (uploadError) {
                console.error('Error uploading image to Cloudinary:', uploadError);
                return res.status(500).json({
                    success: false,
                    message: 'Error uploading profile picture',
                    error: uploadError.message
                });
            }
        }

        // If we uploaded a new image and we have a previous one, delete the previous one
        if (file && previousPublicId) {
            try {
                await cloudinaryServices.cloudinaryImageDelete(previousPublicId);
            } catch (deleteError) {
                console.error('Error deleting old profile picture from Cloudinary:', deleteError);
                // Continue with the update even if deletion of old image fails
            }
        }

        // Find and update user
        const user = await User.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password -otp -__v');

        if (!user) {
            // If user not found but we uploaded a new image, clean it up
            if (updates.userImagePublicId) {
                try {
                    await cloudinaryServices.cloudinaryImageDelete(updates.userImagePublicId);
                } catch (cleanupError) {
                    console.error('Error cleaning up uploaded image:', cleanupError);
                }
            }
            
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




// Get user by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const user = await User.findById(id).select('-password -otp -otpExpires -sessions');

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
        console.error('Get user by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving user',
            error: error.message
        });
    }
};

// Get all users with pagination and search
const getAllUsers = async (req, res) => {
    try {
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Search filter
        const search = req.query.search || '';
        const searchQuery = search
            ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { organisation: { $regex: search, $options: 'i' } }
                ]
            }
            : {};

        // Get users with pagination and search
        const [users, total] = await Promise.all([
            User.find(searchQuery)
                .select('-password -otp -__v -userImagePublicId')
                .lean() // Convert to plain JavaScript objects
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments(searchQuery)
        ]);

        // Transform user data to ensure proper image URLs (Cloudinary URLs left as-is)
        const usersWithImageUrls = users.map(user => {
            // If userImage is already a full URL, use it as is
            if (user.userImage && (user.userImage.startsWith('http') || user.userImage.startsWith('https'))) {
                return user;
            }
            
            // If userImage is a path, construct the full URL
            if (user.userImage) {
                // Ensure the path starts with a slash
                const imagePath = user.userImage.startsWith('/') ? user.userImage : `/${user.userImage}`;
                return {
                    ...user,
                    userImage: `${process.env.BASE_URL || 'http://localhost:5000'}${imagePath}`
                };
            }
            
            // If no userImage, return as is
            return user;
        });

        res.status(200).json({
            success: true,
            count: usersWithImageUrls.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: usersWithImageUrls
        });

    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving users',
            error: error.message
        });
    }
};

// Delete user by ID
// Delete user's image from Cloudinary and update user record
const deleteUserImage = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if ID is provided
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Find the user
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user has an image
        if (!user.userImage) {
            return res.status(400).json({
                success: false,
                message: 'User does not have an image to delete'
            });
        }

        // Store the image URL before deletion
        const oldImageUrl = user.userImage;

        try {
            // Prefer stored public id; fallback to parsing from URL and include folder
            let publicId = user.userImagePublicId;
            if (!publicId && oldImageUrl) {
                const urlParts = oldImageUrl.split('/');
                const filename = urlParts[urlParts.length - 1];
                const nameWithoutExt = filename.split('.')[0];
                publicId = `userprofile/${nameWithoutExt}`;
            }
            // Delete the image from Cloudinary when publicId available
            if (publicId) {
                await cloudinaryServices.cloudinaryImageDelete(publicId);
            }
            
            // Remove the image reference from the user document
            user.userImage = '';
            user.userImagePublicId = '';
            await user.save();

            res.status(200).json({
                success: true,
                message: 'User image deleted successfully',
                userId: id
            });
            
        } catch (cloudinaryError) {
            console.error('Error deleting image from Cloudinary:', cloudinaryError);
            return res.status(500).json({
                success: false,
                message: 'Error deleting image from Cloudinary',
                error: cloudinaryError.message
            });
        }

    } catch (error) {
        console.error('Delete user image error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting user image',
            error: error.message
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if ID is provided
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Find the user first to get the image URL
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Delete user image from Cloudinary if it exists
        if (user.userImage) {
            try {
                // Extract public ID from the image URL
                const publicId = user.userImage.split('/').pop().split('.')[0];
                
                // Delete the image from Cloudinary
                await cloudinaryServices.cloudinaryImageDelete(publicId);
            } catch (cloudinaryError) {
                console.error('Error deleting image from Cloudinary:', cloudinaryError);
                // Continue with user deletion even if image deletion fails
            }
        }

        // Delete the user from the database
        await User.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'User and associated image deleted successfully',
            userId: id
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting user',
            error: error.message
        });
    }
};

// Define all controller methods first
const userController = {
    upload,
    validate,
    requestOTP,
    verifyOTPAndRegister,
    requestLoginOTP,
    verifyLoginOTP,
    login,
    logout,
    updateUser,
    getUserById,
    getAllUsers,
    deleteUser,
    deleteUserImage
};

module.exports = userController;
