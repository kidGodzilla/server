var LocalStrategy = require('passport-local').Strategy,
    db = require('../../server/models'),
    crypto = require('crypto');

/**
 * initializes and configure passport authentication.
 * @param app The express application.
 * @param passport The passport middleware.
 */
module.exports = function (app, passport) {

    // Init passport
    app.use(passport.initialize());

    // Enable session middleware
    app.use(passport.session());

    // Configure authentication
    passport.use(new LocalStrategy(
        function (username, password, done) {

            console.log('Authenticating user \'' + username + '\'');

            // Process the hash of the password
            var passwordHash = crypto.createHash('sha1').update(password).digest("hex");

            db.User.find({
                where: { email: username }
            }).success(function (user) {
                if (!user) {
                    return done(null, false, { message: 'Incorrect username.' });
                }
                if (user.passwordHash !== passwordHash) {
                    return done(null, false, { message: 'Incorrect password.' });
                }

                // Success: return user
                return done(null, user);

            }).error(function (error) {
                done(error);
            });
        }
    ));

    // Indicates what must be serialized in session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // Finds the authenticated user object from the id stored in session
    passport.deserializeUser(function (id, done) {
        db.User.find(id).success(function (user) {
            if (user) {
                done(null, user);
            } else {
                return done(null, false);
            }
        }).error(function (error) {
            done(error, null);
        });
    });
};
