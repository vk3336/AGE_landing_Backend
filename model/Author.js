const mongoose = require("mongoose");

const authorschema = new mongoose.Schema({
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  designation: {
    type: String,
  },
  authorimage: {
    type: String,
    required: false,
  },
  altimage:{
    type:String,
  },
});

module.exports = mongoose.model("author", authorschema);
