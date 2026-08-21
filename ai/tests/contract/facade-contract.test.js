'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createMockProvider } = require('../../src/providers/mock');
const { createLiveProvider } = require('../../src/providers/live');
const { createService } = require('../../src/service');
const { loadAiConfig } = require('../../src/config');
const { isAiError } = require('../../src/errors');

const FULL_RAW = {
  propertyType: 'apartment',
  price: 50000,
  location: 'DHA Karachi',
  bedrooms: 2,
  bathrooms: 2,
  amenities: ['parking', 'wifi'],
  furnished: true,
  notes: 'Near the main boulevard on a quiet street.',
};

const FULL_PROPERTY = {
  propertyId: 'prop_123',
  title: 'Modern 2-Bed Apartment in DHA Karachi',
  description: 'A bright, furnished 2-bedroom apartment.',
  propertyType: 'apartment',
  price: 50000,
  location: 'DHA Karachi',
  bedrooms: 2,
  bathrooms: 2,
  amenities: ['parking', 'wifi'],
  furnished: true,
  availability: true,
  status: 'published',
};

function makeResponse(status, body, ok) {
  const isOk = ok !== undefined ? ok : status >= 200 && status < 300;
  return {
    ok: isOk,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  };
}

function completionResponse(title, description) {
  return makeResponse(200, {
    choices: [{ message: { content: JSON.stringify({ title, description }) } }],
  });
}

function chatResponse(answer) {
  return makeResponse(200, {
    choices: [{ message: { content: answer } }],
  });
}

function scoreResponse(score, summary) {
  const body = { score };
  if (summary !== undefined) {
    body.summary = summary;
  }
  return makeResponse(200, {
    choices: [{ message: { content: JSON.stringify(body) } }],
  });
}

function liveConfig(envOverrides = {}) {
  return loadAiConfig({
    AI_MODE: 'live',
    AI_API_KEY: 'sk-test',
    AI_BASE_URL: 'https://provider.example/v1',
    ...envOverrides,
  });
}

function liveProviderWith(fetchHandler, envOverrides = {}) {
  return createLiveProvider(liveConfig(envOverrides), {
    fetch: fetchHandler,
    delay: async () => {},
    retryDelayMs: 0,
  });
}

function assertGenerateContentContract(providerLabel, createProvider) {
  test(`${providerLabel}: generateContent returns a valid {title, description}`, async () => {
    const provider = createProvider();
    const content = await provider.generateContent(FULL_RAW);
    assert.equal(typeof content.title, 'string');
    assert.ok(content.title.trim().length > 0, 'title should be non-empty');
    assert.ok(content.title.trim().length <= 120, 'title should respect the length limit');
    assert.equal(typeof content.description, 'string');
    assert.ok(content.description.trim().length > 0, 'description should be non-empty');
    assert.ok(content.description.trim().length <= 1000, 'description should respect the length limit');
  });

  test(`${providerLabel}: generateContent handles missing raw input`, async () => {
    const provider = createProvider();
    const content = await provider.generateContent(undefined);
    assert.ok(content.title.length > 0);
    assert.ok(content.description.length > 0);
  });

  test(`${providerLabel}: generateContent is stable for the same input`, async () => {
    const provider = createProvider();
    const first = await provider.generateContent(FULL_RAW);
    const second = await provider.generateContent(FULL_RAW);
    assert.deepEqual(first, second);
  });
}

assertGenerateContentContract('mock provider', () => createMockProvider());
assertGenerateContentContract('live provider', () =>
  liveProviderWith(() => Promise.resolve(completionResponse('Test Title', 'Test description.')))
);

