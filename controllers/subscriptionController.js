const Subscription = require("../models/Subscription");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const CustomError = require("../utils/CustomError");

exports.getAllSubscriptions = asyncErrorHandler(async (request, response, next) => {
    const subscriptions = await Subscription.findAll({
        attributes: ["subscriptionId", "name", "price", "description", "transactionLimit", "transactionPerDay", "invoice", "priority"],
    });

    if (subscriptions.length === 0) {
        const error = new CustomError("No subscriptions found", 404);
        return next(error);
    }

    return response.status(200).json({ subscriptions });
});

exports.createSubscription = asyncErrorHandler(async (request, response, next) => {
    const { name, price, description, transactionLimit, transactionPerDay, invoice, priority } = request.body;

    if (!name || !price || !description || !transactionLimit || !transactionPerDay || !invoice || !priority) {
        const error = new CustomError("All fields are required", 400);
        return next(error);
    }

    const subscription = await Subscription.create({
        name,
        price,
        description,
        transactionLimit,
        transactionPerDay,
        invoice,
        priority,
    });

    return response.status(201).json({ message: "Subscription created successfully", subscription });
});

exports.deleteSubscription = asyncErrorHandler(async (request, response, next) => {
    const { subscriptionId } = request.params;

    const subscription = await Subscription.findOne({ where: { subscriptionId } });

    if (!subscription) {
        const error = new CustomError("Subscription not found", 404);
        return next(error);
    }

    await subscription.destroy();

    return response.status(200).json({ message: "Subscription deleted successfully" });
});

exports.updateSubscription = asyncErrorHandler(async (request, response, next) => {
    const { subscriptionId } = request.params;
    const { name, price, description, transactionLimit, transactionPerDay, invoice, priority } = request.body;

    const subscription = await Subscription.findOne({ where: { subscriptionId } });

    if (!subscription) {
        const error = new CustomError("Subscription not found", 404);
        return next(error);
    }

    if (name) subscription.name = name;
    if (price) subscription.price = price;
    if (description) subscription.description = description;
    if (transactionLimit) subscription.transactionLimit = transactionLimit;
    if (transactionPerDay) subscription.transactionPerDay = transactionPerDay;
    if (invoice) subscription.invoice = invoice;
    if (priority) subscription.priority = priority;

    await subscription.save();

    return response.status(200).json({ message: "Subscription updated successfully", subscription });
});