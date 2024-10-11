const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
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

const StudentContestSchema = new mongoose.Schema({
  combineId: [StudentSchema]
});

module.exports = mongoose.model('Student_Contest', StudentContestSchema);
