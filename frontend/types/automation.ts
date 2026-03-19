// Matches GET /automation/status (used in dashboard)
export interface AutomationStatus {
  auto_overbooking: boolean;
  auto_reschedule: boolean;
  auto_cancel: boolean;
}

// Matches GET /automation/active
export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  revenue_impact: string;
  runs_this_week: number;
  success_rate: number;
  enabled: boolean;
}

// Matches GET /automation/planned
export interface PlannedAction {
  id: string;
  action: string;
  scheduled_time: string;
  revenue_impact: string;
  dot_color: string;
}
