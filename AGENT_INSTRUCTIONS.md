# Before Writing Any Code
- Always read `CONTEXT.md` first.
- Always read `PROGRESS.md` to know what is done and what needs focus.
- **NEVER use API calls in demo screens.** For frontend sprints aimed at gym owner pitches, strictly use the provided mock data from `apps/web/src/lib/mock-data.ts`.
- Rigorously follow `DESIGN_SYSTEM.md` for all UI decisions.

# Code Rules
- **No Payment Gateway Logic:** Payment features in scope are purely visual or mock. Fees are collected offline in the current MVP.
- **No Workout Tracker Logic:** Out of scope for the current sprint.
- **Currency Format:** Always format as Indian Rupees: `₹1,000` (Never Rs. or INR).
- **Phone Format:** Follow strict Indian mobile number length and formatting (e.g., +91 XXXXX XXXXX).
- **Date Format:** Use `DD Mon YYYY` format precisely (e.g., 15 Mar 2026).
- **Language**: TypeScript strict mode must be enabled globally. Use strict typing for all components.

# UI Rules
- **Admin Panel**: Light theme, `Geist` font stack, `#F9F9F8` primary background, dark `#111` navigation sidebar.
- **Mobile PWA**: Dark theme, `DM Sans` font stack, `#0F0F0F` primary background, `#E85D04` orange brand accent (unless dynamically overridden).
- **Kiosk System**: Fullscreen dark `#0A0A0A` theme, premium terminal, high visibility feel.
- **No Bootstrap**. Period.
- **No Purple Gradients**. Aesthetic should feel fast and modern (like CRED or Swiggy).
- strictly use **Lucide icons** uniformly across the apps.
- **Skeletons purely**. Never use lonely load spinners; heavily favor structural skeleton loaders.
- **Forms**: Always utilize side Drawers over center Modals for any extensive form capturing. 

# File Naming
- Web App Pages: `apps/web/src/app/[route]/page.tsx`
- Web React Components: `apps/web/src/components/`
- Frontend Mock Data File: `apps/web/src/lib/mock-data.ts`
- Backend API Routes: `apps/api/src/routes/`
- Backend Services Logic: `apps/api/src/services/`

# When Adding New Features
1. Update `PROGRESS.md` checkboxes.
2. Add the route footprint to the `CONTEXT.md` unified routes list.
3. Import and expand the existing mock data from the central file; do not invent or scatter new JSON mock files around the directory.
