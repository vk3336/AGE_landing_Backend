const mongoose = require('mongoose');

const CityDetailSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  country: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CountryDetail',
    required: true,
  },
  state: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StateDetail',
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('CityDetail', CityDetailSchema);
