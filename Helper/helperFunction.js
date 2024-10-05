const CombineDetails = require("../Model/OtherData")
const Wallet = require('../Model/Wallet');
const Transaction = require('../Model/Transation');
const contestdetails = require("../Model/contest");
const cron = require('node-cron');




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
            combineId: [], 
            maxParticipants: 2 
        });
        contests.push(await newContest.save());
    }
    return contests;
}

const checkAndCreateMoreContests = async () => {
  try {
    // Get the current count of contests in the database
    const currentContestCount = await contestdetails.countDocuments();

    // Check if there are 9 or fewer contests
    if (currentContestCount <= 9) {
      // Fetch all contests to check their user counts
      const contests = await contestdetails.find();

      // Check if all contests are empty (less than 2 users)
      const allContestsEmpty = contests.every(contest => contest.userCount < 2);

      // If all contests are empty, create new contests
      if (allContestsEmpty) {
        await createMultipleContests(10); // Creates 10 new contests
        console.log("Automatically created 10 more contests.");
      }
    }
  } catch (error) {
    console.error("Error checking or creating contests:", error);
  }
};

// Run the check every 5 minutes (300000 ms)
setInterval(checkAndCreateMoreContests, 300000);


cron.schedule('*/5 * * * *', checkAndCreateMoreContests);



  module.exports = {
    getUserById,
    getWalletBycombineId,
    updateWallet,
    logTransaction,
    createMultipleContests,
    checkAndCreateMoreContests
};
  