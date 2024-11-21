const _puzzleReg = /^[1-9\.]{81}$/;

class SudokuSolver {

  validate(puzzleString) {
    if (puzzleString.length !== 81) {
      return 'Expected puzzle to be 81 characters long';
    }
    if (!_puzzleReg.test(puzzleString)) {
      return 'Invalid characters in puzzle';
    }
    return '';
  }

  checkRowPlacement(puzzleString, row, column, value) {
    const rowStr = this._getRow(puzzleString, row);
    return rowStr.charAt(column - 1) == value || !rowStr.includes(value);
  }

  checkColPlacement(puzzleString, row, column, value) {
    let colStr = this._getCol(puzzleString, column);
    return colStr.charAt(row -1) == value || !colStr.includes(value);
  }

  checkRegionPlacement(puzzleString, row, column, value) {
    const regStr = this._getReg(puzzleString, row, column);
    const idx = ((column - 1) % 3) + 3 * ((row - 1) % 3);
    return regStr.charAt(idx) == value || !regStr.includes(value);
  }

  _getRow(puzzleString, row) {
    return puzzleString.slice((row - 1) * 9, row * 9);
  }

  _getCol(puzzleString, column) {
    let ret = '';
    for (var i = 0; i < 81; i += 9) {
      ret = `${ret}${puzzleString.charAt(i + column - 1)}`
    }
    return ret;
  }

  _getReg(puzzleString, row, column) {
    let reg = '';
    let startRow = this._getRegRangeStart(row);
    let startCol = this._getRegRangeStart(column);
    let rowStr;
    for (var i = startRow; i < (startRow + 3); i++) {
      rowStr = this._getRow(puzzleString, i);
      reg = `${reg}${rowStr.slice((startCol - 1), (startCol + 2))}`
    }
    return reg;
  }

  _getRegRangeStart(val) {
    switch (val % 3) {
      case 1:
        return val;
      case 2:
        return val - 1;
      default:
        return val - 2;
    }
  }

  _getPossible(val) {
    const ary = val.replaceAll('.', '');
    let pos = [];
    for (var i = 1; i <= 9; i++) {
      if (!val.includes(`${i}`)) {
        pos.push(`${i}`);
      }
    }
    return pos;
  }

  _getCellPossible(puzzleString, row, col) {
    let rowStr = this._getRow(puzzleString, row);
    let rowPos = this._getPossible(rowStr);
    let colStr = this._getCol(puzzleString, col);
    let colPos = this._getPossible(colStr);
    let regStr = this._getReg(puzzleString, row, col);
    let regPos = this._getPossible(regStr);
    let pos = rowPos.filter(x => colPos.includes(x) && regPos.includes(x));
    if (pos) {
      pos.sort((a, b) => a - b);
    } else {
      pos = [];
    }
    return pos;
  }

  _getCellInfo(puzzleString) {
    let cells = [];
    let tgt, row, col, pos;
    for (var i = 0; i < 81; i++) {
      row = Math.floor(i / 9) + 1;
      col = (i % 9) + 1;
      if (puzzleString.charAt(i) != '.') {
        cells.push({ target: false });
      } else {
        pos = this._getCellPossible(puzzleString, row, col);
        cells.push({
          target: true,
          idx: i,
          row: row,
          column: col,
          possible: pos,
          incorrect: [],
          tmpPos: []
        });
      }
    }
    return cells;
  }

