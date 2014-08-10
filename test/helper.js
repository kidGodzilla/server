/**
 * Mocha test helper.
 */
var request = require('supertest-as-promised'),
    url = exports.url = 'http://localhost:3333',
    http = require('http'),
    config,
    app,
    db = exports.db;

/**
 * Logs user in and sets the authentication cookie.
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
            .post('/api/users/login')
            .send({ username: email, password: 'plop' })
            .expect(200);
    }).then(function (res) {
        res.body.user.isAdmin.should.be.equal(isAdmin);
        // Set the auth cookie and exit
        return exports.authCookie = res.headers['set-cookie'];
    });
};

/**
 * Resets the database (drops then recreates all tables).
 */
resetDatabase = exports.resetDatabase = function resetDatabase() {
    return db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
        .then(function () {
            console.log('Resetting database ' + config.mysql.database + '...');
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
};

/**
 * Before all tests.
 */
before(function (done) {

    console.log('Set NODE_ENV variable for testing...');
    process.env.NODE_ENV = 'test';

    config = require('../config/config')();
    db = require('../models');
    app = require('../app');

    // Disable Sequelize logging
    db.sequelize.options.logging = false;

    // Start server
    http.createServer(app).listen(app.get('port'), function () {
        console.log('Express server listening on port ' + app.get('port'));
        done();
    });
});

/**
 * After all tests.
 */
after(function (done) {
    db.sequelize.options.logging = console.log;
    done();
});

/**
 * Before each test.
 */
beforeEach(function (done) {
    resetDatabase()
        .then(function () {
            return login(false);
        }).then(function () {
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
 * Gets a sample wwoofer.
 * @param wwooferId The id of the user the wwoofer should belong to.
 * @type {Object} A sample wwoofer.
 */
exports.getSampleWwoofer = getSampleWwoofer = function (userId) {
    return {
        tripMotivation: 'Discover organic farming',
        intro: 'I\'m a believer',
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
 * Gets a sample address.
 * @type {Object} A sample address.
 */
exports.getSampleAddress = getSampleAddress = function () {
    return {
        address1: 'Main St.',
        zipCode: '98105',
        city: 'Seattle',
        countryId: 1
    };
};

/**
 * Gets a sample country.
 * @type {Object} A sample country.
 */
exports.getSampleCountry = getSampleCountry = function () {
    return {
        code: 'FR',
        name: 'France'
    };
};

/**
 * Gets a sample department.
 * @type {Object} A sample department.
 */
exports.getSampleDepartment = getSampleDepartment = function () {
    return {
        code: '03',
        name: 'Allier'
    };
};

/**
 * Gets a sample membership.
 * @param userId The id of the user the membership should belong to.
 * @param type The type of membership (H/W).
 * @type {Object} A sample membership.
 */
exports.getSampleMembership = getSampleMembership = function (userId, type) {
    return {
        type: type,
        expireAt: '2016-05-27 00:00:00',
        itemCode: 'H',
        paymentType: 'PPL',
        userId: userId
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
 * Creates a wwoofer.
 * @param userId The id of the user the wwoofer should belong to.
 * @returns {Object} A promise of the created wwoofer.
 */
exports.createWwoofer = function (userId) {
    return db.Wwoofer.create(getSampleWwoofer(userId));
};

/**
 * Creates a photo.
 * @param hostId The id of the host the photo should belong to.
 * @returns {Object} A promise of the created photo.
 */
exports.createPhoto = function (hostId) {
    return db.Photo.create(getSamplePhoto(hostId));
};

/**
 * Creates an address.
 * @returns {Object} A promise of the created address.
 */
exports.createAddress = function () {
    return db.Address.create(getSampleAddress());
};

/**
 * Creates a country.
 * @returns {Object} A promise of the created country.
 */
exports.createCountry = function () {
    return db.Country.create(getSampleCountry());
};

/**
 * Creates a department.
 * @returns {Object} A promise of the created department.
 */
exports.createDepartment = function () {
    return db.Department.create(getSampleDepartment());
};

/**
 * Creates a membership.
 * @param userId The id of the user the membership should belong to.
 * @param type The type of membership (H/W).
 * @returns {Object} A promise of the created membership.
 */
exports.createMembership = function (userId, type) {
    return db.Membership.create(getSampleMembership(userId, type));
};