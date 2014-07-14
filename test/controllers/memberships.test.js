var request = require('supertest');
var helper = require('../helper');

describe('GET /api/memberships', function () {

    it('should return 401 if not authenticated', function (done) {
        request(helper.url)
            .get('/api/memberships')
            .end(function (err, res) {
                if (err) return done(err);
                res.should.have.status(401);
                done();
            });
    });
    it('should return 400 if no user id was provided in query parameter', function (done) {
        request(helper.url)
            .get('/api/memberships')
            .set('cookie', helper.authCookie)
            .end(function (err, res) {
                if (err) return done(err);
                res.should.have.status(400);
                done();
            });
    });
    it('should return 400 if not an admin and requesting the memberships of another user', function (done) {
        request(helper.url)
            .get('/api/memberships?userId=' + 123)
            .set('cookie', helper.authCookie)
            .end(function (err, res) {
                if (err) return done(err);
                res.should.have.status(400);
                done();
            });
    });
    it('should return 200 if requesting my own memberships', function (done) {
        request(helper.url)
            .get('/api/memberships?userId=' + helper.user.id)
            .set('cookie', helper.authCookie)
            .end(function (err, res) {
                if (err) return done(err);
                res.should.have.status(200);
                done();
            });
    });
    it('should return 200 if admin', function (done) {
        return helper.login(true).then(function () {
            request(helper.url)
                .get('/api/memberships?userId=' + 123)
                .set('cookie', helper.authCookie)
                .end(function (err, res) {
                    if (err) return done(err);
                    res.should.have.status(200);
                    done();
                });
        });
    });
});