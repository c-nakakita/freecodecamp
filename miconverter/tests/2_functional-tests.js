const chaiHttp = require('chai-http');
const chai = require('chai');
let assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    test('有効な入力を変換', function (done) {
        chai
        .request(server)
        .keepOpen()
        .get('/api/convert?input=4gal')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.initNum, 4);
          assert.equal(res.body.initUnit, 'gal');
          assert.equal(res.body.returnNum, 15.14164);
          assert.equal(res.body.returnUnit, 'L');
          assert.equal(res.body.string, '4 gallons converts to 15.14164 liters');
          done();
        });
    });
    test('無効な入力を変換', function (done) {
        chai
        .request(server)
        .keepOpen()
        .get('/api/convert?input=32g')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body, 'invalid unit');
          done();
        });
    });
    test('無効な数字を変換', function (done) {
        chai
        .request(server)
        .keepOpen()
        .get('/api/convert?input=3/7.2/4kg')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body, 'invalid number');
          done();
        });
    });
    test('無効な数字かつ単位を変換', function (done) {
        chai
        .request(server)
        .keepOpen()
        .get('/api/convert?input=3/7.2/4kilomegagram')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body, 'invalid number and unit');
          done();
        });
    });
    test('数字のない入力を変換', function (done) {
        chai
        .request(server)
        .keepOpen()
        .get('/api/convert?input=gal')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.initNum, 1);
          assert.equal(res.body.initUnit, 'gal');
          assert.equal(res.body.returnNum, 3.78541);
          assert.equal(res.body.returnUnit, 'L');
          assert.equal(res.body.string, '1 gallons converts to 3.78541 liters');
          done();
        });
    });
    this.afterAll(function () {
        chai.request(server).get('/api');
    });
});
