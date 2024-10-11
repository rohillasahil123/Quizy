const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
    combineId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fullname: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    Score:{type:Number , default:0 }
});

const practicecontest = mongoose.model('Practice_Contest', contestSchema);

module.exports = practicecontest;
