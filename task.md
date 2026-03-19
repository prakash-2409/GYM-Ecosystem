# GymOS Project Task Tracker

This document tracks the current completion state of the GymOS (White-Label Gym Management SaaS) project, specifically tailored for handover to AI coding assistants like VS Copilot or Cursor.

## Completed Tasks ✅

### 1. Project Infrastructure
- [x] Turborepo (`turbo.json`) monorepo setup.
- [x] Shared Packages (`packages/db`, `packages/shared`) setup.
- [x] Database Schema with Prisma (tables for Gyms, Members, Check-ins, Subscriptions, Body Stats, Users/Staff).
- [x] Docker compose setup for PostgreSQL.

### 2. Backend API (`apps/api`)
- [x] Express.js/Node.js scaffolding.
- [x] Authentication & Roles (JWT).
- [x] Member Management (CRUD for members, check-ins, subscriptions).
- [x] API Routes (`members`, `checkin`, `gym`, `bodystats`).
- [x] Integrations:
  - WATI API (WhatsApp) (`whatsapp.service.ts`).
  - MSG91 (SMS) (`sms.service.ts`).
  - FCM (Firebase Cloud Messaging) (`fcm.service.ts`).
- [x] Cron Jobs setup (`feeReminder`, `feeOverdue`, `planExpiry`, `inactivity`, `birthday`, `weeklySummary`).

### 3. Next.js Web Admin (`apps/web`)
- [x] Fees Page (Summary, due/overdue tabs, payment collection).
- [x] Member Profile (Overview, Attendance, Progress, Fee History, Notification Logs).
- [x] Notifications Page (Compose, rapid quick-send, target picker).
- [x] Settings (Gym config, branding colors, staff management).
- [x] Check-in system setup (QR codes fetching).

### 4. Flutter Mobile App (`apps/mobile`)
- [x] Dio client setup and `flutter_secure_storage`.
- [x] Firebase FCM push notifications handler.
- [x] UI Screens: 
  - Splash & Login (Mobile OTP).
  - Home (QR Scanner, attendance visualizer).
  - Notifications (History).
  - Progress (Measurements, `fl_chart` integration).
  - Profile (Dynamic QR code).

---

## Future Implementation & Pending UI Polish 🚧

**Note to VS Copilot / AI Assistant:** When implementing these features, you MUST rigorously follow the styling, speed, and standard guidelines stated in `DESIGN_SYSTEM.md`.

### Next Step Features:
- [ ] **Payments Integration:** Implement Razorpay online payment integration so members can pay via the app instead of manually at the front desk.
- [ ] **Workout Modules:** Create workout scheduling and tracking UI (Admin creates workouts, Member app shows daily workout).
- [ ] **Superadmin Dashboard:** Build features to register and onboard new Gym tenants from a centralized UI.
- [ ] **Asset Storage:** Implement S3 / Cloudflare R2 file uploads for member avatars and gym logos.

### Strict UI/UX Overhaul (As per `DESIGN_SYSTEM.md`):
- [ ] **Web Admin Polish:**
  - Verify all typography uses `Geist` (body/headings) and `Geist Mono` (numbers).
  - Ensure strict spacing (4px, 8px, 12px, 16px, 24px, 32px, 48px grids).
  - Convert any existing Modals used for forms into Right-Side Drawers (480px width).
  - Replace any "blank" empty states with SVG illustrations and actionable CTAs.
  - Implement full Skeleton loading states instead of spinners.
- [ ] **Mobile App Polish:**
  - Verify typography uses `DM Sans`.
  - Apply the strict Dark Theme requirements (Background `#0F0F0F`, Surface `#1A1A1A`).
  - Apply Bottom Sheet usage for choices, strictly avoiding popups.
  - Check micro-interactions (press scales, haptic feedback, check-in success animations).
  - Disable native white splash screens or backgrounds (protect gym users' eyes).
- [ ] **Universal Refinements:**
  - Ensure Lucide icons are used uniformly across Web and Mobile.
  - Implement Optimistic UI techniques on all state-mutating API calls.
  - Standardize error handling (inline errors for forms, never raw server errors).

---
*Created for VS Copilot context handoff. Read `DESIGN_SYSTEM.md` before coding!*
