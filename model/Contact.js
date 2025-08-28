const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    companyName: {
        type: String,
        trim: true
    },
    contactPerson: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    businessType: {
        type: String,
        trim: true
    },
    annualFabricVolume: {
        type: String,
        trim: true
    },
    primaryMarkets: {
        type: String,
        trim: true
    },
    fabricTypesOfInterest: [{
        type: String,
        trim: true
    }],
    specificationsRequirements: {
        type: String,
        trim: true
    },
    timeline: {
        type: String,
        trim: true
    },
    additionalMessage: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Contact', contactSchema);
