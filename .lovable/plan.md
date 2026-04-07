

# Updated Bridge Warranty Plan — Missing Features to Add

After reviewing the live site in detail, here are the features and pages **missing from the current plan** that need to be added for full parity:

---

## Missing Pages & Flows

### 1. Multi-Step Dealership Registration (3-step wizard)
The site uses a 3-step registration form, not a single form:
- **Step 1 — Dealership Info**: Name, phone, province (dropdown with all Canadian provinces/territories)
- **Step 2 — Compliance**: Business license, OMVIC registration, or equivalent
- **Step 3 — Account**: User's name, email, password creation

The registration page has a split layout — left side with marketing copy (bullet points, benefits), right side with the form.

### 2. Join Dealership Page (`/join-dealership`)
Currently redirects to home. Needs its own page where an employee enters an **admin code** to join an existing dealership and create their account.

### 3. Forgot Password Page (`/forgot-password`)
Split-layout page (same style as sign-in): left side with branding, right side with email input + "Send reset link" + "Back to sign in" link.

### 4. Reset Password Page (`/reset-password`)
Form to enter new password after clicking the email link. Must handle the `type=recovery` token from the URL.

### 5. Sign-In Page — Split Layout Design
The sign-in page uses a **split layout**: left half is blue with branding/stats (50K+ active users, 99.9% uptime, 500+ dealerships), right half has a car background image with the login form overlaid. This specific layout was not in the plan.

---

## Missing Landing Page Details

### 6. Ontario Providers Directory Section
The landing page lists **8 specific providers** with their contact details (phone, email, address). This is a static directory section:
- A-Protect Warranty Corporation
- Global Warranty
- Peoples Choice Warranty (PCW)
- Ensurall
- First Canadian Protection Plans
- Lubrico Warranty
- NationWide Auto Warranty
- Auto Shield Canada

This should be seeded into the `providers` table and rendered dynamically, so providers can be managed from the admin.

### 7. Sticky Navigation Bar
Top nav with: BW logo (left), "Home" link (center), "Sign In" + "Register Your Dealership" button (right).

### 8. Footer CTA Section
Bottom section: "Ready to Be Part of the Launch?" with "Join Dealerships Getting Early Access" heading and Register button.

---

## Missing Functional Features

### 9. Provider Registration Flow
Separate registration path for providers (not dealerships). Provider applies, Super Admin approves. Not currently on the live site's public nav, but needed for the platform to function.

### 10. Province-Based Filtering
Registration captures province. Products and providers should be filterable by province/region (Ontario at launch).

### 11. Compliance Step in Registration
Step 2 collects compliance data (OMVIC or equivalent dealer licensing). This needs a `compliance_info` field on the dealerships table.

### 12. Notifications System
Email notifications for: registration approval, contract status changes, password reset, staff invitations. Not visible on the site but required for the workflows.

---

## Revised Implementation Order

1. **Database & Auth** — All tables, RLS, roles, triggers
2. **Landing Page** — Full landing with all sections, nav, providers directory, footer CTA
3. **Auth Pages** — Sign-in (split layout), Register Dealership (3-step wizard), Join Dealership, Forgot Password, Reset Password
4. **Role-Based Routing** — Redirect after login based on role
5. **Super Admin Dashboard** — Full management panels
6. **Dealership Admin Dashboard** — Staff, contracts, remittance, provider catalog
7. **Employee Dashboard** — Contract drafting, personal contracts
8. **Provider Dashboard** — Product CRUD, contract management, reporting
9. **Contract Drafting Wizard** — Multi-step: Product > Vehicle > Customer > Review > Submit
10. **Product Comparison Tool** — Side-by-side provider/product comparison
11. **Notifications** — Email triggers for key workflow events

---

## Technical Additions

- `dealerships` table gets `province` (text) and `compliance_info` (jsonb) columns
- `providers` table gets seeded with the 8 Ontario providers
- Auth pages all use consistent split-layout pattern (branding left, form right)
- Countdown timer component on landing page (configurable target date)
- Animated stat counters on landing page

