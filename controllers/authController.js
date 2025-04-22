const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const CustomError = require("../utils/CustomError");
const Subscription = require("../models/Subscription");

exports.register = asyncErrorHandler(async (request, response, next) => {
    const { name, email, password, role } = request.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
        const error = new CustomError("Email already registered", 400);
        return next(error);
    }

    const user = await User.create({ name, email, password, role });

    return response
        .status(201)
        .json({ message: "Registration successful", userId: user.userId });
});

exports.login = asyncErrorHandler(async (request, response, next) => {
    const { email, password } = request.body;

    let user = await User.findOne({
        where: { email },
        attributes: ["accountNumber", "name", "email", "role", "password", "isSubscribed", "apiKey", "customerId", "stripeSubId"],
        include: {
            model: Subscription,
            as: "Subscription",
            attributes: ["subscriptionId", "name", "price", "description", "transactionLimit", "transactionPerDay", "invoice", "priority","price_id"], 
        },
    });

    if (!user) {
        const error = new CustomError("Invalid credentials", 400);
        return next(error);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        const error = new CustomError("Invalid credentials", 400);
        return next(error);
    }

    user = user.toJSON();
    delete user.password;

    const token = jwt.sign(
        {
            accountNumber: user.accountNumber,
            role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    return response.status(200).json({ user, token });
});
