"""
Revenue Optimizer
Computes expected revenue accounting for no-show probability per reservation.

expected_revenue = Σ (avg_spend × (1 - P(no_show_i)))  for each future reservation

Also computes optimal overbooking count to maximize expected covers.
"""


def expected_revenue(
    demand_per_hour: dict[str, float],
    noshow_probs: dict[str, float],
    avg_spend: int = 500,
) -> dict:
    """
    demand_per_hour  : {hour_str: predicted_covers}
    noshow_probs     : {hour_str: P(no_show)} — from ML model or historical rate
    avg_spend        : average spend per cover in ₹

    Returns revenue breakdown per hour + total.
    """
    breakdown: dict[str, dict] = {}
    total_revenue = 0.0
    total_effective_covers = 0.0

    for hour, demand in demand_per_hour.items():
        p_noshow = noshow_probs.get(hour, 0.0)
        effective = demand * (1.0 - p_noshow)
        revenue = effective * avg_spend

        breakdown[hour] = {
            "predicted_covers": round(demand, 2),
            "noshow_probability": round(p_noshow, 3),
            "effective_covers": round(effective, 2),
            "expected_revenue": round(revenue, 2),
        }

        total_revenue += revenue
        total_effective_covers += effective

    return {
        "total_expected_revenue": round(total_revenue, 2),
        "total_effective_covers": round(total_effective_covers, 2),
        "hourly_breakdown": breakdown,
    }


def optimal_overbooking(
    total_capacity: int,
    noshow_rate: float,
    safety_factor: float = 0.8,
) -> int:
    """
    How many extra reservations to accept beyond capacity,
    given the expected no-show rate.

    safety_factor < 1.0 makes the recommendation conservative.
    """
    if noshow_rate <= 0 or total_capacity <= 0:
        return 0
    return max(0, round(total_capacity * noshow_rate * safety_factor))
