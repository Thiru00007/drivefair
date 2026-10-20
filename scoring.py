"""Transparent demo scoring and premium calculations for DriveFair."""

from __future__ import annotations

from collections.abc import Mapping

BASE_SCORE = 95
SCORE_PENALTIES = {
    "hard_brakes": 16,
    "rapid_acceleration": 8,
    "sharp_turns": 10,
    "night_driving": 4,
}

PLAN_NAMES = {
    "mile": "Pay per mile",
    "journey": "Pay per journey",
    "monthly": "Predictable monthly",
}

DEFAULT_RATES = {
    "base": 48.00,
    "per_mile": 0.059,
    "per_journey": 1.20,
    "monthly": 79.00,
    "safe_driver_reward": 6.00,
}


def score_trip(signals: Mapping[str, object]) -> int:
    """Return the illustrative 0–100 trip score from the supplied event counts."""
    deductions = 0
    for signal, penalty in SCORE_PENALTIES.items():
        value = signals.get(signal, False if signal == "night_driving" else 0)
        if signal == "night_driving":
            deductions += penalty if value is True else 0
            continue
        if isinstance(value, bool) or not isinstance(value, int) or value < 0:
            raise ValueError(f"{signal} must be a non-negative integer")
        deductions += value * penalty
    return max(0, min(100, BASE_SCORE - deductions))


def average_score(trips: list[Mapping[str, object]]) -> int:
    """Calculate the rounded mean score, returning the starting score if empty."""
    if not trips:
        return BASE_SCORE
    return round(sum(int(trip["score"]) for trip in trips) / len(trips))


def score_adjustment(score: int) -> float:
    """Calculate the disclosed score adjustment, capped from −$4 to +$8."""
    raw_adjustment = (85 - score) * 0.15
    return round(max(-4.0, min(8.0, raw_adjustment)), 2)


def estimate_premium(
    plan: str,
    mileage: float,
    trip_count: int,
    trip_average: int,
) -> dict[str, float | int | str]:
    """Return the itemized illustrative monthly estimate for a selected plan."""
    if plan not in PLAN_NAMES:
        raise ValueError("plan must be one of: mile, journey, monthly")
    if mileage < 0 or trip_count < 0 or not 0 <= trip_average <= 100:
        raise ValueError("mileage, trip count, or average score is out of range")

    adjustment = score_adjustment(trip_average)
    if plan == "journey":
        base = DEFAULT_RATES["base"]
        usage = trip_count * DEFAULT_RATES["per_journey"]
        usage_label = f"{trip_count} trips × ${DEFAULT_RATES['per_journey']:.2f}"
    elif plan == "monthly":
        base = DEFAULT_RATES["monthly"]
        usage = 0.0
        usage_label = "Included in monthly rate"
    else:
        base = DEFAULT_RATES["base"]
        usage = mileage * DEFAULT_RATES["per_mile"]
        usage_label = f"{mileage:g} mi × ${DEFAULT_RATES['per_mile']:.3f}"

    reward = DEFAULT_RATES["safe_driver_reward"]
    total = max(0.0, base + usage + adjustment - reward)
    return {
        "plan": PLAN_NAMES[plan],
        "base": round(base, 2),
        "usage": round(usage, 2),
        "usage_label": usage_label,
        "score_adjustment": adjustment,
        "average_score": trip_average,
        "reward": reward,
        "total": round(total, 2),
    }
