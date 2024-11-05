const mongoose = require("mongoose");

const practeicQuestionSchema = new mongoose.Schema({
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
        unique: true
    }
});
practeicQuestionSchema.pre('save', async function (next) {
    const doc = this;
    if (doc.isNew) {
        try {
            const lastQuestion = await mongoose.model('practice_Question').findOne().sort({ number: -1 });
            doc.number = lastQuestion ? lastQuestion.number + 1 : 1;
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next(); 
    }
});

module.exports = mongoose.model("practice_Question", practeicQuestionSchema);
