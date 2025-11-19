const CityDetail = require('../model/CityDetail');

// Create a new city
exports.createCity = async (req, res) => {
  try {
    const city = new CityDetail(req.body);
    await city.save();
    res.status(201).json(city);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all cities
exports.getCities = async (req, res) => {
  try {
    const cities = await CityDetail.find().populate('country state');
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single city by ID
exports.getCityById = async (req, res) => {
  try {
    const city = await CityDetail.findById(req.params.id).populate('country state');
    if (!city) return res.status(404).json({ error: 'City not found' });
    res.json(city);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a city by ID
exports.updateCity = async (req, res) => {
  try {
    const city = await CityDetail.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!city) return res.status(404).json({ error: 'City not found' });
    res.json(city);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a city by ID
exports.deleteCity = async (req, res) => {
  try {
    const city = await CityDetail.findByIdAndDelete(req.params.id);
    if (!city) return res.status(404).json({ error: 'City not found' });
    res.json({ message: 'City deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
