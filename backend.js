// backend.js - Apartly data/auth adapter.
// Uses Supabase when configured in supabase-config.js, with a local demo fallback.

(function () {
  const config = window.APARTLY_SUPABASE_CONFIG || {};
  const hasSupabaseConfig = Boolean(config.url && config.anonKey);

  const defaultUsers = [];

  const defaultListings = [];

  const defaultBookings = [];

  const state = {
    users: readLocal('users', []),
    listings: readLocal('listings', []),
    bookings: readLocal('bookings', []),
    savedListings: readLocal('saved_listings', []),
    currentUser: readLocal('currentUser', null),
    supabase: null,
    ready: false
  };

  function readLocal(key, fallback) {
    const value = localStorage.getItem(key);
    if (!value) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return structuredClone(fallback);
    }
    try {
      return JSON.parse(value);
    } catch {
      localStorage.setItem(key, JSON.stringify(fallback));
      return structuredClone(fallback);
    }
  }

  function writeLocal(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function toProfile(row) {
    if (!row) return null;
    return {
      id: row.id,
      email: row.email || '',
      name: row.name || '',
      role: row.role || 'guest',
      avatarUrl: row.avatar_url || row.avatarUrl || '',
      rating: row.rating || '0.0',
      reviewsCount: row.reviews_count || row.reviewsCount || 0,
      phone: row.phone || '',
      gender: row.gender || 'Prefer not to say',
      bio: row.bio || ''
    };
  }

  function toListing(row) {
    return {
      id: row.id,
      name: row.name,
      location: row.location,
      roomType: row.room_type || row.roomType,
      amenities: row.amenities || [],
      rating: Number(row.rating || 0),
      reviewsCount: row.reviews_count || row.reviewsCount || 0,
      price: Number(row.price || 0),
      imageUrl: row.image_url || row.imageUrl,
      description: row.description || '',
      hostId: row.host_id || row.hostId
    };
  }

  function toBooking(row) {
    return {
      id: row.id,
      listingId: row.listing_id || row.listingId,
      guestId: row.guest_id || row.guestId,
      propertyName: row.property_name || row.propertyName,
      guestName: row.guest_name || row.guestName,
      guestEmail: row.guest_email || row.guestEmail,
      guestPhone: row.guest_phone || row.guestPhone,
      guestGender: row.guest_gender || row.guestGender,
      checkIn: row.check_in || row.checkIn,
      checkOut: row.check_out || row.checkOut,
      guests: row.guests,
      pricePerNight: row.price_per_night || row.pricePerNight,
      nights: row.nights,
      totalPrice: row.total_price || row.totalPrice,
      status: row.status,
      dateBooked: row.created_at || row.dateBooked,
      notes: row.notes || ''
    };
  }

  function fromProfile(user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar_url: user.avatarUrl,
      rating: user.rating,
      reviews_count: user.reviewsCount,
      phone: user.phone,
      gender: user.gender,
      bio: user.bio
    };
  }

  function fromListing(listing) {
    return {
      id: listing.id,
      host_id: listing.hostId,
      name: listing.name,
      location: listing.location,
      room_type: listing.roomType,
      amenities: listing.amenities,
      rating: listing.rating,
      reviews_count: listing.reviewsCount,
      price: listing.price,
      image_url: listing.imageUrl,
      description: listing.description
    };
  }

  function fromBooking(booking) {
    return {
      id: booking.id,
      listing_id: booking.listingId,
      guest_id: booking.guestId,
      property_name: booking.propertyName,
      guest_name: booking.guestName,
      guest_email: booking.guestEmail,
      guest_phone: booking.guestPhone,
      guest_gender: booking.guestGender,
      check_in: booking.checkIn,
      check_out: booking.checkOut,
      guests: booking.guests,
      price_per_night: booking.pricePerNight,
      nights: booking.nights,
      total_price: booking.totalPrice,
      status: booking.status,
      notes: booking.notes
    };
  }

  function loadSupabaseScript() {
    return new Promise((resolve, reject) => {
      if (window.supabase) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async function hydrateFromSupabase() {
    if (!hasSupabaseConfig) {
      state.ready = true;
      document.dispatchEvent(new CustomEvent('apartly:data-ready'));
      return;
    }

    try {
      await loadSupabaseScript();
      state.supabase = window.supabase.createClient(config.url, config.anonKey);

      const sessionResult = await state.supabase.auth.getSession();
      const sessionUser = sessionResult.data.session && sessionResult.data.session.user;

      const [listingsResult, bookingsResult] = await Promise.all([
        state.supabase.from('listings').select('*').order('id'),
        state.supabase.from('bookings').select('*').order('created_at', { ascending: false })
      ]);

      if (!listingsResult.error && listingsResult.data) {
        state.listings = listingsResult.data.map(toListing);
        writeLocal('listings', state.listings);
      }

      if (!bookingsResult.error && bookingsResult.data) {
        state.bookings = bookingsResult.data.map(toBooking);
        writeLocal('bookings', state.bookings);
      }

      if (sessionUser) {
        const profileResult = await state.supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionUser.id)
          .single();

        if (!profileResult.error && profileResult.data) {
          state.currentUser = toProfile({ ...profileResult.data, email: sessionUser.email });
          writeLocal('currentUser', state.currentUser);
        }

        const savedResult = await state.supabase
          .from('saved_listings')
          .select('listing_id')
          .eq('user_id', sessionUser.id);

        if (!savedResult.error && savedResult.data) {
          state.savedListings = savedResult.data.map((item) => item.listing_id);
          writeLocal('saved_listings', state.savedListings);
        }
      } else {
        state.currentUser = null;
        localStorage.removeItem('currentUser');
      }
    } catch (error) {
      console.warn('Supabase unavailable. Using local demo data.', error);
    } finally {
      state.ready = true;
      document.dispatchEvent(new CustomEvent('apartly:data-ready'));
    }
  }

  function currentUserId() {
    return state.currentUser && state.currentUser.id;
  }

  function makeBookingId() {
    return 'AP-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  window.Auth = {
    ready: hydrateFromSupabase(),
    usingSupabase: () => Boolean(state.supabase),
    getUsers: () => state.users,
    getListings: () => state.listings,
    getBookings: () => state.bookings,
    getSavedListings: () => state.savedListings,
    getCurrentUser: () => state.currentUser,

    login: async (email, password) => {
      if (state.supabase) {
        const { data, error } = await state.supabase.auth.signInWithPassword({ email, password });
        if (error) return { success: false, message: error.message };

        const profileResult = await state.supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        state.currentUser = toProfile({ ...(profileResult.data || {}), email: data.user.email });
        writeLocal('currentUser', state.currentUser);
        return { success: true, user: state.currentUser };
      }

      const user = state.users.find((item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password);
      if (!user) return { success: false, message: 'Invalid email or password.' };
      state.currentUser = user;
      writeLocal('currentUser', user);
      return { success: true, user };
    },

    logout: async () => {
      if (state.supabase) await state.supabase.auth.signOut();
      state.currentUser = null;
      localStorage.removeItem('currentUser');
      window.location.href = 'index.html';
    },

    register: async (name, email, password, role = 'guest') => {
      if (state.supabase) {
        const { data, error } = await state.supabase.auth.signUp({
          email,
          password,
          options: { data: { name, role } }
        });
        if (error) return { success: false, message: error.message };

        const profile = {
          id: data.user.id,
          email,
          name,
          role,
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
          rating: '0.0',
          reviewsCount: 0,
          phone: '',
          gender: 'Prefer not to say',
          bio: ''
        };

        await state.supabase.from('profiles').upsert(fromProfile(profile));
        state.currentUser = profile;
        writeLocal('currentUser', profile);
        return { success: true, user: profile };
      }

      const exists = state.users.some((item) => item.email.toLowerCase() === email.toLowerCase());
      if (exists) return { success: false, message: 'Email already registered.' };
      const user = {
        id: Math.max(...state.users.map((item) => Number(item.id))) + 1,
        name,
        email,
        password,
        role,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        rating: '0.0',
        reviewsCount: 0,
        phone: '',
        gender: 'Prefer not to say',
        bio: ''
      };
      state.users.push(user);
      state.currentUser = user;
      writeLocal('users', state.users);
      writeLocal('currentUser', user);
      return { success: true, user };
    },

    updateProfile: async (updatedData) => {
      if (!state.currentUser) return false;
      state.currentUser = { ...state.currentUser, ...updatedData };
      writeLocal('currentUser', state.currentUser);
      state.users = state.users.map((user) => user.id === state.currentUser.id ? state.currentUser : user);
      writeLocal('users', state.users);
      if (state.supabase) await state.supabase.from('profiles').upsert(fromProfile(state.currentUser));
      return true;
    },

    toggleSaveListing: (listingId) => {
      const id = Number(listingId);
      const saved = state.savedListings.includes(id);
      state.savedListings = saved ? state.savedListings.filter((item) => item !== id) : [...state.savedListings, id];
      writeLocal('saved_listings', state.savedListings);

      if (state.supabase && currentUserId()) {
        if (saved) {
          state.supabase.from('saved_listings').delete().eq('user_id', currentUserId()).eq('listing_id', id);
        } else {
          state.supabase.from('saved_listings').insert({ user_id: currentUserId(), listing_id: id });
        }
      }

      return !saved;
    },

    addListing: (listingData) => {
      const numericIds = state.listings.map((item) => Number(item.id)).filter(Boolean);
      const listing = {
        id: numericIds.length ? Math.max(...numericIds) + 1 : 1,
        rating: 5.0,
        reviewsCount: 0,
        ...listingData
      };
      state.listings.push(listing);
      writeLocal('listings', state.listings);
      if (state.supabase) state.supabase.from('listings').insert(fromListing(listing));
      return listing;
    },

    deleteListing: (listingId) => {
      const id = Number(listingId);
      state.listings = state.listings.filter((listing) => Number(listing.id) !== id);
      writeLocal('listings', state.listings);
      if (state.supabase) state.supabase.from('listings').delete().eq('id', id);
      return true;
    },

    updateListing: (listingId, listingData) => {
      const id = Number(listingId);
      const index = state.listings.findIndex((listing) => Number(listing.id) === id);
      if (index === -1) return false;
      state.listings[index] = { ...state.listings[index], ...listingData };
      writeLocal('listings', state.listings);
      if (state.supabase) state.supabase.from('listings').update(fromListing(state.listings[index])).eq('id', id);
      return true;
    },

    addBooking: async (bookingData) => {
      const booking = {
        id: makeBookingId(),
        guestId: currentUserId(),
        dateBooked: new Date().toISOString(),
        status: 'Confirmed',
        ...bookingData
      };

      if (state.supabase) {
        const { data, error } = await state.supabase
          .from('bookings')
          .insert(fromBooking(booking))
          .select()
          .single();
        if (error) throw error;
        const savedBooking = toBooking(data);
        state.bookings.push(savedBooking);
        writeLocal('bookings', state.bookings);
        return savedBooking;
      }

      state.bookings.push(booking);
      writeLocal('bookings', state.bookings);
      return booking;
    },

    updateBookingStatus: (bookingId, newStatus) => {
      const booking = state.bookings.find((item) => item.id === bookingId);
      if (!booking) return false;
      booking.status = newStatus;
      writeLocal('bookings', state.bookings);
      if (state.supabase) state.supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId);
      return true;
    }
  };

  function renderHeaderActions() {
    const accountActions = document.querySelector('.account-actions');
    if (!accountActions) return;

    const user = window.Auth.getCurrentUser();
    if (!user) {
      accountActions.innerHTML = `
        <a href="login.html" class="login-header-btn">Log In</a>
        <div class="profile-menu-container">
          <button class="profile-button" aria-label="Profile menu" id="profileMenuBtn">
            <span class="anonymous-avatar">
              <svg viewBox="0 0 24 24"><path d="M20 21a8 8 0 0 0-16 0m12-13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/></svg>
            </span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </div>
      `;
    } else {
      accountActions.className = 'account-actions' + (user.role === 'host' ? ' host-account' : '');
      accountActions.innerHTML = `
        <button class="icon-button" aria-label="Notifications">
          <span class="alert-dot"></span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8.3 12a2.6 2.6 0 0 0 4.6 0"/></svg>
        </button>
        <div class="profile-menu-container">
          <button class="profile-button" aria-label="Profile menu" id="profileMenuBtn">
            <img class="${user.role === 'host' ? 'host-avatar' : ''}" src="${user.avatarUrl}" alt="${user.name}">
            ${user.role === 'host' ? `<div class="host-mini"><strong>${user.name}</strong><span>Host Dashboard</span></div>` : ''}
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </div>
      `;
    }

    setupDropdown();
  }

  function setupDropdown() {
    const container = document.querySelector('.profile-menu-container');
    if (!container) return;

    const user = window.Auth.getCurrentUser();
    const dropdown = document.createElement('div');
    dropdown.className = 'profile-dropdown';

    dropdown.innerHTML = user ? `
      <div class="dropdown-header"><strong>${user.name}</strong><span>${user.email}</span></div>
      <a href="profile.html" class="dropdown-item">My Profile</a>
      <a href="profile.html?tab=trips" class="dropdown-item">My Trips</a>
      <a href="saved-apartments.html" class="dropdown-item">Saved Stays</a>
      ${user.role === 'host' ? '<a href="admin.html" class="dropdown-item">Host Dashboard</a>' : ''}
      <div class="dropdown-divider"></div>
      <button class="dropdown-item logout-btn" id="logoutBtn">Log Out</button>
    ` : `
      <div class="dropdown-header"><strong>Welcome to Apartly</strong><span>Sign in to book amazing stays</span></div>
      <a href="login.html" class="dropdown-item">Log In</a>
      <a href="login.html?tab=signup" class="dropdown-item">Create Account</a>
      <a href="saved-apartments.html" class="dropdown-item">Saved Stays</a>
    `;

    container.appendChild(dropdown);

    const button = document.getElementById('profileMenuBtn');
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      dropdown.classList.toggle('is-active');
    });

    document.addEventListener('click', () => dropdown.classList.remove('is-active'));
    const logoutButton = document.getElementById('logoutBtn');
    if (logoutButton) logoutButton.addEventListener('click', () => window.Auth.logout());
  }

  function initHeader() {
    renderHeaderActions();
    document.addEventListener('apartly:data-ready', renderHeaderActions);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeader);
  } else {
    initHeader();
  }
})();
