const americanOnly = require('./american-only.js');
const americanToBritishSpelling = require('./american-to-british-spelling.js');
const americanToBritishTitles = require("./american-to-british-titles.js")
const britishOnly = require('./british-only.js')

const diff = require('diff');

const convObj = (obj) => {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [value, key]));
}

const openTag = '<span class="highlight">';
const closeTag = '</span>'

const convWord = (src, dest) => {
  let is1stUcase = /[A-Z]/.test(src.charAt(0));
  if (is1stUcase) {
    dest = `${dest.charAt(0).toUpperCase()}${dest.slice(1)}`
  }
  return dest;
}

const convWordWithTag = (src, dest) => {
  let is1stUcase = /[A-Z]/.test(src.charAt(0));
  if (is1stUcase) {
    dest = `${dest.charAt(0).toUpperCase()}${dest.slice(1)}`
  }
  return `${openTag}${dest}${closeTag}`;
}

const britishToAmericanSpelling = convObj(americanToBritishSpelling);
const britishToAmericanTitles = convObj(americanToBritishTitles);

class Translator {
  translate(text, locale) {
    let targets;
    if (locale == 'british-to-american') {
      targets = {
        ...britishToAmericanSpelling
        , ...britishToAmericanTitles
        , ...britishOnly
      }
    } else {
      targets = {
        ...americanToBritishSpelling
        , ...americanToBritishTitles
        , ...americanOnly
      }
    }

    let result = text;
    let resultWithTag = text;
    let lcaseTxt = text.toLowerCase();
    let reg, idx;

    // dict
    Object.entries(targets)
    .filter(([key, value]) => lcaseTxt.includes(key))
    .sort(([a,], [b,]) => b.length - a.length)
    .forEach(([key, value]) => {
      if (key.includes(' ')) {
        reg = new RegExp(key, 'gi');
      } else if (key.endsWith('.')) {
        reg = new RegExp(`\\b${key}`, 'gi');
      } else {
        reg = new RegExp(`\\b${key}\\b`, 'gi');
      }
      result = result.replaceAll(reg, (m) => convWord(m, value));
      resultWithTag = resultWithTag.replaceAll(reg, (m) => convWordWithTag(m, value));
    });

    // time
    let sep, destSep;
    if (locale == 'british-to-american') {
      sep = '.';
      destSep = ':'
    } else {
      sep = ':';
      destSep = '.'
    }
    reg = new RegExp(`\\b([0-9]{1,2})(${sep})([0-9]{2})\\b`, 'g')
    result = result.replace(reg, (match, g1, g2, g3) => `${g1}${destSep}${g3}`);
    resultWithTag = resultWithTag.replace(reg, (match, g1, g2, g3) => `${openTag}${g1}${destSep}${g3}${closeTag}`);

    return [result, resultWithTag];
  }

  /*
  hilight(src, dest) {
    const dif = diff.diffWords(src, dest);
    let result = dest;
    let reg;
    let repStr;
    dif.filter(x => x.added).forEach(x => {
      repStr = x.value
      if (x.value.includes(' ')) {
        reg = new RegExp(x.value, 'g');
        repStr = x.value;
      } else if (x.value == "." || x.value == ":") {
        reg = new RegExp(`\\b([0-9]{1,2})(${x.value})([0-9]{2})\\b`, 'g');
        repStr = result.match(reg)[0];
      } else {
        reg = new RegExp(`\\b${x.value}\\b`, 'g');
      }
      result = result.replaceAll(reg, `${openTag}${repStr}${closeTag}`);
    });
    return result;
  }
    */
}

module.exports = Translator;