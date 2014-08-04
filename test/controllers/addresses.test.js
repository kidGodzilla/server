var request = require('supertest');
var helper = require('../helper');

describe.only('POST /api/addresses', function () {

    it('should return 401 if not authenticated', function (done) {
        request(helper.url)
            .post('/api/addresses')
            .expect(401)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            });
    });

    it('should return 400 if the body does not contain an address', function (done) {
        request(helper.url)
            .post('/api/addresses')
            .set('cookie', helper.authCookie)
            .expect(400)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            });
    });

    it('should return 409 if the user already has 2 addresses associated with its account', function (done) {
        var createdHost, createdWwoofer, createdHostAddress, createdWwooferAddress;
        helper.createHost(helper.user.id).then(function (host) {
            createdHost = host;
            return helper.createWwoofer(helper.user.id);
        }).then(function (wwoofer) {
            createdWwoofer = wwoofer;
            return helper.createAddress();
        }).then(function (address) {
            createdHostAddress = address;
            return helper.createAddress();
        }).then(function (address) {
            createdWwooferAddress = address;
            return helper.createAddress();
        }).then(function () {
            createdHost.addressId = createdHostAddress.id;
            return createdHost.save();
        }).then(function () {
            createdWwoofer.addressId = createdWwooferAddress.id;
            return createdWwoofer.save();
        }).then (function() {
            request(helper.url)
                .post('/api/addresses')
                .set('cookie', helper.authCookie)
                .send({ address: { } })
                .expect(409)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                });
        });
    });

    it('should create an address', function (done) {
        request(helper.url)
            .post('/api/addresses')
            .set('cookie', helper.authCookie)
            .send({ address: helper.getSampleAddress() })
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            });
    });
});