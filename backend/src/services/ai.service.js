const Groq = require("groq-sdk");
const config = require("../config");

class AIService {
  constructor() {
    this.groq = null;
    this.model = process.env.AI_MODEL || "openai/gpt-oss-120b";
    this.initClient();
  }

  /**
   * Initializes Groq client if API key is present.
   */
  initClient() {
    if (config.ai && config.ai.apiKey && config.ai.apiKey.trim()) {
      try {
        this.groq = new Groq({
          apiKey: config.ai.apiKey.trim(),
        });
      } catch (err) {
        console.error(
          "[AI SERVICE ERROR] Failed to initialize Groq client:",
          err.message
        );
      }
    }
  }

  /**
   * Helper to safely extract JSON from LLM output.
   */
  extractJson(text) {
    if (!text || typeof text !== "string") return null;
    try {
      // Direct parse
      return JSON.parse(text.trim());
    } catch (e) {
      // Match outermost JSON object { ... }
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch (innerErr) {
          return null;
        }
      }
      return null;
    }
  }

  /**
   * Generates a catchy marketing title and professional listing description.
   */
  async generatePropertyDescription({
    propertyType,
    city,
    address,
    bedrooms,
    bathrooms,
    price,
    amenities = [],
    furnished = false,
    rawNotes = "",
  }) {
    // If Groq is available, use fast LLM
    if (this.groq) {
      try {
        const systemPrompt = `You are an expert real estate copywriter and digital marketing specialist for a premium rental property platform.

Your task is to take raw property specifications (location, type, bedrooms, bathrooms, rent, amenities, and informal notes) and craft:
1. An attractive, concise listing title (maximum 15 words) highlighting key selling points.
2. A compelling, professional 2-to-3 paragraph marketing description that highlights natural lighting, space, lifestyle convenience, and featured amenities.

GUIDELINES:
- Keep the tone welcoming, professional, and sophisticated.
- Do NOT invent false amenities or features not mentioned in the input.
- Format the rent price clearly with commas (e.g. Rs. 65,000).
- Emphasize furnished status and proximity to city conveniences if noted.
- Output MUST strictly be valid JSON matching the schema below. No markdown formatting around the JSON.

JSON OUTPUT SCHEMA:
{
  "title": "string",
  "description": "string"
}`;

        const userContent = JSON.stringify({
          propertyType,
          city,
          address: address || "Prime Location",
          bedrooms,
          bathrooms,
          price: `Rs. ${Number(price).toLocaleString()}`,
          amenities: Array.isArray(amenities) ? amenities : [amenities],
          furnished: furnished ? "Fully Furnished" : "Unfurnished",
          rawNotes: rawNotes || "None provided",
        });

        const completion = await this.groq.chat.completions.create({
          model: this.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
          temperature: 0.7,
        });

        const rawContent = completion.choices[0]?.message?.content;
        const parsed = this.extractJson(rawContent);
        if (parsed && parsed.title && parsed.description) {
          return {
            title: parsed.title.trim(),
            description: parsed.description.trim(),
          };
        }
      } catch (err) {
        console.error(
          "[AI SERVICE ERROR] Groq generatePropertyDescription failed, falling back:",
          err.message
        );
      }
    }

    // Dynamic Fallback Generator
    const formattedAmenities =
      Array.isArray(amenities) && amenities.length > 0
        ? amenities.join(", ")
        : "standard utilities";
    const furnishedText = furnished ? "Fully Furnished" : "Unfurnished";
    const locationString = address ? `${address}, ${city}` : city;

    const title = `Modern ${bedrooms}-Bedroom ${furnishedText} ${propertyType} in ${locationString}`;
    const description = `Discover refined living in this spacious and well-appointed ${bedrooms}-bedroom, ${bathrooms}-bathroom ${propertyType.toLowerCase()} located in the prime area of ${locationString}.\n\nOffering contemporary interiors with ample natural light, this ${furnishedText.toLowerCase()} property is ideally situated close to major commercial hubs, renowned schools, and accessible public transport.\n\nFeatured Amenities:\n- ${formattedAmenities}\n- Monthly Rent: Rs. ${Number(
      price
    ).toLocaleString()}\n${
      rawNotes ? `\nAdditional Highlights:\n${rawNotes.trim()}\n` : ""
    }\nSchedule a viewing today to experience this property in person.`;

    return { title, description };
  }

  /**
   * Evaluates tenant seriousness score (0 to 100) based on message, profile, and timing.
   */
  async calculateLeadScore({
    tenantName,
    email,
    message = "",
    viewingDate,
    viewingTime,
    propertyPrice,
  }) {
    if (this.groq) {
      try {
        const systemPrompt = `You are an AI Real Estate Lead Analyst and Operations Assistant.

Your task is to evaluate a tenant's viewing request and compute a Lead Seriousness Score from 0 to 100 with a concise 1-2 sentence justification.

EVALUATION CRITERIA:
1. Intent & Message Quality (0–40 points):
   - Detailed, polite message with move-in timeline, family/job context = 35–40 pts.
   - Brief standard inquiry = 20–25 pts.
   - Blank message or single word = 10 pts.
   - Spammy / irrelevant text = 0 pts.
2. Specific Scheduling (0–30 points):
   - Specific, realistic date and time slot selected = 30 pts.
   - Generic or vague slot = 15 pts.
3. Profile & Contact Authenticity (0–30 points):
   - Verified tenant email and realistic name = 30 pts.
   - Suspicious or temporary email = 0 pts.

GUIDELINES:
- Compute the final score as an integer between 0 and 100.
- Provide a clear, objective reasoning string.
- Output MUST strictly be valid JSON matching the schema below.

JSON OUTPUT SCHEMA:
{
  "score": number,
  "reasoning": "string"
}`;

        const userContent = JSON.stringify({
          tenantName,
          email,
          message: message || "Standard viewing request",
          viewingDate: viewingDate || "Not specified",
          viewingTime: viewingTime || "Not specified",
          propertyPrice: propertyPrice ? `Rs. ${propertyPrice}` : "N/A",
        });

        const completion = await this.groq.chat.completions.create({
          model: this.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
          temperature: 0.2,
        });

        const rawContent = completion.choices[0]?.message?.content;
        const parsed = this.extractJson(rawContent);
        if (parsed && typeof parsed.score === "number" && parsed.reasoning) {
          return {
            score: Math.min(100, Math.max(0, Math.round(parsed.score))),
            reasoning: parsed.reasoning.trim(),
            evaluatedAt: new Date(),
          };
        }
      } catch (err) {
        console.error(
          "[AI SERVICE ERROR] Groq calculateLeadScore failed, falling back:",
          err.message
        );
      }
    }

    // Dynamic Fallback Evaluator
    let score = 70;
    const reasoningPoints = [];
    const trimmedMessage = (message || "").trim();

    if (trimmedMessage.length > 30) {
      score += 15;
      reasoningPoints.push("Provided a detailed and polite inquiry message");
    } else if (trimmedMessage.length > 0) {
      score += 8;
      reasoningPoints.push("Provided a brief custom message");
    } else {
      reasoningPoints.push("Standard viewing request without custom notes");
    }

    if (viewingDate && viewingTime) {
      score += 10;
      reasoningPoints.push("Selected a specific date and time slot");
    }

    if (email && !email.includes("temp") && !email.includes("fake")) {
      score += 5;
      reasoningPoints.push("Legitimate email address");
    }

    return {
      score: Math.min(100, Math.max(0, score)),
      reasoning: reasoningPoints.join(". ") + ".",
      evaluatedAt: new Date(),
    };
  }

  /**
   * Answers property-specific tenant questions strictly using listing context (Anti-Hallucination).
   */
  async answerPropertyQuestion({ propertyContext, question }) {
    if (this.groq) {
      try {
        const systemPrompt = `You are the AI Property Assistant for this specific rental listing.

Your goal is to answer tenant questions accurately, courteously, and concisely based ONLY on the provided PROPERTY CONTEXT.

STRICT RULES (Anti-Hallucination):
1. Use ONLY the facts provided in the Property Context (price, location, bedrooms, bathrooms, amenities, furnished status, description).
2. If the user asks about something NOT mentioned in the listing (e.g., "Are pets allowed?" or "Is gas available?" when not stated), politely reply:
   "That specific detail is not mentioned in the listing. You can request a property viewing or contact our team to confirm."
3. Never invent facts, prices, or amenities.
4. Keep answers friendly, conversational, and direct (2-4 sentences max).
5. Always quote the rent in the currency format provided.`;

        const contextString = `PROPERTY CONTEXT:
- Title: ${propertyContext.title || "Rental Property"}
- Type: ${propertyContext.propertyType || "Apartment"}
- Price: Rs. ${
          propertyContext.price
            ? Number(propertyContext.price).toLocaleString()
            : "N/A"
        } / month
- Location: ${propertyContext.location?.address || ""}, ${
          propertyContext.location?.city || ""
        }
- Bedrooms: ${propertyContext.bedrooms || "N/A"} | Bathrooms: ${
          propertyContext.bathrooms || "N/A"
        }
- Furnished: ${
          propertyContext.furnished
            ? "Yes (Fully Furnished)"
            : "No (Unfurnished)"
        }
- Amenities: ${
          Array.isArray(propertyContext.amenities)
            ? propertyContext.amenities.join(", ")
            : "Standard facilities"
        }
- Description: ${propertyContext.description || "N/A"}

TENANT QUESTION:
"${question}"`;

        const completion = await this.groq.chat.completions.create({
          model: this.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: contextString },
          ],
          temperature: 0.3,
          max_tokens: 350,
        });

        const answer = completion.choices[0]?.message?.content;
        if (answer && answer.trim()) {
          return {
            answer: answer.trim(),
          };
        }
      } catch (err) {
        console.error(
          "[AI SERVICE ERROR] Groq answerPropertyQuestion failed, falling back:",
          err.message
        );
      }
    }

    // Dynamic Fallback
    return {
      answer: `Based on the listing details for "${
        propertyContext.title || "this property"
      }", it features ${propertyContext.bedrooms || 0} bedrooms, ${
        propertyContext.bathrooms || 0
      } bathrooms, and offers amenities including ${
        propertyContext.amenities?.join(", ") || "standard facilities"
      }. Monthly rent is Rs. ${
        propertyContext.price
          ? Number(propertyContext.price).toLocaleString()
          : "N/A"
      }.`,
    };
  }
}

module.exports = new AIService();
