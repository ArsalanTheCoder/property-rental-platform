'use strict';

/**
 * Provider interface contract.
 *
 * A provider is an object implementing the three methods below. Both
 * LiveProvider (external LLM API) and MockProvider (deterministic, offline)
 * satisfy this contract so the AiService facade behaves identically
 * regardless of AI_MODE.
 *
 * @typedef {Object} RawPropertyInput
 * @property {string} [propertyType]
 * @property {number} [price]
 * @property {string} [location]
 * @property {number} [bedrooms]
 * @property {number} [bathrooms]
 * @property {string[]} [amenities]
 * @property {boolean} [furnished]
 * @property {string} [notes]
 *
 * @typedef {Object} GeneratedContent
 * @property {string} title
 * @property {string} description
 *
 * @typedef {Object} PropertyContext
 * @property {string} propertyId
 * @property {string} title
 * @property {string} description
 * @property {string} [propertyType]
 * @property {number} [price]
 * @property {string} [location]
 * @property {number} [bedrooms]
 * @property {number} [bathrooms]
 * @property {string[]} [amenities]
 * @property {boolean} [furnished]
 * @property {boolean} [availability]
 * @property {string} [status]
 *
 * @typedef {Object} LeadContext
 * @property {string} [userName]
 * @property {string} [userPhone]
 * @property {string} [message]
 * @property {string} [date]
 * @property {string} [time]
 * @property {number} [favoritesCount]
 * @property {number} [priorViewingCount]
 * @property {string} [propertyTitle]
 * @property {number} [propertyPrice]
 *
 * @typedef {Object} ProviderInterface
 * @property {(raw: RawPropertyInput) => Promise<GeneratedContent>} generateContent
 * @property {(property: PropertyContext, question: string) => Promise<{answer: string}>} answerQuestion
 * @property {(context: LeadContext) => Promise<{score: number}>} scoreLead
 */

const PROVIDER_METHODS = ['generateContent', 'answerQuestion', 'scoreLead'];

function assertProviderShape(provider) {
  if (!provider || typeof provider !== 'object') {
    throw new TypeError('Provider must be an object');
  }
  for (const method of PROVIDER_METHODS) {
    if (typeof provider[method] !== 'function') {
      throw new TypeError(`Provider must implement ${method}()`);
    }
  }
}

module.exports = { PROVIDER_METHODS, assertProviderShape };
