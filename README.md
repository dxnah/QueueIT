# VaxFlow — Vaccine Inventory & Patient Management System

<p align="center">
  <img src="src/images/logoit.png" alt="VaxFlow Logo" width="80"/>
</p>

<p align="center">
  <b>A full-stack web application for managing anti-rabies vaccine inventory, patient records, demand forecasting, and health center operations.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-0.136.0-009688?logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLite-Database-003B57?logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/Deployed-Vercel-000000?logo=vercel&logoColor=white" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [ML Demand Forecasting](#ml-demand-forecasting)
- [Deployment](#deployment)
- [Team](#team)

---

## Overview

VaxFlow is a health information system designed for barangay health centers managing **Anti-Rabies Vaccination (ARV)** programs. It streamlines the end-to-end workflow of patient registration, dose scheduling, vaccine inventory tracking, supplier management, and intelligent demand forecasting powered by a machine learning model.

The system supports two roles:
- **Admin** — full access to inventory, orders, reports, patient management, and ML forecasting
- **Patient** — access to personal vaccination records and dose schedules

**Live Demo:** [https://vaxflow-seven.vercel.app](https://vaxflow-seven.vercel.app)

---

## Features

| Module | Description |
|---|---|
| 🔐 **Authentication** | Role-based login for Admin and Patient users |
| 📊 **Dashboard** | Real-time overview of stock levels, patient stats, and daily analytics |
| 💉 **Vaccine Management** | Track vaccines, batches, expiry dates, and stock status |
| 🛒 **Vaccine Orders** | Create and monitor purchase orders with supplier and pricing info |
| 🏭 **Suppliers** | Manage supplier contacts, lead times, and linked vaccines |
| 🤖 **Demand Forecast** | ML-powered monthly vaccine demand prediction (ARIMA/scikit-learn) |
| 📋 **Patient Management** | Register patients, manage dose schedules, and view vaccination history |
| 📁 **Reports** | Vaccine usage reports and stock level summaries |
| 🔔 **Notifications** | Automated alerts for low stock and expiring batches |
| 📢 **Announcements** | Post and view health center announcements |
| ⚙️ **Settings** | Theme toggling (dark/light mode), auto-refresh intervals |

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.2.0 | UI framework |
| React Router DOM | 6.4.0 | Client-side routing |
| Recharts | 3.7.0 | Data visualization & charts |
| CSS Modules | — | Component-level styling |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| FastAPI | 0.136.0 | REST API framework |
| SQLAlchemy | 2.0.49 | ORM & database abstraction |
| SQLite / PostgreSQL | — | Database |
| scikit-learn | 1.8.0 | ML demand forecasting model |
| pandas / numpy | 3.0.2 / 2.4.4 | Data processing |
| Uvicorn | 0.44.0 | ASGI server |
| python-dotenv | 1.2.2 | Environment configuration |

---

## Project Structure

```
VaxFlow/                          ← Frontend (React)
├── public/
│   └── index.html
├── src/
│   ├── components/               ← Reusable UI components
│   │   ├── Sidebar.jsx
│   │   ├── TopBar.jsx
│   │   ├── PatientPanel.jsx
│   │   ├── VaccineCard.jsx
│   │   ├── DailyAnalytics.jsx
│   │   └── Pagination.jsx
│   ├── pages/                    ← Route-level page components
│   │   ├── login.jsx
│   │   ├── dashboard.jsx
│   │   ├── vaccine.jsx
│   │   ├── VaccineOrders.jsx
│   │   ├── Suppliers.jsx
│   │   ├── DemandForecast.jsx
│   │   ├── patientmanagement.jsx
│   │   ├── reports.jsx
│   │   ├── notifications.jsx
│   │   ├── announcements.jsx
│   │   ├── settings.jsx
│   │   └── profile.jsx
│   ├── services/
│   │   └── api.js                ← Centralized API service layer
│   ├── styles/                   ← Page-level CSS files
│   ├── hooks/                    ← Custom React hooks
│   ├── data/                     ← Static constants & seed data
│   └── App.js                    ← Root component & routing
└── package.json

vaxflow-backend/                  ← Backend (FastAPI)
├── fast_api/
│   ├── main.py                   ← API routes & app entry point
│   ├── models.py                 ← SQLAlchemy ORM models
│   ├── schemas.py                ← Pydantic request/response schemas
│   ├── database.py               ← DB engine & session config
│   ├── ml_forecast.py            ← ML forecasting router & logic
│   └── vaxflow_arv_model.pkl     ← Trained ML model artifact
├── requirements.txt
└── .env
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- Python 3.11+
- pip

---

### Frontend Setup

```bash
# 1. Navigate to the frontend folder
cd VaxFlow

# 2. Install dependencies
npm install

# 3. Start the development server
npm start
```

The app will run at **http://localhost:3000**

---

### Backend Setup

```bash
# 1. Navigate to the backend folder
cd vaxflow-backend

# 2. Create and activate a virtual environment
python -m venv venv

# Windows
venv\Scripts\Activate.ps1

# macOS/Linux
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start the FastAPI server
uvicorn fast_api.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at **http://localhost:8000**  
Interactive docs at **http://localhost:8000/docs**

---

## Environment Variables

Create a `.env` file in `vaxflow-backend/`:

```env
DATABASE_URL=sqlite:///./db.sqlite3
```

For PostgreSQL:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/vaxflow_db
```

---

## Database Schema

![VaxFlow ERD](docs/erd.png)

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/login/` | Authenticate admin or patient |
| POST | `/api/signup/` | Register a new patient |
| GET | `/api/vaccines/` | List all vaccines |
| POST | `/api/vaccines/` | Create a vaccine |
| GET | `/api/vaccine-batches/` | List all vaccine batches |
| GET | `/api/suppliers/` | List all suppliers |
| GET | `/api/vaccine-orders/` | List all orders |
| POST | `/api/vaccine-orders/` | Create a new order |
| GET | `/api/patients/` | List all patients |
| GET | `/api/vaccination-history/` | Patient vaccination records |
| GET | `/api/notifications/` | System notifications |
| GET | `/api/reports/usage/` | Vaccine usage reports |
| GET | `/api/reports/stock/` | Stock level reports |
| GET | `/api/announcements/` | Health center announcements |
| GET | `/api/forecast/` | ML demand forecast results |

---

## ML Demand Forecasting

VaxFlow includes a trained **ARIMA-based machine learning model** (`vaxflow_arv_model.pkl`) that predicts monthly anti-rabies vaccine demand. The model was trained on synthesized historical vaccination data and is served via the `/api/forecast/` endpoint.

The forecasting pipeline:
1. Historical vaccination data is processed using **pandas**
2. An ARIMA/scikit-learn model generates monthly predictions
3. Results are returned as JSON and visualized in the **Demand Forecast** page with interactive charts

---

## Deployment

| Layer | Platform | URL |
|---|---|---|
| Frontend | Vercel | https://vaxflow-seven.vercel.app |
| Backend | Local / Cloud server | http://localhost:8000 |

To deploy the frontend to Vercel:

```bash
npm run build
# Then push to GitHub and connect repo to Vercel
```

---

## Team

**IT323 — Application Development and Emerging Technologies**

> Built as a final project demonstrating full-stack development, REST API design, database modeling, and ML integration.

---

<p align="center">Made with 💉 by the VaxFlow Team</p>