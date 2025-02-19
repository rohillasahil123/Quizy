const express = require('express');
const router = express.Router();

const shopRoutes = require("./shopRoutes");
const schoolRoutes = require("./schoolRoutes");
const contesRoutes = require("./contestRoutes");
const teacherRoutes = require("./teacherRoutes");
const questionRoutes = require("./questionRoutes");
const franchiseRoutes = require("./franchiseRoutes");
const authorize = require("../Middelware/authorizeMiddleware"); 
const { getLocations } = require('../controllers/marketingController');

router.get("/locations", getLocations)

router.use("/shop", authorize(["All"]), shopRoutes);

router.use("/franchise", authorize(["Admin", "State Franchise", "District Franchise", "City Franchise", "Marketing Manager", "School"]), franchiseRoutes);

router.use("/school", authorize(["Admin", "State Franchise", "District Franchise", "City Franchise", "Marketing Manager",]), schoolRoutes);

router.use("/teacher", authorize(["Admin", "School"]), teacherRoutes);

router.use("/contest", authorize(["Admin", "Teacher"]), contesRoutes);

router.use("/question", authorize(["Admin", "School", "Teacher"]), questionRoutes);

module.exports = router;