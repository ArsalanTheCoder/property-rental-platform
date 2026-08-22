/**
 * Prompts for property title generation
 */

const TITLE_SYSTEM_PROMPT = `You are a professional real estate copywriter specializing in rental properties.
Generate concise, appealing property titles that attract potential tenants.
Return only the title text, no quotes or extra formatting.
Keep titles under 100 characters when possible.`;

/**
 * Build title generation prompt from property input
 * @param {Object} property - Property input
 * @returns {Array} Messages array for chat completion
 */
function buildTitlePrompt(property) {
  return [
    { role: "system", content: TITLE_SYSTEM_PROMPT },
    {
      role: "user",
      content: `Generate a professional title for this rental property:
Property Type: ${property.propertyType}
Bedrooms: ${property.bedrooms}
Location: ${property.location}
Furnished: ${property.furnished ? "Yes" : "No"}
Price: $${property.price}
The title should be catchy, professional, and highlight key features.`,
    },
  ];
}

module.exports = { TITLE_SYSTEM_PROMPT, buildTitlePrompt };
