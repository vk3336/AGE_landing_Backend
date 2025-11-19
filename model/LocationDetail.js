const mongoose = require("mongoose");

const LocationDetailSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  country: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Country",
    required: true,
  },
  state: { type: mongoose.Schema.Types.ObjectId, ref: "State", required: true },
  city: { type: mongoose.Schema.Types.ObjectId, ref: "City", required: true },
  pincode: { type: String, required: true },
  longitude: { type: Number },
  latitude: { type: Number },
});

module.exports = mongoose.model("LocationDetail", LocationDetailSchema);
