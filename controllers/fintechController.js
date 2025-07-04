const User = require("../models/User");
const Limit = require("../models/Limit");
const Transaction = require("../models/Transaction");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const CustomError = require("../utils/CustomError");
const { Op } = require("sequelize");
const { sequelize } = require("../config/db");

exports.getBalance = asyncErrorHandler(async (request, response, next) => {
  const { accountNumber } = request.user;
  if (!accountNumber) {
    const error = new CustomError("Account number is required", 400);
    return next(error);
  }

  const user = await User.findOne({ where: { accountNumber } });
  if (!user) {
    const error = new CustomError("User not found", 404);
    return next(error);
  }

  return response.status(200).json({ balance: user.balance });
});

exports.transferFunds = asyncErrorHandler(async (request, response, next) => {
  const { accountNumber, amount } = request.body;
  const user = request.user;

    if (!accountNumber || !amount) {
        return next(new CustomError("Account number and amount are required", 400));
    }

    if (user.balance < +amount) {
        return next(new CustomError("Insufficient funds", 400));
    }

    if (!user.apiKey) {
        return next(new CustomError("You must be subscribed with an API key to send funds", 403));
    }

    const recipient = await User.findOne({ where: { accountNumber } });
    if (!recipient) {
        return next(new CustomError("Recipient not found", 404));
    }

    if(recipient.accountNumber === user.accountNumber) {
        return next(new CustomError("You cannot send money to yourself", 400));
    }

    if (!recipient.subscriptionId) {
        return next(new CustomError("The receiving user hasn't subscribed to any plan", 403));
    }

  user.balance -= +amount;
  recipient.balance += +amount;

  await user.save();
  await recipient.save();

    await Transaction.create({
        senderAccount: user.accountNumber,
        receiverAccount: recipient.accountNumber,
        amount,
        status: "completed",
    });

    const limit = await Limit.findOne({ where: { userId: user.accountNumber } });
    if (limit) {
        limit.transactionAmount += +amount;
        limit.noOfTransactions += 1;
        await limit.save();
    }

    return response.status(200).json({ message: "Transfer successful" });
});

exports.getTransactionHistory = asyncErrorHandler(
  async (request, response, next) => {
    const { accountNumber } = request.user;

    if (!accountNumber) {
      const error = new CustomError("Account number is required", 400);
      return next(error);
    }

    const { page, pageLimit } = request.query;
    const pageNumber = +page || 1;
    const limit = +pageLimit || 5;
    const offset = (pageNumber - 1) * limit;

        const transactions = await Transaction.findAndCountAll({
            where: {
              [Op.or]: [
                { senderAccount: accountNumber },
                { receiverAccount: accountNumber },
              ],
            },
            include: [
              {
                model: User,
                as: 'sender',
                attributes: ['name', 'email', 'accountNumber'],
              },
              {
                model: User,
                as: 'receiver',
                attributes: ['name', 'email', 'accountNumber'],
              },
            ],
            limit,
            offset,
          });

    return response.status(200).json({ transactions });
  }
);

exports.getInvoiceHistory = asyncErrorHandler(
  async (request, response, next) => {
    const { accountNumber } = request.user;
    const { start, end } = request.query;

    console.log("Start:", start, "End:", end);

    if (!accountNumber) {
      const error = new CustomError("Account number is required", 400);
      return next(error);
    }

    const rawQuery = `
    SELECT "transactionId", "senderAccount", "receiverAccount", "amount", "createdAt", "status"
    FROM "Transactions"
    WHERE ("senderAccount" = :account OR "receiverAccount" = :account)
      AND "createdAt" BETWEEN :startDate AND :endDate
      AND "status" = 'completed'
    ORDER BY "createdAt" DESC;
`;

    const invoices = await sequelize.query(rawQuery, {
      replacements: {
        account: accountNumber,
        startDate: start,
        endDate: end,
      },
      type: sequelize.QueryTypes.SELECT,
    });

    const totalAmount = invoices.reduce((acc, curr) => acc + curr.amount, 0);
    const totalTransactions = invoices.length;

    return response
      .status(200)
      .json({ totalAmount, totalTransactions, invoices });
  }
);
