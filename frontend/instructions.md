# Advanced Web Development Frameworks
## Practical Implementation Guide

### Practical 4: Building a RESTful API with Node.js and Express
**Objective:** Build a standalone Express server — the **Task Management API** — with CRUD endpoints and middleware. This is a separate backend from the portfolio site and starts a new repository.
1. `mkdir task-manager-api && cd task-manager-api`, then run `npm init -y`.
2. `npm install express`, create `server.js`, and include `app.use(express.json())`; listen on port `5000`.
3. Set up an in-memory array to temporarily store tasks (no database yet).
4. Implement 4 REST endpoints: `GET /tasks`, `POST /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id`, using correct status codes (200, 201, 404, 500).
5. Add a request logging middleware at the **top** of your pipeline, logging method, URL, and timestamp on every request.
6. Add a global error handling middleware as the **very last** middleware in the pipeline.

### Practical 5: MongoDB Integration with Mongoose
**Objective:** Connect the Task Management API to MongoDB and enforce schema validation.
1. Run `npm install mongoose dotenv`.
2. Create a `.env` file with your `MONGO_URI`; connect to the DB in `server.js`, logging success/failure of the connection.
3. Create `models/Task.js` with a Mongoose schema: `title` (String, required), `description` (String), `completed` (Boolean, default `false`), `createdAt` (Date, default `Date.now`).
4. Replace the in-memory array from Practical 4 with Mongoose model methods (`find`, `create`, `findByIdAndUpdate`, `findByIdAndDelete`).
5. Wrap each route in `try/catch`, forwarding errors via `next(err)` to the global error handler so validation failures return structured JSON, never a raw Mongoose error object.

### Practical 6: Full Stack Integration
**Objective:** Wire a React Task UI to the Node/MongoDB backend from Practicals 4–5.
1. In the backend, `npm install cors` and initialize it with `app.use(cors())`.
2. In React, set up a central `api.js` with a base URL pointing to `http://localhost:5000`.
3. Build the Task UI's data source from your own `/tasks` endpoint (the same loading/error pattern from Practical 3, applied to every call — not just the initial fetch). Style it with the same dark-mode + electric-accent system as the portfolio, and lay tasks out in the Bento Grid pattern.
4. Ensure POST/PUT/DELETE operations in the React UI trigger a re-fetch or local state update so changes appear without a full page refresh. Confirm persistence by refreshing the browser after each operation.

### Practical 7: Authentication and Middleware Pipeline
**Objective:** Implement JWT-based auth and input validation, and protect routes.
1. `npm install bcryptjs jsonwebtoken` in the backend.
2. Create a `User` schema. Build a `/register` route that hashes passwords using `bcrypt` before saving.
3. Build a `/login` route that verifies the password and returns a signed JWT (reasonable expiry, e.g. 1 hour).
4. Create an `authMiddleware` that reads the `Authorization: Bearer <token>` header, verifies it, and attaches the decoded user to `req.user`.
5. Protect all task routes (GET/POST/PUT/DELETE) with this middleware — return 401 for missing/invalid tokens.
6. Add a validation middleware that checks required fields (e.g. task `title`) exist before the request reaches the controller, returning a descriptive JSON error on failure — this must run independently of frontend validation.

### Practical 8: Performance Optimization and Lazy Loading
**Objective:** Code-split the React application to improve initial load times.
1. Before making any changes, run `npm run build` and note the reported bundle size, then reload the app with the Network tab open and note total JS transferred / load time — this is your **baseline**.
2. Swap standard route imports for lazy imports: `const Projects = lazy(() => import('./pages/Projects'));` (apply to at least 2 route-based components, e.g. Projects and Contact).
3. Wrap your routing block in `<Suspense fallback={<Spinner />}>`.
4. Rebuild (`npm run build`) and confirm separate chunk files are generated per lazy route.
5. Reload with the Network tab throttled to **Slow 3G** and verify chunks load on demand, observing the fallback UI render before each chunk arrives.
6. Record the post-optimization bundle size / load time and prepare a documented before/after comparison (screenshot or table).

