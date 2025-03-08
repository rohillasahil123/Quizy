const School = require("../Model/School");
const Teacher = require("../Model/Teacher");
const bcrypt = require('bcrypt');

async function addTeacher(req, res) {
  const { schoolId } = req.params;
  try {
    const school = await School.findById(schoolId);
    if (!school) return res.status(404).json({ success: false, message: "School not found" });
    const hashedPassword = await bcrypt.hash(req.body.password, 10);    
    const newTeacher = new Teacher({
      ...req.body,
      password: hashedPassword,
      schoolId: schoolId,
      board: school.board,
    });
    await newTeacher.save();
    res.status(201).json({ success: true, message: "New Teacher added" });
  } catch (etrror) {
    res.status(500).json({ success: false, message: "Internal server error", error });
  }
}

async function getTeacher(req, res) {
  const { schoolId } = req.params;
  try {
    let teachers = await Teacher.find({schoolId: schoolId});

    if (teachers.length === 0) return res.status(400).send({ success: false, message: "Teachers are not found", teachers });
    return res.status(200).send({
      message: "Teacher fetched successfully",
      teachers,
      success: true
    });
  } catch (error) {
    console.error("Error fetching teachers details: ", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
}

async function updateTeacher(req, res) {
  const { schoolId, teacherId } = req.params;
  try {
    const updatedDetails = await Teacher.findByIdAndUpdate(
      { _id: teacherId, schoolId: schoolId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedDetails) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }
    res.status(200).json({ success: true, message: "Teacher updated successfully", user: updatedDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}

async function deleteTeacher(req, res) {
  const { schoolId, teacherId } = req.params;
  try {
    const deletedDetails = await Teacher.findByIdAndDelete({ _id: teacherId, schoolId: schoolId });
    if (!deletedDetails) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }
    res.status(200).json({ success: true, message: "Teacher deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}

module.exports = {
  addTeacher,
  getTeacher,
  updateTeacher,
  deleteTeacher
};