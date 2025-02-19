const express = require('express');
const router = express.Router();
// const { newContestValidation } = require('../Validatation/newContestValidation');
const {addContest, getContest, updateContest, deleteContest} = require("../controllers/contestController");

router.post("/addContest", addContest);
router.get("/getContest", getContest);
router.put("/updateContest/:id", updateContest);
router.delete("/deleteContest/:id", deleteContest);

module.exports = router;