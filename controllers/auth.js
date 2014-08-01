/**
 * Authentication controller.
 */
var db = require('../models'),
    config = require('../config/config')();

/**
 * Sends the connectec user back to the client after authentication.
 */
exports.loginCallback = function (req, res) {
    if (req.isAuthenticated()) {
        res.send({ user: req.user })
    } else {
        res.send(500);
    }
};

/**
 * Ensures the current request is authenticated before calling the next handler.
 */
exports.ensureAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.send(401);
};

/**
 * Logs the user out and redirects to home.
 */
exports.logout = function (req, res) {
    req.logout();
    res.send(200, "Bye!");
};