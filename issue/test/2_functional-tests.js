const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    this.timeout(10000);
    let dataId='';
    //#1
    test('POST:すべてのフィールドを指定', (done) => {
        const data = {
            "issue_title": "a",
            "issue_text": "b",
            "created_by": "c",
            "assigned_to": "d",
            "status_text": "e"
        };
        chai
        .request(server)
        .keepOpen()
        .post('/api/issues/apitest')
        .send(data)
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isNotNull(res.body._id);
          dataId=res.body._id;
          assert.equal(res.body.issue_title, data.issue_title);
          assert.equal(res.body.issue_text, data.issue_text);
          assert.equal(res.body.created_by, data.created_by);
          assert.equal(res.body.assigned_to, data.assigned_to);
          assert.equal(res.body.status_text, data.status_text);
          assert.isNotNull(res.body.created_on);
          assert.isNotNull(res.body.updated_on);
          assert.isTrue(res.body.open);
          done();
        });
    });
    //#2
    test('POST:必須フィールドのみ', (done) => {
        const data = {
            "issue_title": "a",
            "issue_text": "b",
            "created_by": "c"
        };
        chai
        .request(server)
        .keepOpen()
        .post('/api/issues/apitest')
        .send(data)
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isNotNull(res.body._id);
          assert.equal(res.body.issue_title, data.issue_title);
          assert.equal(res.body.issue_text, data.issue_text);
          assert.equal(res.body.created_by, data.created_by);
          assert.equal(res.body.assigned_to, '');
          assert.equal(res.body.status_text, '');
          assert.isNotNull(res.body.created_on);
          assert.isNotNull(res.body.updated_on);
          assert.isTrue(res.body.open);
          done();
        });
    });
    //#3
    test('POST:不足している必須フィールド', (done) => {
        const data = {
            "issue_text": "b",
            "created_by": "c",
            "assigned_to": "d",
            "status_text": "e"
        };
        chai
        .request(server)
        .keepOpen()
        .post('/api/issues/apitest')
        .send(data)
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isUndefined(res.body._id);
          assert.equal(res.body.error, 'required field(s) missing');
          done();
        });
    });
    //#4
    test('GET', (done) => {
        chai
        .request(server)
        .keepOpen()
        .get('/api/issues/apitest')
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.isAbove(res.body.length, 0);
            const data = res.body[0];
            assert.isNotNull(data._id);
            assert.isNotNull(data.issue_title);
            assert.isNotNull(data.issue_text);
            assert.isNotNull(data.created_by);
            assert.isNotNull(data.created_on);
            assert.isNotNull(data.updated_on);
            assert.isNotNull(data.open);
            done();
        });
    });
    //#5
    test('GET:1 つのフィルター', (done) => {
        chai
        .request(server)
        .keepOpen()
        .get('/api/issues/apitest?issue_title=a')
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.isAbove(res.body.length, 0);
            const datas = res.body;
            for (var data of datas) {
                assert.isNotNull(data._id);
                assert.equal(data.issue_title, 'a');
                assert.isNotNull(data.issue_text);
                assert.isNotNull(data.created_by);
                assert.isNotNull(data.created_on);
                assert.isNotNull(data.updated_on);
                assert.isNotNull(data.open);
            }
            done();
        });
    });

    //#6
    test('GET:複数のフィルター', (done) => {
        chai
        .request(server)
        .keepOpen()
        .get('/api/issues/apitest?issue_title=a&issue_text=b&created_by=c&assigned_to=d&status_text=e')
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.isAbove(res.body.length, 0);
            const datas = res.body;
            for (var data of datas) {
                assert.isNotNull(data._id);
                assert.equal(data.issue_title, 'a');
                assert.equal(data.issue_text, 'b');
                assert.equal(data.created_by, 'c');
                assert.equal(data.assigned_to, 'd');
                assert.equal(data.status_text, 'e');
                assert.isNotNull(data.created_on);
                assert.isNotNull(data.updated_on);
                assert.isNotNull(data.open);
            }
            done();
        });
    });
    //#7
    test('PUT:1 つのフィールド', (done) => {
        const data = {
            "_id": dataId,
            "issue_text": "update"
        };
        chai
        .request(server)
        .keepOpen()
        .put('/api/issues/apitest')
        .send(data)
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body._id, dataId);
            assert.equal(res.body.result, 'successfully updated');
          done();
        });
    });
    //#8
    test('PUT:複数フィールド', (done) => {
        const data = {
            "_id": dataId,
            "issue_text": "b",
            "created_by": "c",
            "assigned_to": "d",
            "status_text": "e"
        };
        chai
        .request(server)
        .keepOpen()
        .put('/api/issues/apitest')
        .send(data)
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body._id, dataId);
            assert.equal(res.body.result, 'successfully updated');
          done();
        });
    });
    //#9
    test('PUT:_id が不足', (done) => {
        const data = {
            "issue_text": "update"
        };
        chai
        .request(server)
        .keepOpen()
        .put('/api/issues/apitest')
        .send(data)
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isUndefined(res.body._id);
            assert.equal(res.body.error, 'missing _id');
          done();
        });
    });
    //#10
    test('PUT:更新すべきフィールドがない', (done) => {
        const data = {
            "_id": dataId
        };
        chai
        .request(server)
        .keepOpen()
        .put('/api/issues/apitest')
        .send(data)
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body._id, dataId);
            assert.equal(res.body.error, 'no update field(s) sent');
          done();
        });
    });
    //#11
    test('PUT:無効な _id', (done) => {
        const _id = "aaa";
        const data = {
            "_id": _id,
            "issue_text": "b",
            "created_by": "c",
            "assigned_to": "d",
            "status_text": "e"
        };
        chai
        .request(server)
        .keepOpen()
        .put('/api/issues/apitest')
        .send(data)
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body._id, _id);
            assert.equal(res.body.error, 'could not update');
          done();
        });
    });
    //#12
    test('DELETE', (done) => {
        chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/apitest')
        .send({_id: dataId})
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body._id, dataId);
            assert.equal(res.body.result, 'successfully deleted');
            done();
        });
    });
    //#13
    test('DELETE:無効な _id', (done) => {
        chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/apitest')
        .send({_id: dataId})
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body._id, dataId);
            assert.equal(res.body.error, 'could not delete');
            done();
        });
    });
    //#14
    test('DELETE:_id が不足', (done) => {
        chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/apitest')
        .send({})
        .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isUndefined(res.body._id);
            assert.equal(res.body.error, 'missing _id');
            done();
        });
    });
});
