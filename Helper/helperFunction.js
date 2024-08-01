const CombineDetails = require("../Model/OtherData")
const Wallet = require('../Model/Wallet');
const Transaction = require('../Model/Transation');




async function getUserById(combineId) {
    return await CombineDetails.findById(combineId);
  }
  
  async function getWalletBycombineId(combineId) {
    return await Wallet.findOne({ combineId: combineId });
  }
  
  async function updateWallet(wallet) {
    return await wallet.save();
  }
  
  async function logTransaction(combineId, amount, type) {
    const transaction = new Transaction({ combineId, amount, type });
    return await transaction.save();
  }

  async function correctClass(classvalue){
    if(classvalue == "1st"){
      return "1st"
    }

  }

  module.exports = {
    getUserById,
    getWalletBycombineId,
    updateWallet,
    logTransaction
};
  