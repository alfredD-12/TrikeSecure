# TrikeSecure

A full-stack web application built with **React + Vite**, **Node.js + Express**, and **MySQL**.

## Project Structure

```
TrikeSecure/
├── client/          # React + Vite frontend
└── server/          # Express backend API
```

## Prerequisites

- Node.js (v18+)
- MySQL server running locally

## Setup

### 1. Database

Run the SQL schema to create the database and tables:

```sql
-- In your MySQL client:
source server/schema.sql
```

### 2. Server (Backend)

```bash
cd server
# Copy env template and edit values
cp .env.example .env
npm run dev        # starts on http://localhost:5000
```

### 3. Client (Frontend)

```bash
cd client
npm run dev        # starts on http://localhost:5173
```

## API Endpoints

| Method | Route                  | Description        |
|--------|------------------------|--------------------|
| POST   | `/api/auth/register`   | Register new user  |
| POST   | `/api/auth/login`      | Login              |
| POST   | `/api/auth/logout`     | Logout             |
| GET    | `/api/auth/me`         | Get session user   |
| GET    | `/api/health`          | Health check       |

## Environment Variables (`server/.env`)

Use `server/.env.example` as your source of truth.

Key fields:
- `SESSION_SECRET` must be strong and unique
- `CLIENT_ORIGIN` can be comma-separated for allowed frontend origins
- `DB_NAME` should match your schema (`trikesec` by default)