test('live provider: sends an OpenAI-compatible chat completions request', async () => {
  let captured;
  const provider = liveProviderWith(async (url, options) => {
    captured = { url, options };
    return completionResponse('Test Title', 'Test description.');
  });
  await provider.generateContent(FULL_RAW);

  assert.ok(captured.url.endsWith('/v1/chat/completions'), `unexpected URL: ${captured.url}`);
  assert.equal(captured.options.method, 'POST');
  assert.equal(captured.options.headers.Authorization, 'Bearer sk-test');
  assert.equal(captured.options.headers['Content-Type'], 'application/json');

  const body = JSON.parse(captured.options.body);
  assert.equal(body.model, 'gpt-4o-mini');
  assert.equal(body.messages[0].role, 'system');
  assert.ok(body.messages[0].content.includes('title'));
  assert.equal(body.messages[1].role, 'user');
  assert.equal(typeof body.max_tokens, 'number');
});

test('live provider: maps 401 to PROVIDER_AUTH', async () => {
  const provider = liveProviderWith(() => Promise.resolve(makeResponse(401, { error: { message: 'bad key' } })));
  await assert.rejects(
    () => provider.generateContent(FULL_RAW),
    (e) => isAiError(e) && e.code === 'PROVIDER_AUTH' && e.providerStatus === 401 && e.retryable === false
  );
});

test('live provider: retries once on a transient 500 then succeeds', async () => {
  let calls = 0;
  const provider = liveProviderWith(() => {
    calls += 1;
    if (calls === 1) return Promise.resolve(makeResponse(500, {}));
    return Promise.resolve(completionResponse('Retried Title', 'Retried description.'));
  });
  const content = await provider.generateContent(FULL_RAW);
  assert.equal(calls, 2);
  assert.equal(content.title, 'Retried Title');
});

test('live provider: throws PROVIDER_UNAVAILABLE after repeated 5xx', async () => {
  const provider = liveProviderWith(() => Promise.resolve(makeResponse(500, {})));
  await assert.rejects(
    () => provider.generateContent(FULL_RAW),
    (e) => isAiError(e) && e.code === 'PROVIDER_UNAVAILABLE' && e.retryable === true
  );
});

test('live provider: maps 429 to PROVIDER_UNAVAILABLE (retryable)', async () => {
  const provider = liveProviderWith(() => Promise.resolve(makeResponse(429, {})));
  await assert.rejects(
    () => provider.generateContent(FULL_RAW),
    (e) => isAiError(e) && e.code === 'PROVIDER_UNAVAILABLE' && e.retryable === true
  );
});

test('live provider: maps timeout/abort to PROVIDER_TIMEOUT', async () => {
  const provider = liveProviderWith(() => {
    const err = new Error('aborted');
    err.name = 'AbortError';
    return Promise.reject(err);
  });
  await assert.rejects(
    () => provider.generateContent(FULL_RAW),
    (e) => isAiError(e) && e.code === 'PROVIDER_TIMEOUT' && e.retryable === true
  );
});

test('live provider: non-JSON completion content raises INVALID_OUTPUT', async () => {
  const provider = liveProviderWith(() => Promise.resolve(makeResponse(200, { choices: [{ message: { content: 'not json at all' } }] })));
  await assert.rejects(
    () => provider.generateContent(FULL_RAW),
    (e) => isAiError(e) && e.code === 'INVALID_OUTPUT'
  );
});

test('live provider: empty completion content raises INVALID_OUTPUT', async () => {
  const provider = liveProviderWith(() => Promise.resolve(makeResponse(200, { choices: [{ message: { content: '' } }] })));
  await assert.rejects(
    () => provider.generateContent(FULL_RAW),
    (e) => isAiError(e) && e.code === 'INVALID_OUTPUT'
  );
});

test('live provider: missing title/description in parsed JSON raises INVALID_OUTPUT', async () => {
  const provider = liveProviderWith(() => Promise.resolve(makeResponse(200, { choices: [{ message: { content: JSON.stringify({ foo: 'bar' }) } }] })));
  await assert.rejects(
    () => provider.generateContent(FULL_RAW),
    (e) => isAiError(e) && e.code === 'INVALID_OUTPUT'
  );
});

