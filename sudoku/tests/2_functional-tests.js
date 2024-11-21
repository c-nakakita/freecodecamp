const chai = require("chai");
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');

const pzl = require('../controllers/puzzle-strings.js');

chai.use(chaiHttp);

suite('Functional Tests', () => {
    const rows = 'ABCDEFGHI';
    // #1
    test('有効なパズル文字列のパズルを解く: /api/solve', (done) => {
        chai
            .request(server)
            .keepOpen()
            .post('/api/solve')
            .send({ puzzle: pzl.puzzlesAndSolutions[0][0] })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.solution, pzl.puzzlesAndSolutions[0][1]);
                done();
            });
    });
    // #2
    test('パズル文字列が不足しているパズルを解く: /api/solve', (done) => {
        chai
            .request(server)
            .keepOpen()
            .post('/api/solve')
            .send({ puzzle: '.'.repeat(81) })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.solution, '123456789456789123789123456214365897365897214897214365531642978642978531978531642');
                done();
            });
    });
    // #3
    test('無効な文字のパズルを解く: /api/solve', (done) => {
        chai
            .request(server)
            .keepOpen()
            .post('/api/solve')
            .send({ puzzle: pzl.puzzlesAndSolutions[0][0].slice(0, -1) + 'a' })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, 'Invalid characters in puzzle');
                done();
            });
    });
    // #4
    test('誤った長さのパズルを解く: /api/solve', (done) => {
        chai
            .request(server)
            .keepOpen()
            .post('/api/solve')
            .send({ puzzle: pzl.puzzlesAndSolutions[0][0].slice(0, -1) })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, 'Expected puzzle to be 81 characters long');
                done();
            });
    });
    // #5
    test('解くことができないパズルを解く: /api/solve', (done) => {
        chai
            .request(server)
            .keepOpen()
            .post('/api/solve')
            .send({ puzzle: pzl.puzzlesAndSolutions[0][0].slice(0, -1) + '5' })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, 'Puzzle cannot be solved');
                done();
            });
    });
    // #6
    test('すべてのフィールドのパズル配置を確認: /api/check', (done) => {
        var str = pzl.puzzlesAndSolutions[0][0];
        var cor = pzl.puzzlesAndSolutions[0][1];
        let promise = Promise.resolve();

        for (let i = 0; i < 81; i++) {
            promise = promise.then(() => {
                let row = rows.charAt(Math.floor(i / 9));
                let col = (i % 9) + 1;
                chai
                .request(server)
                .keepOpen()
                .post('/api/check')
                .send({
                    puzzle: str,
                    coordinate: `${row}${col}`,
                    value: cor.charAt(i)
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.valid, true);
                    assert.isUndefined(res.body.conflict);
                });
            });
        }
        promise.then(() => done()).catch(done);

    });
    // #7
    test('1 つの配置が競合しているパズル配置を確認: /api/check', (done) => {
        var str = pzl.puzzlesAndSolutions[0][0];
        chai
            .request(server)
            .keepOpen()
            .post('/api/check')
            .send({
                puzzle: str,
                coordinate: "A2",
                value: '9'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.valid, false);
                assert.isArray(res.body.conflict);
                assert.equal(res.body.conflict.length, 1);
                assert.equal(res.body.conflict[0], 'column');
                done();
            });
    });
    // #8
    test('複数の配置が競合しているパズル配置を確認: /api/check', (done) => {
        var str = pzl.puzzlesAndSolutions[0][0];
        chai
            .request(server)
            .keepOpen()
            .post('/api/check')
            .send({
                puzzle: str,
                coordinate: "A2",
                value: '5'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.valid, false);
                assert.isArray(res.body.conflict);
                assert.equal(res.body.conflict.length, 2);
                assert.equal(res.body.conflict[0], 'row');
                assert.equal(res.body.conflict[1], 'region');
                done();
            });
    });
    // #9
    test('すべての配置が競合しているパズルの配置を確認: /api/check', (done) => {
        var str = pzl.puzzlesAndSolutions[0][0];
        chai
            .request(server)
            .keepOpen()
            .post('/api/check')
            .send({
                puzzle: str,
                coordinate: "A2",
                value: '2'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.valid, false);
                assert.isArray(res.body.conflict);
                assert.equal(res.body.conflict.length, 3);
                assert.equal(res.body.conflict[0], 'row');
                assert.equal(res.body.conflict[1], 'column');
                assert.equal(res.body.conflict[2], 'region');
                done();
            });
    });
    // #10
    test('必須フィールドがないパズル配置を確認: /api/check', (done) => {
        var str = pzl.puzzlesAndSolutions[0][0];
        let promise = Promise.resolve();
        const reqParams = ['puzzle', 'coordinate', 'value'];
        const data = {
            puzzle: str,
            coordinate: "A2",
            value: '2'
        };
        reqParams.forEach(param => {
            promise = promise.then(() => {
                let keys = reqParams.filter(x => x != param);
                let tmpData = Object.fromEntries(keys.map(key => [key, data[key]]))
                chai
                    .request(server)
                    .keepOpen()
                    .post('/api/check')
                    .send(tmpData)
                    .end((err, res) => {
                        assert.equal(res.status, 200);
                        assert.equal(res.body, 'Required field(s) missing');
                    });
            });
        });
        promise.then(() => done()).catch(done);
    });
    // #11
    test('無効な文字のパズル配置を確認: /api/check', (done) => {
        var str = pzl.puzzlesAndSolutions[0][0].slice(0, -1) + 'a';
        chai
        .request(server)
        .keepOpen()
        .post('/api/check')
        .send({
            puzzle: str,
            coordinate: "A2",
            value: '2'
        })
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'Invalid characters in puzzle');
            done();
        });
    });
    // #12
    test('誤った長さのパズル配置を確認: /api/check', (done) => {
        var str = pzl.puzzlesAndSolutions[0][0].slice(0, -1);
        chai
        .request(server)
        .keepOpen()
        .post('/api/check')
        .send({
            puzzle: str,
            coordinate: "A2",
            value: '2'
        })
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'Expected puzzle to be 81 characters long');
            done();
        });
    });
    // #13
    test('無効な配置座標のパズル配置を確認: /api/check', (done) => {
        var str = pzl.puzzlesAndSolutions[0][0];
        chai
        .request(server)
        .keepOpen()
        .post('/api/check')
        .send({
            puzzle: str,
            coordinate: "J2",
            value: '2'
        })
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'Invalid coordinate');
            done();
        });
    });
    // #14
    test('無効な配置値のパズル配置を確認: /api/check', (done) => {
        var str = pzl.puzzlesAndSolutions[0][0];
        chai
        .request(server)
        .keepOpen()
        .post('/api/check')
        .send({
            puzzle: str,
            coordinate: "A0",
            value: '2'
        })
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'Invalid coordinate');
            done();
        });
    });
});

