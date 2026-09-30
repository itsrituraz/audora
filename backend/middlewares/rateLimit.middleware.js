const rateLimit = require("express-rate-limit");

const uploadRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,             // maximum 5 upload requests per minute
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    message: "Too many uploads. Please try again later.",
  },
});

module.exports = {
  uploadRateLimiter,
};