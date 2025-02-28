const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  combineId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["credit", "debit"],
    required: true,
  },
  status: {
    type: String,
    enum: ["completed", "pending", "failed"],
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Transaction", transactionSchema);
