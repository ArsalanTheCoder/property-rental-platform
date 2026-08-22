/**
 * Description generator for property listings
 */

const { validatePropertyInput } = require('../validation');
const { buildDescriptionPrompt } = require('../prompts/description');

class DescriptionGenerator {
  constructor(provider) {
    this.provider = provider;
  }

  /**
   * Generate a property description
   * @param {Object} property - Property input
   * @returns {Promise<Object>} Generated description with metadata
   */
  async generate(property) {
    // Validate input
    validatePropertyInput(property);

    // Build prompt
    const messages = buildDescriptionPrompt(property);

    // Generate using provider
    const result = await this.provider.chat(messages);

    return {
      description: result.answer || result.content,
      model: result.model,
      usage: result.usage
    };
  }
}

module.exports = DescriptionGenerator;
