const express = require("express");
const router = express.Router();
const fintechController = require("../controllers/fintechController");
const apiKeyCheck = require("../middlewares/keyCheck");

router.get("/balance/", apiKeyCheck, fintechController.getBalance);
router.post("/transfer", apiKeyCheck, fintechController.transferFunds);
router.get("/transactions", apiKeyCheck, fintechController.getTransactionHistory);
router.get("/invoice", apiKeyCheck, fintechController.getInvoiceHistory);

module.exports = router;