const express = require('express');

module.exports = function (path) {
    return express.static(path);
}
