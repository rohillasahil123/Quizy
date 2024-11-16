
const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    combineId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Practice_Contest', required: true },
    gkquestionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Practice_Question', required: true },
    selectedOption: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const practiceAnswer = mongoose.model('Practice_Answer', answerSchema);

module.exports = practiceAnswer;
