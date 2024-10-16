const CombineDetails = require("../Model/OtherData")
const Wallet = require('../Model/Wallet');
const Transaction = require('../Model/Transation');
const contestdetails = require("../Model/contest");
const monthContest = require("../Model/MonthlyContest.js")
const studentContestQuestion = require("../Model/student_Question.js")
const competitiveContest = require("../Model/competitive.js")
const collageContest = require("../Model/collage.js")

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



async function createMultipleContestss() {
  const contestAmounts = [5, 10, 25, 50, 100, 500];  
  const contests = [];
  for (let amount of contestAmounts) {
      const existingContest = await contestdetails.findOne({ amount:amount, isFull: false });
      if (existingContest) {
          if (existingContest.combineId.length >= existingContest.maxParticipants) {
            console.log("one")
              existingContest.isFull = true;
              await existingContest.save();
              const newContest = await createNewContest(amount);
              contests.push(newContest);
              console.log("two")
          } else {
              contests.push(existingContest);
              console.log("3")
          }
      } else {
          const newContest = await createNewContest(amount);
          contests.push(newContest);
          console.log("4")
      }
  }

  return contests;
}


async function createNewContest(amount) {
  const newContest = new contestdetails({
      combineId: [],  
      maxParticipants: 2,
      amount: amount,  
      winningAmount: amount * 2, 
      isFull: false  
  });
  return await newContest.save(); 
}




//  Student contest
async function  createStudentMultipleContests() {
  const contestAmounts = [5, 10, 25, 50, 100, 500];  
  const contests = [];
  for (let amount of contestAmounts) {
      const existingContest = await studentContestQuestion.findOne({ amount:amount, isFull: false });
      if (existingContest) {
          if (existingContest.combineId.length >= existingContest.maxParticipants) {
            console.log("one")
              existingContest.isFull = true;
              await existingContest.save();
              const newContest = await createNewContest(amount);
              contests.push(newContest);
              console.log("two")
          } else {
              contests.push(existingContest);
              console.log("3")
          }
      } else {
          const newContest = await createNewContest(amount);
          contests.push(newContest);
          console.log("4")
      }
  }

  return contests;
}


async function createNewContestSchool(amount) {
  const newContest = new studentContestQuestion({
      combineId: [],  
      maxParticipants: 2,
      amount: amount,  
      winningAmount: amount * 2, 
      isFull: false  
  });
  return await newContest.save(); 
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

// compatitive Exam
async function createMultipleCompetitiveContests(contestCount) {
  const contestCompetitive = [];
  for (let i = 0; i < contestCount; i++) {
    const newContestCompetitive = new competitiveContest({
      combineId: [],
      maxParticipants: 2
    });
    contestCompetitive.push(await newContestCompetitive.save());
  }
  return contestCompetitive;
}

// collage 
async function createMultipleCollageContests(contestCount) {
  const contestCollage = [];
  for (let i = 0; i < contestCount; i++) {
    const newContestCollage = new collageContest({
      combineId: [],
      maxParticipants: 2
    });
    contestCollage.push(await newContestCollage.save());
  }
  return contestCollage;
}

module.exports = {
  getUserById,
  getWalletBycombineId,
  updateWallet,
  logTransaction,
  createMonthlyMultipleContests,
  createStudentMultipleContests,
  createMultipleCompetitiveContests,                  
  createMultipleCollageContests,
  createMultipleContestss,
  createNewContest,
  createNewContestSchool
};