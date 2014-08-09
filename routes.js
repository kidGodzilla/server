var application = require('./controllers/application');
var auth = require('./controllers/auth');
var users = require('./controllers/users');
var hosts = require('./controllers/hosts');
var addresses = require('./controllers/addresses');
var photos = require('./controllers/photos');
var departments = require('./controllers/departments');
var wwoofers = require('./controllers/wwoofers');
var countries = require('./controllers/countries');
var paypal = require('./controllers/paypal');
var memberships = require('./controllers/memberships');

/**
 * Configures all routes.
 * @param app The express application.
 * @param passport The passport middleware.
 */
module.exports = function (app, passport) {

    app.get('/payment/start', auth.ensureAuthenticated, paypal.start);
    app.get('/payment/execute', auth.ensureAuthenticated, paypal.execute);
    app.get('/payment/cancel', auth.ensureAuthenticated, paypal.cancel);

    app.post('/api/users/login', passport.authenticate('local'), auth.loginCallback);
    app.post('/api/users/logout', auth.logout);

    app.get('/api/users', auth.ensureAuthenticated, users.index);
    app.get('/api/users/:id', auth.ensureAuthenticated, users.single);
    app.put('/api/users/:id', auth.ensureAuthenticated, users.update);
    app.post('/api/users', users.create);

    app.get('/api/hosts', hosts.index);
    app.get('/api/hosts/:id', hosts.single);
    app.put('/api/hosts/:id', auth.ensureAuthenticated, hosts.update);
    app.post('/api/hosts', auth.ensureAuthenticated, hosts.create);

    app.get('/api/addresses/:id', auth.ensureAuthenticated, addresses.single);
    app.put('/api/addresses/:id', auth.ensureAuthenticated, addresses.update);
    app.post('/api/addresses', auth.ensureAuthenticated, addresses.create);

    app.get('/api/photos/:id', photos.single);
    app.put('/api/photos/:id', auth.ensureAuthenticated, photos.update);
    app.post('/api/photos', auth.ensureAuthenticated, photos.create);
    app.delete('/api/photos/:id', auth.ensureAuthenticated, photos.delete);

    app.get('/api/departments', departments.index);
    app.get('/api/departments/:id', departments.single);

    app.get('/api/countries', countries.index);
    app.get('/api/countries/:id', countries.single);

    app.get('/api/wwoofers', auth.ensureAuthenticated, wwoofers.index);
    app.get('/api/wwoofers/:id', auth.ensureAuthenticated, wwoofers.single);
    app.put('/api/wwoofers/:id', auth.ensureAuthenticated, wwoofers.update);
    app.post('/api/wwoofers', auth.ensureAuthenticated, wwoofers.create);

    app.get('/api/memberships', auth.ensureAuthenticated, memberships.index);
};

