const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
    let thread_id='';
    let reply_id='';
    let thread_text='testtext';
    let reply_text='reptext';
    const password='test';
    const repPassword = 'rep';
    // #1
    test('Creating a new thread', (done) => {
        chai
            .request(server)
            .post('/api/threads/general')
            .send({
                text: thread_text,
                delete_password: password
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                done();
            });
    });
    // #2
    test('Viewing the 10 most recent threads with 3 replies each', (done) => {
        chai
            .request(server)
            .get('/api/threads/general')
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                assert.isAtMost(res.body.length, 10);
                for (var thread of res.body) {
                    assert.isDefined(thread._id);
                    assert.isDefined(thread.text);
                    assert.isDefined(thread.created_on);
                    assert.isDefined(thread.bumped_on);
                    assert.isUndefined(thread.reported);
                    assert.isUndefined(thread.delete_password);
                    assert.isArray(thread.replies);
                    assert.isAtMost(thread.replies.length, 3);
                }

                const latest = res.body[0];
                assert.equal(latest.text, thread_text);
                assert.isEmpty(latest.replies);
                thread_id = latest._id;
                done();
            });
    });
    // #5
    test('Reporting a thread', (done) => {
        chai
            .request(server)
            .put('/api/threads/general')
            .send({
                thread_id: thread_id
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'reported');
                done();
            });
    });
    // #6
    test('Creating a new reply', (done) => {
        chai
            .request(server)
            .post('/api/replies/general')
            .send({
                thread_id: thread_id,
                text: reply_text,
                delete_password: repPassword
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body._id, thread_id);
                assert.equal(res.body.text, thread_text);
                assert.isDefined(res.body.created_on);
                assert.isDefined(res.body.bumped_on);
                assert.isUndefined(res.body.reported);
                assert.isUndefined(res.body.delete_password);
                assert.isArray(res.body.replies);
                assert.equal(res.body.replies.length, 1);
                const reply = res.body.replies[0];
                assert.isDefined(reply._id);
                assert.equal(reply.text, reply_text);
                assert.isDefined(reply.created_on);
                assert.isUndefined(reply.delete_password);
                assert.isUndefined(reply.reported);
                reply_id= reply._id;
                done();
            });
    });
    // #7
    test('Viewing a single thread with all replies', (done) => {
        chai
            .request(server)
            .get(`/api/replies/general?thread_id=${thread_id}`)
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body._id, thread_id);
                assert.equal(res.body.text, thread_text);
                assert.isDefined(res.body.created_on);
                assert.isDefined(res.body.bumped_on);
                assert.isUndefined(res.body.reported);
                assert.isUndefined(res.body.delete_password);
                assert.isArray(res.body.replies);
                assert.equal(res.body.replies.length, 1);
                const reply = res.body.replies[0];
                assert.equal(reply._id, reply_id);
                assert.equal(reply.text, reply_text);
                assert.isDefined(reply.created_on);
                assert.isUndefined(reply.delete_password);
                assert.isUndefined(reply.reported);
                done();
            });
    });
    // #10
    test('Reporting a reply', (done) => {
        chai
            .request(server)
            .put('/api/replies/general')
            .send({
                thread_id: thread_id,
                reply_id: reply_id
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'reported');
                done();
            });
    });
    // #8
    test('Deleting a reply with the incorrect password', (done) => {
        chai
            .request(server)
            .delete('/api/replies/general')
            .send({
                thread_id: thread_id,
                reply_id: reply_id,
                delete_password: 'aaa'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'incorrect password');
                done();
            });
    });
    // #9
    test('Deleting a reply with the correct password', (done) => {
        chai
            .request(server)
            .delete('/api/replies/general')
            .send({
                thread_id: thread_id,
                reply_id: reply_id,
                delete_password: repPassword
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'success');
                done();
            });
    });
    // #3
    test('Deleting a thread with the incorrect password', (done) => {
        chai
            .request(server)
            .delete('/api/threads/general')
            .send({
                thread_id: thread_id,
                delete_password: 'aaa'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'incorrect password');
                done();
            });
    });
    // #4
    test('Deleting a thread with the correct password', (done) => {
        chai
            .request(server)
            .delete('/api/threads/general')
            .send({
                thread_id: thread_id,
                delete_password: password
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'success');
                done();
            });
    });
});
