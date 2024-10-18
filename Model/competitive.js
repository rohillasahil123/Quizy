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
  combineId: [CompetitiveSchema],
  maxParticipants: { type: Number, required: true },  // Maximum participants allowed
  amount: { type: Number, required: true },  // Game amount
  winningAmount: { type: Number, required: true } , // Winning amount, double the game amount
  isFull: { type: Boolean, default: false }
});

module.exports = mongoose.model('Competitive_Contest', CompetitiveContestSchema);
