const mongoose = require("mongoose") ; 

const transactionSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    amount: Number,
    type: String,
    created_at: { type: Date, default: Date.now },
  });

  module.exports = mongoose.model("transaction",transactionSchema);