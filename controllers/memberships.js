/**
 * API controller for Memberships.
 */
var db = require('../models');

exports.index = function (req, res) {

    // Make sure a user id was provided
    req.checkQuery('userId', 'Invalid or missing user id').notEmpty().isInt();
    var errors = req.validationErrors();
    if (errors) {
        res.status(400).send(errors);
        return;
    }

    // Only admin can query memberships that do not belong to them
    if (req.query.userId != req.user.id && !req.user.isAdmin) {
        res.status(400).end();
        return;
    }

    // Find memberships
    db.Membership.findAndCountAll({
        where: { userId: req.query.userId },
        limit: 50
    }).then(function (memberships) {
        res.send({
            memberships: memberships.rows,
            meta: {
                total: memberships.count
            }
        });
    }).catch(function (error) {
        res.status(500).send(error);
    });
};