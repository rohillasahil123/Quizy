const mongoose = require('mongoose');

const AppDetailSchema = new mongoose.Schema({
    appVersion: {
        type: Number,
        required: true,
        default: 1.0
    }
});

module.exports = mongoose.model('AppDetail', AppDetailSchema);
