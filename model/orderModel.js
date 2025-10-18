const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    streetAddress: {
        type: String,
        required: false
    },
    city: {
        type: String,
        required: false
    },
    postcode: {
        type: String,
        required: false
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    shippingInstructions: {
        type: String,
        required: false
    },
    total: {
        type: Number,
        required: true
    },
    payment: {
        type: String,
        required: true,
        enum: ['cod', 'online', 'wallet', 'card', 'upi'],
        default: 'cod'
    },
    discount: {
        type: Number,
        default: 0
    },
    shipping: {
        type: String,
        required: true,
        enum: ['standard', 'express', 'overnight'],
        default: 'standard'
    },
    shippingCost: {
        type: Number,
        required: true,
        default: 0
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    }],
    quantity: [{
        type: Number,
        required: true
    }],
    price: [{
        type: Number,
        required: true
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
