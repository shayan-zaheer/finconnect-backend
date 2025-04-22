const { createLogger, format, transports } = require("winston");

const logger = createLogger({
    level: "info",
    format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: "logs/activities.log" }),
    ],
});

const activityLogger = (req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
        const user = req.user?.accountNumber || "Unknown";
        const method = req.method;
        const url = req.originalUrl;
        const status = res.statusCode;
        const duration = Date.now() - start;

        if(status >= 500) {
            logger.error(
                `User ${user} made a ${method} request to ${url} → Status ${status} (${duration}ms)`
            );
        } else if(status >= 400) {
            logger.warn(
                `User ${user} made a ${method} request to ${url} → Status ${status} (${duration}ms)`
            );
        } else {
            logger.info(
                `User ${user} made a ${method} request to ${url} → Status ${status} (${duration}ms)`
            );
        }
    });

    next();
};

module.exports = activityLogger;
