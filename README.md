# apartment-booking

## Supabase Backend Setup

The app is now prepared for Supabase. Until Supabase keys are added, it keeps using local demo data so the UI remains usable.

1. Create your Supabase project.
2. Add your project URL and anon key in `supabase-config.js`.
3. Run the SQL schema you will provide later.
4. Make sure the table names match: `profiles`, `listings`, `saved_listings`, and `bookings`.

Expected important columns:
- `profiles`: `id`, `email`, `name`, `role`, `avatar_url`, `rating`, `reviews_count`, `phone`, `gender`, `bio`
- `listings`: `id`, `host_id`, `name`, `location`, `room_type`, `amenities`, `rating`, `reviews_count`, `price`, `image_url`, `description`
- `saved_listings`: `user_id`, `listing_id`
- `bookings`: `id`, `listing_id`, `guest_id`, `property_name`, `guest_name`, `guest_email`, `guest_phone`, `guest_gender`, `check_in`, `check_out`, `guests`, `price_per_night`, `nights`, `total_price`, `status`, `notes`, `created_at`

The frontend adapter is in `backend.js`. It keeps the existing `window.Auth` methods, but those methods now write to Supabase when configured.

## Supabase: apply schema and seed data

1. In Supabase dashboard → SQL Editor, open and run `sql/schema.sql` to create tables.
2. Optionally run `sql/policies.sql` to add example RLS policies (read the comments before applying).
3. Confirm `supabase-config.js` contains your project URL and anon key.
4. Open the app (`index.html`) in a browser. In DevTools Console run:

```js
// after the page loads and Auth.ready resolves
await window.Auth.ready;
await window.apartlySeed(); // seeds profiles, listings, bookings when tables are empty
```

If you prefer a one-off SQL seed, use the Supabase SQL editor to insert rows directly.

Security reminder: For quick testing you can disable RLS, but for production configure proper policies and avoid exposing service_role keys.

## Project Status: 70–75% Front-End Complete

### ✅ Completed
- **Home/Search Page** (`index.html`): top navigation, featured listings grid.
- **Booking Flow** (`checkout.html`, `confirmation.html`): guest details, payment summary, confirmation screen.
- **Saved Apartments Page** (`saved-apartments.html`): static shortlist UI with 3 sample apartments.
- **Featured Listings & Live Filters** (`index.html`, `app.js`): 6 apartment cards with working filters by location, room type, amenities, rating, and max price. Result count updates dynamically.
- **Shared Styling** (`styles.css`): responsive design for desktop (1148px), tablet (980px), mobile (720px), and small (430px) breakpoints.
- **Client-Side Filtering Logic** (`app.js`): working filter matching and result visibility toggling.

### 🚧 In Progress / Not Yet Implemented
- **Persistence** (`localStorage`): saved apartments and bookings are not stored; refreshing the page loses all data.
- **Authentication / Profile**: no login flow, no user sessions, no profile page.
- **My Bookings Page**: not started.
- **Admin/Owner Dashboard**: not started.
- **Backend API**: no server, no database, no endpoints for auth, booking persistence, or saved items.
- **Search Bar Integration**: top search pill doesn't drive the listing filters yet.

### 📋 Next Steps (Pick One)

#### Option 1: Quick Local Persistence (1–2 hours) ⭐ RECOMMENDED FOR MVP
- Add Save/Unsave buttons to listing cards.
- Persist saved apartments to `localStorage`.
- Update `saved-apartments.html` to read from `localStorage`.
- Add simple local "My bookings" tracking on checkout.
- **Result:** Users can save listings and see past bookings after refresh.
- **Files to change:** `index.html`, `saved-apartments.html`, `app.js`.

#### Option 2: Wire Search Bar to Filters (30 mins)
- Make top search pill location/date inputs drive the listing filters.
- **Result:** More cohesive UX between hero and results.
- **Files to change:** `index.html`, `app.js`.

#### Option 3: Add Backend (Multi-day)
- Scaffold Node/Express server + SQLite/PostgreSQL.
- Endpoints: auth, GET/POST bookings, saved apartments, user profile.
- Update front end to call APIs instead of using `localStorage`.
- **Result:** Production-grade persistence and user management.
- **Files to create:** `server.js`, `.env`, `package.json`, database schema.

#### Option 4: Build Admin Dashboard (Multi-day)
- New page `admin.html` with charts, apartment list, booking calendar, revenue overview.
- Assume owner login; show only their apartments and bookings.
- **Files to create:** `admin.html`, `admin.css`, `admin.js`.

---

### 📁 File Structure
```
apartment-booking/
├── index.html                 (home + featured listings)
├── checkout.html              (booking form)
├── confirmation.html          (booking confirmation)
├── saved-apartments.html      (saved listings page)
├── login.html                 (stub; not wired yet)
├── styles.css                 (shared styles, responsive)
├── app.js                      (live filtering logic)
├── README.md                  (this file)
```

### 🎯 Recommended Build Order
1. **Option 1 (Quick):** Add `localStorage` persistence for saved apartments and bookings.
2. Option 2: Wire search bar to filters.
3. Add "My bookings" and Profile pages (UI only or with localStorage).
4. Option 3 (Backend): Scaffold minimal Node/Express API.
5. Option 4 (Admin): Build admin dashboard.