function assertAnswerQuestionContract(providerLabel, buildFacade) {
  test(`${providerLabel}: answerQuestion returns a non-empty trimmed answer`, async () => {
    const facade = buildFacade();
    const { answer } = await facade.answerQuestion(FULL_PROPERTY, 'Is this property pet friendly?');
    assert.equal(typeof answer, 'string', 'answer should be a string');
    assert.ok(answer.trim().length > 0, 'answer should be non-empty');
    assert.equal(answer, answer.trim(), 'answer should be trimmed');
  });

  test(`${providerLabel}: answerQuestion answers from the supplied property context`, async () => {
    const facade = buildFacade();
    const { answer } = await facade.answerQuestion(FULL_PROPERTY, 'How many bedrooms does this property have?');
    assert.ok(answer.length > 0);
  });

  test(`${providerLabel}: answerQuestion rejects a missing property context`, async () => {
    const facade = buildFacade();
    await assert.rejects(() => facade.answerQuestion(undefined, 'Is it furnished?'), TypeError);
    await assert.rejects(() => facade.answerQuestion(null, 'Is it furnished?'), TypeError);
  });

  test(`${providerLabel}: answerQuestion rejects a missing or blank question`, async () => {
    const facade = buildFacade();
    await assert.rejects(() => facade.answerQuestion(FULL_PROPERTY, ''), TypeError);
    await assert.rejects(() => facade.answerQuestion(FULL_PROPERTY, '   '), TypeError);
  });
}

assertAnswerQuestionContract('mock provider facade', () =>
  createService(createMockProvider(), loadAiConfig({ AI_MODE: 'mock' }))
);

assertAnswerQuestionContract('live provider facade', () =>
  createService(
    liveProviderWith(() => Promise.resolve(chatResponse('This property is located in DHA Karachi and has 2 bedrooms.'))),
    liveConfig()
  )
);

test('live provider: answerQuestion sends an OpenAI-compatible chat request with the property context and question', async () => {
  let captured;
  const provider = liveProviderWith(async (url, options) => {
    captured = { url, options };
    return chatResponse('This property is located in DHA Karachi.');
  });
  const { answer } = await provider.answerQuestion(FULL_PROPERTY, 'Where is this located?');

  assert.ok(captured.url.endsWith('/v1/chat/completions'), `unexpected URL: ${captured.url}`);
  assert.equal(captured.options.method, 'POST');
  assert.equal(captured.options.headers.Authorization, 'Bearer sk-test');

  const body = JSON.parse(captured.options.body);
  assert.equal(body.model, 'gpt-4o-mini');
  assert.equal(body.messages[0].role, 'system');
  assert.ok(body.messages[0].content.toLowerCase().includes('property context'), 'system prompt should mention the property context');
  assert.equal(body.messages[1].role, 'user');
  assert.ok(body.messages[1].content.includes('Where is this located?'), 'question should be embedded');
  assert.ok(body.messages[1].content.includes('DHA Karachi'), 'property context should be embedded');
  assert.equal(typeof body.max_tokens, 'number');
  assert.equal(answer, 'This property is located in DHA Karachi.');
});

test('live provider: answerQuestion raises INVALID_OUTPUT on an empty completion', async () => {
  const provider = liveProviderWith(() => Promise.resolve(makeResponse(200, { choices: [{ message: { content: '   ' } }] })));
  await assert.rejects(
    () => provider.answerQuestion(FULL_PROPERTY, 'What is the price?'),
    (e) => isAiError(e) && e.code === 'INVALID_OUTPUT'
  );
});

