# Smart Warehouse Monitor

Dashboard for keeping an eye on sensor nodes spread across a warehouse. Cold storage, loading bay, aisles, packing floor. Each node reports temperature, humidity and vibration; the app streams that in live, rolls it up every few seconds, and flags anything that crosses a threshold.

Built with React, Vite, Zustand and Tailwind on the front, Express on the back. Live data comes over Server-Sent Events, aggregates over plain REST.

## Running it

```bash
cd server && npm install && npm run dev
```

```bash
cd client && npm install && npm run dev
```

Server listens on 4000, client on 5173. Log in with `operator` / `warehouse123`.

## Layout

```
server/   express api, sse stream, dummy telemetry generator
client/   react app
```

More notes as it comes together.
