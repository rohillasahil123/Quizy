const express = require("express");
const mongoose = require ("mongoose")
const axios = require("axios");
require("./configfile/config.js");
const { getUserById, getWalletBycombineId, updateWallet, logTransaction } = require("./Helper/helperFunction.js");
const authhentication = require("./authentication/authentication.js");
const jwt = require("jsonwebtoken");
PORT = process.env.PORT || 5000;
const bodyParser = require("body-parser");
const otpGenerator = require("otp-generator");
const PhoneNumber = require("./Model/phoneNumber.js");
const passworddata = require("./Model/passwordData.js");
const contestdetails = require("./Model/contest.js");
const Question = require("./Model/Question.js");
const CombineDetails = require("./Model/OtherData.js");
const Wallet = require("./Model/Wallet.js");
const leaderboarddetail = require("./Model/LeadBoard.js");
const gkQuestion = require("./Model/OtherQuestion.js");
const contest = require("./Model/contest.js");

const app = express();
const secretKey = "credmantra";
const fast2smsAPIKey = "kuM9ZYAPpRt0hFqVW71UbOxygli64dDrQzew3JLojN5HTfaIvskCR4bYSDAznIa6VxGmuq0ytT72LZ5f";

app.use(express.json());
app.use(bodyParser.json());

//Genrate-Otp Api
app.post("/send-otp", async (req, res) => {
    const { phoneNumber } = req.body;
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
    const otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
    try {
        const updatedPhoneNumber = await PhoneNumber.findOneAndUpdate(
            { phoneNumber: phoneNumber },
            { otp: otp, otpExpiration: otpExpiration },
            { upsert: true, new: true, runValidators: true }
        );
        const fast2smsResponse = await axios.get("https://www.fast2sms.com/dev/bulkV2", {
            params: {
                authorization: fast2smsAPIKey,
                variables_values: otp,
                route: "otp",
                numbers: phoneNumber,
            },
        });
        console.log("Fast2SMS Response:", fast2smsResponse.data);
        res.json({
            success: true,
            updatedPhoneNumber,
            message: "OTP generated successfully",
            otp: `Dont share your Quizy code : ${otp} `,
        });
        console.log(otp);
    } catch (err) {
        console.error("Error generating OTP:", err);
        res.status(500).json({
            success: false,
            message: "Failed to generate OTP",
        });
    }
});

//verify-Otp
app.post("/verify-otp", async (req, res) => {
    const { phoneNumber, otp } = req.body;

    try {
        const phoneNumberData = await PhoneNumber.findOne({ phoneNumber });

        if (phoneNumberData && phoneNumberData.otp === otp && phoneNumberData.otpExpiration > Date.now()) {
            const token = jwt.sign({ phoneNumber }, secretKey, { expiresIn: "24h" });
            const userData = await CombineDetails.findOne({ "formDetails.phoneNumber": phoneNumber });
            const user = {
                _id: userData ? userData._id : null,
                fullname: userData ? userData.formDetails.fullname : null,
                address: userData ? userData.formDetails.address : null,
                email: userData ? userData.formDetails.email : null,
                city: userData ? userData.formDetails.city : null,
                state: userData ? userData.formDetails.state : null,
                pincode: userData ? userData.formDetails.pincode : null,
                phoneNumber: phoneNumber,
                dob: userData ? userData.formDetails.dob : null,
            };
            // Send JSON response
            res.json({
                success: true,
                message: "OTP verified successfully",
                user: user,
                token: token,
            });
        } else {
            res.status(400).json({ success: false, message: "Invalid OTP or OTP expired" });
        }
    } catch (err) {
        console.error("Error verifying OTP:", err);
        res.status(500).json({ success: false, message: "Failed to verify OTP" });
    }
});

