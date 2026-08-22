/**
 * MockProvider - Deterministic AI provider for testing and development
 * Makes no network requests, works without API key
 */

class MockProvider {
  constructor(config = {}) {
    this.config = config;
    this.delayMs = config.mockDelayMs || 0;
  }

  /**
   * Simulate delay
   */
  async delay() {
    if (this.delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, this.delayMs));
    }
  }

  /**
   * Generate a mock title from property input
   * @param {Object} property - Property input
   * @returns {Promise<Object>} Generated title
   */
  async generateTitle(property) {
    await this.delay();

    const { propertyType, bedrooms, location, furnished } = property;

    const furnishedText = furnished ? 'Furnished' : 'Unfurnished';
    const bedroomText = bedrooms === 0 ? 'Studio' : `${bedrooms}BR`;

    return {
      title: `${furnishedText} ${bedroomText} ${propertyType} in ${location}`,
      model: 'mock',
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
    };
  }

  /**
   * Generate a mock description from property input
   * @param {Object} property - Property input
   * @returns {Promise<Object>} Generated description
   */
  async generateDescription(property) {
    await this.delay();

    const { propertyType, price, location, bedrooms, bathrooms, amenities, furnished } = property;

    const amenitiesList = amenities.length > 0 ? amenities.join(', ') : 'basic amenities';

    const description = `Welcome to this beautiful ${propertyType} located in ${location}. ` +
      `This ${furnished ? 'furnished' : 'unfurnished'} property features ${bedrooms} bedroom(s) and ${bathrooms} bathroom(s). ` +
      `Priced at $${price.toLocaleString()}, it comes with ${amenitiesList}. ` +
      `Perfect for those looking for a comfortable living space in ${location}.`;

    return {
      description,
      model: 'mock',
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
    };
  }

  /**
   * Generate a mock chatbot response
   * @param {Array} messages - Conversation messages
   * @returns {Promise<Object>} Chatbot response
   */
  async chat(messages) {
    await this.delay();

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    const question = lastMessage?.content || '';

    // Check if this is a title generation prompt
    if (question.includes('Generate a professional title')) {
      // Extract property details from the prompt
      const typeMatch = question.match(/Type:\s*(\w+)/);
      const bedroomsMatch = question.match(/Bedrooms:\s*(\d+)/);
      const locationMatch = question.match(/Location:\s*(\w+)/);
      const furnishedMatch = question.match(/Furnished:\s*(Yes|No)/i);

      const propertyType = typeMatch ? typeMatch[1] : 'Property';
      const bedrooms = bedroomsMatch ? bedroomsMatch[1] : '1';
      const location = locationMatch ? locationMatch[1] : 'Area';
      const furnished = furnishedMatch ? furnishedMatch[1].toLowerCase() === 'yes' : false;

      const furnishedText = furnished ? 'Furnished' : 'Unfurnished';
      const bedroomText = bedrooms === '0' ? 'Studio' : `${bedrooms}BR`;

      return {
        answer: `${furnishedText} ${bedroomText} ${propertyType} in ${location}`,
        model: 'mock',
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
      };
    }

    // Check if this is a description generation prompt
    if (question.includes('Generate a professional description')) {
      // Extract property details from the prompt
      const typeMatch = question.match(/Type:\s*(\w+)/);
      const priceMatch = question.match(/Price:\s*\$(\d+)/);
      const locationMatch = question.match(/Location:\s*(\w+)/);
      const bedroomsMatch = question.match(/Bedrooms:\s*(\d+)/);
      const bathroomsMatch = question.match(/Bathrooms:\s*(\d+)/);
      const amenitiesMatch = question.match(/Amenities:\s*(.+?)(?:\n|$)/);
      const furnishedMatch = question.match(/Furnished:\s*(Yes|No)/i);

      const propertyType = typeMatch ? typeMatch[1] : 'Property';
      const price = priceMatch ? priceMatch[1] : '2000';
      const location = locationMatch ? locationMatch[1] : 'Area';
      const bedrooms = bedroomsMatch ? bedroomsMatch[1] : '2';
      const bathrooms = bathroomsMatch ? bathroomsMatch[1] : '1';
      const amenities = amenitiesMatch ? amenitiesMatch[1].trim() : 'basic amenities';
      const furnished = furnishedMatch ? furnishedMatch[1].toLowerCase() === 'yes' : false;

      return {
        answer: `Welcome to this beautiful ${propertyType} located in ${location}. This ${furnished ? 'furnished' : 'unfurnished'} property features ${bedrooms} bedroom(s) and ${bathrooms} bathroom(s). Priced at $${price}, it comes with ${amenities}. Perfect for those looking for a comfortable living space in ${location}.`,
        model: 'mock',
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
      };
    }

    // Simple mock responses based on keywords
    let answer;
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('price') || lowerQuestion.includes('cost') || lowerQuestion.includes('rent')) {
      answer = 'The price information is listed in the property details. Please refer to the listing for the current rental rate.';
    } else if (lowerQuestion.includes('bedroom') || lowerQuestion.includes('bed')) {
      answer = 'This property has the bedrooms as specified in the listing details.';
    } else if (lowerQuestion.includes('bathroom') || lowerQuestion.includes('bath')) {
      answer = 'The number of bathrooms is listed in the property specifications.';
    } else if (lowerQuestion.includes('amenities') || lowerQuestion.includes('features')) {
      answer = 'The amenities are listed in the property details section. Please review the full list there.';
    } else if (lowerQuestion.includes('location') || lowerQuestion.includes('where')) {
      answer = 'The property is located at the address shown in the listing. The exact location details are provided in the property information.';
    } else if (lowerQuestion.includes('available') || lowerQuestion.includes('vacancy')) {
      answer = 'Please check the availability status in the property listing or contact the property manager for current availability.';
    } else if (lowerQuestion.includes('pet') || lowerQuestion.includes('pets')) {
      answer = 'Pet policies vary by property. Please check the listing details or contact the property manager for specific pet policies.';
    } else {
      answer = 'Thank you for your question about this property. The information you need can be found in the property listing details. Is there anything specific you would like to know?';
    }

    return {
      answer,
      model: 'mock',
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
    };
  }

  /**
   * Generate a mock lead score
   * @param {Object} input - Lead scoring input
   * @returns {Promise<Object>} Lead score
   */
  async scoreLead(input) {
    await this.delay();

    let score = 50; // Base score

    // Increase score based on available information
    if (input.viewingDate) score += 15;
    if (input.viewingTime) score += 10;
    if (input.message && input.message.length > 10) score += 15;
    if (input.userProfile) {
      if (input.userProfile.name) score += 5;
      if (input.userProfile.email) score += 5;
    }

    // Cap at 100
    score = Math.min(score, 100);

    return {
      score,
      model: 'mock',
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
    };
  }
}

module.exports = MockProvider;
