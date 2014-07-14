/**
 * API controller for Memberships.
 */
var db = require('../models');

exports.index = function (req, res) {

    // Only admin can query memberships that do not belong to them
    req.checkQuery('userId', 'Invalid or missing user id').notEmpty().isInt();
    var errors = req.validationErrors();
    if (errors) {
        res.send(400, errors);
        return;
    }
    if (req.query.userId != req.user.id && !req.user.isAdmin) {
        res.send(400);
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
        res.send(500, error);
    });
};