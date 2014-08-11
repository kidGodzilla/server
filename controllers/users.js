/**
 * API controller for Users.
 */
var db = require('../models');
var crypto = require('crypto');
var updatableAttributes = ['email', 'firstName', 'lastName', 'birthDate', 'phone'];

/**
 * Searches and returns a list of users.
 */
exports.index = function (req, res) {

    // Extract query params
    var limit = isNaN(parseInt(req.query.limit)) ? 20 : parseInt(req.query.limit);
    var offset = isNaN(parseInt(req.query.offset)) ? 0 : parseInt(req.query.offset);

    // Find all hosts matching parameters
    db.User.findAll({
        limit: limit,
        offset: offset,
        include: [
            { model: db.Wwoofer },
            { model: db.Host }
        ]
    }).success(function (users) {

        // Count total hosts
        db.User.count({
            // where: where
        }).on('success', function (count) {
            res.send({
                users: users,
                meta: {
                    offset: offset,
                    limit: limit,
                    total: count
                }
            });
        })
    });
};

/**
 * Searches and returns a single user.
 */
exports.single = function (req, res) {
    db.User.find({
        where: { id: req.params.id },
        include: [ db.Host, db.Wwoofer ]
    }).then(function (user) {
        // Not found
        if (!user) {
            res.status(404).end();
            return;
        }
        // Unauthorized
        if (user.id != req.user.id) {
            res.status(401).end();
            return;
        }
        // Success
        res.send({ user: user });
    }).catch(function (error) {
        res.status(500).send(error);
    });
};

/**
 * Creates a new user and sends a confirmation email.
 * TODO: add tests + send emails in a folder in dev mode.
 */
exports.create = function (req, res) {

    // Validate input
    if (!req.body.user || req.body.user.password.length < 8) {
        res.status(400).end();
        return;
    }

    // Make sure email address is not in use
    db.User.find({
        where: { email: req.body.user.email }
    }).then(function (user) {

        // Email address is already in use
        if (user) {
            res.status(409).end(); // Conflict
        } else {
            // Create a hash of the password
            req.body.user.passwordHash = crypto.createHash('sha1').update(req.body.user.password).digest("hex");

            // By default a user is not admin
            req.body.user.isAdmin = false;

            // Make passwordHash and isAdmin updatable
            updatableAttributes = updatableAttributes.concat(['passwordHash', 'isAdmin']);

            // Create the user
            return db.User.create(req.body.user, updatableAttributes);
        }
    }).then(function (user) {
        if (user) {
            // Send email
            res.mailer.send('register', {
                to: user.email,
                subject: 'Welcome to Wwoof France!',
                firstName: user.firstName
            }, function (error) {
                if (error) {
                    res.status(500).send(error);
                } else {
                    res.send({ user: user });
                }
            });
        }
    }, function (error) {
        res.status(500).send(error);
    })
};

exports.update = function (req, res) {

    // Make sure email address is not in use
    db.User.count({
        where: {
            email: req.body.user.email,
            id: { ne: req.user.id }
        }
    }).success(function (count) {

        // Email address is already in use
        if (count > 0) {
            res.status(409).end(); // Conflict
            return;
        }

        // Find the original user
        db.User.find({
            where: {
                id: req.user.id
            }
        }).success(function (user) {
            if (user) {
                // Update the user
                user.updateAttributes(
                    req.body.user,
                    updatableAttributes
                ).success(function (user) {
                        res.send({ user: user });
                    }).error(function (error) {
                        res.send(500, error);
                    })
            } else {
                res.status(404).end();
            }
        }).error(function (error) {
            res.status(500).send(error);
        });
    })
};