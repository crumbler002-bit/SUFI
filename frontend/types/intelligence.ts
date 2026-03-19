// Matches GET /owner/intelligence/dashboard/{restaurant_id}
export interface IntelligenceDashboard {
  date: string;
  metrics: {
    total_reservations: number;
    total_tables: number;
    noshow_rate: number;
    fill_ratio: number;
    demand_level: "low" | "medium" | "high";
  };
  analytics: {
    profile_views: number;
    clicks: number;
    search_appearances: number;
  };
  predictions: {
    expected_demand: number;
    predicted_revenue: number;
    recommended_overbooking: number;
    revenue_at_risk: number;
    waitlist_fill_potential: number;
    hourly_demand: Record<string, number>;
    predicted_hourly_demand: Record<string, number>;
  };
  optimization: {
    efficiency_score: number;
    active_tables: number;
    idle_tables: number;
    avg_utilization_pct: number;
    best_fit_score: number;
    table_suggestion: string;
    layout_suggestion: string;
  };
  waitlist: {
    waiting: number;
    assigned_today: number;
    conversion_rate: number;
    recommended_to_notify: number;
  };
  priority: {
    ranked: PriorityReservation[];
    at_risk_count: number;
    protected_count: number;
  };
  insights: string[];
}

export interface PriorityReservation {
  id: number;
  reservation_time: string | null;
  guests: number;
  priority_score: number;
  priority_label: "low" | "medium" | "high" | "vip";
  noshow_probability: number;
  is_vip: boolean;
}

// Matches GET /owner/intelligence/ml/recommend/{restaurant_id}
export interface MLRecommendation {
  restaurant_id: number;
  slot: { hour: number; day_of_week: number };
  action: "overbook" | "promote" | "normal";
  confidence: "high" | "medium" | "low";
  explanation: string;
  signals: {
    noshow_probability: number;
    noshow_risk: "high" | "medium" | "low";
    predicted_demand: number;
    demand_source: "ml_model" | "moving_average";
    recommended_overbooking: number;
    expected_revenue: number;
    effective_covers: number;
  };
}

// Matches GET /owner/intelligence/automation/history/{restaurant_id}
export interface AutomationHistoryItem {
  id: number;
  type: string;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  executed_at: string | null;
}

// Legacy shape kept for fallback mock
export interface IntelligenceData {
  revenue: number;
  predicted_revenue: number;
  demand: number[];
  risk: string[];
  recommendations: string[];
  explanation: string;
  no_show_risk: number;
  efficiency: number;
}
