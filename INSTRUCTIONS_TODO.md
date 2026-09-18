# Apartly PH — Master Roadmap & Missing Items Checklist

> **Project Scope**: A localized boarding house and transient booking web platform designed specifically for Philippine university belts (Tagum City, Davao City, Cebu City). Featuring strict role separation between **Student Tenants** and **Boarding House Landladies (Hosts)**.

---

## 📊 Executive Status Overview

| Component Area | Current Status | Notes |
|---|---|---|
| **Role Separation** | ✅ **Complete** | Separate pages for Tenant (`index.html`, `profile.html`) and Landlady (`admin.html`). Split login (`login.html`). |
| **Editorial Design System** | ✅ **Complete** | Custom Warm Teal (`#123C3D`), Paper (`#F7F3EC`), Clay (`#C1502E`) palette; `Lora` serif & `Inter` sans-serif typography. |
| **Data Flow & Local Fallback**| ✅ **Complete** | Resilient offline mode with localStorage fallback; zero `"Failed to fetch"` errors. |
| **Inquiries System** | 🟡 **Functional (Local)** | Students can inquire; landladies can reply. Needs real-time push/socket notifications. |
| **Cloud Database & Storage** | 🔴 **Missing / Pending** | Supabase schema lacks `inquiries` and student KYC fields; photo upload uses Base64 instead of Cloud Storage buckets. |
| **Payment Gateway** | 🔴 **Missing / Pending** | Currently uses UI radio buttons for GCash/Maya/Cash without live API payment rails. |
| **Student KYC / ID Upload** | 🟡 **Partial** | Profile displays verified student chip, but lacks document attachment/upload for landlady review. |
| **Campus Geolocation / Maps** | 🔴 **Missing / Pending** | No interactive campus proximity pins or Leaflet/Google Map radius. |

---

## 🎯 Phase-by-Phase What Needs To Be Done

### Phase 1: Database & Cloud Infrastructure (High Priority)
Currently, data is stored in browser `localStorage`. Uploading multiple high-res room photos will eventually exceed the ~5MB browser quota.

- [ ] **1.1. Connect Live Supabase Project**:
  - Open `supabase-config.js` and replace empty strings with active project credentials:
    ```javascript
    window.SUPABASE_CONFIG = {
      url: 'https://YOUR_PROJECT_ID.supabase.co',
      anonKey: 'YOUR_SUPABASE_ANON_KEY'
    };
    ```
- [ ] **1.2. Update SQL Schema (`sql/schema.sql`)**:
  - Add missing student columns to `profiles`: `school`, `course`, `student_id`, `emergency_contact`, `id_verified`, `id_document_url`.
  - Add missing landlady columns to `profiles`: `permit_number`, `landlady_years`.
  - Create the `inquiries` table:
    ```sql
    create table if not exists inquiries (
      id text primary key,
      listing_id bigint references listings(id),
      host_id uuid references profiles(id),
      guest_id uuid references profiles(id),
      guest_name text,
      guest_phone text,
      message text not null,
      reply text,
      status text default 'Sent',
      date_sent date default current_date,
      created_at timestamptz default now()
    );
    ```
- [ ] **1.3. Supabase Cloud Storage Buckets**:
  - Create two public buckets in Supabase:
    1. `property-photos` (for landlady room uploads)
    2. `tenant-documents` (for private student ID cards/COR)
  - Replace Base64 `FileReader` strings with `supabase.storage.from('property-photos').upload(...)`.
- [ ] **1.4. Row-Level Security (RLS) Policies (`sql/policies.sql`)**:
  - Enforce policies so landladies can only update bookings for their own listings.
  - Enforce policies so students can only view their own inquiries and reservations.

---

### Phase 2: Philippine Payment Integration (Medium Priority)
Currently, `checkout.html` provides radio selectors (`GCash`, `Maya`, `Cash on Check-in`).

- [ ] **2.1. GCash & Maya Integration**:
  - Choose a payment aggregator (e.g. **PayMongo**, **Xendit**, or **Maya Checkout API**).
  - Generate a secure checkout link or GCash QR code upon clicking *"Confirm Reservation"*.
