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
    companytaxid: {
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

// Simple password comparison (for testing only)
userSchema.methods.comparePassword = function(candidatePassword) {
    if (!this.password) return false;
    return this.password === candidatePassword;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
