function ConvertHandler() {
  const units = ['km', 'l', 'kg', 'lbs', 'gal', 'mi'];
  const retUnits = [
    {
      unit: 'gal',
      spellOut: 'gallons',
      returnUnit: 'L'
    },
    {
      unit: 'L',
      spellOut: 'liters',
      returnUnit: 'gal'
    },
    {
      unit: 'mi',
      spellOut: 'miles',
      returnUnit: 'km'
    },
    {
      unit: 'km',
      spellOut: 'kilometers',
      returnUnit: 'mi'
    },
    {
      unit: 'lbs',
      spellOut: 'pounds',
      returnUnit: 'kg'
    },
    {
      unit: 'kg',
      spellOut: 'kilograms',
      returnUnit: 'lbs'
    },
  ];

  const regUnut = /[a-z]+$/i
  const regNum = /^\d+(\.\d+)?$/;

  this.getNum = function (input) {
    const errMsg = 'invalid number';
    const unit = this.getUnitEx(input);
    if (unit === '') throw new Error('invalid unit');
    const idx = input.lastIndexOf(unit);
    if (idx === 0) {
      // only unit
      return 1;
    }
    const numStr = input.slice(0, idx);

    if (numStr.includes('/')) {
      if (numStr.startsWith('/')
        || numStr.endsWith('/')
        || numStr.split('/').length !== 2) throw new Error(errMsg);
      numAry = numStr.split('/');

      if (regNum.test(numAry[0])
        && regNum.test(numAry[1])
        && Number(numAry[1]) != 0) {
        return Number(numAry[0]) / Number(numAry[1]);
      }

    } else if (regNum.test(numStr)) {
      return Number(numStr);
    }
    throw new Error(errMsg);
  };

  this.getUnit = function (input) {
    const errMsg = 'invalid unit';
    const unit = this.getUnitEx(input);
    if (unit === '') throw new Error(errMsg);
    if (units.includes(unit.toLowerCase())) {
      return unit.toLowerCase() === 'l' ? 'L' : unit.toLowerCase();
    }
    throw new Error(errMsg);
  };

  this.getUnitEx = (input) => {
    const matches = input.match(regUnut);
    if (0 < matches.length) {
      return matches[0];
    }
    return ''
  };

  this.getReturnUnit = function (initUnit) {
    return retUnits.filter(obj => obj.unit == initUnit)[0].returnUnit;
  };

  this.spellOutUnit = function (unit) {
    return retUnits.filter(obj => obj.unit == unit)[0].spellOut;
  };

  this.convert = function (initNum, initUnit) {
    const galToL = 3.78541;
    const lbsToKg = 0.453592;
    const miToKm = 1.60934;
    switch (initUnit) {
      case 'gal':
        return galToL * initNum;
      case 'L':
        return parseFloat((initNum / galToL).toFixed(5));
      case 'mi':
        return miToKm * initNum;
      case 'km':
        return parseFloat((initNum / miToKm).toFixed(5));
      case 'lbs':
        return parseFloat((lbsToKg * initNum).toFixed(5));
      case 'kg':
        return parseFloat((initNum / lbsToKg).toFixed(5));

      default:
        throw new Error('invalid unit');
    }
  };

  this.getString = function (initNum, initUnit, returnNum, returnUnit) {
    return `${initNum} ${this.spellOutUnit(initUnit)} converts to ${returnNum} ${this.spellOutUnit(returnUnit)}`;
  };

}

module.exports = ConvertHandler;
