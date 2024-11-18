const chai = require('chai');
let assert = chai.assert;
const ConvertHandler = require('../controllers/convertHandler.js');

let convertHandler = new ConvertHandler();
const server = require('../server');


suite('Unit Tests', function(){
    const h = new ConvertHandler();
    //#1
    test('整数の入力を正しく読み取る', function() {
        assert.equal(h.getNum('1km'), 1);
    });
    //#2
    test('小数入力を正しく読み取る', function() {
        assert.equal(h.getNum('1.2gal'), 1.2);
    });
    //#3
    test('分数入力を正しく読み取る', function() {
        assert.equal(h.getNum('5/3lbs'), 1.6666666666666667);
    });
    //#4
    test('小数による分数入力を正しく読み取る', function() {
        assert.equal(h.getNum('5.4/3lbs'), 1.8);
    });
    //#5
    test('二重分数 (3/2/3 など) の場合にエラー', function() {
        assert.throws(() => h.getNum('3/2/3kg'), /invalid number/);
    });
    //#6
    test('数字が入力されていない場合デフォルトで1を返却', function() {
        assert.equal(h.getNum('kg'), 1);
    });
    //#7
    test('有効な入力単位を正しく読み取る', function() {
        assert.equal(h.getUnit('1kg'), 'kg');
        assert.equal(h.getUnit('5.4/3lbs'), 'lbs');
        assert.equal(h.getUnit('0.1L'), 'L');
        assert.equal(h.getUnit('3.5mi'), 'mi');
    });
    //#8
    test('無効な入力単位の場合にエラー', function() {
        assert.throws(() => h.getUnit('1mg'), /invalid unit/);
    });
    //#9
    test('有効な入力単位ごとに正しい戻り値単位を返す', function() {
        assert.equal(h.getReturnUnit('gal'), 'L');
        assert.equal(h.getReturnUnit('L'), 'gal');
        assert.equal(h.getReturnUnit('mi'), 'km');
        assert.equal(h.getReturnUnit('km'), 'mi');
        assert.equal(h.getReturnUnit('lbs'), 'kg');
        assert.equal(h.getReturnUnit('kg'), 'lbs');
    });
    //#10
    test('有効な入力単位ごとに文字列単位を略さずに正しく返す', function() {
        assert.equal(h.spellOutUnit('gal'), 'gallons');
        assert.equal(h.spellOutUnit('L'), 'liters');
        assert.equal(h.spellOutUnit('mi'), 'miles');
        assert.equal(h.spellOutUnit('km'), 'kilometers');
        assert.equal(h.spellOutUnit('lbs'), 'pounds');
        assert.equal(h.spellOutUnit('kg'), 'kilograms');
    });
    //#11
    test('gal を L に正しく変換', function() {
        assert.equal(h.convert(1, 'gal'), 3.78541);
    });
    //#12
    test('L を gal に正しく変換', function() {
        const calc = parseFloat((1 / 3.78541).toFixed(5))
        assert.equal(h.convert(1, 'L'), calc);
    });
    //#13
    test('mi を km に正しく変換', function() {
        assert.equal(h.convert(1, 'mi'), 1.60934);
    });
    //#14
    test('km を mi に正しく変換', function() {
        const calc = parseFloat((1 / 1.60934).toFixed(5))
        assert.equal(h.convert(1, 'km'), calc);
    });
    //#15
    test('lbs を kg に正しく変換', function() {
        assert.equal(h.convert(1, 'lbs'), 0.45359);
    });
    //#16
    test('kg を lbs に正しく変換', function() {
        const calc = parseFloat((1 / 0.453592).toFixed(5))
        assert.equal(h.convert(1, 'kg'), calc);
    });
});
