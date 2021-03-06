/**
 * API controller for Hosts.
 */
var db = require('../models'),
    Sequelize = require('sequelize'),
    error = require('../utils/error'),
    moment = require('moment'),
    updatableAttributes = ['farmName', 'shortDescription', 'fullDescription', 'webSite', 'travelDetails', 'userId', 'addressId', 'noPhone', 'noEmail'];
/**
 * Returns a paginated list of hosts.
 * This route can be accessed from non authenticated users, but returns additional data for members (TODO).
 */
exports.index = function (req, res) {

    // Extract query params
    var limit = isNaN(parseInt(req.query.limit)) ? 20 : parseInt(req.query.limit),
        offset = isNaN(parseInt(req.query.offset)) ? 0 : parseInt(req.query.offset),
        dptWhere = req.query.dpt ? { id: req.query.dpt } : null;

    // Prepare host where condition (hide suspended/pending hosts to non admin users)
    // $BUG: hostWhere must always contain at least one condition, otherwise the query fails
    var hostWhere = Sequelize.and();
    hostWhere.args.push({ isSuspended: false });
    if (!req.user || !req.user.isAdmin) {
        hostWhere.args.push({ isPending: false });
    } else {
        // Only admins can view pending/suspended hosts
        if (req.query.pendingOnly === 'true') {
            hostWhere.args.push({ isPending: true });
        }
    }

    // Exclude hosts without membership if user is not an admin
    // $BUG: this part of the query could not be generated properly via the ORM
    if (!req.user || !req.user.isAdmin) {
        hostWhere.args.push('(SELECT `userId` FROM `memberships` ' +
            'WHERE `hosts`.`userId` = `memberships`.`userId` ' +
            'AND `memberships`.`type` = \'H\' ' +
            'AND `memberships`.`expireAt` > \'' + moment().toISOString() + '\' LIMIT 1) IS NOT NULL');
    }

    // Prepare user where condition
    var userWhere = null;
    if (req.query.searchTerm) {
        userWhere = Sequelize.or(
            ['firstName like ?', '%' + req.query.searchTerm + '%'],
            ['lastName like ?', '%' + req.query.searchTerm + '%']
        )
    }

    // Find all hosts matching parameters
    db.Host.findAndCountAll({
        limit: limit,
        offset: offset,
        where: hostWhere,
        include: [
            {
                model: db.User,
                where: userWhere
            },
            {
                model: db.Address,
                include: [
                    {
                        model: db.Department,
                        where: dptWhere
                    }
                ]
            },
            {
                model: db.Photo,
                as: 'photos'
            }
        ]
    }).then(function (hosts) {
        res.send({
            hosts: hosts.rows,
            meta: {
                offset: offset,
                limit: limit,
                total: hosts.count
            }
        });
    }).catch(function (error) {
        res.status(500).send(error);
    });
};

/**
 * Returns a single host.
 * TODO: add condition to exclude pending hosts if not admin or not owner.
 */
exports.single = function (req, res) {
    db.Host.find({
        include: [
            { model: db.Photo, as: 'photos' },
            { model: db.User, as: 'user' },
            { model: db.Address, as: 'address' }
        ],
        where: { id: req.params.id }
    }).then(function (host) {
        // Returns host or 404 if not found
        if (host) {
            res.send({ host: host });
        } else {
            res.status(404).end();
        }
    }).catch(function (error) {
        res.status(500).send(error);
    });
};

/**
 * Updates a host.
 */
exports.update = function (req, res) {

    // Validate input
    if (!req.body.host) {
        res.status(400).end();
        return;
    }

    // Only admins can update a host that does not belong to the current user
    var userIdFilter = req.user.isAdmin ? null : { userId: req.user.id };

    // Find the original host
    db.Host.find({
        where: Sequelize.and(
            { id: req.params.id },
            userIdFilter
        )
    }).then(function (host) {
        if (host) {
            // Make isPending and isSuspended updatable if the user is admin
            var attributes = req.user.isAdmin
                ? updatableAttributes.concat(['isPending', 'isSuspended'])
                : updatableAttributes;

            // Update the host
            return host.updateAttributes(req.body.host, attributes);
        } else {
            return null;
        }
    }).then(function (host) {
        // The updateAttributes method returns object containing all passed attributes: we must reload
        // See: https://github.com/sequelize/sequelize/issues/1320
        if (host) {
            return host.reload();
        }
    }).then(function (host) {
        if (host) {
            res.send({ host: host });
        } else {
            res.status(404).end();
        }
    }).catch(function (error) {
        res.status(500).send(error);
    });
};

/**
 * Creates a host.
 */
exports.create = function (req, res) {

    // Validate input
    if (!req.body.host) {
        res.status(400).end();
        return;
    }

    // Make sure the current user does not have a host yet
    db.Host.find({
        where: { userId: req.user.id }
    }).then(function (host) {

        if (host) {
            // Existing host found for this user
            throw new error.ConflictError();
        }

        // Set the user id + default values
        req.body.host.userId = req.user.id;
        req.body.host.isPending = true;
        req.body.host.isSuspended = false;

        // Make isPending and isSuspended updatable
        var attributes = updatableAttributes.concat(['isPending', 'isSuspended']);

        // Create the host
        return db.Host.create(
            req.body.host,
            attributes
        );
    }).then(function (host) {
        res.send({ host: host });
    }).catch(error.ConflictError, function () {
        res.status(409).end();
    }).catch(function (error) {
        res.status(500).send(error);
    });
};