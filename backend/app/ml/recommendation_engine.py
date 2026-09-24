"""
Container Recommendation Engine.

Scores candidate containers on a composite value combining price,
transit time, distance, provider trust score, and available capacity.

Currently uses a heuristic scorer (weighted formula) since no historical
booking/satisfaction data exists yet to train a supervised model.
Once enough booking history accumulates, `train()` can be called with
real data to switch to the XGBoost-based model automatically.
"""

import pandas as pd
from xgboost import XGBRegressor
from sklearn.preprocessing import StandardScaler

FEATURES = ["price_per_cbm", "transit_days", "trust_score", "available_space_cbm"]

class ContainerRecommender:
    def __init__(self):
        self.model = XGBRegressor(n_estimators=150, max_depth=4, learning_rate=0.08)
        self.scaler = StandardScaler()
        self.is_trained = False

    def train(self, df: pd.DataFrame, label_col: str = "satisfaction_score"):
        X = self.scaler.fit_transform(df[FEATURES])
        y = df[label_col]
        self.model.fit(X, y)
        self.is_trained = True

    def rank(self, candidates: pd.DataFrame) -> pd.DataFrame:
        candidates = candidates.copy()
        if self.is_trained:
            X = self.scaler.transform(candidates[FEATURES])
            candidates["value_score"] = self.model.predict(X)
        else:
            candidates["value_score"] = candidates.apply(heuristic_score, axis=1)
        return candidates.sort_values("value_score", ascending=False)

def heuristic_score(row) -> float:
    """
    Weighted scoring formula (higher is better):
    - Lower price is better (35% weight)
    - Shorter transit time is better (25% weight)
    - Higher trust score is better (25% weight)
    - More available space is better (15% weight)
    """
    price_score = 1 / (row["price_per_cbm"] + 1)
    speed_score = 1 / (row["transit_days"] + 1)
    trust_score = row["trust_score"] / 10
    capacity_score = min(row["available_space_cbm"] / 100, 1)

    return (
        price_score * 0.35
        + speed_score * 0.25
        + trust_score * 0.25
        + capacity_score * 0.15
    )

recommender = ContainerRecommender()

def recommend_best(candidates: list[dict], current_choice_id: str) -> dict:
    df = pd.DataFrame(candidates)
    ranked = recommender.rank(df)

    best = ranked.iloc[0]
    current = df[df["container_id"] == current_choice_id].iloc[0]

    savings = round(float(current["price_per_cbm"] - best["price_per_cbm"]), 2)
    faster_by_days = round(float(current["transit_days"] - best["transit_days"]), 1)

    return {
        "best_container_id": best["container_id"],
        "value_score": round(float(best["value_score"]), 4),
        "savings_per_cbm": savings,
        "faster_by_days": faster_by_days,
        "is_current_already_best": best["container_id"] == current_choice_id,
    }