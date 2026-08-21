'use strict';

const { AiError } = require('./errors');

function invalidOutput(message) {
  return new AiError('INVALID_OUTPUT', message);
}

function stripControlChars(value) {
  return String(value).replace(/[\u0000-\u001F\u007F]/g, '');
}

function collapseWhitespace(value) {
  return String(value).replace(/\s+/g, ' ').trim();
}

function normalizeText(raw, label, maxLength) {
  if (typeof raw !== 'string') {
    throw invalidOutput(`AI returned a non-string ${label}`);
  }
  const cleaned = collapseWhitespace(stripControlChars(raw));
  if (!cleaned) {
    throw invalidOutput(`AI returned an empty ${label}`);
  }
  if (cleaned.length > maxLength) {
    throw invalidOutput(`${label} exceeds maximum length ${maxLength}`);
  }
  return cleaned;
}

function normalizeTitle(raw, maxLength) {
  return normalizeText(raw, 'title', maxLength);
}

function normalizeDescription(raw, maxLength) {
  return normalizeText(raw, 'description', maxLength);
}

function normalizeAnswer(raw, maxLength) {
  return normalizeText(raw, 'answer', maxLength);
}

function normalizeScore(raw) {
  if (raw === null || raw === undefined) {
    throw invalidOutput('AI returned no lead score');
  }
  if (typeof raw !== 'number' && typeof raw !== 'string') {
    throw invalidOutput('AI returned a non-numeric lead score');
  }
  if (typeof raw === 'string' && raw.trim() === '') {
    throw invalidOutput('AI returned an empty lead score');
  }
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    throw invalidOutput('AI returned a non-finite lead score');
  }
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeGeneratedContent(content, limits = {}) {
  if (!content || typeof content !== 'object') {
    throw invalidOutput('AI returned no generated content object');
  }
  return {
    title: normalizeTitle(content.title, limits.maxTitleLength),
    description: normalizeDescription(content.description, limits.maxDescriptionLength),
  };
}

module.exports = {
  stripControlChars,
  collapseWhitespace,
  normalizeText,
  normalizeTitle,
  normalizeDescription,
  normalizeAnswer,
  normalizeScore,
  normalizeGeneratedContent,
};
