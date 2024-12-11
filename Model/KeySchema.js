const mongoose = require('mongoose');

const contestKeySchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    participants: [{
        combineId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        fullname: { type: String },
    }],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('KeyContest', contestKeySchema);