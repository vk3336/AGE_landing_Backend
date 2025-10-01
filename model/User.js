const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [false, 'Name is required']
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        sparse: true,
        validate: {
            validator: validator.isEmail,
            message: 'Please provide a valid email'
        }
    },
    password: {
        type: String,
        required: false,
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false
    },
    otp: {
        type: String,
        select: false
    },
    organisation: {
        type: String,
        trim: true,
        required: false
    },
    phone: {
        type: String,
        trim: true,
        required: false
    },
    address: {
        type: String,
        trim: true,
        required: false
    },
    userImage: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        trim: true,
        required: false
    },
    state: {
        type: String,
        trim: true,
        required: false
    },
    country: {
        type: String,
        trim: true,
        required: false
    },
    pincode: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    // If user doesn't have a password (password-less auth), return false
    if (!this.password) {
        return false;
    }
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
