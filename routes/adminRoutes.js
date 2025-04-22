const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const protect = require("../middlewares/auth");
const rbac = require("../middlewares/rbac");

router.get("/users", protect, rbac("admin"), adminController.getAllUsers);
router.get("/logs", protect, rbac("admin"), adminController.getAllLogs);
router.get("/users/subscriptions", protect, rbac("admin"), adminController.getUsersBySubscription);
router.get("/total-users", protect, rbac("admin"), adminController.getTotalUsers);
router.get("/total-transactions", protect, rbac("admin"), adminController.getTotalTransactions);
router.get("/average-transaction-amount", protect, rbac("admin"), adminController.getAverageTransactionAmount);

module.exports = router;