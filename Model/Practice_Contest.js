const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
    combineId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const practicecontest = mongoose.model('Practice_Contest', contestSchema);

module.exports = practicecontest;
