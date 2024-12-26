const mongoose = require("mongoose");

const SchoolformSchema = new mongoose.Schema({
  schoolName: { type: String, required: true },
  teacherName: { type: String, required: true },
  Address: { type: String, required: true },
  Number: { type: String, required: true },
  Gmail: { type: String, required: true , unique: true },
  password: { type: String, required: true },
  confirmPassword: { type: String, required: true },
role: { type: String, enum: ["admin", "student", "teacher"], required: true },
});

module.exports = mongoose.model("Schoolform", SchoolformSchema);
