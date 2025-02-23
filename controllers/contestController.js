const { createNewContest } = require("../Helper/helperFunction");
const Contest = require("../Model/contest");
const monthContest = require("../Model/MonthlyContest.js");
const contestdetails = require("../Model/contest");
const weeklycontest = require("../Model/Weekly.js");
const Megacontest = require("../Model/Mega.js");
const KeyContest = require ("../Model/KeySchema.js")

async function addContest(req, res) {
  const { contestType, prizeMoney, feeAmount, startTime, duration } = req.body;
  // const participants = [];
  try {
    switch (contestType) {
      case "GK Contest":
        await createNewContest(contestdetails, prizeMoney, feeAmount, startTime, duration);
        break;
      case "Weekly":
        await createNewContestWeek(weeklycontest, prizeMoney, feeAmount, startTime, duration);
        break;
      case "Monthly":
        await createNewContestMonth(monthContest, prizeMoney, feeAmount, startTime, duration);
        break;
      case "Mega Contest":
        await createNewContestMega(Megacontest, prizeMoney, feeAmount, startTime, duration);
        break;
      case "Manual Contest":
        // Generate a 6-character unique key
        const generateKey = () => {
          const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
          let key = "";
          for (let i = 0; i < 6; i++) {
            key += characters.charAt(Math.floor(Math.random() * characters.length));
          }
          return key;
        };

        const key = generateKey();
        const newContest = new KeyContest({
          key,
          prizePoll: prizeMoney,
          joinAmount: feeAmount,
          // participants,
        });
        await newContest.save();
        return res.status(201).json({
          success: true,
          message: "Manual Contest created successfully",
          contest: {
            key: newContest.key,
            prizeMoney: newContest.prizePoll,
            feeAmount: newContest.joinAmount,
          },
        });
      default:
        return res.status(400).json({ success: false, message: "Invalid contest type" });
    }
    res.status(201).json({ success: true, message: `${contestType} added successfully` });
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
      case "GK":
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
      case "Manual":
        contests = await KeyContest.find();
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