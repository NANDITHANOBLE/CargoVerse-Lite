from pydantic import BaseModel


class AdminAnalytics(BaseModel):
    total_revenue: float
    providers: int
    bookings: int
    pending_approvals: int
    occupancy_rate: float

class ProviderAnalytics(BaseModel):
    revenue: float
    available_capacity_cbm: float
    total_bookings: int
    customer_rating: float

class TraderAnalytics(BaseModel):
    bookings: int
    expenses: float
    active_shipments: int
    saved_cost_estimate: float
