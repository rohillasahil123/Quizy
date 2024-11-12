const mongoose = require('mongoose');

const MonthlyLeaderboardSchema = new mongoose.Schema({
    combineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'monthlyContest', 
        required: true
    },
    score: {
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

module.exports = mongoose.model('MonthlyLeaderboard', MonthlyLeaderboardSchema);
