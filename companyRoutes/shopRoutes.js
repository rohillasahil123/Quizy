const express = require('express');
const router = express.Router();
const { newShoppingPartnerValidation } = require('../Validatation/newShoppingPartnerValidation');
const {addShoppingPartner, getShoppingPartner, updateShoppingPartner, deleteShoppingPartner} = require("../controllers/shoppingController");

router.post("/addShoppingPartner", newShoppingPartnerValidation, addShoppingPartner);
router.get("/getShoppingPartner", getShoppingPartner);
router.put("/updateShoppingPartner/:id", updateShoppingPartner);
router.delete("/deleteShoppingPartner/:id", deleteShoppingPartner);

module.exports = router;