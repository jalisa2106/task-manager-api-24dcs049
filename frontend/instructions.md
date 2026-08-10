# Task Manager API — Practical Guide (Practicals 4–13)

**Subject:** Advanced Web Development Frameworks (ITUE301) | Semester 5
**Repo:** `task-manager-api-24dcs049` ([backend](https://github.com/jalisa2106/task-manager-api-24dcs049/tree/main/backend) + [frontend](https://github.com/jalisa2106/task-manager-api-24dcs049/tree/main/frontend))

> Practicals 1–3 belong to the separate `portfolio-<rollno>` React project and are **not** covered here. This guide covers only the practicals that build on the Task Management application — Practical 4 through Practical 13.

**Current repo status (checked before writing this guide):**
- `backend/server.js` — Express server with in-memory `tasks` array, request-logging middleware, all 4 CRUD routes (`GET/POST/PUT/DELETE /tasks`), and a global error handler. This is essentially **Practical 4's core**, already implemented.
- `frontend/src/App.jsx` + `frontend/src/api.js` — a single-page React UI (no router, no separate component files) that calls the backend for create/read/update/delete, with loading and error states. This already covers a chunk of **Practical 6's** integration goal, but predates Practicals 1–3/8 conventions (no React Router, no component splitting, no lazy loading yet) and has none of Practicals 5, 7, 9–13 (no MongoDB, no auth, no caching, no events, no Docker, no CI, no AI).

Each section below is self-contained: objective, what you must build, exact steps, and the rubric so you know what's being graded.

---

## Practical 4: Building a RESTful API with Node.js and Express

**Objective:** Design and implement a RESTful backend server with complete CRUD endpoints using an Express middleware pipeline.

**Status in repo:** Already implemented in `backend/server.js`. Use this section to verify/complete it rather than start from scratch.

### Requirements
- 4 CRUD endpoints: `GET /tasks`, `POST /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id`, using an in-memory array (no DB yet).
- A **request logging middleware** (applied globally) that logs method, URL, and timestamp for every request.
- A **global error-handling middleware**, defined **last** in the pipeline.
- Correct HTTP status codes: `200` (OK), `201` (Created), `404` (Not Found), `500` (Server Error).

### Steps
```bash
mkdir task-manager-api && cd task-manager-api
npm init -y
npm install express
```
Set up `server.js`:
```js
const express = require('express');
const app = express();
app.use(express.json());
app.listen(5000, () => console.log('Server running on port 5000'));
```
Add global request logging middleware (before the routes):
```js
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});
```
Implement the 4 CRUD routes against an in-memory array, then add the global error handler as the **final** middleware:
```js
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});
```
Test all 4 endpoints with Postman/Thunder Client and confirm status codes.

### Gaps to close (based on current `server.js`)
- Add a **404 handler for undefined routes** returning structured JSON (Supplementary Problem — worth doing since it's cheap and reused conceptually in later practicals).
- Add a middleware that rejects `POST`/`PUT` requests missing a `Content-Type: application/json` header.

### Rubric (20 marks, pass = 14)
| Criteria | Marks |
|---|---|
| Environment/Server Setup | 3 |
| REST Endpoints (all 4 CRUD, correct methods/status codes) | 8 |
| Request Logging Middleware | 4 |
| Global Error Handling (last in pipeline, structured JSON) | 5 |

### GitHub deliverables
- Repo named `task-manager-api-<rollno>` (done — `task-manager-api-24dcs049`).
- Working Express server with all 4 CRUD routes + middleware pipeline.
- Clean `.gitignore` (`node_modules` excluded).
- At least one meaningful commit message describing the work.

---

## Practical 5: MongoDB Integration and Schema Design with Mongoose

**Objective:** Connect MongoDB to the Express server and enforce data validation through a Mongoose schema.

**Status in repo:** Not yet done — `tasks` is still a plain in-memory array. This is the next practical to implement.

### Requirements
- Task schema with at least 4 fields: `title` (String, required), `description` (String), `completed` (Boolean, default `false`), `createdAt` (Date, default `Date.now`).
- Replace the in-memory array from Practical 4 with real Mongoose model operations.
- Test all CRUD operations against the live database via Postman.
- Validation errors must be returned as structured JSON, not raw Mongoose error objects.

### Steps
```bash
npm install mongoose dotenv
```
Create `.env` (never commit this):
```
MONGO_URI=your_connection_string_here
```
Connect inside `server.js`:
```js
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));
```
Create `models/Task.js`:
```js
const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Task', taskSchema);
```
Replace the in-memory logic with Mongoose calls: `Task.find()`, `Task.create()`, `Task.findByIdAndUpdate()`, `Task.findByIdAndDelete()`. Wrap every route in `try/catch` and forward errors with `next(err)` to the global error handler. Test all 4 endpoints in Postman and confirm data survives a server restart.

### Rubric (20 marks, pass = 14)
| Criteria | Marks |
|---|---|
| MongoDB Connection (via `.env`, logged on connect) | 3 |
| Schema Design (4+ fields, correct types, ≥2 required, ≥1 default) | 5 |
| CRUD via Mongoose (all 4 ops working against live DB) | 8 |
| Validation Enforcement (missing required field → descriptive JSON error) | 4 |

### GitHub deliverables
- Same repo, updated with new commits.
- `.env` excluded via `.gitignore`; provide `.env.example` instead.
- At least one commit specifically for MongoDB/Mongoose integration.

---

## Practical 6: Full Stack Integration — React + Node + MongoDB

**Objective:** Wire the React frontend to the Node/Express/MongoDB backend into one working full-stack app.

**Status in repo:** Partially done — `App.jsx`/`api.js` already call the backend for CRUD with loading/error handling. What's missing is CORS setup verification, and once Practical 5 lands, the frontend needs to keep working against the MongoDB-backed API (no frontend code changes required if `api.js` contract stays the same, but re-verify after the swap).

### Requirements
- Connect the React Task UI to the Node+MongoDB backend from Practicals 4–5.
- Support create, view, update, delete from the React interface via API calls.
- Data must persist in MongoDB — confirmed by refreshing the browser.
- Handle loading and error states for **every** API interaction (not just the initial fetch) — already satisfied by the current `actionLoadingId` pattern in `App.jsx`.

### Steps
```bash
npm install cors
```
```js
const cors = require('cors');
app.use(cors());
```
In React, keep a central `api.js` with the base backend URL (already present):
```js
const BASE_URL = 'http://localhost:5000';
export const getTasks = () => fetch(`${BASE_URL}/tasks`).then(res => res.json());
```
Build a task creation form that `POST`s and updates local state on success (done). Implement `PUT`/`DELETE` actions, each followed by a state update or re-fetch (done). Test the full flow: create → view → update → delete, refreshing the browser to confirm persistence against MongoDB.

### Rubric (20 marks, pass = 14)
| Criteria | Marks |
|---|---|
| API Connection from React (correct base URL, no CORS errors) | 5 |
| Create Operation (persists, appears without refresh) | 4 |
| Read Operation (list loads on mount) | 3 |
| Update Operation (edit reflected in UI + DB) | 4 |
| Delete Operation (removes without full reload) | 4 |

### GitHub deliverables
- Two repos or one monorepo, clearly separating frontend/backend (current single repo with `backend/`+`frontend/` folders satisfies this).
- README with instructions to run both frontend and backend locally.
- At least one commit specifically for full-stack integration.

---

## Practical 7: Authentication and Middleware Pipeline

**Objective:** Implement JWT-based authentication and input validation in the Express middleware pipeline.

### Requirements
- User registration + login.
- Passwords hashed with **bcrypt** before saving.
- JWT generated on login with a reasonable expiry (e.g., 1 hour).
- All task routes protected by an auth middleware that verifies the JWT.
- Server-side input validation that rejects malformed requests (e.g., missing title) before they reach the database.

### Steps
```bash
npm install bcryptjs jsonwebtoken
```
Create a `User` schema with `email` and hashed `password`.

Register route:
```js
const hashedPassword = await bcrypt.hash(password, 10);
const user = await User.create({ email, password: hashedPassword });
```
Login route:
```js
const isMatch = await bcrypt.compare(password, user.password);
const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
```
Auth middleware:
```js
const token = req.headers.authorization?.split(' ')[1];
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = decoded;
```
Apply this middleware to all `/tasks` routes. Add a validation middleware that checks required fields exist before the controller runs. Test in Postman: register → login → copy token → access protected task routes with `Authorization: Bearer <token>`.

### Rubric (20 marks, pass = 14)
| Criteria | Marks |
|---|---|
| User Registration (hashed password) | 3 |
| JWT Login Flow (signed token + expiry) | 5 |
| Auth Middleware (rejects missing/invalid token with 401) | 5 |
| Input Validation (≥3 rules, descriptive errors) | 4 |
| Error Response Structure (consistent JSON, no stack traces) | 3 |

### GitHub deliverables
- Same repo, new commits. `.env` excludes `JWT_SECRET`; never commit it.
- Working register/login flow with JWT-protected task routes.
- At least one commit specifically for authentication.

---

## Practical 8: Performance Optimization and Lazy Loading in React

**Objective:** Improve frontend performance using lazy loading and code splitting.

**Note:** This assumes route-based components (Home/Projects/Contact-style pages) from Practicals 1–3's routing pattern. Since the current Task Manager frontend is a single-page `App.jsx`, first split it into at least two route-level components (e.g., a `TaskBoard` view and a secondary view/page) so there's something meaningful to lazy-load — or apply `React.lazy` to a heavy sub-section of the board (e.g., a stats/detail panel) if you keep it single-route.

### Requirements
- Apply `React.lazy()` + `Suspense` to at least 2 route-based (or equivalently heavy) components.
- Meaningful fallback UI while a chunk loads.
- Measure and compare bundle size/load time before and after optimization.
- Document the before/after comparison with screenshots or recorded values.

### Steps
```bash
npm run build
# note the reported bundle size
```
Open DevTools → Network tab, reload, note total JS transferred and load time (baseline).
```js
import { lazy, Suspense } from 'react';
const Projects = lazy(() => import('./pages/Projects'));
const Contact = lazy(() => import('./pages/Contact'));
```
```jsx
<Suspense fallback={<div>Loading page...</div>}>
  <Routes>
    <Route path="/projects" element={<Projects />} />
    <Route path="/contact" element={<Contact />} />
  </Routes>
</Suspense>
```
Rebuild, confirm separate chunk files exist. Reload with Network tab open, throttle to "Slow 3G", and observe the fallback UI render before the chunk loads. Record post-optimization metrics.

### Rubric (20 marks, pass = 14)
| Criteria | Marks |
|---|---|
| Lazy Loading Implementation (`React.lazy` on ≥2 components + `Suspense`) | 6 |
| Code Splitting Evidence (separate chunks visible in Network tab) | 5 |
| Before/After Comparison (bundle size + load time, explained) | 5 |
| Fallback UI (renders correctly, doesn't crash on slow chunk) | 4 |

### GitHub deliverables
- Lazy loading applied to ≥2 route-based components with a `Suspense` fallback.
- Before/after screenshots or recorded metrics in the README or a `docs/` folder.
- At least one commit specifically for performance optimization.

---

## Practical 9: In-Memory Caching and Query Optimization

**Objective:** Implement server-side caching and measure its impact on API response time.

### Requirements
- Cache the `GET /tasks` response with `node-cache`, TTL ~60s.
- Invalidate the cache on every write (`POST`/`PUT`/`DELETE`) so stale data is never served.
- Record and compare response times with vs. without caching (≥3 samples each).

### Steps
```bash
npm install node-cache
```
Shared cache module:
```js
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60 });
module.exports = cache;
```
`GET /tasks`:
```js
const cached = cache.get('all_tasks');
if (cached) return res.json(cached);
const tasks = await Task.find();
cache.set('all_tasks', tasks);
res.json(tasks);
```
Invalidate inside `POST`/`PUT`/`DELETE` handlers after a successful write:
```js
cache.del('all_tasks');
```
In Postman, send `GET /tasks` 3 times and record the "Time" field. Temporarily disable the cache check and repeat for comparison. Record both sets of readings.

### Rubric (20 marks, pass = 14)
| Criteria | Marks |
|---|---|
| `node-cache` Setup | 4 |
| Cache on GET (hit returns cached, miss fetches + stores) | 5 |
| Cache Invalidation (cleared on every write) | 5 |
| Response Time Comparison (measured, documented difference) | 6 |

### GitHub deliverables
- `node-cache` implementation with correct invalidation on all writes.
- Response-time comparison data (cached vs. uncached) in README or `docs/`.
- At least one commit specifically for caching.

---

## Practical 10: Asynchronous Processing with Event-Driven Architecture

**Objective:** Implement non-blocking background processing using Node's built-in `EventEmitter` (no external dependencies).

### Requirements
- Emit a `task-created` event when a new task is created via the API, handled asynchronously.
- The event handler logs a notification (task title, timestamp, assigned user) **without blocking** the response.
- The API response must return before the event handler finishes.
- Demonstrate the sync-vs-async difference with timestamp logs at both the response point and the handler point.

### Steps
`events.js`:
```js
const EventEmitter = require('events');
class TaskEvents extends EventEmitter {}
module.exports = new TaskEvents();
```
`listeners.js`:
```js
const taskEvents = require('./events');
taskEvents.on('task-created', (task) => {
  console.log(`[Notification] Task "${task.title}" created at ${new Date().toISOString()}`);
});
```
Inside `POST /tasks`, emit right after saving, then respond:
```js
const task = await Task.create(req.body);
console.log(`[API] Response sent at ${new Date().toISOString()}`);
res.status(201).json(task);
taskEvents.emit('task-created', task);
```
Create a task via Postman and observe console log ordering. Add an artificial delay in the listener to make the async behavior obvious. Confirm the API response timestamp appears **before** the listener's completion timestamp.

### Rubric (20 marks, pass = 14)
| Criteria | Marks |
|---|---|
| EventEmitter Setup (dedicated module) | 4 |
| Event Emission on Task Create (carries title/timestamp/data) | 5 |
| Async Handler (response returns before handler completes) | 5 |
| Timestamp Logging Evidence (ordering demonstrated live) | 6 |

### GitHub deliverables
- Working EventEmitter-based notification system with ≥1 custom event.
- Console log evidence (screenshot/recording) showing response-before-handler ordering.
- At least one commit specifically for event-driven async processing.

---

## Practical 11: Containerization with Docker and Docker Compose

**Objective:** Containerize the full-stack app with Docker and orchestrate services with Docker Compose.

### Requirements
- Dockerfile for the React frontend.
- Dockerfile for the Node/Express backend.
- `docker-compose.yml` orchestrating 3 services: frontend, backend, MongoDB.
- Correct port mappings + internal Docker network for inter-service communication.
- Entire app starts with a single `docker-compose up`, no manual steps.

### Steps
```bash
docker --version
docker compose version
```
`backend/Dockerfile`:
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```
`frontend/Dockerfile`:
```dockerfile
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview", "--", "--host"]
```
`docker-compose.yml` at the project root defining all 3 services (build context, ports, `depends_on`). Update the backend's MongoDB connection string to use the service name, e.g. `mongodb://mongodb:27017/taskdb`, instead of `localhost`. Run:
```bash
docker-compose up --build
docker ps
```

### Rubric (20 marks, pass = 14)
| Criteria | Marks |
|---|---|
| Dockerfile Frontend (correct base image, build+serve steps) | 4 |
| Dockerfile Backend (correct base image, deps installed, starts) | 4 |
| Docker Compose File (3 services, correct ports, networked) | 6 |
| Single Command Run (`docker-compose up` alone, all 3 containers up) | 6 |

### GitHub deliverables
- Dockerfiles for both frontend and backend, plus a working `docker-compose.yml`.
- README updated with instructions to run the full stack via `docker-compose up`.
- At least one commit specifically for containerization.

---

## Practical 12: CI/CD Pipeline with GitHub Actions

**Objective:** Automate testing (and prep for deployment) using GitHub Actions.

### Requirements
- Workflow runs automatically on every push to `main`.
- Pipeline installs dependencies (`npm install`) as a defined step.
- Pipeline runs ≥1 automated test with a clear pass/fail status.
- Demonstrate a failed pipeline (deliberately broken test) and then a fixed/passing one.

### Steps
```bash
npm install --save-dev jest supertest
```
Example test:
```js
test('GET /tasks returns 200', async () => {
  const res = await request(app).get('/tasks');
  expect(res.statusCode).toBe(200);
});
```
`.github/workflows/ci.yml`:
```yaml
name: CI Pipeline
on:
  push:
    branches: [main]
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm install
      - run: npm test
```
Commit and push; confirm the workflow appears under the **Actions** tab. Deliberately break the test and push again to see the red X, then fix it and push again to see it turn green. Screenshot both runs.

### Rubric (20 marks, pass = 14)
| Criteria | Marks |
|---|---|
| Workflow File (valid YAML, correct path, push trigger) | 4 |
| Dependency Install Step (`npm install` runs, logged) | 3 |
| Automated Test Step (≥1 real test, pass/fail visible) | 5 |
| Failed Pipeline Demo (broken test → visible failure) | 4 |
| Fixed Pipeline Demo (fixed test → green checkmark) | 4 |

### GitHub deliverables
- Working `.github/workflows/ci.yml` with install + test steps.
- Screenshots of a failed and a passed pipeline run in README or `docs/`.
- At least one commit specifically for CI pipeline setup.

---

## Practical 13: AI API Integration into a Web Application

**Objective:** Integrate an external AI service into the app and apply responsible-AI practices.

### Requirements
- Add an AI-powered feature with a real purpose (e.g., auto-generate a task description, suggest a priority, propose a deadline from the task title).
- API key stored and used **only** on the backend (`.env`), never exposed to the frontend.
- Graceful degradation: if the AI call fails/times out, the core app keeps working.
- AI response displayed meaningfully in the React UI — not raw JSON.

### Steps
```bash
npm install openai
```
`.env`:
```
OPENAI_API_KEY=your_key_here
```
Backend route:
```js
const OpenAI = require('openai');
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/ai/generate-description', async (req, res) => {
  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: `Write a short task description for: ${req.body.title}` }]
    });
    res.json({ description: completion.choices[0].message.content });
  } catch (err) {
    res.status(200).json({ description: '', fallback: true });
  }
});
```
On the frontend, add a "Generate description" button on the task creation form that calls this endpoint, and show the result as an **editable** suggestion the user can accept or modify. Test the failure path with a temporarily invalid key and confirm the app shows a fallback message instead of crashing.

### Rubric (20 marks, pass = 14)
| Criteria | Marks |
|---|---|
| API Integration (called from backend only, key never exposed) | 5 |
| Feature Meaningfulness (real use, not a raw prompt demo) | 5 |
| Graceful Degradation (app survives AI failure, friendly fallback) | 5 |
| Response Handling (parsed + rendered meaningfully, no raw JSON) | 5 |

### GitHub deliverables
- Working AI-powered feature with graceful failure handling.
- `.env` excluded via `.gitignore`; no API key committed anywhere in history.
- At least one commit specifically for AI integration.

---

## Suggested build order

Given the current repo state, the logical path from here is:

1. **Practical 4** — close the two small gaps (404 handler, Content-Type check); otherwise done.
2. **Practical 5** — swap the in-memory array for MongoDB/Mongoose (biggest structural change; everything downstream depends on it).
3. **Practical 6** — re-verify the existing React CRUD flow still works end-to-end against the Mongo-backed API; add CORS if not already present.
4. **Practical 7** — add auth (register/login/JWT) and protect the task routes.
5. **Practical 8** — split the frontend into at least two routed views so lazy loading has something real to defer.
6. **Practical 9** — add `node-cache` on top of the now-Mongo-backed `GET /tasks`.
7. **Practical 10** — add the `EventEmitter` notification on task creation.
8. **Practical 11** — containerize frontend, backend, and MongoDB.
9. **Practical 12** — add Jest/Supertest + the GitHub Actions workflow.
10. **Practical 13** — add the AI-assisted description feature last, since it's independent of the others.
