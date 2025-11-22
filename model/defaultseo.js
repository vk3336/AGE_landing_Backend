const mongoose = require("mongoose");

const defaultseoschema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "draft",
  },

  robots: {
    type: String,
    default: "index, follow",
    trim: true,
  },

  charset: {
    type: String,
    default: "UTF-8",
    trim: true,
  },

  xUaCompatible: {
    type: String,
    default: "IE=edge",
    trim: true,
  },

  viewport: {
    type: String,
    default: "width=device-width, initial-scale=1.0",
    trim: true,
  },

  googleSiteVerification: {
    type: String,
    trim: true,
  },

  microsofttoken: {
    type: String,
    required: true,
  },

  gaId: {
    type: String,
    required: true,
  },
  clarityId: {
    type: String,
    required: true,
  },

  mobileWebAppCapable: {
    type: String,
    trim: true,
  },
  appleStatusBarStyle: {
    type: String,
    trim: true,
  },
  formatDetection: {
    type: String,
    trim: true,
  },

  twittersite: {
    type: String,
  },

  ogsitename: {
    type: String,
  },

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

  LogoJsonLdcontext: {
    type: String,
    trim: true,
  },
  LogoJsonLdtype: {
    type: String,
    trim: true,
  },
  logoJsonLdurl: {
    type: String,
    trim: true,
  },
  logoJsonLdwidth: {
    type: String,
    trim: true,
  },
  logoJsonLdheight: {
    type: String,
    trim: true,
  },
});

module.exports = mongoose.model("DefaultSeo", defaultseoschema);
