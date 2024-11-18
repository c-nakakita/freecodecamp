'use strict';

const expect = require('chai').expect;
const ConvertHandler = require('../controllers/convertHandler.js');

module.exports = function (app) {
  
  let convertHandler = new ConvertHandler();

  app.route('/api/convert').get((req, res) => {
    const input = req.query.input;
    try {
      let err = [];
      let iNam;
      let iUnit;
      try {
        iNam = convertHandler.getNum(input);
      } catch (error) {
        err.push('number')
      }
      try {
        iUnit = convertHandler.getUnit(input);
      } catch (error) {
        err.push('unit');
      }
      if (0 < err.length) {
        res.json(`invalid ${err.join(' and ')}`);
      } else {
        const rNam = convertHandler.convert(iNam, iUnit);
        const rUnit = convertHandler.getReturnUnit(iUnit);
        const isoUnit = convertHandler.spellOutUnit(iUnit);
        const rsoUnit = convertHandler.spellOutUnit(rUnit);
        res.json({
          "initNum": iNam,
          "initUnit": iUnit,
          "returnNum": rNam,
          "returnUnit": rUnit,
          'string': `${iNam} ${isoUnit} converts to ${rNam} ${rsoUnit}`
        });
        }
    } catch (error) {
      console.error("", error);
      res.json(error.message);
    }
  });
};
