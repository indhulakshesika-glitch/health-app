# Health App

This project contains a clean full-stack health management app with a Node.js backend and React frontend.

## Project structure

```text
health-app/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## Backend setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

## Environment

Backend `.env` example:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/health_dashboard
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

Frontend uses `VITE_API_URL` with the backend URL.

## Features

- User registration and login
- JWT authentication
- Medicine tracking
- Dashboard summary
- Simple health app workflow
