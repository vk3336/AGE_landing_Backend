const Contact = require("../model/Contact");

// SEARCH CONTACTS BY NAME OR EMAIL
exports.searchContacts = async (req, res, next) => {
  const q = req.params.q || "";
  // Escape regex special characters
  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const safeQ = escapeRegex(q);
  try {
    const results = await Contact.find({
      $or: [
        { name: { $regex: safeQ, $options: "i" } },
        { email: { $regex: safeQ, $options: "i" } },
      ],
    });
    res.status(200).json({ status: 1, data: results });
  } catch (error) {
    next(error);
  }
};

// No validation - all fields are optional
exports.validate = [];

exports.createContact = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    const contactData = req.body;
    console.log("Contact data before save:", contactData);

    const contact = new Contact(contactData);
    console.log("Contact object before save:", contact);

    await contact.save();
    console.log("Contact saved successfully:", contact);

    res.status(201).json({
      success: true,
      message: "Contact created successfully",
      data: contact,
    });
  } catch (error) {
    console.error("Error creating contact:", error);
    res.status(500).json({
      success: false,
      message: "Error creating contact",
      error: error.message,
    });
  }
};

exports.getAllContacts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 1000;
    const page = parseInt(req.query.page) || 1;
    const fields = req.query.fields
      ? req.query.fields.split(",").join(" ")
      : "";
    const skip = (page - 1) * limit;

    const contacts = await Contact.find({}, fields)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching contacts",
      error: error.message,
    });
  }
};

exports.getContactById = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching contact",
      error: error.message,
    });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting contact",
      error: error.message,
    });
  }
};

exports.updateContact = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if contact exists
    const existingContact = await Contact.findById(id);
    if (!existingContact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    // Update with all fields from request body
    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Contact updated successfully",
      data: updatedContact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating contact",
      error: error.message,
    });
  }
};
