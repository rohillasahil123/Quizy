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
    default: 0,
},
});


const contestTeacherSchema = new mongoose.Schema({
  combineId: [participantSchema],  
  key: { type: String, required: true },
  // maxParticipants: { type: Number, required: true }, 
  amount: { type: Number, required: true }, 
  winningAmount: { type: Number, required: true } ,
  isValid: { type: Boolean, default: false },
  startTime: { type: Date, required: true }, 
  duration: { type: Number, required: true },
  schoolName: { type: String, required: true },
  class: { type: String, required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "TeacherQuestion" }]
});

module.exports = mongoose.model('TeacherContest', contestTeacherSchema);