var express = require('express'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    errorhandler = require('errorhandler'),
    morgan  = require('morgan'),
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
app.use(cookieParser());
app.use(session({
    secret: config.session_secret,
    cookie: { httpOnly: false },
    store: new SessionStore(config.mysql_session),
    saveUninitialized: true,
    resave: true
}));

// Configure the rest of the application
app.use(domainWrapper());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(expressValidator());
app.use(express.static('public'));
app.use(i18n.init);

// Configure authentication with passport
require('./config/passport')(app, passport);

// Init all routes
require('./routes')(app, passport);

// Development and test only configurations
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('combined'));
    app.use(errorhandler());
}

exports = module.exports = app;