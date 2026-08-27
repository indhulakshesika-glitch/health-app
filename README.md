# ⚕ MediCare — Patient Medicine Reminder & Health Dashboard

A full-stack web application for patients to manage medicine reminders and track personal health metrics.

---

## 🗂 Project Structure

```
health-app/
├── backend/                  # Node.js + Express API
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   ├── middleware/
│   │   └── auth.js           # JWT authentication middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Medicine.js
│   │   ├── MedicationLog.js
│   │   └── HealthRecord.js
│   ├── routes/
│   │   ├── auth.js           # Register, login, me
│   │   ├── medicines.js      # CRUD for medicines
│   │   ├── logs.js           # Medication logs & today's schedule
│   │   ├── health.js         # Health record CRUD + stats
│   │   └── dashboard.js      # Aggregated dashboard data
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/                 # React.js SPA
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   └── Layout.jsx    # Sidebar + layout wrapper
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Medicines.jsx
    │   │   ├── MedicineForm.jsx
    │   │   ├── HealthTracker.jsx
    │   │   └── MedicationHistory.jsx
    │   ├── utils/
    │   │   └── api.js        # Axios instance + all API calls
    │   ├── App.jsx
    │   ├── index.js
    │   └── index.css         # Global design system
    ├── package.json
    └── .env.example
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

---

### 1. Clone / Download the Project

```bash
# If using git
git clone <your-repo-url>
cd health-app
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create your environment file:
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/health_dashboard
JWT_SECRET=your_super_secret_jwt_key_change_in_production_min_32_chars
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

> **MongoDB Atlas (cloud):** Replace `MONGODB_URI` with your Atlas connection string:
> `mongodb+srv://<user>:<password>@cluster.mongodb.net/health_dashboard`

Start the backend:
```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Backend will run on **http://localhost:5000**

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create your environment file:
```bash
cp .env.example .env
```

Edit `.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm start
```

Frontend will open at **http://localhost:3000**

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Create account | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Medicines
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/medicines` | Get all medicines | Yes |
| GET | `/api/medicines/:id` | Get one medicine | Yes |
| POST | `/api/medicines` | Add medicine | Yes |
| PUT | `/api/medicines/:id` | Update medicine | Yes |
| DELETE | `/api/medicines/:id` | Delete medicine | Yes |

### Medication Logs
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/logs/today` | Today's schedule | Yes |
| GET | `/api/logs/history?days=7` | History | Yes |
| POST | `/api/logs` | Create log entry | Yes |
| PATCH | `/api/logs/:id/status` | Mark taken/missed | Yes |

### Health Records
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/health?type=bp&days=30` | Get records | Yes |
| GET | `/api/health/stats?type=bp&period=weekly` | Chart data | Yes |
| POST | `/api/health` | Add record | Yes |
| DELETE | `/api/health/:id` | Delete record | Yes |

### Dashboard
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/dashboard` | Full dashboard summary | Yes |

---

## 🔐 Authentication

All protected routes require the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens expire in 7 days (configurable via `JWT_EXPIRE` in `.env`).

---

## 🗄 Database Schema

### User
```js
{ name: String, email: String (unique), password: String (hashed) }
```

### Medicine
```js
{
  user_id: ObjectId,
  name: String,
  dosage: String,
  times_per_day: Number (1–10),
  reminder_times: [String],   // ["08:00", "14:00", "20:00"]
  start_date: Date,
  end_date: Date,
  notes: String,
  is_active: Boolean
}
```

### MedicationLog
```js
{
  medicine_id: ObjectId,
  user_id: ObjectId,
  scheduled_time: Date,
  status: "pending" | "taken" | "missed",
  taken_at: Date
}
```

### HealthRecord
```js
{
  user_id: ObjectId,
  type: "bp" | "sugar" | "weight",
  value: String,    // "120/80" for bp, "95" for sugar, "72.5" for weight
  recorded_at: Date,
  notes: String
}
```

---

## ✨ Features

- **Authentication** — JWT-based registration & login with bcrypt hashing
- **Medicine Management** — Full CRUD with reminder times, date ranges, dosage, notes
- **Today's Dashboard** — See all scheduled doses, mark as taken/missed, next dose countdown
- **Health Tracking** — Log blood pressure, blood sugar, weight with trend charts
- **Medication History** — View logs with adherence rate, bar charts by day
- **Mobile Responsive** — Collapsible sidebar, responsive grid layouts
- **Browser Notifications** — Scheduled via the today's log system
- **Dark UI** — Clean dark design system with CSS variables

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6, Recharts, date-fns |
| Backend | Node.js, Express 4 |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Validation | express-validator |
| Styling | Custom CSS (no framework) |

---

## 🔔 Browser Notifications Setup

To enable browser notifications, add this to your frontend `index.js`:

```js
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}
```

Reminders can be scheduled in the frontend using `setInterval` to check the today's doses endpoint and fire a `new Notification(...)` when a pending dose is due.

---

## 🚀 Production Deployment

### Backend (e.g. Render / Railway)
1. Set all environment variables in your platform
2. Set `NODE_ENV=production`
3. Start command: `node server.js`

### Frontend (e.g. Vercel / Netlify)
1. Set `REACT_APP_API_URL=https://your-backend-url.com/api`
2. Build command: `npm run build`
3. Publish directory: `build`

---

## 📝 License

MIT — free to use and modify.
