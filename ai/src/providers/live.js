'use strict';

const { AiError, isAiError } = require('../errors');
const { buildContentPrompts, buildChatPrompts, buildLeadPrompts } = require('../prompts');

const DEFAULT_BASE_URL = 'https://api.openai.com/v1';
const TRANSIENT_ATTEMPTS = 2;

function chatCompletionsUrl(baseUrl) {
  const base = (baseUrl && String(baseUrl).trim()) || DEFAULT_BASE_URL;
  return `${base.replace(/\/+$/, '')}/chat/completions`;
}

function mapProviderError(status) {
  if (status === 401 || status === 403) {
    return new AiError('PROVIDER_AUTH', `AI provider rejected the API key (HTTP ${status})`, {
      providerStatus: status,
      retryable: false,
    });
  }
  if (status === 408) {
    return new AiError('PROVIDER_TIMEOUT', `AI provider request timed out (HTTP ${status})`, {
      providerStatus: status,
      retryable: true,
    });
  }
  if (status === 429 || status >= 500) {
    return new AiError('PROVIDER_UNAVAILABLE', `AI provider unavailable (HTTP ${status})`, {
      providerStatus: status,
      retryable: true,
    });
  }
  return new AiError('PROVIDER_UNAVAILABLE', `AI provider rejected the request (HTTP ${status})`, {
    providerStatus: status,
    retryable: false,
  });
}

function stripFencesAndParse(rawText) {
  let text = String(rawText == null ? '' : rawText).trim();
  text = text.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();

  try {
    return JSON.parse(text);
  } catch {
    throw new AiError('INVALID_OUTPUT', 'AI provider returned content that is not valid JSON');
  }
}

function parseGeneratedContent(rawText) {
  const parsed = stripFencesAndParse(rawText);
  if (!parsed || typeof parsed !== 'object' || typeof parsed.title !== 'string' || typeof parsed.description !== 'string') {
    throw new AiError('INVALID_OUTPUT', 'AI provider returned content missing title and description');
  }
  return parsed;
}

function parseLeadScore(rawText) {
  const parsed = stripFencesAndParse(rawText);
  if (!parsed || typeof parsed !== 'object' || parsed.score === undefined || parsed.score === null) {
    throw new AiError('INVALID_OUTPUT', 'AI provider returned content missing a score');
  }
  const result = { score: parsed.score };
  if (typeof parsed.summary === 'string' && parsed.summary.trim()) {
    result.summary = parsed.summary.trim();
  }
  return result;
}

class LiveProvider {
  constructor(config, deps = {}) {
    this.config = config;
    this.fetch = deps.fetch || globalThis.fetch;
    this.delay = deps.delay || ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
    this.retryDelayMs = deps.retryDelayMs === undefined ? 250 : deps.retryDelayMs;

    if (typeof this.fetch !== 'function') {
      throw new AiError('CONFIG_MISSING', 'No global fetch is available; Node 18+ is required');
    }
  }

  async generateContent(raw) {
    const { system, user } = buildContentPrompts(raw);
    const body = {
      model: this.config.model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_tokens: this.config.maxTokens,
      temperature: 0.7,
    };
    const rawContent = await this.callWithTransientRetry(body);
    return parseGeneratedContent(rawContent);
  }

  async answerQuestion(property, question) {
    const { system, user } = buildChatPrompts(property, question, this.config.maxQuestionLength);
    const body = {
      model: this.config.model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_tokens: this.config.maxTokens,
      temperature: 0.5,
    };
    const rawContent = await this.callWithTransientRetry(body);
    return { answer: rawContent };
  }

  async scoreLead(context) {
    const { system, user } = buildLeadPrompts(context);
    const body = {
      model: this.config.model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_tokens: this.config.maxTokens,
      temperature: 0,
    };
    const rawContent = await this.callWithTransientRetry(body);
    return parseLeadScore(rawContent);
  }

  async callWithTransientRetry(body) {
    let lastError;
    for (let attempt = 0; attempt < TRANSIENT_ATTEMPTS; attempt += 1) {
      try {
        return await this.postChatCompletions(body);
      } catch (err) {
        lastError = err;
        const retryable = isAiError(err) && err.retryable === true;
        if (retryable && attempt < TRANSIENT_ATTEMPTS - 1) {
          await this.delay(this.retryDelayMs);
          continue;
        }
        throw err;
      }
    }
    throw lastError;
  }

  async postChatCompletions(body) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);
    try {
      const response = await this.fetch(chatCompletionsUrl(this.config.baseUrl), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw mapProviderError(response.status);
      }

      const data = await response.json();
      const content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      if (typeof content !== 'string' || content.trim() === '') {
        throw new AiError('INVALID_OUTPUT', 'AI provider returned an empty completion');
      }
      return content;
    } catch (err) {
      if (err && err.name === 'AbortError') {
        throw new AiError('PROVIDER_TIMEOUT', 'AI provider call timed out', { retryable: true });
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
}

function createLiveProvider(config, deps) {
  return new LiveProvider(config, deps);
}

module.exports = { LiveProvider, createLiveProvider, DEFAULT_BASE_URL };
