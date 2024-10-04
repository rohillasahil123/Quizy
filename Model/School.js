const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
    schoolName: { type: String, required: true },
    participants: { type: [String], default: [] },
});

module.exports  = mongoose.model('SchoolContest', contestSchema);


