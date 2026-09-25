"""
Dynamic Pricing Prediction.

Predicts whether cargo prices for a given route/cargo type are likely
to RISE, FALL, or stay STABLE, and recommends whether the trader should
book now or wait.

Currently uses a heuristic scoring formula (weighted rules) since no
historical price-history dataset exists yet to train a supervised
RandomForestClassifier. Once real price history accumulates, `train()`
can be called to switch to the trained model automatically.
"""

import pandas as pd
from sklearn.ensemble import RandomForestClassifier

FEATURES = ["demand_index", "season_factor", "distance_km", "days_to_departure"]

class DynamicPricingPredictor:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=200, max_depth=6, random_state=42)
        self.is_trained = False

    def train(self, df: pd.DataFrame, label_col: str = "price_trend"):
        self.model.fit(df[FEATURES], df[label_col])
        self.is_trained = True

    def predict(self, features: dict) -> dict:
        if self.is_trained:
            X = pd.DataFrame([features])[FEATURES]
            pred = self.model.predict(X)[0]
            proba = dict(zip(self.model.classes_, self.model.predict_proba(X)[0], strict=True))
            confidence = round(float(max(proba.values())), 2)
        else:
            pred, confidence = heuristic_predict(features)

        recommendation = {
            "rise": "Book Now - prices are expected to increase",
            "fall": "Wait - prices are expected to decrease",
            "stable": "Book Anytime - prices are expected to stay stable",
        }[pred]

        return {
            "trend": pred,
            "confidence": confidence,
            "recommendation": recommendation,
        }

def heuristic_predict(features: dict) -> tuple[str, float]:
    """
    Weighted rule-based heuristic:
    - High demand_index (0-100) pushes prices up
    - Peak season_factor (0-1, where 1 = peak season) pushes prices up
    - Longer distance amplifies volatility slightly
    - Fewer days_to_departure (booking last-minute) pushes prices up
    """
    demand_index = features.get("demand_index", 50)
    season_factor = features.get("season_factor", 0.5)
    days_to_departure = features.get("days_to_departure", 30)

    urgency_score = max(0, (30 - days_to_departure) / 30)

    pressure = (
        (demand_index / 100) * 0.45
        + season_factor * 0.35
        + urgency_score * 0.20
    )

    if pressure >= 0.65:
        return "rise", round(0.60 + (pressure - 0.65) * 0.8, 2)
    elif pressure <= 0.35:
        return "fall", round(0.60 + (0.35 - pressure) * 0.8, 2)
    else:
        return "stable", round(0.55 + abs(0.5 - pressure) * 0.3, 2)

predictor = DynamicPricingPredictor()
