const defaultseo = require("../model/defaultseo");

exports.createdefaultseo = async (req, res) => {
  try {
    const defaultseo23 = new defaultseo(req.body);
    await defaultseo23.save();
    res.status(201).json({ message: "default seo created", defaultseo23 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatedefaultseo = async (req, res) => {
  try {
    const defaultseo23 = await defaultseo.findByIdAndUpdate(
      req.params.id,
      req.body,

      {
        new: true,
      }
    );

    res.json({ message: "default seo updated", defaultseo23 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletedefaultseo = async (req, res) => {
  try {
    await defaultseo.findByIdAndDelete(req.params.id);
    res.json({ message: "default seo deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getdefaultseo = async (req, res) => {
  try {
    const defaultseo23 = await defaultseo.find();
    res.json(defaultseo23);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
