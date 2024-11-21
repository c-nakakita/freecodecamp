const chai = require('chai');
const assert = chai.assert;

const Solver = require('../controllers/sudoku-solver.js');
const pzl = require('../controllers/puzzle-strings.js');
let solver = new Solver();

suite('Unit Tests', () => {
    const defaultString = pzl.puzzlesAndSolutions[0][0];
    //#1
    test('81 文字の有効なパズル文字列を処理', () => {
        assert.equal(solver.validate(defaultString), '');
    });
    //#2
    test('(1～9 でも . でもない) 無効な文字が含まれているパズル文字列を処理', () => {
        const puzzleString = defaultString.replace('.', 'a');
        assert.equal(solver.validate(puzzleString), 'Invalid characters in puzzle');
    });
    //#3
    test('81 文字ではないパズル文字列を処理', () => {
        const puzzleString = '132456789';
        assert.equal(solver.validate(puzzleString), 'Expected puzzle to be 81 characters long');
    });
    //#4
    test('有効な行の配置を処理', () => {
        assert.isTrue(solver.checkRowPlacement(defaultString, 1, 2, 3));
    });
    //#5
    test('無効な行の配置を処理', () => {
        assert.isFalse(solver.checkRowPlacement(defaultString, 1, 2, 4));
    });
    //#6
    test('有効な列の配置を処理', () => {
        assert.isTrue(solver.checkColPlacement(defaultString, 1, 2, 3));
    });
    //#7
    test('無効な列の配置を処理', () => {
        assert.isFalse(solver.checkColPlacement(defaultString, 1, 2, 7));
    });
    //#8
    test('有効な領域 (3x3 グリッド) の配置を処理', () => {
        assert.isTrue(solver.checkRegionPlacement(defaultString, 1, 2, 3));
    });
    //#9
    test('無効な領域 (3x3 グリッド) の配置を処理', () => {
        assert.isFalse(solver.checkRegionPlacement(defaultString, 2, 2, 5));
    });
    //#10
    test('有効なパズルの文字列', () => {
        for (const pzls of pzl.puzzlesAndSolutions) {
            assert.equal(solver.solve(pzls[0]).solution, pzls[1]);
        }
    });
    //#11
    test('無効なパズル文字列', () => {
        const puzzleString = defaultString.slice(0, -1) + '5';
        const ret = solver.solve(puzzleString);
        assert.equal(ret.error, 'Puzzle cannot be solved');
    });
    //#12
    test('不完全なパズル文字列', () => {
        const puzzleString = '.'.repeat(81);
        const ret = solver.solve(puzzleString);
        assert.equal(ret.solution, '123456789456789123789123456214365897365897214897214365531642978642978531978531642')
    });
});
