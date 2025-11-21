const mongoose = require("mongoose");
const slugify = require("slugify");

// Custom validator to ensure at least one color is selected
function arrayLimit(val) {
  return val && val.length > 0;
}

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
      unique: false,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
    image3: {
      type: String,
      required: false,
    },
    image1: {
      type: String,
      required: false,
    },
    image2: {
      type: String,
      required: false,
    },
    video: {
      type: String,
      required: false,
    },
    videoThumbnail: {
      type: String,
      required: false,
    },
    altimg1: {
      type: String,
      required: false,
      trim: true,
    },
    altimg2: {
      type: String,
      required: false,
      trim: true,
    },
    altimg3: {
      type: String,
      required: false,
      trim: true,
    },
    altvideo: {
      type: String,
      required: false,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: false,
    },
    substructure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Substructure",
      required: false,
    },
    content: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Content",
      required: false,
    },
    design: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Design",
      required: false,
    },
    subfinish: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subfinish",
      required: false,
    },
    subsuitable: {
      type: [String],
      required: false,
      default: [],
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: false,
    },
    groupcode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Groupcode",
      required: false,
    },
    color: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Color",
        },
      ],
      required: false,
      default: [],
    },
    motif: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Motif",
      required: false,
    },
    um: {
      type: String,
      required: false,
    },
    currency: {
      type: String,
      required: false,
    },
    gsm: {
      type: Number,
      required: false,
    },
    oz: {
      type: Number,
      required: false,
    },
    cm: {
      type: Number,
      required: false,
    },
    inch: {
      type: Number,
      required: false,
    },
    // removed `quantity` and `productdescription` as requested
    purchasePrice: {
      type: Number,
      required: false,
    },
    salesPrice: {
      type: Number,
      required: false,
    },
    vendorFabricCode: {
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
    productTitle: {
      type: String,
      required: false,
    },
    productTagline: {
      type: String,
      required: false,
    },
    shortProductDescription: {
      type: String,
      required: false,
    },
    fullProductDescription: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

// 🚀 ULTRA-FAST INDEXING for maximum performance
// name index is automatically created by unique: true
productSchema.index({ category: 1 });
productSchema.index({ substructure: 1 });
productSchema.index({ content: 1 });
productSchema.index({ design: 1 });
productSchema.index({ subfinish: 1 });
productSchema.index({ subsuitable: 1 });
productSchema.index({ vendor: 1 });
productSchema.index({ groupcode: 1 });
productSchema.index({ color: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ updatedAt: -1 });
// quantity index removed because field was removed

// Handle slug and name validation before saving
productSchema.pre("save", async function (next) {
  try {
    // Convert name to lowercase for case-insensitive comparison if it exists
    if (this.name && this.isModified("name")) {
      this.name = this.name.toString().trim();

      // Check if name already exists (case-insensitive)
      const existingName = await this.constructor.findOne({
        name: { $regex: new RegExp(`^${this.name}$`, "i") },
        _id: { $ne: this._id }, // Exclude current document when updating
      });

      if (existingName) {
        const error = new Error("Product name already exists");
        error.name = "ValidationError";
        return next(error);
      }
    }

    // Clean and process the slug if provided
    if (this.slug) {
      // Remove all special characters and keep only alphanumeric and hyphens
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
    // Generate slug from name if no slug provided and name exists
    else if (this.name) {
      let slug = this.name
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
    // If no name or slug, generate a random slug
    else if (!this.slug) {
      this.slug = "product-" + Math.random().toString(36).substr(2, 9);
    }

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Product", productSchema);
