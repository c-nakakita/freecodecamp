'use strict';

const Translator = require('../components/translator.js');

module.exports = function (app) {

  const translator = new Translator();

  const reqParams = ['text', 'locale'];
  const locales = ['american-to-british', 'british-to-american'];
  const sameMsg = 'Everything looks good to me!';

  app.route('/api/translate')
    .post((req, res) => {
      let reqErrFlg = false;
      reqParams.forEach(i => {
        if (req.body[i] === undefined) {
          reqErrFlg = true;
        }
      });
      if (reqErrFlg) {
        res.json({ error: 'Required field(s) missing' });
        return;
      }
      const text = req.body.text;
      const locale = req.body.locale;
      if (text === '') {
        res.json({ error: 'No text to translate' });
        return;
      }
      if (!locales.includes(locale)) {
        res.json({ error: 'Invalid value for locale field' });
        return;
      }
      let result = translator.translate(text, locale);
      if (text == result[0]) {
        res.json({
          text: text,
          translation: sameMsg
        });
      } else {
        res.json({
          text: text,
          translation: result[1]
        });
      }
    });
};
