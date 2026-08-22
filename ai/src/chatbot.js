/**
 * Property-specific chatbot
 */

const { validateChatRequest } = require('./validation');
const { buildChatbotMessages } = require('./prompts/chatbot');

class PropertyChatbot {
  constructor(provider) {
    this.provider = provider;
  }

  /**
   * Chat about a specific property
   * @param {Object} request - Chat request
   * @returns {Promise<Object>} Chat response
   */
  async chat(request) {
    // Validate input
    validateChatRequest(request);

    // Build messages with property context
    const messages = buildChatbotMessages(
      request.property,
      request.question,
      request.conversationHistory
    );

    // Generate response using provider
    const result = await this.provider.chat(messages);

    return {
      answer: result.answer || result.content,
      model: result.model,
      usage: result.usage
    };
  }
}

module.exports = PropertyChatbot;
