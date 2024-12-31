const mongoose = require('mongoose');

const studentLeaderboardSchema = new mongoose.Schema({
    combineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student_Contest',
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

module.exports = mongoose.model('StudentLeaderboard', studentLeaderboardSchema);
