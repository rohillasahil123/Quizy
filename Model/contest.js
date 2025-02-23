const mongoose = require('mongoose');

// Participant schema to store participant details
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

// Contest schema including the participant schema
const contestSchema = new mongoose.Schema({
  combineId: [participantSchema],  // Array of participants (id, fullname, score)
  maxParticipants: { type: Number, required: true }, 
  amount: { type: Number, required: true },  // Game amount
  winningAmount: { type: Number, required: true } , // Winning amount, double the game amount
  isFull: { type: Boolean, default: false },
  isValid: { type: Boolean, default: false },
  startTime: { type: Date, required: true }, 
  duration: { type: Number, required: true }
});

module.exports = mongoose.model('Contest', contestSchema);
