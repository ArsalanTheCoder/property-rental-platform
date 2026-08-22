/**
 * Prompts for property description generation
 */

const DESCRIPTION_SYSTEM_PROMPT = `You are a professional real estate copywriter specializing in rental properties.
Generate compelling, detailed property descriptions that attract potential tenants.
Return only the description text, no extra formatting.
Focus on benefits, lifestyle, and key features.
Keep descriptions between 100-300 words.`;

/**
 * Build description generation prompt from property input
 * @param {Object} property - Property input
 * @returns {Array} Messages array for chat completion
 */
function buildDescriptionPrompt(property) {
  const amenitiesList =
    property.amenities.length > 0
      ? property.amenities.join(", ")
      : "Essential amenities";

  return [
    { role: "system", content: DESCRIPTION_SYSTEM_PROMPT },
    {
      role: "user",
      content: `Generate a professional description for this rental property:
Property Type: ${property.propertyType}
Price: $${property.price}
Location: ${property.location}
Bedrooms: ${property.bedrooms}
Bathrooms: ${property.bathrooms}
Amenities: ${amenitiesList}
Furnished: ${property.furnished ? "Yes" : "No"}
The description should be engaging, highlight the property's best features, and appeal to potential tenants looking for a home in ${property.location}.`,
    },
  ];
}

module.exports = { DESCRIPTION_SYSTEM_PROMPT, buildDescriptionPrompt };
