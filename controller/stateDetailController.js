const StateDetail = require("../model/StateDetail");

// Create a new state
exports.createState = async (req, res) => {
  try {
    const state = new StateDetail(req.body);
    await state.save();
    res.status(201).json(state);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all states
exports.getStates = async (req, res) => {
  try {
    const states = await StateDetail.find().populate("country");
    res.status(200).json(states);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a state by ID
exports.getStateById = async (req, res) => {
  try {
    const state = await StateDetail.findById(req.params.id).populate("country");
    if (!state) return res.status(404).json({ error: "State not found" });
    res.status(200).json(state);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a state
exports.updateState = async (req, res) => {
  try {
    const state = await StateDetail.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!state) return res.status(404).json({ error: "State not found" });
    res.status(200).json(state);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a state
exports.deleteState = async (req, res) => {
  try {
    const state = await StateDetail.findByIdAndDelete(req.params.id);
    if (!state) return res.status(404).json({ error: "State not found" });
    res.status(200).json({ message: "State deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
