const express = require('express');
const router = express.Router();
const {handleUserLogin, handleSendOtp, handleVerifyOtp, handleResetPassword} = require("../controllers/authController");
const { loginValidation } = require('../Validatation/authValidation');

router.post("/login", loginValidation, handleUserLogin);

router.post("/forgotPassword/sendOtp", handleSendOtp);

router.post("/forgotPassword/verifyOtp", handleVerifyOtp);

router.post("/resetPassword", handleResetPassword);

module.exports = router;