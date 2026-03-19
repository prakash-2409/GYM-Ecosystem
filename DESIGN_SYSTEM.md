# GymOS Design System & UI/UX Guidelines

This document contains the strict design and implementation rules for GymOS. **AI Assistants (like VS Copilot or Cursor) must adhere to these rules when generating or modifying UI code.**

## The Reference Point
Steal the energy from these apps:
- **Swiggy/Zomato** — speed, bold cards, instant feedback
- **CRED** — dark premium feel, smooth animations
- **Groww** — clean data, nothing cluttered
- **PhonePe** — fast, familiar to every Indian user
- **Notion** — spacing, typography done right

**Goal:** The app should feel like CRED met a fitness app. Not a hospital software. Not a school management system. It must have a premium look and impress anyone seeing the prototype.

---

## 1. Web Admin Panel (Next.js)

### Typography
- **Headings:** `Geist` — clean, modern, tech feel
- **Numbers:** `Geist Mono` — stats/revenue look sharp
- **Body:** `Geist` — same family, consistent
- **Size:** `14px` body, `13px` table rows, `24px` page titles
- **Weight:** `400` regular, `500` medium only — **never 700 bold**

### Colors
- **Page background:** `#F9F9F8` (off-white, easier on eyes)
- **Sidebar:** `#111111` (dark, premium)
- **Cards:** `#FFFFFF`
- **Card border:** `1px solid #EBEBEB`
- **Primary action:** Gym's brand color (configurable)
- **Text primary:** `#0A0A0A`
- **Text secondary:** `#6B7280`
- **Text muted:** `#9CA3AF`
- **Success:** `#16A34A`
- **Warning:** `#D97706`
- **Danger:** `#DC2626`
- **Sidebar text:** `#FFFFFF`
- **Sidebar muted:** `#6B7280`
- **Sidebar active item:** white text + brand color left border 3px

### Spacing (Strict - never eyeball it)
- `4px` — gap between icon and label
- `8px` — inside small components
- `12px` — between related items
- `16px` — between cards
- `24px` — padding inside cards
- `32px` — between sections
- `48px` — page top padding

### Buttons
- **Primary:** brand color bg, white text, height 36px, radius 8px, font-size 14px, weight 500
- **Secondary:** white bg, `#E5E5E5` border, dark text
- **Danger:** `#FEF2F2` bg, `#DC2626` text, `#FECACA` border
- **Ghost:** no bg, no border, brand color text
- **Disabled:** opacity 0.4, cursor not-allowed
- **Hover:** 10% darker on all variants
- **Active:** `scale(0.98)` — subtle press feel

### Inputs
- **Height:** `40px`
- **Border:** `1px solid #E5E5E5`
- **Radius:** `8px`
- **Focus:** `2px solid brand color`, border transparent
- **Placeholder:** `#9CA3AF`
- **Font-size:** `14px`
- **Padding:** `0 12px`
- **Error state:** red border + red helper text below

### Tables
- **Header:** `12px`, uppercase, `#6B7280`, font-weight `500`
- **Row height:** `52px`
- **Row hover:** background `#F9F9F8`
- **Border:** only horizontal, `1px solid #F3F4F6`
- **NEVER:** NO zebra stripes, NO vertical borders
- **Avatar:** 32px circle with initials fallback
- **Status badge:** pill shape, `12px`, colored bg + matching text
- **Actions:** show on row hover only (edit/delete icons)

### Navigation Sidebar
- **Width:** `240px` fixed
- **Logo area:** `56px` height, gym name + logo
- **Nav items:** `44px` height, `12px` horizontal padding
- **Active item:** `3px` left border brand color, bg `rgba(brand, 0.08)`
- **Inactive:** `#6B7280` text, hover `#F9F9F8` bg
- **Icons:** `Lucide`, `18px`, aligned left
- **Section labels:** `11px`, `#9CA3AF`, uppercase, margin-top `24px`
- **Bottom section:** staff name + avatar + settings

### Cards
- **Background:** `#FFFFFF`
- **Border:** `1px solid #EBEBEB`
- **Radius:** `12px`
- **Padding:** `24px`
- **Shadow:** none — borders are cleaner
- **Stat cards:** `#F9F9F8` bg, no border, radius `12px`
- **Hover cards:** shadow `0 2px 8px rgba(0,0,0,0.06)`

### Modals and Drawers
- **NEVER use modal for forms — always right-side drawer**
- **Drawer width:** `480px` on desktop, `100%` on mobile
- **Backdrop:** `rgba(0,0,0,0.3)`
- **Animation:** slide from right, `200ms ease`
- **Header:** title left, X close right, border-bottom `1px`
- **Footer:** border-top, Cancel + Submit buttons right-aligned
- **Modal only for:** confirm delete, simple yes/no decisions (Modal width: `400px` max, centered)

### Loading States
- **NEVER show a spinner alone on full page**
- **Skeleton:** same shape as real content, `#F3F4F6` base, animated shimmer
- **Tables:** show 5 skeleton rows while loading
- **Cards:** skeleton matching card height
- **Buttons:** show spinner inside button after click, disable immediately to prevent double submit

