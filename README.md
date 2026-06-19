# PERP — Pre-Delivery Inspection Report Platform

A production-quality, **offline-first Progressive Web App** for performing vehicle
**Pre-Delivery Inspections (PDI)** before accepting delivery of a new vehicle.
Mobile-first, installable, and fully functional without an internet connection.

> Built as a single Next.js 15 (App Router) application — no separate frontend/backend.

---

## ✨ Features

- **Dashboard** per vehicle — details, statistics, completion %, overall score, progress, last-updated.
- **Data-driven checklist** — Exterior, Under The Hood, Interior, Electronics, Test Drive,
  Accessories & Delivery, Forgotten Checks, Final Delivery Review. Each item supports
  `PASS / FAIL / NA`, severity (`CRITICAL / MAJOR / MINOR`), notes, and photos.
- **Validation rule** — a `FAIL` requires notes **and** at least one photo; the inspection
  cannot be completed until every failed item satisfies this.
- **Vehicle intelligence** — VIN model-year decoder (age + fresh-inventory flag) and
  Tyre DOT decoder (`2626 → week 26 / 2026 / age / Fresh·Moderate·Old`).
- **Photos** — mobile camera capture, multi-upload, compression, preview, full-screen
  zoom viewer, delete, desktop drag-and-drop. **Stored only on the device** (IndexedDB) —
  images never leave the user's device or touch the server/codebase.
- **Quick Capture** — snap issues fast while walking the car, categorize later.
- **Vehicle Evidence** — dedicated capture slots (front/rear/sides/VIN/odometer/DOT/battery).
- **Search & Filters** — All / Pending / Passed / Failed / Critical / Major / Minor /
  Has Photos / Missing Notes, plus full-text search.
- **Sticky progress**, **critical-issue banner** (“DO NOT ACCEPT DELIVERY”),
  **scoring** (overall + exterior/interior/mechanical/electronics) and a
  **recommendation engine** (Accept / Review / Reject).
- **Dealer Rectification Tracker** and **Inspection Timeline**.
- **Photo Gallery** with category & failed-items filters.
- **Summary screen** with everything in one place.
- **Exports** — professional **PDF** report, **Print** view, and **JSON backup**;
  **Import** to restore.
- **Dark / Light / System** theme (persisted).
- **PWA** — installable on Android & iOS, offline support, service worker, app manifest,
  background sync to MongoDB when connectivity returns.

---

## 🧱 Tech Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn/ui (Radix) · Zustand ·
React Hook Form · Zod · Framer Motion · MongoDB + Mongoose · Dexie.js (IndexedDB) ·
`@ducanh2912/next-pwa` · jsPDF · Lucide React.

> **PWA note:** the spec calls for `next-pwa`. We use **`@ducanh2912/next-pwa`**, the
> actively-maintained successor that fully supports the Next.js App Router.

---

## 🚀 Getting Started

Requires **Node 20+** (an `.nvmrc` is included — run `nvm use`).

```bash
npm install
npm run dev
```

Open http://localhost:3000.

The app is **fully usable offline-only** with no configuration. To enable cloud
sync/backup, add your MongoDB connection string to **`.env.local`**:

```env
MONGODB_URI=your-mongodb-connection-string
```

(`.env.example` documents the variable. Next.js loads `.env.local`, not `.env.example`.)

---

## 🏗️ Architecture

**Dexie (IndexedDB) is the source of truth on the client.** MongoDB is a sync/backup
target. Every read/write hits Dexie first, so the app works instantly and fully offline.

```
Client (Dexie / IndexedDB)  ◄──►  Sync engine  ──►  Route Handlers  ──►  MongoDB
   source of truth                 (on reconnect)      /api/*            (text/metadata)
   photos as Blobs (device-only, never uploaded)
```

- When online and `MONGODB_URI` is set, the **sync engine** pushes dirty inspections up
  and pulls remote inspections down (so a fresh device/port hydrates from the DB).
  This is **text/metadata only**.
- **Photos are device-only.** They are compressed on-device and stored as Blobs in
  IndexedDB. They are never uploaded to the server, written to the codebase, or stored in
  MongoDB — so they do **not** appear on other devices. Use **JSON export/import** (which
  embeds photos as base64) to move a full inspection, photos included, between devices.

### Project structure

```
src/
  app/
    page.tsx                         # Home — inspection list
    settings/page.tsx                # Theme, thresholds, import, sync status
    inspections/new/page.tsx         # Vehicle intake (RHF + Zod, live VIN decode)
    inspections/[id]/
      layout.tsx                     # Bottom navigation
      page.tsx                       # Dashboard
      inspect/page.tsx               # Checklist (sections, filters, validation)
      evidence/page.tsx              # Vehicle evidence + tyre DOT tool
      quick/page.tsx                 # Quick capture
      gallery/page.tsx               # Photo gallery
      notes/page.tsx                 # Global notes (autosave)
      summary/page.tsx               # Summary + PDF / Print / JSON export
    api/
      health/route.ts                # reports whether Mongo is configured
      inspections/route.ts           # list / upsert (text only)
      inspections/[id]/route.ts      # get / delete
  components/ui/                      # shadcn-style primitives
  components/inspection/             # domain components
  components/layout/                 # app header, bottom nav, theme, sync badge
  config/checklist.ts                # data-driven checklist (all sections)
  config/evidence.ts                 # evidence capture slots
  lib/
    db/dexie.ts                      # IndexedDB schema
    db/mongoose.ts                   # cached connection
    db/models.ts                     # Mongoose models
    sync/syncEngine.ts               # offline-first sync
    image/compress.ts                # canvas compression
    vin/decode.ts  tyre/dot.ts       # vehicle intelligence
    scoring.ts                       # stats, scores, recommendation
    export/backup.ts  export/pdf.ts  # JSON + PDF
  stores/  hooks/  types/
```

### Database collections (Mongoose)

`Inspection` (embeds vehicle, items, timeline, notes, quick captures) and `Settings`,
plus `Vehicle` / `InspectionItem` registered for completeness. All use timestamps.
Photos are **not** stored server-side — they live only in the device's IndexedDB.

---

## 📦 Scripts

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start the dev server                 |
| `npm run build`     | Production build (generates SW)      |
| `npm run start`     | Run the production build             |
| `npm run lint`      | Lint                                 |
| `npm run typecheck` | Type-check without emitting          |
| `node scripts/generate-icons.mjs` | Regenerate PWA icons   |

---

## 🔌 Offline / PWA notes

- The service worker is generated on `build` and **disabled in dev** (standard for
  `next-pwa`); install and test offline behavior against `npm run build && npm run start`.
- **Photos never leave the device** — they are stored only in IndexedDB, so there are no
  image files in the repo and nothing to persist server-side. This also means the app
  deploys cleanly to serverless hosts (no writable filesystem needed).

---

## 🔐 Authentication

None — this is a personal-use application (no login, registration, or user management),
per spec. Use **JSON export/import** to move inspections between devices.
