const mongoose = require('mongoose');
const Wallet = require('./Wallet');
const LeaderboardSchema = new mongoose.Schema({
        combineId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Weekly',
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
        },
        isValid: { type: Boolean, default: false },
    })
module.exports = mongoose.model('leaderboard', LeaderboardSchema);
