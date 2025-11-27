const mongoose = require("mongoose");

const staticSeoSchema = new mongoose.Schema(
  {
    // Basic Identification
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    slug: {
      type: String,
      required: false,
      trim: true,
      unique: true,
      sparse: true
    },
    
    // Standard SEO Meta Tags
    meta_title: {
      type: String,
      trim: true
    },
    meta_description: {
      type: String,
      trim: true
    },
    keywords: {
      type: String,
      trim: true
    },
    
    canonical_url: {
      type: String,
      trim: true
    },
    excerpt: {
      type: String,
      trim: true
    },
    description_html: {
      type: String,
      trim: true
    },

    // HTML Meta Configuration
   
  
    contentLanguage: {
      type: String,
      default: 'en',
      trim: true
    },
    
    
   
   

    // Open Graph Meta Tags
    ogLocale: {
      type: String,
      trim: true
    },
    og_twitter_Title: {
      type: String,
      trim: true
    },
    og_twitter_Description: {
      type: String,
      trim: true
    },
    ogType: {
      type: String,
      trim: true,
      default: 'website'
    },
   
   
    openGraph: {
      images: [{
        type: String,
        trim: true
      }],
      video: {
        url: { type: String, trim: true },
        secure_url: { type: String, trim: true },
        type: { type: String, trim: true },
        width: { type: Number },
        height: { type: Number },
      },
    },

    // Twitter Meta Tags
    twitterCard: {
      type: String,
      trim: true
    },
    
   
    twitter: {
      image: { type: String, trim: true },
      player: { type: String, trim: true },
      player_width: { type: Number },
      player_height: { type: Number },
    },

   

    // JSON-LD Structured Data
    VideoJsonLd: {
      type: String,
      trim: true
    },
    videourl:{
      type: String,
    },
    videoalt:{
      type:String
    },
    // Status
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },

    // Product References
    producttag: {
      type: [String],
      default: [],
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for status field
staticSeoSchema.index({ status: 1 });

// Pre-save hook to generate slug from name if not provided
staticSeoSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model("topicpage", staticSeoSchema);
