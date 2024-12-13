const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const cors = require ("cors");
require("./configfile/config.js");
const { getUserById,
    getWalletBycombineId,
    updateWallet,
    logTransaction,
    createNewContest,
    createMonthlyMultipleContests,
    createStudentMultipleContests,
    createMultipleCompetitiveContests,
    createMultipleContestss,
    createNewContestSchool,
    createNewcompetitiveContest,
    createWeeklyContests,
    createMegaMultipleContests
} = require("./Helper/helperFunction.js");
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
const Monthlyleaderboard = require ("./Model/MonthlyLeadboard")
const Megaleaderboard = require ("./Model/MegaLeaderBoard.js")
const Weeklyleaderboard = require("./Model/Weekly_leaderboard.js")
const gkQuestion = require("./Model/OtherQuestion.js");
const validateStudentData = require("./Middelware/MiddelWare.js")
const monthContest = require("./Model/MonthlyContest.js")
const practiceContest = require("./Model/Practice_Contest.js")
const studentContestQuestion = require("./Model/student_Question.js")
const competitiveContest = require("./Model/competitive.js")
const SchoolContest = require ("./Model/School.js")
const weeklycontest = require("./Model/Weekly.js")
const Megacontest = require ("./Model/Mega.js")
const practiceQuestion = require ("./Model/PracticeQuestion.js")
const practice_Answer = require('./Model/PracticeAnswer.js');
const KeyContest = require ("./Model/KeySchema.js")


const app = express();

const secretKey = "credmantra";
const fast2smsAPIKey = "kuM9ZYAPpRt0hFqVW71UbOxygli64dDrQzew3JLojN5HTfaIvskCR4bYSDAznIa6VxGmuq0ytT72LZ5f";
app.use(cors())
app.use(express.json());
app.use(bodyParser.json());


// Login needed Api Start
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
            const userData = await CombineDetails.findOne({
                $or: [
                    { "formDetails.phoneNumber": phoneNumber },
                    { "studentDetails.phoneNumber": phoneNumber },
                ],
            });
            const user = userData ? {
                _id: userData._id || null,
                fullname: userData.formDetails?.fullname || userData.studentDetails?.fullname || null,
                address: userData.formDetails?.address || userData.studentDetails?.address || null,
                email: userData.formDetails?.email || null,
                city: userData.formDetails?.city || userData.studentDetails?.city || null,
                role: userData.formDetails?.role || userData.studentDetails?.role || null,
                state: userData.formDetails?.state || userData.studentDetails?.state || null,
                pincode: userData.formDetails?.pincode || userData.studentDetails?.pincode || null,
                phoneNumber: phoneNumber,
                dob: userData.formDetails?.dob || null,
                // Additional fields from studentDetails
                schoolName: userData.studentDetails?.schoolName || null,
                schoolAddress: userData.studentDetails?.schoolAddress || null,
                selectEducation: userData.studentDetails?.selectEducation || null,
                boardOption: userData.studentDetails?.boardOption || null,
                classvalue: userData.studentDetails?.classvalue || null,
                mediumName: userData.studentDetails?.mediumName || null,
                aadharcard: userData.studentDetails?.aadharcard || null,
            } : {
                _id: null,
                fullname: null,
                address: null,
                email: null,
                city: null,
                role: null,
                state: null,
                pincode: null,
                phoneNumber: phoneNumber,
                dob: null,
                // Additional fields
                schoolName: null,
                schoolAddress: null,
                selectEducation: null,
                boardOption: null,
                classvalue: null,
                mediumName: null,
                aadharcard: null,
            };
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

