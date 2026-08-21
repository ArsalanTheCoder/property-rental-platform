'use strict';

const AI_ERROR_CODES = [
  'CONFIG_MISSING',
  'PROVIDER_AUTH',
  'PROVIDER_TIMEOUT',
  'PROVIDER_UNAVAILABLE',
  'INVALID_OUTPUT',
];

class AiError extends Error {
  constructor(code, message, options = {}) {
    super(message);
    this.name = 'AiError';
    this.code = code;
    this.cause = options.cause;
    this.providerStatus = options.providerStatus;
    this.retryable = options.retryable === true;
  }
}

function isAiError(err) {
  return err instanceof AiError;
}

module.exports = { AiError, AI_ERROR_CODES, isAiError };
