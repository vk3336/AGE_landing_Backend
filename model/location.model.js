const mongoose = require('mongoose');
const slugify = require('slugify');

const locationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Location name is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    slug: {
        type: String,
        unique: true,
        trim: true
    },
    pincode: {
        type: String,
        trim: true
    },
    country: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Country'
    },
    state: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State'
    },
    city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City'
    },
    timezone: {
        type: String,
        trim: true,
        default: 'Asia/Kolkata' // Default to Indian timezone
    },
    language: {
        type: String,
        trim: true,
        default: 'en' // Default to English
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Handle slug and name validation before saving
locationSchema.pre('save', async function(next) {
    try {
        // Convert name to lowercase for case-insensitive comparison
        if (this.isModified('name')) {
            this.name = this.name.toLowerCase();
            
            // Check if name already exists (case-insensitive) within the same city
            const existingName = await this.constructor.findOne({ 
                name: this.name,
                city: this.city, // Check within the same city
                _id: { $ne: this._id } // Exclude current document when updating
            });
            
            if (existingName) {
                const error = new Error('Location name already exists in this city');
                error.name = 'ValidationError';
                return next(error);
            }
        }
        
        // Clean and process the slug
        if (this.slug) {
            // Remove all special characters and keep only alphanumeric and hyphens
            this.slug = this.slug
                .toString()
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '') // Remove all non-alphanumeric except spaces and hyphens
                .replace(/\s+/g, '-')         // Replace spaces with -
                .replace(/-+/g, '-')          // Replace multiple - with single -
                .replace(/^-+/, '')           // Trim - from start of text
                .replace(/-+$/, '');          // Trim - from end of text
        } 
        // Only generate slug if it's not provided and name is modified
        else if (this.isModified('name')) {
            let slug = this.name
                .toString()
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-+/, '')
                .replace(/-+$/, '');
            
            let count = 1;
            let baseSlug = slug;
            
            // Check if slug already exists and make it unique if needed
            while (true) {
                const existingSlug = await this.constructor.findOne({ 
                    slug,
                    _id: { $ne: this._id } // Exclude current document when updating
                });
                if (!existingSlug) break;
                slug = `${baseSlug}-${count++}`; // Add counter to make it unique
            }
            
            this.slug = slug;
        }
        next();
    } catch (error) {
        next(error);
    }
});

// Compound index to ensure location names are unique within a city
locationSchema.index({ name: 1, city: 1 }, { unique: true });

// Add pre-find hook to populate references
locationSchema.pre(/^find/, function(next) {
    this.populate([
        {
            path: 'country',
            select: 'name code'
        },
        {
            path: 'state',
            select: 'name code'
        },
        {
            path: 'city',
            select: 'name pincode'
        }
    ]);
    next();
});

const Location = mongoose.model('Location', locationSchema);
module.exports = Location;
