module.exports = (func) => {
    return (request, response, next) => {
        func(request, response, next).catch((err) => next(err));
    };
};
