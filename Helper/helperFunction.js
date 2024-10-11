const CombineDetails = require("../Model/OtherData")
const Wallet = require('../Model/Wallet');
const Transaction = require('../Model/Transation');
const contestdetails = require("../Model/contest");
const monthContest = require ("../Model/MonthlyContest.js")
const studentContestQuestion = require ("../Model/student_Question.js")





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




async function checkAndCreateMoreContests() {
  try {
    const currentContestCount = await contestdetails.countDocuments();
    if (currentContestCount <= 10) {
      console.log("There are 10 or fewer contests, creating new contests...");
      await createMultipleContests(10);
      console.log("Successfully created 10 more contests.");
    } else {
      console.log("There are more than 10 contests. No new contests created.");
    }
  } catch (error) {
    console.error("Error while checking and creating contests:", error);
  }
}





//  Student contest
  async function createStudentMultipleContests(contestCount) {
    const ContesStudent = [];
    for (let i = 0; i < contestCount; i++) {
        const newContesStudent = new studentContestQuestion({
            combineId: [], 
            maxParticipants: 2
        });       
        ContesStudent.push(await newContesStudent.save());
    }
    return ContesStudent;
}




// monthly database
async function createMonthlyMultipleContests(contestCount) {
  const contestmonth = [];
  for (let i = 0; i < contestCount; i++) {
      const newContestmonth = new monthContest({
          combineId: [], 
          maxParticipants: 100000
      });
      contestmonth.push(await newContestmonth.save());
  }
  return contestmonth;
}








  module.exports = {
    getUserById,
    getWalletBycombineId,
    updateWallet,
    logTransaction,
    createMultipleContests,
    checkAndCreateMoreContests,
    createMonthlyMultipleContests,
    createStudentMultipleContests
};
  