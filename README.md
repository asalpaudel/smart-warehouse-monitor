# Smart Warehouse Monitor

Dashboard for keeping an eye on sensor nodes spread across a warehouse. Cold storage, loading bay, two aisles, packing floor. Each node reports temperature, humidity and vibration once a second; the app streams that in live, rolls it up into per-zone windows, and flags anything that crosses a threshold.

React + Vite + Zustand + Tailwind on the front, Express on the back. Live data goes over Server-Sent Events, aggregates over plain REST that the client polls.

## Running it

Two terminals.

```bash
cd server && npm install && npm run dev
```

```bash
cd client && npm install && npm run dev
```

Server listens on 4000, client on 5173 and proxies `/api` to the server. Log in with `operator` / `warehouse123`.

## Pages

- **Login** - dummy creds, token kept in sessionStorage
- **Overview** - live stream. Avg temp, avg humidity, peak vibration, sensor count, critical count, plus the last 15 events. LIVE dot and last update time top right.
- **Analytics** - polled from `/api/dashboard/summary`. Per zone averages over the last 60s, delta against the 60s before, bar charts.
- **Alerts** - polled from `/api/dashboard/alerts`. Filter by zone and severity, search, sort by column, click a row for a drawer with that sensor's recent readings.
- **Settings** - poll interval (5 to 15s), pause/resume the stream, client side threshold sliders that hide low alerts.
- **Profile** - who's signed in, session info, sign out.

## API

```
POST /api/auth/login              { username, password } -> { token, user }
POST /api/auth/logout
GET  /api/auth/me                 checks the token, used on page load
GET  /api/stream/telemetry?token= SSE, one reading per sensor per second
GET  /api/dashboard/summary       per zone averages + deltas for the last window
GET  /api/dashboard/alerts        sensors over threshold, first/last seen
```

Everything except login wants `Authorization: Bearer <token>`. The stream takes the token as a query param because EventSource can't set headers.

Sessions live in memory on the server and expire after 30 minutes. If any call comes back 401 the client drops the session and sends you to login with a note.

## How the data is made

`server/src/telemetry.js` runs 12 fake sensors on a one second tick. Each metric does a random walk around a per zone baseline with a small pull back toward it and the odd spike, so values wander but don't run off. Status is OK / WARN / CRITICAL from fixed thresholds and the event type is UPDATE, ALERT when status gets worse, RECOVERY when it goes back to OK. The last three minutes are kept in a buffer and the summary and alerts endpoints are computed from that on each request.

## Layout

```
server/src/
  index.js       express app
  auth.js        login, logout, me, requireAuth
  telemetry.js   fake sensors, history buffer, thresholds
  stream.js      sse endpoint
  dashboard.js   summary + alerts
client/src/
  pages/         one file per page
  components/    Layout (sidebar + page transitions)
  store/         session, telemetry, settings (zustand)
  hooks/         usePolling
  api.js         fetch wrapper, handles 401
```

## Things I'd do with more time

- Persist sessions and thresholds server side instead of in memory / localStorage
- Reconnect the stream with backoff instead of relying on the browser's default retry
- Tests around the aggregation code
- Dark mode, the tokens are already in one place so it wouldn't be much
