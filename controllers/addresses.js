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
        res.status(404).end();
    }).catch(function (error) {
        res.status(500).send(error);
    });
};

/**
 * Updates an address.
 */
exports.update = function (req, res) {

    // Make sure an address is provided
    if (!req.body.address) {
        res.status(400).end();
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
        res.status(404).end();
    }).catch(function (error) {
        res.status(500).send(error);
    });
};

/**
 * Creates an address.
 */
exports.create = function (req, res) {

    // Make sure an address is provided
    if (!req.body.address) {
        res.status(400).end();
        return;
    }

    // A user should not have more than 2 addresses (1 for its wwoof profile, 1 for its host profile)
    getAddressesByUserId(req).then(function (addresses) {
        if (addresses && addresses.length >= 2) {
            throw new error.ConflictError();
        }
        // Create the address
        return db.Address.create(req.body.address, { fields: updatableAttributes });
    }).then(function (address) {
        res.send({ address: address });
    }).catch(error.ConflictError, function () {
        res.status(409).end();
    }).catch(function (error) {
        res.status(500).send(error);
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