const CombineDetails = require("../Model/OtherData")
const Wallet = require('../Model/Wallet');
const Transaction = require('../Model/Transation');
const contestdetails = require("../Model/contest");




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

  async function createMultipleContests(contestCount) {
    const contests = [];
    for (let i = 0; i < contestCount; i++) {
        const newContest = new contestdetails({
            combineId: [], // No participants at creation
            maxParticipants: 2 // Limit to 2 participants
        });
        contests.push(await newContest.save());
    }
    return contests;
}

async function checkAndCreateMoreContests() {
  const currentContestCount = await contestdetails.countDocuments();
  if (currentContestCount >= 10) {
    const contests = await contestdetails.find().limit(10);
    const allContestsFull = contests.every(contest => contest.userCount >= 2);
    if (allContestsFull) {
      await createMultipleContests(10);
      console.log("Automatically created 10 more contests.");
    }
  }
}



  module.exports = {
    getUserById,
    getWalletBycombineId,
    updateWallet,
    logTransaction,
    createMultipleContests,
    checkAndCreateMoreContests
};
  