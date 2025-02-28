const express = require('express');
const router = express.Router();
const {getAllRequests, updateRequest} = require("../controllers/withdrawalRequestController");

router.get("/getAllRequests", getAllRequests)
router.put("/updateRequest/:requestId", updateRequest);

module.exports = router;