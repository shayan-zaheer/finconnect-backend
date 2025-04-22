const Subscription = require("../models/Subscription");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const fs = require("fs");
const { Op } = require("sequelize");

exports.getAllUsers = asyncErrorHandler(async (request, response, next) => {
    const users = await User.findAll({
        attributes: [
            "accountNumber",
            "name",
            "email",
            "role",
            "isSubscribed",
            "apiKey",
            "customerId",
            "stripeSubId",
        ],
    });

    if (users.length === 0) {
        const error = new CustomError("No users found", 404);
        return next(error);
    }

    return response.status(200).json({ users });
});

exports.getAllLogs = asyncErrorHandler(async (request, response, next) => {
    const logs = fs
        .readFileSync("logs/activities.log", "utf-8")
        .split("\n")
        .filter((line) => line.trim() !== "");
    if (logs.length === 0) {
        const error = new CustomError("No logs found", 404);
        return next(error);
    }

    return response.status(200).json({ logs });
});

exports.getUsersBySubscription = asyncErrorHandler(
    async (request, response, next) => {
        const users = await User.findAll({
            where: {
                subscriptionId: {
                    [Op.ne]: null,
                },
            },
            attributes: ["name"],
            include: {
                model: Subscription,
                as: "Subscription",
            },
        });

        if (users.length === 0) {
            const error = new CustomError("No users found", 404);
            return next(error);
        }
        
        const subscriptionCounts = {};

        users.forEach((user) => {
            const subId = user.Subscription.name;
            if (subId) {
                subscriptionCounts[subId] =
                    (subscriptionCounts[subId] || 0) + 1;
            }
        });

        if (Object.keys(subscriptionCounts).length === 0) {
            const error = new CustomError("No subscriptions found", 404);
            return next(error);
        }

        return response.status(200).json(subscriptionCounts);
    }
);

exports.getStats = asyncErrorHandler(async (req, res, next) => {
    const [totalUsers, totalTransactions, avgResult] = await Promise.all([
        User.count(),
        Transaction.count(),
        Transaction.findAll({
            attributes: [
                [Transaction.sequelize.fn("AVG", Transaction.sequelize.col("amount")), "avgAmount"],
            ],
            raw: true,
        }),
    ]);

    const avgAmount = parseFloat(avgResult[0].avgAmount || 0).toFixed(2);

    return res.status(200).json({
        totalUsers,
        totalTransactions,
        avgAmount,
    });
});