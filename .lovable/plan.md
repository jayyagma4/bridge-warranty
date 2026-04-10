

## Plan: Build Dealership Dashboard Suite

### Context
Your live site has a full dealership experience — dashboard with stats, contracts, remittances, team management, confidentiality pricing, settings, and reporting. The Lovable project has the database schema, auth, and nav items defined, but is missing most dealership pages. This plan builds them all.

### What we're building

**1. Dealership Dashboard (Overview Page)** — `/dealership`
- Stats cards: Contracts Created, Active, Draft, Revenue, Pending Payment, Submitted Batches, Avg Per Contract, Top Product
- Sales Trend chart (last 6 months)
- Quick Actions panel linking to Contracts, Find Products, Team, Remittances
- Top Products and Top Performers sections
- All data pulled from contracts/remittances tables filtered by dealership

**2. Contracts Page** — `/dealership/contracts`
- Table of all contracts with status tabs (Draft, Sold, Active, Expired, Cancelled)
- Search/filter by customer name, VIN, product
- Create new contract button (links to purchase wizard)
- Status badge styling, date formatting
- Actions: View details, mark as sold, cancel

**3. Remittances Page** — `/dealership/remittances`
- "Create Remittance" section with Ready to Remit / All Sold toggle
- Select sold contracts to batch, assign remittance number, provider total
- Remittance History table with status tabs (Draft, Submitted, Approved, Rejected, Paid)
- Search remittances

**4. Team Management Page** — `/dealership/settings/team`
- List team members with role badges (Admin/Employee), status (Active), join date
- Add Member dialog (email, name, phone, role selection)
- Edit member details, Disable/Enable member
- Count indicators (Active, Admins)

**5. Confidentiality Pricing (Retail Pricing)** — `/dealership/settings/configuration`
- Toggle switch: "Confidentiality Pricing" on/off
- Product list filtered by provider
- Select a product to configure retail markup pricing per term/tier
- Two modes: Dealer Internal Cost vs Confidentiality (Retail) Pricing
- Markup stored per dealership per product (new `dealership_product_pricing` table)

**6. Profile Page** — `/dealership/settings/profile`
- Edit user profile: name, email, phone, password change

**7. Settings with Sub-navigation**
- Update dealership nav to include Settings as expandable group with Configuration, Team, Profile sub-items (matching your live sidebar screenshot)

**8. Reporting Page** — `/dealership/reporting`
- Sales by product, by month, by employee
- Revenue trends, contract volume

### Database changes needed
- New table: `dealership_product_pricing` (dealership_id, product_id, retail_price jsonb, created_at, updated_at) with RLS
- Add `reporting` nav item to dealership sidebar

### Navigation update
Update `dealershipNavItems` in DashboardLayout to match live site:
- Dashboard, Find Products, Contracts, Remittances, Reporting
- Settings (expandable): Configuration, Team, Profile

### Routes to add
```text
/dealership                      → Dashboard overview
/dealership/contracts            → Contracts list
/dealership/remittances          → Remittances
/dealership/reporting            → Reporting
/dealership/settings/configuration → Confidentiality Pricing
/dealership/settings/team        → Team Management
/dealership/settings/profile     → Profile
```

### Files to create/edit
- **Create**: `src/pages/dealership/DealershipOverview.tsx`
- **Create**: `src/pages/dealership/DealershipContracts.tsx`
- **Create**: `src/pages/dealership/DealershipRemittances.tsx`
- **Create**: `src/pages/dealership/DealershipReporting.tsx`
- **Create**: `src/pages/dealership/settings/Configuration.tsx` (Confidentiality Pricing)
- **Create**: `src/pages/dealership/settings/TeamManagement.tsx`
- **Create**: `src/pages/dealership/settings/Profile.tsx`
- **Edit**: `src/components/dashboard/DashboardLayout.tsx` — update nav with Settings sub-group
- **Edit**: `src/App.tsx` — add all new routes with ProtectedRoute
- **Migration**: `dealership_product_pricing` table for retail markup storage

### Implementation order
1. Dashboard overview + routes + nav update
2. Contracts page
3. Remittances page
4. Team management
5. Confidentiality Pricing (configuration)
6. Profile + Reporting

