const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', () => {
    const symbol = 'AMZN';
    const symbol1 = 'AAPL'
    const symbol2 = 'NVDA';
   
    let likes = 0;

    test('/api/stock-prices/', (done) => {
        chai.request(server)
        .get(`/api/stock-prices?stock=${symbol}`)
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isDefined(res.body.stockData);
            assert.property(res.body.stockData, "stock", symbol);
            assert.isDefined(res.body.stockData.price);
            assert.isDefined(res.body.stockData.likes);
            likes = res.body.stockData.likes;
            done();
        });
    });
    test('/api/stock-prices/ like1', (done) => {
        chai.request(server)
        .get(`/api/stock-prices?stock=${symbol}&like=true`)
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isDefined(res.body.stockData);
            assert.property(res.body.stockData, "stock", symbol);
            assert.isDefined(res.body.stockData.price);
            assert.property(res.body.stockData, "likes", likes+1);
            likes = res.body.stockData.likes;
            done();
        });
    });
    test('/api/stock-prices/ like2', (done) => {
        chai.request(server)
        .get(`/api/stock-prices?stock=${symbol}&like=true`)
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isDefined(res.body.stockData);
            assert.property(res.body.stockData, "stock", symbol);
            assert.isDefined(res.body.stockData.price);
            assert.property(res.body.stockData, "likes", likes);
            done();
        });
    });
    test('/api/stock-prices/ 2 stock', (done) => {
        chai.request(server)
        .get(`/api/stock-prices?stock=${symbol1}&stock=${symbol2}`)
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body.stockData);
            const data = res.body.stockData;

            assert.property(data[0], "stock", symbol1);
            assert.isDefined(data[0].price);
            assert.isDefined(data[0].rel_likes);

            assert.property(data[1], "stock", symbol2);
            assert.isDefined(data[1].price);
            assert.isDefined(data[1].rel_likes);
            done();
        });
    });
    test('/api/stock-prices/ 2 stock like1', (done) => {
        chai.request(server)
        .get(`/api/stock-prices?stock=${symbol1}&stock=${symbol2}&like=true`)
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body.stockData);
            const data = res.body.stockData;

            assert.property(data[0], "stock", symbol1);
            assert.isDefined(data[0].price);
            assert.isDefined(data[0].rel_likes);
            likes1=data[0].likes;

            assert.property(data[1], "stock", symbol2);
            assert.isDefined(data[1].price);
            assert.isDefined(data[1].rel_likes);
            likes2=data[1].likes;
            done();
        });
    });
    test('/api/stock-prices/ 2 stock like2', (done) => {
        chai.request(server)
        .get(`/api/stock-prices?stock=${symbol1}&stock=${symbol2}&like=true`)
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body.stockData);
            const data = res.body.stockData;

            assert.property(data[0], "stock", symbol1);
            assert.isDefined(data[0].price);
            assert.isDefined(data[0].rel_likes);

            assert.property(data[1], "stock", symbol2);
            assert.isDefined(data[1].price);
            assert.isDefined(data[1].rel_likes);
            likes2=data[1].likes;
            done();
        });
    });
});
