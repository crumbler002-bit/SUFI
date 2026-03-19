// POST /concierge/chat response
export interface ConciergeResponse {
  session_id: string;
  reply: string;
  intent: "booking" | "recommendation" | "availability" | "cancel" | "general";
  entities: {
    party_size?: number;
    time_str?: string;
    date_str?: string;
    cuisine?: string;
    city?: string;
    price_limit?: number;
  };
  restaurants: ConciergeRestaurant[];
  suggestions: ReservationSuggestion[];
  action?: BookingAction | null;
  needs_input?: string | null;
  history: ConversationMessage[];
}

export interface ConciergeRestaurant {
  id: number;
  name: string;
  cuisine: string | null;
  rating: number | null;
  city: string | null;
  address: string | null;
  price_range: string | null;
  match_reasons: string[];
}

export interface ReservationSuggestion {
  date: string;
  date_full: string;
  time: string;
  available: boolean;
  recommended: boolean;
}

export interface BookingAction {
  status: "booked" | "waitlisted" | "error";
  reservation_id?: number;
  waitlist_id?: number;
  restaurant_id?: number;
  reservation_time?: string;
  guests?: number;
  table_id?: number;
  message?: string;
}

export interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}
