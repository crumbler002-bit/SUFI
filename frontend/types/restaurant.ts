export interface Restaurant {
  id: number;
  name: string;
  cuisine: string | null;
  city: string | null;
  address: string | null;
  rating: number | null;
  total_reviews: number | null;
  price_range: string | null;
  description: string | null;
  is_featured: boolean;
  logo_url?: string | null;
  banner_url?: string | null;
  about?: string | null;
}

export interface DiscoverResponse {
  restaurants: Restaurant[];
  total: number;
  page: number;
  limit: number;
}

export interface SearchResponse {
  query: string;
  filters: Record<string, unknown>;
  results: Restaurant[];
  total: number;
  processing_time_ms: number;
}

export interface ReviewAnalytics {
  average_rating: number;
  total_reviews: number;
  distribution: Record<string, number>;
}

export interface AnalyticsSummary {
  views: number;
  unique_visitors: number;
  search_appearances: number;
  clicks: number;
  ctr: number;
  reservations: number;
  performance_score: number;
}

export interface AnalyticsTimelineItem {
  date: string;
  views: number;
  clicks: number;
  reservations: number;
  ctr: number;
}

export interface Notification {
  id: number;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface WaitlistEntry {
  id: number;
  restaurant_id: number;
  guests: number;
  requested_time: string;
  status: string;
  created_at: string;
}

export interface PricingRule {
  id: number;
  restaurant_id: number;
  name: string;
  start_time: string;
  end_time: string;
  price_multiplier: number;
  enabled: boolean;
}
