/**
 * Input validation for AI package
 */

const { ValidationError } = require('./errors');

/**
 * Validate property input
 * @param {Object} property - Property input object
 * @throws {ValidationError} if validation fails
 */
function validatePropertyInput(property) {
  if (!property || typeof property !== 'object') {
    throw new ValidationError('Property must be a valid object', 'property');
  }

  // propertyType: required non-empty string
  if (!property.propertyType || typeof property.propertyType !== 'string' || property.propertyType.trim() === '') {
    throw new ValidationError('propertyType is required and must be a non-empty string', 'propertyType');
  }

  // price: required positive number
  if (property.price === undefined || property.price === null || typeof property.price !== 'number' || property.price <= 0) {
    throw new ValidationError('price is required and must be a positive number', 'price');
  }

  // location: required non-empty string
  if (!property.location || typeof property.location !== 'string' || property.location.trim() === '') {
    throw new ValidationError('location is required and must be a non-empty string', 'location');
  }

  // bedrooms: required non-negative integer
  if (property.bedrooms === undefined || property.bedrooms === null || !Number.isInteger(property.bedrooms) || property.bedrooms < 0) {
    throw new ValidationError('bedrooms is required and must be a non-negative integer', 'bedrooms');
  }

  // bathrooms: required non-negative integer
  if (property.bathrooms === undefined || property.bathrooms === null || !Number.isInteger(property.bathrooms) || property.bathrooms < 0) {
    throw new ValidationError('bathrooms is required and must be a non-negative integer', 'bathrooms');
  }

  // amenities: required array
  if (!Array.isArray(property.amenities)) {
    throw new ValidationError('amenities is required and must be an array', 'amenities');
  }

  // furnished: required boolean
  if (typeof property.furnished !== 'boolean') {
    throw new ValidationError('furnished is required and must be a boolean', 'furnished');
  }

  return true;
}

/**
 * Validate chatbot request
 * @param {Object} request - Chatbot request object
 * @throws {ValidationError} if validation fails
 */
function validateChatRequest(request) {
  if (!request || typeof request !== 'object') {
    throw new ValidationError('Request must be a valid object', 'request');
  }

  // propertyId: required non-empty string
  if (!request.propertyId || typeof request.propertyId !== 'string' || request.propertyId.trim() === '') {
    throw new ValidationError('propertyId is required and must be a non-empty string', 'propertyId');
  }

  // property: valid property input
  if (request.property) {
    validatePropertyInput(request.property);
  }

  // question: required non-empty string, max 500 characters
  if (!request.question || typeof request.question !== 'string' || request.question.trim() === '') {
    throw new ValidationError('question is required and must be a non-empty string', 'question');
  }

  if (request.question.length > 500) {
    throw new ValidationError('question must not exceed 500 characters', 'question');
  }

  // optional conversation history max 10 messages
  if (request.conversationHistory !== undefined) {
    if (!Array.isArray(request.conversationHistory)) {
      throw new ValidationError('conversationHistory must be an array', 'conversationHistory');
    }

    if (request.conversationHistory.length > 10) {
      throw new ValidationError('conversationHistory must not exceed 10 messages', 'conversationHistory');
    }

    // Validate each message in history
    for (const msg of request.conversationHistory) {
      if (!msg || typeof msg !== 'object') {
        throw new ValidationError('Each message in conversationHistory must be an object', 'conversationHistory');
      }
      if (!msg.role || !['user', 'assistant'].includes(msg.role)) {
        throw new ValidationError('Each message must have a role of "user" or "assistant"', 'conversationHistory');
      }
      if (!msg.content || typeof msg.content !== 'string' || msg.content.trim() === '') {
        throw new ValidationError('Each message must have non-empty content', 'conversationHistory');
      }
    }
  }

  return true;
}

/**
 * Validate lead scoring input
 * @param {Object} input - Lead scoring input object
 * @throws {ValidationError} if validation fails
 */
function validateLeadScoreInput(input) {
  if (!input || typeof input !== 'object') {
    throw new ValidationError('Input must be a valid object', 'input');
  }

  // propertyId: required
  if (!input.propertyId || typeof input.propertyId !== 'string' || input.propertyId.trim() === '') {
    throw new ValidationError('propertyId is required and must be a non-empty string', 'propertyId');
  }

  // userId: required
  if (!input.userId || typeof input.userId !== 'string' || input.userId.trim() === '') {
    throw new ValidationError('userId is required and must be a non-empty string', 'userId');
  }

  // optional viewingDate
  if (input.viewingDate !== undefined && input.viewingDate !== null) {
    if (typeof input.viewingDate !== 'string') {
      throw new ValidationError('viewingDate must be a string', 'viewingDate');
    }
  }

  // optional viewingTime
  if (input.viewingTime !== undefined && input.viewingTime !== null) {
    if (typeof input.viewingTime !== 'string') {
      throw new ValidationError('viewingTime must be a string', 'viewingTime');
    }
  }

  // optional message max 1000 characters
  if (input.message !== undefined && input.message !== null) {
    if (typeof input.message !== 'string') {
      throw new ValidationError('message must be a string', 'message');
    }
    if (input.message.length > 1000) {
      throw new ValidationError('message must not exceed 1000 characters', 'message');
    }
  }

  // optional userProfile
  if (input.userProfile !== undefined && input.userProfile !== null) {
    if (typeof input.userProfile !== 'object') {
      throw new ValidationError('userProfile must be an object', 'userProfile');
    }
  }

  return true;
}

module.exports = {
  validatePropertyInput,
  validateChatRequest,
  validateLeadScoreInput
};
