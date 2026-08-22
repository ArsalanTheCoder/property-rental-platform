/**
 * LiveProvider - AI provider for OpenAI-compatible chat completions API
 * Makes HTTP requests to the configured API endpoint
 */

const { ProviderError, RateLimitError, TimeoutError, ModelError } = require('../errors');

class LiveProvider {
  constructor(config) {
    if (!config.apiKey) {
      throw new Error('API key is required for LiveProvider');
    }

    this.config = config;
    this.baseUrl = config.baseUrl || 'https://api.openai.com/v1';
    this.model = config.model || 'gpt-4';
    this.temperature = config.temperature || 0.7;
    this.maxTokens = config.maxTokens || 1000;
    this.timeoutMs = config.timeoutMs || 30000;
    this.retryAttempts = config.retryAttempts || 3;
    this.retryDelayMs = config.retryDelayMs || 1000;
  }

  /**
   * Make API request with retry logic
   * @param {Array} messages - Messages to send
   * @returns {Promise<Object>} API response
   */
  async makeRequest(messages) {
    let lastError;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
          },
          body: JSON.stringify({
            model: this.model,
            messages,
            temperature: this.temperature,
            max_tokens: this.maxTokens
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          throw new RateLimitError(
            'Rate limit exceeded',
            retryAfter ? parseInt(retryAfter, 10) : null
          );
        }

        // Handle other HTTP errors
        if (!response.ok) {
          const errorBody = await response.text();
          throw new ProviderError(
            `API request failed with status ${response.status}: ${errorBody}`
          );
        }

        const data = await response.json();

        // Validate response structure
        if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
          throw new ModelError('Invalid API response: no choices returned', data);
        }

        const choice = data.choices[0];
        if (!choice.message || typeof choice.message.content !== 'string') {
          throw new ModelError('Invalid API response: missing message content', data);
        }

        return {
          content: choice.message.content,
          model: data.model || this.model,
          usage: data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
        };

      } catch (error) {
        lastError = error;

        // Don't retry validation or model errors
        if (error instanceof ModelError) {
          throw error;
        }

        // Don't retry if it's the last attempt
        if (attempt === this.retryAttempts) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = this.retryDelayMs * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // If we get here, all retries failed
    if (lastError instanceof RateLimitError || lastError instanceof TimeoutError) {
      throw lastError;
    }
    throw new ProviderError('API request failed after all retries', lastError);
  }

  /**
   * Generate a title from property input
   * @param {Object} property - Property input
   * @returns {Promise<Object>} Generated title
   */
  async generateTitle(property) {
    const messages = [
      {
        role: 'system',
        content: 'You are a professional real estate copywriter. Generate a concise, appealing property title. Return only the title text, no quotes or extra formatting.'
      },
      {
        role: 'user',
        content: `Generate a professional title for this property:\nType: ${property.propertyType}\nBedrooms: ${property.bedrooms}\nLocation: ${property.location}\nFurnished: ${property.furnished ? 'Yes' : 'No'}`
      }
    ];

    const result = await this.makeRequest(messages);

    return {
      title: result.content.trim(),
      model: result.model,
      usage: result.usage
    };
  }

  /**
   * Generate a description from property input
   * @param {Object} property - Property input
   * @returns {Promise<Object>} Generated description
   */
  async generateDescription(property) {
    const amenitiesList = property.amenities.length > 0 ? property.amenities.join(', ') : 'basic amenities';

    const messages = [
      {
        role: 'system',
        content: 'You are a professional real estate copywriter. Generate a compelling, professional property description. Return only the description text, no extra formatting.'
      },
      {
        role: 'user',
        content: `Generate a professional description for this property:\nType: ${property.propertyType}\nPrice: $${property.price}\nLocation: ${property.location}\nBedrooms: ${property.bedrooms}\nBathrooms: ${property.bathrooms}\nAmenities: ${amenitiesList}\nFurnished: ${property.furnished ? 'Yes' : 'No'}`
      }
    ];

    const result = await this.makeRequest(messages);

    return {
      description: result.content.trim(),
      model: result.model,
      usage: result.usage
    };
  }

  /**
   * Chat with property context
   * @param {Array} messages - Conversation messages
   * @returns {Promise<Object>} Chat response
   */
  async chat(messages) {
    const result = await this.makeRequest(messages);

    return {
      answer: result.content.trim(),
      model: result.model,
      usage: result.usage
    };
  }

  /**
   * Generate a lead score
   * @param {Object} input - Lead scoring input
   * @returns {Promise<Object>} Lead score
   */
  async scoreLead(input) {
    let context = `Property ID: ${input.propertyId}\nUser ID: ${input.userId}`;

    if (input.viewingDate) context += `\nViewing Date: ${input.viewingDate}`;
    if (input.viewingTime) context += `\nViewing Time: ${input.viewingTime}`;
    if (input.message) context += `\nMessage: ${input.message}`;
    if (input.userProfile) {
      if (input.userProfile.name) context += `\nUser Name: ${input.userProfile.name}`;
      if (input.userProfile.email) context += `\nUser Email: ${input.userProfile.email}`;
    }

    const messages = [
      {
        role: 'system',
        content: 'You are a lead scoring analyst for a property rental platform. Analyze the inquiry and return a score from 0-100 indicating how serious/qualified the lead is. Return ONLY the numeric score, nothing else.'
      },
      {
        role: 'user',
        content: `Score this lead (0-100):\n${context}`
      }
    ];

    const result = await this.makeRequest(messages);

    // Parse the score from the response
    const scoreMatch = result.content.match(/(\d+)/);
    const score = scoreMatch ? Math.min(Math.max(parseInt(scoreMatch[1], 10), 0), 100) : 50;

    return {
      score,
      model: result.model,
      usage: result.usage
    };
  }
}

module.exports = LiveProvider;
