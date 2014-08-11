/**
 * API controller for French Departments.
 */
var db = require('../models');

/**
 * Returns all French departments.
 */
exports.index = function (req, res) {
    db.Department
        .findAll()
        .success(function (departments) {
            res.send({ departments: departments });
        }).error(function (error) {
            res.status(500).send(error);
        });
};

/**
 * Returns a single French department.
 */
exports.single = function (req, res) {
    db.Department.find({
        where: { id: req.params.id }
    }).success(function (department) {
        // Returns department or 404 if not found
        if (department) {
            res.send({ department: department });
        } else {
            res.status(404).end();
        }
    }).error(function (error) {
        res.status(500).send(error);
    });
};
