const express = require("express");
const bcrypt = require("bcrypt");
require("./configfile/config.js");
const { getUserById, getWalletBycombineId, updateWallet, logTransaction } = require("./Helper/helperFunction");
const authhentication = require("./authentication/authentication");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const otpGenerator = require("otp-generator");
const PhoneNumber = require("./Model/phoneNumber.js");
const passworddata = require("./Model/passwordData.js");
const contestdetails = require("./Model/contest.js");
const Question = require("./Model/Question.js");
1;
const CombineDetails = require("./Model/OtherData.js");
const Wallet = require("./Model/Wallet.js");
const leaderboarddetail = require("./Model/LeadBoard.js");
const gkQuestion = require("./Model/OtherQuestion.js");

const app = express();
const secretKey = "credmantra";

app.use(express.json());
app.use(bodyParser.json());  

//Genrate-Otp Api
app.post("/generate-otp", async (req, res) => {
    const { phoneNumber } = req.body;
    console.log("hlo", phoneNumber);
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
        return res.status(400).json({ success: false, message: "Invalid phone number" });
    }
    const otp = otpGenerator.generate(4, {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
        number: true,
    });
    const otpExpiration = new Date(Date.now() + 5 * 60 * 2000);
    try {
        const updatedPhoneNumber = await PhoneNumber.findOneAndUpdate(
            { phoneNumber: phoneNumber },
            { otp: otp, otpExpiration: otpExpiration },
            { upsert: true, new: true, runValidators: true }
        );
        console.log(updatedPhoneNumber);
        res.json({
            success: true,
            updatedPhoneNumber,
            message: "OTP generated successfully",
            otp: `Dont share your Quizy code : ${otp} `,
        });
    } catch (err) {
        console.error("Error generating OTP:", err);
        res.status(500).json({
            success: false,
            message: "Failed to generate OTP",
        });
    }
});

//verify-Otp
app.post("/verify-otp",  async (req, res) => {
    const { phoneNumber, otp } = req.body;
    try {
        const phoneNumberData = await PhoneNumber.findOne({
            phoneNumber: phoneNumber,
        });
        console.log(phoneNumberData);
        if (phoneNumberData && phoneNumberData.otp === otp && phoneNumberData.otpExpiration > Date.now()) {
            res.json({ success: true, message: "OTP verified successfully" });
        } else {
            res.status(400).json({
                success: false,
                message: "Invalid OTP or OTP expired",
            });
        }
    } catch (err) {
        console.error("Error verifying OTP:", err);
        res.status(500).json({
            success: false,
            message: "Failed to verify OTP",
        });
    }
});

//save Password
app.post("/password", async (req, res) => {
    const { phoneNumberId, password } = req.body;
    try {
        if (!phoneNumberId || !password) {
            return res.status(400).json({ message: "Phone number and password are required" });
        }
        const newPasswordData = new passworddata(req.body);
        const savedData = await newPasswordData.save();
        console.log("Saved password data:", savedData);
        res.status(200).json(savedData);
    } catch (error) {
        console.error("Error saving password:", error);
        res.status(500).json({ message: "Failed to save password" });
    }
});

// password Match
app.post("/match/password", async (req, res) => {
    try {
        const { password, phoneNumberId } = req.body;
        if (!password || !phoneNumberId) {
            return res.status(400).json({ message: "Phone number and password are required" });
        }
        const passwordData = await passworddata.findOne({
            phoneNumberId,
            password,
        });
        if (!passwordData) {
            return res.json({
                success: false,
                message: "Phone number not found",
            });
        }
        return res.json({ success: true, message: "Password matched" });
    } catch (error) {
        console.error("Error matching password:", error);
        res.status(500).json({ message: "Error matching password" });
    }
});

