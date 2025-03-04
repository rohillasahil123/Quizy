const { createNewContest } = require("../Helper/helperFunction");
const Contest = require("../Model/contest");
const monthContest = require("../Model/MonthlyContest.js");
const contestdetails = require("../Model/contest");
const weeklycontest = require("../Model/Weekly.js");
const Megacontest = require("../Model/Mega.js");
const Teacher = require("../Model/Teacher");
const School = require("../Model/School");
const TeacherContest = require("../Model/TeacherContest");
const TeacherQuestion = require("../Model/TeacherQuestion");
const Question = require("../Model/Question");

async function addContest(req, res) {
  const { contestType, contestName, questions, prizeMoney, feeAmount, startTime, duration } = req.body;
  // const participants = [];

  const MINUTES_IN_HOUR = 60;
  const HOURS_IN_DAY = 24;
  const DAYS_IN_WEEK = 7;
  const DAYS_IN_MONTH = 30;
  const DAYS_IN_YEAR = 365;

  // Calculate durations in minutes for each contest type.
  const dailyDuration    = (HOURS_IN_DAY * MINUTES_IN_HOUR) - MINUTES_IN_HOUR;         // 24h - 1h = 1380 minutes
  const weeklyDuration   = ((DAYS_IN_WEEK * HOURS_IN_DAY) * MINUTES_IN_HOUR) - MINUTES_IN_HOUR; // (7 days - 1 hour)
  const monthlyDuration  = ((DAYS_IN_MONTH * HOURS_IN_DAY) * MINUTES_IN_HOUR) - MINUTES_IN_HOUR; // (30 days - 1 hour)
  const yearlyDuration  = ((DAYS_IN_YEAR * HOURS_IN_DAY) * MINUTES_IN_HOUR) - MINUTES_IN_HOUR; // 365 days - 1 hour

  if(contestType === 'Syllabus Contest') return res.status(400).json({ success: false, message: "This feature is coming soon" });
  try {
    switch (contestName) {
      case "Daily Contest":
        await createNewContest(contestdetails, prizeMoney, feeAmount, startTime, dailyDuration);
        break;
      case "Weekly Contest":
        await createNewContestWeek(weeklycontest, prizeMoney, feeAmount, startTime, weeklyDuration);
        break;
      case "Monthly Contest":
        await createNewContestMonth(monthContest, prizeMoney, feeAmount, startTime, monthlyDuration);
        break;
      case "Mega Contest":
        await createNewContestMega(Megacontest, prizeMoney, feeAmount, startTime, yearlyDuration);
        break;
      case "Teacher Contest":
        const teacherId = req.user._id;
        let teacherDetails = await Teacher.find({_id: teacherId});
        if (!teacherDetails) return res.status(400).send({ success: false, message: "Teacher is not found" });

        let schoolDetails = await School.find({_id: teacherDetails[0].schoolId});
        if (!schoolDetails) return res.status(400).send({ success: false, message: "School is not found" });
        
        const existingContest = await TeacherContest.findOne({
          schoolName: schoolDetails[0].schoolName,
          class: teacherDetails[0].class
        });
        if (existingContest) {
          return res.status(400).json({ success: false, message: "Contest is already created" });
        }
        const teacherQuestionDocs = questions.map(q => ({
          question: q.questionText, // Map 'questionText' to 'question'
          correctAnswer: q.options[q.correctOption], // Use correctOption index to get the correct answer
          options: q.options, // Array of options
          classvalue: teacherDetails[0].class, // Assign teacher's class
        }));

        const savedTeacherQuestions = await TeacherQuestion.insertMany(teacherQuestionDocs);
        const teacherQuestionIds = savedTeacherQuestions.map(q => q._id);

        const generateKey = () => {
          const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
          let key = "";
          for (let i = 0; i < 6; i++) {
            key += characters.charAt(Math.floor(Math.random() * characters.length));
          }
          return key;
        };
        const teacherDuration = questions.length * 10;
        const key = generateKey();
        const newContest = new TeacherContest({
          key,
          winningAmount: prizeMoney,
          amount: feeAmount,
          // participants,
          startTime: startTime,
          questions: teacherQuestionIds,
          duration: teacherDuration,
          schoolName: schoolDetails[0].schoolName,
          class: teacherDetails[0].class,
        });
        
        await newContest.save();
        return res.status(201).json({
          success: true,
          message: "Teacher Contest created successfully"
        });
      default:
        return res.status(400).json({ success: false, message: "Invalid contest type" });
    }
    res.status(201).json({ success: true, message: `${contestName} added successfully` });
  } catch (error) {
    console.error("Error creating contest:", error);
    res.status(500).json({ success: false, message: "Internal server error", error });
  }
}

async function getContest(req, res) {
  try {
    const { type } = req.query;
    let contests = [];

    switch (type) {
      case "Daily":
        contests = await contestdetails.find();
        break;
      case "Weekly":
        contests = await weeklycontest.find();
        break;
      case "Monthly":
        contests = await monthContest.find();
        break;
      case "Mega":
        contests = await Megacontest.find();
        break;
      case "Teacher":
        contests = await TeacherContest.find();
        break;
      default:
        return res.status(400).json({ success: false, message: "Invalid contest type" });
    }

    if (contests.length === 0) {
      return res.status(404).json({ success: false, message: "No contests found", contests: [] });
    }
    return res.status(200).json({
      success: true,
      message: `${type} contests fetched successfully`,
      contests,
    });
  } catch (error) {
    console.error("Error fetching contest details:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}


async function updateContest(req, res) {
  const { schoolId, contestId } = req.params;
  try {
    const updatedDetails = await Contest.findByIdAndUpdate(
      { _id: contestId, schoolId: schoolId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedDetails) {
      return res.status(404).json({ success: false, message: "Contest not found" });
    }
    res.status(200).json({ success: true, message: "Contest updated successfully", user: updatedDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}

async function deleteContest(req, res) {
  const { schoolId, contestId } = req.params;
  try {
    const deletedDetails = await Contest.findByIdAndDelete({ _id: contestId, schoolId: schoolId });
    if (!deletedDetails) {
      return res.status(404).json({ success: false, message: "Contest not found" });
    }
    res.status(200).json({ success: true, message: "Contest deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}

module.exports = {
  addContest,
  getContest,
  updateContest,
  deleteContest
};