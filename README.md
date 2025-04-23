# 💸 FinConnect – Subscription-Gated Fintech API Dashboard

A full-stack sandbox portal where developers can register, subscribe to a plan, and consume a suite of mock financial APIs — all secured with JWT authentication and role-based access control.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js, Sequelize, PostgreSQL
- **Auth**: JWT, Role-based Access Control (RBAC)
- **Security**: Rate Limiting, Logging, Centralized Error Handling
- **Frontend**: React.js

---

## 🚀 Features

### 👤 Authentication & Authorization
- Register & Login using JWT
- Role-based access: `admin` vs `developer`
- Secure routes using middleware

### 💳 Subscription Management
- Custom subscription flow via `/api/subscriptions/subscribe`
- Access to dashboard is blocked unless `isSubscribed = true`

### 🔐 Protected Fintech APIs
- `GET /api/fintech/balance`
- `POST /api/fintech/transfer`
- `GET /api/fintech/transactions?page=&pageSize=`
- `GET /api/invoice?start=YYYY-MM-DD&end=YYYY-MM-DD`

### 🛡 Admin-Only Routes
- `GET /api/admin/users` – View all users and their subscription status
- `GET /api/admin/logs` – View request logs