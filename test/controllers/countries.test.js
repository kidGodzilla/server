var request = require('supertest');
var helper = require('../helper');

describe('GET /api/countries', function () {

    it('should return 200', function (done) {
        request(helper.url)
            .get('/api/countries')
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                res.body.should.have.property('countries');
                done();
            });
    });
});

describe('GET /api/countries/:id', function () {

    it('should return a single country', function (done) {
        request(helper.url)
            .get('/api/countries/1')
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                res.body.should.have.property('country');
                res.body.country.should.have.property('id');
                res.body.country.id.should.equal(1);
                done();
            });
    });

    it('should return 404 if id not valid', function (done) {
        request(helper.url)
            .get('/api/countries/not-valid')
            .expect(404)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            });
    });
});