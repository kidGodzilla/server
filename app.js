var express = require('express'),
    expressValidator = require('express-validator'),
    passport = require('passport'),
    config = require('./config/config')(),
    mailer = require('express-mailer'),
    jade = require('jade'),
    domain = require('domain'),
    paypal = require('paypal-rest-sdk'),
    session = require('express-session'),
    SessionStore = require('express-mysql-session'),
    i18n = require("i18n");

// Create express app
var app = express();

// Configure express app
app.set('port', process.env.PORT || config.port);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// Configure paypal
paypal.configure(config.paypal);

// Configure mailer (must be called before "app.use(app.router)")
mailer.extend(app, config.smtp);

// Global error handler
// TODO: must be improved to use clusters (see http://nodejs.org/api/domain.html)
function domainWrapper() {
    return function (req, res, next) {
        var reqDomain = domain.create();
        reqDomain.add(req);
        reqDomain.add(res);

        res.on('close', function () {
            reqDomain.dispose();
        });
        reqDomain.on('error', function (err) {
            next(err);
        });
        reqDomain.run(next);
    }
}

// Configure i18n
i18n.configure({
    locales: ['en', 'fr'],
    directory: __dirname + '/locales'
});

// Configure session
app.use(express.cookieParser());
app.use(session({
    secret: config.session_secret,
    cookie: { httpOnly: false },
    store: new SessionStore(config.mysql_session)
}));

// Configure the rest of the application
app.use(domainWrapper());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.bodyParser());
app.use(expressValidator());
app.use(express.static('public'));
app.use(i18n.init);

// Development only configuration
app.configure('development', function () {
    app.use(express.logger('dev'));
    app.use(express.errorHandler());
});

// Configure authentication with passport
require('./config/passport')(app, passport);

// Use router (must be declared after passport)
app.use(app.router);

// Init all routes
require('./routes')(app, passport);

exports = module.exports = app;