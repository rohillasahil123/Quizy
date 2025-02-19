const express = require('express');
const router = express.Router();
const { newMemberValidation } = require('../Validatation/newMemberValidataion');
const {getMemberDetails, addNewMember, updateMember, deleteMember, getFranchiseDetails} = require("../controllers/marketingController");

router.get("/getMemberDetails/:id", getMemberDetails);
router.post("/addNewMember", newMemberValidation, addNewMember);
router.put("/updateMember/:id", updateMember);
router.delete("/deleteMember/:id", deleteMember);
router.post("/getFranchiseDetails", getFranchiseDetails)
// router.get("getAllUsersByRole/:role", getAllUsersByRole)

module.exports = router;