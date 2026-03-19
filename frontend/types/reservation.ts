// POST /reservations/auto-create body
export interface ReservationPayload {
  restaurant_id: number;
  reservation_time: string; // ISO datetime
  guests: number;
  duration_minutes?: number;
}

// POST /reservations/create body (with explicit table)
export interface ReservationCreatePayload {
  restaurant_id: number;
  table_id: number;
  reservation_time: string;
  guests: number;
}

// Reservation response
export interface Reservation {
  reservation_id: number;
  restaurant_id: number;
  table_id: number;
  reservation_time: string;
  guests: number;
  status: string;
  auto_assigned?: boolean;
}

// Waitlisted response
export interface WaitlistResult {
  status: "waitlisted";
  waitlist_id: number;
  restaurant_id: number;
  requested_time: string;
  guests: number;
}

// User dashboard reservation
export interface UserReservation {
  id: number;
  restaurant_id: number;
  restaurant_name: string | null;
  restaurant_cuisine: string | null;
  restaurant_address: string | null;
  table_id: number;
  reservation_time: string | null;
  guests: number;
  status: string;
  created_at: string | null;
  can_cancel: boolean;
}

export interface UserDashboard {
  user_id: string;
  upcoming: UserReservation[];
  history: UserReservation[];
  total_upcoming: number;
  total_history: number;
}
