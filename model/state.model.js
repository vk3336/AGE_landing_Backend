const mongoose = require('mongoose');
const slugify = require('slugify');

const stateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'State name is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    slug: {
        type: String,
        unique: true,
        trim: true
    },
    code: {
        type: String,
        trim: true,
        uppercase: true
    },
    country: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Country'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Handle slug and name validation before saving
stateSchema.pre('save', async function(next) {
    try {
        // Convert name to lowercase for case-insensitive comparison
        if (this.isModified('name')) {
            this.name = this.name.toLowerCase();
            
            // Check if name already exists (case-insensitive)
            const existingName = await this.constructor.findOne({ 
                name: this.name,
                country: this.country, // Also check within the same country
                _id: { $ne: this._id } // Exclude current document when updating
            });
            
            if (existingName) {
                const error = new Error('State name already exists in this country');
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

// Compound index to ensure state names are unique within a country
stateSchema.index({ name: 1, country: 1 }, { unique: true });

// Virtual for cities
stateSchema.virtual('cities', {
    ref: 'City',
    foreignField: 'state',
    localField: '_id'
});

const State = mongoose.model('State', stateSchema);
module.exports = State;