// Forget password
app.put("/forget/password", async (req, res) => {
    try {
        const { oldpassword, newpassword, phoneNumberId } = req.body;
        if (!oldpassword || !newpassword || !phoneNumberId) {
            return res.status(400).json({
                message: "Old password, new password, and phone number are required",
            });
        }
        console.log(oldpassword);
        const passwordData = await passworddata.findOne({
            phoneNumberId: phoneNumberId,
        });
        console.log(passwordData);
        console.log(passwordData.password);
        if (!passwordData) {
            console.log("Password data not found for provided phone number");
            return res.status(404).json({ success: false, message: "Password data not found" });
        }

        if (passwordData.password !== parseInt(oldpassword)) {
            return res.status(401).json({ success: false, message: "Old password is incorrect" });
        }
        passwordData.password = newpassword;
        const updatedData = await passwordData.save();
        res.json({
            success: true,
            message: "Password updated successfully",
            data: updatedData,
        });
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

//Other form Api
app.post("/other/add", async (req, res) => {
    console.log("Incoming data:", req.body);
    try {
        const data = new CombineDetails({ formDetails: req.body });
        const result = await data.save();

        console.log(result);
        res.send(result);
    } catch (error) {
        console.error("Error saving user details:", error);
        res.status(500).send({
            error: "user details alerady save user details",
        });
    }
});

//  Student Form
app.post("/student/add", async (req, res) => {
    try {
        // console.log("Incoming data:", req.body);
        const studentdata = new CombineDetails({ studentDetails: req.body });
        const studentResult = await studentdata.save();
        console.log("hello bhai", studentResult);
        res.send(studentResult);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internel error" });
    }
});

// Create Contest
app.post("/create-contest", async (req, res) => {
    const { combineId, fullname, gameAmount } = req.body;
    try {
        const userData = await CombineDetails.findById(combineId);
        if (!userData) {
            console.error("User not found");
            return res.status(404).json({ message: "User not found" });
        }
        const wallet = await getWalletBycombineId(combineId);
        if (!wallet) {
            return res.status(404).json({ message: "Wallet not found" });
        }
        if (wallet.balance < gameAmount) {
            return res.status(400).json({ message: "Insufficient balance" });
        }
        wallet.balance -= gameAmount;
        await wallet.save();
        await logTransaction(combineId, -gameAmount, "debit");
        const newContest = new contestdetails({
            combineId: [{ id: combineId, fullname: fullname }],
        });
        const savedContest = await newContest.save();
        res.json({
            message: "Contest created and user joined game successfully",
            contestId: savedContest._id,
            fullname,
            balance: wallet.balance,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// join game and cut amount
app.post("/join-game", async (req, res) => {
    const { contestId, newcombineId, fullname, gameAmount } = req.body;
    try {
        const contest = await contestdetails.findById(contestId);
        if (!contest) {
            return res.status(404).json({ message: "Contest not found" });
        }
        if (contest.combineId.length >= 2) {
            return res.status(400).json({ message: "Contest full" });
        }
        const user = await getUserById(newcombineId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const wallet = await getWalletBycombineId(newcombineId);
        if (!wallet) {
            return res.status(404).json({ message: "Wallet not found" });
        }
        if (wallet.balance < gameAmount) {
            return res.status(400).json({ message: "Insufficient balance" });
        }
        wallet.balance -= gameAmount;
        await wallet.save();
        await logTransaction(newcombineId, -gameAmount, "debit");
        contest.combineId.push({ id: newcombineId, fullname: fullname });
        await contest.save();
        res.json({
            message: `User ${fullname} joined contest and game`,
            contestId,
            balance: wallet.balance,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// Student based Question
app.post("/question", async (req, res) => {
    const { combineId } = req.body;
    try {
        const studentvalues = await CombineDetails.findById(combineId);
        console.log(studentvalues);
        if (!studentvalues) {
            return res.status(400).send({ message: "Class is not available" });
        }
        const classvalue = studentvalues.studentDetails.classvalue;

        console.log(classvalue);
        if (!classvalue) {
            return res.status(400).send({ message: "Student's class value is not defined" });
        }
        const count = await Question.countDocuments({ classvalue });
        if (count.length === 0) {
            return res.status(404).send({ message: "No questions available for this class" });
        }
        const random = Math.floor(Math.random() * count);
        const question = await Question.findOne({ classvalue }).skip(random);
        res.json({ ...question.toJSON() });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// only Other GK Question
app.post("/other/question", async (req, res) => {
    const { combineId } = req.body;

    try {
        const othervalues = await CombineDetails.findById(combineId);
        if (!othervalues) {
            return res.status(400).send({ message: "Data is not available" });
        }
        const count = await gkQuestion.countDocuments();
        if (count === 0) {
            return res.status(404).send({
                message: "No questions available",
                totalQuestions: count,
            });
        }
        const randomIndex = Math.floor(Math.random() * count);
        const randomQuestion = await gkQuestion.findOne().skip(randomIndex);
        res.status(200).send({ randomQuestion, totalQuestions: count });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal server error" });
    }
});

// Verify Answer Api
app.post("/answer", async (req, res) => {
    const { combineId, questionId, selectedOption, combineuser } = req.body;
    try {
        const question = await Question.findById(questionId);
        console.log(question);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }
        const isCorrect = question.correctAnswer === selectedOption;
        console.log(isCorrect);
        const combinedata = await CombineDetails.findById(combineId);
        if (!combinedata) {
            return res.status(404).json({ message: "User not found" });
        }
        if (isCorrect) {
            combinedata.score = +1;
            await combinedata.save();

            let leaderboardEntry = await leaderboarddetail.findOne({
                combineId: combineId,
            });
            // console.log(leaderboardEntry)
            if (!leaderboardEntry) {
                leaderboardEntry = new leaderboarddetail({
                    combineId,
                    combineuser,
                    score: 0,
                });
            }
            leaderboardEntry.score += 1;
            await leaderboardEntry.save();
        }

        res.json({
            combineId,
            questionId,
            selectedOption,
            isCorrect,
            combineuser,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

//Other Data Answer
app.post("/other/answer", async (req, res) => {
    const { combineId, gkquestionId, selectedOption, combineuser } = req.body;
    try {
        const question = await gkQuestion.findById(gkquestionId);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }
        console.log(question);
        const isCorrect = question.correctAnswer === selectedOption;
        const combinedata = await CombineDetails.findById(combineId);
        if (!combinedata) {
            return res.status(404).json({ message: "User not found" });
        }
        if (isCorrect) {
            combinedata.score = +1;
            await combinedata.save();

            let leaderboardEntry = await leaderboarddetail.findOne({
                combineId: combineId,
            });
            console.log("try", leaderboardEntry);
            if (!leaderboardEntry) {
                leaderboardEntry = new leaderboarddetail({
                    combineId,
                    combineuser,
                    score: 0,
                });
            }
            leaderboardEntry.score += 1;
            await leaderboardEntry.save();
        }
        // console.log( "med",fullname)
        res.json({
            combineId,
            gkquestionId,
            selectedOption,
            isCorrect,
            combineuser,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

app.post("/game/compare", async (req, res) => {
    const { contestId, combineId1, combineId2, winningAmount } = req.body;
    try {
        const contest = await contestdetails.findById(contestId);
        console.log("hlo", contest);
        if (!contest) {
            return res.status(404).json({ message: "Contest not found" });
        }
        const user1 = await leaderboarddetail.findOne({
            combineId: combineId1,
        });
        if (!user1) {
            return res.status(404).json({ message: "User 1 not found" });
        }
        const user2 = await leaderboarddetail.findOne({
            combineId: combineId2,
        });
        if (!user2) {
            return res.status(404).json({ message: "User 2 not found" });
        }
        let winner;
        if (user1.score > user2.score) {
            winner = user1;
        } else if (user1.score < user2.score) {
            winner = user2;
        } else {
            return res.status(200).json({ message: "It's a tie!", user1, user2 });
        }
        if (winningAmount) {
            const wallet = await getWalletBycombineId(winner.combineId);
            if (!wallet) {
                return res.status(404).json({ message: "Wallet not found for winner" });
            }
            wallet.balance += parseInt(winningAmount);
            await updateWallet(wallet);
            await logTransaction(winner.combineId, winningAmount, "credit");
            return res.status(200).json({
                message: "Winner determined and wallet updated",
                winner: {
                    combineId: winner.combineId,
                    score: winner.score,
                    wallet: wallet.balance,
                },
            });
        } else {
            return res.status(200).json({
                message: "Winner determined",
                winner: {
                    combineId: winner.combineId,
                    score: winner.score,
                },
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal server error" });
    }
});

// game Leaderboard
app.post("/game/result", async (req, res) => {
    const { contestId, combineId1, combineId2 } = req.body;

    try {
        const contest = await contestdetails.findById(contestId);
        if (!contest) {
            return res.status(404).json({ message: "Contest not found" });
        }
        console.log("hlo", contest);
        const user1 = await leaderboarddetail.findOne({
            combineId: combineId1,
        });
        if (!user1) {
            return res.status(404).json({ message: "User 1 not found" });
        }
        const user2 = await leaderboarddetail.findOne({
            combineId: combineId2,
        });
        if (!user2) {
            return res.status(404).json({ message: "User 2 not found" });
        }
        let winner, loser;
        if (user1.score > user2.score) {
            winner = user1;
            loser = user2;
        } else if (user1.score < user2.score) {
            winner = user2;
            loser = user1;
        } else {
            return res.status(200).json({
                message: "It's a tie!",
                user1,
                user2,
            });
        }

        // Send response
        return res.status(200).json({
            message: "Game result determined",
            winner: {
                combineId: winner.combineId,
                score: winner.score,
            },
            loser: {
                combineId: loser.combineId,
                score: loser.score,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal server error" });
    }
});

// leaderboard
app.get("/leaderboard", async (req, res) => {
    const { combineuser } = req.query;
    try {
        const topUsers = await leaderboarddetail.find().sort({ score: -1 }).limit(3);
        res.json({ topUsers, RequestedBy: combineuser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// Monthly leaderboard
app.get("/monthly-leaderboard", async (req, res) => {
    const { combineuser } = req.query;
    try {
        const topUsers = await leaderboarddetail.find().sort({ score: -1 }).limit(8);
        res.json({ topUsers, RequestedBy: combineuser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// Add wallet amount
app.post("/wallet/add", async (req, res) => {
    const { combineId, amount } = req.body;

    const username = await getUserById(combineId);

    if (!username) {
        return res.status(404).json({ error: "User not found" });
    }
    let wallet = await getWalletBycombineId(combineId);
    if (!wallet) {
        wallet = new Wallet({ combineId, balance: 0 });
    }
    wallet.balance += parseInt(amount);
    await updateWallet(wallet);
    await logTransaction(combineId, amount, "credit");
    res.json({ balance: wallet.balance });
});

// Yearly Contest
app.post("/yearly-contest", async (req, res) => {
    const { contestId, newcombineId } = req.body;
    try {
        const contest = await contestdetails.findById(contestId);
        console.log("id", contest);
        if (!contest) {
            return res.status(404).json({ message: "Contest not found" });
        }
        if (contest.combineId.length >= 100000) {
            return res.status(400).json({ message: "Contest fully" });
        }
        // console.log(contest.userId)
        contest.combineId.push(newcombineId);
        await contest.save();
        res.json({ message: `User ${newcombineId} joined contest`, contestId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
