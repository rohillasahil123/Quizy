const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  combineId: { type: mongoose.Schema.Types.ObjectId },
  isCompleted: { type: Boolean, default: false },
  score: { type: Number, default: 0 },
  completionTime: { type: Number, default: 0 },
  combineuser: { type: String },
});


const contestTeacherSchema = new mongoose.Schema({
  participants: [participantSchema],  
  key: { type: String, required: true },
  amount: { type: Number, required: true }, 
  winningAmount: { type: Number, required: true } ,
  isValid: { type: Boolean, default: false },
  startTime: { type: String, required: true }, 
  duration: { type: Number, required: true },
  schoolName: { type: String, required: true },
  class: { type: String, required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "TeacherQuestion" }]
});

module.exports = mongoose.model('TeacherContest', contestTeacherSchema);