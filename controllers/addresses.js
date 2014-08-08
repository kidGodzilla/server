/**
 * API controller for Addresses.
 */
var db = require('../models'),
    error = require('../utils/error'),
    _ = require('lodash'),
    updatableAttributes = ['address1', 'address2', 'zipCode', 'city', 'state', 'countryId', 'departmentId'];

/**
 * Returns a single address.
 */
exports.single = function (req, res) {
    db.Address.find({
        where: { id: req.params.id }
    }).then(function (address) {
        if (!address) {
            throw new error.NotFoundError();
        }
        res.send({ address: address });
    }).catch(error.NotFoundError, function () {
        res.send(404);
    }).catch(function (error) {
        res.send(500, error);
    });
};

/**
 * Updates an address.
 */
exports.update = function (req, res) {

    // Make sure an address is provided and that the ids match
    if (!req.body.address || req.body.address.id != req.params.id) {
        res.send(400);
        return;
    }

    // Make sure the user owns the address before update
    getAddressesByUserId(req).then(function (addresses) {
        var address = _.find(addresses, function (address) {
            return address.getDataValue('id') == req.params.id;
        });
        if (!address) {
            throw new error.NotFoundError();
        }

        // Update the address
        return address.updateAttributes(req.body.address, updatableAttributes);
    }).then (function (address) {
        res.send({ address: address });
    }).catch(error.NotFoundError, function () {
        res.send(404);
    }).catch(function (error) {
        res.send(500, error);
    });
};

/**
 * Creates an address.
 */
exports.create = function (req, res) {

    // Make sure an address is provided
    if (!req.body.address) {
        res.send(400);
        return;
    }

    // A user should not have more than 2 addresses (1 for its wwoof profile, 1 for its host profile)
    getAddressesByUserId(req).then(function (addresses) {
        if (addresses && addresses.length >= 2) {
            throw new error.ConflictError();
        }
        // Create the address
        return db.Address.create(req.body.address, updatableAttributes);
    }).then(function (address) {
        res.send({ address: address });
    }).catch(error.ConflictError, function () {
        res.send(409);
    }).catch(function (error) {
        res.send(500, error);
    });
};

/**
 * Returns all addresses associated to host/wwoofer profiles owned by the current user.
 */
var getAddressesByUserId = function (req) {
    var addresses = [];
    return db.Address.find({
        include: {
            model: db.Host,
            where: { userId: req.user.id }
        }
    }).then(function (result) {
        if (result) {
            addresses.push(result);
        }
        return db.Address.find({
            include: {
                model: db.Wwoofer,
                where: { userId: req.user.id }
            }
        });
    }).then(function (result) {
        if (result) {
            addresses.push(result);
        }
        return addresses;
    });
};