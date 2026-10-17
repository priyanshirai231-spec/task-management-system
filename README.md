# 🚀 High-Performance Task Management System (MERN + Redis)

A full-stack, production-grade Task Management Application featuring JWT-based authentication, complete CRUD operations, server-side caching via Redis, dynamic search/filter, and a responsive React dashboard.

---

## 📌 Features

- **Authentication & Security**: Secure User Registration and Login using bcrypt password hashing and JSON Web Tokens (JWT).
- **Protected Routes**: Middleware-enforced route protection ensuring users can only read, update, or delete their own tasks.
- **Task CRUD**: Complete task lifecycle management with `title`, `description`, `status` (*pending, in-progress, completed*), `priority` (*low, medium, high*), and `dueDate`.
- **Redis In-Memory Caching**: Implemented on `GET /api/tasks` using cloud-hosted Upstash Redis (`rediss://`), drastically reducing database load and response latency.
- **Cache Invalidation**: Automatic cache invalidation upon task creation, update, or deletion to prevent stale data.
- **Search & Filtering**: Real-time task search by title/description and dropdown filtering by status and priority.
- **Responsive Dashboard**: Dark-mode UI built with React.js featuring live status counters and cache state indicators (`⚡ Redis Cache Hit` vs `💾 MongoDB Queried`).

---

## 🛠️ Technology Stack

- **Frontend**: React.js, React Router DOM, Axios, Modern CSS
- **Backend**: Node.js, Express.js, REST APIs
- **Database**: MongoDB Atlas, Mongoose ODM
- **Caching**: Upstash Redis (ioredis)
- **Authentication**: JWT (JSON Web Tokens), bcryptjs

---

## 📂 Project Architecture

```text
task-management-system/
├── backend/
│   ├── config/             # Database and Redis configurations
│   ├── controllers/        # Business logic for auth and tasks
│   ├── middleware/         # Auth verification and error handlers
│   ├── models/             # Mongoose schemas (User, Task)
│   ├── routes/             # Express API endpoints
│   ├── utils/              # Redis cache helper functions
│   ├── .env.example
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios instance with auth interceptor
│   │   ├── components/     # UI components (TaskCard, Filters, Modal)
│   │   ├── pages/          # Dashboard, Login, Register
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
