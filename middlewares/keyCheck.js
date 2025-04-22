const User = require("../models/User");
const CustomError = require("../utils/CustomError");

const apiKeyCheck = async (request, response, next) => {
    const apiKey = request.headers["x-api-key"];

    if (!apiKey){
        const error = new CustomError("API Key missing", 401);
        return next(error);
    }

    const user = await User.findOne({ where: { apiKey } });
    if (!user){
        const error = new CustomError("Invalid API Key", 403);
        return next(error);
    }

    request.user = user;
    next();
};

module.exports = apiKeyCheck;