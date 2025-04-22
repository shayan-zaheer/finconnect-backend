
const Limit = require('../models/Limit');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const asyncErrorHandler = require('../utils/asyncErrorHandler');

const checkSubscriptionLimit = asyncErrorHandler(async (req, res, next) => {
  const { accountNumber, amount } = req.body;

  if (!accountNumber || typeof amount !== 'number') {
    return next({
      status: 400,
      message: 'Missing or invalid accountNumber or amount'
    });
  }

  // Step 1: Get the user and their subscription
  const user = await User.findOne({
    where: { accountNumber: accountNumber },
    include: {
      model: Subscription,
      attributes: ['transactionLimit', 'price'],
    },
  });

  if (!user || !user.subscriptionId) {
    return next({
      status: 404,
      message: 'User or their subscription not found'
    });
  }

  // Step 2: Get their current usage from the Limit table
  const limit = await Limit.findOne({
    where: { accountNumber },
  });

  if (!limit) {
    return next({
      status: 403,
      message: 'Limit record not found for user'
    });
  }

  const maxTransactions = user.Subscription.transactionLimit;
  const maxAmount = user.Subscription.price;

  const totalTransactionsAfterThis = limit.noOfTransactions + 1;
  const totalAmountAfterThis = limit.transactionAmount + amount;

  // Step 3: Check limits
  if (totalTransactionsAfterThis > maxTransactions || totalAmountAfterThis > maxAmount) {
    return next({
      status: 403,
      message: 'Transaction limit exceeded for your subscription plan'
    });
  }

  // ✅ All good
  next();
});

module.exports = checkSubscriptionLimit;
