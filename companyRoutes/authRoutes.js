const express = require('express');
const router = express.Router();
const {handleUserLogin} = require("../controllers/authController");
const { loginValidation } = require('../Middelware/authValidation');

router.post("/login", loginValidation, handleUserLogin);

router.post("/resetPassword", (req, res) => { res.send("Reset Password");});

router.post("/forgotPassword", (req, res) => { res.send("Forgot Password");});

module.exports = router;