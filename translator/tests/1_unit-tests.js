const chai = require('chai');
const assert = chai.assert;

const Translator = require('../components/translator.js');

suite('Unit Tests', () => {
  const translator = new Translator();
  const locales = ['american-to-british', 'british-to-american'];
  const openTag = '<span class="highlight">';
  const closeTag = '</span>'
  // #1
  test('BtoA:Mangoes are my favorite fruit.', () => {
    assert.equal(translator.translate(
      'Mangoes are my favorite fruit.'
      , locales[0]
    )[0], 'Mangoes are my favourite fruit.');
  });
  // #2
  test('BtoA:I ate yogurt for breakfast.', () => {
    assert.equal(translator.translate(
      'I ate yogurt for breakfast.'
      , locales[0]
    )[0], 'I ate yoghurt for breakfast.');
  });
  // #3
  test('BtoA:We had a party at my friend\'s condo.', () => {
    assert.equal(translator.translate(
      "We had a party at my friend's condo."
      , locales[0]
    )[0], "We had a party at my friend's flat.");
  });
  // #4
  test('BtoA:Can you toss this in the trashcan for me?', () => {
    assert.equal(translator.translate(
      'Can you toss this in the trashcan for me?'
      , locales[0]
    )[0], 'Can you toss this in the bin for me?');
  });
  // #5
  test('BtoA:The parking lot was full.', () => {
    assert.equal(translator.translate(
      'The parking lot was full.'
      , locales[0]
    )[0], 'The car park was full.');
  });
  // #6
  test('BtoA:Like a high tech Rube Goldberg machine.', () => {
    assert.equal(translator.translate(
      'Like a high tech Rube Goldberg machine.'
      , locales[0]
    )[0], 'Like a high tech Heath Robinson device.');
  });
  // #7
  test('BtoA:To play hooky means to skip class or work.', () => {
    assert.equal(translator.translate(
      'To play hooky means to skip class or work.'
      , locales[0]
    )[0], 'To bunk off means to skip class or work.');
  });
  // #8
  test('BtoA:No Mr. Bond, I expect you to die.', () => {
    assert.equal(translator.translate(
      'No Mr. Bond, I expect you to die.'
      , locales[0]
    )[0], 'No Mr Bond, I expect you to die.');
  });
  // #9
  test('BtoA:Dr. Grosh will see you now.', () => {
    assert.equal(translator.translate(
      'Dr. Grosh will see you now.'
      , locales[0]
    )[0], 'Dr Grosh will see you now.');
  });
  // #10
  test('BtoA:Lunch is at 12:15 today.', () => {
    assert.equal(translator.translate(
      'Lunch is at 12:15 today.'
      , locales[0]
    )[0], 'Lunch is at 12.15 today.');
  });
  // #11
  test('AtoB:We watched the footie match for a while.', () => {
    assert.equal(translator.translate(
      'We watched the footie match for a while.'
      , locales[1]
    )[0], 'We watched the soccer match for a while.');
  });
  // #12
  test('AtoB:Paracetamol takes up to an hour to work.', () => {
    assert.equal(translator.translate(
      'Paracetamol takes up to an hour to work.'
      , locales[1]
    )[0], 'Tylenol takes up to an hour to work.');
  });
  // #13
  test('AtoB:First, caramelise the onions.', () => {
    assert.equal(translator.translate(
      'First, caramelise the onions.'
      , locales[1]
    )[0], 'First, caramelize the onions.');
  });
  // #14
  test('AtoB:I spent the bank holiday at the funfair.', () => {
    assert.equal(translator.translate(
      'I spent the bank holiday at the funfair.'
      , locales[1]
    )[0], 'I spent the public holiday at the carnival.');
  });
  // #15
  test('AtoB:I had a bicky then went to the chippy.', () => {
    assert.equal(translator.translate(
      'I had a bicky then went to the chippy.'
      , locales[1]
    )[0], 'I had a cookie then went to the fish-and-chip shop.');
  });
  // #16
  test("AtoB:I've just got bits and bobs in my bum bag.", () => {
    assert.equal(translator.translate(
      "I've just got bits and bobs in my bum bag."
      , locales[1]
    )[0], "I've just got odds and ends in my fanny pack.");
  });
  // #17
  test('AtoB:The car boot sale at Boxted Airfield was called off.', () => {
    assert.equal(translator.translate(
      'The car boot sale at Boxted Airfield was called off.'
      , locales[1]
    )[0], 'The swap meet at Boxted Airfield was called off.');
  });
  // #18
  test('AtoB:Have you met Mrs Kalyani?', () => {
    assert.equal(translator.translate(
      'Have you met Mrs Kalyani?'
      , locales[1]
    )[0], 'Have you met Mrs. Kalyani?');
  });
  // #19
  test("AtoB:Prof Joyner of King's College, London.", () => {
    assert.equal(translator.translate(
      "Prof Joyner of King's College, London."
      , locales[1]
    )[0], "Prof. Joyner of King's College, London.");
  });
  // #20
  test('AtoB:Tea time is usually around 4 or 4.30.', () => {
    assert.equal(translator.translate(
      'Tea time is usually around 4 or 4.30.'
      , locales[1]
    )[0], 'Tea time is usually around 4 or 4:30.');
  });
  // #21
  test('Hilight:Mangoes are my favorite fruit.', () => {
    const src = 'Mangoes are my favorite fruit.';
    const dest = translator.translate(src, locales[0]);
    assert.equal(dest[1]
    , `Mangoes are my ${openTag}favourite${closeTag} fruit.`);
  });
  // #22
  test('Hilight:I ate yogurt for breakfast.', () => {
    const src = 'I ate yogurt for breakfast.';
    const dest = translator.translate(src, locales[0]);
    assert.equal(dest[1]
    , `I ate ${openTag}yoghurt${closeTag} for breakfast.`);
  });
  // #23
  test('Hilight:We watched the footie match for a while.', () => {
    const src = 'We watched the footie match for a while.';
    const dest = translator.translate(src, locales[1]);
    assert.equal(dest[1]
    , `We watched the ${openTag}soccer${closeTag} match for a while.`);
  });
  // #24
  test('Hilight:Paracetamol takes up to an hour to work.', () => {
    const src = 'Paracetamol takes up to an hour to work.';
    const dest = translator.translate(src, locales[1]);
    assert.equal(dest[1]
    , `${openTag}Tylenol${closeTag} takes up to an hour to work.`);
  });
});
