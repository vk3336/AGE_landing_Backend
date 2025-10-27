const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: false
    },
    author: {
        type: String,
        trim: true,
        required: false
    },
    heading: {
        type: String,
        trim: true,
        required: false
    },
    paragraph1: {
        type: String,
        trim: true,
        required: false
    },
    paragraph2: {
        type: String,
        trim: true,
        required: false
    },
    paragraph3: {
        type: String,
        trim: true,
        required: false
    },
    blogimage1: {
        type: String,
        trim: true,
        required: false
    },
    blogimage2: {
        type: String,
        trim: true,
        required: false
    }
}, {
    timestamps: true
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
