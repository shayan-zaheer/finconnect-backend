const jwt = require("jsonwebtoken");

const protect = (request, response, next) => {
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        return response.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        request.user = decoded;
        next();
    } catch (err) {
        return response
            .status(403)
            .json({ message: "Invalid or expired token" });
    }
};

module.exports = protect;
