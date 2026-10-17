# Full-Stack Task Management System with Redis Caching

A robust, full-stack Task Management application featuring Node.js/Express, MongoDB, Redis caching, JWT authentication, and a responsive React frontend.

---

## System Architecture & Technical Highlights

1. **Backend Layer**: Clean MVC-style separation (`controllers`, `models`, `routes`, `middleware`, `config`, `utils`).
2. **Caching Strategy (Redis)**:
   - User-isolated cache namespace: `tasks:<userId>:*`
   - Cache keys incorporate query parameters (page, limit, filter, search, sort).
   - Dynamic TTL expiration (default: 300 seconds).
   - Invalidation via non-blocking Redis `SCAN` + `DEL` on any write mutation (`POST`, `PUT`, `DELETE`).
3. **Database Performance**:
   - Compound indexes on MongoDB for `{ user: 1, status: 1, priority: 1, createdAt: -1 }`.
   - Text indexes on `title` and `description` for keyword queries.
4. **Security**:
   - Password encryption via `bcryptjs` with salt rounds = 10.
   - Stateless authentication with Signed JWTs transmitted via HTTP `Bearer` token headers.
   - Strict resource isolation: users can strictly mutate and query their own records.
5. **Frontend**:
   - React with Vite for fast build and rendering.
   - Axios instance with automatic request and response interceptors for Bearer auth and 401 handling.
   - Real-time indicator revealing whether data was served from `CACHE` or `DATABASE`.

---

## Prerequisites

- Node.js (v18.x or later)
- MongoDB running locally on port `27017` or a MongoDB Atlas URI
- Redis Server running on port `6379`

---

## Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev