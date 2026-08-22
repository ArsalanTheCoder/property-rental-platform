/**
 * Lead scoring for property viewing inquiries
 */

const { validateLeadScoreInput } = require('./validation');
const { buildLeadScoringPrompt } = require('./prompts/lead-scoring');

class LeadScorer {
  constructor(provider) {
    this.provider = provider;
  }

  /**
   * Score a lead based on inquiry information
   * @param {Object} input - Lead scoring input
   * @returns {Promise<Object>} Lead score result
   */
  async score(input) {
    // Validate input
    validateLeadScoreInput(input);

    // Build prompt
    const messages = buildLeadScoringPrompt(input);

    // Generate score using provider
    const result = await this.provider.scoreLead(input);

    return {
      score: result.score,
      model: result.model,
      usage: result.usage
    };
  }
}

module.exports = LeadScorer;
