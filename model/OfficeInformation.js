const mongoose = require("mongoose");

const officeInformationSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    companyPhone1: {
      type: String,
      required: true,
    },
    companyPhone2: {
      type: String,
      required: true,
    },
    companyEmail: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /\S+@\S+\.\S+/.test(v);
        },
        message: "Email address must be valid",
      },
    },
    companyAddress: {
      type: String,
      required: true,
    },
    companyLanguages: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "At least one language must be specified",
      },
    },
    companyFoundingDate: {
      type: String,
      required: true,
    },
    microsofttoken: {
      type: String,
      required: true,
    },
    companyEmployeeRange: {
      type: String,
      required: true,
    },
    companyAwards: {
      type: String,
      required: true,
    },
    whatsappNumber: {
      type: String,
      required: true,
    },
    n8nApiKey: {
      type: String,
      required: true,
    },
    n8nAuthHeader: {
      type: String,
      required: true,
    },
    n8nAuthScheme: {
      type: String,
      required: true,
      enum: ["Bearer", "Basic"], // restricting to common auth schemes
    },
    gaId: {
      type: String,
      required: true,
    },
    clarityId: {
      type: String,
      required: true,
    },
    companyLogoUrl: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: "Logo URL must start with http:// or https://",
      },
    },
    facebook: {
      type: String,
      default: "",
      validate: {
        validator: function (v) {
          return v === "" || /^https?:\/\/.+/.test(v);
        },
        message: "Facebook URL must start with http:// or https://",
      },
    },
    instagram: {
      type: String,
      default: "",
      validate: {
        validator: function (v) {
          return v === "" || /^https?:\/\/.+/.test(v);
        },
        message: "Instagram URL must start with http:// or https://",
      },
    },
    youtube: {
      type: String,
      default: "",
      validate: {
        validator: function (v) {
          return v === "" || /^https?:\/\/.+/.test(v);
        },
        message: "YouTube URL must start with http:// or https://",
      },
    },
    linkedin: {
      type: String,
      default: "",
      validate: {
        validator: function (v) {
          return v === "" || /^https?:\/\/.+/.test(v);
        },
        message: "LinkedIn URL must start with http:// or https://",
      },
    },
    twitter: {
      type: String,
      default: "",
      validate: {
        validator: function (v) {
          return v === "" || /^https?:\/\/.+/.test(v);
        },
        message: "Twitter URL must start with http:// or https://",
      },
    },

   
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("OfficeInformation", officeInformationSchema);
