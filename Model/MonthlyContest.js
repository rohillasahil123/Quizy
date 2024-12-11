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
  joinCount: {
    type: Number,
    default: 1,
},
});


const contestSchema = new mongoose.Schema({
  combineId: [participantSchema],  
  maxParticipants: { type: Number, required: true }, 
  amount: { type: Number, required: true }, 
  winningAmount: { type: Number, required: true } ,
  isFull: { type: Boolean, default: false }
});

module.exports = mongoose.model('monthlyContest', contestSchema);