### Practical 9: In-Memory Caching and Query Optimization
**Objective:** Cache database queries to improve API response time.
1. `npm install node-cache` in the backend. Initialize a cache instance with a 60-second TTL.
2. Intercept `GET /tasks`: check the cache first. If hit, return the cached data immediately. If miss, query MongoDB, cache the result, then return it.
3. Invalidate the cache (`cache.del()`) inside your POST/PUT/DELETE routes to prevent serving stale data after any write.
4. Using Postman, record at least 3 response-time samples with caching enabled and 3 with it temporarily disabled, and document the measurable difference (a simple table is enough).

### Practical 10: Asynchronous Processing with Event-Driven Architecture
**Objective:** Process background tasks without blocking API responses.
1. Import Node's native module in a dedicated `events.js`: `const EventEmitter = require('events')`, and export a single shared instance.
2. Register a listener (in a separate `listeners.js`) for a `task-created` event that logs a notification (task title, timestamp) — this represents background work, not a request handler.
3. In the `POST /tasks` route: save the task, log a timestamp, send the `201` response, **then** call `emit('task-created', task)`.
4. Add an artificial delay inside the listener (e.g. `setTimeout`) and confirm via console log timestamps that the API response completes *before* the listener finishes — this ordering is the evidence that the emit is non-blocking.

### Practical 11: Containerization with Docker and Docker Compose
**Objective:** Orchestrate the full stack using Docker.
1. Write a `Dockerfile` for the frontend (`node:18` base, `npm install`, `npm run build`, serve via `npm run preview -- --host`, expose `5173`).
2. Write a `Dockerfile` for the backend (`node:18` base, `npm install`, expose `5000`, `CMD ["node", "server.js"]`).
3. Update the backend's MongoDB connection string to reference the Compose **service name** (e.g. `mongodb://mongodb:27017/taskdb`) instead of `localhost` — containers cannot reach each other via `localhost`.
4. Create `docker-compose.yml` linking three services: `frontend`, `backend`, and `mongodb`, with correct port mappings and a shared bridge network.
5. Run `docker-compose up --build` and verify all three containers (`docker ps`) and the full stack working end-to-end on that network — with a single command and no manual steps.

### Practical 12: CI/CD Pipeline with GitHub Actions
**Objective:** Automate testing upon code push.
1. Install testing libraries (`jest`, `supertest`) in the backend and write at least one endpoint verification test (e.g. `GET /tasks` returns 200).
2. Create `.github/workflows/ci.yml` defining a workflow triggered `on: push` to `main`, with steps to checkout code, set up Node.js, run `npm install`, and run `npm test`.
3. Commit and push the workflow file; confirm it appears under the repository's **Actions** tab.
4. Deliberately break the test (change an expected value), push, and capture a screenshot of the failing (red) pipeline run.
5. Fix the test and push again; capture a screenshot of the passing (green) pipeline run. Keep both screenshots for your README.

### Practical 13: AI API Integration into a Web Application
**Objective:** Securely integrate an AI service (OpenAI/Gemini) into the Task Management app with graceful failure handling — this is the practical where your Applied AI focus becomes functional, not just a portfolio label.
1. Store your AI API key securely in the backend `.env` — it must never be called directly from the frontend.
2. Create an endpoint `POST /api/ai/generate-description` that takes a **task title** and asks the AI to generate a short, professional task description.
3. On failure or timeout, catch the error server-side and return a normal `200` response with a `fallback: true` flag instead of letting the request error out — the core app must keep working if the AI call fails.
4. Call this endpoint from a "Generate description" button on the React task-creation form; show a loading state while waiting, and display the result as an **editable suggestion** the user can accept or modify — never render raw JSON, and label it clearly as AI-generated.