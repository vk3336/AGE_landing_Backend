const mongoose = require('mongoose');

const aboutUsSchema = new mongoose.Schema({
    description1: {
        type: String,
        required: true,
        trim: true
    },
    description2: {
        type: String,
        required: true,
        trim: true
    },
    description3: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

const AboutUs = mongoose.model('AboutUs', aboutUsSchema);

module.exports = AboutUs;
