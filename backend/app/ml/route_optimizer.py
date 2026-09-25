"""
Route Optimization.

Compares the trader's current route (e.g. direct road, or direct sea)
against multimodal alternatives (e.g. Road -> Rail -> Sea) using static
cost/speed reference tables per transport leg, and recommends whichever
option minimizes cost while highlighting any time tradeoff.

Reference rates are illustrative defaults for this prototype and should
be replaced with real carrier rate cards in production.
"""

MODE_COST_PER_KG_PER_1000KM = {
    "road": 12,
    "rail": 7,
    "sea": 4,
    "air": 45,
}

MODE_DAYS_PER_1000KM = {
    "road": 1.2,
    "rail": 1.5,
    "sea": 4.0,
    "air": 0.3,
}

def evaluate_route(legs: list[tuple[str, float]]) -> tuple[float, float]:
    total_cost = 0.0
    total_days = 0.0
    for mode, distance_km in legs:
        total_cost += MODE_COST_PER_KG_PER_1000KM[mode] * (distance_km / 1000)
        total_days += MODE_DAYS_PER_1000KM[mode] * (distance_km / 1000)
    return round(total_cost, 2), round(total_days, 2)

def build_candidate_routes(distance_km: float) -> dict[str, list[tuple[str, float]]]:
    return {
        "direct_road": [("road", distance_km)],
        "direct_sea": [("sea", distance_km)],
        "direct_air": [("air", distance_km)],
        "road_rail_sea": [
            ("road", distance_km * 0.05),
            ("rail", distance_km * 0.25),
            ("sea", distance_km * 0.70),
        ],
        "road_sea": [
            ("road", distance_km * 0.10),
            ("sea", distance_km * 0.90),
        ],
        "road_rail": [
            ("road", distance_km * 0.15),
            ("rail", distance_km * 0.85),
        ],
    }

def optimize_route(distance_km: float, current_mode: str) -> dict:
    current_route = [(current_mode, distance_km)]
    current_cost, current_days = evaluate_route(current_route)

    candidates = build_candidate_routes(distance_km)

    options = []
    for name, legs in candidates.items():
        cost, days = evaluate_route(legs)
        options.append({
            "route": name,
            "cost_per_kg": cost,
            "transit_days": days,
        })

    best = min(options, key=lambda r: r["cost_per_kg"])

    cost_reduced_pct = 0.0
    if current_cost > 0:
        cost_reduced_pct = round(max((current_cost - best["cost_per_kg"]) / current_cost * 100, 0), 1)

    delivery_faster_days = round(max(current_days - best["transit_days"], 0), 1)
    delivery_slower_days = round(max(best["transit_days"] - current_days, 0), 1)

    return {
        "current_route": current_mode,
        "current_cost_per_kg": current_cost,
        "current_transit_days": current_days,
        "best_route": best["route"],
        "best_cost_per_kg": best["cost_per_kg"],
        "best_transit_days": best["transit_days"],
        "cost_reduced_pct": cost_reduced_pct,
        "delivery_faster_days": delivery_faster_days,
        "delivery_slower_days": delivery_slower_days,
        "all_options": sorted(options, key=lambda r: r["cost_per_kg"]),
    }