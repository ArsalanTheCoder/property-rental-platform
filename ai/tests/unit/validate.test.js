'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  stripControlChars,
  collapseWhitespace,
  normalizeTitle,
  normalizeDescription,
  normalizeAnswer,
  normalizeScore,
  normalizeGeneratedContent,
} = require('../../src/validate');
const { AiError } = require('../../src/errors');

function throwsInvalid(fn) {
  assert.throws(fn, (e) => e instanceof AiError && e.code === 'INVALID_OUTPUT');
}

test('stripControlChars removes control characters', () => {
  assert.equal(stripControlChars('a\u0000b\u0007c'), 'abc');
  assert.equal(stripControlChars('a\u001Fb'), 'ab');
  assert.equal(stripControlChars('tab\u0009here'), 'tabhere');
});

test('collapseWhitespace collapses runs of whitespace and trims', () => {
  assert.equal(collapseWhitespace('  Modern   apartment \n in DHA  '), 'Modern apartment in DHA');
  assert.equal(collapseWhitespace(''), '');
  assert.equal(collapseWhitespace('   '), '');
});

test('normalizeTitle returns a cleaned title', () => {
  assert.equal(normalizeTitle('  Modern 2-Bed   Apartment  ', 120), 'Modern 2-Bed Apartment');
});

test('normalizeTitle rejects non-strings', () => {
  throwsInvalid(() => normalizeTitle(42, 120));
  throwsInvalid(() => normalizeTitle(null, 120));
  throwsInvalid(() => normalizeTitle(undefined, 120));
});

test('normalizeTitle rejects empty or whitespace-only titles', () => {
  throwsInvalid(() => normalizeTitle('', 120));
  throwsInvalid(() => normalizeTitle('   \n\t', 120));
});

test('normalizeTitle rejects titles over the max length', () => {
  throwsInvalid(() => normalizeTitle('x'.repeat(121), 120));
  assert.equal(normalizeTitle('x'.repeat(120), 120), 'x'.repeat(120));
});

test('normalizeDescription normalizes valid input and rejects over-length', () => {
  assert.equal(normalizeDescription('  Bright,   modern flat. ', 1000), 'Bright, modern flat.');
  throwsInvalid(() => normalizeDescription('', 1000));
  throwsInvalid(() => normalizeDescription('x'.repeat(1001), 1000));
  assert.equal(normalizeDescription('x'.repeat(1000), 1000).length, 1000);
});

test('normalizeAnswer trims and rejects invalid answers', () => {
  assert.equal(normalizeAnswer('  Yes, pets allowed.  ', 1000), 'Yes, pets allowed.');
  throwsInvalid(() => normalizeAnswer('', 1000));
  throwsInvalid(() => normalizeAnswer(undefined, 1000));
  throwsInvalid(() => normalizeAnswer('x'.repeat(1001), 1000));
});

test('normalizeScore rounds and clamps to the 0-100 range', () => {
  assert.equal(normalizeScore(90), 90);
  assert.equal(normalizeScore('90.6'), 91);
  assert.equal(normalizeScore(-5), 0);
  assert.equal(normalizeScore(150), 100);
  assert.equal(normalizeScore(0), 0);
  assert.equal(normalizeScore(100), 100);
  assert.equal(normalizeScore(73.2), 73);
});

test('normalizeScore rejects non-numeric values', () => {
  throwsInvalid(() => normalizeScore('abc'));
  throwsInvalid(() => normalizeScore(''));
  throwsInvalid(() => normalizeScore('   '));
  throwsInvalid(() => normalizeScore(null));
  throwsInvalid(() => normalizeScore(undefined));
  throwsInvalid(() => normalizeScore({}));
  throwsInvalid(() => normalizeScore([]));
  throwsInvalid(() => normalizeScore(NaN));
  throwsInvalid(() => normalizeScore(Infinity));
});

test('normalizeScore clamps numeric and string inputs to the 0-100 range', () => {
  assert.equal(normalizeScore('0'), 0);
  assert.equal(normalizeScore('100'), 100);
  assert.equal(normalizeScore('-10'), 0);
  assert.equal(normalizeScore('150'), 100);
  assert.equal(normalizeScore(' 90 '), 90);
  assert.equal(normalizeScore(0), 0);
  assert.equal(normalizeScore(100), 100);
});

test('normalizeGeneratedContent returns a validated title and description', () => {
  const out = normalizeGeneratedContent(
    { title: '  Modern 2-Bed   Apartment ', description: ' Bright and quiet. ' },
    { maxTitleLength: 120, maxDescriptionLength: 1000 }
  );
  assert.deepEqual(out, { title: 'Modern 2-Bed Apartment', description: 'Bright and quiet.' });
});

test('normalizeGeneratedContent rejects missing or malformed content', () => {
  throwsInvalid(() => normalizeGeneratedContent(null, { maxTitleLength: 120, maxDescriptionLength: 1000 }));
  throwsInvalid(() => normalizeGeneratedContent(undefined, { maxTitleLength: 120, maxDescriptionLength: 1000 }));
  throwsInvalid(() => normalizeGeneratedContent('nope', { maxTitleLength: 120, maxDescriptionLength: 1000 }));
  throwsInvalid(() =>
    normalizeGeneratedContent({ title: '', description: 'd' }, { maxTitleLength: 120, maxDescriptionLength: 1000 })
  );
  throwsInvalid(() =>
    normalizeGeneratedContent(
      { title: 't', description: 'x'.repeat(1001) },
      { maxTitleLength: 120, maxDescriptionLength: 1000 }
    )
  );
});
