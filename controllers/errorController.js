const CustomError = require("../utils/CustomError");

const devError = (res, error) => {
    res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        stackTrace: error.stack,
        error,
    });
};

const prodError = (res, error) => {
    if (error.isOperational) {
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message,
        });
    } else {
        res.status(500).json({
            status: "error",
            message: "Something very wrong!",
        });
    }
};

const handleJWTError = (err) => {
    return new CustomError("Invalid token. Please log in again!", 401);
};

const handleJWTExpiredError = (err) => {
    return new CustomError("Your token has expired! Please log in again.", 401);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join(". ")}`;
    const validationError = new CustomError(message, 400);
    validationError.isOperational = true;
    return validationError;
};

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new CustomError(message, 400);
};

const handleDuplicateKey = (err) => {
    const field = Object.keys(err.keyPattern)[0];
    console.log(field);
    const value = err.keyValue[field];
    let message = `${
        field.charAt(0).toUpperCase() + field.slice(1)
    } already exists: ${value} `;
    return new CustomError(message, 400);
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (process.env.NODE_ENV === "development") {
        devError(res, err);
    } else if (process.env.NODE_ENV === "production") {
        let error = err;

        if (error.name === "CastError") error = handleCastErrorDB(error);
        if (error.name === "ValidationError")
            error = handleValidationErrorDB(error);
        if (error.name === "JsonWebTokenError") error = handleJWTError();
        if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
        if (error.code === 11000) error = handleDuplicateKey(error);

        prodError(res, error);
    }
};
