const mongoose = require("mongoose");

const aboutUsSchema = new mongoose.Schema(
  {
    descriptionsmall: {
      type: String,
      required: true,
      trim: true,
    },
    descriptionmedium: {
      type: String,
      required: true,
      trim: true,
    },
    descriptionlarger: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const AboutUs = mongoose.model("AboutUs", aboutUsSchema);

module.exports = AboutUs;
