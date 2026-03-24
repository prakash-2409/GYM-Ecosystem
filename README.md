# GymOS - White-Label Gym Management SaaS

 GymOS is a comprehensive, white-label SaaS platform designed specifically for gyms across India. It allows gym owners to manage memberships, fees, staff, attendance, and member body progress. It includes an automated notification system (WhatsApp, SMS, FCM) for fee reminders, inactivity nudges, and birthday wishes.

## Project Structure

This is a full-stack monorepo managed with Turborepo (`turbo.json`) and NPM Workspaces.

```
/
├── apps/
│   ├── api/       # Node.js/Express backend API
│   ├── web/       # Next.js web application (Admin Panel & Dashboard)
│   └── mobile/    # Flutter mobile application (Member App)
├── packages/
│   ├── db/        # Prisma ORM schema and database client
│   └── shared/    # Shared TypeScript types and utilities
```

## Current State & Progress

All foundational components, database schemas, and API scaffolding have been built.
The following major features are strictly implemented and **COMPLETE**:

### 1. Backend API (`apps/api`)
- **Authentication & Roles:** JWT-based authentication with roles for Gym Owner, Superadmin, Staff, and Members.
- **Member Management:** Full CRUD routes for members, check-ins, subscriptions.
- **Integrations Setup:**
  - **WhatsApp (`whatsapp.service.ts`):** WATI API integration with dry-run mode and rate-limiting for bulk messages.
  - **SMS (`sms.service.ts`):** MSG91 integration for OTP and WhatsApp fallbacks.
  - **FCM (`fcm.service.ts`):** Firebase Cloud Messaging push notifications for the mobile app.
- **API Routes:** Comprehensive routes for `members`, `checkin` (HMAC QR validation), `gym`, and `bodystats`.
- **Cron Jobs (`apps/api/src/jobs`):**
  - `feeReminder`: Daily 9 AM to remind members of upcoming fee expiry (3 days).
  - `feeOverdue`: Daily 10 AM overdue alerts (WhatsApp + SMS).
  - `planExpiry`: Daily 7 AM for 7-day/1-day warnings and auto-expiring subscriptions.
  - `inactivity`: Daily 8 AM nudging non-attending members.
  - `birthday`: Daily 8 AM birthday wishes.
  - `weeklySummary`: Weekly Monday 8 AM summary sent to gym owners.

### 2. Next.js Web Admin (`apps/web`)
- **Fees Page:** Summary cards, due vs. overdue tabs, payment collection drawer (Cash/UPI), bulk send reminders.
- **Member Profile:** Deep dive into a member with 5 rich tabs:
  - Overview / Info
  - Attendance (Visual Calendar)
  - Progress (Body Stats Tracking & Charts)
  - Fee History
  - Notification Logs
- **Notifications Page:** Compose panel, rapid quick-send options, target picker.
- **Settings:** Gym profile configuration, branding colors configuration, staff management, and Gym Check-in QR code fetching.

### 3. Flutter Mobile App (`apps/mobile`)
- **Core:** Dio client with JWT interceptor, `flutter_secure_storage`, GoRouter, dark theme, and Firebase FCM handler.
- **Screens:**
  - Splash & Login (Mobile OTP).
  - Home: Dashboard with camera QR scanner for gym check-ins, attendance visualizer.
  - Notifications: History of received push/messages.
  - Progress: Body measurements logging and `fl_chart` based weight tracking.
  - Profile: Configured dynamic QR code specifically for the user.

## Environment Variables

Check `.env.example` in the root for a reference of what variables are required. Make sure to define:
- `DATABASE_URL`: Your PostgreSQL instance.
- `JWT_SECRET`: For authentication.
- `FIREBASE_*`: Service account details for FCM.
- `WATI_API_KEY` & `MSG91_AUTH_KEY`: For WhatsApp and SMS gateways.

## How to Run Locally

### 1. Database Start & Preparation
```bash
docker-compose up -d
npm run db:push
npm run db:seed  # Optional: seed initial platform data
```

### 2. Install Dependencies
```bash
npm install
cd apps/mobile && flutter pub get
```

### 3. Run Web & API Environment
```bash
npm run dev
```

### 4. Run Flutter Mobile App
```bash
cd apps/mobile
flutter run
```
