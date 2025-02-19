const Contest = require("../Model/contest");
const bcrypt = require('bcrypt');

async function addContest(req, res) {
  const { schoolId } = req.params;
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);    
    const newContest = new Contest({
      ...req.body,
      password: hashedPassword,
      schoolId: schoolId
    });
    await newContest.save();
    res.status(201).json({ success: true, message: "New Contest added" });
  } catch (etrror) {
    res.status(500).json({ success: false, message: "Internal server error", error });
  }
}

async function getContest(req, res) {
  const { schoolId } = req.params;
  try {
    let contests = await Contest.find({schoolId: schoolId});

    if (contests.length === 0) return res.status(400).send({ success: false, message: "Contests are not found", contests });
    return res.status(200).send({
      message: "Contest fetched successfully",
      contests,
      success: true
    });
  } catch (error) {
    console.error("Error fetching contests details: ", error);
    res.status(500).send({ message: "Internal Server Error" });
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