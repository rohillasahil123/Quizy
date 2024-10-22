const mongoose = require('mongoose');

const contestSchoolSchema = new mongoose.Schema({
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
            score: {
                type: Number,
                default: 0
            }
        }
    ],
    maxParticipants: {
        type: Number,
        default: 100000
    }
});

module.exports = mongoose.model('SchoolContest', contestSchoolSchema);
