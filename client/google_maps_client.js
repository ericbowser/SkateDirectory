require('dotenv').config();

const googleMapsClient = require('@google/maps').createClient({
  key: process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_JS_KEY,
});

module.exports = googleMapsClient;
