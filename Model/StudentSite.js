const mongoose = require('mongoose');

const studentSiteSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    school: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    Gmail: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    role: {
        type: String,
        required: true,
        enum: ['student', 'teacher', 'admin'], 
        default: 'student'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const StudentSite = mongoose.model('StudentSite', studentSiteSchema);

module.exports = StudentSite;