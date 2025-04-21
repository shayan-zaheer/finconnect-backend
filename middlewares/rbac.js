const rbac = (...allowed) => {
    return (request, response, next) => {
        if (!allowed.includes(request.user.role)) {
            return response.status(403).json({ message: "Access forbidden!" });
        }
        next();
    };
};

module.exports = rbac;