/**
 * Title generator for property listings
 */

const { validatePropertyInput } = require('../validation');
const { buildTitlePrompt } = require('../prompts/title');

class TitleGenerator {
  constructor(provider) {
    this.provider = provider;
  }

  /**
   * Generate a property title
   * @param {Object} property - Property input
   * @returns {Promise<Object>} Generated title with metadata
   */
  async generate(property) {
    // Validate input
    validatePropertyInput(property);

    // Build prompt
    const messages = buildTitlePrompt(property);

    // Generate using provider
    const result = await this.provider.chat(messages);

    return {
      title: result.answer || result.content,
      model: result.model,
      usage: result.usage
    };
  }
}

module.exports = TitleGenerator;
