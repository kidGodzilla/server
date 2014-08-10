var request = require('supertest'),
    helper = require('../helper');

describe('GET /api/hosts', function () {

    it('should return 200', function (done) {
        request(helper.url)
            .get('/api/hosts')
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                res.body.should.have.property('hosts');
                res.body.hosts.length.should.be.above(0);
                res.body.hosts.forEach(function (host) {
                    host.isPending.should.be.false;
                });
                done();
            });
    });

    it('should ignore pendingOnly parameter if not an admin', function (done) {
        request(helper.url)
            .get('/api/hosts?pendingOnly=true')
            .set('cookie', helper.authCookie)
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                res.body.hosts.length.should.be.above(0);
                res.body.hosts.forEach(function (host) {
                    host.isPending.should.be.false;
                });
                done();
            });
    });

    it('should return only pending hosts', function (done) {
        // Create a pending host
        helper.createHost(helper.user.id).then(function (host) {
            host.isPending.should.be.true;
            // Login as an admin
            return helper.login(true);
        }).then(function () {
            request(helper.url)
                .get('/api/hosts?pendingOnly=true')
                .set('cookie', helper.authCookie)
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    res.body.hosts.length.should.be.above(0);
                    res.body.hosts.forEach(function (host) {
                        host.isPending.should.be.true;
                    });
                    done();
                });
        });
    });
});

describe('GET /api/hosts/:id', function () {

    it('should return 200', function (done) {
        request(helper.url)
            .get('/api/hosts/1')
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                res.body.should.have.property('host');
                done();
            });
    });
});

describe('POST /api/hosts', function () {

    it('should return 401 if not authenticated', function (done) {
        request(helper.url)
            .post('/api/hosts')
            .expect(401)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            });
    });

    it('should return 409 if user already has a host', function (done) {
        helper.createHost(helper.user.id).then(function (host) {
            request(helper.url)
                .post('/api/hosts')
                .set('cookie', helper.authCookie)
                .send({ host: {} })
                .expect(409)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                });
        });
    });

    it('should create a host', function (done) {
        var host = helper.getSampleHost(helper.user.id);
        request(helper.url)
            .post('/api/hosts')
            .set('cookie', helper.authCookie)
            .send({ host: host })
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                res.body.should.have.property('host');
                res.body.host.userId.should.equal(helper.user.id);
                done();
            });
    });

    it('should create a pending host', function (done) {
        var host = helper.getSampleHost(helper.user.id);
        host.isPending = false;
        request(helper.url)
            .post('/api/hosts')
            .set('cookie', helper.authCookie)
            .send({ host: host })
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                res.body.should.have.property('host');
                res.body.host.isPending.should.be.true;
                done();
            });
    });
});

describe('PUT /api/hosts/:id', function () {

    it('should return 400 if body does not contain a host', function (done) {
        request(helper.url)
            .put('/api/hosts/1')
            .set('cookie', helper.authCookie)
            .expect(400)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            });
    });

    it('should return 401 if not authenticated', function (done) {
        request(helper.url)
            .put('/api/hosts/1')
            .expect(401)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            });
    });

    it('should return 404 if host belongs to another user', function (done) {
        // Create a host
        var host = null;
        helper.createHost(helper.user.id).then(function (newHost) {
            newHost.id.should.be.ok;
            host = newHost;
            // Login as someone else
            return helper.login(false);
        }).then(function () {
            request(helper.url)
                .put('/api/hosts/' + host.id)
                .set('cookie', helper.authCookie)
                .send({ host: {} })
                .expect(404)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                });
        });
    });

    it('should return 200 if user is an admin', function (done) {
        // Create a host
        var host = null;
        helper.createHost(helper.user.id).then(function (newHost) {
            newHost.id.should.be.ok;
            host = newHost;
            // Login as an admin
            return helper.login(true);
        }).then(function () {
            request(helper.url)
                .put('/api/hosts/' + host.id)
                .set('cookie', helper.authCookie)
                .send({ host: {} })
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                });
        });
    });

    it('should not update pending status if user is not an admin', function (done) {
        // Create a host
        var host = null;
        helper.createHost(helper.user.id).then(function (newHost) {
            newHost.id.should.be.ok;
            newHost.isPending.should.be.true;
            host = newHost;
        }).then(function () {
            request(helper.url)
                .put('/api/hosts/' + host.id)
                .set('cookie', helper.authCookie)
                .send({ host: { isPending: false } })
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    res.body.host.isPending.should.be.true;
                    done();
                });
        });
    });

    it('should update pending status if user is an admin', function (done) {
        // Create a host
        var host = null;
        helper.createHost(helper.user.id).then(function (newHost) {
            newHost.id.should.be.ok;
            newHost.isPending.should.be.true;
            host = newHost;
            // Login as an admin
            return helper.login(true);
        }).then(function () {
            request(helper.url)
                .put('/api/hosts/' + host.id)
                .set('cookie', helper.authCookie)
                .send({ host: { isPending: false } })
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    res.body.host.isPending.should.be.false;
                    done();
                });
        });
    });
});