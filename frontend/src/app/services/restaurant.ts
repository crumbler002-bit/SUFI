import { apiRequest } from "../lib/api";

export const getRestaurants = () => apiRequest("/restaurants/discover");
export const getRestaurant = (id: string | number) => apiRequest(`/restaurants/${id}`);
export const getTrending = () => apiRequest("/restaurants/trending");
export const getRecommendations = () => apiRequest("/recommendations/personalized");
export const vectorSearch = (query: string) =>
  apiRequest(`/restaurants/vector-search?query=${encodeURIComponent(query)}`);
