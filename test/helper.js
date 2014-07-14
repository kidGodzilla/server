/**
 * Mocha test helper.
 */
var request = require('supertest-as-promised');
var url = exports.url = 'http://localhost:3333';
var db = require('../models');

/**
 * Logs user in and set the authentication cookie.
 */
login = exports.login = function login(isAdmin) {

    // Create a random user
    var email = Math.random().toString(36).substr(2, 5) + '@test.com';
    return db.User.create({
        firstName: "Test",
        lastName: "User",
        email: email,
        passwordHash: '64faf5d0b1dc311fd0f94af64f6c296a03045571',
        birthDate: '1989-06-25 22:15:00',
        isAdmin: isAdmin
    }).then(function (user) {
        // Set the test user
        exports.user = user;
        return request(url)
            .post('/login')
            .send({ username: email, password: 'plop' })
            .expect(200);
    }).then(function (res) {
        res.body.user.isAdmin.should.be.equal(isAdmin);
        // Set the auth cookie and exit
        return exports.authCookie = res.headers['set-cookie'];
    });
};

/**
 * Mocha hooks.
 */
before(function (done) {
    db.sequelize.options.logging = false;
    done();
});
after(function (done) {
    db.sequelize.options.logging = console.log;
    done();
});
beforeEach(function (done) {
    login(false).then(function () {
        done();
    });
});

/**
 * Gets a sample host.
 * @param hostId The id of the user the host should belong to.
 * @type {Object} A sample host.
 */
exports.getSampleHost = getSampleHost = function (userId) {
    return {
        farmName: 'Test Farm',
        shortDescription: 'Short description of the farm',
        fullDescription: 'Full description of the farm',
        isPending: true,
        isSuspended: false,
        userId: userId
    };
};
/**
 * Gets a sample photo.
 * @param hostId The id of the host the photo should belong to.
 * @type {Object} A sample photo.
 */
exports.getSamplePhoto = getSamplePhoto = function (hostId) {
    return {
        fileName: 'test.jpg',
        hostId: hostId,
        caption: 'foo'
    };
};

/**
 * Creates a host.
 * @param userId The id of the user the host should belong to.
 * @returns {Object} A promise of the created host.
 */
exports.createHost = function (userId) {
    return db.Host.create(getSampleHost(userId));
};

/**
 * Creates a photo.
 * @param hostId The id of the host the photo should belong to.
 * @returns {Object} A promise of the created photo.
 */
exports.createPhoto = function (hostId) {
    return db.Photo.create(getSamplePhoto(hostId));
};