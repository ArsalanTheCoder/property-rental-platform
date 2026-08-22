/** * Validation tests */ const {
  validatePropertyInput,
  validateChatRequest,
  validateLeadScoreInput,
} = require("../src/validation");
const { ValidationError } = require("../src/errors");
describe("Validation", () => {
  const validProperty = {
    propertyType: "Apartment",
    price: 2000,
    location: "Downtown",
    bedrooms: 2,
    bathrooms: 1,
    amenities: ["Parking", "Gym"],
    furnished: true,
  };
  describe("validatePropertyInput", () => {
    it("should pass with valid property input", () => {
      expect(validatePropertyInput(validProperty)).toBe(true);
    });
    it("should fail if property is not an object", () => {
      expect(() => validatePropertyInput(null)).toThrow(ValidationError);
      expect(() => validatePropertyInput("string")).toThrow(ValidationError);
    });
    it("should fail if propertyType is missing or empty", () => {
      expect(() =>
        validatePropertyInput({ ...validProperty, propertyType: "" }),
      ).toThrow(ValidationError);
      expect(() =>
        validatePropertyInput({ ...validProperty, propertyType: null }),
      ).toThrow(ValidationError);
    });
    it("should fail if price is missing or not positive", () => {
      expect(() =>
        validatePropertyInput({ ...validProperty, price: 0 }),
      ).toThrow(ValidationError);
      expect(() =>
        validatePropertyInput({ ...validProperty, price: -100 }),
      ).toThrow(ValidationError);
      expect(() =>
        validatePropertyInput({ ...validProperty, price: null }),
      ).toThrow(ValidationError);
    });
    it("should fail if location is missing or empty", () => {
      expect(() =>
        validatePropertyInput({ ...validProperty, location: "" }),
      ).toThrow(ValidationError);
      expect(() =>
        validatePropertyInput({ ...validProperty, location: null }),
      ).toThrow(ValidationError);
    });
    it("should fail if bedrooms is not a non-negative integer", () => {
      expect(() =>
        validatePropertyInput({ ...validProperty, bedrooms: -1 }),
      ).toThrow(ValidationError);
      expect(() =>
        validatePropertyInput({ ...validProperty, bedrooms: 1.5 }),
      ).toThrow(ValidationError);
      expect(() =>
        validatePropertyInput({ ...validProperty, bedrooms: null }),
      ).toThrow(ValidationError);
    });
    it("should fail if bathrooms is not a non-negative integer", () => {
      expect(() =>
        validatePropertyInput({ ...validProperty, bathrooms: -1 }),
      ).toThrow(ValidationError);
      expect(() =>
        validatePropertyInput({ ...validProperty, bathrooms: 1.5 }),
      ).toThrow(ValidationError);
      expect(() =>
        validatePropertyInput({ ...validProperty, bathrooms: null }),
      ).toThrow(ValidationError);
    });
    it("should fail if amenities is not an array", () => {
      expect(() =>
        validatePropertyInput({ ...validProperty, amenities: "string" }),
      ).toThrow(ValidationError);
      expect(() =>
        validatePropertyInput({ ...validProperty, amenities: null }),
      ).toThrow(ValidationError);
    });
    it("should fail if furnished is not a boolean", () => {
      expect(() =>
        validatePropertyInput({ ...validProperty, furnished: "yes" }),
      ).toThrow(ValidationError);
      expect(() =>
        validatePropertyInput({ ...validProperty, furnished: null }),
      ).toThrow(ValidationError);
    });
    it("should pass with empty amenities array", () => {
      expect(validatePropertyInput({ ...validProperty, amenities: [] })).toBe(
        true,
      );
    });
    it("should pass with zero bedrooms", () => {
      expect(validatePropertyInput({ ...validProperty, bedrooms: 0 })).toBe(
        true,
      );
    });
  });
  describe("validateChatRequest", () => {
    const validRequest = {
      propertyId: "prop-123",
      property: validProperty,
      question: "What is the rent?",
    };
    it("should pass with valid chat request", () => {
      expect(validateChatRequest(validRequest)).toBe(true);
    });
    it("should fail if request is not an object", () => {
      expect(() => validateChatRequest(null)).toThrow(ValidationError);
    });
    it("should fail if propertyId is missing", () => {
      expect(() =>
        validateChatRequest({ ...validRequest, propertyId: "" }),
      ).toThrow(ValidationError);
    });
    it("should fail if property is invalid", () => {
      expect(() =>
        validateChatRequest({ ...validRequest, property: {} }),
      ).toThrow(ValidationError);
    });
    it("should fail if question is missing", () => {
      expect(() =>
        validateChatRequest({ ...validRequest, question: "" }),
      ).toThrow(ValidationError);
    });
    it("should fail if question exceeds 500 characters", () => {
      const longQuestion = "a".repeat(501);
      expect(() =>
        validateChatRequest({ ...validRequest, question: longQuestion }),
      ).toThrow(ValidationError);
    });
    it("should pass with question exactly 500 characters", () => {
      const maxQuestion = "a".repeat(500);
      expect(
        validateChatRequest({ ...validRequest, question: maxQuestion }),
      ).toBe(true);
    });
    it("should fail if conversationHistory has more than 10 messages", () => {
      const history = Array(11).fill({ role: "user", content: "test" });
      expect(() =>
        validateChatRequest({ ...validRequest, conversationHistory: history }),
      ).toThrow(ValidationError);
    });
    it("should fail if conversationHistory message has invalid role", () => {
      const history = [{ role: "invalid", content: "test" }];
      expect(() =>
        validateChatRequest({ ...validRequest, conversationHistory: history }),
      ).toThrow(ValidationError);
    });
    it("should fail if conversationHistory message has empty content", () => {
      const history = [{ role: "user", content: "" }];
      expect(() =>
        validateChatRequest({ ...validRequest, conversationHistory: history }),
      ).toThrow(ValidationError);
    });
    it("should pass with valid conversation history", () => {
      const history = [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi there!" },
      ];
      expect(
        validateChatRequest({ ...validRequest, conversationHistory: history }),
      ).toBe(true);
    });
  });
  describe("validateLeadScoreInput", () => {
    const validInput = { propertyId: "prop-123", userId: "user-456" };
    it("should pass with valid lead score input", () => {
      expect(validateLeadScoreInput(validInput)).toBe(true);
    });
    it("should fail if input is not an object", () => {
      expect(() => validateLeadScoreInput(null)).toThrow(ValidationError);
    });
    it("should fail if propertyId is missing", () => {
      expect(() =>
        validateLeadScoreInput({ ...validInput, propertyId: "" }),
      ).toThrow(ValidationError);
    });
    it("should fail if userId is missing", () => {
      expect(() =>
        validateLeadScoreInput({ ...validInput, userId: "" }),
      ).toThrow(ValidationError);
    });
    it("should pass with optional fields", () => {
      const inputWithOptionals = {
        ...validInput,
        viewingDate: "2024-01-15",
        viewingTime: "10:00 AM",
        message: "I am interested in this property",
        userProfile: { name: "John", email: "john@example.com" },
      };
      expect(validateLeadScoreInput(inputWithOptionals)).toBe(true);
    });
    it("should fail if message exceeds 1000 characters", () => {
      const longMessage = "a".repeat(1001);
      expect(() =>
        validateLeadScoreInput({ ...validInput, message: longMessage }),
      ).toThrow(ValidationError);
    });
    it("should pass with message exactly 1000 characters", () => {
      const maxMessage = "a".repeat(1000);
      expect(
        validateLeadScoreInput({ ...validInput, message: maxMessage }),
      ).toBe(true);
    });
  });
});
