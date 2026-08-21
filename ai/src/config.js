'use strict';

const { AiError } = require('./errors');

const DEFAULTS = {
  mode: 'mock',
  model: 'gpt-4o-mini',
  timeoutMs: 30000,
  maxTokens: 800,
  maxTitleLength: 120,
  maxDescriptionLength: 1000,
  maxQuestionLength: 500,
  maxAnswerLength: 1000,
  chatRateLimit: 20,
  chatRateWindowMs: 60000,
};

function configMissing(message) {
  return new AiError('CONFIG_MISSING', message);
}

function parsePositiveInt(env, name, fallback) {
  const raw = env[name];
  if (raw === undefined || raw === null || String(raw).trim() === '') {
    return fallback;
  }
  const str = String(raw).trim();
  if (!/^[0-9]+$/.test(str)) {
    throw configMissing(`Invalid value for ${name}: expected a positive integer, got "${raw}"`);
  }
  const parsed = Number.parseInt(str, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw configMissing(`Invalid value for ${name}: expected a positive integer, got "${raw}"`);
  }
  return parsed;
}

function trimOr(value, fallback) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return fallback;
  }
  return String(value).trim();
}

function loadAiConfig(env = process.env) {
  const mode = trimOr(env.AI_MODE, DEFAULTS.mode).toLowerCase();
  if (mode !== 'mock' && mode !== 'live') {
    throw configMissing(`AI_MODE must be "mock" or "live", got "${env.AI_MODE}"`);
  }

  const apiKey = trimOr(env.AI_API_KEY, undefined);
  if (mode === 'live' && apiKey === undefined) {
    throw configMissing('AI_API_KEY is required when AI_MODE=live');
  }

  return Object.freeze({
    mode,
    apiKey,
    baseUrl: trimOr(env.AI_BASE_URL, undefined),
    model: trimOr(env.AI_MODEL, DEFAULTS.model),
    timeoutMs: parsePositiveInt(env, 'AI_TIMEOUT_MS', DEFAULTS.timeoutMs),
    maxTokens: parsePositiveInt(env, 'AI_MAX_TOKENS', DEFAULTS.maxTokens),
    maxTitleLength: parsePositiveInt(env, 'AI_MAX_TITLE_LENGTH', DEFAULTS.maxTitleLength),
    maxDescriptionLength: parsePositiveInt(env, 'AI_MAX_DESCRIPTION_LENGTH', DEFAULTS.maxDescriptionLength),
    maxQuestionLength: parsePositiveInt(env, 'AI_MAX_QUESTION_LENGTH', DEFAULTS.maxQuestionLength),
    maxAnswerLength: parsePositiveInt(env, 'AI_MAX_ANSWER_LENGTH', DEFAULTS.maxAnswerLength),
    chatRateLimit: parsePositiveInt(env, 'AI_CHAT_RATE_LIMIT', DEFAULTS.chatRateLimit),
    chatRateWindowMs: parsePositiveInt(env, 'AI_CHAT_RATE_WINDOW_MS', DEFAULTS.chatRateWindowMs),
  });
}

module.exports = { loadAiConfig, DEFAULTS };
