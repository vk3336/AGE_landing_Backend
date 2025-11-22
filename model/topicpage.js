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
    title: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    keywords: {
      type: String,
      trim: true
    },
    robots: {
      type: String,
      trim: true,
      default: 'index, follow'
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
    charset: {
      type: String,
      default: 'UTF-8',
      trim: true
    },
    xUaCompatible: {
      type: String,
      default: 'IE=edge',
      trim: true
    },
    viewport: {
      type: String,
      default: 'width=device-width, initial-scale=1.0',
      trim: true
    },
    contentLanguage: {
      type: String,
      default: 'en',
      trim: true
    },
    googleSiteVerification: {
      type: String,
      trim: true
    },
    msValidate: {
      type: String,
      trim: true
    },
    themeColor: {
      type: String,
      trim: true
    },
    mobileWebAppCapable: {
      type: String,
      trim: true
    },
    appleStatusBarStyle: {
      type: String,
      trim: true
    },
    formatDetection: {
      type: String,
      trim: true
    },
    author_name: {
      type: String,
      trim: true
    },

    // Open Graph Meta Tags
    ogLocale: {
      type: String,
      trim: true
    },
    ogTitle: {
      type: String,
      trim: true
    },
    ogDescription: {
      type: String,
      trim: true
    },
    ogType: {
      type: String,
      trim: true,
      default: 'website'
    },
    ogSiteName: {
      type: String,
      trim: true
    },
    ogUrl: {
      type: String,
      trim: true
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
    twitterSite: {
      type: String,
      trim: true
    },
    twitterTitle: {
      type: String,
      trim: true
    },
    twitterDescription: {
      type: String,
      trim: true
    },
    twitter: {
      image: { type: String, trim: true },
      player: { type: String, trim: true },
      player_width: { type: Number },
      player_height: { type: Number },
    },

    // Hreflang / i18n
    hreflang: {
      type: String,
      trim: true
    },
    x_default: {
      type: String,
      trim: true
    },

    // JSON-LD Structured Data
    VideoJsonLd: {
      type: String,
      trim: true
    },
    LogoJsonLd: {
      type: String,
      trim: true
    },
    LogoJsonLdcontext: { 
      type: String, 
      trim: true 
    },
    LogoJsonLdtype: { 
      type: String, 
      trim: true 
    },
    logoJsonLdurl: { 
      type: String, 
      trim: true 
    },
    logoJsonLdwidth: { 
      type: String, 
      trim: true 
    },
    logoJsonLdheight: { 
      type: String, 
      trim: true 
    },
    BreadcrumbJsonLd: {
      type: String,
      trim: true
    },
    LocalBusinessJsonLd: {
      type: String,
      trim: true
    },

    // Status
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
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
