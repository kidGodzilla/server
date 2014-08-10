var request = require('supertest'),
    helper = require('../helper');

describe('GET /api/photos/:id', function () {

    it('should return a single photo', function (done) {
        request(helper.url)
            .get('/api/photos/1')
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                res.body.should.have.property('photo');
                res.body.photo.should.have.property('id');
                res.body.photo.id.should.equal(1);
                done();
            });
    });

    it('should return 404 if id not valid', function (done) {
        request(helper.url)
            .get('/api/photos/not-valid')
            .expect(404)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            });
    });
});

describe('PUT /api/photos/:id', function () {

    it('should return 404 if id not valid', function (done) {
        request(helper.url)
            .put('/api/photos/not-valid')
            .set('cookie', helper.authCookie)
            .send({ photo: {} })
            .expect(404)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            });
    });

    it('should return 404 if photo belongs to another user', function (done) {
        request(helper.url)
            .put('/api/photos/1')
            .set('cookie', helper.authCookie)
            .send({ photo: {} })
            .expect(404)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            });
    });

    it('should return 200 if photo was updated', function (done) {
        helper.createHost(helper.user.id).then(function (host) {
            return helper.createPhoto(host.id);
        }).then(function (photo) {
            request(helper.url)
                .put('/api/photos/' + photo.id)
                .set('cookie', helper.authCookie)
                .send({ photo: {} })
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                });
        });
    });

    it('should update caption', function (done) {
        helper.createHost(helper.user.id).then(function (host) {
            return helper.createPhoto(host.id);
        }).then(function (photo) {
            photo.caption.should.equal('foo');
            request(helper.url)
                .put('/api/photos/' + photo.id)
                .set('cookie', helper.authCookie)
                .send({ photo: { caption: 'bar' } })
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    res.body.should.have.property('photo');
                    res.body.photo.caption.should.equal('bar');
                    done();
                });
        });
    });
});

describe('POST /api/photos', function () {

    it('should return 404 if host id not valid', function (done) {
        request(helper.url)
            .post('/api/photos?hostId=notValid')
            .set('cookie', helper.authCookie)
            .attach('file', 'test/arbre.jpg')
            .send({ photo: {} })
            .expect(404)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            });
    });

    it('should return 404 if host belongs to another user', function (done) {
        request(helper.url)
            .post('/api/photos?hostId=2')
            .set('cookie', helper.authCookie)
            .attach('file', 'test/arbre.jpg')
            .expect(404)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            });
    });

    it('should return 415 if the photo does not have the right mime type', function (done) {
        helper.createHost(helper.user.id).then(function (host) {
            request(helper.url)
                .post('/api/photos?hostId=' + host.id)
                .set('cookie', helper.authCookie)
                .attach('file', 'test/helper.js')
                .expect(415)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                });
        });
    });

    it('should return photo', function (done) {
        helper.createHost(helper.user.id).then(function (host) {
            request(helper.url)
                .post('/api/photos?hostId=' + host.id)
                .set('cookie', helper.authCookie)
                .attach('file', 'test/arbre.jpg')
                .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    res.body.should.have.property('photo');
                    res.body.photo.should.have.property('id');
                    request(helper.url)
                        .get('/host_photos/' + res.body.photo.fileName)
                        .expect(200)
                        .end(function (err) {
                            if (err) return done(err);
                            done();
                        });
                });
        });
    });
});

describe('DELETE /api/photos/:id', function () {

    it('should return 404 if id not valid', function (done) {
        request(helper.url)
            .delete('/api/photos/not-valid')
            .set('cookie', helper.authCookie)
            .expect(404)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            });
    });

    it('should return 404 if id has no photo associated', function (done) {
        request(helper.url)
            .delete('/api/photos/156')
            .set('cookie', helper.authCookie)
            .send({ photo: {} })
            .expect(404)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            });
    });

    it('should return 404 if photo belongs to another user', function (done) {
        request(helper.url)
            .delete('/api/photos/1')
            .set('cookie', helper.authCookie)
            .send({ photo: {} })
            .expect(404)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            });
    });

    it('should return 204 (even if the file does not exist on drive)', function (done) {
        helper.createHost(helper.user.id).then(function (host) {
            return helper.createPhoto(host.id);
        }).then(function (photo) {
            request(helper.url)
                .delete('/api/photos/' + photo.id)
                .set('cookie', helper.authCookie)
                .expect(204)
                .end(function (err, res) {
                    if (err) return done(err);

                    helper.db.Photo.find(photo.id).then(function (photo) {
                        (photo === null).should.be.true;
                        done();
                    });
                });
        });
    });
});