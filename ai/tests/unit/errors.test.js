'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { AiError, AI_ERROR_CODES, isAiError } = require('../../src/errors');

test('AiError carries name, code, and message', () => {
  const err = new AiError('CONFIG_MISSING', 'boom');
  assert.equal(err.name, 'AiError');
  assert.equal(err.code, 'CONFIG_MISSING');
  assert.equal(err.message, 'boom');
  assert.ok(err instanceof Error);
});

test('AiError supports cause and provider options', () => {
  const cause = new Error('root cause');
  const err = new AiError('PROVIDER_TIMEOUT', 'timed out', {
    cause,
    providerStatus: 504,
    retryable: true,
  });
  assert.equal(err.cause, cause);
  assert.equal(err.providerStatus, 504);
  assert.equal(err.retryable, true);
});

test('AiError defaults are sane', () => {
  const err = new AiError('PROVIDER_AUTH', 'unauthorized');
  assert.equal(err.cause, undefined);
  assert.equal(err.retryable, false);
});

test('AI_ERROR_CODES contains the five stable codes', () => {
  assert.deepEqual(
    [...AI_ERROR_CODES].sort(),
    ['CONFIG_MISSING', 'INVALID_OUTPUT', 'PROVIDER_AUTH', 'PROVIDER_TIMEOUT', 'PROVIDER_UNAVAILABLE'].sort()
  );
});

test('isAiError distinguishes AiError from other errors', () => {
  assert.equal(isAiError(new AiError('INVALID_OUTPUT', 'x')), true);
  assert.equal(isAiError(new Error('x')), false);
  assert.equal(isAiError('CONFIG_MISSING'), false);
  assert.equal(isAiError(null), false);
});
