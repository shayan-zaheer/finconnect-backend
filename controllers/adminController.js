const User = require("../models/User");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const fs = require("fs");

exports.getAllUsers = asyncErrorHandler(async(request, response, next) => {
    const users = await User.findAll({
        attributes: ["accountNumber", "name", "email", "role", "isSubscribed", "apiKey", "customerId", "stripeSubId"],
    });

    if(users.length === 0) {
        const error = new CustomError("No users found", 404);
        return next(error);
    }

    return response.status(200).json({ users });
});

exports.getAllLogs = asyncErrorHandler(async(request, response, next) => {
    const logs = fs.readFileSync("../logs/activities.log", "utf-8").split("\n").filter(line => line.trim() !== "");
    if(logs.length === 0) {
        const error = new CustomError("No logs found", 404);
        return next(error);
    }

    return response.status(200).json({ logs });
});
