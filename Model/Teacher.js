const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
    name: {
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
    class: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CompanyUser',
        required: true
    },
    otp: { type: String },
    tokenExpiration: { type: Date },
    resetToken: { type: String },
});

module.exports = mongoose.model('Teacher', TeacherSchema);
