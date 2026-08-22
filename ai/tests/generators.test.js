/** * Generator tests */ const MockProvider = require("../src/providers/mock-provider");
const TitleGenerator = require("../src/generators/title-generator");
const DescriptionGenerator = require("../src/generators/description-generator");
const { ValidationError } = require("../src/errors");
describe("Generators", () => {
  let provider;
  const validProperty = {
    propertyType: "Apartment",
    price: 2000,
    location: "Downtown",
    bedrooms: 2,
    bathrooms: 1,
    amenities: ["Parking", "Gym"],
    furnished: true,
  };
  beforeEach(() => {
    provider = new MockProvider({ mockDelayMs: 0 });
  });
  describe("TitleGenerator", () => {
    it("should generate a title", async () => {
      const generator = new TitleGenerator(provider);
      const result = await generator.generate(validProperty);
      expect(result).toHaveProperty("title");
      expect(typeof result.title).toBe("string");
      expect(result.title.length).toBeGreaterThan(0);
      expect(result).toHaveProperty("model");
      expect(result).toHaveProperty("usage");
    });
    it("should validate property input", async () => {
      const generator = new TitleGenerator(provider);
      await expect(generator.generate({})).rejects.toThrow(ValidationError);
      await expect(generator.generate(null)).rejects.toThrow(ValidationError);
    });
    it("should use provider for generation", async () => {
      const generator = new TitleGenerator(provider);
      const result = await generator.generate(validProperty);
      expect(result.model).toBe("mock");
    });
  });
  describe("DescriptionGenerator", () => {
    it("should generate a description", async () => {
      const generator = new DescriptionGenerator(provider);
      const result = await generator.generate(validProperty);
      expect(result).toHaveProperty("description");
      expect(typeof result.description).toBe("string");
      expect(result.description.length).toBeGreaterThan(0);
      expect(result).toHaveProperty("model");
      expect(result).toHaveProperty("usage");
    });
    it("should validate property input", async () => {
      const generator = new DescriptionGenerator(provider);
      await expect(generator.generate({})).rejects.toThrow(ValidationError);
      await expect(generator.generate(null)).rejects.toThrow(ValidationError);
    });
    it("should use provider for generation", async () => {
      const generator = new DescriptionGenerator(provider);
      const result = await generator.generate(validProperty);
      expect(result.model).toBe("mock");
    });
    it("should include property details in description", async () => {
      const generator = new DescriptionGenerator(provider);
      const result = await generator.generate(validProperty);
      expect(result.description).toContain("Apartment");
      expect(result.description).toContain("Downtown");
    });
  });
  describe("Integration", () => {
    it("should generate title and description together", async () => {
      const titleGen = new TitleGenerator(provider);
      const descGen = new DescriptionGenerator(provider);
      const [titleResult, descResult] = await Promise.all([
        titleGen.generate(validProperty),
        descGen.generate(validProperty),
      ]);
      expect(titleResult.title).toBeDefined();
      expect(descResult.description).toBeDefined();
    });
    it("should work with different property types", async () => {
      const houseProperty = {
        ...validProperty,
        propertyType: "House",
        bedrooms: 4,
        bathrooms: 3,
      };
      const generator = new TitleGenerator(provider);
      const result = await generator.generate(houseProperty);
      expect(result.title).toContain("House");
    });
  });
});
