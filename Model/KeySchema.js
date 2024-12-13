const mongoose = require('mongoose');

const contestKeySchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    prizePoll: { type: Number, required: true }, 
    joinAmount: { type: Number, required: true },
    participants: [{
        combineId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        fullname: { type: String },
    }],
    createdAt: { type: Date, default: Date.now, index: { expires: '5m' } },
});

module.exports = mongoose.model('KeyContest', contestKeySchema);
