const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/stripeController");

router.post("/createSession", paymentController.createCheckoutSession);
router.post("/customerPortal", paymentController.customerPortal);
router.post("/webhooks", paymentController.listenWebhooks);

module.exports = router;