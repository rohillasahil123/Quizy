const express = require('express');
const router = express.Router();
const { newSchoolValidation } = require('../Validatation/newSchoolValidation');
const {addSchool, getSchool, updateSchool, deleteSchool} = require("../controllers/schoolController");

router.post("/addSchool", newSchoolValidation, addSchool);
router.get("/getSchool", getSchool);
router.put("/updateSchool/:id", updateSchool);
router.delete("/deleteSchool/:id", deleteSchool);

module.exports = router;