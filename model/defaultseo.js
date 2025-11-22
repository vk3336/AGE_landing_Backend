const mongoose = require("mongoose");

const defaultseoschema = new mongoose.Schema({
  // local bussiness seo
  localbussinessjsonldtype: {
    type: String,
  },
  localbussinessjsonldcontext: {
    type: String,
  },
  localbussinessjsonldname: {
    type: String,
  },
  localbussinessjsonldtelephone: {
    type: String,
  },
  localbussinessjsonldareaserved: {
    type: String,
  },

  localbussinessjsonldaddresstype: {
    type: String,
  },
  localbussinessjsonldaddressstreetaddress: {
    type: String,
  },
  localbussinessjsonldaddressaddresslocality: {
    type: String,
  },
  localbussinessjsonldaddressaddressregion: {
    type: String,
  },
  localbussinessjsonldaddresspostalcode: {
    type: String,
  },
  localbussinessjsonldaddressaddresscountry: {
    type: String,
  },

  localbussinessjsonldgeotype: {
    type: String,
  },
  localbussinessjsonldgeolatitude: {
    type: Number,
  },
  localbussinessjsonldgeolongitude: {
    type: Number,
  },

  // logo json

  
});

module.exports = mongoose.model("DefaultSeo", defaultseoschema);
