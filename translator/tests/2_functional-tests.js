const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server.js');

chai.use(chaiHttp);

let Translator = require('../components/translator.js');

suite('Functional Tests', () => {
  const locales = ['american-to-british', 'british-to-american'];
  const openTag = '<span class="highlight">';
  const closeTag = '</span>'
  const text = 'Mangoes are my favorite fruit.';
  const translation = `Mangoes are my ${openTag}favourite${closeTag} fruit.`;
  // #1
  test('text フィールドと locale フィールドを指定した変換', (done) => {
    chai
      .request(server)
      .keepOpen()
      .post('/api/translate')
      .send({
        text: text,
        locale: locales[0]
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.text, text);
        assert.equal(res.body.translation, translation);
        done();
      });
  });
  // #2
  test('テキストと無効なロケールフィールドの変換', (done) => {
    chai
      .request(server)
      .keepOpen()
      .post('/api/translate')
      .send({
        text: text,
        locale: "test"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'Invalid value for locale field');
        assert.isUndefined(res.body.text);
        assert.isUndefined(res.body.translation);
        done();
      });
  });
  // #3
  test('不足しているテキストフィールドの変換', (done) => {
    chai
      .request(server)
      .keepOpen()
      .post('/api/translate')
      .send({
        locale: locales[0]
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'Required field(s) missing');
        assert.isUndefined(res.body.text);
        assert.isUndefined(res.body.translation);
        done();
      });
  });
  // #4
  test('不足しているロケールフィールドの変換', (done) => {
    chai
      .request(server)
      .keepOpen()
      .post('/api/translate')
      .send({
        text: text
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'Required field(s) missing');
        assert.isUndefined(res.body.text);
        assert.isUndefined(res.body.translation);
        done();
      });
  });
  // #5
  test('空のテキストの変換', (done) => {
    chai
      .request(server)
      .keepOpen()
      .post('/api/translate')
      .send({
        text: '',
        locale: locales[0]
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'No text to translate');
        assert.isUndefined(res.body.text);
        assert.isUndefined(res.body.translation);
        done();
      });
  });
  // #6
  test('変換不要テキストの変換', (done) => {
    chai
      .request(server)
      .keepOpen()
      .post('/api/translate')
      .send({
        text: text,
        locale: locales[1]
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.text, text);
        assert.equal(res.body.translation, 'Everything looks good to me!');
        done();
      });
  });
});
