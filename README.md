# 🚢 CargoVerse AI Lite

<div align="center">

# AI-Powered Cargo Space Sharing Marketplace

### "Uber for Cargo Space"

A real-time logistics marketplace that enables SMEs and exporters to book only the cargo capacity they need while allowing logistics providers to monetize unused transportation space.

![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?he-badge&logo=fastapi
![Python](https://img.shields.io/badge/Python-3.10+-blue?style=for-theo=python
![WebSockets](https://img.shields.io/badgeal_Time-purple?style=for-the-badge
![AI Powered](https://img.shields.io/badge/nge?style=for-the-badge
![SQLite](https://img.shields.io/badge/Databaseeen?style=for-the-badge

</div>

---

## 🌟 Overview

CargoVerse AI Lite is an intelligent cargo-space-sharing platform designed to solve one of the biggest inefficiencies in logistics: **unused transportation capacity**.

Instead of booking an entire container, traders can reserve only the required cargo space while logistics providers can monetize unused capacity through a centralized marketplace powered by AI recommendations, dynamic pricing insights, route optimization, and real-time shipment visibility.

---

## 🎯 Problem Statement

### Current Challenges

- SMEs often pay for underutilized containers.
- Logistics providers experience revenue loss due to empty cargo space.
- Shipment visibility is limited.
- Route planning is often inefficient.
- Provider validation is mostly manual.
- Pricing lacks transparency.

### Solution

CargoVerse AI Lite creates a shared logistics ecosystem where:

✅ Traders book only required space

✅ Providers maximize container utilization

✅ AI recommends the best transportation options

✅ Real-time systems provide shipment visibility

✅ Analytics support data-driven decisions

---

# 🚀 Core Features

## 🔐 Authentication & Authorization

- JWT Authentication
- Password Hashing (bcrypt)
- Role-Based Access Control
- Protected FastAPI Routes

### User Roles

- Admin
- Provider
- Trader

---

## 🏢 Provider Verification System

A weighted inspection framework ensures marketplace trust.

### Verification Criteria

| Component | Weight |
|-----------|----------|
| Documents | 30% |
| Infrastructure | 30% |
| Compliance | 20% |
| Fleet Quality | 20% |

### Approval Rule

```text
Score >= 80  → Approved

Score < 80   → Rejected
```

---

## 🚛 Cargo Space Management

Providers can publish cargo listings for:

- 🚢 Sea Freight
- 🚛 Road Freight
- 🚂 Rail Freight
- ✈️ Air Freight

### Listing Details

- Route
- Capacity
- Available Space
- Pricing
- Transit Duration
- Shipment Type

---

## 🛒 Cargo Marketplace

Search and book available cargo space using filters such as:

- Origin
- Destination
- Capacity
- Price
- Trust Score
- Transportation Mode

---

## 💰 Intelligent Booking Engine

### Price Calculation

```text
Final Price

= Base Cost
+ GST (18%)
+ Insurance (2%)
+ Documentation Fee
```

---

# ⚡ Real-Time Features

---

## 📡 Live Capacity Tracking

Powered by WebSockets.

### Features

- Instant Capacity Updates
- Occupancy Monitoring
- Live Booking Synchronization
- No Page Refresh Required

---

## 💬 Real-Time Chat

Communication between traders and providers.

### Capabilities

- Instant Messaging
- Typing Indicators
- Seen Status
- Conversation History
- WebSocket Delivery

---

## 📦 Shipment Tracking

Monitor shipment progress end-to-end.

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

### Tracking Features

- Progress Updates
- Status Monitoring
- Delivery Timeline

---

## 🔔 Notification Center

Receive live event notifications.

### Supported Events

- New Bookings
- Shipment Updates
- Verification Status
- Capacity Changes
- Payment Updates

### Capabilities

- Real-Time Push Notifications
- Read / Unread Tracking
- Persistent Storage

---

# 🤖 Artificial Intelligence Modules

---

## 🧠 Container Recommendation Engine

Intelligently suggests the most suitable cargo options.

### Recommendation Factors

- Price
- Transit Time
- Trust Score
- Available Capacity

### Scoring Logic

```text
Final Score

=
Price Score
+
Transit Score
+
Trust Score
+
Capacity Score
```

---

## 📈 Dynamic Pricing Prediction

Predicts market behavior based on:

- Seasonal Demand
- Route Popularity
- Booking Urgency
- Capacity Utilization

### Predicted Output

```text
↑ Price Increase

→ Stable

↓ Price Decrease
```

---

## 🗺️ Route Optimization Engine

Evaluates multiple logistics routes.

### Example

```text
Direct Route

vs

Road → Rail → Sea
```

### Optimization Goals

- Lower Cost
- Faster Transit
- Better Efficiency

---

# 📊 Analytics Dashboard

---

## 👨‍💼 Admin Dashboard

Tracks:

- Total Revenue
- Occupancy Rate
- Pending Approvals
- Active Users
- Platform Growth

---

## 🏢 Provider Dashboard

Tracks:

- Revenue
- Ratings
- Active Listings
- Cargo Utilization
- Booking Activity

---

## 👤 Trader Dashboard

Tracks:

- Bookings
- Shipping Expenses
- Cost Savings
- Shipment Status

---

# 🏗️ Tech Stack

## Backend

```text
FastAPI
SQLAlchemy
Pydantic
Python-Jose
Passlib
WebSockets
Uvicorn
```

## Database

```text
SQLite
(PostgreSQL Ready)
```

## AI & Machine Learning

```text
Scikit-Learn
XGBoost
Pandas
NumPy
```

## Frontend

```text
HTML5
CSS3
JavaScript
Cyberpunk UI Theme
```

---

# 📂 Project Structure

```text
CargoVerse-Lite
│
├── backend
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
    ├── tracking-test.html
    ├── notifications-test.html
    ├── analytics-test.html
    ├── ai-recommend-test.html
    ├── pricing-test.html
    └── route-optimizer-test.html
```

---

# ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/NANDITHANOBLE/CargoVerse-Lite.git
```

### Navigate To Backend

```bash
cd CargoVerse-Lite/backend
```

### Create Virtual Environment

```bash
python -m venv venv
```

### Activate Environment

```powershell
venv\Scripts\Activate.ps1
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

---

# 🔧 Environment Setup

Create a `.env` file from `.env.example`

```bash
copy .env.example .env
```

Example:

```env
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
DATABASE_URL=sqlite:///./cargoverse.db
```

---

# ▶️ Running The Project

### Seed Admin User

```bash
python scripts/seed_admin.py
```

### Start Server

```bash
uvicorn app.main:app --reload --reload-dir app
```

---

# 📚 API Documentation

After starting the application:

```text
http://127.0.0.1:8000/docs
```

---

# 🎓 Skills Demonstrated

- FastAPI Development
- REST API Design
- SQLAlchemy ORM
- JWT Authentication
- Role-Based Authorization
- WebSocket Communication
- Real-Time Systems
- Recommendation Systems
- Dynamic Pricing Models
- Route Optimization
- Logistics Technology
- Analytics Engineering

---

# 🚀 Future Enhancements

- PostgreSQL Migration
- Redis Caching
- Docker Deployment
- Kubernetes Support
- Payment Gateway Integration
- AI Demand Forecasting
- Fraud Detection
- LLM-Powered Logistics Assistant
- Mobile Application

---

# 👩‍💻 Author

## Nanditha Noble

Associate Engineer - Technology

- Artificial Intelligence
- Machine Learning
- Data Science
- Generative AI
- Backend Engineering

### GitHub

👉 https://github.com/NANDITHANOBLE

---

# ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.

---

<div align="center">

### 🚢 Transforming Unused Cargo Capacity into Intelligent Opportunities 🚢

</div>
