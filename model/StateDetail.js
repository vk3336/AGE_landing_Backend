const mongoose = require("mongoose");

const stateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CountryDetail",
      required: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    longitude: {
      type: Number,
      required: false,
    },
    latitude: {
      type: Number,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StateDetail", stateSchema);
