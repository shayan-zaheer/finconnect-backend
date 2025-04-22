const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");
const protect = require("../middlewares/auth");
const CustomError = require("../utils/CustomError");
const asyncErrorHandler = require("../utils/asyncErrorHandler");

router.post("/generate", protect, asyncErrorHandler(async (request, response) => {
    const { accountNumber } = request.user;

        const user = await User.findOne({ where: { accountNumber } });
        if (!user){
            const error = new CustomError("User not found", 404);
            return next(error);
        }

        const apiKey = uuidv4();
        user.apiKey = apiKey;
        await user.save();

        response.json({ apiKey });
    })
);

module.exports = router;
