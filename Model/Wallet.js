const mongoose  = require("mongoose") ; 

const walletSchema = new mongoose.Schema({
    combineId: mongoose.Schema.Types.ObjectId,
    balance: Number,

})
module.exports = mongoose.model("wallet", walletSchema);