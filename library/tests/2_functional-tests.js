/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function(done){
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {

    this.timeout(10000);

    let bookid='';
    let title='';
  
  
    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        title = `title_${Date.now()}`;
        chai
        .request(server)
        .keepOpen()
        .post('/api/books')
        .send({
          "title": title
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isNotNull(res.body._id);
          bookid=res.body._id;
          assert.equal(res.body.title, title);
          done();
        });
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai
        .request(server)
        .keepOpen()
        .post('/api/books')
        .send({
          "title": ''
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body, 'missing required field title');
          done();
        });
      });
      
    });


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
        chai
        .request(server)
        .keepOpen()
        .get('/api/books')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.isAbove(res.body.length, 0);
          const data = res.body[0];
          assert.isNotNull(data._id)
          assert.isNotNull(data.title);
          assert.isNotNull(data.commentcount);
          done();
        });
      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai
        .request(server)
        .keepOpen()
        .get('/api/books/673be8405b9a0a15283265ea')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body, 'no book exists');
          done();
        });
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        chai
        .request(server)
        .keepOpen()
        .get(`/api/books/${bookid}`)
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body._id, bookid);
          assert.equal(res.body.title, title);
          assert.isArray(res.body.comments);
          assert.equal(res.body.comments.length, 0);
          done();
        });
      });
    });

    let cmnt='';

    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        cmnt=`comment_${Date.now()}`;
        chai
        .request(server)
        .keepOpen()
        .post(`/api/books/${bookid}`)
        .send({
          "comment": cmnt
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body._id, bookid);
          assert.equal(res.body.title, title);
          assert.isArray(res.body.comments);
          assert.equal(res.body.comments.length, 1);
          assert.equal(res.body.comments[0], cmnt);
          done();
        });
      });

      test('Test POST /api/books/[id] without comment field', function(done){
        chai
        .request(server)
        .keepOpen()
        .post(`/api/books/${bookid}`)
        .send({
          "comment": ''
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body, 'missing required field comment');
          done();
        });
      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done){
        chai
        .request(server)
        .keepOpen()
        .post(`/api/books/673be8405b9a0a15283265ea`)
        .send({
          "comment": cmnt
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body, 'no book exists');
          done();
        });
      });
      
    });

    suite('DELETE /api/books/[id] => delete book object id', function() {

      test('Test DELETE /api/books/[id] with valid id in db', function(done){
        chai
        .request(server)
        .keepOpen()
        .delete(`/api/books/${bookid}`)
        .send({})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body, 'delete successful');
          done();
        });
      });

      test('Test DELETE /api/books/[id] with  id not in db', function(done){
        chai
        .request(server)
        .keepOpen()
        .delete(`/api/books/${bookid}`)
        .send({})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body, 'no book exists');
          done();
        });
      });

    });

  });

});
