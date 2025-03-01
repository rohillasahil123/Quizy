const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const cors = require ("cors");
const cookieParser = require('cookie-parser');
const {ensureAuthenticated} = require('./Middelware/authenticateMiddleware.js')
const authRoute = require("./companyRoutes/authRoutes.js");
const companyRoutes = require("./companyRoutes/companyRoutes.js");
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
const Schoolform = require("./Model/SchoolForm.js")
const StudentSite = require("./Model/StudentSite.js")
const AppDetails = require("./Model/AppDetails.js");
const { getShoppingPartner } = require("./controllers/shoppingController.js");
const Transaction = require("./Model/Transaction");
const WithdrawalRequest = require("./Model/WithdrawalRequest.js");
const Razorpay = require("razorpay");


const app = express();

const secretKey = "credmantra";
const fast2smsAPIKey = "kuM9ZYAPpRt0hFqVW71UbOxygli64dDrQzew3JLojN5HTfaIvskCR4bYSDAznIa6VxGmuq0ytT72LZ5f";
const razorpay = new Razorpay({
    key_id: 'rzp_test_RmdMvunFIzaQ6d',
    key_secret: 'Ai6rSepUG8YxM62GmDISEk9a',
});

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true); // Allow requests with no origin (e.g., mobile apps)

            callback(null, true); // Allow all origins dynamically
        },
        credentials: true, // Allow cookies and authentication headers
    })
);
// app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());


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

app.post("/verify-refferralCode", async (req, res) => {
    try {
        let referralBonusForUser = 10;
        let referralBonusForReferrer = 10; 

        const { referredBy, phoneNumber } = req.body;
        const phoneNumberData = await PhoneNumber.findOne({ phoneNumber });
        if (!phoneNumberData) {
            return res.status(202).json({ success: false, message: "Your are not verified" });
        }
        if (referredBy && referredBy.trim() !== "") {
            const upperCaseReferredBy = referredBy.toUpperCase();
            const referralRecord = await CombineDetails.findOne({
                $or: [
                    { "formDetails.referralCode": upperCaseReferredBy },
                    { "studentDetails.referralCode": upperCaseReferredBy },
                ],
            });
            if (!referralRecord) {
                return res.status(202).json({ success: false, message: "Referral code not found" });
            }
            let referrerWallet = await Wallet.findOne({ combineId: referralRecord._id });
            if (!referrerWallet) {
                referrerWallet = new Wallet({ combineId: referralRecord._id, referralBalance: referralBonusForReferrer });
            } else {
                referrerWallet.referralBalance += referralBonusForReferrer;
            }
            await referrerWallet.save();
            await logTransaction(referralRecord._id, referralBonusForReferrer, "credit", "Refferal bonus", "completed");

            const referredByDetails = {
                userId: referralRecord._id,
                fullname: referralRecord.formDetails?.fullname || referralRecord.studentDetails?.fullname,
            };
            phoneNumberData.referredBy = referredByDetails;
            await phoneNumberData.save();

            res.status(200).json({success: true, message: "Referral code is Applied"});
        }
    } catch (error) {
        console.error("Error apply referral code:", error);
        res.status(500).send({
            error: "Apply referral code error occurred",
        });
    }
})

