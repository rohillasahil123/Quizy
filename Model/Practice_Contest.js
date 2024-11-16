const { default: mongoose } = require("mongoose");

const contestSchema = new mongoose.Schema({
    combineId: { type:mongoose.Schema.Types.ObjectId , ref: "User", required: true }, // single ObjectId
    fullname: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    Score: { type: Number, default: 0 },
});

 module.exports = mongoose.model("Practice_Contest", contestSchema);