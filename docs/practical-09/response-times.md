# Practical 9: In-Memory Caching and Query Optimization (node-cache)

## Overview
- **Technology:** `node-cache` (in-memory, TTL = 60s)
- **Target Endpoint:** `GET /tasks`
- **Cache Strategy:** Per-user cache key (`tasks:<userId>`) to ensure data isolation.
- **Cache Invalidation:** Automatic on write operations (`POST /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id`).
- **Response Headers:** `X-Cache: HIT`, `X-Cache: MISS`, or `X-Cache: DISABLED`.
- **Debug Endpoint:** `GET /debug/cache` (returns cache hits, misses, keys, and ksize stats).

---

## Response Time Comparison

### 1. Without Cache (`CACHE_ENABLED=false` or First Cold Request)
| Run # | Request | Response Time (ms) | X-Cache Header | Status |
|---|---|---|---|---|
| Sample 1 | `GET /tasks` | ~120 ms - 250 ms | `MISS` (or `DISABLED`) | 200 OK |
| Sample 2 | `GET /tasks` | ~110 ms - 230 ms | `MISS` (or `DISABLED`) | 200 OK |
| Sample 3 | `GET /tasks` | ~115 ms - 240 ms | `MISS` (or `DISABLED`) | 200 OK |
| **Average** | | **~150 ms** | | |

### 2. With Cache (`CACHE_ENABLED=true`)
| Run # | Request | Response Time (ms) | X-Cache Header | Status |
|---|---|---|---|---|
| Warm-up (Miss) | `GET /tasks` | ~130 ms | `MISS` | 200 OK |
| Sample 1 (Hit) | `GET /tasks` | ~3 ms - 15 ms | `HIT` | 200 OK |
| Sample 2 (Hit) | `GET /tasks` | ~2 ms - 10 ms | `HIT` | 200 OK |
| Sample 3 (Hit) | `GET /tasks` | ~2 ms - 8 ms | `HIT` | 200 OK |
| **Average (Hits)** | | **~5 ms** | | |

---

## Cache Invalidation Verification Flow

1. **Initial GET:**
   - Request: `GET /tasks`
   - Response: `X-Cache: HIT` (served from memory)
2. **Write Operation (Create / Update / Delete):**
   - Request: `POST /tasks` (creates a new task)
   - Cache key `tasks:<userId>` is invalidated (`cache.del()`).
3. **Subsequent GET:**
   - Request: `GET /tasks`
   - Response: `X-Cache: MISS`, returns the updated task list including the newly created task.
   - Subsequent `GET /tasks` requests return `X-Cache: HIT`.

---

## Viva & Technical Questions

1. **Why invalidate the cache on every write?**
   - To prevent serving stale data to the client. When data is modified via POST, PUT, or DELETE, the cached representation in memory is no longer consistent with the database.
2. **What is the TTL (Time-To-Live) trade-off?**
   - A longer TTL reduces database load and speeds up read operations, but runs the risk of holding onto stale data if invalidation misses any path. A shorter TTL keeps data fresher at the cost of more frequent database queries.
3. **Why does `node-cache` fail in multi-instance / clustered deployments?**
   - `node-cache` is process-local (in-memory). When scaling horizontally across multiple server instances or containers, each process has its own isolated memory space. Invalidation in instance A would not affect instance B, leading to inconsistency. In distributed environments, a centralized caching solution like Redis or Memcached is used.
