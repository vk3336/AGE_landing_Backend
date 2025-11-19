const LocationDetail = require('../model/LocationDetail');

// Create a new location detail
exports.createLocationDetail = async (req, res) => {
  try {
    const locationDetail = new LocationDetail(req.body);
    await locationDetail.save();
    res.status(201).json(locationDetail);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all location details
exports.getAllLocationDetails = async (req, res) => {
  try {
    const locations = await LocationDetail.find()
      .populate('country')
      .populate('state')
      .populate('city');
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a location detail by ID
exports.getLocationDetailById = async (req, res) => {
  try {
    const location = await LocationDetail.findById(req.params.id)
      .populate('country')
      .populate('state')
      .populate('city');
    if (!location) return res.status(404).json({ error: 'Not found' });
    res.json(location);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a location detail
exports.updateLocationDetail = async (req, res) => {
  try {
    const location = await LocationDetail.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!location) return res.status(404).json({ error: 'Not found' });
    res.json(location);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a location detail
exports.deleteLocationDetail = async (req, res) => {
  try {
    const location = await LocationDetail.findByIdAndDelete(req.params.id);
    if (!location) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
