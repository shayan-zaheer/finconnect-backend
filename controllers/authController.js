const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const CustomError = require("../utils/CustomError");

exports.register = asyncErrorHandler(async (request, response, next) => {
    const { name, email, password, role } = request.body;

    const existing = await User.findOne({ where: { email } });
    if (existing){
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

    const user = await User.findOne({ where: { email } });
    if (!user){
        const error = new CustomError("Invalid credentials", 400);
        return next(error);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch){
        const error = new CustomError("Invalid credentials", 400);
        return next(error);
    }

    const token = jwt.sign(
        {
            userId: user.userId,
            role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    return response.status(200).json({ token });
});
