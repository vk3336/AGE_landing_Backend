const mongoose = require("mongoose");

const groupcodeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    img: {
      type: String,
      required: false,
    },
    altimg: {
      type: String,
      required: false,
      trim: true,
    },
    video: {
      type: String,
      required: false,
    },
    altvideo: {
      type: String,
      required: false,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Groupcode", groupcodeSchema);
