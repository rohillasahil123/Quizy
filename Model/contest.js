const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
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
    default: 0,
  },
  
});

const contestSchema = new mongoose.Schema({
  combineId: [participantSchema]
});

module.exports = mongoose.model('Contest', contestSchema);
