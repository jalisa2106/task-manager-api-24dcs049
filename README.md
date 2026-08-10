# Task Manager API & Full-Stack Application (`task-manager-api-24dcs049`)

**Subject:** Advanced Web Development Frameworks (ITUE301) | Semester 5  
**Repository:** `task-manager-api-24dcs049` ([Backend Directory](https://github.com/jalisa2106/task-manager-api-24dcs049/tree/main/backend) & [Frontend Directory](https://github.com/jalisa2106/task-manager-api-24dcs049/tree/main/frontend))

---

## 📋 Project Overview

This repository houses a comprehensive, production-grade **Task Manager Full-Stack Application** built across Practicals 4 through 13 for the **Advanced Web Development Frameworks (ITUE301)** course. 

The project evolves from a basic Express REST API with in-memory storage into a fully containerized, secure, high-performance, event-driven full-stack system incorporating MongoDB persistence, JWT authentication, server-side caching, automated CI/CD pipelines, and AI-powered task assistance.

---

## 🛠️ Tech Stack

- **Frontend:** React, Vite, React Router, Tailwind CSS / Custom UI, Code Splitting (`React.lazy`)
- **Backend:** Node.js, Express.js, Mongoose ODM
- **Database:** MongoDB
- **Security & Auth:** JSON Web Tokens (JWT), Bcrypt.js, CORS
- **Performance & Events:** Node-Cache, Node.js Built-in `EventEmitter`
- **Testing & CI/CD:** Jest, Supertest, GitHub Actions
- **AI Integration:** OpenAI API (with graceful degradation & fallback handling)
- **DevOps & Containerization:** Docker, Docker Compose

---

## 📂 Repository Structure

```text
task-manager-api-24dcs049/
├── backend/
│   ├── models/           # Mongoose schemas (User, Task)
│   ├── routes/           # Express API route handlers
│   ├── middleware/       # Auth, validation, logging, and error handling
│   ├── events/           # Event-driven architecture (EventEmitter)
│   ├── tests/            # Automated integration and unit tests (Jest/Supertest)
│   ├── server.js         # Main Express app entry point
│   ├── Dockerfile        # Backend container configuration
│   └── package.json
├── frontend/
│   ├── src/              # React components, pages, and API client (api.js)
│   ├── Dockerfile        # Frontend container configuration
│   └── package.json
├── .github/
│   └── workflows/
│       └── ci.yml        # GitHub Actions automated test & build pipeline
├── docker-compose.yml    # Multi-container orchestration (Frontend, Backend, MongoDB)
└── README.md
```

---

## 🚀 Practical Guide & Implementation Roadmap (Practicals 4–13)

### [Practical 4: Building a RESTful API with Node.js and Express](#)
- **Objective:** Design and implement a RESTful backend server with complete CRUD endpoints using an Express middleware pipeline.
- **Key Features:**
  - Full CRUD endpoints (`GET`, `POST`, `PUT`, `DELETE /tasks`).
  - Request-logging middleware tracking method, URL, and timestamp.
  - Global error-handling and 404 handlers returning structured JSON.
  - Strict Content-Type validation middleware.

### [Practical 5: MongoDB Integration and Schema Design with Mongoose](#)
- **Objective:** Connect MongoDB to the Express server and enforce data validation through a Mongoose schema.
- **Key Features:**
  - Robust `Task` schema (`title`, `description`, `completed`, `createdAt`).
  - Replaced in-memory storage with asynchronous Mongoose database calls (`Task.find()`, `Task.create()`, etc.).
  - Environment configuration via `dotenv` and `.env.example`.

### [Practical 6: Full Stack Integration — React + Node + MongoDB](#)
- **Objective:** Wire the React frontend to the Node/Express/MongoDB backend into one working full-stack app.
- **Key Features:**
  - Seamless communication via `api.js` with CORS enabled.
  - Complete reactive UI state updates for create, read, update, and delete operations with persistent storage.

### [Practical 7: Authentication and Middleware Pipeline](#)
- **Objective:** Implement JWT-based authentication and input validation in the Express middleware pipeline.
- **Key Features:**
  - Secure user registration with password hashing (`bcrypt`).
  - JWT token generation upon login with expiration control.
  - Protected route middleware verifying bearer tokens (`Authorization: Bearer <token>`).

### [Practical 8: Performance Optimization and Lazy Loading in React](#)
- **Objective:** Improve frontend performance using lazy loading and code splitting.
- **Key Features:**
  - Route-based component splitting using `React.lazy()` and `Suspense`.
  - Optimized bundle sizes and fallback loading UI states.

### [Practical 9: In-Memory Caching and Query Optimization](#)
- **Objective:** Implement server-side caching and measure its impact on API response time.
- **Key Features:**
  - Integration of `node-cache` with a 60-second TTL on `GET /tasks`.
  - Automatic cache invalidation on write operations (`POST`, `PUT`, `DELETE`).

### [Practical 10: Asynchronous Processing with Event-Driven Architecture](#)
- **Objective:** Implement non-blocking background processing using Node's built-in `EventEmitter`.
- **Key Features:**
  - Custom `EventEmitter` module emitting `task-created` events.
  - Asynchronous background notification logging that does not block HTTP response delivery.

### [Practical 11: Containerization with Docker and Docker Compose](#)
- **Objective:** Containerize the full-stack app with Docker and orchestrate services with Docker Compose.
- **Key Features:**
  - Optimized multi-stage `Dockerfile` configurations for frontend and backend.
  - Single-command orchestration via `docker-compose.yml` linking Frontend, Backend, and MongoDB services.

### [Practical 12: CI/CD Pipeline with GitHub Actions](#)
- **Objective:** Automate testing using GitHub Actions.
- **Key Features:**
  - Automated CI workflow executing `npm install` and `npm test` (Jest & Supertest) on every push to `main`.

### [Practical 13: AI API Integration into a Web Application](#)
- **Objective:** Integrate an external AI service into the app and apply responsible-AI practices.
- **Key Features:**
  - Backend-secured OpenAI integration for automated task description generation.
  - Graceful degradation ensuring the core app remains functional if the AI service fails or times out.

---

## 🛠️ Getting Started & Local Installation

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local instance or Atlas URI)
- Docker & Docker Compose (optional, for containerized execution)

### 1. Clone the Repository
```bash
git clone https://github.com/jalisa2106/task-manager-api-24dcs049.git
cd task-manager-api-24dcs049
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file inside the `backend/` directory based on `.env.example`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your_super_secret_jwt_key_here
OPENAI_API_KEY=your_openai_api_key_here
```
Run the backend server:
```bash
npm run dev
# or
node server.js
```

### 3. Frontend Setup
Open a separate terminal window:
```bash
cd frontend
npm install
npm run dev
```

---

## 🐳 Running with Docker Compose

To run the entire full-stack application (Frontend, Backend, and MongoDB) with a single command:

```bash
docker-compose up --build
```

- **Frontend:** `http://localhost:5173` (or port specified in compose)
- **Backend API:** `http://localhost:5000`

---

## 🧪 Running Tests

To execute the automated test suite using Jest and Supertest:

```bash
cd backend
npm test
```

---

## 📜 Author & Academic Context

- **Student Roll No:** `24dcs049`
- **Course:** Advanced Web Development Frameworks (ITUE301)
- **Institution:** Department of Computer Science and Engineering
