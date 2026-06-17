# apartment-booking

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