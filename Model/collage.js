const mongoose = require('mongoose');

const CollageSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  fullname: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    default: 0
  },
});

const CollageContestSchema = new mongoose.Schema({
  combineId: [CollageSchema]
});

module.exports = mongoose.model('Collage_Contest', CollageContestSchema);
