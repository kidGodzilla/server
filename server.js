var app = require('./app'),
    db = require('./models'),
    http = require('http'),
    config = require('./config/config')(),
    prompt = require('prompt');

// Start prompt
prompt.start();

// Prepare database actions
var promise = db.sequelize.authenticate().then(function () {

    if (config.syncDatabase) {
        console.log('Database "' + config.mysql.database + '" will be wiped out! Are you sure? (y/n)');
        prompt.get(['confirm'], function (err, result) {
            if (result.confirm === 'y') {

                promise = db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
                    .then(function () {
                        console.log("Resetting database...");
                        return db.sequelize.sync({ force: true });
                    })
                    .then(function () {
                        return db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
                    })
                    .then(function () {
                        return db.sequelize.query('ALTER TABLE users MODIFY birthDate DATE');
                    })
                    .then(function () {
                        return db.sequelize.query('ALTER TABLE wwoofers MODIFY birthDate2 DATE');
                    });
            }

            // Wait until all promises are complete then start server
            promise.then(function () {
                console.log('Database ready. Starting the server...');
                http.createServer(app).listen(app.get('port'), function () {
                    console.log('Express server listening on port ' + app.get('port'));
                })
            }).catch(function (err) {
                console.log(err);
            });
        });
    }
});