const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
    schoolName: {
        type: String,
        required: true
    },
    participants: [
        {
            combineId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            fullname: {
                type: String,
                required: true
            },
            joinedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    endingTime: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('Contest', contestSchema);
