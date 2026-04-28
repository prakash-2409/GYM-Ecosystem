# GSSoC Issues & Labels Configuration

As a Project Admin for GirlScript Summer of Code (GSSoC), setting up issues with appropriate labels is crucial for attracting contributors. 

Below is a ready-to-use list of labels and issues that you should create in your GitHub repository.

## 🏷️ Required Labels to Create

Go to your repository **Issues -> Labels -> New Label** and create these (if they don't exist):

| Label Name | Color Code | Description |
|---|---|---|
| `gssoc` | `#ff8b3d` | Official GSSoC tag |
| `gssoc-ext` | `#d4c5f9` | GSSoC Extended tag |
| `good first issue` | `#7057ff` | Good for newcomers |
| `level1` | `#008672` | Easy task, beginner-friendly |
| `level2` | `#e4e669` | Medium task, requires some experience |
| `level3` | `#d876e3` | Hard task, core architecture |
| `frontend` | `#1d76db` | Next.js / Tailwind tasks |
| `backend` | `#0e8a16` | Node.js / Prisma tasks |
| `mobile` | `#0052cc` | Flutter tasks |

---

## 📝 Pre-written Issues to Create

You can copy and paste the below templates to create your first set of issues. 

### Issue 1: Add Unit Tests for Authentication Routes
**Title:** `[Backend] Implement Unit Tests for Auth Service`
**Labels:** `backend`, `level2`, `gssoc`
**Description:**
```markdown
Currently, the `apps/api/src/routes/auth.routes.ts` lacks comprehensive unit testing. We need a contributor to set up Jest and write unit tests for:
- Login (Success & Failure cases)
- JWT Token generation validation
- Role-based access testing

**Acceptance Criteria:**
- Setup Jest in `apps/api`
- Achieve >80% coverage for auth service.
```

### Issue 2: Build Razorpay Payment Gateway Integration
**Title:** `[Backend/Frontend] Integrate Razorpay for Online Fee Collection`
**Labels:** `backend`, `frontend`, `level3`, `gssoc`
**Description:**
```markdown
Currently, gyms collect fees manually (Cash/UPI). We want to automate this by integrating the Razorpay API.

**Tasks:**
1. Create a Razorpay Order creation route in `apps/api`.
2. Add a 'Pay Now' button in the Member App (`apps/mobile`) and Web Dashboard (`apps/web`).
3. Handle Razorpay Webhooks to automatically mark invoices as `PAID`.
```

### Issue 3: Fix Responsive Navigation on Mobile Web
**Title:** `[Frontend] Fix Navigation Drawer Responsiveness on Mobile View`
**Labels:** `frontend`, `level1`, `good first issue`, `gssoc`
**Description:**
```markdown
The Admin Panel (`apps/web`) sidebar does not collapse properly on screens smaller than 768px, making the dashboard unusable on mobile browsers.

**Acceptance Criteria:**
- Use Tailwind CSS to hide the sidebar on mobile and replace it with a hamburger menu.
- Ensure smooth transition animations.
```

### Issue 4: Implement S3/Cloudflare R2 Profile Picture Uploads
**Title:** `[Backend] Add File Upload Service for Member Avatars`
**Labels:** `backend`, `level2`, `gssoc`
**Description:**
```markdown
We need a way for members to upload profile pictures.
Instead of storing in DB, implement a Multer + AWS SDK integration to upload images to Cloudflare R2 / AWS S3.

**Tasks:**
- Create an upload endpoint.
- Return the CDN URL and store it in the `Users` table (`avatar_url` column).
```

### Issue 5: Add Dark Mode Toggle to Admin Dashboard
**Title:** `[Frontend] Implement Dark Mode Theme Switcher`
**Labels:** `frontend`, `level1`, `gssoc`
**Description:**
```markdown
Gym owners sometimes work late. Add a dark mode toggle to the Next.js Admin dashboard using `next-themes` and Tailwind CSS dark classes.

**Acceptance Criteria:**
- A toggle button in the top navbar.
- State should persist in local storage.
```
