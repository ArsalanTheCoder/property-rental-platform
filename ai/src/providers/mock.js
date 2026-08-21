'use strict';

const { assertProviderShape } = require('./provider');
const { normalizeScore } = require('../validate');

function toObject(value) {
  return value && typeof value === 'object' ? value : {};
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function indefiniteArticle(word) {
  return /^[aeiou]/i.test(word) ? 'an' : 'a';
}

function formatPrice(price) {
  return `Rs. ${Number(price).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function titleFromRaw(raw) {
  const parts = [];
  if (Number.isFinite(raw.bedrooms)) {
    parts.push(`${raw.bedrooms}-Bedroom`);
  }
  if (typeof raw.propertyType === 'string' && raw.propertyType.trim()) {
    parts.push(capitalize(raw.propertyType.trim()));
  }
  const hasDescriptor = parts.length > 0;
  if (typeof raw.location === 'string' && raw.location.trim()) {
    parts.push(`in ${raw.location.trim()}`);
  }
  if (parts.length === 0) {
    return 'Rental Property';
  }
  return hasDescriptor ? parts.join(' ') : `Rental Property ${parts.join(' ')}`;
}

function descriptionFromRaw(raw) {
  const sentences = [];
  const bedrooms = Number.isFinite(raw.bedrooms) ? raw.bedrooms : null;
  const bathrooms = Number.isFinite(raw.bathrooms) ? raw.bathrooms : null;

  if (bedrooms !== null && bathrooms !== null) {
    sentences.push(`This property offers ${bedrooms} bedroom${bedrooms === 1 ? '' : 's'} and ${bathrooms} bathroom${bathrooms === 1 ? '' : 's'}.`);
  } else if (bedrooms !== null) {
    sentences.push(`This property offers ${bedrooms} bedroom${bedrooms === 1 ? '' : 's'}.`);
  } else if (bathrooms !== null) {
    sentences.push(`This property offers ${bathrooms} bathroom${bathrooms === 1 ? '' : 's'}.`);
  }

  if (typeof raw.propertyType === 'string' && raw.propertyType.trim()) {
    sentences.push(`This is ${indefiniteArticle(raw.propertyType.trim())} ${raw.propertyType.trim().toLowerCase()} rental.`);
  }

  if (Number.isFinite(raw.price)) {
    sentences.push(`The rental price is ${formatPrice(raw.price)}.`);
  }

  if (raw.furnished === true) {
    sentences.push('The property is fully furnished.');
  } else if (raw.furnished === false) {
    sentences.push('The property is unfurnished.');
  }

  if (Array.isArray(raw.amenities) && raw.amenities.length > 0) {
    sentences.push(`Amenities include ${raw.amenities.join(', ')}.`);
  }

  if (typeof raw.notes === 'string' && raw.notes.trim()) {
    sentences.push(raw.notes.trim());
  }

  return sentences.length > 0 ? sentences.join(' ') : 'A comfortable rental property ready for you.';
}

function answerFromProperty(property, question) {
  const query = String(question || '').toLowerCase();
  const p = property || {};

  if (/price|rent|cost|monthly/.test(query)) {
    if (Number.isFinite(p.price)) {
      return `This property is listed at ${formatPrice(p.price)}.`;
    }
    return 'The listing does not specify a price for this property.';
  }
  if (/bedroom/.test(query)) {
    return Number.isFinite(p.bedrooms)
      ? `This property has ${p.bedrooms} bedroom${p.bedrooms === 1 ? '' : 's'}.`
      : 'The listing does not specify the number of bedrooms.';
  }
  if (/bathroom/.test(query)) {
    return Number.isFinite(p.bathrooms)
      ? `This property has ${p.bathrooms} bathroom${p.bathrooms === 1 ? '' : 's'}.`
      : 'The listing does not specify the number of bathrooms.';
  }
  if (/furnish/.test(query)) {
    if (p.furnished === true) return 'Yes, this property is fully furnished.';
    if (p.furnished === false) return 'No, this property is unfurnished.';
    return 'The listing does not specify whether the property is furnished.';
  }
  if (/locat|area|where|neighbor/.test(query)) {
    return typeof p.location === 'string' && p.location.trim()
      ? `This property is located in ${p.location.trim()}.`
      : 'The listing does not specify a location.';
  }
  if (/amenit|facilit|parking|wifi/.test(query)) {
    return Array.isArray(p.amenities) && p.amenities.length > 0
      ? `This property offers these amenities: ${p.amenities.join(', ')}.`
      : 'The listing does not list any amenities.';
  }
  if (/availab|move in|when can/.test(query)) {
    if (p.availability === true) return 'This property is currently available.';
    if (p.availability === false) return 'This property is not currently available.';
    return 'Please check the listing for current availability.';
  }
  if (/type|apartment|house|what is this/.test(query)) {
    return typeof p.propertyType === 'string' && p.propertyType.trim()
      ? `This is ${indefiniteArticle(p.propertyType.trim())} ${p.propertyType.trim().toLowerCase()} property.`
      : 'The listing does not specify a property type.';
  }
  return 'Based on the listing information, please review the property details for more information.';
}

function scoreFromContext(context) {
  let score = 20;

  const message = typeof context.message === 'string' ? context.message.trim() : '';
  if (message) {
    score += 10;
    if (message.length > 20) {
      score += 10;
    }
  }
  if (typeof context.date === 'string' && context.date.trim()) {
    score += 10;
  }
  if (typeof context.time === 'string' && context.time.trim()) {
    score += 10;
  }
  if (typeof context.userName === 'string' && context.userName.trim()) {
    score += 10;
  }

  const favorites = Number.isFinite(context.favoritesCount) ? Math.max(0, context.favoritesCount) : 0;
  score += Math.min(favorites, 5) * 5;

  const prior = Number.isFinite(context.priorViewingCount) ? Math.max(0, context.priorViewingCount) : 0;
  score += Math.min(prior, 3) * 5;

  return { score: normalizeScore(score) };
}

class MockProvider {
  async generateContent(raw) {
    const data = toObject(raw);
    return { title: titleFromRaw(data), description: descriptionFromRaw(data) };
  }

  async answerQuestion(property, question) {
    return { answer: answerFromProperty(toObject(property), question) };
  }

  async scoreLead(context) {
    return scoreFromContext(toObject(context));
  }
}

function createMockProvider() {
  const provider = new MockProvider();
  assertProviderShape(provider);
  return provider;
}

module.exports = { MockProvider, createMockProvider };
