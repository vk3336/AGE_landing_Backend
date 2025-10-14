const mongoose = require("mongoose");

const seoSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: false,
    },
    purchasePrice: {
      type: Number,
      required: false,
    },
    salesPrice: {
      type: Number,
      required: false,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: false,
    },
    // Keeping locationCode for backward compatibility
    locationCode: {
      type: String,
      required: false,
      trim: true,
    },
    productIdentifier: {
      type: String,
      required: false,
      trim: true,
    },
    leadtime: {
      type: Number,
      required: false,
    },
    sku: {
      type: String,
      required: false,
      trim: true,
    },
    productdescription: {
      type: String,
      required: false,
      trim: true,
    },
    popularproduct: {
      type: Boolean,
      default: false,
    },
    topratedproduct: {
      type: Boolean,
      default: false,
    },
    landingPageProduct: {
      type: Boolean,
      default: false,
    },
    shopyProduct: {
      type: Boolean,
      default: false,
    },
    slug: {
      type: String,
      required: false,
      trim: true,
      unique: true,
      sparse: true,
    },
    canonical_url: {
      type: String,
      required: false,
      trim: true,
    },
    ogUrl: {
      type: String,
      required: false,
      trim: true,
    },
    excerpt: {
      type: String,
      required: false,
      trim: true,
    },
    description_html: {
      type: String,
      required: false,
    },
    rating_value: {
      type: Number,
      required: false,
      min: 0,
      max: 5,
    },
    rating_count: {
      type: Number,
      required: false,
      min: 0,
    },
    charset: {
      type: String,
      required: false,
      trim: true,
    },
    xUaCompatible: {
      type: String,
      required: false,
      trim: true,
    },
    viewport: {
      type: String,
      required: false,
      trim: true,
    },
    title: {
      type: String,
      required: false,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    productlocationtitle: { type: String },
    productlocationtagline: { type: String },
    productlocationdescription1: { type: String },
    productlocationdescription2: { type: String },

    keywords: {
      type: String,
      required: false,
      trim: true,
    },
    robots: {
      type: String,
      required: false,
      trim: true,
    },
    contentLanguage: {
      type: String,
      required: false,
      trim: true,
    },
    themeColor: {
      type: String,
      required: false,
      trim: true,
    },
    mobileWebAppCapable: {
      type: String,
      required: false,
      trim: true,
    },
    appleStatusBarStyle: {
      type: String,
      required: false,
      trim: true,
    },
    formatDetection: {
      type: String,
      required: false,
      trim: true,
    },
    ogLocale: {
      type: String,
      required: false,
      trim: true,
    },
    ogTitle: {
      type: String,
      required: false,
      trim: true,
    },
    ogDescription: {
      type: String,
      required: false,
      trim: true,
    },
    ogType: {
      type: String,
      required: false,
      trim: true,
    },
    ogSiteName: {
      type: String,
      required: false,
      trim: true,
    },
    twitterCard: {
      type: String,
      required: false,
      trim: true,
    },
    twitterSite: {
      type: String,
      required: false,
      trim: true,
    },
    twitterTitle: {
      type: String,
      required: false,
      trim: true,
    },
    twitterDescription: {
      type: String,
      required: false,
      trim: true,
    },
    hreflang: {
      type: String,
      required: false,
      trim: true,
    },
    author_name: {
      type: String,
      required: false,
      trim: true,
    },
    // --- Open Graph Fields ---
    ogImage: {
      type: String,
      required: false,
      trim: true,
    },
    ogVideoUrl: {
      type: String,
      required: false,
      trim: true,
    },
    ogVideoSecureUrl: {
      type: String,
      required: false,
      trim: true,
    },
    ogVideoType: {
      type: String,
      required: false,
      trim: true,
    },
    ogVideoWidth: {
      type: Number,
      required: false,
    },
    ogVideoHeight: {
      type: Number,
      required: false,
    },

    // --- Twitter Fields ---
    twitterImage: {
      type: String,
      required: false,
      trim: true,
    },
    twitterPlayer: {
      type: String,
      required: false,
      trim: true,
    },
    twitterPlayerWidth: {
      type: Number,
      required: false,
    },
    twitterPlayerHeight: {
      type: Number,
      required: false,
    },
    VideoJsonLd: { type: String, trim: true },

    // LogoJsonLd fields removed

    BreadcrumbJsonLd: { type: String, trim: true },
    BreadcrumbJsonLdtype: { type: String, trim: true },
    BreadcrumbJsonLdcontext: { type: String, trim: true },
    BreadcrumbJsonLdname: { type: String, trim: true },
    BreadcrumbJsonLditemListElement: { type: String, trim: true },
    BreadcrumbJsonLditemListElementtype: { type: String, trim: true },
    BreadcrumbJsonLditemListElementitem: { type: String, trim: true },
    BreadcrumbJsonLditemListElementname: { type: String, trim: true },
    BreadcrumbJsonLditemListElementposition: { type: String, trim: true },
  },
  { timestamps: true }
);

