const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const protect = require("../middlewares/auth");
const rbac = require("../middlewares/rbac");

router.get("/users", protect, rbac("admin"), adminController.getAllUsers);
router.get("/logs", protect, rbac("admin"), adminController.getAllLogs);

module.exports = router;