const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

router.get("/getTransactionByDay", dashboardController.getMonthlyTransactions);
router.get("/getDashboard/:userId", dashboardController.getUserDashboard);


module.exports = router;