// 🚀 ULTRA-FAST INDEXING for maximum performance
seoSchema.index({ product: 1 });
seoSchema.index({ popularproduct: 1 });
seoSchema.index({ topratedproduct: 1 });
// slug index is automatically created by unique: true
seoSchema.index({ "product.name": 1 });
seoSchema.index({ createdAt: -1 });
seoSchema.index({ rating_value: -1 });
seoSchema.index({ purchasePrice: 1 });
seoSchema.index({ salesPrice: 1 });
seoSchema.index({ sku: 1 });
seoSchema.index({ productIdentifier: 1 });

// Handle slug validation and generation before saving
seoSchema.pre("save", async function (next) {
  try {
    // If slug is provided, clean and validate it
    if (this.slug) {
      // Clean the slug
      this.slug = this.slug
        .toString()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // Remove all non-alphanumeric except spaces and hyphens
        .replace(/\s+/g, "-") // Replace spaces with -
        .replace(/-+/g, "-") // Replace multiple - with single -
        .replace(/^-+/, "") // Trim - from start of text
        .replace(/-+$/, ""); // Trim - from end of text

      // Check if slug already exists
      const existingSlug = await this.constructor.findOne({
        slug: this.slug,
        _id: { $ne: this._id },
      });

      if (existingSlug) {
        // If slug exists, append a counter
        let count = 1;
        let baseSlug = this.slug;
        while (true) {
          const newSlug = `${baseSlug}-${count++}`;
          const slugExists = await this.constructor.findOne({
            slug: newSlug,
            _id: { $ne: this._id },
          });
          if (!slugExists) {
            this.slug = newSlug;
            break;
          }
        }
      }
    }
    // Generate slug from product name if no slug provided and product exists
    else if (this.product) {
      // Populate product name if not already populated
      let productName = this.product;
      if (typeof this.product === "object" && this.product.name) {
        productName = this.product.name;
      } else if (mongoose.Types.ObjectId.isValid(this.product)) {
        const product = await mongoose
          .model("Product")
          .findById(this.product)
          .select("name");
        if (product) productName = product.name;
      }

      if (typeof productName === "string") {
        let slug = productName
          .toString()
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-+/, "")
          .replace(/-+$/, "");

        let count = 1;
        let baseSlug = slug;

        // Check if slug already exists and make it unique if needed
        while (true) {
          const existingSlug = await this.constructor.findOne({
            slug,
            _id: { $ne: this._id },
          });
          if (!existingSlug) break;
          slug = `${baseSlug}-${count++}`; // Add counter to make it unique
        }

        this.slug = slug;
      }
    }
    // If no slug or product, generate a random slug
    else if (!this.slug) {
      this.slug = "seo-" + Math.random().toString(36).substr(2, 9);
    }

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Seo", seoSchema);
