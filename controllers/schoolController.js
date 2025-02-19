const School = require("../Model/School");
const bcrypt = require('bcrypt');

async function addSchool(req, res) {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);        
    const newSchool = new School({
      ...req.body,
      password: hashedPassword,
      parent: req.user._id
    });
    await newSchool.save();
    res.status(201).json({ success: true, message: "New School added" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error });
  }
}

async function getSchool(req, res) {
  try {
    let schools = await School.find();

    if (schools.length === 0) return res.status(400).send({ success: false, message: "Schools are not found", schools });
    return res.status(200).send({
      message: "School fetched successfully",
      schools,
      success: true
    });
  } catch (error) {
    console.error("Error fetching schools details: ", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
}

async function updateSchool(req, res) {
  const { id } = req.params;
  try {
    const updatedDetails = await School.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedDetails) {
      return res.status(404).json({ success: false, message: "School not found" });
    }
    res.status(200).json({ success: true, message: "School updated successfully", user: updatedDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}

async function deleteSchool(req, res) {
  const { id } = req.params;
  try {
    const deletedDetails = await School.findByIdAndDelete(id);
    if (!deletedDetails) {
      return res.status(404).json({ success: false, message: "School not found" });
    }
    res.status(200).json({ success: true, message: "School deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}

module.exports = {
  addSchool,
  getSchool,
  updateSchool,
  deleteSchool
};