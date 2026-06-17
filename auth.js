// auth.js - Shared Authentication & Session Manager for Apartly

(function () {
  // --- DATA INITIALIZATION ---
  const defaultUsers = [
    {
      id: 1,
      email: 'sarah@apartly.com',
      password: 'password',
      name: 'Sarah',
      role: 'host',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      rating: '4.9',
      reviewsCount: 114,
      phone: '+63 912 345 6789',
      gender: 'Female',
      bio: "Hi, I'm Sarah! I own and host multiple design-focused apartments in Tagum City and Davao City. I love sharing local recommendations!"
    },
    {
      id: 2,
      email: 'john@gmail.com',
      password: 'password',
      name: 'John Doe',
      role: 'guest',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      rating: '0.0',
      reviewsCount: 0,
      phone: '+1 555 0199',
      gender: 'Male',
      bio: 'Avid traveler and foodie from San Francisco. Always looking for clean, central lofts.'
    }
  ];

  const defaultListings = [
    {
      id: 1,
      name: 'Modern Tagum Stay',
      location: 'Tagum City',
      roomType: '1 Bedroom',
      amenities: ['WiFi', 'Balcony', 'Kitchen', 'AC', 'TV'],
      rating: 4.8,
      reviewsCount: 67,
      price: 85,
      imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1100&q=90',
      description: 'Modern Tagum Stay is a bright city-center apartment with floor-to-ceiling windows, a private balcony, fast WiFi, and easy access to cafes, malls, and transport.',
      hostId: 1
    },
    {
      id: 2,
      name: 'Riverfront Studio',
      location: 'Davao City',
      roomType: 'Studio',
      amenities: ['WiFi', 'Pool', 'Parking', 'AC', 'TV'],
      rating: 4.7,
      reviewsCount: 48,
      price: 72,
      imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1100&q=90',
      description: 'A quiet, modern studio overlooking the Davao river. Includes fully functional workspace, kitchen utilities, pool access, and security guard services.',
      hostId: 1
    },
    {
      id: 3,
      name: 'City Lights Loft',
      location: 'General Santos',
      roomType: 'Loft',
      amenities: ['WiFi', 'Kitchen', 'AC', 'TV', 'Skyline View'],
      rating: 4.9,
      reviewsCount: 82,
      price: 95,
      imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1100&q=90',
      description: 'Elegant industrial-style loft with high-ceilings, huge windows showcasing city skylines, super-fast fiber internet, and premium designer furnishings.',
      hostId: 1
    },
    {
      id: 4,
      name: 'Sunset Family Flat',
      location: 'Tagum City',
      roomType: '2 Bedroom',
      amenities: ['WiFi', 'Pool', 'Kitchen', 'AC', 'TV', 'Parking'],
      rating: 4.6,
      reviewsCount: 34,
      price: 120,
      imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1100&q=90',
      description: 'Spacious family flat situated in a friendly neighborhood. Features 2 large bedrooms, fully equipped laundry area, playground, and communal swimming pool.',
      hostId: 1
    },
    {
      id: 5,
      name: 'Harbor Studio',
      location: 'Cebu City',
      roomType: 'Studio',
      amenities: ['WiFi', 'Balcony', 'Parking', 'AC'],
      rating: 4.4,
      reviewsCount: 29,
      price: 68,
      imageUrl: 'https://images.unsplash.com/photo-1502005097973-6a7082348e28?auto=format&fit=crop&w=1100&q=90',
      description: 'Cozy and economic studio overlooking Cebu harbor. Walking distance to port areas, business park, and multiple seafood spots. Perfect for business trips.',
      hostId: 1
    },
    {
      id: 6,
      name: 'Executive Haven',
      location: 'Davao City',
      roomType: '1 Bedroom',
      amenities: ['WiFi', 'Pool', 'Balcony', 'AC', 'Parking', 'Kitchen'],
      rating: 4.5,
      reviewsCount: 51,
      price: 140,
      imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1100&q=90',
      description: 'Premium executive suite in Davao premier condominium. High security, luxury bedding, infinity pool, fitness gym access, and private wine collection cabinet.',
      hostId: 1
    }
  ];

  const defaultBookings = [
    {
      id: 'AP-TAG-1012',
      listingId: 1,
      guestName: 'Alice Smith',
      guestEmail: 'alice@example.com',
      guestPhone: '+63 987 654 3210',
      guestGender: 'Female',
      checkIn: '12 Oct',
      checkOut: '15 Oct',
      guests: 2,
      pricePerNight: 85,
      nights: 3,
      totalPrice: 310,
      status: 'Confirmed',
      dateBooked: '2026-06-15',
      notes: 'High floor please!'
    },
    {
      id: 'AP-DVO-1020',
      listingId: 2,
      guestName: 'John Doe',
      guestEmail: 'john@gmail.com',
      guestPhone: '+1 555 0199',
      guestGender: 'Male',
      checkIn: '20 Oct',
      checkOut: '23 Oct',
      guests: 1,
      pricePerNight: 72,
      nights: 3,
      totalPrice: 271,
      status: 'Pending',
      dateBooked: '2026-06-17',
      notes: 'Looking forward to the stay.'
    }
  ];

  const defaultSaved = [1, 2, 3]; // listing IDs saved by default

  // Helper: Get data or set default
  function getStorageData(key, defaultValue) {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(data);
  }

  // Initialize
  const users = getStorageData('users', defaultUsers);
  const listings = getStorageData('listings', defaultListings);
  const bookings = getStorageData('bookings', defaultBookings);
  const saved = getStorageData('saved_listings', defaultSaved);

  // Default logged in user (if nothing logged in yet, make it guest John Doe for testing, or keep null)
  // Let's keep John Doe logged in by default if there's no currentUser to make it frictionless,
  // but let them log out and switch to Sarah easily.
  if (!localStorage.getItem('currentUser')) {
    localStorage.setItem('currentUser', JSON.stringify(defaultUsers[1])); // John Doe is logged in
  }

  // --- CORE AUTH METHODS ---
  window.Auth = {
    getUsers: () => JSON.parse(localStorage.getItem('users')) || defaultUsers,
    getListings: () => JSON.parse(localStorage.getItem('listings')) || defaultListings,
    getBookings: () => JSON.parse(localStorage.getItem('bookings')) || defaultBookings,
    getSavedListings: () => JSON.parse(localStorage.getItem('saved_listings')) || defaultSaved,
    
    getCurrentUser: () => {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    },

    login: (email, password) => {
      const allUsers = window.Auth.getUsers();
      const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { success: true, user };
      }
      return { success: false, message: 'Invalid email or password.' };
    },

    logout: () => {
      localStorage.removeItem('currentUser');
      window.location.href = 'index.html';
    },

    register: (name, email, password, role = 'guest') => {
      const allUsers = window.Auth.getUsers();
      const exists = allUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        return { success: false, message: 'Email already registered.' };
      }
      
      const newUser = {
        id: allUsers.length + 1,
        name,
        email,
        password,
        role,
        avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80`, // placeholder
        rating: '0.0',
        reviewsCount: 0,
        phone: '',
        gender: 'Prefer not to say',
        bio: ''
      };

      allUsers.push(newUser);
      localStorage.setItem('users', JSON.stringify(allUsers));
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      return { success: true, user: newUser };
    },

    updateProfile: (updatedData) => {
      const currentUser = window.Auth.getCurrentUser();
      if (!currentUser) return false;

      const updatedUser = { ...currentUser, ...updatedData };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      // Update in users database
      const allUsers = window.Auth.getUsers();
      const index = allUsers.findIndex(u => u.id === currentUser.id);
      if (index !== -1) {
        allUsers[index] = updatedUser;
        localStorage.setItem('users', JSON.stringify(allUsers));
      }
      return true;
    },

    toggleSaveListing: (listingId) => {
      let savedList = window.Auth.getSavedListings();
      const id = parseInt(listingId, 10);
      if (savedList.includes(id)) {
        savedList = savedList.filter(x => x !== id);
      } else {
        savedList.push(id);
      }
      localStorage.setItem('saved_listings', JSON.stringify(savedList));
      return savedList.includes(id);
    },

    addListing: (listingData) => {
      const allListings = window.Auth.getListings();
      const newId = allListings.length > 0 ? Math.max(...allListings.map(l => l.id)) + 1 : 1;
      const listing = {
        id: newId,
        rating: 5.0,
        reviewsCount: 0,
        ...listingData
      };
      allListings.push(listing);
      localStorage.setItem('listings', JSON.stringify(allListings));
      return listing;
    },

    deleteListing: (listingId) => {
      const allListings = window.Auth.getListings();
      const filtered = allListings.filter(l => l.id !== parseInt(listingId, 10));
      localStorage.setItem('listings', JSON.stringify(filtered));
      return true;
    },

    updateListing: (listingId, listingData) => {
      const allListings = window.Auth.getListings();
      const idx = allListings.findIndex(l => l.id === parseInt(listingId, 10));
      if (idx !== -1) {
        allListings[idx] = { ...allListings[idx], ...listingData };
        localStorage.setItem('listings', JSON.stringify(allListings));
        return true;
      }
      return false;
    },

    addBooking: (bookingData) => {
      const allBookings = window.Auth.getBookings();
      const code = 'AP-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      const booking = {
        id: code,
        dateBooked: new Date().toISOString().split('T')[0],
        status: 'Confirmed', // Automatically confirm client-side bookings
        ...bookingData
      };
      allBookings.push(booking);
      localStorage.setItem('bookings', JSON.stringify(allBookings));
      return booking;
    },

    updateBookingStatus: (bookingId, newStatus) => {
      const allBookings = window.Auth.getBookings();
      const idx = allBookings.findIndex(b => b.id === bookingId);
      if (idx !== -1) {
        allBookings[idx].status = newStatus;
        localStorage.setItem('bookings', JSON.stringify(allBookings));
        return true;
      }
      return false;
    }
  };

  // --- DYNAMIC HEADER UPDATE ---
  function renderHeaderActions() {
    const accountActions = document.querySelector('.account-actions');
    if (!accountActions) return;

    const user = window.Auth.getCurrentUser();

    if (!user) {
      // Anonymous
      accountActions.innerHTML = `
        <a href="login.html" class="login-header-btn" style="
          color: var(--blue);
          text-decoration: none;
          font-weight: 700;
          font-size: 14px;
          padding: 8px 16px;
          border: 1px solid var(--blue);
          border-radius: 6px;
          margin-right: 8px;
          transition: background 0.2s;
        ">Log In</a>
        <div class="profile-menu-container" style="position: relative;">
          <button class="profile-button" aria-label="Profile menu" id="profileMenuBtn" style="
            display: inline-flex;
            align-items: center;
            gap: 6px;
            border: 0;
            background: transparent;
            color: #5b6170;
            cursor: pointer;
            padding: 4px;
          ">
            <div style="
              width: 34px;
              height: 34px;
              border-radius: 50%;
              background: #e4e6eb;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #65676b;
            ">
              <svg viewBox="0 0 24 24" style="width: 20px; height: 20px; stroke-width: 2;"><path d="M20 21a8 8 0 0 0-16 0m12-13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/></svg>
            </div>
            <svg viewBox="0 0 24 24" aria-hidden="true" style="width: 14px;"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </div>
      `;
    } else {
      // Logged In
      const isHost = user.role === 'host';
      accountActions.className = 'account-actions' + (isHost ? ' host-account' : '');
      
      accountActions.innerHTML = `
        <button class="icon-button" aria-label="Notifications" style="
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 0;
          background: transparent;
          color: #5b6170;
          cursor: pointer;
        ">
          <span class="alert-dot"></span>
          <svg viewBox="0 0 24 24" aria-hidden="true" style="width: 23px;">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8.3 12a2.6 2.6 0 0 0 4.6 0"/>
          </svg>
        </button>
        
        <div class="profile-menu-container" style="position: relative; display: flex; align-items: center;">
          <button class="profile-button" aria-label="Profile menu" id="profileMenuBtn" style="
            display: inline-flex;
            align-items: center;
            gap: 8px;
            border: 0;
            background: transparent;
            color: #5b6170;
            cursor: pointer;
            padding: 4px;
          ">
            <img class="${isHost ? 'host-avatar' : ''}" src="${user.avatarUrl}" alt="${user.name}" style="
              width: 34px;
              height: 34px;
              border-radius: 50%;
              object-fit: cover;
            ">
            ${isHost ? `
              <div class="host-mini" style="display: grid; gap: 1px; line-height: 1.1; text-align: left;">
                <strong style="font-weight: 800; font-size: 13px; color: var(--text);">${user.name}</strong>
                <span style="color: #676c76; font-size: 11px;">Host Dashboard</span>
              </div>
            ` : ''}
            <svg viewBox="0 0 24 24" aria-hidden="true" style="width: 14px;"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </div>
      `;
    }

    setupDropdown();
  }

  // --- PROFILE DROPDOWN LOGIC ---
  function setupDropdown() {
    const container = document.querySelector('.profile-menu-container');
    if (!container) return;

    const user = window.Auth.getCurrentUser();
    
    // Create dropdown element
    const dropdown = document.createElement('div');
    dropdown.className = 'profile-dropdown';
    dropdown.id = 'profileDropdown';
    
    if (user) {
      const isHost = user.role === 'host';
      dropdown.innerHTML = `
        <div class="dropdown-header">
          <strong>${user.name}</strong>
          <span>${user.email}</span>
        </div>
        <a href="profile.html" class="dropdown-item">
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M20 21a8 8 0 0 0-16 0m12-13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/></svg>
          My Profile
        </a>
        <a href="profile.html?tab=trips" class="dropdown-item">
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          My Trips
        </a>
        <a href="saved-apartments.html" class="dropdown-item">
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          Saved Stays
        </a>
        ${isHost ? `
          <a href="admin.html" class="dropdown-item" style="color: var(--blue); font-weight: 600;">
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 20h9M3 20h9M12 4V2M12 22v-2M4 12H2M22 12h-2m-3.3-6.7L15.3 6.7M6.7 15.3l-1.4 1.4M17.3 17.3l-1.4-1.4M6.7 6.7L5.3 5.3"/></svg>
            Host Dashboard
          </a>
        ` : ''}
        <div class="dropdown-divider"></div>
        <div class="dropdown-item logout-btn" id="logoutBtn" style="color: #e83e5a;">
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          Log Out
        </div>
      `;
    } else {
      dropdown.innerHTML = `
        <div class="dropdown-header">
          <strong>Welcome to Apartly</strong>
          <span>Sign in to book amazing stays</span>
        </div>
        <a href="login.html" class="dropdown-item">
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
          Log In
        </a>
        <a href="login.html?tab=signup" class="dropdown-item">
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8.5 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm10 1v6m3-3h-6"/></svg>
          Create Account
        </a>
        <a href="saved-apartments.html" class="dropdown-item">
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          Saved Stays
        </a>
      `;
    }

    container.appendChild(dropdown);

    const btn = document.getElementById('profileMenuBtn');
    
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      dropdown.classList.toggle('is-active');
    });

    // Close when clicking outside
    document.addEventListener('click', function () {
      dropdown.classList.remove('is-active');
    });

    // Logout click
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        window.Auth.logout();
      });
    }
  }

  // --- RUN ON DOM CONTENT LOADED ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderHeaderActions);
  } else {
    renderHeaderActions();
  }
})();
