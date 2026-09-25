# 🚢 CargoVerse AI Lite

<div align="center">

### AI-Powered Cargo Space Sharing Marketplace for SMEs & Exporters

**"Uber for Cargo Space"**

A real-time cargo space sharing platform that enables businesses to book only the cargo capacity they need, while logistics providers monetize unused transportation capacity through an intelligent AI-driven marketplace.

![Status](https://img.shields.io/badge/Status-Active-FastAPI](https://img.shields.io/badge/FastAPI9688
![Python](https://img.shields.io/badge/Python-3.10+-Powered](https://img.shields.io/badge/AI-Powered-orange(https://img.shields.io/badge/WebSocketsrple
![License](https://img.shields.io/badge/License-Portfoliov>

---

# 🌍 Problem Statement

Global logistics often suffers from inefficient cargo utilization.

Small and medium-sized exporters frequently pay for entire containers despite requiring only a fraction of the available space. Simultaneously, logistics providers operate with partially filled containers, resulting in lost revenue and underutilized transportation assets.

CargoVerse AI Lite solves this challenge by creating an intelligent cargo-sharing marketplace where:

- Traders book only the space they need
- Providers monetize unused cargo capacity
- AI recommends optimal shipment options
- Real-time systems maintain operational visibility
- Smart pricing and route optimization improve efficiency

---

# 🎯 Vision

To build a next-generation logistics ecosystem where cargo space becomes a shared, intelligent, and optimally utilized digital resource.

---

# ✨ Key Features

## 🔐 Authentication & Authorization

- JWT-based authentication
- Secure password hashing with bcrypt
- Role-based access control
- Protected API endpoints
- User session management

### Supported Roles

- Admin
- Provider
- Trader

---

## 🏢 Provider Verification Workflow

To ensure platform trust and service quality, logistics providers undergo a structured verification process.

### Weighted Inspection Scoring

| Component | Weight |
|------------|---------|
| Documents Verification | 30% |
| Infrastructure Assessment | 30% |
| Compliance Check | 20% |
| Fleet Evaluation | 20% |

### Approval Logic

```text
Score >= 80
      ↓
 Approved

Score < 80
      ↓
 Rejected
```

### Benefits

- Maintains marketplace reliability
- Enhances customer trust
- Reduces fraudulent listings
- Improves shipment quality

---

## 🚛 Cargo Space Management

Providers can publish transportation capacity across multiple transportation modes.

### Supported Transport Types

- 🚢 Sea Cargo
- 🚛 Road Freight
- 🚂 Rail Freight
- ✈️ Air Cargo

### Listing Information

- Route Details
- Cargo Type
- Capacity
- Available Space
- Transit Duration
- Pricing
- Shipment Schedule

---

## 🛒 Cargo Marketplace

A searchable marketplace where traders discover available cargo opportunities.

### Search Filters

- Route
- Transportation Mode
- Pricing
- Capacity
- Trust Score
- Availability
- Transit Duration

### Marketplace Benefits

✅ Better Price Transparency

✅ Faster Provider Discovery

✅ Higher Container Utilization

✅ Improved Logistics Efficiency

---

## 💳 Intelligent Booking Engine

The booking engine automatically calculates total shipping costs.

### Pricing Formula

```text
Final Amount

=
Base Cost
+ GST (18%)
+ Insurance (2%)
+ Documentation Charges
```

### Shipment Lifecycle

```text
Booked
   ↓
Confirmed
   ↓
In Transit
   ↓
Arrived
   ↓
Delivered
```

---

# ⚡ Real-Time Capabilities

---

## 📡 Live Capacity Tracking

Built using WebSockets.

Whenever a booking is placed:

- Available space updates instantly
- Capacity percentages refresh automatically
- Subscribers receive real-time notifications
- No page refresh required

---

## 💬 Real-Time Chat

Direct communication between traders and logistics providers.

### Features

- Instant Messaging
- Conversation History
- Typing Indicators
- Seen Status
- Live Message Delivery
- User Presence Tracking

---

## 📦 Shipment Tracking

Track shipments throughout the transportation lifecycle.

### Tracking Stages

```text
Booked
 ↓
Confirmed
 ↓
In Transit
 ↓
Arrived
 ↓
Delivered
```

### Capabilities

- Live Status Updates
- Progress Visualization
- Delivery Monitoring
- Shipment History

---

## 🔔 Notification Center

A centralized notification management system.

### Notification Events

- New Bookings
- Capacity Changes
- Shipment Updates
- Verification Status
- Payment Updates
- System Alerts

### Features

- Real-Time Push Delivery
- Read/Unread Tracking
- Persistent Storage
- User-Specific Streams

---

# 🤖 Artificial Intelligence Modules

CargoVerse AI Lite incorporates intelligent decision-making modules to improve logistics operations.

---

## 🧠 AI Module 1: Container Recommendation Engine

Recommends the most suitable cargo options using a composite scoring mechanism.

### Evaluation Parameters

- Cost Efficiency
- Transit Time
- Provider Trust Score
- Capacity Availability

### Recommendation Score

```text
Recommendation Score

=
Price Weight
+
Transit Weight
+
Trust Weight
+
Capacity Weight
```

### Future Enhancement

- XGBoost Ranking Models
- Personalized Recommendations
- Demand-Aware Suggestions

---

## 📈 AI Module 2: Dynamic Pricing Prediction

Predicts future cargo pricing trends.

### Input Variables

- Market Demand
- Booking Urgency
- Seasonality
- Route Popularity
- Capacity Utilization

### Prediction Output

```text
↑ Price Increase

→ Stable Pricing

↓ Price Decrease
```

### Benefits

- Better Booking Decisions
- Revenue Optimization
- Market Awareness

---

## 🗺️ AI Module 3: Route Optimization

Compares logistics routes across different transportation modes.

### Example

```text
Direct Route

vs

Road → Rail → Sea
```

### Optimization Goals

- Lower Transportation Cost
- Faster Delivery
- Higher Efficiency
- Better Resource Utilization

---

# 📊 Analytics Dashboard

Role-specific analytical insights.

---

## 👨‍💼 Admin Dashboard

Monitor:

- Total Revenue
- Active Users
- Occupancy Rates
- Marketplace Growth
- Pending Verifications
- Booking Statistics

---

## 🏢 Provider Dashboard

Track:

- Revenue
- Cargo Utilization
- Container Occupancy
- Ratings
- Active Listings
- Booking Performance

---

## 👤 Trader Dashboard

Analyze:

- Total Bookings
- Shipping Expenses
- Cost Savings
- Active Shipments
- Route Usage Patterns

---

# 🏗️ System Architecture

```text
Frontend
(HTML/CSS/JS)
       │
       ▼

FastAPI Backend
(REST APIs + WebSockets)

       │

 ┌────────────┬────────────┬────────────┐
 │            │            │
 ▼            ▼            ▼

Auth      Marketplace     AI Engine

 │            │            │
 ▼            ▼            ▼

SQLAlchemy   SQLite    Recommendation
ORM                     Pricing
                         Route Optimization

       │
       ▼

Analytics Layer
```

---

# 🛠️ Tech Stack

## Backend

- FastAPI
- SQLAlchemy
- Pydantic
- Python-Jose
- Passlib
- Uvicorn
- WebSockets

## Database

- SQLite
- PostgreSQL Ready

## AI & Machine Learning

- Scikit-Learn
- XGBoost
- Pandas
- NumPy

## Frontend

- HTML5
- CSS3
- JavaScript
- Cyberpunk UI Theme

---

# 📂 Project Structure

```text
CargoVerse-Lite
│
├── backend
│   │
│   ├── app
│   │   ├── core
│   │   ├── ml
│   │   ├── models
│   │   ├── routers
│   │   ├── schemas
│   │   ├── utils
│   │   ├── database.py
│   │   └── main.py
│   │
│   ├── scripts
│   │   └── seed_admin.py
│   │
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── .env.example
│
└── frontend
    ├── css
    ├── js
    ├── chat-test.html
    ├── notifications-test.html
    ├── tracking-test.html
    ├── analytics-test.html
    ├── ai-recommend-test.html
    ├── pricing-test.html
    └── route-optimizer-test.html
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/NANDITHANOBLE/CargoVerse-Lite.git

cd CargoVerse-Lite/backend
```

## Create Virtual Environment

```bash
python -m venv venv
```

## Activate Environment

```powershell
venv\Scripts\Activate.ps1
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

# ⚙️ Environment Configuration

Create a `.env` file.

```bash
copy .env.example .env
```

Example Configuration:

```env
SECRET_KEY=your_secret_key

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=60

DATABASE_URL=sqlite:///./cargoverse.db
```

---

# ▶️ Running The Application

## Seed Admin User

```bash
python scripts/seed_admin.py
```

## Launch FastAPI Server

```bash
uvicorn app.main:app --reload --reload-dir app
```

---

# 📚 API Documentation

Once the application starts:

```text
http://127.0.0.1:8000/docs
```

Swagger UI provides interactive API testing.

---

# 🧪 Frontend Testing Modules

The project includes standalone frontend clients.

| Module | Test File |
|----------|-----------|
| Capacity Tracking | ws-test.html |
| Chat System | chat-test.html |
| Shipment Tracking | tracking-test.html |
| Notification Center | notifications-test.html |
| Analytics Dashboard | analytics-test.html |
| Container Recommendation | ai-recommend-test.html |
| Dynamic Pricing | pricing-test.html |
| Route Optimization | route-optimizer-test.html |

---

# 🎓 Skills Demonstrated

This project showcases expertise in:

- FastAPI Backend Development
- REST API Design
- JWT Authentication
- RBAC Authorization
- SQLAlchemy ORM
- Real-Time Communication
- WebSocket Architecture
- Logistics Technology
- Recommendation Systems
- AI Integration
- Dynamic Pricing Models
- Route Optimization Algorithms
- Dashboard Analytics
- Software Architecture Design

---

# 🚀 Future Roadmap

- PostgreSQL Migration
- Redis Integration
- Docker Deployment
- Kubernetes Support
- Payment Gateway Integration
- Predictive Demand Forecasting
- LLM-Based Logistics Assistant
- Fraud Detection Engine
- Mobile Applications
- Multi-Tenant SaaS Platform

---

# 💡 Why CargoVerse AI Lite?

Unlike traditional logistics platforms, CargoVerse AI Lite combines:

✅ Shared Cargo Marketplace

✅ AI-Based Recommendations

✅ Dynamic Pricing Intelligence

✅ Route Optimization

✅ Real-Time Tracking

✅ Real-Time Communication

✅ Capacity Monetization

✅ Analytics-Driven Decisions

into a single intelligent logistics ecosystem.

---

# ⭐ Support

If you found this project helpful or interesting, please consider giving it a ⭐ on GitHub.

It helps support the project and encourages future improvements.

---

## "Transforming unused cargo capacity into intelligent opportunities."
`