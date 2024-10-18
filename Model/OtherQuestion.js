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
    }
})

otherQuestionSchema.plugin(AutoIncrement, {inc_field: 'number'});
module.exports = mongoose.model("Gk_Question" , otherQuestionSchema);