const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");
const rbac = require("../middlewares/rbac");
const protect = require("../middlewares/auth");

router.post("/", protect, rbac("admin"), subscriptionController.createSubscription);
router.get("/", subscriptionController.getAllSubscriptions);
router.delete("/:subscriptionId", protect, rbac("admin"), subscriptionController.deleteSubscription);
router.patch("/:subscriptionId", protect, rbac("admin"), subscriptionController.updateSubscription);

module.exports = router;