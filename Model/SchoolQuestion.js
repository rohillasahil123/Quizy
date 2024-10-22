const mongoose = require("mongoose")
const QuestionSchema = new mongoose.Schema({
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
    classvalue: {
        type: String,
        required: true,
    }

})
module.exports = mongoose.model("SchoolQuestion", QuestionSchema)