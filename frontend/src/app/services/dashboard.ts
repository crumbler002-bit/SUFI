import { apiRequest } from "../lib/api";

export const getOwnerReservations = () => apiRequest("/owner/reservations");
export const getOwnerRestaurants = () => apiRequest("/owner/restaurants");
export const getAnalytics = () => apiRequest("/owner/analytics");
export const getAnalyticsHeatmap = () => apiRequest("/owner/analytics/heatmap");
export const updateReservationStatus = (id: number, status: string) =>
  apiRequest(`/owner/reservations/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
