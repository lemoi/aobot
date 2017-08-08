module.exports = function (add, del) {
    return function (req, res, next) {
        for (var i in add) {
            req.headers[i] = add[i];
        }
        del.forEach((k) => delete req.headers[k]);
        next();
    }
}