  solve(puzzleString) {
    // セル情報
    const cells = this._getCellInfo(puzzleString);

    // 解決不可セル
    let unsolvableCount = cells.filter(x => x.target && x.possible.length === 0).length;
    const err = { 'error': 'Puzzle cannot be solved' };
    if (0 < unsolvableCount) {
      return err;
    }
    // 値が確定したセル
    let solvedCells = cells.filter(x => x.target && x.possible.length === 1);
    // 未解決のセル
    let unsolvedCells = cells.filter(x => x.target && 1 < x.possible.length);
    let tmpCellIdxs = [];

    let ary, pzlStr, curTgt, curTgtPos, tmpPos, tmpSolvedPos, unsolvable, contFlg, lastTmpCellIdx;
    do {
      ary = puzzleString.split('');
      // 確定している値を設定
      for (const solved of solvedCells) {
        tmpPos = cells[solved.idx].possible.filter(x => !cells[solved.idx].incorrect.includes(x))
        ary[solved.idx] = tmpPos[0];
      }

      // 仮確定した値を設定
      for (const idx of tmpCellIdxs) {
        ary[idx] = cells[idx].tmpPos[0];
      }

      pzlStr = ary.join('');
      curTgt = unsolvedCells[0];
      // 現時点で入力可能な候補
      curTgtPos = this._getCellPossible(pzlStr, curTgt.row, curTgt.column);
      // 候補ごとにチェック
      tmpSolvedPos = [];
      for (let i = 0; i < curTgtPos.length; i++) {
        ary[curTgt.idx] = curTgtPos[i];
        pzlStr = ary.join('');
        unsolvable = false;
        for (let j = 0; j < unsolvedCells.length; j++) {
          if (unsolvedCells[j].idx == curTgt.idx) continue;
          tmpPos = this._getCellPossible(pzlStr, unsolvedCells[j].row, unsolvedCells[j].column);
          if (tmpPos.length === 0) {
            // 解決不可のセルがある場合
            unsolvable = true;
            break;
          }
        }
        if (!unsolvable) {
          // 解決不可のセルがなければ仮候補
          tmpSolvedPos.push(curTgtPos[i]);
        }
      }
      if (tmpSolvedPos.length == 0) {
        // 解決不可の場合
        contFlg = false;
        while (0 < tmpCellIdxs.length && !contFlg) {
          lastTmpCellIdx = tmpCellIdxs[tmpCellIdxs.length - 1];
          cells[lastTmpCellIdx].tmpPos.shift();
          if (0 < cells[lastTmpCellIdx].tmpPos.length) {
            // 直近の仮入力セルに別候補がある場合
            contFlg = true;
          } else {
            // 別候補がなければ仮入力解除
            tmpCellIdxs.pop();
          }
        }
        if (!contFlg) {
          // 続行できない場合
          return err;
        } else if (tmpCellIdxs.length == 1
          && cells[tmpCellIdxs[0]].tmpPos.length == 1
        ) {
          // 続行可、かつ仮入力セルが1つ、仮候補が1つになった場合は仮入力セルの値確定
          lastTmpCellIdx = tmpCellIdxs.pop();
          cells[lastTmpCellIdx].incorrect = cells[lastTmpCellIdx].possible.filter(x => !cells[lastTmpCellIdx].tmpPos.includes(x));
          cells[lastTmpCellIdx].tmpPos = [];
        }
      } else {
        // 仮候補有りの場合
        if (tmpCellIdxs.length == 0) {
          // 仮入力セル無しの場合、解決不可の値を不正解に追加
          cells[curTgt.idx].incorrect = curTgt.possible.filter(x => !tmpSolvedPos.includes(x));
        }
        if (0 < tmpCellIdxs.length || 1 < tmpSolvedPos.length) {
          // 仮入力セルあり、または仮候補が1件以上の場合、仮入力セルに追加
          tmpCellIdxs.push(curTgt.idx);
          // 仮候補を設定
          cells[curTgt.idx].tmpPos = tmpSolvedPos;
        }
      }
      // 解決不可セル（すべての候補がNG）
      unsolvableCount = cells.filter(x => x.target && x.possible.length == x.incorrect.length).length;
      // 値が確定したセル（候補数-NG数=1）
      solvedCells = cells.filter(x => x.target && x.possible.length - x.incorrect.length == 1);
      // 未解決のセル（候補数-NG数>1、かつ仮入力なし）
      unsolvedCells = cells.filter(x => x.target
        && (1 < x.possible.length - x.incorrect.length)
        && !tmpCellIdxs.includes(x.idx));
    } while (unsolvableCount == 0 && 0 < unsolvedCells.length);

    if (unsolvableCount == 0) {
      return { 'solution': ary.join('') };
    } else {
      return err;
    }

  }

}

module.exports = SudokuSolver;

