/**
 * API controller for Photos.
 */
var db = require('../models'),
    Sequelize = require('sequelize'),
    fs = require('fs'),
    error = require('../utils/error'),
    allowedMimeTypes = ['image/gif', 'image/jpeg', 'image/pjpeg', 'image/tiff', 'image/png'],
    updatableAttributes = ['caption'];

/**
 * Searches and returns a single photo.
 */
exports.single = function (req, res) {
    db.Photo.find({
        where: { id: req.params.id }
    }).success(function (photo) {
        if (!photo) {
            res.status(404).end();
        } else {
            res.send({ photo: photo });
        }
    }).error(function (error) {
        res.status(500).send(error);
    });
};

/**
 * Updates a photo.
 */
exports.update = function (req, res) {

    // Validate input
    if (!req.body.photo) {
        res.status(400).end();
        return;
    }

    // Find the photo (including the host to check ownership)
    db.Photo.find({
        where: { id: req.params.id },
        include: [
            {
                model: db.Host,
                where: { userId: req.user.id }
            }
        ]
    }).then(function (photo) {
        if (!photo) {
            return null;
        } else {
            return photo.updateAttributes(
                req.body.photo,
                updatableAttributes
            );
        }
    }).then(function (photo) {
        if (!photo) {
            res.status(404).end();
        } else {
            res.send({ photo: photo });
        }
    }, function (error) {
        res.status(500).send(error);
    });
};

/**
 * Uploads photos in the photo folder and create them in the database.
 */
exports.create = function (req, res) {

    // Data validation
    if (!req.query.hostId || !req.files || !req.files.file) {
        res.status(400).end();
        return;
    }

    // Only admins can upload a photo for a host that does not belong to the current user
    var userIdFilter = req.user.isAdmin ? null : { userId: req.user.id };

    // Find the host (including user id to check ownership)
    db.Host.find({
        where: Sequelize.and(
            { id: req.query.hostId },
            userIdFilter
        )
    }).then(function (host) {

        if (!host) {
            throw new error.NotFoundError();
        }

        // Get file
        var file = req.files.file;

        // Check format
        if (allowedMimeTypes.indexOf(file.mimetype) == -1) {
            throw new error.UnsupportedMediaTypeError();
        }

        // Check size
        if (file.size > 5000000) { // 5mb
            throw new error.FileTooBigError();
        }

        // Create the photo in the database
        return db.Photo.create({
            fileName: file.name,
            hostId: req.body.hostId
        });

    }).then(function (photo) {
        res.send({ photo: photo });
    }).catch(error.NotFoundError, function () {
        // Remove file
        fs.unlink(req.files.file.path);
        res.status(404).end();
    }).catch(error.UnsupportedMediaTypeError, function () {
        // Remove file
        fs.unlink(req.files.file.path);
        res.status(415).end(); // Unsupported Media Type
    }).catch(error.FileTooBigError, function () {
        // Remove file
        fs.unlink(req.files.file.path);
        res.status(413).end(); // Request Entity Too Large
    }).catch(function (error) {
        res.status(500).send(error);
    });
};

/**
 * Deletes a photo in the photo folder and delete them in the database.
 */
exports.delete = function (req, res) {

    // Find the original photo (including the host to check ownership)
    db.Photo.find({
        where: { id: req.params.id },
        include: [
            {
                model: db.Host,
                where: { userId: req.user.id }
            }
        ]
    }).then(function (photo) {

        if (!photo) throw new error.NotFoundError();

        // Delete the photo on the file system
        var fullPath = db.Photo.getFullPath(photo.fileName);
        fs.unlink(fullPath, function () {
            // Ignore errors
        });

        // Delete the photo in the database
        return photo.destroy();
    }).then(function () {
        res.status(204).end();
    }).catch(error.NotFoundError, function () {
        res.status(404).end();
    }).catch(function (error) {
        res.status(500).send(error);
    });
};