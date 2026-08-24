// Formats a number as PKR currency, e.g. 85000 -> "PKR 85,000".
export function formatPrice(amount: number): string {
  return `PKR ${amount.toLocaleString("en-PK")}`;
}

// Formats an ISO date string into something readable, e.g. "18 Aug 2026".
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
