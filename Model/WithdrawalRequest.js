const mongoose = require('mongoose');

const WithdrawalRequestSchema = new mongoose.Schema({
  userId: {type: mongoose.Schema.Types.ObjectId, required: true},
  transactionId: {type: mongoose.Schema.Types.ObjectId, required: true},
  fullname: { type: String, required: true },
  accountNumber: { type: String, required: true },
  ifsc: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('WithdrawalRequest', WithdrawalRequestSchema);
