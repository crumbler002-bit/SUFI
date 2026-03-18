import { apiRequest } from "../lib/api";

export const chatWithConcierge = (query: string, history: { role: string; content: string }[] = []) =>
  apiRequest("/concierge/chat", {
    method: "POST",
    body: JSON.stringify({ query, history }),
  });
