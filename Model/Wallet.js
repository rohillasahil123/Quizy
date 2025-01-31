const mongoose  = require("mongoose") ; 

const walletSchema = new mongoose.Schema({
    combineId: mongoose.Schema.Types.ObjectId,
    balance: {type: Number, default: 0},
    referralBalance: {type: Number, default: 0},
})
module.exports = mongoose.model("wallet", walletSchema);