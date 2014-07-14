/**
 * API controller for Addresses.
 */
var db = require('../models'),
    error = require('../utils/error'),
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

    // Validate input
    if (!req.body.address)
        res.send(400);

    // Make sure the current user "owns" the address, then update it
    testOwnership(req, res, updateInternal);
};

/**
 * Creates an address.
 */
exports.create = function (req, res) {

    // Validate input
    if (!req.body.address)
        res.send(400);

    // Create the host
    db.Address.create(
        req.body.address,
        updatableAttributes
    ).success(function (address) {
            res.send({ address: address });
        }).error(function (error) {
            res.send(500, error);
        })
};

/**
 * Makes sure that the address id given in route parameter is attached to an host/wwoofer that belongs to the
 * authenticated user.
 * @param callback The function to call if the user is allowed to update/delete the address.
 */
var testOwnership = function (req, res, callback) {

    // Prepare where clause
    var whereClause = {
        where: {
            addressId: req.params.id,
            userId: req.user.id
        }
    };

    // Make sure that the address to be updated/deleted belongs to a host/wwoofer owned by the authenticated user
    db.Host.count(whereClause).success(function (count) {
        if (count <= 0) {
            // Host not found, try with the wwoofer
            db.Wwoofer.count(whereClause).success(function (count) {
                if (count <= 0) {
                    res.send(404);
                } else {
                    callback(req, res);
                }
            }).error(function () {
                res.send(500, error);
            })
        } else {
            callback(req, res);
        }
    }).error(function () {
        res.send(500, error);
    });
};

/**
 * Updates an address after passing security checks (i.e. authenticated user is allowed to update the object).
 */
var updateInternal = function (req, res) {
    // Find the original address
    db.Address.find({
        where: { id: req.params.id }
    }).success(function (address) {
        if (address) {
            // Get the updated address from body
            var updatedAddress = req.body.address;

            // Update the address
            address.updateAttributes(
                req.body.address,
                updatableAttributes
            ).success(function (address) {
                    res.send({
                        address: address
                    })
                }).error(function (error) {
                    res.send(500, error);
                })
        } else {
            res.send(404);
        }
    }).error(function (error) {
        res.send(500, error);
    });
};