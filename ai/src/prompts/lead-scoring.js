/**
 * Prompts for lead scoring
 */

const LEAD_SCORING_SYSTEM_PROMPT = `You are a lead scoring analyst for a property rental platform.
Analyze property viewing inquiries and determine how serious/qualified the lead is.

SCORING CRITERIA:
- 0-30: Low quality (missing information, vague inquiry)
- 31-60: Medium quality (some information provided)
- 61-80: High quality (good information, specific request)
- 81-100: Excellent quality (complete information, clear intent)

FACTORS TO CONSIDER:
1. Completeness of contact information
2. Specificity of viewing request (date/time provided)
3. Quality and detail of message
4. Whether user profile information is available

Return ONLY the numeric score (0-100), nothing else.`;

/**
 * Build lead scoring prompt from input
 * @param {Object} input - Lead scoring input
 * @returns {Array} Messages array for chat completion
 */
function buildLeadScoringPrompt(input) {
  let context = `Property ID: ${input.propertyId}
User ID: ${input.userId}`;

  if (input.viewingDate) {
    context += `\nRequested Viewing Date: ${input.viewingDate}`;
  }
  if (input.viewingTime) {
    context += `\nRequested Viewing Time: ${input.viewingTime}`;
  }
  if (input.message) {
    context += `\nUser Message: ${input.message}`;
  }
  if (input.userProfile) {
    if (input.userProfile.name) {
      context += `\nUser Name: ${input.userProfile.name}`;
    }
    if (input.userProfile.email) {
      context += `\nUser Email: ${input.userProfile.email}`;
    }
  }

  return [
    { role: "system", content: LEAD_SCORING_SYSTEM_PROMPT },
    {
      role: "user",
      content: `Analyze this property viewing inquiry and provide a lead score (0-100):
${context}
Score this lead based on the information provided.`,
    },
  ];
}

module.exports = { LEAD_SCORING_SYSTEM_PROMPT, buildLeadScoringPrompt };