app.get("/getdetails", async (req, res) => {
    const { phoneNumber } = req.query;
    try {
        const userData = await CombineDetails.findOne({
            $or: [
                { "formDetails.phoneNumber": phoneNumber },
                { "studentDetails.phoneNumber": phoneNumber },
            ],
        })
        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }
        const user = {
            _id: userData._id || null,
            fullname: userData.formDetails?.fullname || userData.studentDetails?.fullname || null,
            address: userData.formDetails?.address || userData.studentDetails?.address || null,
            email: userData.formDetails?.email || null,
            city: userData.formDetails?.city || userData.studentDetails?.city || null,
            role: userData.formDetails?.role || userData.studentDetails?.role || null,
            state: userData.formDetails?.state || userData.studentDetails?.state || null,
            pincode: userData.formDetails?.pincode || userData.studentDetails?.pincode || null,
            phoneNumber: phoneNumber,
            dob: userData.formDetails?.dob || null,
            // Additional fields from studentDetails if needed
            schoolName: userData.studentDetails?.schoolName || null,
            schoolAddress: userData.studentDetails?.schoolAddress || null,
            selectEducation: userData.studentDetails?.selectEducation || null,
            boardOption: userData.studentDetails?.boardOption || null,
            classvalue: userData.studentDetails?.classvalue || null,
            mediumName: userData.studentDetails?.mediumName || null,
            aadharcard: userData.studentDetails?.aadharcard || null,
        };

        console.log("User Details:", user);
        res.send({ user, RequestedBy: phoneNumber });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Login needed Api End
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

// Form Student or other start 


//Other form Api
app.post("/other/add", authhentication, async (req, res) => {
    console.log("Incoming data:", req.body);
    try {
        const data = new CombineDetails({ formDetails: req.body });
        const result = await data.save();
        let wallet = await Wallet.findOne({ combineId: result._id });

        const initialAmount = 50;
        if (!wallet) {
            wallet = new Wallet({ combineId: result._id, balance: initialAmount });
        } else {
            wallet.balance += initialAmount;
        }
        // Wallet //
        console.log(wallet);
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
        const studentData = req.body;
        validateStudentData(studentData);
        const studentdata = new CombineDetails({ studentDetails: studentData });
        const studentResult = await studentdata.save();
        console.log("Student-Result:", studentResult);
        let wallet = await Wallet.findOne({ combineId: studentResult._id });
        console.log("Existing Wallet:", wallet);
        const initialAmount = 500;
        if (!wallet) {
            wallet = new Wallet({ combineId: studentResult._id, balance: initialAmount });
            console.log("Created New Wallet:", wallet);
        } else {
            wallet.balance += initialAmount;
            console.log("Updated Wallet Balance:", wallet);
        }
        await wallet.save();
        console.log("Saved Wallet:", wallet);
        await logTransaction(studentResult._id, initialAmount, "credit");
        console.log("Logged Transaction");
        res.send({
            studentDetails: studentResult,
            walletBalance: wallet.balance,
        });
    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({ message: "Internal error" });
    }
});

// Form Student or other End
//create contest 
app.post("/create-contest_new",authhentication,  async (req, res) => {
    try {
        const contests = await createMultipleContestss();
        res.json({
            message: "Contests created successfully",
            contests,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

app.post("/join-game", authhentication,  async (req, res) => {
    const { contestId, combineId, fullname } = req.body;
    console.log("10")
    try {
        const contest = await contestdetails.findById(contestId);
        if (!contest) {
            return res.status(404).json({ message: "Contest not found" });
        }
        const gameAmount = contest.amount;
        console.log("2")
        const wallet = await getWalletBycombineId(combineId);
        if (!wallet) {
            return res.status(404).json({ message: "Wallet not found" });
        }
        if (wallet.balance < gameAmount) {
            return res.status(400).json({ message: "Insufficient balance" });
        }
        if (contest.combineId.length >= contest.maxParticipants) {
            return res.status(400).json({ message: "Contest is already full" });
        }
        contest.combineId.push({ id: combineId, fullname: fullname });
        await contest.save();
        wallet.balance -= gameAmount;
        await wallet.save();
        await logTransaction(combineId, -gameAmount, "debit");
        if (contest.combineId.length >= contest.maxParticipants) {
            contest.isFull = true;
            await contest.save();
            await createNewContest(gameAmount);
        }
        res.json({
            message: "Successfully joined the contest",
            balance: wallet.balance,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});


app.post("/system_compare",authhentication,  async (req, res) => {
    const { contestId, combineId1, combineId2 } = req.body;
    const fixedWalletId = "66fcf223377b6df30f65389d";
    try {
        const contest = await contestdetails.findById(contestId);
        if (!contest) {
            return res.status(404).json({ message: "Contest not found" });
        }
        const user1 = contest.combineId.find((user) => user.id.toString() === combineId1);
        if (!user1) {
            return res.status(404).json({ message: "User 1 not found in contest" });
        }
        const user2 = contest.combineId.find((user) => user.id.toString() === combineId2);
        if (!user2) {
            return res.status(404).json({ message: "User 2 not found in contest" });
        }
        const  winningAmount = contest.winningAmount 
        let winner;
        if (user1.score > user2.score) {
            winner = user1;
        } else if (user1.score < user2.score) {
            winner = user2;
        } else {
            return res.status(200).json({ message: "It's a tie!", user1, user2 });
        }
        const winnerAmount = (winningAmount * 0.75);
        const systemCutAmount = (winningAmount * 0.25);
        if (winnerAmount > 0) {
            const winnerWallet = await getWalletBycombineId(winner.id);
            if (!winnerWallet) {
                return res.status(404).json({ message: "Winner's wallet not found" });
            }
            winnerWallet.balance += parseInt(winnerAmount);
            await updateWallet(winnerWallet);
            await logTransaction(winner.id, winnerAmount, "credit");
            let fixedWallet = await getWalletBycombineId(fixedWalletId);
            if (!fixedWallet) {
                fixedWallet = new Wallet({ id: fixedWalletId, balance: 0 });
            }
            fixedWallet.balance += parseInt(systemCutAmount);
            await updateWallet(fixedWallet);
            await logTransaction(fixedWalletId, systemCutAmount, "credit");
            return res.status(200).json({
                message: "Winner determined and wallets updated",
                winner: {
                    combineId: winner.id,
                    name: winner.fullname,
                    score: winner.score,
                    winnerWallet: winnerWallet.balance,
                    fixedWallet: fixedWallet.balance,
                },
            });
        } else {
            return res.status(200).json({
                message: "Winner determined, but no amount to distribute",
                winner: {
                    combineId: winner.id,
                    name: winner.fullname,
                },
            });
        }
    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).send({ message: "Internal server error" });
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

// Question  And Answer Api 

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

        if (!randomQuestion) {
            return res.status(404).send({ message: "Unable to fetch a question" });
        }
        res.status(200).send({ randomQuestion, totalQuestions: count });
    } catch (error) {
        console.error(error);
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
        const contestData = await contestdetails.findById(contestId);
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

//Other Data Answer
app.post("/other/answer", authhentication,  async (req, res) => {
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

app.get("/contests", authhentication, async (req, res) => {
    try {
        const contests = await contestdetails.find();
        const contestsWithStatus = contests
            .map(contest => {
                const isFull = contest.combineId.length >= 2;

                return {
                    contestId: contest._id,
                    gameAmount: contest.amount,
                    winningAmount: contest.winningAmount,

                    isFull,
                    players: contest.combineId.map(player => ({
                        combineId: player.id,
                        score: player.score,
                        fullname: player.fullname
                    })),
                };
            })
            .filter(contest => !contest.isFull);

        res.send({
            contests: contestsWithStatus,
            message: "All contests retrieved successfully"
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal server error");
    }
});

app.get("/contestdata", authhentication, async (req, res) => {
    const { id } = req.query;
    try {
        let contests;
        if (id) {
            contests = await contestdetails.findById(id);
            if (!contests) {
                return res.status(404).send({ message: "Contest not found" });
            }
            contests = [contests];

        } else {
            contests = await contestdetails.find();
        }
        const contestsWithStatus = contests.map(contest => {
            const isFull = contest.combineId.length >= 2;
            return {
                contestId: contest._id,
                gameAmount: 25,
                winningAmount: 50,
                isFull,
                players: contest.combineId.map(player => ({
                    combineId: player.id,
                    score: player.score,
                    fullname: player.fullname
                })),
            };
        });
        res.send({
            contests: contestsWithStatus,
            message: "Contests retrieved successfully"
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal server error");
    }
});

// other Student 11th & 12th Question 
// Done
app.post("/1-12_create-contest",  authhentication,    async (req, res) => {
    try {
        const contests = await  createStudentMultipleContests();
        res.json({
            message: "Contests created successfully",
            contests,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

app.post("/1-12_join-contest",   authhentication,  async (req, res) => {
    const { contestId, combineId, fullname } = req.body;
    try {
        const contest = await studentContestQuestion.findById(contestId);
        if (!contest) {
            return res.status(404).json({ message: "Contest not found" });
        }
        const gameAmount = contest.amount;
        const wallet = await getWalletBycombineId(combineId);
        if (!wallet) {
            return res.status(404).json({ message: "Wallet not found" });
        }
        if (wallet.balance < gameAmount) {
            return res.status(400).json({ message: "Insufficient balance" });
        }
        if (contest.combineId.length >= contest.maxParticipants) {
            return res.status(400).json({ message: "Contest is already full" });
        }
        contest.combineId.push({ id: combineId, fullname: fullname });
        await contest.save();
        wallet.balance -= gameAmount;
        await wallet.save();
        await logTransaction(combineId, -gameAmount, "debit");
        if (contest.combineId.length >= contest.maxParticipants) {
            contest.isFull = true;
            await contest.save();
            await createNewContestSchool(gameAmount);
        }
        res.json({
            message: "Successfully joined the contest",
            balance: wallet.balance,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

app.post("/1-12_questions", authhentication, async (req, res) => {
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

        if (!randomQuestion) {
            return res.status(404).send({ message: "Unable to fetch a question" });
        }
        res.status(200).send({ randomQuestion, totalQuestions: count });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal server error" });
    }
});

// Verify Answer Api
app.post("/1-12_answer",  authhentication,   async (req, res) => {
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
            let contest = await studentContestQuestion.findById(contestId);
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

app.get("/1-12_get-contest", authhentication,   async (req, res) => {
    try {
        const contests = await studentContestQuestion.find();
        const contestsWithStatus = contests
            .map(contest => {
                const isFull = contest.combineId.length >= 2;

                return {
                    contestId: contest._id,
                    gameAmount: contest.amount,
                    winningAmount: contest.winningAmount,

                    isFull,
                    players: contest.combineId.map(player => ({
                        combineId: player.id,
                        score: player.score,
                        fullname: player.fullname
                    })),
                };
            })
            .filter(contest => !contest.isFull);

        res.send({
            contests: contestsWithStatus,
            message: "All contests retrieved successfully"
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal server error");
    }
});

app.get("/1-12_one_contest", authhentication,   async (req, res) => {
    const { id } = req.query;
    try {
        let contests;
        if (id) {
            contests = await studentContestQuestion.findById(id);
            if (!contests) {
                return res.status(404).send({ message: "Contest not found" });
            }
            contests = [contests];
        } else {
            contests = await studentContestQuestion.find();
        }
        console.log(contests, "57t5 ")
        const contestsWithStatus = contests.map(contest => {
            const isFull = contest.combineId.length >= 2;
            return {
                contestId: contest._id,
                gameAmount: 25,
                winningAmount: 50,
                isFull,
                players: contest.combineId.map(player => ({
                    combineId: player.id,
                    score: player.score,
                    fullname: player.fullname
                })),
            };
        });
        res.send({
            contests: contestsWithStatus,
            message: "Contests retrieved successfully"
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal server error");
    }
});


app.get("/1-12_get/score", authhentication,  async (req, res) => {
    const { contestId, combineId } = req.query;
    try {
        const combineDetail = await CombineDetails.findById(combineId);
        if (!combineDetail) {
            return res.status(404).json({ error: "Combine details not found" });
        }
        const contestData = await studentContestQuestion.findById(contestId);
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


app.post("/1-12_system_compare",  authhentication,  async (req, res) => {
    const { contestId, combineId1, combineId2 } = req.body;
    const fixedWalletId = "66fcf223377b6df30f65389d";  
    try {
        const contest = await studentContestQuestion.findById(contestId);
        if (!contest) {
            return res.status(404).json({ message: "Contest not found" });
        }
        const user1 = contest.combineId.find((user) => user.id.toString() === combineId1);
        const user2 = contest.combineId.find((user) => user.id.toString() === combineId2);
        if (!user1 || !user2) {
            return res.status(404).json({ message: "User(s) not found in contest" });
        }

        let winner;
        if (user1.score > user2.score) winner = user1;
        else if (user1.score < user2.score) winner = user2;
        else return res.status(200).json({ message: "It's a tie!", user1, user2 });
        const winnerAmount = contest.winningAmount;
        const systemCutAmount = Math.round(winnerAmount / 0.84 * 0.16);  
        const winnerWallet = await getWalletBycombineId(winner.id);
        if (!winnerWallet) return res.status(404).json({ message: "Winner's wallet not found" });
        winnerWallet.balance += winnerAmount;
        await updateWallet(winnerWallet);
        await logTransaction(winner.id, winnerAmount, "credit");
        let fixedWallet = await getWalletBycombineId(fixedWalletId);
        if (!fixedWallet) fixedWallet = new Wallet({ id: fixedWalletId, balance: 0 });
        fixedWallet.balance += systemCutAmount;
        await updateWallet(fixedWallet);
        await logTransaction(fixedWalletId, systemCutAmount, "credit");
        return res.status(200).json({
            message: "Winner determined and wallets updated",
            winner: {
                combineId: winner.id,
                name: winner.fullname,
                score: winner.score,
                winnerWallet: winnerWallet.balance,
                fixedWallet: fixedWallet.balance,
            },
        });
    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).send({ message: "Internal server error" });
    }
});



//  competitive Part 
// Done
app.post("/competitive_create_contest", authhentication,  async (req, res) => {
    try {
        const contests = await createMultipleCompetitiveContests();
        res.json({
            message: "Contests created successfully",
            contests,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

app.post("/competitive_join-contest", authhentication,   async (req, res) => {
    const { contestId, combineId, fullname } = req.body;
    console.log("10")
    try {
        const contest = await competitiveContest.findById(contestId);
        if (!contest) {
            return res.status(404).json({ message: "Contest not found" });
        }
        const gameAmount = contest.amount;
        console.log("2")
        const wallet = await getWalletBycombineId(combineId);
        if (!wallet) {
            return res.status(404).json({ message: "Wallet not found" });
        }
        if (wallet.balance < gameAmount) {
            return res.status(400).json({ message: "Insufficient balance" });
        }
        if (contest.combineId.length >= contest.maxParticipants) {
            return res.status(400).json({ message: "Contest is already full" });
        }
        contest.combineId.push({ id: combineId, fullname: fullname });
        await contest.save();
        wallet.balance -= gameAmount;
        await wallet.save();
        await logTransaction(combineId, -gameAmount, "debit");
        if (contest.combineId.length >= contest.maxParticipants) {
            contest.isFull = true;
            await contest.save();
            await createNewcompetitiveContest(gameAmount);
        }
        res.json({
            message: "Successfully joined the contest",
            balance: wallet.balance,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

app.post("/competitive_question", authhentication, async (req, res) => {
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
app.post("/competitive_answer", authhentication, async (req, res) => {
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

            let contest = await competitiveContest.findById(contestId);
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

app.get("/competitive_contest_show", authhentication, async (req, res) => { 
    const { id } = req.query;
    try {
        let contests;
        if (id) {
            contests = await competitiveContest.findById(id);
            if (!contests) {
                return res.status(404).send({ message: "Contest not found" });
            }
            contests = [contests];
        } else {
            contests = await competitiveContest.find();
        }
        console.log(contests, "57t5 ")
        const contestsWithStatus = contests.map(contest => {
            const isFull = contest.combineId.length >= 2;
            return {
                contestId: contest._id,
                gameAmount: contest.amount,
                winningAmount:contest.winningAmount,
                isFull,
                players: contest.combineId.map(player => ({
                    combineId: player.id,
                    score: player.score,
                    fullname: player.fullname
                })),
            };
        });
        res.send({
            contests: contestsWithStatus,
            message: "Contests retrieved successfully"
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal server error");
    }
});

app.get("/competitive_one_contest_show", authhentication, async (req, res) => {
    const { id } = req.query;
    try {
        let contests;
        if (id) {
            contests = await competitiveContest.findById(id);
            if (!contests) {
                return res.status(404).send({ message: "Contest not found" });
            }
            contests = [contests];
        } else {
            contests = await competitiveContest.find();
        }
        console.log(contests, "57t5 ")
        const contestsWithStatus = contests.map(contest => {
            const isFull = contest.combineId.length >= 2;
            return {
                contestId: contest._id,
                gameAmount: 25,
                winningAmount: 50,
                isFull,
                players: contest.combineId.map(player => ({
                    combineId: player.id,
                    score: player.score,
                    fullname: player.fullname
                })),
            };
        });
        res.send({
            contests: contestsWithStatus,
            message: "Contests retrieved successfully"
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal server error");
    }
});

app.get("/competitive_get/score", authhentication,  async (req, res) => {
    const { contestId, combineId } = req.query;
    try {
        const combineDetail = await CombineDetails.findById(combineId);
        if (!combineDetail) {
            return res.status(404).json({ error: "Combine details not found" });
        }
        const contestData = await competitiveContest.findById(contestId);
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


app.post("/competitive_system_compare", authhentication, async (req, res) => {
    const { contestId, combineId1, combineId2 } = req.body;
    const fixedWalletId = "66fcf223377b6df30f65389d";  
    try {
        const contest = await competitiveContest.findById(contestId);
        if (!contest) {
            return res.status(404).json({ message: "Contest not found" });
        }
        const user1 = contest.combineId.find((user) => user.id.toString() === combineId1);
        const user2 = contest.combineId.find((user) => user.id.toString() === combineId2);
        if (!user1 || !user2) {
            return res.status(404).json({ message: "User(s) not found in contest" });
        }

        let winner;
        if (user1.score > user2.score) winner = user1;
        else if (user1.score < user2.score) winner = user2;
        else return res.status(200).json({ message: "It's a tie!", user1, user2 });
        const winnerAmount = contest.winningAmount;
        const systemCutAmount = Math.round(winnerAmount / 0.84 * 0.16);  
        const winnerWallet = await getWalletBycombineId(winner.id);
        if (!winnerWallet) return res.status(404).json({ message: "Winner's wallet not found" });
        winnerWallet.balance += winnerAmount;
        await updateWallet(winnerWallet);
        await logTransaction(winner.id, winnerAmount, "credit");
        let fixedWallet = await getWalletBycombineId(fixedWalletId);
        if (!fixedWallet) fixedWallet = new Wallet({ id: fixedWalletId, balance: 0 });
        fixedWallet.balance += systemCutAmount;
        await updateWallet(fixedWallet);
        await logTransaction(fixedWalletId, systemCutAmount, "credit");
        return res.status(200).json({
            message: "Winner determined and wallets updated",
            winner: {
                combineId: winner.id,
                name: winner.fullname,
                score: winner.score,
                winnerWallet: winnerWallet.balance,
                fixedWallet: fixedWallet.balance,
            },
        });
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
        const users = [user1, user2, user3, user4];
        users.sort((a, b) => b.score - a.score);
        const [winner, second, third, loser] = users;
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
        const topUsers = await leaderboarddetail.find().sort({ score: -1 }).limit(100000000);
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

app.get("/getAmount", authhentication, async (req, res) => {
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

// Yearly (Mega) Contest
 
app.post("/mega-contest", async (req, res) => {
    const initialContestCount = 1;
    try {
        const contests = await createMegaMultipleContests(initialContestCount);
        res.json({
            message: "Weekly contests created successfully",
            contests,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

app.post("/mega_join_contest",  async (req, res) => {
    const { contestId, newcombineId, fullname } = req.body;
    try {
        if (!fullname) {
            return res.status(400).json({ message: "Fullname is required" });
        }

        const contestWeekly = await Megacontest.findById(contestId);
        if (!contestWeekly) {
            return res.status(404).json({ message: "Contest not found" });
        }
        if (contestWeekly.combineId.length >= 100000) { 
            return res.status(400).json({ message: "Contest full" });
        }

        const user = await getUserById(newcombineId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        contestWeekly.combineId.push({ id: newcombineId, fullname });
        await contestWeekly.save();

        res.json({
            message: `User ${fullname} joined contest and game`,
            contestId,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

app.post("/mega_question",  async (req, res) => {
    const { combineId } = req.body;
    try {
        const othervalues = await CombineDetails.findById(combineId);
        if (!othervalues) {
            return res.status(400).send({ message: "user is not available" });
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

app.post("/mega_answer",  async (req, res) => {
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
            let leaderboardEntry = await Megaleaderboard.findOne({ combineId });
            if (!leaderboardEntry) {
                leaderboardEntry = new Megaleaderboard({
                    combineId,
                    combineuser,
                    score: 0,
                });
            }
            leaderboardEntry.score += 1;
            await leaderboardEntry.save();
            let contest = await  Megacontest.findById(contestId);
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

app.get("/mega_contest_show", authhentication,  async (req, res) => { 
    const { id } = req.query;
    try {
        let contests;
        if (id) {
            contests = await Megacontest.findById(id);
            if (!contests) {
                return res.status(404).send({ message: "Contest not found" });
            }
            contests = [contests];
        } else {
            contests = await Megacontest.find();
        }
        console.log(contests, "57t5 ")
        const contestsWithStatus = contests.map(contest => {
            const isFull = contest.combineId.length >= 1000000;
            return {
                contestId: contest._id,
                gameAmount: contest.amount,
                winningAmount:contest.winningAmount,
                isFull,
                players: contest.combineId.map(player => ({
                    combineId: player.id,
                    score: player.score,
                    fullname: player.fullname
                })),
            };
        });
        res.send({
            contests: contestsWithStatus,
            message: "Contests retrieved successfully"
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal server error");
    }
});

app.get("/Mega_leaderboard",authhentication,  async (req, res) => {
    const { combineuser } = req.query;
    try {
        const topUsers = await Megaleaderboard.find().sort({ score: -1 }).limit(100000);
        res.json({ topUsers, RequestedBy: combineuser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});


app.get("/mega_user_score",authhentication, async (req, res) => {
    const { combineId, contestId } = req.query;
    try {
      if (!combineId || !contestId) {
        return res.status(400).json({ error: "Missing combineId or contestId" });
      }
      const contestData = await  Megacontest.findOne({
        _id: contestId,
        "combineId.id": combineId, 
      });
      if (!contestData) {
        return res.status(404).json({ error: "Participant not found in contest" });
      }
      const participant = contestData.combineId.find(
        (user) => user.id.toString() === combineId
      );
      if (!participant) {
        return res.status(404).json({ error: "User not found in contest" });
      }
      res.status(200).json({
        score: participant.score,
        fullname: participant.fullname,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Server error" });
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


// Weekly Api 
app.post("/weekly-contest", async (req, res) => {
    const initialContestCount = 1;
    console.log("6")
    try {
        const contests = await createWeeklyContests(initialContestCount);
        res.json({
            message: "monthly contests created successfully",
            contests,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

app.post("/weekly_join_contest",  async (req, res) => {
    const { contestId, newcombineId, fullname } = req.body;
    try {
        if (!fullname) {
            return res.status(400).json({ message: "Fullname is required" });
        }
        console.log("Checking contest");
        const contestweek = await weeklycontest.findById(contestId);
        if (!contestweek) {
            return res.status(404).json({ message: "Contest not found" });
        }
        console.log("Contest found");

        if (contestweek.combineId.length >= 100000) {
            return res.status(400).json({ message: "Contest full" });
        }
        console.log("Space available in contest");

        const user = await getUserById(newcombineId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        console.log("User found");

        let userContestEntry = contestweek.combineId.find((entry) => entry.id.toString() === newcombineId.toString());

        if (userContestEntry) {
            userContestEntry.joinCount += 1;
            console.log("User is joining again. JoinCount updated.");
        } else {
            contestweek.combineId.push({ id: newcombineId, fullname, joinCount: 1, score: 0 });
            console.log("User added to contest for the first time.");
        }
        await contestweek.save();
        console.log("Contest updated with user's join information");
        res.json({
            message: `User ${fullname} joined contest and game. Join count: ${userContestEntry ? userContestEntry.joinCount : 1}`,
            contestId,
        });
    } catch (err) {
        console.error("Error occurred:", err);
        res.status(500).json({ message: "Server Error" });
    }
});



app.post("/update_score", async (req, res) => {
    const { contestId, combineId } = req.body;

    try {
        // Validate input
        if (!contestId || !combineId) {
            return res.status(400).json({ message: "contestId and combineId are required" });
        }

        // Find the contest
        const contestweek = await weeklycontest.findById(contestId);
        if (!contestweek) {
            return res.status(404).json({ message: "Contest not found" });
        }

        // Check if the user is part of the contest
        const userContestEntry = contestweek.combineId.find((entry) => entry.id.toString() === combineId.toString());
        if (!userContestEntry) {
            return res.status(404).json({ message: "User not found in the contest" });
        }

        // Get the latest score from the user's last game or contest
        const userLatestScore = userContestEntry.score;  // Assuming the score is updated directly after a game

        // If no score (or some condition to check if we need to update), update to the latest
        if (userLatestScore > userContestEntry.score) {
            // Update the contest score to reflect the better (latest) score
            userContestEntry.score = userLatestScore;

            // Save the updated contest data
            await contestweek.save();

            console.log(`User's score updated to the latest value: ${userContestEntry.score}`);

            res.json({
                message: `User ${userContestEntry.fullname}'s score updated to ${userLatestScore}`,
                newScore: userContestEntry.score,
            });
        } else {
            // If the latest score is not better, return a response saying it's already the best score
            res.json({
                message: `User ${userContestEntry.fullname} already has the best score (${userContestEntry.score}). No update required.`,
            });
        }
    } catch (err) {
        console.error("Error occurred:", err);
        res.status(500).json({ message: "Server Error" });
    }
});




app.post("/weekly_question", authhentication,  async (req, res) => {
    const { combineId } = req.body;
    try {
        const othervalues = await CombineDetails.findById(combineId);
        if (!othervalues) {
            return res.status(400).send({ message: "user is not available" });
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


app.post("/weekly_answer", async (req, res) => {
    const { combineId, contestId, gkquestionId, selectedOption, combineuser } = req.body;
  
    try {
      // Find the question
      const question = await gkQuestion.findById(gkquestionId);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
  
      const isCorrect = question.correctAnswer === selectedOption;
  
      // Find the contest
      const contest = await weeklycontest.findById(contestId);
      if (!contest) {
        return res.status(404).json({ message: "Contest not found" });
      }
  
      // Find or create the participant
      let participant = contest.combineId.find((user) => user.id.toString() === combineId.toString());
  
      if (!participant) {
        // If participant doesn't exist, create a new one
        participant = {
          id: combineId, 
          fullname: combineuser,
          score: isCorrect ? 1 : 0, // Start with 1 if correct, otherwise 0
          joinCount: 1,
          previousScore: 0,
        };
        contest.combineId.push(participant);
      } else {
        // If participant exists, update scores
        participant.previousScore = participant.score;
  
        if (isCorrect) {
          participant.score += 1; // Increment by 1 only for correct answers
        }
      }
  
      // Save the contest
      await contest.save();
  
      // Response with updated participant details
      res.json({
        combineId,
        contestId,
        gkquestionId,
        selectedOption,
        isCorrect,
        combineuser,
        previousScore: participant.previousScore,
        newScore: participant.score,
        joinCount: participant.joinCount,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
  });
  

app.get("/Weekly_leaderboard", authhentication, async (req, res) => {
    const { combineuser } = req.query;
    try {
        const topUsers = await Weeklyleaderboard.find().sort({ score: -1 }).limit(100000);
        res.json({ topUsers, RequestedBy: combineuser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

app.get("/Weekly_contest_show",  authhentication, async (req, res) => { 
    const { id } = req.query;
    try {
        let contests;
        if (id) {
            contests = await weeklycontest.findById(id);
            if (!contests) {
                return res.status(404).send({ message: "Contest not found" });
            }
            contests = [contests];
        } else {
            contests = await weeklycontest.find();
        }
        console.log(contests, "57t5 ")
        const contestsWithStatus = contests.map(contest => {
            const isFull = contest.combineId.length >= 1000000;
            return {
                contestId: contest._id,
                gameAmount: contest.amount,
                winningAmount:contest.winningAmount,
                isFull,
                players: contest.combineId.map(player => ({
                    combineId: player.id,
                    score: player.score,
                    fullname: player.fullname
                })),
            };
        });
        res.send({
            contests: contestsWithStatus,
            message: "Contests retrieved successfully"
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal server error");
    }
});

app.get("/Weekly_user_score",authhentication, async (req, res) => {
    const { combineId, contestId } = req.query;
    try {
      if (!combineId || !contestId) {
        return res.status(400).json({ error: "Missing combineId or contestId" });
      }
      const contestData = await weeklycontest.findOne({
        _id: contestId,
        "combineId.id": combineId, 
      });
      if (!contestData) {
        return res.status(404).json({ error: "Participant not found in contest" });
      }
      const participant = contestData.combineId.find(
        (user) => user.id.toString() === combineId
      );
      if (!participant) {
        return res.status(404).json({ error: "User not found in contest" });
      }
      res.status(200).json({
        score: participant.score,
        fullname: participant.fullname,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });


//monthly Api 
app.post("/monthly-contest",  async (req, res) => {
    const initialContestCount = 1;
    console.log("6")
    try {
        const contests = await createMonthlyMultipleContests(initialContestCount);
        res.json({
            message: "monthly contests created successfully",
            contests,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

app.post("/monthly_join_contest",  async (req, res) => {
    const { contestId, newcombineId, fullname } = req.body;
    try {
        if (!fullname) {
            return res.status(400).json({ message: "Fullname is required" });
        }

        console.log("Checking contest");

        // Find the contest by contestId
        const contestmonth = await monthContest.findById(contestId);
        if (!contestmonth) {
            return res.status(404).json({ message: "Contest not found" });
        }
        console.log("Contest found");

        // Check if the contest is full
        if (contestmonth.combineId.length >= 100000) {
            return res.status(400).json({ message: "Contest full" });
        }
        console.log("Space available in contest");

        // Find the user by newcombineId
        const user = await getUserById(newcombineId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        console.log("User found");

        // Check if the user has already joined the contest
        let userContestEntry = contestmonth.combineId.find((entry) => entry.id.toString() === newcombineId.toString());

        if (userContestEntry) {
            // If the user has already joined, update joinCount and reset score
            userContestEntry.joinCount += 1;
            userContestEntry.score = 0;
            console.log("User is joining again. JoinCount updated and score reset.");
        } else {
            // If the user is joining for the first time, add them with joinCount = 1 and score = 0
            contestmonth.combineId.push({ id: newcombineId, fullname, joinCount: 1, score: 0 });
            console.log("User added to contest for the first time.");
        }

        // Save the updated contest data
        await contestmonth.save();
        console.log("Contest updated with user's join information");

        // Respond with success message
        res.json({
            message: `User ${fullname} joined contest and game. Join count: ${userContestEntry ? userContestEntry.joinCount : 1}`,
            contestId,
        });
    } catch (err) {
        console.error("Error occurred:", err);
        res.status(500).json({ message: "Server Error" });
    }
});



app.post("/monthly_question",   async (req, res) => {
    const { combineId } = req.body;
    try {
        const othervalues = await CombineDetails.findById(combineId);
        if (!othervalues) {
            return res.status(400).send({ message: "user is not available" });
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



app.post("/monthly_answer", async (req, res) => {
    const { combineId, contestId, gkquestionId, selectedOption, combineuser } = req.body;
    try { 
        // Check if the question exists
        const question = await gkQuestion.findById(gkquestionId);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        // Check if the selected option is correct
        const isCorrect = question.correctAnswer === selectedOption;

        // Find the user's data
        const combinedata = await CombineDetails.findById(combineId);
        if (!combinedata) {
            return res.status(404).json({ message: "User not found" });
        }

        // Initialize contest score
        let contestScore = 0;

        // If the answer is correct, update user's score and leaderboard
        if (isCorrect) {
            // Increase the user's score
            combinedata.score += 1;
            await combinedata.save();

            // Update the leaderboard entry for the user
            let leaderboardEntry = await Monthlyleaderboard.findOne({ combineId: combineId });
            if (!leaderboardEntry) {
                leaderboardEntry = new Monthlyleaderboard({
                    combineId,
                    combineuser,
                    score: 0,
                    Wallet: 0
                });
            }
            leaderboardEntry.score += 1;
            console.log("Updated leaderboard entry:", leaderboardEntry);
            await leaderboardEntry.save();

            // Find the contest and update the user's score in the contest
            const contest = await monthContest.findById(contestId);
            if (!contest) {
                return res.status(404).json({ message: "Contest not found" });
            }
            const userContest = contest.combineId.find(user => user.id.toString() === combineId.toString());
            if (userContest) {
                // Increment the user's score in the contest
                userContest.score += 1;
                contestScore = userContest.score;
                await contest.save();
            }
        }

        // Respond with the updated information
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
        console.error("Server error:", err);
        res.status(500).json({ message: "Server Error" });
    }
});


app.get("/monthly_user_score",authhentication, async (req, res) => {
    const { combineId, contestId } = req.query;
    try {
      if (!combineId || !contestId) {
        return res.status(400).json({ error: "Missing combineId or contestId" });
      }
      const contestData = await monthContest.findOne({
        _id: contestId,
        "combineId.id": combineId, 
      });
      if (!contestData) {
        return res.status(404).json({ error: "Participant not found in contest" });
      }
      const participant = contestData.combineId.find(
        (user) => user.id.toString() === combineId
      );
      if (!participant) {
        return res.status(404).json({ error: "User not found in contest" });
      }
      res.status(200).json({
        score: participant.score,
        fullname: participant.fullname,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });


app.get("/monthly_contest_show",   async (req, res) => { 
    const { id } = req.query;
    try {
        let contests;
        console.log("1")
        if (id) {
            contests = await monthContest.findById(id);
            console.log("1")
            if (!contests) {
                return res.status(404).send({ message: "Contest not found" });
            }
            contests = [contests];
     
        } else {
            contests = await monthContest.find();
        }
     
        const contestsWithStatus = contests.map(contest => {
            const isFull = contest.combineId.length >= 1000000;
     
            return {
                contestId: contest._id,
                gameAmount: contest.amount,
                winningAmount:contest.winningAmount,
                isFull,
                players: contest.combineId.map(player => ({
                    combineId: player.id,
                    score: player.score,
                    fullname: player.fullname
                })),
            };
        });
        res.send({
            contests: contestsWithStatus,
            message: "Contests retrieved successfully"
        });
        
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal server error");
    }
});

app.get("/Monthly_leaderboard", authhentication, async (req, res) => {
    const { combineuser } = req.query;
    try {
        const topUsers = await Monthlyleaderboard.find().sort({ score: -1 }).limit(100000);
        res.json({ topUsers, RequestedBy: combineuser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// practice  Contest
app.post("/practice_Contest",authhentication, async (req, res) => {
    try {
        const { combineId, fullname } = req.body;
        console.log("Request body:", req.body);
        const newContest = new practiceContest({
            combineId: combineId,
            fullname: fullname,
            createdAt: new Date(),
        });
        await newContest.save();
        return res.status(201).json({
            message: "Contest created successfully",
            contest: newContest
        });

    } catch (error) {
        console.error("Error while creating contest:", error);
        return res.status(500).json({
            error: "An error occurred while creating the contest",
            details: error.message 
        });
    }
});

app.post("/practice_question", authhentication,  async (req, res) => {
    const { combineId } = req.body;
    try {
        const othervalues = await CombineDetails.findById(combineId);
        if (!othervalues) {
            return res.status(400).send({ message: "Data is not available" });
        }
        const count = await practiceQuestion.countDocuments();
        if (count === 0) {
            return res.status(404).send({
                message: "No questions available",
                totalQuestions: count,
            });
        }
        const randomIndex = Math.floor(Math.random() * count);
        const randomQuestion = await practiceQuestion.findOne().skip(randomIndex);
        res.status(200).send({ randomQuestion, totalQuestions: count });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal server error" });
    }
});

app.post("/practice_answer",authhentication, async (req, res) => {
    const { combineId, contestId, practiceQuestionId, selectedOption, fullname } = req.body; 

    try {
        const user = await CombineDetails.findById(combineId);
        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }

        const contest = await practiceContest.findById(contestId);
        if (!contest) {
            return res.status(404).send({ message: "Contest not found" });
        }

        if (!contest.combineId.equals(combineId)) {
            return res
                .status(403)
                .send({ message: "User is not part of this contest" });
        }

        const question = await practiceQuestion.findById(practiceQuestionId);
        if (!question) {
            return res.status(404).send({ message: "Question not found" });
        }

        const isCorrect = question.correctAnswer === selectedOption;

        if (isCorrect) {
            user.score += 1; 
            await user.save();

            contest.Score += 1; 
            await contest.save();
        }

        const answer = new practice_Answer({
            combineId,
            contestId,
            practiceQuestionId,
            selectedOption,
            fullname, 
        });
        await answer.save();

        const allAnswers = await practice_Answer.find({ practiceQuestionId });

        let totalCorrect = 0;
        let totalIncorrect = 0;

        allAnswers.forEach((ans) => {
            if (ans.selectedOption === question.correctAnswer) {
                totalCorrect++;
            } else {
                totalIncorrect++;
            }
        });

        res.status(200).send({
            combineId,
            fullname, 
            contestId,
            practiceQuestionId,
            selectedOption,
            isCorrect,
            score: user.score,
            contestScore: contest.Score,
            questionStats: {
                totalCorrectAnswers: totalCorrect,
                totalIncorrectAnswers: totalIncorrect,
            },
            message: `Your answer was ${
                isCorrect ? "correct" : "incorrect"
            }.`,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal server error" });
    }
});

app.get("/get_user_score",authhentication, async (req, res) => {
    const { combineId, contestId } = req.query;
    try {
        if (!combineId || !contestId) {
            return res.status(400).json({ error: "Missing combineId or contestId" });
        }
        const contestData = await practiceContest.findOne({
            _id: contestId,
            combineId: combineId,
        });
        if (!contestData) {
            return res.status(404).json({ error: "Participant not found in contest" });
        }
        const performance = contestData.Score < 5 
            ? "Bad" 
            : contestData.Score < 10 
            ? "Average" 
            : "Good";
        res.status(200).json({
            score: contestData.Score,
            fullname: contestData.fullname,
            performance: performance,
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Server error" });
    }
});



// key Api 
app.post('/create-key-contest',authhentication, async (req, res) => {
    const joinAmount = 21; 
    const participants = [];

    const generateKey = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
        let key = '';
        for (let i = 0; i < 6; i++) {
            key += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return key;
    };

    try {
        const key = generateKey();

        const prizePoll = joinAmount * participants.length * 2;

        const newContest = new KeyContest({
            key,
            prizePoll,
            joinAmount,
            participants,
        });

        await newContest.save();

        return res.status(201).json({
            success: true,
            message: 'Contest created successfully',
            contest: {
                key: newContest.key,
                prizePoll: newContest.prizePoll,
                joinAmount: newContest.joinAmount,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});


app.post('/join-contest-key',authhentication, async (req, res) => {
    const { key, combineId, fullname } = req.body;

    if (!key || !combineId || !fullname) {
        return res.status(400).json({ success: false, message: 'Key, Combine ID, and Fullname are required' });
    }

    try {
        const contest = await KeyContest.findOne({ key });

        if (!contest) {
            return res.status(404).json({ success: false, message: 'Invalid contest key' });
        }

        // Check if the key is older than 5 minutes
        const currentTime = new Date();
        const keyAgeInMinutes = (currentTime - contest.createdAt) / (1000 * 60);
        if (keyAgeInMinutes > 5) {
            return res.status(400).json({ success: false, message: 'Contest key has expired' });
        }

        const isAlreadyJoined = contest.participants.some(
            (participant) => participant.combineId.toString() === combineId
        );

        if (isAlreadyJoined) {
            return res.status(400).json({ success: false, message: 'User already joined the contest' });
        }

        // Add the participant to the contest
        contest.participants.push({ combineId, fullname });

        // Calculate prizePoll by multiplying 21 with the number of participants
        const participantCount = contest.participants.length;
        contest.prizePoll = 21 * participantCount; // Multiply by number of participants

        // Save the updated contest document
        await contest.save();

        return res.status(200).json({
            success: true,
            message: 'Joined contest successfully',
            contest: {
                key: contest.key,
                prizePoll: contest.prizePoll,
                joinAmount: 21,
                participants: contest.participants,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});



app.post("/manual_questions", async (req, res) => {
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

        if (!randomQuestion) {
            return res.status(404).send({ message: "Unable to fetch a question" });
        }
        res.status(200).send({ randomQuestion, totalQuestions: count });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal server error" });
    }
});

// Verify Answer Api
app.post("/manual_answer", authhentication, async (req, res) => {
    const { combineId, key, gkquestionId, selectedOption, combineuser } = req.body;
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
            let contest = await KeyContest.findOne({ key });
            if (!contest) {
                return res.status(404).json({ message: "Key not found" });
            }
            let userContest = contest.participants.find(
                (participant) => participant.combineId.toString() === combineId
            );
            if (userContest) {
                userContest.score = (userContest.score || 0) + 1; 
                contestScore = userContest.score;
                await contest.save();
            }
        }

        res.json({
            combineId,
            key,
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








// Site Api

app.post("/addquestiongk", async (req, res) => {
    try {
        const { question, correctAnswer, options } = req.body;
        if (!question || !correctAnswer || !options) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (!Array.isArray(options) || options.length < 2) {
            return res.status(400).json({ message: "Options must be an array with at least two elements" });
        }
        const existingQuestion = await gkQuestion.findOne({ question });
        if (existingQuestion) {
            return res.status(400).json({ message: "Question already exists" });
        }
        const newQuestion = new gkQuestion({
            question,
            correctAnswer,
            options
        });
        await newQuestion.save();

        res.status(201).json({
            message: "Question added successfully",
            question: newQuestion
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});


app.post("/addquestionpractice", async (req, res) => {
    try {
        const { question, correctAnswer, options } = req.body;
        if (!question || !correctAnswer || !options) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (!Array.isArray(options) || options.length < 2) {
            return res.status(400).json({ message: "Options must be an array with at least two elements" });
        }
        const existingQuestion = await practiceQuestion.findOne({ question });
        if (existingQuestion) {
            return res.status(400).json({ message: "Question already exists" });
        }
        const newQuestion = new practiceQuestion({
            question,
            correctAnswer,
            options
        });
        await newQuestion.save();

        res.status(200).json({
            message: "Question added successfully",
            question: newQuestion
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});


// School APi 
app.post('/create-school-contest',authhentication, async (req, res) => {
    const { schoolName } = req.body;

    try {
        const newContest = new SchoolContest({
            schoolName,
            participants: [], 
            maxParticipants: 100000 
        });
        await newContest.save();
        res.json({
            message: 'School contest created successfully',
            contest: newContest
        });
    } catch (err) {
        console.error('Error creating school contest:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});


app.post('/join-school-contest', authhentication, async (req, res) => {
    const { schoolName, combineId, fullname, schoolContestId } = req.body; 
    try {
        const user = await CombineDetails.findById( combineId); 
        
        if (!user) {
            return res.status(400).json({ message: 'User does not exist.' });
        }
        if (user.studentDetails.schoolName.trim().toLowerCase() !== schoolName.trim().toLowerCase()) {
            return res.status(400).json({ message: 'User is not from the specified school.' });
        }
        const contest = await SchoolContest.findById(schoolContestId);
        if (!contest || contest.schoolName.trim().toLowerCase() !== schoolName.trim().toLowerCase()) {
            return res.status(404).json({ message: 'Contest not found for the specified school.' });
        }
        const participantExists = contest.participants.some(participant => participant.combineId.toString() === combineId);
        if (participantExists) {
            return res.status(400).json({ message: 'User is already a participant in this contest.' });
        }
        contest.participants.push({ combineId, fullname, score: 0 });
        await contest.save();
        res.json({
            message: 'User has successfully joined the contest.',
            contest,
        });
    } catch (err) {
        console.error('Error joining contest:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});


app.post("/school-question",authhentication, async (req, res) => {
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

        if (!randomQuestion) {
            return res.status(404).send({ message: "Unable to fetch a question" });
        }
        res.status(200).send({ randomQuestion, totalQuestions: count });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal server error" });
    }
});


app.post("/addquestion", async (req, res) => {
    try {
      const { collectionName, question, correctAnswer, options } = req.body;
      if (!collectionName || !question || !correctAnswer || !options || !Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ message: "All fields are required, and options must have at least two items." });
      }
      const QuestionModel = mongoose.model(collectionName, questionSchema, collectionName);
      const newQuestion = new QuestionModel({
        question,
        correctAnswer,
        options,
      });
      await newQuestion.save();
      const documentCount = await QuestionModel.countDocuments();
  
      res.status(201).json({
        message: `Question added to the ${collectionName} collection successfully.`,
        question: newQuestion,
        totalDocuments: documentCount,
      });
    } catch (error) {
      console.error("Error adding question:", error);
      res.status(500).json({ message: "Server Error" });
    }
  });
  

// test Api 


app.get("/address" , async (req,res)=>{{
    console.log("2")
        res.json("api Start")
        console.log("2")
    }})



app.listen(PORT, () => {
    console.log("Server is running on port 5000");
})