### Empty States
- **NEVER show a blank page or just "No data"**
- **Always:** simple SVG illustration (small, not cheesy), primary message "No members yet", secondary message helpful hint, CTA button if action possible

---

## 2. Mobile App (Flutter)

### Typography
- **Font:** `DM Sans` — feels human, not robotic
- **Headings:** `22px`, weight `600`
- **Subheads:** `16px`, weight `500`
- **Body:** `14px`, weight `400`
- **Caption:** `12px`, weight `400`, muted color
- **Numbers:** `DM Sans` with tabular figures

### Colors (Dark Theme Focus)
- **Background:** `#0F0F0F`
- **Surface (cards):** `#1A1A1A`
- **Surface elevated:** `#222222`
- **Brand accent:** from gym config (white-label)
- **Text primary:** `#F5F5F0`
- **Text secondary:** `#888888`
- **Text muted:** `#555555`
- **Border:** `rgba(255,255,255,0.08)`
- **Success:** `#22C55E`
- **Warning:** `#F59E0B`
- **Error:** `#EF4444`
- **Green subtle bg:** `rgba(34,197,94,0.12)`
- **Orange subtle bg:** `rgba(245,158,11,0.12)`
- **Red subtle bg:** `rgba(239,68,68,0.12)`

### Spacing
- **Screen padding:** `16px` horizontal
- **Card padding:** `16px`
- **Between cards:** `12px`
- **Between sections:** `24px`
- **List item height:** `64px` minimum

### Cards
- **Background:** `#1A1A1A`
- **Border:** `1px solid rgba(255,255,255,0.07)`
- **Radius:** `16px`
- **Padding:** `16px`
- **Never:** harsh white borders on dark bg
- **Shadow:** none on dark theme

### Bottom Navigation
- **Background:** `#111111`
- **Border top:** `1px solid rgba(255,255,255,0.07)`
- **Height:** `64px`
- **Items:** 4 max (Home, Notifications, Progress, Profile)
- **Active:** brand color icon + label
- **Inactive:** `#555555`
- **Active indicator:** small dot or pill above icon
- **Tab labels:** `11px`, always visible

### Buttons
- **Primary:** brand color, full rounded (radius `12px`), height `52px`, white text, font `16px` weight `500`
- **Secondary:** `#1A1A1A` bg, white text, same border as cards
- **Radius:** `12px` — never fully pill shaped for primary actions
- **Tap effect:** `scale(0.97)` + slight opacity drop
- **Disabled:** opacity `0.35`

### Lists and Rows
- **Min height:** `64px`
- **Leading:** avatar (`40px` circle) or icon in colored bg
- **Title:** `15px`, `#F5F5F0`
- **Subtitle:** `13px`, `#888888`
- **Trailing:** status badge or chevron
- **Divider:** `1px solid rgba(255,255,255,0.05)`, left-inset to align with text not avatar

### Animations — these matter a lot
- **Page transitions:** slide from right (drill down), fade (tab switch), slide up (bottom sheets)
- **Duration:** `200–250ms`, ease curve
- **Check-in success:** scale up tick + confetti burst
- **Set completed:** checkbox scale bounce
- **Number changes:** count up animation
- **Graph load:** draw in from left
- **Skeleton shimmer:** always, while loading
- **Pull to refresh:** custom branded animation if possible

### Micro Interactions
- **Every button:** visual press state (scale down)
- **Haptic feedback:** check-in success, set marked done
- **Swipe actions:** swipe notification to dismiss
- **Long press:** show context menu on list items
- **Pull to refresh:** all list screens

### What to NEVER do on mobile
- No white background — hurts eyes at gym (bright light)
- No small tap targets — members use app mid-workout
- No popups/dialogs for everything — use bottom sheets
- No loading spinners alone — skeleton screens always
- No flat list with no grouping — use sections
- No text-only empty states — always add context
- No full caps buttons — looks aggressive
- No more than 3 actions on one screen — keep it focused

---

## 3. Universal Rules Both Apps

### Consistency
- **One icon library only:** `Lucide` (web) + `Lucide Flutter` (mobile)
- **One color per meaning:** green = good, orange = warning, red = bad
- **Same terminology:** "Member" not "User" or "Client"
- **Same date format:** "15 Mar 2026" everywhere
- **Same number format:** `₹1,500` not Rs.1500 or INR 1500

### Speed Feel
- **Optimistic UI:** update screen before API confirms (mark check-in instantly, revert if fails)
- **Instant feedback:** every tap gets immediate visual response, never make user wonder if tap registered
- **Prefetch data:** load next screen data before user taps
- **Cache everything:** don't reload data user just saw

### Error Handling
- **Network error:** "Check your connection" with retry button
- **Not found:** friendly message, back button
- **Server error:** "Something went wrong" never show raw error
- **Form errors:** inline below each field, never alert popup
- **Empty search:** "No results for X" with clear search option
