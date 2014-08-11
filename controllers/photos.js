/**
 * API controller for Photos.
 */
var db = require('../models'),
    Sequelize = require('sequelize'),
    path = require('path'),
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
            res.send(404);
        } else {
            res.send({ photo: photo });
        }
    }).error(function (error) {
        res.send(500, error);
    });
};

/**
 * Updates a photo.
 */
exports.update = function (req, res) {

    // Validate input
    if (!req.body.photo) {
        res.send(400);
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
            res.send(404);
        } else {
            res.send({ photo: photo });
        }
    }, function (error) {
        res.send(500, error);
    });
};

/**
 * Uploads photos in the photo folder and create them in the database.
 */
exports.create = function (req, res) {

    // Data validation
    if (!req.query.hostId || !req.files || !req.files.file) {
        return res.send(400);
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
        if (allowedMimeTypes.indexOf(file.headers['content-type']) == -1) {
            console.log('Unsupported file type: ' + file.headers['content-type'] + ' (' + file.name + ')');
            fs.unlinkSync(file.path);
            res.send(415); // Unsupported Media Type
            return;
        }

        // Check size
        if (file.size > 5000000) { // 5mb
            console.log('File is too big: ' + file.size + ' bytes (' + file.name + ')');
            fs.unlinkSync(file.path);
            res.send(413); // Request Entity Too Large
            return;
        }

        // Build new file name
        var newFileName = path.basename(file.path);
        var newPath = db.Photo.getFullPath(newFileName);

        // Move the photo from the temporary directory to the photo directory
        fs.rename(file.path, newPath, function (error) {

            // Handle error
            if (error) {
                console.error('Cannot move photo ' + file.originalFilename + ' to ' + newPath + '.');
                console.error(error);
                fs.unlinkSync(file.path);
                return;
            }

            // Log
            console.log('Photo \'' + file.originalFilename + '\' moved to ' + newPath + '.');

            // Create the photo in the database
            db.Photo.create({
                fileName: newFileName,
                hostId: req.body.hostId
            }).success(function (photo) {
                res.send({ photo: photo });
            }).error(function (error) {
                // Remove file
                fs.unlinkSync(newPath);
                res.send(500, error);
            })
        });
    }).catch(error.NotFoundError, function () {
        res.send(404, "Host not found.");
    }).catch(function (error) {
        res.send(500, error);
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

        // Delete the photo on the file system (ignore errors)
        var fullPath = db.Photo.getFullPath(photo.fileName);
        fs.unlink(fullPath);

        // Delete the photo in the database
        return photo.destroy();
    }).then(function () {
        res.send(204);
    }).catch(error.NotFoundError, function () {
        res.send(404);
    }).catch(function (error) {
        res.send(500, error);
    });
};