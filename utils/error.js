var util = require('util');

/**
 * Custom error for 404 Not found.
 */
var NotFoundError = exports.NotFoundError = function () {
    Error.apply(this, arguments);
};

/**
 * Custom error for 409 Conflict.
 */
var ConflictError = exports.ConflictError = function() {
    Error.apply(this, arguments);
};

/**
 * Custom error for 413 Entity Too Large.
 */
var FileTooBigError = exports.FileTooBigError = function () {
    Error.apply(this, arguments);
};

/**
 * Custom error for 415 Unsupported Media Type.
 */
var UnsupportedMediaTypeError = exports.UnsupportedMediaTypeError = function () {
    Error.apply(this, arguments);
};

// Inherit from Error
util.inherits(NotFoundError, Error);
util.inherits(ConflictError, Error);
util.inherits(FileTooBigError, Error);
util.inherits(UnsupportedMediaTypeError, Error);