app.get("/getdetails", authhentication, async (req, res) => {
    const { phoneNumber } = req.query;
    try {
        const number = await CombineDetails.find({
            $or: [{ "formDetails.phoneNumber": phoneNumber }, { "studentDetails.phoneNumber": phoneNumber }],
        });
        console.log("Number:", number);
        res.send({ number, RequestedBy: phoneNumber });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//save Password
app.post("/password", authhentication, async (req, res) => {
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

// password Match cardMantra
app.post("/match/password", authhentication, async (req, res) => {
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
app.put("/forget/password", authhentication, async (req, res) => {
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
app.post("/other/add", authhentication,  async (req, res) => {
    console.log("Incoming data:", req.body);
    try {
        const data = new CombineDetails({ formDetails: req.body });
        const result = await data.save();
        let wallet = await Wallet.findOne({ combineId: result._id });
        const initialAmount = 500;
        if (!wallet) {
            wallet = new Wallet({ combineId: result._id, balance: initialAmount });
        } else {
            wallet.balance += initialAmount;
        }
        await wallet.save();
        const transaction = await logTransaction(result._id, initialAmount, "credit");
        console.log(result);
        res.send({
            userDetails: result,
            walletBalance: wallet.balance,
        });
    } catch (error) {
        console.error("Error saving user details:", error);
        res.status(500).send({
            error: "User details already saved  or another error occurred",
        });
    }
});

//  Student Form
app.post("/student/add", authhentication, async (req, res) => {
    try {
        const studentdata = new CombineDetails({ studentDetails: req.body });
        const studentResult = await studentdata.save();
        console.log("Student-Result", studentResult);
        res.send(studentResult);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internel error" });
    }
});

// Create Contest
app.post("/create-contest", authhentication, async (req, res) => {
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
app.post("/join-game", authhentication, async (req, res) => {
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

app.post("/join-game/many", authhentication, async (req, res) => {
    const { contestId, newcombineId, fullname, gameAmount } = req.body;
    try {
        const contest = await contestdetails.findById(contestId);
        if (!contest) {
            return res.status(404).json({ message: "Contest not found" });
        }
        if (contest.combineId.length >= 4) {
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
app.post("/question", authhentication, async (req, res) => {
    const { combineId } = req.body;
    try {
        const studentvalues = await CombineDetails.findById(combineId);
        if (!studentvalues) {
            return res.status(400).send({ message: "Class is not available" });
        }
        const classvalue = studentvalues.studentDetails.classvalue;
        if (!classvalue) {
            return res.status(400).send({ message: "Student's class value is not defined" });
        }
        const count = await Question.countDocuments({ classvalue });
        if (count === 0) {
            return res.status(404).send({ message: "No questions available for this class" });
        }
        const random = Math.floor(Math.random() * count);
        const question = await Question.findOne({ classvalue }).skip(random);
        if (!question) {
            return res.status(404).send({ message: "Question not found" });
        }
        res.json({ ...question.toJSON() });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// only Other GK Question
app.post("/other/question", authhentication, async (req, res) => {
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

app.get("/get/score", authhentication, async (req, res) => {
    const { contestId, combineId } = req.query;
    try {
        const combineDetail = await CombineDetails.findById(combineId);
        if (!combineDetail) {
            return res.status(404).json({ error: "Combine details not found" });
        }
        const contestData = await contest.findById(contestId);
        if (!contestData) {
            return res.status(404).json({ error: "Contest not found" });
        }
        const participant = contestData.combineId.find((participant) => participant.id.toString() === combineId);
        if (!participant) {
            return res.status(404).json({ error: "Participant not found in contest" });
        }
        res.status(200).json({
            combineId: combineDetail._id,
            contestId: contestData._id,
            score: participant.score,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

// Verify Answer Api
app.post("/answer", authhentication, async (req, res) => {
    const { combineId, contestId, questionId, selectedOption, combineuser } = req.body;
    try {
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        const isCorrect = question.correctAnswer === selectedOption;
        const combinedata = await CombineDetails.findById(combineId);
        if (!combinedata) {
            return res.status(404).json({ message: "User not found" });
        }

        if (isCorrect) {
            combinedata.score += 1;
            await combinedata.save();

            let leaderboardEntry = await leaderboarddetail.findOne({ combineId });
            if (!leaderboardEntry) {
                leaderboardEntry = new leaderboarddetail({
                    combineId,
                    combineuser,
                    score: 0,
                });
            }
            leaderboardEntry.score += 1;
            await leaderboardEntry.save();

            let contest = await contestdetails.findById(contestId);
            if (!contest) {
                return res.status(404).json({ message: "Contest not found" });
            }

            let userContest = contest.combineId.find((user) => user.id.toString() === combineId.toString());
            if (userContest) {
                userContest.score += 1;
                await contest.save();
            }
        }

        res.json({
            combineId,
            contestId,
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
app.post("/other/answer", authhentication, async (req, res) => {
    const { combineId, contestId, gkquestionId, selectedOption, combineuser } = req.body;
    try {
        const question = await gkQuestion.findById(gkquestionId);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        const isCorrect = question.correctAnswer === selectedOption;
        const combinedata = await CombineDetails.findById(combineId);
        if (!combinedata) {
            return res.status(404).json({ message: "User not found" });
        }

        let contestScore = 0;

        if (isCorrect) {
            combinedata.score += 1;
            await combinedata.save();

            let leaderboardEntry = await leaderboarddetail.findOne({ combineId });
            if (!leaderboardEntry) {
                leaderboardEntry = new leaderboarddetail({
                    combineId,
                    combineuser,
                    score: 0,
                });
            }
            leaderboardEntry.score += 1;

            await leaderboardEntry.save();

            let contest = await contestdetails.findById(contestId);
            if (!contest) {
                return res.status(404).json({ message: "Contest not found" });
            }

            let userContest = contest.combineId.find((user) => user.id.toString() === combineId.toString());
            if (userContest) {
                userContest.score += 1;
                contestScore = userContest.score;
                await contest.save();
            }
        }

        res.json({
            combineId,
            contestId,
            gkquestionId,
            selectedOption,
            isCorrect,
            combineuser,
            score: contestScore,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// Compare-Game-2 user
app.post("/game/compare", authhentication, async (req, res) => {
    const { contestId, combineId1, combineId2, winningAmount } = req.body;
    try {
        const contest = await contestdetails.findById(contestId);
        console.log("Contest details:", contest);
        if (!contest) {
            return res.status(404).json({ message: "Contest not found" });
        }

        const user1 = contest.combineId.find((user) => user.id.toString() === combineId1);
        console.log("User 1 details:", user1);
        if (!user1) {
            return res.status(404).json({ message: "User 1 not found in contest" });
        }

        const user2 = contest.combineId.find((user) => user.id.toString() === combineId2);
        console.log("User 2 details:", user2);
        if (!user2) {
            return res.status(404).json({ message: "User 2 not found in contest" });
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
            const wallet = await getWalletBycombineId(winner.id);
            if (!wallet) {
                return res.status(404).json({ message: "Wallet not found for winner" });
            }
            wallet.balance += parseInt(winningAmount);
            await updateWallet(wallet);
            await logTransaction(winner.id, winningAmount, "credit");
            return res.status(200).json({
                message: "Winner determined and wallet updated",
                winner: {
                    combineId: winner.id,
                    score: winner.score,
                    wallet: wallet.balance,
                },
            });
        } else {
            return res.status(200).json({
                message: "Winner determined",
                winner: {
                    combineId: winner.id,
                    score: winner.score,
                },
            });
        }
    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).send({ message: "Internal server error" });
    }
});

// Compare-Game-4 user
app.post("/many/game/compare", authhentication, async (req, res) => {
    const { contestId, combineId1, combineId2, combineId3, combineId4, winningAmount } = req.body;
    try {
        const contest = await contestdetails.findById(contestId);
        console.log("Contest details:", contest);
        if (!contest) {
            return res.status(404).json({ message: "Contest not found" });
        }
        const user1 = contest.combineId.find((user) => user.id.toString() === combineId1);
        console.log("User 1 details:", user1);
        if (!user1) {
            return res.status(404).json({ message: "User 1 not found in contest" });
        }
        const user2 = contest.combineId.find((user) => user.id.toString() === combineId2);
        console.log("User 2 details:", user2);
        if (!user2) {
            return res.status(404).json({ message: "User 2 not found in contest" });
        }
        const user3 = contest.combineId.find((user) => user.id.toString() === combineId3);
        console.log("User 3 details:", user3);
        if (!user3) {
            return res.status(404).json({ message: "User 3 not found in contest" });
        }
        const user4 = contest.combineId.find((user) => user.id.toString() === combineId4);
        console.log("User 4 details:", user4);
        if (!user4) {
            return res.status(404).json({ message: "User 4 not found in contest" });
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
            const wallet = await getWalletBycombineId(winner.id);
            if (!wallet) {
                return res.status(404).json({ message: "Wallet not found for winner" });
            }
            wallet.balance += parseInt(winningAmount);
            await updateWallet(wallet);
            await logTransaction(winner.id, winningAmount, "credit");
            return res.status(200).json({
                message: "Winner determined and wallet updated",
                winner: {
                    combineId: winner.id,
                    score: winner.score,
                    wallet: wallet.balance,
                },
            });
        } else {
            return res.status(200).json({
                message: "Winner determined",
                winner: {
                    combineId: winner.id,
                    score: winner.score,
                },
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal server error" });
    }
});

// game Leaderboard user-2
app.post("/game/result", authhentication, async (req, res) => {
    const { contestId, combineId1, combineId2 } = req.body;

    try {
        const contest = await contestdetails.findById(contestId);
        if (!contest) {
            return res.status(404).json({ message: "Contest not found" });
        }

        // Find the user objects within the contest's combineId array
        const user1 = contest.combineId.find((user) => user.id.toString() === combineId1);
        if (!user1) {
            return res.status(404).json({ message: "User 1 not found in contest" });
        }

        const user2 = contest.combineId.find((user) => user.id.toString() === combineId2);
        if (!user2) {
            return res.status(404).json({ message: "User 2 not found in contest" });
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
                combineId: winner.id,
                fullname: winner.fullname,
                score: winner.score,
            },
            loser: {
                combineId: loser.id,
                fullname: loser.fullname,
                score: loser.score,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal server error" });
    }
});

// game Leaderboard user 4
app.post("/many/game/result", authhentication, async (req, res) => {
    const { contestId, combineId1, combineId2, combineId3, combineId4 } = req.body;

    try {
        const contest = await contestdetails.findById(contestId);
        if (!contest) {
            return res.status(404).json({ message: "Contest not found" });
        }

        // Find the user objects within the contest's combineId array
        const user1 = contest.combineId.find((user) => user.id.toString() === combineId1);
        if (!user1) {
            return res.status(404).json({ message: "User 1 not found in contest" });
        }

        const user2 = contest.combineId.find((user) => user.id.toString() === combineId2);
        if (!user2) {
            return res.status(404).json({ message: "User 2 not found in contest" });
        }

        const user3 = contest.combineId.find((user) => user.id.toString() === combineId3);
        if (!user3) {
            return res.status(404).json({ message: "User 3 not found in contest" });
        }

        const user4 = contest.combineId.find((user) => user.id.toString() === combineId4);
        if (!user4) {
            return res.status(404).json({ message: "User 4 not found in contest" });
        }

        // Create an array of users and sort by score
        const users = [user1, user2, user3, user4];
        users.sort((a, b) => b.score - a.score);

        // Assign positions
        const [winner, second, third, loser] = users;

        // Send response
        return res.status(200).json({
            message: "Game result determined",
            winner: {
                combineId: winner.id,
                fullname: winner.fullname,
                score: winner.score,
            },
            second: {
                combineId: second.id,
                fullname: second.fullname,
                score: second.score,
            },
            third: {
                combineId: third.id,
                fullname: third.fullname,
                score: third.score,
            },
            loser: {
                combineId: loser.id,
                fullname: loser.fullname,
                score: loser.score,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal server error" });
    }
});

// leaderboard
app.get("/leaderboard", authhentication, async (req, res) => {
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
app.get("/monthly-leaderboard", authhentication, async (req, res) => {
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
app.post("/wallet/add", authhentication, async (req, res) => {
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

    const trty = await logTransaction(combineId, amount, "credit");
    console.log("first", trty);
    res.json({ balance: wallet.balance });
});

app.get("/getAmount" ,authhentication, async (req, res) => {
    const { combineId } = req.query;

    try {
        if (!mongoose.Types.ObjectId.isValid(combineId)) {
            return res.status(400).json({ message: "Invalid combineId" });
        }
        const wallet = await Wallet.findOne({ combineId: new mongoose.Types.ObjectId(combineId) });
        if (!wallet) {
            return res.status(404).json({ message: "Wallet not found" });
        }
        res.json(wallet);
    } catch (error) {
        console.error("Error fetching wallet:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Yearly Contest
app.post("/yearly-contest", authhentication, async (req, res) => {
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
        contest.combineId.push(newcombineId);
        await contest.save();
        res.json({ message: `User ${newcombineId} joined contest`, contestId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// Globli LeaderBoard
app.post("/leaderboard/globle", authhentication, async (req, res) => {
    const { combineId } = req.body;
    try {
        const user = await leaderboarddetail.findOne({ combineId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const contests = await contestdetails.find();
        if (!contests || contests.length === 0) {
            return res.status(404).json({ message: "No contests found" });
        }

        let totalScore = 0;
        const userContests = contests
            .map((contest) => {
                const participant = contest.combineId.find((part) => part.id.toString() === combineId.toString());
                if (participant) {
                    totalScore += participant.score;
                    return {
                        contestId: contest._id,
                        score: participant.score,
                        fullname: participant.fullname,
                    };
                }
            })
            .filter((item) => item !== undefined);
        const leaderboard = await leaderboarddetail.find();
        const leaderboardData = leaderboard.map((entry) => {
            const userTotalScore = contests.reduce((acc, contest) => {
                const participant = contest.combineId.find((part) => part.id.toString() === entry.combineId.toString());
                return acc + (participant ? participant.score : 0);
            }, 0);
            return {
                combineId: entry.combineId,
                combineuser: entry.combineuser,
                totalScore: userTotalScore,
            };
        });
        leaderboardData.sort((a, b) => b.totalScore - a.totalScore);
        res.status(200).json({
            totalScore,
            leaderboard: leaderboardData,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal server error" });
    }
});

app.get("/check", (req, res) => {
    res.send("Hello World");
});

app.listen(PORT, () => {
    console.log("Server is running on port 5000");
});
