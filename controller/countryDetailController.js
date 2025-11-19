const CountryDetail = require("../model/CountryDetail");

// Create country
const createCountry = async (req, res) => {
  try {
    const { name, slug, code, longitude, latitude } = req.body;
    const countryDetail = new CountryDetail({ name, slug, code, longitude, latitude });
    await countryDetail.save();
    res.status(201).json({ success: true, data: countryDetail });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all countries
const getAllCountries = async (req, res) => {
  try {
    const countries = await CountryDetail.find();
    res.status(200).json({ success: true, data: countries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get country by ID
const getCountryById = async (req, res) => {
  try {
    const country = await CountryDetail.findById(req.params.id);
    if (!country) {
      return res.status(404).json({ success: false, message: "Country not found" });
    }
    res.status(200).json({ success: true, data: country });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update country
const updateCountry = async (req, res) => {
  try {
    const { name, slug, code, longitude, latitude } = req.body;
    const country = await CountryDetail.findByIdAndUpdate(
      req.params.id,
      { name, slug, code, longitude, latitude },
      { new: true }
    );
    if (!country) {
      return res.status(404).json({ success: false, message: "Country not found" });
    }
    res.status(200).json({ success: true, data: country });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete country
const deleteCountry = async (req, res) => {
  try {
    const country = await CountryDetail.findByIdAndDelete(req.params.id);
    if (!country) {
      return res.status(404).json({ success: false, message: "Country not found" });
    }
    res.status(200).json({ success: true, message: "Country deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createCountry,
  getAllCountries,
  getCountryById,
  updateCountry,
  deleteCountry,
};
