'use strict';

const { loadAiConfig } = require('./config');
const { createService } = require('./service');
const { createMockProvider } = require('./providers/mock');
const { createLiveProvider } = require('./providers/live');

function isResolvedConfig(value) {
  return Boolean(value && typeof value === 'object' && typeof value.mode === 'string');
}

function createAiService(options) {
  const config = isResolvedConfig(options) ? options : loadAiConfig(options || process.env);
  const provider = config.mode === 'live' ? createLiveProvider(config) : createMockProvider();
  return createService(provider, config);
}

module.exports = { createAiService };
