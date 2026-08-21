'use strict';

const { isAiError } = require('./errors');
const { DEFAULTS } = require('./config');
const { assertValidQuestion } = require('./prompts');
const { normalizeGeneratedContent, normalizeAnswer, normalizeScore } = require('./validate');

function limitsFor(config) {
  return {
    maxTitleLength: config.maxTitleLength ?? DEFAULTS.maxTitleLength,
    maxDescriptionLength: config.maxDescriptionLength ?? DEFAULTS.maxDescriptionLength,
    maxQuestionLength: config.maxQuestionLength ?? DEFAULTS.maxQuestionLength,
    maxAnswerLength: config.maxAnswerLength ?? DEFAULTS.maxAnswerLength,
  };
}

function createService(provider, config) {
  if (!provider || typeof provider.generateContent !== 'function') {
    throw new TypeError('createService requires a provider implementing generateContent()');
  }

  const limits = limitsFor(config);

  async function generateContent(raw) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const result = await provider.generateContent(raw);
        return Object.freeze(normalizeGeneratedContent(result, limits));
      } catch (err) {
        const invalidOutput = isAiError(err) && err.code === 'INVALID_OUTPUT';
        if (invalidOutput && attempt === 0) {
          continue;
        }
        throw err;
      }
    }
  }

  async function answerQuestion(property, question) {
    if (!property || typeof property !== 'object') {
      throw new TypeError('answerQuestion requires a property context object');
    }
    assertValidQuestion(question, limits.maxQuestionLength);
    const result = await provider.answerQuestion(property, question);
    return Object.freeze({ answer: normalizeAnswer(result.answer, limits.maxAnswerLength) });
  }

  async function scoreLead(context) {
    if (!context || typeof context !== 'object') {
      throw new TypeError('scoreLead requires a lead context object');
    }
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const result = await provider.scoreLead(context);
        const out = { score: normalizeScore(result.score) };
        if (typeof result.summary === 'string' && result.summary.trim()) {
          out.summary = result.summary.trim();
        }
        return Object.freeze(out);
      } catch (err) {
        const invalidOutput = isAiError(err) && err.code === 'INVALID_OUTPUT';
        if (invalidOutput && attempt === 0) {
          continue;
        }
        throw err;
      }
    }
  }

  return { generateContent, answerQuestion, scoreLead };
}

module.exports = { createService };
