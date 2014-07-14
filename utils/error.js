var util = require('util');

/**
 * Custom error class for 404 Not found.
 */
var NotFoundError = exports.NotFoundError = function () {
    Error.apply(this, arguments);
};

// Inherit from Error
util.inherits(NotFoundError, Error);