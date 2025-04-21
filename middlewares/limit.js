const rateLimit = require("express-rate-limit");

const userRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: { message: "Rate limit exceeded. Try again later." },
  keyGenerator: (request) => request.user?.userId || request.ip,
});

module.exports = userRateLimiter;