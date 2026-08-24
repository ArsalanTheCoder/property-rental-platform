import { apiRequest } from "./config";

// Property-specific AI chatbot (RFC-003-B section 6.2). Each answer
// is grounded in that property's own details. Questions and answers
// are not saved by the backend, so nothing here persists beyond the
// current screen.
export async function askPropertyQuestion(propertyId: string, question: string): Promise<string> {
  const { answer } = await apiRequest<{ propertyId: string; question: string; answer: string }>(
    `/properties/${propertyId}/chat`,
    {
      method: "POST",
      body: JSON.stringify({ question }),
    }
  );
  return answer;
}