- [ ] **2.2. Downpayment / Advance & Deposit Model**:
  - Philippine boarding houses typically require **1 month advance + 1 month deposit** or a fixed reservation reservation fee (e.g., ₱500 reservation slot).
  - Add an option on `checkout.html` to pay a holding deposit vs full stay amount.
- [ ] **2.3. Webhook Handling**:
  - Implement a backend webhook endpoint to automatically transition booking status from `Pending Payment` to `Confirmed`.

---

### Phase 3: Student Trust & Verification (KYC)
In Philippine boarding houses (especially exclusive female dormitories near nursing schools), landladies strictly require verification before turnover.

- [ ] **3.1. Student ID & COR Upload on `profile.html`**:
  - Add an upload input for **Certificate of Registration (COR)** or **School ID**.
  - Store verification status (`Pending Review`, `Verified`, `Rejected`).
- [ ] **3.2. Landlady Verification Review on `admin.html`**:
  - Add a *"Verify Boarder ID"* modal in the Landlady Center allowing Ate Maria to inspect the student's submitted credentials prior to approving room occupancy.

---

### Phase 4: Boarding House Rules & Submeter Utility Tracking
Boarding houses differ from standard hotels because of recurring bills and compound guidelines.

- [ ] **4.1. House Rules & Curfew Specification**:
  - Add curfew hours to listings (e.g., `10:00 PM Curfew`, `No Curfew / 24/7 Keycard`).
  - Add visitor policy tags (e.g., `Female Guests Only`, `No Overnight Visitors`, `Study Groups Allowed until 8 PM`).
- [ ] **4.2. Utility & Submeter Breakdown**:
  - Add utility payment terms: `Submetered Electricity (₱15/kWh)`, `Free Drinking Water`, `₱150/mo Water Fee`.

---

### Phase 5: Campus Geolocation & Interactive Map
Students prioritize boarding houses within walking distance to their respective campuses.

- [ ] **5.1. University Landmark Filters**:
  - Add campus chips to `index.html`:
    - *Tagum*: UM Tagum, St. Mary's College, USEP Tagum.
    - *Davao*: Ateneo de Davao, Davao Doctors, SPMC, UIC.
    - *Cebu*: USC Talamban, UC Banilad, CDU.
- [ ] **5.2. Map Integration (Leaflet.js / OpenStreetMap)**:
  - Embed a lightweight Leaflet map showing pin clusters and walking distance calculation (e.g., *"5 mins walk to UM Gate 2"*).

---

### Phase 6: Real-time Communication & Messaging
- [ ] **6.1. Live Chat / Instant Inquiries**:
  - Replace the current reload-based inquiry system with Supabase Realtime subscriptions (`supabase.channel('inquiries')`).
  - Provide desktop / SMS notification when a landlady replies to a student.

---

## 🛠️ Step-by-Step Execution Guide for Next Implementation

```bash
# Step 1: Execute SQL Schema & Policies in Supabase Dashboard
# Navigate to: Supabase Dashboard > SQL Editor > New Query
# Paste contents from: sql/schema.sql and sql/policies.sql

# Step 2: Configure Environment Keys
# Edit supabase-config.js with your project URL and public anon key.

# Step 3: Test Realtime Subscriptions
# Verify realtime table listening in backend.js.
```

---

## 📁 File Structure Reference

```text
c:\apartment-booking\
├── admin.html               # Landlady / Owner Center (Approvals, Room Posting, Inquiries)
├── app.js                  # Student Catalog Controller (Filters, Search, Modal triggers)
├── backend.js              # Auth, State Management, Local Storage & Supabase Client bridge
├── checkout.html           # Tenant Booking & Summary Form
├── confirmation.html       # Printable Stay Slip & Booking Receipt
├── index.html              # Public Student Catalog (Pure renter experience)
├── login.html              # Dual Portal Sign In (Student vs Landlady tabs)
├── profile.html            # Student Tenant Profile (Academic info, My Bookings, Inquiries)
├── saved-apartments.html   # Shortlisted Bookmarks
├── styles.css              # Warm Editorial Design System (Teal, Paper, Clay, Lora, Inter)
├── supabase-config.js      # Supabase credentials file
├── sql/
│   ├── schema.sql          # Database table definitions
│   └── policies.sql        # Row Level Security (RLS) policies
└── assets/                 # Curated Philippine boarding house & avatar assets
```
