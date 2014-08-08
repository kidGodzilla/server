var request = require('supertest');
var helper = require('../helper');

describe('POST /api/addresses', function () {

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

describe('PUT /api/addresses/:id', function () {

    it('should return 401 if not authenticated', function (done) {
        request(helper.url)
            .put('/api/addresses/1')
            .expect(401)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            });
    });

    it('should return 400 if body does not contain an address', function (done) {
        request(helper.url)
            .put('/api/addresses/1')
            .set('cookie', helper.authCookie)
            .expect(400)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            });
    });

    it('should return 400 if the id in URL param does not match the id in body', function (done) {
        request(helper.url)
            .put('/api/addresses/1')
            .set('cookie', helper.authCookie)
            .send({ address: { id: 2 } })
            .expect(400)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            });
    });

    it('should return 404 if address belongs to another user', function (done) {
        request(helper.url)
            .put('/api/addresses/1')
            .set('cookie', helper.authCookie)
            .send({ address: { id: 1 } })
            .expect(404)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            });
    });

    it('should update the address if associated to a host owned by the user', function (done) {
        var createdHost, createdHostAddress;
        helper.createHost(helper.user.id).then(function (host) {
            createdHost = host;
            return helper.createAddress();
        }).then(function (address) {
            createdHostAddress = address;
            createdHost.addressId = createdHostAddress.id;
            return createdHost.save();
        }).then(function () {
            createdHostAddress.address1 = 'Plop Street';
            request(helper.url)
                .put('/api/addresses/' + createdHostAddress.id)
                .set('cookie', helper.authCookie)
                .send({ address: createdHostAddress })
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    res.body.address.address1.should.equal('Plop Street');
                    done();
                });
        });
    });

    it('should update the address if associated to a wwoofer owned by the user', function (done) {
        var createdWwoofer, createdWwoferAddress;
        helper.createWwoofer(helper.user.id).then(function (wwoofer) {
            createdWwoofer = wwoofer;
            return helper.createAddress();
        }).then(function (address) {
            createdWwoferAddress = address;
            createdWwoofer.addressId = createdWwoferAddress.id;
            return createdWwoofer.save();
        }).then(function () {
            createdWwoferAddress.address1 = 'Plop Street';
            request(helper.url)
                .put('/api/addresses/' + createdWwoferAddress.id)
                .set('cookie', helper.authCookie)
                .send({ address: createdWwoferAddress })
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    res.body.address.address1.should.equal('Plop Street');
                    done();
                });
        });
    });

});