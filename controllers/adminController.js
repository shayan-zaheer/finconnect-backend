const Subscription = require("../models/Subscription");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const { startOfMonth, endOfMonth, getDate } = require("date-fns");
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
        subscriptionCounts[subId] = (subscriptionCounts[subId] || 0) + 1;
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
        [
          Transaction.sequelize.fn("AVG", Transaction.sequelize.col("amount")),
          "avgAmount",
        ],
      ],
      raw: true,
    }),
  ]);

  const avgAmount = parseFloat(avgResult[0].avgAmount || 0).toFixed(2);

  return res.status(200).json([
    {
      title: "Total Users",
      value: totalUsers,
    },
    {
      title: "Total Transactions",
      value: totalTransactions,
    },
    {
      title: "Average Transaction amount",
      value: avgAmount,
    },
  ]);
});
exports.getMonthlyTransactionsAdmin = async (req, res) => {
    try {
        const {userId, month } = req.query; // month: "2025-04"

        if (!month) {
            return res.status(400).json({ error: " month are required" });
        }

        const startDate = startOfMonth(new Date(`${month}-01`));
        const endDate = endOfMonth(startDate);

        const transactions = await Transaction.findAll({
            where: {
                createdAt: {
                    [Op.between]: [startDate, endDate],
                }
            }
        });
        // console.log(transactions)
        const debitMap = {};
        const creditMap = {};
        let arr =[]
        let mainObj ={}
        transactions.forEach(tx => {
          let obj ={}
            const day = getDate(tx.createdAt).toString(); // e.g., "5"
            console.log("day",day)
            obj.day = day
            let rev = (mainObj[day] ||0 ) + tx.amount
            obj[`revenue`] = rev;
            mainObj[day] = rev 
            arr.push(obj)
        });
        // Convert maps to array

        return res.json({debit:arr,credit:arr});

    } catch (error) {
        console.error("Error fetching transactions:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

