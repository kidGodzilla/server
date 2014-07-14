/**
 * Ember application controller (main controller).
 */
exports.index = function (req, res) {
    // Log
    console.log(req.query);

    // Return the Ember application
    return res.sendfile('./public/index.html');
};