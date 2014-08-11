/**
 * API controller for Countries.
 */
var db = require('../models');

/**
 * Returns all countries.
 */
exports.index = function (req, res) {
    db.Country
        .findAll()
        .success(function (countries) {
            res.send({ countries: countries });
        }).error(function (error) {
            res.status(500).send(error);
        });
};

/**
 * Returns a single country.
 */
exports.single = function (req, res) {
    db.Country.find({
        where: { id: req.params.id }
    }).success(function (country) {
        // Returns country or 404 if not found
        if (country) {
            res.send({ country: country });
        } else {
            res.status(404).end();
        }
    }).error(function (error) {
        res.status(500).send(error);
    });
};