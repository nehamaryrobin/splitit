# SplitIt — MERN Stack

Full-stack expense splitter. Guest mode (localStorage) + Auth mode (MongoDB persisted trips).

## Stack
- **Frontend**: React 18, Vite, shadcn/ui, Tailwind CSS, Recharts, React Router v6
- **Backend**: Node.js, Express 5, MongoDB, Mongoose, JWT (access + refresh tokens)
- **Deploy**: Frontend → Vercel | Backend → Railway or Render

## Quick Start

```bash
# 1. Clone and install
git clone <your-repo>

# Backend
cd backend && npm install
cp .env.example .env   # fill in your values
npm run dev

# Frontend
cd frontend && npm install
cp .env.example .env   # fill in your values
npm run dev
```
