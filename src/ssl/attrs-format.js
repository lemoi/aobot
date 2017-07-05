module.exports = function (attrs) {
    const result = [];
    for (var i in attrs) {
        result.push({
            name: i,
            value: attrs[i]
        })
    }
    return result;
}
