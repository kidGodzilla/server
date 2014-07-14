var request = require('supertest');
var helper = require('../helper');

describe('GET /api/departments', function () {

    it('should return 200', function (done) {
        request(helper.url)
            .get('/api/departments')
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                res.body.should.have.property('departments');
                done();
            });
    });
});

describe('GET /api/departments/:id', function () {

    it('should return a single department', function (done) {
        request(helper.url)
            .get('/api/departments/1')
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                res.body.should.have.property('department');
                res.body.department.should.have.property('id');
                res.body.department.id.should.equal(1);
                done();
            });
    });

    it('should return 404 if id not valid', function (done) {
        request(helper.url)
            .get('/api/departments/not-valid')
            .expect(404)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            });
    });
});