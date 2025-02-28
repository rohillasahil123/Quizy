const CombineDetails = require("../Model/OtherData");
const Wallet = require("../Model/Wallet");
const Transaction = require("../Model/Transaction.js");
const contestdetails = require("../Model/contest");
const monthContest = require("../Model/MonthlyContest.js");
const studentContestQuestion = require("../Model/student_Question.js");
const competitiveContest = require("../Model/competitive.js");
const collageContest = require("../Model/collage.js");
const SchoolContest = require("../Model/School.js");
const weeklycontest = require("../Model/Weekly.js");
const Megacontest = require("../Model/Mega.js");

async function getUserById(combineId) {
    return await CombineDetails.findById(combineId);
}

async function getWalletBycombineId(combineId) {
    return await Wallet.findOne({ combineId: combineId });
}

async function updateWallet(wallet) {
    return await wallet.save();
}

async function logTransaction(combineId, amount, type, title, status) {
    const transaction = new Transaction({ combineId, amount, type, title, status });
    return await transaction.save();
}

async function createMultipleContestss() {
    const contestAmounts = [5, 10, 25, 50, 100, 500];
    const contests = [];
    // for (let amount of contestAmounts) {
    //     const existingContest = await contestdetails.findOne({ amount: amount, isFull: false });
    //     if (existingContest) {
    //         if (existingContest.combineId.length >= existingContest.maxParticipants) {
    //             console.log("one");
    //             existingContest.isFull = true;
    //             await existingContest.save();
    //             const newContest = await createNewContest(amount);
    //             contests.push(newContest);
    //             console.log("two");
    //         } else {
    //             contests.push(existingContest);
    //             console.log("3");
    //         }
    //     } else {
    //         const newContest = await createNewContest(amount);
    //         contests.push(newContest);
    //         console.log("4");
    //     }
    // }
    return contests;
}

async function createNewContest(contestType, prizeMoney, feeAmount, startTime, duration) {
    // const winningAmount = Math.round(amount * 2 * 0.84);
    const newContest = new contestType({
        combineId: [],
        maxParticipants: 2,
        amount: feeAmount,
        winningAmount: prizeMoney,
        duration: duration,
        startTime: startTime,
        isFull: false,
    });
    return await newContest.save();
}

//  Student contest
async function createStudentMultipleContests() {
    const contestAmounts = [5, 10, 25, 50, 100, 500];
    const contests = [];
    for (let amount of contestAmounts) {
        const existingContest = await studentContestQuestion.findOne({ amount: amount, isFull: false });
        if (existingContest) {
            if (existingContest.combineId.length >= existingContest.maxParticipants) {
                existingContest.isFull = true;
                await existingContest.save();
                const newContest = await createNewContest(amount);
                contests.push(newContest);
            } else {
                contests.push(existingContest);
            }
        } else {
            const newContest = await createNewContestSchool(amount);
            contests.push(newContest);
        }
    }
    return contests;
}

async function createNewContestSchool(amount) {
    const winningAmount = Math.round(amount * 2 * 0.84);
    const newContest = new studentContestQuestion({
        combineId: [],
        maxParticipants: 2,
        amount: amount,
        winningAmount: winningAmount,
        isFull: false,
    });
    return await newContest.save();
}

// monthly database

async function createMonthlyMultipleContests() {
    const contestAmounts = [19];
    const contests = [];
    for (let amount of contestAmounts) {
        const existingContest = await monthContest.findOne({ amount: amount, isFull: false });
        console.log("1");
        if (existingContest) {
            if (existingContest.combineId.length >= existingContest.maxParticipants) {
                existingContest.isFull = true;
                console.log("1");
                await existingContest.save();
                const newContest = await createNewContestMonth(amount);
                contests.push(newContest);
                console.log("1");
            } else {
                contests.push(existingContest);
            }
        } else {
            const newContest = await createNewContestMonth(amount);
            contests.push(newContest);
        }
        console.log("1");
    }
    return contests;
}

