module.exports = function (from, to) {
    from = RegExp(from);
    return function (req, res, next) {
        req.url = req.url.replace(from, to);
        next();
    }
}
