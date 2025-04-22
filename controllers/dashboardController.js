const { Op } = require("sequelize");
const Transaction = require("../models/Transaction");
const { startOfMonth, endOfMonth, getDate } = require("date-fns");
const User = require("../models/User");
const Limit = require("../models/Limit");
const Subscription = require("../models/Subscription");

const getMonthlyTransactions = async (req, res) => {
    try {
        const { userId, month } = req.query; // month: "2025-04"

        if (!userId || !month) {
            return res.status(400).json({ error: "userId and month are required" });
        }

        const startDate = startOfMonth(new Date(`${month}-01`));
        const endDate = endOfMonth(startDate);

        const transactions = await Transaction.findAll({
            where: {
                createdAt: {
                    [Op.between]: [startDate, endDate],
                },
                [Op.or]: [
                    { senderAccount: userId },
                    { receiverAccount: userId },
                ],
            }
        });

        const debitMap = {};
        const creditMap = {};

        transactions.forEach(tx => {
            const day = getDate(tx.createdAt).toString(); // e.g., "5"

            if (tx.senderAccount === userId) {
                debitMap[day] = (debitMap[day] || 0) + tx.amount;
            } else if (tx.receiverAccount === userId) {
                creditMap[day] = (creditMap[day] || 0) + tx.amount;
            }
        });

        // Convert maps to array
        const debit = Object.entries(debitMap).map(([day, revenue]) => ({ day, revenue }));
        const credit = Object.entries(creditMap).map(([day, revenue]) => ({ day, revenue }));

        return res.json({ debit, credit });

    } catch (error) {
        console.error("Error fetching transactions:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const getUserDashboard = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }

        // Fetch user with subscription details
        const user = await User.findOne({
            where: { accountNumber: userId },
            include: {
                model: Subscription,
                as: "Subscription",
            },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Fetch user's limit entry (assumes 1:1 relationship)
        const limit = await Limit.findOne({
            where: { userId: userId, subscriptionId: user.subscriptionId },
        });

        if (!limit) {
            return res.status(404).json({ error: "User limit record not found" });
        }

        const cardDetails = [
            {
                title: "Balance",
                value: user.balance,
            },
            {
                title: "Current Plan",
                value: user.Subscription?.name || "No Plan",
            },
            {
                title: "Amount Left",
                value: Math.max(
                    user.Subscription.transactionLimit - limit.transactionAmount,
                    0
                ),
            },
            {
                title: "Transactions Left",
                value: Math.max(
                    user.Subscription.transactionPerDay - limit.noOfTransactions,
                    0
                ),
            },
        ];

        return res.status(200).json({ cardDetails });

    } catch (error) {
        console.error("Error fetching card details:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};




module.exports = { getMonthlyTransactions, getUserDashboard };
