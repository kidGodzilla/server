var app = require('./app'),
    db = require('./models'),
    http = require('http');

console.log('Authenticating against the database...');

db.sequelize.authenticate().then(function () {

    console.log('Authentication succeeded. Starting the server...');

    http.createServer(app).listen(app.get('port'), function () {
        console.log('Express server listening on port ' + app.get('port'));
    });
});