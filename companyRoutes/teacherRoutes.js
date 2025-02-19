const express = require('express');
const router = express.Router();
const { newTeacherValidation } = require('../Validatation/newTeacherValidation');
const {addTeacher, getTeacher, updateTeacher, deleteTeacher} = require("../controllers/teacherController");

router.post("/addTeacher/:schoolId", newTeacherValidation, addTeacher);
router.get("/getTeacher/:schoolId", getTeacher);
router.put("/updateTeacher/:schoolId/:teacherId", updateTeacher);
router.delete("/deleteTeacher/:schoolId/:teacherId", deleteTeacher);

module.exports = router;