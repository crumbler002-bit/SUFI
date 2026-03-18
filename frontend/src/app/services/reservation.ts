import { apiRequest } from "../lib/api";

export const searchAvailability = (location: string, date: string, time: string, guests: number) =>
  apiRequest("/reservations/search", {
    method: "POST",
    body: JSON.stringify({ location, date, time, guests }),
  });

export const autoCreateReservation = (
  restaurant_id: number,
  reservation_time: string,
  guests: number,
  duration_minutes = 90
) =>
  apiRequest("/reservations/auto-create", {
    method: "POST",
    body: JSON.stringify({ restaurant_id, reservation_time, guests, duration_minutes }),
  });

export const getMyReservations = () => apiRequest("/reservations/my");

export const cancelReservation = (id: number) =>
  apiRequest(`/reservations/cancel/${id}`, { method: "DELETE" });

export const joinWaitlist = (
  restaurant_id: number,
  guests: number,
  requested_time: string,
  duration_minutes = 90
) =>
  apiRequest("/waitlist/join", {
    method: "POST",
    body: JSON.stringify({ restaurant_id, guests, requested_time, duration_minutes }),
  });
