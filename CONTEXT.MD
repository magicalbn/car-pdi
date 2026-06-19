# Build PERP – Pre-Delivery Inspection Report Platform

Build a production-quality Progressive Web Application called **PERP (Pre-Delivery Inspection Report Platform)** for performing vehicle Pre-Delivery Inspections (PDI) before accepting delivery of a new vehicle.

The application should be optimized primarily for mobile devices used inside dealerships while still providing an excellent desktop experience.

The final application must feel like a professional field inspection tool, not a simple checklist.

---

# Tech Stack

Use:

* Next.js 15 (App Router)
* TypeScript
* Tailwind CSS
* shadcn/ui
* Zustand
* React Hook Form
* Zod
* Framer Motion
* MongoDB
* Mongoose
* Dexie.js (IndexedDB)
* next-pwa
* jsPDF
* html2canvas
* Lucide React

---

# Architecture Requirements

Use a single Next.js application.

DO NOT create separate frontend and backend projects.

Use:

* App Router
* Server Components where appropriate
* Client Components only when required
* Route Handlers for APIs
* Server Actions where beneficial
* Shared TypeScript types

Project Folder:

```text
PERP/
```

---

# Environment Variables

Store MongoDB connection in:

```env
MONGODB_URI=
```

Application must work after:

```bash
npm install
npm run dev
```

with only the MongoDB connection string required.

---

# Authentication

No authentication.

No login.

No registration.

No user management.

This is a personal-use application.

---

# Progressive Web App Requirements

The application must be fully installable as a PWA.

Requirements:

* Android install support
* iOS install support
* Offline support
* Add to Home Screen
* App manifest
* Service Worker
* Cached assets
* Background synchronization

Use:

```bash
next-pwa
```

Application should feel like a native mobile app.

---

# Offline First Design

The application must function fully without internet access.

Use Dexie.js (IndexedDB).

Store locally:

* Inspection drafts
* Notes
* Images
* Progress
* Pending uploads

When internet connectivity returns:

* Automatically sync to MongoDB

The user should never lose data.

---

# Image Upload Requirements

Do not use any cloud storage.

Store uploaded images locally.

Directory:

```text
/public/uploads/inspections/{inspectionId}
```

Features:

* Mobile camera capture
* Multiple image upload
* Image compression
* Image preview
* Full screen image viewer
* Delete image
* Drag and drop support on desktop

Images must remain available offline.

---

# Dashboard Screen

Display vehicle details:

* Make
* Model
* Variant
* VIN
* Engine Number
* Odometer Reading
* Manufacturing Date
* Dealer Name
* Inspection Date

Statistics:

* Total Sections
* Total Checks
* Passed
* Failed
* N/A
* Pending

Show:

* Completion %
* Overall inspection score
* Progress bar
* Last updated timestamp

---

# Vehicle Intelligence Features

## VIN Decoder

User enters VIN.

Automatically:

* Decode model year when possible
* Calculate vehicle age
* Flag old inventory

Display:

* Vehicle age
* Fresh inventory status

---

## Tyre Manufacturing Date Decoder

User enters tyre DOT code.

Example:

```text
2626
```

Display:

```text
Week 26
Year 2026
Tyre Age
Fresh / Moderate / Old
```

Highlight tyres older than acceptable thresholds.

---

# Inspection Workflow

Inspection should be organized into collapsible sections.

Each checklist item supports:

```ts
{
  status: "PASS" | "FAIL" | "NA",
  notes: string,
  photos: string[],
  timestamp: Date,
  severity: "CRITICAL" | "MAJOR" | "MINOR"
}
```

---

# Validation Rules

If status is FAIL:

Require:

* Notes
* At least one photo

User cannot complete inspection otherwise.

---

# Inspection Categories

Create a data-driven checklist system.

Checklist categories should be stored in reusable configuration files.

Include:

## Exterior

Paint & Bodywork

Glass

Lights

Wheels & Tyres

## Under The Hood

Engine Bay

Battery

## Interior

Seats

Dashboard

Cabin Features

Air Conditioning

## Electronics

Touchscreen

Bluetooth

Android Auto

Apple CarPlay

Navigation

Reverse Camera

Parking Sensors

Instrument Cluster

## Test Drive

Engine

Transmission

Steering

Brakes

Suspension

## Accessories & Delivery Items

Spare Wheel

Toolkit

Jack

