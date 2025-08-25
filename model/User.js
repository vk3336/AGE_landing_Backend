const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        sparse: true
    },
    password: {
        type: String
    },
    otp: {
        type: String
    },
    organisation: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    state: {
        type: String,
        trim: true
    },
    country: {
        type: String,
        trim: true
    },
    pincode: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Simple password comparison
userSchema.methods.comparePassword = function(candidatePassword) {
    return this.password === candidatePassword;
};

module.exports = mongoose.model('User', userSchema);
