const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  states: {
    type: [String],
    default: [],
  },
  districts: {
    type: [String],
    default: [],
  },
  cities: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model('Location', locationSchema);