Manuals

Warranty Documents

Spare Key

Accessories

## Forgotten Checks

Fuel Flap

Boot Operation

Rear Seat Folding

Horn

Wipers

Washers

TPMS

Reverse Camera Guidelines

## Final Delivery Review

VIN Captured

Odometer Captured

Photos Captured

Pending Issues Logged

Acceptance Review Complete

---

# Quick Capture Mode

Provide a fast inspection mode.

User should be able to:

* Open camera
* Capture issue
* Add quick note
* Save instantly

Categorization can happen later.

Useful while walking around the vehicle.

---

# Vehicle Evidence Capture

Dedicated section for capturing:

* Front View
* Rear View
* Left Side
* Right Side
* VIN Plate
* Odometer
* Tyre DOT Code
* Battery Label

These photos should appear in final reports.

---

# Notes System

Every inspection item supports notes.

Additionally provide:

## Global Inspection Notes

Sections:

* Dealer Feedback
* Negotiation Notes
* Pending Commitments
* Additional Observations

Support long-form notes.

Autosave continuously.

---

# Search & Filters

Implement:

Search checklist items.

Filters:

* All
* Pending
* Passed
* Failed
* Critical
* Major
* Minor
* Has Photos
* Missing Notes

---

# Progress Tracking

Sticky progress bar.

Show:

```text
Passed: 78
Failed: 3
Pending: 10
```

Section completion:

```text
Exterior 22/22 ✓
Interior 18/20
```

---

# Critical Issue Tracking

Display critical issues globally.

Example:

```text
Critical Issues: 2

DO NOT ACCEPT DELIVERY
```

Banner should remain visible.

---

# Dealer Rectification Tracker

For every failed item:

```ts
{
  issue: string,
  dealerAction: string,
  resolutionStatus: "PENDING" | "RESOLVED" | "REJECTED"
}
```

Useful when dealer promises fixes.

---

# Inspection Timeline

Track:

* Inspection Started
* Exterior Completed
* Test Drive Completed
* Inspection Finished

Display timeline in summary report.

---

# Scoring System

Generate:

* Overall Score
* Exterior Score
* Interior Score
* Mechanical Score
* Electronics Score

Example:

```text
Overall Score: 95/100
```

---

# Recommendation Engine

Generate:

### Safe To Accept

No critical issues.

### Review Before Acceptance

Several major issues found.

### Do Not Accept Delivery

Critical issues detected.

Show recommendation prominently.

---

# Photo Gallery

Create dedicated gallery page.

Features:

* Grid View
* Fullscreen View
* Zoom
* Category Filter
* Failed Items Filter
* Delete Image

---

# Summary Screen

Display:

Vehicle Information

Inspection Statistics

Completion Percentage

Score

Critical Issues

Major Issues

Minor Issues

Failed Items

Photos

Notes

Dealer Commitments

Timeline

Final Recommendation

---

# Export Features

Generate professional reports.

Formats:

* PDF
* Print View
* JSON Backup

PDF should include:

* Cover Page
* Vehicle Information
* Inspection Results
* Failed Items
* Images
* Notes
* Recommendation
* Timestamp

---

# Backup & Restore

Because there is no authentication:

Implement:

* Export Inspection
* Import Inspection

Use JSON files.

---

# Dark Mode

Support:

* Light Mode
* Dark Mode
* System Preference

Persist user preference.

---

# Database Collections

Create Mongoose models for:

* Vehicle
* Inspection
* InspectionSection
* InspectionItem
* Photo
* Settings

Use timestamps.

---

# UI/UX Requirements

The UI should feel like a premium mobile inspection application.

Requirements:

* Mobile-first
* Large touch targets
* Sticky actions
* Smooth animations
* Professional cards
* Excellent spacing
* Fast performance
* Native-app feel
* Works comfortably with one-handed use

Use shadcn/ui throughout.

Avoid generic admin-dashboard styling.

Design should feel similar to modern field inspection, auditing, or quality-control applications.

---

# Deliverables

Generate:

* Complete project structure
* All pages
* Components
* Zustand stores
* MongoDB integration
* Mongoose models
* Route handlers
* Server actions
* PWA setup
* Offline support
* Dexie implementation
* PDF export
* Local image uploads
* Dark mode
* Sample data
* TypeScript types
* README
* Setup instructions

The generated code should be production-quality, scalable, and immediately runnable.
