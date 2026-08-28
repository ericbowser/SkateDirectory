# SLC Skate Directory

Find a skatepark fast, check the vibe, and go skate.

Live site: [skatedir.com](https://skatedir.com)

---

## What this is

A map-first directory of skateparks around Salt Lake City and Utah. Pick a spot, see what it’s like, and get there — without digging through random forum posts or outdated lists.

**The goal:** make it extremely easy to navigate to a skate location, with **links and photos** so you can feel out the vibe before you drive.

---

## What you can do today

| Page | What it does |
|------|----------------|
| **Map** (`/`) | Interactive map of parks. Search any park by name. Click a marker for details. |
| **Parks** (`/parks`) | Sortable table of all parks — name, address, hours, lighting, website. |
| **Park details** | Hours, lighting, status, description, feature tags (bowl, street, rails, etc.), official website link, **Get directions** (Google Maps). |
| **Add Park** (`/skatepark-form`) | Submit a new park to the directory. |

Each park can include:

- **Official website** — city page, park page, rec center link  
- **Photos** — stored in the database; ready to show in the detail panel when images are added  
- **Features** — bowl, street course, transitions, rails, etc.  
- **Practical info** — open/close times, lighting, active/closed status  

---

## What we’re building toward

- **Photos on every park** — session shots so you can see layout, size, and crowd level before you go  
- **Richer “vibe” info** — surface type, skill level, best time of day, what’s nearby  
- **More Utah coverage** — parks outside the default SLC metro view (Tooele, Park City, Wendover, etc.) still searchable from the map  
- **Community additions** — easier submissions, corrections, and photo uploads after you visit  

---

## Quick start (local dev)

You need **two things running**: the React app and the Node/Postgres API.

```bash
# From SkateDirectory/
cp .env.example .env          # add GOOGLE_MAPS_JS_KEY
npm install
npm run dev                   # starts API (:3001) + Vite (:8006)
```

API database config lives in `../SkateDirectoryApi/.env`:

```env
PGHOST=127.0.0.1
PGDATABASE=ericbo
PGUSER=ericbo
PGPASSWORD=your_password
```

Open **https://localhost:8006**

---

## Project layout

```
SkateDirectory/          ← this repo (React + Vite frontend)
SkateDirectoryApi/       ← Node/Express API + Postgres (sibling folder)
```

| Path | Purpose |
|------|---------|
| `src/components/Map.jsx` | Map, search, markers |
| `src/components/SelectedParkPanel.jsx` | Park detail, photos, directions |
| `src/components/ParksList.jsx` | Full park table |
| `src/config/env.js` | API URLs (from `.env` / `.env.production`) |

Production builds use same-origin `/api/*` (nginx proxies to the backend). Local dev uses a Vite proxy — no `env.json`.

---

## Production deploy

The static build alone is not enough — **`/api/*` must reach the Node API**. Without that, `/api/getparks` returns the HTML homepage and the map shows “Expected park list array, got string”.

1. Run the API on the server (`SkateDirectoryApi`, port 3001, Postgres in `.env`).
2. Proxy `/api/` in nginx — see [`deploy/nginx-skatedir.conf`](deploy/nginx-skatedir.conf).
3. Verify: `curl https://skatedir.com/api/health` should return JSON, not HTML.

```bash
# Frontend — bake env at build time
cp .env.production .env.production.local   # add GOOGLE_MAPS_JS_KEY
npm run build                              # output in build/

# API — runtime .env on the server
# SkateDirectoryApi/.env with Postgres credentials
```

Or from the parent `Skate/` folder: `npm run docker:up` (web + api + postgres).

---

## Tech

- **Frontend:** React, Vite, Tailwind, Google Maps  
- **API:** Node, Express, PostgreSQL  
- **Data:** `skate.park`, features, photos in Postgres  

---

Questions or new parks? Use **Add Park** on the site or open an issue.
