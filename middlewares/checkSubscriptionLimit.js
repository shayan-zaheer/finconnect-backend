const Limit = require("../models/Limit");
const Subscription = require("../models/Subscription");
const User = require("../models/User");
const asyncErrorHandler = require("../utils/asyncErrorHandler");

const checkSubscriptionLimit = asyncErrorHandler(async (req, res, next) => {
    const { sender, amount } = req.body;

    if (!sender || typeof amount !== "number") {
        return next({
            status: 400,
            message: "Missing or invalid accountNumber or amount",
        });
    }

    const user = await User.findOne({
        where: { accountNumber: sender },
        include: {
            model: Subscription,
            as: "Subscription",
            attributes: ["transactionLimit", "price","transactionPerDay"],
        },
    });

    if (!user || !user.subscriptionId) {
        return next({
            status: 404,
            message: "User or their subscription not found",
        });
    }

    const limit = await Limit.findOne({
        where: { userId: sender },
    });

    if (!limit) {
        return next({
            status: 403,
            message: "Limit record not found for user",
        });
    }
console.log(user.Subscription,"DVVS")
    const maxTransactions = user.Subscription.transactionPerDay;
    const maxAmount = user.Subscription.transactionLimit;

   
    const totalTransactionsAfterThis = limit.noOfTransactions + 1;
    const totalAmountAfterThis = limit.transactionAmount + amount;

   

    if (
        totalTransactionsAfterThis > maxTransactions ||
        totalAmountAfterThis > maxAmount
    ) {
        return next({
            status: 403,
            message: "Transaction limit exceeded for your subscription plan",
        });
    }

    next();
});

module.exports = checkSubscriptionLimit;
