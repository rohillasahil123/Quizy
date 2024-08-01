const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    tournamentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournament',
        required: true
    },
    players: [{
        type: String,
        ref: 'SignUp'
    }],
    status: {
        type: String,
        enum: ['waiting', 'in_progress', 'completed'],
        default: 'waiting'
    },
 
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Game', gameSchema);
