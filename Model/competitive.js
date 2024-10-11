const mongoose = require('mongoose');

const CompetitiveSchema = new mongoose.Schema({
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

const CompetitiveContestSchema = new mongoose.Schema({
  combineId: [CompetitiveSchema]
});

module.exports = mongoose.model('Competitive_Contest', CompetitiveContestSchema);
