const express = require('express');
const router = express.Router();
const {getMemberDetails, 
    // getAllUsersByRole, 
    addNewMember, 
    getFranchiseDetails
} = require("../controllers/companyController");
const { newMemberValidation } = require('../Middelware/newMemberValidataion');

router.get("/getMemberDetails/:id", getMemberDetails);
// router.get("getAllUsersByRole/:role", getAllUsersByRole)
router.post("/addNewMember", newMemberValidation, addNewMember);
router.post("/getFranchiseDetails", getFranchiseDetails)

module.exports = router;