function assertScoreLeadContract(providerLabel, buildFacade) {
  test(`${providerLabel}: scoreLead returns an integer within 0-100`, async () => {
    const facade = buildFacade();
    const { score } = await facade.scoreLead({
      message: 'I am very interested in this apartment and would like to schedule a visit.',
      date: '2026-08-20',
      time: '17:00',
      favoritesCount: 4,
      priorViewingCount: 2,
    });
    assert.ok(Number.isInteger(score), `score must be an integer, got ${score}`);
    assert.ok(score >= 0 && score <= 100, `score must be within 0-100, got ${score}`);
  });

  test(`${providerLabel}: scoreLead is deterministic for the same context`, async () => {
    const facade = buildFacade();
    const first = await facade.scoreLead({});
    const second = await facade.scoreLead({});
    assert.ok(Number.isInteger(first.score), `score must be an integer, got ${first.score}`);
    assert.ok(first.score >= 0 && first.score <= 100);
    assert.equal(first.score, second.score);
  });

  test(`${providerLabel}: scoreLead rejects a missing or non-object context`, async () => {
    const facade = buildFacade();
    await assert.rejects(() => facade.scoreLead(undefined), TypeError);
    await assert.rejects(() => facade.scoreLead(null), TypeError);
    await assert.rejects(() => facade.scoreLead('lead'), TypeError);
  });
}

assertScoreLeadContract('mock provider facade', () =>
  createService(createMockProvider(), loadAiConfig({ AI_MODE: 'mock' }))
);

assertScoreLeadContract('live provider facade', () =>
  createService(
    liveProviderWith(() => Promise.resolve(scoreResponse(85))),
    liveConfig()
  )
);

test('live provider: scoreLead sends a scoring request and parses the JSON score', async () => {
  let captured;
  const provider = liveProviderWith(async (url, options) => {
    captured = { url, options };
    return scoreResponse(87);
  });
  const { score } = await provider.scoreLead({ message: 'Interested', favoritesCount: 3 });

  assert.equal(score, 87);
  assert.ok(captured.url.endsWith('/v1/chat/completions'), `unexpected URL: ${captured.url}`);
  assert.equal(captured.options.method, 'POST');
  assert.equal(captured.options.headers.Authorization, 'Bearer sk-test');

  const body = JSON.parse(captured.options.body);
  assert.equal(body.model, 'gpt-4o-mini');
  assert.equal(body.messages[0].role, 'system');
  assert.ok(body.messages[0].content.toLowerCase().includes('score'), 'system prompt should mention score');
  assert.equal(body.messages[1].role, 'user');
  assert.ok(body.messages[1].content.includes('Interested'), 'lead signal should be embedded');
  assert.equal(typeof body.max_tokens, 'number');
});

test('live provider: scoreLead omits names and phone numbers from the prompt', async () => {
  let captured;
  const provider = liveProviderWith(async (url, options) => {
    captured = { url, options };
    return scoreResponse(60);
  });
  await provider.scoreLead({ userName: 'Ali', userPhone: '03001234567', message: 'Interested', favoritesCount: 2 });

  const body = JSON.parse(captured.options.body);
  const promptText = `${body.messages[0].content}\n${body.messages[1].content}`;
  assert.ok(!promptText.includes('03001234567'), 'phone number must not reach the provider');
  assert.ok(!promptText.includes('Ali'), 'user name must not reach the provider');
});

test('live provider: scoreLead raises INVALID_OUTPUT on non-JSON content', async () => {
  const provider = liveProviderWith(() => Promise.resolve(makeResponse(200, { choices: [{ message: { content: 'not json at all' } }] })));
  await assert.rejects(
    () => provider.scoreLead({ message: 'x' }),
    (e) => isAiError(e) && e.code === 'INVALID_OUTPUT'
  );
});

test('live provider: scoreLead raises INVALID_OUTPUT when the score is missing', async () => {
  const provider = liveProviderWith(() => Promise.resolve(makeResponse(200, { choices: [{ message: { content: JSON.stringify({ summary: 'no score' }) } }] })));
  await assert.rejects(
    () => provider.scoreLead({ message: 'x' }),
    (e) => isAiError(e) && e.code === 'INVALID_OUTPUT'
  );
});