async function createNewContestMonth(amount) {
    const newContest = new monthContest({
        combineId: [],
        maxParticipants: 100000000,
        amount: amount,
        winningAmount: amount * 2,
        isFull: false,
    });
    return await newContest.save();
}
// compatitive Exam
async function createMultipleCompetitiveContests() {
    const contestAmounts = [5, 10, 25, 50, 100, 500];
    const contests = [];
    for (let amount of contestAmounts) {
        const existingContest = await competitiveContest.findOne({ amount: amount, isFull: false });
        if (existingContest) {
            if (existingContest.combineId.length >= existingContest.maxParticipants) {
                console.log("one");
                existingContest.isFull = true;
                await existingContest.save();
                const newContest = await createNewcompetitiveContest(amount);
                contests.push(newContest);
                console.log("two");
            } else {
                contests.push(existingContest);
                console.log("3");
            }
        } else {
            const newContest = await createNewcompetitiveContest(amount);
            contests.push(newContest);
            console.log("4");
        }
    }
    return contests;
}

async function createNewcompetitiveContest(amount) {
    const winningAmount = Math.round(amount * 2 * 0.84);
    const newContest = new competitiveContest({
        combineId: [],
        maxParticipants: 2,
        amount: amount,
        winningAmount: winningAmount,
        isFull: false,
    });
    return await newContest.save();
}

// collage
async function createMultipleCollageContests(contestCount) {
    const contestCollage = [];
    for (let i = 0; i < contestCount; i++) {
        const newContestCollage = new collageContest({
            combineId: [],
            maxParticipants: 2,
        });
        contestCollage.push(await newContestCollage.save());
    }
    return contestCollage;
}

// week function

async function createNewContestWeek(playerFee) {
    console.log("Creating new contest with maxParticipants:", 100000);

    const newContest = new weeklycontest({
        amount: playerFee,
        winningAmount: 100000,
        combineId: [],
        maxParticipants: 100000,
        isFull: false,
    });

    await newContest.save();
    return newContest;
}

// Function to create weekly contests
async function createWeeklyContests() {
    const playerFee = 19;
    const contests = [];
    let existingContest = await weeklycontest.findOne({ amount: playerFee, isFull: false });

    if (existingContest) {
        existingContest.winningAmount = 1000000;
        console.log(existingContest.winningAmount)
        if (existingContest.combineId.length >= existingContest.maxParticipants) {
            existingContest.isFull = true;
            await existingContest.save();
            const newContest = await createNewContestWeek(playerFee);
            contests.push(newContest);
        } else {
            await existingContest.save();
            contests.push(existingContest);
        }
    } else {
        const newContest = await createNewContestWeek(playerFee);
        contests.push(newContest);
    }

    return contests;
}

// Mega Function

async function createMegaMultipleContests() {
    const contestAmounts = [19];
    const contests = [];
    for (let amount of contestAmounts) {
        const existingContest = await Megacontest.findOne({ amount: amount, isFull: false });
        if (existingContest) {
            if (existingContest.combineId.length >= existingContest.maxParticipants) {
                existingContest.isFull = true;
                await existingContest.save();
                const newContest = await createNewContestMega(amount);
                contests.push(newContest);
            } else {
                contests.push(existingContest);
            }
        } else {
            const newContest = await createNewContestMega(amount);
            contests.push(newContest);
        }
    }
    return contests;
}

async function createNewContestMega(amount) {
    const newContest = new Megacontest({
        combineId: [],
        maxParticipants: 100000000,
        amount: amount,
        winningAmount: amount * 2,
        isFull: false,
    });
    return await newContest.save();
}

// School  Site function

async function createSchoolMultipleContests(contestCount) {
    //     const contestSchool = [];
    //     for (let i = 0; i < contestCount; i++) {
    //         const newContestmonth = new SchoolContest({
    //             combineId: [],
    //             schoolName: "",
    //             maxParticipants: 100000,
    //         });
    //         contestSchool.push(await newContestmonth.save());
    //     }
    //     return contestSchool;
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
    createNewContestSchool,
    createNewcompetitiveContest,
    createSchoolMultipleContests,
    createWeeklyContests,
    createMegaMultipleContests,
};
