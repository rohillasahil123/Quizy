const mongoose = require('mongoose');

const MegaLeaderboardSchema = new mongoose.Schema({
    combineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'monthlyContest', 
        required: true
    },
    score: {
        type: Number,
        default: 0
    },
    completionTime: {
        type: Number,
        default: 0
    },
    combineuser: {
        type: String,
        required: true
    },
    Wallet: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('MegaLeaderboard', MegaLeaderboardSchema);
