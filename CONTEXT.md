# Project Name and Purpose
- **What is this**: GymOS — a white-label gym management SaaS specifically built for India.
- **Who is the customer**: Gym owners in India.
- **Business model**: Monthly SaaS pricing ranging from ₹799 to ₹2499/month.
- **Key selling point**: Each gym gets their own uniquely branded system (colors, logos), rather than a shared, generic app where everything looks identical.
- **Competitors**: JetFitness, FitGymSoftware.

# Tech Stack
- **Web App**: Next.js, Tailwind CSS, TypeScript
- **API Backend**: Node.js, Express.js
- **Database**: PostgreSQL (managed via Prisma ORM)
- **Mobile**: Flutter / PWA capabilities
- **Notifications**: Firebase Cloud Messaging (FCM), WATI (WhatsApp), MSG91 (SMS)
- **Hosting**: Railway, Vercel
- **File Storage**: Cloudflare R2

# Current Project Structure
- `apps/web/` - Next.js front-end for the Admin Panel, Kiosk, and Member App interface.
- `apps/api/` - Node.js Express server housing all business logic, scheduled jobs, and integrations.
- `apps/mobile/` - Flutter source code for the native member application.
- `packages/db/` - Contains the Prisma schema (`schema.prisma`) and generated client.
- `packages/shared/` - Shared TypeScript types, validation rules, and constants reused across Web and API.
- `COMPLETED_FEATURES.md` - Documentation of finished and tested features.
- `DESIGN_SYSTEM.md` - Detailed UI/UX rules (colors, typography, spacing).
- `task.md` - To-Do list tracking remaining features and polish.

# What Is Built
- **Backend Infrastructure**: Fully structured Express API, Prisma client, and robust database schema.
- **Admin Authentication**: JWT role-based access for Gym Owners and Staff.
- **Check-ins System**: Real-time attendance tracking via Kiosk or Member App QR scanning.
- **Analytics Dashboard**: 4 key stats, revenue analysis, charts for peak hours and plan popularity.
- **Staff Management**: Add, update, toggle access, and reset passwords for receptionists and coaches.
- **Settings**: White-label configuration (colors, gym info, GST) and dynamic QR generation.

# What Is Not Built Yet
- **Payment Gateway**: Online fee collection via Razorpay currently pending.
- **Detailed Workout & Diet Tracker UI**: Core pages are scaffolded but lack full production polish for member consumption.
- **Superadmin Dashboard**: Centralized management portal for onboarding new Gyms/Tenants.
- **Asset Storage Integration**: S3/Cloudflare R2 integration for uploading avatars and logos.

# All Routes
### Web Routes (Next.js)
- `/login` - Authentication page
- `/dashboard` - Gym owner's main overview
- `/analytics` - Detailed charts and revenue
- `/check-ins` - Live attendance tracking
- `/diets` - Diet plan management
- `/fees` - Overdue and collected fees
- `/members` - Member listing and CRM
- `/members/new` - Add new member
- `/members/[id]` - Individual member profile
- `/notifications` - Send and track messages
- `/payments`, `/payments/collect` - Manage transactions
- `/plans` - Gym membership packages
- `/settings` - White-label configuration
- `/staff` - Manage employees
- `/workouts`, `/workouts/planner` - Exercise planning
- `/kiosk` - Full-screen check-in terminal
- `/member-app` - Mobile web view for members

### API Routes (Express)
- `GET/POST /auth/*`
- `GET/POST /analytics/*`
- `GET/POST /bodystats/*`
- `GET/POST /checkin/*`
- `GET/POST /diet/*`
- `GET/POST /gym/*`
- `GET/POST /member/*`
- `GET/POST /notification/*`
- `GET/POST /payment/*`
- `GET/POST /plan/*`
- `GET/POST /staff/*`
- `GET/POST /workout/*`

# Database Schema
- **Gyms**: `id`, `name`, `slug`, `subdomain`, `logo_url`, `primary_color`, `secondary_color`, `owner_name`, `address`...
- **Users**: `id`, `gym_id`, `role`, `phone`, `password_hash`, `isActive`...
- **Members**: `id`, `user_id`, `gym_id`, `member_code`, `joined_at`, `gender`, `emergency_phone`...
- **MembershipPlans**: `id`, `name`, `price`, `duration_days`, `gst_percent`...
- **MemberSubscriptions**: `id`, `member_id`, `plan_id`, `start_date`, `end_date`, `status`...
- **CheckIns**: `member_id`, `gym_id`, `checked_in_at`, `source`...
- **Payments**: `member_id`, `amount`, `payment_method`, `invoice_number`...
- **Exercises / WorkoutPlans / MemberWorkoutAssignments**: Tracks fitness routines.
- **DietCharts / DietMeals / MemberDietAssignments**: Tracks nutrition.
- **BodyStats**: Measurements like `weight_kg`, `body_fat_pct`, `chest_cm`...
- **NotificationLog**: Tracks sent WhatsApp/FCM messages.
- **SaasPlan / SaasSubscription**: For GyOS platform billing.

# Mock Data
- Fake data for generating the UI demo without needing the backend can be found in `apps/web/src/lib/mock-data.ts`.

# Environment Variables (`.env.example`)
- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_SECRET`: For encoding auth tokens.
- `RAZORPAY_KEY_*`: Payment gateway keys.
- `R2_*`: Cloudflare storage credentials (avatars, invoices).
- `FIREBASE_*`: Service account keys for sending Push Notifications.
- `WATI_API_*`: WhatsApp API credentials.
- `MSG91_*`: SMS Gateway tokens.
- `PLATFORM_DOMAIN`: Base domain (e.g., `mygymapp.in`) used for routing subdomains.

# How To Run
- **Database & Services**: `docker-compose up -d`
- **Web Admin & API**: `npm install && npm run dev`
- **Mobile App**: `cd apps/mobile && flutter pub get && flutter run`
