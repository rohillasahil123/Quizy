const mongoose = require('mongoose');

const SchoolSchema = new mongoose.Schema({
    schoolName: {
        type: String,
        required: true,
    },
    principalName: {
        type: String,
        required: true,
    },
    board: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
        required: true,
        unique: true
    },
    city: {
        type: String,
        required: true,
    },
    district: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CompanyUser',
        required: true
    },
    otp: { type: String },
    tokenExpiration: { type: Date },
    resetToken: { type: String },
});

module.exports = mongoose.model('School', SchoolSchema);
