# Deployment Guide

This repo is split into three deployable surfaces:

- `apps/api`: Express + Prisma backend
- `apps/web`: Next.js admin panel, kiosk, and member web app
- `apps/mobile`: Flutter native member app

## 1. Prerequisites

You need:

- Node.js 20+
- npm 10+
- Flutter 3.2+
- PostgreSQL
- Redis
- A production secret set for JWT

Use `.env.example` as the baseline for required variables.

## 2. Production Environment Variables

Set these before deploying:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `WEB_URL`
- `API_URL`
- `PLATFORM_DOMAIN`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `FIREBASE_*`
- `WATI_API_URL`
- `WATI_API_KEY`
- `MSG91_AUTH_KEY`
- `MSG91_SENDER_ID`
- `MSG91_OTP_TEMPLATE_ID`
- `R2_*` if file uploads are enabled

## 3. Database

Use the hosted PostgreSQL instance for production.

Suggested flow:

```bash
npm install
npm run db:push
npm run db:seed
```

If you want migrations instead of push, generate and apply Prisma migrations in `packages/db`.

## 4. API Deployment

Deploy `apps/api` to Railway, Render, Fly.io, or any Node host.

Recommended build/start commands:

```bash
npm run build --workspace=api
npm run start --workspace=api
```

Make sure the runtime has:

- `DATABASE_URL`
- `JWT_SECRET`
- Redis access if any background jobs or rate limiting depend on it

## 5. Web, Kiosk, and Member Web App

Deploy `apps/web` to Vercel.

These are all served from the same Next.js app:

- Admin dashboard: `/dashboard`
- Kiosk: `/kiosk`
- Member web app: `/member-app`

Important production env values on Vercel:

- `API_URL` pointing to the deployed API
- `WEB_URL` pointing to the deployed web domain
- `PLATFORM_DOMAIN` for tenant-aware routing if used

Build command:

```bash
npm run build --workspace=web
```

Start command for a self-hosted deployment:

```bash
npm run start --workspace=web
```

### Kiosk notes

- Open `/kiosk` in fullscreen on the reception tablet.
- Use a dedicated browser profile or pinned PWA if possible.
- Keep the tablet logged in and disable sleep while in kiosk mode.

### Member web app notes

- Serve `/member-app` as the mobile web companion.
- If you need installable behavior, confirm the PWA manifest and service worker are live in production.

## 6. Mobile App Deployment

Deploy `apps/mobile` separately through Flutter release channels.

Common build commands:

```bash
cd apps/mobile
flutter pub get
flutter build apk
flutter build appbundle
```

For iOS:

```bash
flutter build ipa
```

Typical release path:

- Android: upload the AAB to Google Play Console
- iOS: upload the IPA to TestFlight/App Store Connect

Make sure Firebase, API base URLs, and any platform-specific signing settings are configured before building.

## 7. Recommended Release Order

1. Deploy the API.
2. Run database setup against production.
3. Deploy the web app.
4. Verify `/dashboard`, `/kiosk`, and `/member-app`.
5. Build and publish the mobile app.

## 8. Quick Verification Checklist

- Login works on web.
- Member list and detail routes load.
- Check-in flow works in `/kiosk`.
- QR scan and member app routes work.
- Mobile app can authenticate and hit the production API.
- Background jobs run on schedule.
