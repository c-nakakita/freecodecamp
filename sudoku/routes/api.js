'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {

  let solver = new SudokuSolver();

  const reqParams = ['puzzle', 'coordinate', 'value'];
  const rows = 'ABCDEFGHI';
  const coordReg = /^([A-I]{1})([1-9]{1})$/i;
  const valReg = /^[1-9]{1}$/;

  app.route('/api/check')
    .post((req, res) => {
      let reqErrFlg = false;
      reqParams.forEach(i => {
        if (req.body[i] === undefined
          || req.body[i] === ''
        ) {
          reqErrFlg = true;
        }
      });
      if (reqErrFlg) {
        res.json({ error: 'Required field(s) missing' });
      }
      const puzzle = req.body.puzzle;
      const puzzleCheckErr = solver.validate(puzzle);
      if (puzzleCheckErr) {
        res.json({ error: puzzleCheckErr });
        return;
      }
      const coordinate = req.body.coordinate;
      const coordM = coordinate.match(coordReg);
      if (!coordM) {
        res.json({ error: 'Invalid coordinate' });
        return;
      }
      const value = req.body.value;
      if (!valReg.test(value)) {
        res.json({ error: 'Invalid value' });
        return;
      }
      const row = rows.indexOf(coordM[1].toUpperCase()) + 1;
      const col = parseInt(coordM[2])

      let conflicts = [];
      if (!solver.checkRowPlacement(puzzle, row, col, value)) {
        conflicts.push('row');
      }
      if (!solver.checkColPlacement(puzzle, row, col, value)) {
        conflicts.push('column');
      }
      if (!solver.checkRegionPlacement(puzzle, row, col, value)) {
        conflicts.push('region');
      }
      if (0 < conflicts.length) {
        res.json({
          valid: false,
          conflict: conflicts
        });
      } else {
        res.json({ valid: true });
      }
    });

  app.route('/api/solve')
    .post((req, res) => {
      if (req.body.puzzle === undefined
        || req.body.puzzle === ''
      ) {
        res.json({ error: 'Required field missing' });
        return;
      }
      const puzzle = req.body.puzzle;
      const puzzleCheckErr = solver.validate(puzzle);
      if (puzzleCheckErr) {
        res.json({ error: puzzleCheckErr });
        return;
      }

      res.json(solver.solve(puzzle))
    });
};
