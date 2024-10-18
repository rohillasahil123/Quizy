const mongoose = require ("mongoose") ; 
const AutoIncrement = require('mongoose-sequence')(mongoose);

const otherQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },
    correctAnswer: {
        type: String,
        required: true,
        trim: true
    },
    options: {
        type: [String],
        required: true
    },
    number: {
        type: Number,
        required: true,
        unique:true
    }
})

module.exports = mongoose.model("Gk_Question" , otherQuestionSchema);