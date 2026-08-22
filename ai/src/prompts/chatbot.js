/**
 * Prompts for property-specific chatbot
 */

/**
 * Build chatbot system prompt with property context
 * @param {Object} property - Property input
 * @returns {string} System prompt
 */
function buildChatbotSystemPrompt(property) {
  const amenitiesList = property.amenities.length > 0
    ? property.amenities.join(', ')
    : 'Not specified';

  return `You are a helpful property rental assistant. You have access to the following property information:

Property Type: ${property.propertyType}
Price: $${property.price}
Location: ${property.location}
Bedrooms: ${property.bedrooms}
Bathrooms: ${property.bathrooms}
Amenities: ${amenitiesList}
Furnished: ${property.furnished ? 'Yes' : 'No'}

IMPORTANT RULES:
1. Only answer questions about THIS specific property.
2. If asked about other properties, politely redirect to this property's information.
3. Be helpful, friendly, and professional.
4. If you don't have specific information, say so honestly.
5. Never make up information about the property.
6. Keep responses concise and relevant.
7. Do NOT store or remember conversation history - each response is independent.`;
}

/**
 * Build chatbot messages array
 * @param {Object} property - Property input
 * @param {string} question - User question
 * @param {Array} conversationHistory - Optional conversation history
 * @returns {Array} Messages array for chat completion
 */
function buildChatbotMessages(property, question, conversationHistory = []) {
  const messages = [
    {
      role: 'system',
      content: buildChatbotSystemPrompt(property)
    }
  ];

  // Add conversation history
  for (const msg of conversationHistory) {
    messages.push({
      role: msg.role,
      content: msg.content
    });
  }

  // Add current question
  messages.push({
    role: 'user',
    content: question
  });

  return messages;
}

module.exports = {
  buildChatbotSystemPrompt,
  buildChatbotMessages
};
