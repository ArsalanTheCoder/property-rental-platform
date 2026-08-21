const { createAiService } = require("@property-rental/ai");

// Initialize the AI service once at module load (env-driven: AI_MODE selects provider)
const ai = createAiService();

class AIService {
  /**
   * Generates a marketing title and professional listing description.
   * Wraps ai.generateContent(raw) from @property-rental/ai.
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
    const result = await ai.generateContent({
      propertyType,
      price: Number(price),
      location: address ? `${address}, ${city}` : city,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      amenities: Array.isArray(amenities) ? amenities : [amenities],
      furnished: Boolean(furnished),
      notes: rawNotes || undefined,
    });
    return { title: result.title, description: result.description };
  }

  /**
   * Evaluates tenant seriousness score (0–100).
   * Wraps ai.scoreLead(context) from @property-rental/ai.
   */
  async calculateLeadScore({
    tenantName,
    email,
    message = "",
    viewingDate,
    viewingTime,
    propertyPrice,
    favoritesCount,
    priorViewingCount,
  }) {
    const result = await ai.scoreLead({
      userName: tenantName || undefined,
      message: message || undefined,
      date: viewingDate || undefined,
      time: viewingTime || undefined,
      propertyPrice: propertyPrice ? Number(propertyPrice) : undefined,
      favoritesCount: Number.isFinite(favoritesCount) ? favoritesCount : undefined,
      priorViewingCount: Number.isFinite(priorViewingCount) ? priorViewingCount : undefined,
    });

    return {
      score: result.score,
      reasoning: result.summary || "Lead score evaluated by AI",
      evaluatedAt: new Date(),
    };
  }

  /**
   * Answers property-specific tenant questions using listing context.
   * Wraps ai.answerQuestion(property, question) from @property-rental/ai.
   */
  async answerPropertyQuestion({ propertyContext, question }) {
    // Map MongoDB property document to the flat PropertyContext shape
    // expected by the AI package
    const property = {
      propertyId: propertyContext._id
        ? propertyContext._id.toString()
        : propertyContext.propertyId,
      title: propertyContext.title,
      description: propertyContext.description,
      propertyType: propertyContext.propertyType,
      price: propertyContext.price,
      location:
        propertyContext.location && typeof propertyContext.location === "object"
          ? `${propertyContext.location.address || ""}, ${propertyContext.location.city || ""}`.trim()
          : propertyContext.location,
      bedrooms: propertyContext.bedrooms,
      bathrooms: propertyContext.bathrooms,
      amenities: propertyContext.amenities,
      furnished: propertyContext.furnished,
      availability: propertyContext.availability,
      status: propertyContext.status,
    };

    const result = await ai.answerQuestion(property, question);
    return { answer: result.answer };
  }
}

module.exports = new AIService();
