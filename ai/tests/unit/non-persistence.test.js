'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createAiService } = require('../../src/index');

const SRC_DIR = path.join(__dirname, '..', '..', 'src');

const FORBIDDEN_PATTERNS = [
  /require\(\s*['"](mongoose|mongodb|mysql|pg|redis|level|nedb)['"]\s*\)/,
  /require\(\s*['"](fs|fs\/promises|http|https|net|tls|dgram)['"]\s*\)/,
  /\b(mongoose|mongodb)\b/,
  /\b(writeFile|writeFileSync)\b/,
  /\bcreateWriteStream\b/,
  /\bcreateServer\b/,
  /\b(insertOne|insertMany|updateOne|updateMany|deleteOne|deleteMany|findOneAndUpdate|findOneAndDelete|findByIdAndUpdate|replaceOne)\b/,
  /\b\.db\./,
];

function collectJsFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectJsFiles(full));
    } else if (entry.name.endsWith('.js')) {
      files.push(full);
    }
  }
  return files;
}

function sourceFiles() {
  return collectJsFiles(SRC_DIR).map((file) => ({ file, source: fs.readFileSync(file, 'utf8') }));
}

test('ai module graph contains no database or storage driver imports', () => {
  const offenders = [];
  for (const { file, source } of sourceFiles()) {
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.test(source)) {
        offenders.push(`${path.relative(SRC_DIR, file)} matches ${pattern}`);
      }
    }
  }
  assert.deepEqual(offenders, [], 'no storage/DB usage may exist in ai/');
});

test('ai module graph performs no filesystem writes and creates no servers', () => {
  const offenders = [];
  for (const { file, source } of sourceFiles()) {
    const stripped = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    if (/\bcreateServer\b/.test(stripped)) {
      offenders.push(`${path.relative(SRC_DIR, file)} calls createServer`);
    }
    if (/\bfs\b|\bwriteFile\b|\bcreateWriteStream\b/.test(stripped)) {
      offenders.push(`${path.relative(SRC_DIR, file)} touches the filesystem`);
    }
  }
  assert.deepEqual(offenders, [], 'chat/generation flow must perform zero writes');
});

test('chat flow completes entirely in memory with no persistence', async () => {
  const service = createAiService({ AI_MODE: 'mock' });
  const { answer } = await service.answerQuestion(
    {
      propertyId: 'prop_1',
      title: 'Modern Apartment in DHA Karachi',
      description: 'A furnished apartment.',
      location: 'DHA Karachi',
      price: 50000,
      bedrooms: 2,
    },
    'How much is the rent?'
  );
  assert.equal(typeof answer, 'string');
  assert.ok(answer.trim().length > 0, 'answer should be non-empty');
});