app.get("/getReferralCode", async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) 
            return res.status(400).json({ message: "userId is required" });
        const userRecord = await CombineDetails.findOne(
            { _id: userId },
            "formDetails.referralCode studentDetails.referralCode"
        );
        if (!userRecord) {
            return res.status(404).json({ message: "User not found" });
        }
        const referralCode = userRecord.formDetails?.referralCode || userRecord.studentDetails?.referralCode;
        if (!referralCode) {
            return res.status(404).json({ message: "Referral code not found" });
        }
        res.status(200).json({ referralCode });
    } catch (error) {
        console.error("Error getting referral code:", error);
        res.status(500).json({ message: "Failed to get referral code", details: error.message });
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
        let initialAmountForUser = 10;
        let referralBonusForUser = 10;

        let referralCode;
        let isUnique = false;

        while (!isUnique) {
            referralCode = otpGenerator.generate(8, {
                lowerCaseAlphabets: false,
                upperCaseAlphabets: true,
                specialChars: false,
                number: true,
            });
            const existingReferral = await CombineDetails.findOne({
                $or: [
                    { "formDetails.referralCode": referralCode },
                    { "studentDetails.referralCode": referralCode },
                ],
            });
            if (!existingReferral) {
                isUnique = true; 
            }
        }
        req.body.referralCode = referralCode;

        if (req.body.phoneNumber) {
            const phoneNumberData = await PhoneNumber.findOne({ phoneNumber: req.body.phoneNumber });
            if (phoneNumberData && phoneNumberData.referredBy) {
                req.body.referredBy = phoneNumberData.referredBy;
            }
        }
        
        const data = new CombineDetails({ formDetails: req.body });
        const result = await data.save();
        let wallet = await Wallet.findOne({ combineId: result._id });
        if (!wallet) {
            wallet = new Wallet({ combineId: result._id, balance: initialAmountForUser});
            await logTransaction(result._id, initialAmountForUser, "credit", "Reward Money", "completed");
        } 

        if (req.body.referredBy.userId != null && req.body.referredBy.userId != '' && req.body.referredBy.userId != undefined) {
            if (wallet) {
                wallet.referralBalance = (wallet.referralBalance || 0) + referralBonusForUser;
                await logTransaction(result._id, referralBonusForUser, "credit", "Referral Bonus", "completed");
            }
        }

        // Wallet //
        console.log(wallet);
        await wallet.save();
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
        let initialAmountForUser = 10;
        
        let referralCode;
        let isUnique = false;

        while (!isUnique) {
            referralCode = otpGenerator.generate(8, {
                lowerCaseAlphabets: false,
                upperCaseAlphabets: true,
                specialChars: false,
                number: true,
            });
            const existingReferral = await CombineDetails.findOne({
                $or: [
                    { "formDetails.referralCode": referralCode },
                    { "studentDetails.referralCode": referralCode },
                ],
            });
            if (!existingReferral) {
                isUnique = true; 
            }
        }
        req.body.referralCode = referralCode;

        if (req.body.phoneNumber) {
            const phoneNumberData = await PhoneNumber.findOne({ phoneNumber: req.body.phoneNumber });
            if (phoneNumberData && phoneNumberData.referredBy) {
                req.body.referredBy = phoneNumberData.referredBy;
            }
        }

        const studentdata = new CombineDetails({ studentDetails: studentData });
        const studentResult = await studentdata.save();
        console.log("Student-Result:", studentResult);
        let wallet = await Wallet.findOne({ combineId: studentResult._id });
        if (!wallet) {
            wallet = new Wallet({ combineId: studentResult._id, balance: initialAmountForUser});
            await logTransaction(studentResult._id, initialAmountForUser, "credit", "Reward Money", "completed");
        }

        if (req.body.referredBy.userId != null && req.body.referredBy.userId != '' && req.body.referredBy.userId != undefined) {
            if (wallet) {
                wallet.referralBalance = (wallet.referralBalance || 0) + referralBonusForUser;
                await logTransaction(studentResult._id, referralBonusForUser, "credit", "Referral Bonus", "completed");
            }
        }
        
        await wallet.save();
        console.log("Saved Wallet:", wallet);
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
app.post("/create-contest_new",  async (req, res) => {
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

app.post("/join-game", authhentication, async (req, res) => {
    const { contestId, combineId, fullname } = req.body;

    try {
        const [contest, wallet] = await Promise.all([
            contestdetails.findById(contestId),
            getWalletBycombineId(combineId),
        ]);

        if (!contest) return res.status(404).json({ message: "Contest not found" });
        if (!wallet) return res.status(404).json({ message: "Wallet not found" });

        const gameAmount = contest.amount;
        const fiftyPercentGameAmount = gameAmount * 0.5;

        const amountFromReferralBalance = Math.min(wallet.referralBalance, fiftyPercentGameAmount);
        const amountFromMainBalance = gameAmount - amountFromReferralBalance;

        if (wallet.balance < amountFromMainBalance) {
            return res.status(400).json({ message: "Insufficient balance" });
        }

        if (contest.combineId.length >= contest.maxParticipants) {
            return res.status(400).json({ message: "Contest is already full" });
        }

        wallet.balance -= amountFromMainBalance;
        wallet.referralBalance -= amountFromReferralBalance;
        await wallet.save();

        await Promise.all([
            amountFromMainBalance > 0 && logTransaction(combineId, -amountFromMainBalance, "debit", "Contest fee", "completed"),
            amountFromReferralBalance > 0 && logTransaction(combineId, -amountFromReferralBalance, "debit", "Contest fee", "completed"),
        ]);

        contest.combineId.push({ id: combineId, fullname });
        await contest.save();
        
        // if (contest.combineId.length >= contest.maxParticipants) {
        //     contest.isFull = true;
        //     await Promise.all([
        //         contest.save(),
        //         createNewContest(gameAmount),
        //     ]);
        // }
        res.json({
            message: "Successfully joined the contest",
            balance: wallet.balance,
            referralBalance: wallet.referralBalance,
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
        await logTransaction(newcombineId, -gameAmount, "debit", "Contest fee", "completed");
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
            // let leaderboardEntry = await leaderboarddetail.findOne({ combineId });
            // if (!leaderboardEntry) {
            //     leaderboardEntry = new leaderboarddetail({
            //         combineId,
            //         combineuser,
            //         score: 0,
            //     });
            // }
            // leaderboardEntry.score += 1;
            // await leaderboardEntry.save();
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

            // let leaderboardEntry = await leaderboarddetail.findOne({ combineId });
            // if (!leaderboardEntry) {
            //     leaderboardEntry = new leaderboarddetail({
            //         combineId,
            //         combineuser,
            //         score: 0,
            //     });
            // }
            // leaderboardEntry.score += 1;
            // await leaderboardEntry.save();
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
                let isFull = false;
                // isFull = contest.combineId.length >= 2;

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
app.post("/1-12_create-contest",authhentication, async (req, res) => {
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

app.post("/1-12_join-contest", authhentication, async (req, res) => {
    const { contestId, combineId, fullname } = req.body;

    try {
        const [contest, wallet] = await Promise.all([
            studentContestQuestion.findById(contestId),
            getWalletBycombineId(combineId),
        ]);

        if (!contest) return res.status(404).json({ message: "Contest not found" });
        if (!wallet) return res.status(404).json({ message: "Wallet not found" });

        const gameAmount = contest.amount;
        const fiftyPercentGameAmount = gameAmount * 0.5;

        const amountFromReferralBalance = Math.min(wallet.referralBalance, fiftyPercentGameAmount);
        const amountFromMainBalance = gameAmount - amountFromReferralBalance;

        if (wallet.balance < amountFromMainBalance) {
            return res.status(400).json({ message: "Insufficient balance" });
        }

        if (contest.combineId.length >= contest.maxParticipants) {
            return res.status(400).json({ message: "Contest is already full" });
        }

        wallet.balance -= amountFromMainBalance;
        wallet.referralBalance -= amountFromReferralBalance;
        await wallet.save();

        await Promise.all([
            amountFromMainBalance > 0 && logTransaction(combineId, -amountFromMainBalance, "debit", "Contest fee", "completed"),
            amountFromReferralBalance > 0 && logTransaction(combineId, -amountFromReferralBalance, "debit", "Contest fee", "completed"),
        ]);

        contest.combineId.push({ id: combineId, fullname });
        await contest.save();

        // if (contest.combineId.length >= contest.maxParticipants) {
        //     contest.isFull = true;
        //     await Promise.all([
        //         contest.save(),
        //         createNewContestSchool(gameAmount),
        //     ]);
        // }
        res.json({
            message: "Successfully joined the contest",
            balance: wallet.balance,
            referralBalance: wallet.referralBalance,
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
app.post("/1-12_answer", authhentication, async (req, res) => {
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

        let contestScore = combinedata.score;

        if (isCorrect) {
            combinedata.score += 1;
            await combinedata.save();

            // let leaderboardEntry = await leaderboarddetail.findOne({ combineId });
            // if (!leaderboardEntry) {
            //     leaderboardEntry = new leaderboarddetail({
            //         combineId,
            //         combineuser,
            //         score: 0,
            //     });
            // }
            // leaderboardEntry.score += 1;
            // await leaderboardEntry.save();

            let contest = await studentContestQuestion.findById(contestId);
            if (!contest) {
                return res.status(404).json({ message: "Contest not found" });
            }

            let userContest = contest.combineId.find((user) => user.id.toString() === combineId.toString());
            if (userContest) {
                userContest.score += 1;
                contestScore = userContest.score; // Update contestScore based on the user's score
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

// app.post("/1-12_answer", async (req, res) => {
//     const { combineId, contestId, gkquestionId, selectedOption, combineuser } = req.body;
//     try {
//         const question = await gkQuestion.findById(gkquestionId);
//         if (!question) {
//             return res.status(404).json({ message: "Question not found" });
//         }
//         const isCorrect = question.correctAnswer === selectedOption;
//         console.log(isCorrect, "isCorrect")
        
//         const combinedata = await CombineDetails.findById(combineId);
//         if (!combinedata) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         let contestScore = 0; // Default score

//         if (isCorrect) {
//             // Update user score
//             combinedata.score === 0;
//            const result =  combinedata.score += 1;
           
//             await combinedata.save();
//             console.log(result, "result")

//             const contest = await studentContestQuestion.findById(contestId);
//             if (!contest) {
//                 return res.status(404).json({ message: "Contest not found" });
//             }

//             // Find user contest entry
//             const userContest = contest.combineId.find(
//                 (user) => user.id.toString() === combineId.toString()
//             );
//             if (userContest) {
//                 userContest.score += 1;
//                 contestScore = userContest.score; // Assign updated score
//                 await contest.save(); // Save contest data
//             }
//         }

//         res.json({
//             combineId,
//             contestId,
//             gkquestionId,
//             selectedOption,
//             isCorrect,
//             combineuser,
//             score: contestScore, 
//         });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Server Error" });
//     }
// });

app.post("/1-12_update-score", authhentication, async (req, res) => {
    const { combineId, tempScore, isValid, completionTime, combineuser } = req.body;
  
    if (typeof tempScore !== "number" || typeof isValid !== "boolean") {
      return res.status(400).json({ message: "Invalid input format." });
    }
  
    try {
      let scoreData = await Weeklyleaderboard.findOne({ combineId });
      if (!scoreData) {
        // Create a new document if it doesn't exist
        scoreData = new Weeklyleaderboard({
            combineId,
            score: isValid ? tempScore : 0,
            tempScore: null,
            isValid,
            combineuser: combineuser,
            completionTime: isValid ? completionTime : null,
        });

        await scoreData.save();
        return res.status(200).json({
            message: isValid
              ? "Temp score successfully added to the real score."
              : "Temp score reset without affecting the real score.",
            score: scoreData.score,
            combineId,
          });
      }
  
      if (isValid) {
        scoreData.score = tempScore; 
        scoreData.completionTime = completionTime;
    }
  
      scoreData.tempScore = null; 
      scoreData.isValid = isValid;
  
      await scoreData.save();
  
      return res.status(200).json({
        message: isValid
          ? "Temp score successfully added to the real score."
          : "Temp score reset without affecting the real score.",
        score: scoreData.score,
        combineId,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error." });
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
        await logTransaction(combineId, -gameAmount, "debit", "Contest fee", "completed");
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

            // let leaderboardEntry = await leaderboarddetail.findOne({ combineId });
            // if (!leaderboardEntry) {
            //     leaderboardEntry = new leaderboarddetail({
            //         combineId,
            //         combineuser,
            //         score: 0,
            //     });
            // }
            // leaderboardEntry.score += 1;

            // await leaderboardEntry.save();

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
        const topUsers = await leaderboarddetail.find().sort({ score: -1, completionTime: 1 }).limit(100000000);
        res.json({ topUsers, RequestedBy: combineuser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

app.post("/daily_update_score", authhentication,  async (req, res) => {
    const { combineId, tempScore, isValid, completionTime, combineuser } = req.body;
  
    if (typeof tempScore !== "number" || typeof isValid !== "boolean") {
      return res.status(400).json({ message: "Invalid input format." });
    }
  
    try {
      let scoreData = await leaderboarddetail.findOne({ combineId });
      if (!scoreData) {
        // Create a new document if it doesn't exist
        scoreData = new leaderboarddetail({
            combineId,
            score: isValid ? tempScore : 0,
            tempScore: null,
            isValid,
            combineuser: combineuser,
            completionTime: isValid ? completionTime : null,
        });

        await scoreData.save();
        return res.status(200).json({
            message: isValid
              ? "Temp score successfully added to the real score."
              : "Temp score reset without affecting the real score.",
            score: scoreData.score,
            combineId,
          });
      }
  
      if (isValid) {
        scoreData.score = tempScore; 
        scoreData.completionTime = completionTime;
    }
  
      scoreData.tempScore = null; 
      scoreData.isValid = isValid;
  
      await scoreData.save();
  
      return res.status(200).json({
        message: isValid
          ? "Temp score successfully added to the real score."
          : "Temp score reset without affecting the real score.",
        score: scoreData.score,
        combineId
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error." });
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

    const trty = await logTransaction(combineId, amount, "credit", "Add Money", "completed");
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
 
app.post("/mega-contest",authhentication, async (req, res) => {
    const initialContestCount = 1;
    try {
        const contests = await createMegaMultipleContests(initialContestCount);
        res.json({
            message: "Mega contests created successfully",
            contests,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

app.post("/mega_question", authhentication, async (req, res) => {
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

app.post("/mega_join_contest", authhentication, async (req, res) => {
    const { contestId, newcombineId, fullname } = req.body;

    try {
        const [contest, wallet] = await Promise.all([
            Megacontest.findById(contestId),
            getWalletBycombineId(newcombineId),
        ]);

        if (!contest) return res.status(404).json({ message: "Contest not found" });
        if (!wallet) return res.status(404).json({ message: "Wallet not found" });

        const gameAmount = contest.amount;
        const fiftyPercentGameAmount = gameAmount * 0.5;

        const amountFromReferralBalance = Math.min(wallet.referralBalance, fiftyPercentGameAmount);
        const amountFromMainBalance = gameAmount - amountFromReferralBalance;

        if (wallet.balance < amountFromMainBalance) {
            return res.status(400).json({ message: "Insufficient balance" });
        }

        const userEntry = contest.combineId.find(
            (entry) => entry.id.toString() === newcombineId.toString()
        );

        if (userEntry) {
            userEntry.joinCount += 1; // Increment join count if user exists
        } else {
            contest.combineId.push({ id: newcombineId, fullname, joinCount: 1 }); // Add new user
        }
        wallet.balance -= amountFromMainBalance;
        wallet.referralBalance -= amountFromReferralBalance;
        await wallet.save();

        await Promise.all([
            amountFromMainBalance > 0 && logTransaction(newcombineId, -amountFromMainBalance, "debit", "Contest fee", "completed"),
            amountFromReferralBalance > 0 && logTransaction(newcombineId, -amountFromReferralBalance, "debit", "Contest fee", "completed"),
        ]);
        await contest.save();

        // if (contest.combineId.length >= contest.maxParticipants) {
        //     contest.isFull = true;
        //     await Promise.all([
        //         contest.save(),
        //         createNewMegaContest(gameAmount), // Replace with your function to create a new mega contest
        //     ]);
        // }
        res.json({
            message: "User mega successfully joined the contest!",
            joinCount: userEntry ? userEntry.joinCount : 1,
            balance: wallet.balance,
            referralBalance: wallet.referralBalance,
        });
    } catch (err) {
        console.error("Error occurred:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

app.post("/mega_answer", authhentication, async (req, res) => {
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

            const contest = await Megacontest.findById(contestId);
            console.log(contest, "contest")
            if (!contest) {
                return res.status(404).json({ message: "Contest not found" });
            }

            if (!Array.isArray(contest.combineId)) {
                return res.status(400).json({ message: "Invalid contest data" });
            }

            const userContest = contest.combineId.find(
                (user) => user.id.toString() === combineId.toString()
            );
            if (userContest) {
                userContest.score += 1;
                contestScore = userContest.score;
                await contest.save();
            }

            // Update leaderboard
            // const leaderboard = await Megaleaderboard.findOne({ combineId });

            // if (!leaderboard) {
            //     // Create a new leaderboard entry
            //     const newLeaderboard = new Megaleaderboard({
            //         combineId,
            //         score: contestScore,
            //         combineuser
            //     });
            //     await newLeaderboard.save();
            // } else {
            //     leaderboard.score = contestScore;
            //     leaderboard.combineuser = combineuser;
            //     await leaderboard.save();
            // }
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

app.post("/mega_reset_score", authhentication, async (req, res) => {
    const { combineId, contestId } = req.body;
    try {
      
        const combinedata = await CombineDetails.findById(combineId);
        if (!combinedata) {
            return res.status(404).json({ message: "User not found" });
        }

        // Reset user score
        combinedata.score = 0;
        await combinedata.save();

        const contest = await Megacontest.findById(contestId);
        if (!contest) {
            return res.status(404).json({ message: "Contest not found" });
        }
        const userContest = contest.combineId.find(
            (user) => user.id.toString() === combineId.toString()
        );
        if (userContest) {
            userContest.score = 0;  
            await contest.save();
        }
        res.json({
            message: "Score reset successfully",
            combineId,
            contestId,
            score: 0,  
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

app.post("/mega_update_score", authhentication, async (req, res) => {
    const { combineId, tempScore, isValid, completionTime, combineuser } = req.body;
  
    if (typeof tempScore !== "number" || typeof isValid !== "boolean") {
      return res.status(400).json({ message: "Invalid input format." });
    }
  
    try {
      let scoreData = await Megaleaderboard.findOne({ combineId });
      if (!scoreData) {
        // Create a new document if it doesn't exist
        scoreData = new Megaleaderboard({
            combineId,
            score: isValid ? tempScore : 0,
            tempScore: null,
            isValid,
            combineuser: combineuser,
            completionTime: isValid ? completionTime : null,
        });

        await scoreData.save();
        return res.status(200).json({
            message: isValid
              ? "Temp score successfully added to the real score."
              : "Temp score reset without affecting the real score.",
            score: scoreData.score,
            combineId,
          });
      }
  
      if (isValid) {
        scoreData.score = tempScore; 
        scoreData.completionTime = completionTime;
    }
  
      scoreData.tempScore = null; 
      scoreData.isValid = isValid;
  
      await scoreData.save();
  
      return res.status(200).json({
        message: isValid
          ? "Temp score successfully added to the real score."
          : "Temp score reset without affecting the real score.",
        score: scoreData.score,
        combineId
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error." });
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
        const topUsers = await Megaleaderboard.find().sort({ score: -1, completionTime: 1 }).limit(100000);
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

app.post("/mega_question", authhentication, async (req, res) => {
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

// Weekly Api 
app.post("/weekly-contest", async (req, res) => {
    const initialContestCount = 1;
    console.log("6")
    try {
        const contests = await createWeeklyContests(initialContestCount);
        res.json({
            message: "Weekly contests created successfully",
            contests,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

app.post("/weekly_join_contest", authhentication, async (req, res) => {
    const { contestId, newcombineId, fullname } = req.body;

    try {
        const [contest, wallet] = await Promise.all([
            weeklycontest.findById(contestId),
            getWalletBycombineId(newcombineId),
        ]);

        if (!contest) return res.status(404).json({ message: "Contest not found" });
        if (!wallet) return res.status(404).json({ message: "Wallet not found" });

        const gameAmount = contest.amount;
        const fiftyPercentGameAmount = gameAmount * 0.5;

        const amountFromReferralBalance = Math.min(wallet.referralBalance, fiftyPercentGameAmount);
        const amountFromMainBalance = gameAmount - amountFromReferralBalance;

        if (wallet.balance < amountFromMainBalance) {
            return res.status(400).json({ message: "Insufficient balance" });
        }

        const userEntry = contest.combineId.find(
            (entry) => entry.id.toString() === newcombineId.toString()
        );

        if (userEntry) {
            userEntry.joinCount += 1; // Increment join count if user exists
        } else {
            contest.combineId.push({ id: newcombineId, fullname, joinCount: 1 }); // Add new user
        }

        wallet.balance -= amountFromMainBalance;
        wallet.referralBalance -= amountFromReferralBalance;
        await wallet.save();

        await Promise.all([
            amountFromMainBalance > 0 && logTransaction(newcombineId, -amountFromMainBalance, "debit", "Contest fee", "completed"),
            amountFromReferralBalance > 0 && logTransaction(newcombineId, -amountFromReferralBalance, "debit", "Contest fee", "completed"),
        ]);
        await contest.save();

        // if (contest.combineId.length >= contest.maxParticipants) {
        //     contest.isFull = true;
        //     await Promise.all([
        //         contest.save(),
        //         createNewWeeklyContest(gameAmount), // Replace with your function to create a new weekly contest
        //     ]);
        // }
        res.json({
            message: "User successfully joined the weekly contest!",
            joinCount: userEntry ? userEntry.joinCount : 1,
            balance: wallet.balance,
            referralBalance: wallet.referralBalance,
        });

    } catch (err) {
        console.error("Error occurred:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

app.post("/weekly_question", authhentication, async (req, res) => {
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


app.post("/weekly_answer", authhentication, async (req, res) => {
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

            // Update contest score
            const contest = await weeklycontest.findById(contestId);
            if (!contest) {
                return res.status(404).json({ message: "Contest not found" });
            }

            if (!Array.isArray(contest.combineId)) {
                return res.status(400).json({ message: "Invalid contest data" });
            }

            const userContest = contest.combineId.find(
                (user) => user.id.toString() === combineId.toString()
            );
            if (userContest) {
                userContest.score += 1;
                contestScore = userContest.score;
                await contest.save();
            }

            // Update leaderboard
            // const leaderboard = await Weeklyleaderboard.findOne({ combineId });

            // if (!leaderboard) {
            //     // Create a new leaderboard entry
            //     const newLeaderboard = new Weeklyleaderboard({
            //         combineId,
            //         score: contestScore,
            //         combineuser
            //     });
            //     await newLeaderboard.save();
            // } else {
            //     // Update existing leaderboard entry
            //     leaderboard.score = contestScore;
            //     leaderboard.combineuser = combineuser;
            //     await leaderboard.save();
            // }
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

app.post("/weekly_reset_score", authhentication, async (req, res) => {
    const { combineId, contestId } = req.body;
    try {
      
        const combinedata = await CombineDetails.findById(combineId);
        if (!combinedata) {
            return res.status(404).json({ message: "User not found" });
        }

        // Reset user score
        combinedata.score = 0;
        await combinedata.save();

        const contest = await weeklycontest.findById(contestId);
        if (!contest) {
            return res.status(404).json({ message: "Contest not found" });
        }
        const userContest = contest.combineId.find(
            (user) => user.id.toString() === combineId.toString()
        );
        if (userContest) {
            userContest.score = 0;  
            await contest.save();
        }
        res.json({
            message: "Score reset successfully",
            combineId,
            contestId,
            score: 0,  
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

app.post("/weekly_update-score", authhentication, async (req, res) => {
    const { combineId, tempScore, isValid, completionTime, combineuser } = req.body;
  
    if (typeof tempScore !== "number" || typeof isValid !== "boolean") {
      return res.status(400).json({ message: "Invalid input format." });
    }
  
    try {
      let scoreData = await Weeklyleaderboard.findOne({ combineId });
      if (!scoreData) {
        // Create a new document if it doesn't exist
        scoreData = new Weeklyleaderboard({
            combineId,
            score: isValid ? tempScore : 0,
            tempScore: null,
            isValid,
            combineuser: combineuser,
            completionTime: isValid ? completionTime : null,
        });

        await scoreData.save();
        return res.status(200).json({
            message: isValid
              ? "Temp score successfully added to the real score."
              : "Temp score reset without affecting the real score.",
            score: scoreData.score,
            combineId,
          });
      }
  
      if (isValid) {
        scoreData.score = tempScore; 
        scoreData.completionTime = completionTime;
      }
  
      scoreData.tempScore = null; 
      scoreData.isValid = isValid;
  
      await scoreData.save();
  
      return res.status(200).json({
        message: isValid
          ? "Temp score successfully added to the real score."
          : "Temp score reset without affecting the real score.",
        score: scoreData.score,
        combineId,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error." });
    }
});
  
app.get("/Weekly_leaderboard", authhentication, async (req, res) => {
    const { combineuser } = req.query;
    try {
        const topUsers = await Weeklyleaderboard.find().sort({ score: -1, completionTime: 1 }).limit(100000);
        res.json({ topUsers, RequestedBy: combineuser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

app.get("/Weekly_contest_show",authhentication, async (req, res) => { 
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
                    score: player.updatedscore,
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
app.post("/monthly-contest", authhentication, async (req, res) => {
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


app.post("/monthly_question", authhentication, async (req, res) => {
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


app.post("/monthly_join_contest", authhentication, async (req, res) => {
    const { contestId, newcombineId, fullname } = req.body;

    try {
        const [contest, wallet] = await Promise.all([
            monthContest.findById(contestId),
            getWalletBycombineId(newcombineId),
        ]);

        if (!contest) return res.status(404).json({ message: "Contest not found" });
        if (!wallet) return res.status(404).json({ message: "Wallet not found" });

        const gameAmount = contest.amount;
        const fiftyPercentGameAmount = gameAmount * 0.5;

        const amountFromReferralBalance = Math.min(wallet.referralBalance, fiftyPercentGameAmount);
        const amountFromMainBalance = gameAmount - amountFromReferralBalance;

        if (wallet.balance < amountFromMainBalance) {
            return res.status(400).json({ message: "Insufficient balance" });
        }

        const userEntry = contest.combineId.find(
            (entry) => entry.id.toString() === newcombineId.toString()
        );

        if (userEntry) {
            userEntry.joinCount += 1;
        } else {
            contest.combineId.push({ id: newcombineId, fullname, joinCount: 1 });
        }

        wallet.balance -= amountFromMainBalance;
        wallet.referralBalance -= amountFromReferralBalance;
        await wallet.save();

        await Promise.all([
            amountFromMainBalance > 0 && logTransaction(newcombineId, -amountFromMainBalance, "debit", "Contest fee", "completed"),
            amountFromReferralBalance > 0 && logTransaction(newcombineId, -amountFromReferralBalance, "debit", "Contest fee", "completed"),
        ]);
        await contest.save();

        // if (contest.combineId.length >= contest.maxParticipants) {
        //     contest.isFull = true;
        //     await Promise.all([
        //         contest.save(),
        //         createNewMonthlyContest(gameAmount),
        //     ]);
        // }
        res.json({
            message: "User successfully joined the monthly contest!",
            joinCount: userEntry ? userEntry.joinCount : 1,
            balance: wallet.balance,
            referralBalance: wallet.referralBalance,
        });
    } catch (err) {
        console.error("Error occurred:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

app.post("/monthly_answer", authhentication, async (req, res) => {
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

            // Update contest score
            const contest = await monthContest.findById(contestId);
            if (!contest) {
                return res.status(404).json({ message: "Contest not found" });
            }

            if (!Array.isArray(contest.combineId)) {
                return res.status(400).json({ message: "Invalid contest data" });
            }

            const userContest = contest.combineId.find(
                (user) => user.id.toString() === combineId.toString()
            );
            if (userContest) {
                userContest.score += 1;
                contestScore = userContest.score;
                await contest.save();
            }

            // Update leaderboard
            // const leaderboard = await Monthlyleaderboard.findOne({ combineId });

            // if (!leaderboard) {
            //     // Create a new leaderboard entry
            //     const newLeaderboard = new Monthlyleaderboard({
            //         combineId,
            //         score: contestScore,
            //         combineuser
            //     });
            //     await newLeaderboard.save();
            // } else {
            //     // Update existing leaderboard entry
            //     leaderboard.score = contestScore;
            //     leaderboard.combineuser = combineuser;
            //     await leaderboard.save();
            // }
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

app.post("/monthly_reset_score", authhentication, async (req, res) => {
    const { combineId, contestId } = req.body;
    try {
      
        const combinedata = await CombineDetails.findById(combineId);
        if (!combinedata) {
            return res.status(404).json({ message: "User not found" });
        }

        // Reset user score
        combinedata.score = 0;
        await combinedata.save();

        const contest = await monthContest.findById(contestId);
        if (!contest) {
            return res.status(404).json({ message: "Contest not found" });
        }
        const userContest = contest.combineId.find(
            (user) => user.id.toString() === combineId.toString()
        );
        if (userContest) {
            userContest.score = 0;  
            await contest.save();
        }
        res.json({
            message: "Score reset successfully",
            combineId,
            contestId,
            score: 0,  
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

app.post("/monthly_update-score", authhentication, async (req, res) => {
    const { combineId, tempScore, isValid, completionTime, combineuser } = req.body;
  
    if (typeof tempScore !== "number" || typeof isValid !== "boolean") {
      return res.status(400).json({ message: "Invalid input format." });
    }
  
    try {
      let scoreData = await Monthlyleaderboard.findOne({ combineId });
      if (!scoreData) {
        // Create a new document if it doesn't exist
        scoreData = new Monthlyleaderboard({
            combineId,
            score: isValid ? tempScore : 0,
            tempScore: null,
            isValid,
            combineuser: combineuser,
            completionTime: isValid ? completionTime : null,
        });

        await scoreData.save();
        return res.status(200).json({
            message: isValid
              ? "Temp score successfully added to the real score."
              : "Temp score reset without affecting the real score.",
            score: scoreData.score,
            combineId,
          });
      }
  
      if (isValid) {
        scoreData.score = tempScore; 
        scoreData.completionTime = completionTime;
    }
  
      scoreData.tempScore = null; 
      scoreData.isValid = isValid;
  
      await scoreData.save();
  
      return res.status(200).json({
        message: isValid
          ? "Temp score successfully added to the real score."
          : "Temp score reset without affecting the real score.",
        score: scoreData.score,
        combineId
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error." });
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


app.get("/monthly_contest_show", authhentication, async (req, res) => { 
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
        const topUsers = await Monthlyleaderboard.find().sort({ score: -1, completionTime: 1 }).limit(100000);
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

app.post("/manual_questions", authhentication, async (req, res) => {
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

app.post("/teacherform", async (req, res) => {
  const { schoolName, teacherName, Address, Number, Gmail, password, confirmPassword, role } = req.body;
  if (!schoolName || !teacherName || !Address || !Number || !Gmail || !password || !confirmPassword || !role) {
    return res.status(400).json({ message: "All fields are required." });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match." });
  }
  try {
    const newTeacher = new Schoolform({
      schoolName,
      teacherName,
      Address,
      Number,
      Gmail,
      password,
      confirmPassword,
      role
    });

    await newTeacher.save();
   
    res.status(201).json({ message: "success", teacher: newTeacher });
  } catch (error) {
    console.error("Error saving teacher data:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

app.post("/login/teacher", async (req, res) => {
    const { Gmail, password } = req.body;
    if (!Gmail || !password) {
      return res.status(400).json({ message: "Gmail and password are required." });
    }
    try {
      const user = await Schoolform.findOne({ Gmail });
      if (!user) {
        return res.status(404).json({ message: "User not found. Please register first." });
      }
      console.log(user)
      if (user.password !== password) {
        return res.status(401).json({ message: "Invalid password." });
      }
      const token = jwt.sign({ Gmail }, secretKey, { expiresIn: "24h" });
      res.status(200).json({ message: "success", user , token });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  });

app.post("/child/register", async (req, res) => {
    const { name, lastName, phoneNumber, school, password, confirmPassword, Gmail, role } = req.body;
    if (!name || !lastName || !phoneNumber || !school || !password || !confirmPassword || !Gmail || !role) {
        return res.status(400).json({ message: "All fields are required." });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match." });
    }
    try {
        const existingUser = await User.findOne({ Gmail });
        if (existingUser) {
            return res.status(400).json({ message: "User already registered with this Gmail." });
        }
        const newUser = new User({
            name,
            lastName,
            phoneNumber,
            school,
            password, 
            Gmail,
            role
        });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

app.post("/login/child", async (req, res) => {
    const { Gmail, password } = req.body;
    if (!Gmail || !password) {
        return res.status(400).json({ message: "Gmail and password are required." });
    }
    try {
        const user = await StudentSite.findOne({ Gmail });
        if (!user) {
            return res.status(404).json({ message: "User not found. Please register first." });
        }
        const isMatch = password === user.password; 
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password." });
        }
        const token = jwt.sign({ Gmail }, secretKey, { expiresIn: "24h" });
        res.status(200).json({ message: "Login successful", user, token });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// School APi 
// app.post('/create-school-contest',authhentication, async (req, res) => {
//     const { schoolName } = req.body;

//     try {
//         const newContest = new SchoolContest({
//             schoolName,
//             participants: [], 
//             maxParticipants: 100000 
//         });
//         await newContest.save();
//         res.json({
//             message: 'School contest created successfully',
//             contest: newContest
//         });
//     } catch (err) {
//         console.error('Error creating school contest:', err);
//         res.status(500).json({ message: 'Server Error', error: err.message });
//     }
// });

// app.post('/join-school-contest', authhentication, async (req, res) => {
//     const { schoolName, combineId, fullname, schoolContestId } = req.body; 
//     try {
//         const user = await CombineDetails.findById( combineId); 
        
//         if (!user) {
//             return res.status(400).json({ message: 'User does not exist.' });
//         }
//         if (user.studentDetails.schoolName.trim().toLowerCase() !== schoolName.trim().toLowerCase()) {
//             return res.status(400).json({ message: 'User is not from the specified school.' });
//         }
//         const contest = await SchoolContest.findById(schoolContestId);
//         if (!contest || contest.schoolName.trim().toLowerCase() !== schoolName.trim().toLowerCase()) {
//             return res.status(404).json({ message: 'Contest not found for the specified school.' });
//         }
//         const participantExists = contest.participants.some(participant => participant.combineId.toString() === combineId);
//         if (participantExists) {
//             return res.status(400).json({ message: 'User is already a participant in this contest.' });
//         }
//         contest.participants.push({ combineId, fullname, score: 0 });
//         await contest.save();
//         res.json({
//             message: 'User has successfully joined the contest.',
//             contest,
//         });
//     } catch (err) {
//         console.error('Error joining contest:', err);
//         res.status(500).json({ message: 'Server Error', error: err.message });
//     }
// });

// app.post("/school-question",authhentication, async (req, res) => {
//     const { combineId } = req.body;
//     try {
//         const othervalues = await CombineDetails.findById(combineId);
//         if (!othervalues) {
//             return res.status(400).send({ message: "Data is not available" });
//         }
   
//         const count = await gkQuestion.countDocuments();
//         if (count === 0) {
//             return res.status(404).send({
//                 message: "No questions available",
//                 totalQuestions: count,
//             });
//         }
//         const randomIndex = Math.floor(Math.random() * count);
//         const randomQuestion = await gkQuestion.findOne().skip(randomIndex);

//         if (!randomQuestion) {
//             return res.status(404).send({ message: "Unable to fetch a question" });
//         }
//         res.status(200).send({ randomQuestion, totalQuestions: count });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send({ message: "Internal server error" });
//     }
// });

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

app.get("/checkPhoneNumber", authhentication, async (req, res) => {
    try{
        const {phoneNumber} = req.query;
        if(!phoneNumber) res.status(200).json({ success: false, message: "Phone number is required" });
        const userData = await CombineDetails.findOne({
            $or: [
                { "formDetails.phoneNumber": phoneNumber },
                { "studentDetails.phoneNumber": phoneNumber },
            ],
        }).select('_id formDetails studentDetails');

        if(!userData) return res.status(200).json({ success: false, message: "Don't have account on this number" });

        const name =
            (userData?.formDetails?.fullname) ||
            (userData?.studentDetails?.fullname) ||
            "Unknown";

        return res.status(200).json({ success: true, _id: userData._id, name });
    } catch (error) {
        console.error("Error checking phone number:", error);
        res.status(500).json({ success: false, message: "Invalid data" });
    }
});

app.post("/wallet_to_wallet_transfer", authhentication, async (req, res) => {
    try {
        const { amount, senderCombineId, receiverCombineId } = req.body;
        let senderNumber = req.user.phoneNumber;
        let receiverNumber;
        
        if (!amount || !receiverCombineId || !senderCombineId) return res.status(400).json({ success: false, message: "Required details are missing" });
        if (senderCombineId === receiverCombineId) return res.status(400).json({ success: false, message: "Can't send money to your own wallet" });
        
        const senderWallet = await getWalletBycombineId(senderCombineId);
        if (!senderWallet) return res.status(404).json({ success: false, message: "Sender's wallet not found" });
        if (senderWallet.balance < amount) return res.status(400).json({ success: false, message: "Insufficient balance" });

        const receiverWallet = await getWalletBycombineId(receiverCombineId);
        if (!receiverWallet) return res.status(404).json({ success: false, message: "Receiver's wallet not found" });

        const receiverData = await CombineDetails.findById(receiverCombineId).select('_id formDetails studentDetails');
        if (!receiverData) return res.status(404).json({ success: false, message: "Receiver not found" });
        if(receiverData.formDetails){
            receiverNumber = receiverData.formDetails.phoneNumber;
        } else {
            receiverNumber = receiverData.studentDetails.phoneNumber;
        }

        senderWallet.balance = Number(senderWallet.balance) - Number(amount);
        receiverWallet.balance = Number(receiverWallet.balance) + Number(amount);
        
        await senderWallet.save();
        await receiverWallet.save();
        await logTransaction(senderCombineId, -amount, "debit", `Send to ${receiverNumber}`, "completed");
        await logTransaction(receiverCombineId, +amount, "credit", `Received from ${senderNumber}`, "completed");

        return res.status(200).json({ success: true, message: "Transfer successful" });
    } catch (error) {
        console.error("Wallet transfer error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});

app.post('/wallet_to_bank_transfer', authhentication, async (req, res) => {
    try {
      const { fullname, userId, accountNumber, ifsc, amount } = req.body;
  
      if (!fullname || !accountNumber || !ifsc || !amount || !userId) {
        return res.status(400).json({ success: false, message: 'Required details are missing' });
      }
  
      const userWallet = await getWalletBycombineId(userId);
      if (!userWallet) return res.status(404).json({ success: false, message: "User's wallet not found" });
      if (Number(userWallet.balance) < Number(amount)) return res.status(400).json({ success: false, message: 'Insufficient balance' });

      userWallet.balance = Number(userWallet.balance) - Number(amount);
      await userWallet.save();
  
      const transaction = await logTransaction(userId, -amount, 'debit', 'Withdraw', 'pending');

      const withdrawalRequest = new WithdrawalRequest({
        userId,
        transactionId: transaction._id,
        fullname,
        accountNumber,
        ifsc,
        amount,
        status: 'pending'
      });
      await withdrawalRequest.save();
  
      return res.status(200).json({ success: true, message: 'Withdrawal request submitted' });
    } catch (error) {
      console.error("Wallet to bank transfer error:", error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });
  
app.post('/verify_bank_account', authhentication, async (req, res) => {
    const { accountNumber, ifsc } = req.body;

    if (!accountNumber || !ifsc) { return res.status(400).json({ success: false, message: 'Account number and IFSC are required' })}
    try {
        // const response = await axios.post('https://api.razorpay.com/v1/fund_accounts/validate', 
        //     { account_number: accountNumber, ifsc: ifsc },
        //     { auth: { username: 'your_api_key', password: 'your_api_secret' }, headers: { 'Content-Type': 'application/json' }}
        // );
        // if (response.data.success) {
            return res.json({
                success: true,
                // accountHolderName: response.data.account_holder_name
                accountHolderName: "Hello user"
            });
        // } else {
        //     return res.json({ success: false, message: 'Invalid account details' });
        // }
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Verification failed', error: error.message });
    }
});

app.post("/create-order", async (req, res) => {
    try {
      const { amount } = req.body;
        
      const options = {
        amount: amount * 100, // Amount in paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      };
  
      const order = await razorpay.orders.create(options);
      res.json({ orderId: order.id });
    } catch (error) {
      console.error("Order Creation Failed", error);
      res.status(500).json({ error: "Failed to create order" });
    }
});

app.post("/verify-payment", async (req, res) => {
    try {
        const { userId, orderId, paymentId, amount } = req.body;

        if (!orderId || !paymentId || !amount || !userId) {
            return res.status(400).json({ success: false, message: 'Required details are missing' });
        }
        if(status!='success') return res.status(400).json({ success: false, message: 'Transaction Failed' });
        
        const userWallet = await getWalletBycombineId(userId);
        if (!userWallet) return res.status(404).json({ success: false, message: "User's wallet not found" });

        userWallet.balance = Number(userWallet.balance) + Number(amount);
        await userWallet.save();

        await logTransaction(userId, +amount, 'credit', 'Add money to wallet', 'completed', orderId, paymentId);

        res.json({ success: true, message: "Payment verified & saved" });
    } catch (error) {
        console.error("Payment Verification Failed", error);
        res.status(500).json({ error: "Failed to verify payment" });
    }
});

app.get("/getTransactions", authhentication, async (req, res) => {
    try {   
        const combineId = req.query.combineId;
        if (!combineId || typeof combineId !== "string") {
            return res.status(400).json({ success: false, message: "Invalid or missing combineId" });
        }

        const transactions = await Transaction.find({combineId : combineId }).lean();

        if (transactions.length === 0) {
            return res.status(404).json({ success: false, message: "No transactions found" });
        }
        res.status(200).json({ success: true, transactions });
    } catch (error) {
        console.error("Error fetching transaction details:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

  
app.get("/get_app_version", async (req, res) => {
    try {   
        // Declare appDetailsDoc with let so it can be reassigned
        let appDetailsDoc = await AppDetails.findOne({}, { appVersion: 1, _id: 0 });

        // If no document is found, create a new document with default version
        if (!appDetailsDoc) {
            const defaultVersion = 1.0; // Default version to be set
            appDetailsDoc = await AppDetails.create({ appVersion: defaultVersion, isUpdated: false });
            return res.status(200).send({ appVersion: defaultVersion });
        }
        
        // If document is found, return the version
        res.status(200).send({ appVersion: appDetailsDoc.appVersion });
    } catch (error) {
        console.error("Error fetching app version:", error);
        res.status(500).send({ message: "Internal server error" });
    }
});

app.get("/getShoppingPartners", authhentication, getShoppingPartner);

app.use("/auth", authRoute);

app.use("/company", ensureAuthenticated, companyRoutes);

// test Api 

app.get("/address" , async (req,res)=>{
    res.json("api Start, Razorpay gateway added");
})



app.listen(PORT, () => {
    console.log("Server is running on port 5000");
})
