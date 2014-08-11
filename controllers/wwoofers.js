/**
 * API controller for Wwoofers.
 */
var db = require('../models');
var updatableAttributes = ['firstName2', 'lastName2', 'birthDate2', 'nationality', 'tripDuration', 'tripMotivation', 'intro', 'addressId', 'userId'];

/**
 * Searches and returns a list of wwoofers.
 */
exports.index = function (req, res) {

    // Extract query params
    var limit = isNaN(parseInt(req.query.limit)) ? 20 : parseInt(req.query.limit),
        offset = isNaN(parseInt(req.query.offset)) ? 0 : parseInt(req.query.offset),
        userIdCondition = req.query.userId ? { userId: req.query.userId } : null;

    // Find all wwofers matching parameters
    db.Wwoofer.findAndCountAll({
        limit: limit,
        offset: offset,
        where: userIdCondition,
        include: [
            { model: db.User },
            { model: db.Address,
                include: [
                    { model: db.Department },
                    { model: db.Country }
                ]
            }
        ]
    }).success(function (wwoofers) {
        res.send({
            wwoofers: wwoofers.rows,
            meta: {
                offset: offset,
                limit: limit,
                total: wwoofers.count
            }
        });
    });
};

/**
 * Searches and returns a single wwoofer.
 */
exports.single = function (req, res) {
    db.Wwoofer.find({
        where: { id: req.params.id },
        include: [
            { model: db.User },
            { model: db.Address,
                include: [
                    { model: db.Department },
                    { model: db.Country }
                ]
            }
        ]
    }).success(function (wwoofer) {
        if (!wwoofer) {
            res.status(404).end();
        } else {
            res.send({ wwoofer: wwoofer });
        }
    })
};

/**
 * Updates a wwoofer.
 */
exports.update = function (req, res) {

    // Validate input
    if (!req.body.wwoofer) {
        res.status(400).end();
        return;
    }

    // Find the original wwoofer
    db.Wwoofer.find({
        where: {
            id: req.params.id,
            userId: req.user.id
        }
    }).success(function (wwoofer) {
        if (wwoofer) {
            // Update the wwoofer
            wwoofer.updateAttributes(
                req.body.wwoofer,
                updatableAttributes
            ).success(function (wwoofer) {
                    res.send({ wwoofer: wwoofer });
                }).error(function (error) {
                    res.status(500).send(error);
                })
        } else {
            res.status(404).end();
        }
    }).error(function (error) {
        res.status(500).send(error);
    });
};

/**
 * Creates a wwoofer.
 */
exports.create = function (req, res) {

    // Validate input
    if (!req.body.wwoofer) {
        res.status(400).end();
        return;
    }
    if (req.body.wwoofer.userId != req.user.id) {
        res.status(400).end();
        return;
    }

    // Make sure the current user does not have a wwoofer yet
    db.Wwoofer.find({
        where: { userId: req.user.id }
    }).success(function (wwoofer) {
        if (wwoofer) {
            // Existing wwoofer found for this user
            res.status(409).end();
        } else {
            // Create the host
            db.Wwoofer.create(
                req.body.wwoofer,
                updatableAttributes
            ).success(function (wwoofer) {
                    res.send({ wwoofer: wwoofer });
                }).error(function (error) {
                    res.send(500, error);
                })
        }
    }).error(function () {
        res.send(500, error);
    });
};