const mongoose = require('mongoose');
const Wallet = require('./Wallet');
const LeaderboardSchema = new mongoose.Schema({
    combineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OtherData',
        required: true
    },
    score: {
        type: Number,
        default: 0
    },
    combineuser :{
        type: String,
        ref:'OtherData',
        required:true
    },
    Wallet:{
        default :0 ,
        type:Number,
        ref:'Wallet'
    }
});
module.exports = mongoose.model('leaderboard', LeaderboardSchema);
