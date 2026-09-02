# SmartInventory Web

React + TypeScript frontend for the SmartInventory API.

## Prerequisites

- Node.js 20+
- SmartInventory API running at `https://localhost:7287` (see `SamrtInventory.API/Properties/launchSettings.json`)

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). API requests are proxied to the backend via Vite (see `vite.config.ts`).

## Environment

Copy `.env.example` to `.env` if you need to point at a different API host:

```
VITE_API_BASE_URL=https://localhost:7287
```

Leave empty to use the dev proxy.

## Features

- Login / register with JWT storage in `sessionStorage`
- Automatic token refresh on `401`
- Product list with live SignalR `StockChanged` updates
- Product detail with optimistic-concurrency decrement flow (`409` handling)
- Admin-only create / edit / delete (role from JWT)

## Build

```bash
npm run build
npm run preview
```
