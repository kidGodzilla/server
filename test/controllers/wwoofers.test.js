var request = require('supertest'),
    helper = require('../helper');

describe('GET /api/wwoofers', function () {

    it('should return 401 if not authenticated', function (done) {
        request(helper.url)
            .get('/api/wwoofers')
            .expect(401, done);
    });
    it('should return 200 if authenticated', function (done) {
        request(helper.url)
            .get('/api/wwoofers')
            .set('cookie', helper.authCookie)
            .expect(200, done);
    });
});