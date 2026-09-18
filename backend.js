// backend.js - Apartly data/auth adapter.
// Uses Supabase when configured in supabase-config.js, with a local demo fallback.

(function () {
  const config = window.APARTLY_SUPABASE_CONFIG || {};
  const hasSupabaseConfig = Boolean(config.url && config.anonKey);

  // Real Registered Users & Inquiries Store (No mock accounts)
  const defaultUsers = [];
  const defaultInquiries = [];

  const defaultListings = [
    {
      id: 1,
      hostId: 'host-1',
      name: 'Mankilam Student Pad & Bedspace',
      location: 'Tagum City',
      roomType: 'Bedspace',
      amenities: ['WiFi', 'Aircon', 'Mineral Water', 'CCTV', 'Locker'],
      rating: 4.9,
      reviewsCount: 42,
      price: 350,
      monthlyPrice: 2800,
      imageUrl: 'assets/properties/ph_bunk_dorm.jpg',
      campusNearby: 'UM Tagum (3 min walk)',
      curfew: '10:00 PM Gate Curfew',
      utilities: 'Submetered electric (₱15/kWh) · Free purified water',
      description: 'Walking distance to University of Mindanao (UM) Tagum Campus. Solid mahogany bunk beds with privacy curtains, student lockers, study nook, 100 Mbps fiber WiFi, and free purified drinking water.'
    },
    {
      id: 2,
      hostId: 'host-2',
      name: 'Apokon Solo Room with Own CR',
      location: 'Tagum City',
      roomType: 'Solo Room',
      amenities: ['Own CR', 'WiFi', 'Aircon', 'Study Desk', 'No Curfew'],
      rating: 4.8,
      reviewsCount: 38,
      price: 550,
      monthlyPrice: 4500,
      imageUrl: 'assets/properties/ph_cozy_dorm.jpg',
      campusNearby: 'UM Tagum & St. Marys (8 min commute)',
      curfew: 'No Curfew (24/7 RFID Keycard)',
      utilities: 'Submetered electricity & water submeter',
      description: 'Peaceful solo room with private toilet & bath (CR), study table, wall-mounted fan plus split-type aircon. Ideal for medical interns, board exam reviewees, and young professionals. Gated with 24/7 keycard access.'
    },
    {
      id: 3,
      hostId: 'host-1',
      name: 'Magugpo Modern Transient Studio',
      location: 'Tagum City',
      roomType: 'Studio Pad',
      amenities: ['WiFi', 'Aircon', 'Kitchenette', 'Motor Parking', 'Own CR'],
      rating: 4.9,
      reviewsCount: 56,
      price: 750,
      monthlyPrice: 6500,
      imageUrl: 'assets/properties/ph_transient_studio.jpg',
      campusNearby: 'UM Tagum & USEP Tagum (5 min via tricycle)',
      curfew: 'No Curfew (Private keypad entry)',
      utilities: 'All utilities included (Fiber WiFi, AC, Water)',
      description: 'Modern transient studio in downtown Tagum City, 3 minutes from Gaisano Mall. Fully furnished with kitchenette, induction cooker, hot/cold shower, and dedicated covered motorcycle parking.'
    },
    {
      id: 4,
      hostId: 'host-2',
      name: 'Bajada Ladies Dormitory & Bedspace',
      location: 'Davao City',
      roomType: 'Bedspace',
      amenities: ['WiFi', 'Aircon', 'CCTV', 'Laundry Area', 'Kitchen'],
      rating: 4.7,
      reviewsCount: 64,
      price: 400,
      monthlyPrice: 3200,
      imageUrl: 'assets/properties/ph_ladies_dorm.jpg',
      campusNearby: 'Davao Doctors College & SPMC (Walking distance)',
      curfew: '9:30 PM Curfew (Strict All-Female Compound)',
      utilities: 'Free drinking water · Shared kitchen & laundry area',
      description: 'Exclusive ladies boarding house near SPMC and Abreeza Mall. Gated 24/7 compound with biometric security, shared cooking facilities, automatic laundry machine, and a quiet study lounge.'
    },
    {
      id: 5,
      hostId: 'host-1',
      name: 'Matina Executive Pad & Transient',
      location: 'Davao City',
      roomType: '1 Bedroom',
      amenities: ['WiFi', 'Aircon', 'Balcony', 'Own CR', 'Motor Parking'],
      rating: 4.8,
      reviewsCount: 29,
      price: 650,
      monthlyPrice: 5500,
      imageUrl: 'assets/properties/ph_hillside_pad.jpg',
      campusNearby: 'Ateneo de Davao (Matina Campus)',
      curfew: 'No Curfew (24/7 Guarded Community)',
      utilities: 'Submetered Davao Light electricity billing',
      description: 'Spacious 1-bedroom apartment pad in Matina, Davao City. Walking distance to Ateneo de Davao and SM City. Features private balcony, clean dining nook, and submetered electricity.'
    },
    {
      id: 6,
      hostId: 'host-2',
      name: 'Lahug IT Park Pods & Bedspace',
      location: 'Cebu City',
      roomType: 'Capsule Pod',
      amenities: ['WiFi', 'Aircon', 'RFID Access', 'Locker', 'Mineral Water'],
      rating: 4.9,
      reviewsCount: 88,
      price: 500,
      monthlyPrice: 4200,
      imageUrl: 'assets/properties/ph_cebu_pods.jpg',
      campusNearby: 'USC Talamban & UC Banilad (10 min jeepney)',
      curfew: 'No Curfew (24/7 BPO & Student Access)',
      utilities: 'All utilities included + 300 Mbps Fiber WiFi',
      description: 'Modern capsule pod bedspace tailored for BPO workers, freelancers, and students in Lahug, Cebu City. 300 Mbps Fiber WiFi, centralized AC, personal reading lamps, and digital lockboxes.'
    }
  ];

  // Real Bookings Store (No mock bookings)
  const defaultBookings = [];

  // Authentic Philippine Boarding House Reviews
  const defaultReviews = [
    {
      id: 'rev-1',
      listingId: 1,
      authorName: 'Camille R.',
      authorRole: 'Nursing Intern (UM Tagum)',
      rating: 5,
      comment: 'Super peaceful environment, perfect for studying for boards! Ate Maria is very motherly and makes sure the gate is locked at 10 PM. Own CR is very clean with strong water pressure.',
      cleanliness: 5,
      wifi: 5,
      landlady: 5,
      date: 'Sep 10, 2026'
    },
    {
      id: 'rev-2',
      listingId: 2,
      authorName: 'Ken Bryan S.',
      authorRole: 'IT Student (Ateneo Davao)',
      rating: 5,
      comment: 'Fiber internet never drops during my coding projects and capstone. Submetered electric is fair and transparent. Highly recommended for students!',
      cleanliness: 5,
      wifi: 5,
      landlady: 5,
      date: 'Sep 02, 2026'
    },
    {
      id: 'rev-3',
      listingId: 3,
      authorName: 'Jessa Mae B.',
      authorRole: 'Medtech Student (USC Cebu)',
      rating: 5,
      comment: 'Very convenient location, just 5 minutes walk to USC Talamban campus. Safe compound with CCTV and polite co-boarders.',
      cleanliness: 5,
      wifi: 5,
      landlady: 5,
      date: 'Aug 28, 2026'
    }
  ];

  const state = {
    users: readLocal('users', defaultUsers),
    listings: readLocal('listings', defaultListings),
    bookings: readLocal('bookings', defaultBookings),
    inquiries: readLocal('inquiries', defaultInquiries),
    reviews: readLocal('reviews', defaultReviews),
    savedListings: readLocal('saved_listings', []),
    currentUser: readLocal('currentUser', null),
    supabase: null,
    ready: false
  };

  function readLocal(key, fallback) {
    const value = localStorage.getItem(key);
    if (!value) {
      if (fallback !== null && fallback !== undefined) {
        localStorage.setItem(key, JSON.stringify(fallback));
      }
      return structuredClone(fallback);
    }
    try {
      let parsed = JSON.parse(value);

      // Clean out legacy mock data if present
      if (key === 'currentUser' && parsed && (parsed.id === 'guest-1' || parsed.id === 'host-1' || parsed.id === 'host-2' || parsed.email === 'sarah.student@gmail.com' || parsed.email === 'maria.landlady@apartly.ph')) {
        localStorage.removeItem('currentUser');
        return null;
      }
      if (key === 'users' && Array.isArray(parsed)) {
        parsed = parsed.filter(u => u && u.id !== 'guest-1' && u.id !== 'host-1' && u.id !== 'host-2' && u.email !== 'sarah.student@gmail.com' && u.email !== 'maria.landlady@apartly.ph');
        localStorage.setItem('users', JSON.stringify(parsed));
      }
      if (key === 'bookings' && Array.isArray(parsed)) {
        parsed = parsed.filter(b => b && b.id !== 'PH-BK8921' && b.guestId !== 'guest-1');
        localStorage.setItem('bookings', JSON.stringify(parsed));
      }
      if (key === 'inquiries' && Array.isArray(parsed)) {
        parsed = parsed.filter(i => i && i.id !== 'INQ-101' && i.guestId !== 'guest-1');
        localStorage.setItem('inquiries', JSON.stringify(parsed));
      }
      if (key === 'listings' && (!Array.isArray(parsed) || parsed.length === 0 || (parsed[0] && parsed[0].imageUrl && parsed[0].imageUrl.includes('unsplash')))) {
        localStorage.setItem(key, JSON.stringify(fallback));
        return structuredClone(fallback);
      }
      return parsed;
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
      rating: row.rating || '5.0',
      reviewsCount: row.reviews_count || row.reviewsCount || 0,
      phone: row.phone || '',
      gender: row.gender || 'Prefer not to say',
      bio: row.bio || '',
      school: row.school || '',
      course: row.course || '',
      studentId: row.student_id || row.studentId || '',
      idDocumentUrl: row.id_document_url || row.idDocumentUrl || '',
      idVerified: row.id_verified !== undefined ? row.id_verified : (row.idVerified !== undefined ? row.idVerified : false),
      emergencyContact: row.emergency_contact || row.emergencyContact || '',
      permit: row.permit_number || row.permit || '',
      landladyYears: row.landlady_years || row.landladyYears || 5
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
      monthlyPrice: Number(row.monthly_price || row.monthlyPrice || (row.price ? Math.round(row.price * 8) : 3000)),
      imageUrl: row.image_url || row.imageUrl,
      campusNearby: row.campus_nearby || row.campusNearby || '',
      curfew: row.curfew || 'No Curfew',
      utilities: row.utilities || 'Standard utility terms',
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
      notes: row.notes || '',
      paymentMethod: row.payment_method || row.paymentMethod || 'gcash',
      leaseType: row.lease_type || row.leaseType || 'transient',
      leaseName: row.lease_name || row.leaseName || 'Daily Transient Stay',
      moveInBalance: Number(row.move_in_balance || row.moveInBalance || 0),
      depositDetails: row.deposit_details || row.depositDetails || null
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
      bio: user.bio,
      school: user.school,
      course: user.course,
      student_id: user.studentId,
      id_document_url: user.idDocumentUrl,
      id_verified: user.idVerified,
      emergency_contact: user.emergencyContact,
      permit_number: user.permit,
      landlady_years: user.landladyYears
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
      monthly_price: listing.monthlyPrice || (listing.price ? Math.round(listing.price * 8) : 3000),
      image_url: listing.imageUrl,
      campus_nearby: listing.campusNearby,
      curfew: listing.curfew,
      utilities: listing.utilities,
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
      notes: booking.notes,
      payment_method: booking.paymentMethod,
      lease_type: booking.leaseType,
      lease_name: booking.leaseName,
      move_in_balance: booking.moveInBalance
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

      const [listingsResult, bookingsResult, reviewsResult, inquiriesResult] = await Promise.all([
        state.supabase.from('listings').select('*').order('id'),
        state.supabase.from('bookings').select('*').order('created_at', { ascending: false }),
        state.supabase.from('reviews').select('*').order('created_at', { ascending: false }),
        state.supabase.from('inquiries').select('*').order('created_at', { ascending: false })
      ]);

      if (!listingsResult.error && listingsResult.data) {
        state.listings = listingsResult.data.map(toListing);
        writeLocal('listings', state.listings);
      }

      if (!bookingsResult.error && bookingsResult.data) {
        state.bookings = bookingsResult.data.map(toBooking);
        writeLocal('bookings', state.bookings);
      }

      if (reviewsResult && !reviewsResult.error && reviewsResult.data && reviewsResult.data.length > 0) {
        state.reviews = reviewsResult.data.map(r => ({
          id: r.id,
          listingId: r.listing_id || r.listingId,
          authorName: r.author_name || r.authorName,
          authorRole: r.author_role || r.authorRole,
          rating: r.rating,
          cleanliness: r.cleanliness || 5,
          wifi: r.wifi || 5,
          landlady: r.landlady || 5,
          comment: r.comment,
          date: r.date || (r.created_at ? new Date(r.created_at).toLocaleDateString() : '')
        }));
        writeLocal('reviews', state.reviews);
      }

      if (inquiriesResult && !inquiriesResult.error && inquiriesResult.data && inquiriesResult.data.length > 0) {
        state.inquiries = inquiriesResult.data;
        writeLocal('inquiries', state.inquiries);
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
        try {
          const { data, error } = await state.supabase.auth.signInWithPassword({ email, password });
          if (error) {
            const isNetworkErr = error.message && (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed'));
            if (isNetworkErr) {
              console.warn('Supabase network unreachable, falling back to local demo login.');
            } else {
              return { success: false, message: error.message };
            }
          } else if (data && data.user) {
            const profileResult = await state.supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();

            state.currentUser = toProfile({ ...(profileResult.data || {}), email: data.user.email });
            writeLocal('currentUser', state.currentUser);
            return { success: true, user: state.currentUser };
          }
        } catch (err) {
          console.warn('Supabase login exception, falling back to local demo:', err);
        }
      }

      // Local Demo Login
      const user = state.users.find((item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password);
      if (!user) return { success: false, message: 'Invalid email or password.' };
      state.currentUser = user;
      writeLocal('currentUser', user);
      return { success: true, user };
    },

    logout: async () => {
      if (state.supabase) {
        try { await state.supabase.auth.signOut(); } catch (e) {}
      }
      state.currentUser = null;
      localStorage.removeItem('currentUser');
      window.location.href = 'index.html';
    },

    register: async (name, email, password, role = 'guest') => {
      if (state.supabase) {
        try {
          const { data, error } = await state.supabase.auth.signUp({
            email,
            password,
            options: { data: { name, role } }
          });

          if (error) {
            const isNetworkErr = error.message && (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed'));
            if (isNetworkErr) {
              console.warn('Supabase unreachable, falling back to local demo registration.');
            } else {
              return { success: false, message: error.message };
            }
          } else if (data && data.user) {
            const profile = {
              id: data.user.id,
              email,
              name,
              role,
              avatarUrl: role === 'host' ? 'assets/avatars/ate_maria.jpg' : 'assets/avatars/sarah_student.jpg',
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
        } catch (err) {
          console.warn('Supabase registration exception, falling back to local demo:', err);
        }
      }

      // Local Demo Registration
      const exists = state.users.some((item) => item.email.toLowerCase() === email.toLowerCase());
      if (exists) return { success: false, message: 'Email already registered.' };
      const numericIds = state.users.map((item) => Number(item.id)).filter(Boolean);
      const user = {
        id: numericIds.length ? Math.max(...numericIds) + 1 : 1,
        name,
        email,
        password,
        role,
        avatarUrl: role === 'host' ? 'assets/avatars/ate_maria.jpg' : 'assets/avatars/sarah_student.jpg',
        rating: '5.0',
        reviewsCount: 0,
        phone: '',
        gender: 'Prefer not to say',
        bio: role === 'host' ? 'Boarding house host / caretaker' : 'Student tenant searching for a boarding stay'
      };
      state.users.push(user);
      writeLocal('users', state.users);
      state.currentUser = user;
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

    switchUser: (userId) => {
      const user = state.users.find((u) => u.id === userId);
      if (!user) return false;
      state.currentUser = user;
      writeLocal('currentUser', user);
      document.dispatchEvent(new CustomEvent('apartly:user-switched', { detail: user }));
      renderHeaderActions();
      return user;
    },

    getInquiries: () => {
      // Normalize threads to have messages array
      return state.inquiries.map(inq => {
        if (!inq.messages) {
          inq.messages = [];
          if (inq.message) {
            inq.messages.push({
              id: 'm1',
              senderRole: 'guest',
              senderName: inq.guestName || 'Student',
              text: inq.message,
              imageUrl: inq.imageUrl || null,
              timestamp: inq.dateSent || 'Recently'
            });
          }
          if (inq.reply) {
            inq.messages.push({
              id: 'm2',
              senderRole: 'host',
              senderName: 'Landlady',
              text: inq.reply,
              imageUrl: inq.replyImageUrl || null,
              timestamp: 'Replied'
            });
          }
        }
        return inq;
      });
    },

    getChatThread: (threadId) => {
      const thread = state.inquiries.find(i => i.id === threadId);
      if (!thread) return null;
      if (!thread.messages) thread.messages = [];
      return thread;
    },

    sendChatMessage: (threadId, { senderRole = 'guest', senderName = '', text = '', imageUrl = null }) => {
      let thread = state.inquiries.find(i => i.id === threadId);
      if (!thread) return null;
      if (!thread.messages) thread.messages = [];

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newMsg = {
        id: 'MSG-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        senderRole,
        senderName: senderName || (senderRole === 'host' ? 'Landlady' : (state.currentUser ? state.currentUser.name : 'Student')),
        text: (text || '').trim(),
        imageUrl: imageUrl || null,
        timestamp: timeStr
      };

      thread.messages.push(newMsg);
      thread.lastUpdated = new Date().toISOString();
      if (senderRole === 'host') {
        thread.status = 'Replied';
        thread.reply = text;
        if (imageUrl) thread.replyImageUrl = imageUrl;
        thread.unreadByGuest = (thread.unreadByGuest || 0) + 1;
        thread.unreadByHost = 0;
      } else {
        thread.status = 'Active';
        thread.unreadByHost = (thread.unreadByHost || 0) + 1;
        thread.unreadByGuest = 0;
      }

      writeLocal('inquiries', state.inquiries);
      updateUnreadBadges();

      if (state.supabase) {
        state.supabase.from('inquiries').upsert({
          id: thread.id,
          listing_id: thread.listingId,
          property_name: thread.propertyName,
          guest_id: thread.guestId,
          messages: thread.messages,
          status: thread.status,
          reply: thread.reply,
          unread_by_guest: thread.unreadByGuest,
          unread_by_host: thread.unreadByHost,
          last_updated: thread.lastUpdated
        }).then(() => {}).catch(() => {});
      }

      document.dispatchEvent(new CustomEvent('apartly:chat-updated', { detail: { threadId, message: newMsg } }));
      document.dispatchEvent(new CustomEvent('apartly:unread-updated', { detail: { count: window.Auth.getUnreadCount() } }));
      return newMsg;
    },

    addInquiry: (inquiryData) => {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const guestName = state.currentUser ? state.currentUser.name : 'Student Boarder';
      const initialMsg = {
        id: 'MSG-' + Date.now(),
        senderRole: 'guest',
        senderName: guestName,
        text: (inquiryData.message || '').trim(),
        imageUrl: inquiryData.imageUrl || null,
        timestamp: timeStr
      };

      const inq = {
        id: 'CHAT-' + Math.floor(100 + Math.random() * 900),
        guestId: currentUserId(),
        guestName: guestName,
        guestPhone: state.currentUser ? state.currentUser.phone : '',
        dateSent: new Date().toISOString().slice(0, 10),
        status: 'Sent',
        reply: null,
        unreadByHost: 1,
        unreadByGuest: 0,
        messages: [initialMsg],
        ...inquiryData
      };
      state.inquiries.unshift(inq);
      writeLocal('inquiries', state.inquiries);
      updateUnreadBadges();

      if (state.supabase) {
        state.supabase.from('inquiries').insert({
          id: inq.id,
          listing_id: inq.listingId,
          property_name: inq.propertyName,
          guest_id: inq.guestId,
          guest_name: inq.guestName,
          guest_phone: inq.guestPhone,
          message: inq.message,
          messages: inq.messages,
          status: inq.status,
          date_sent: inq.dateSent,
          unread_by_host: 1,
          unread_by_guest: 0
        }).then(() => {}).catch(() => {});
      }
      document.dispatchEvent(new CustomEvent('apartly:chat-updated', { detail: { threadId: inq.id, message: initialMsg } }));
      document.dispatchEvent(new CustomEvent('apartly:unread-updated', { detail: { count: window.Auth.getUnreadCount() } }));
      return inq;
    },

    replyInquiry: (inquiryId, replyText, imageUrl = null) => {
      const thread = state.inquiries.find((i) => i.id === inquiryId);
      if (!thread) return false;
      if (!thread.messages) thread.messages = [];

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const hostMsg = {
        id: 'MSG-' + Date.now(),
        senderRole: 'host',
        senderName: state.currentUser && state.currentUser.role === 'host' ? state.currentUser.name : 'Landlady',
        text: (replyText || '').trim(),
        imageUrl: imageUrl || null,
        timestamp: timeStr
      };

      thread.messages.push(hostMsg);
      thread.reply = replyText;
      if (imageUrl) thread.replyImageUrl = imageUrl;
      thread.status = 'Replied';
      thread.unreadByGuest = (thread.unreadByGuest || 0) + 1;
      thread.unreadByHost = 0;
      writeLocal('inquiries', state.inquiries);
      updateUnreadBadges();
      document.dispatchEvent(new CustomEvent('apartly:chat-updated', { detail: { threadId: inquiryId, message: hostMsg } }));
      document.dispatchEvent(new CustomEvent('apartly:unread-updated', { detail: { count: window.Auth.getUnreadCount() } }));
      return thread;
    },

    markThreadRead: (threadId, role = null) => {
      const thread = state.inquiries.find(i => i.id === threadId);
      if (!thread) return false;
      const user = state.currentUser;
      const targetRole = role || (user ? user.role : 'guest');
      if (targetRole === 'host') {
        thread.unreadByHost = 0;
      } else {
        thread.unreadByGuest = 0;
      }
      writeLocal('inquiries', state.inquiries);
      updateUnreadBadges();
      document.dispatchEvent(new CustomEvent('apartly:unread-updated', { detail: { count: window.Auth.getUnreadCount() } }));
      return true;
    },

    getUnreadCount: (role = null) => {
      const user = state.currentUser;
      const targetRole = role || (user ? user.role : 'guest');
      if (!state.inquiries || !state.inquiries.length) return 0;
      if (targetRole === 'host') {
        return state.inquiries.reduce((acc, inq) => acc + (inq.unreadByHost || 0), 0);
      } else {
        const myThreads = user ? state.inquiries.filter(inq => !inq.guestId || inq.guestId === user.id || inq.guestEmail === user.email || inq.guestName === user.name) : state.inquiries;
        return myThreads.reduce((acc, inq) => acc + (inq.unreadByGuest || 0), 0);
      }
    },

    getListingReviews: (listingId) => {
      return (state.reviews || []).filter(r => Number(r.listingId) === Number(listingId));
    },

    addReview: ({ listingId, rating, comment, cleanliness = 5, wifi = 5, landlady = 5, authorName = '', authorRole = '' }) => {
      const numListingId = Number(listingId);
      const user = state.currentUser;
      const name = authorName || (user ? user.name : 'Verified Student Boarder');
      const role = authorRole || 'Student Tenant';

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const now = new Date();
      const dateStr = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

      const review = {
        id: 'REV-' + Date.now(),
        listingId: numListingId,
        authorName: name,
        authorRole: role,
        rating: Math.max(1, Math.min(5, Number(rating) || 5)),
        comment: (comment || '').trim(),
        cleanliness: Number(cleanliness) || 5,
        wifi: Number(wifi) || 5,
        landlady: Number(landlady) || 5,
        date: dateStr
      };

      if (!state.reviews) state.reviews = [];
      state.reviews.unshift(review);
      writeLocal('reviews', state.reviews);

      // Recalculate listing rating
      const listing = state.listings.find(l => Number(l.id) === numListingId);
      if (listing) {
        const oldCount = listing.reviewsCount || 0;
        const oldRating = listing.rating || 5.0;
        const newCount = oldCount + 1;
        const newRating = Number((((oldRating * oldCount) + Number(review.rating)) / newCount).toFixed(1));
        listing.reviewsCount = newCount;
        listing.rating = Math.min(5.0, Math.max(1.0, newRating));
        writeLocal('listings', state.listings);

        if (state.supabase) {
          state.supabase.from('listings').update({
            rating: listing.rating,
            reviews_count: listing.reviewsCount
          }).eq('id', numListingId).then(() => {}).catch(() => {});
        }
      }

      if (state.supabase) {
        state.supabase.from('reviews').insert({
          id: review.id,
          listing_id: numListingId,
          author_name: review.authorName,
          author_role: review.authorRole,
          rating: review.rating,
          cleanliness: review.cleanliness,
          wifi: review.wifi,
          landlady: review.landlady,
          comment: review.comment
        }).then(() => {}).catch(() => {});
      }

      document.dispatchEvent(new CustomEvent('apartly:review-added', { detail: { review, listingId: numListingId } }));
      return review;
    },

    addListing: (listingData) => {
      const numericIds = state.listings.map((item) => Number(item.id)).filter(Boolean);
      const listing = {
        id: numericIds.length ? Math.max(...numericIds) + 1 : 1,
        hostId: currentUserId() || 'host-1',
        rating: 5.0,
        reviewsCount: 1,
        ...listingData
      };
      state.listings.unshift(listing);
      writeLocal('listings', state.listings);
      if (state.supabase) state.supabase.from('listings').insert(fromListing(listing));
      document.dispatchEvent(new CustomEvent('apartly:listing-added', { detail: listing }));
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
        dateBooked: new Date().toISOString().slice(0, 10),
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
        state.bookings.unshift(savedBooking);
        writeLocal('bookings', state.bookings);
        return savedBooking;
      }

      state.bookings.unshift(booking);
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
    },

    getUserById: (userId) => {
      return state.users.find((u) => u.id === userId || u.email === userId) || null;
    },

    verifyStudent: (studentId, isVerified = true) => {
      const user = state.users.find((u) => u.id === studentId || u.studentId === studentId || u.email === studentId);
      if (!user) return false;
      user.idVerified = isVerified;
      writeLocal('users', state.users);
      if (state.currentUser && (state.currentUser.id === user.id || state.currentUser.email === user.email)) {
        state.currentUser.idVerified = isVerified;
        writeLocal('currentUser', state.currentUser);
      }
      if (state.supabase) {
        state.supabase.from('profiles').update({ id_verified: isVerified }).eq('id', user.id);
      }
      return user;
    },

    openAuthModal: (mode = 'signup', redirectTo = '') => {
      openAuthModal(mode, redirectTo);
    }
  };

  function renderHeaderActions() {
    const accountActions = document.querySelector('.account-actions');
    if (!accountActions) return;

    const user = window.Auth.getCurrentUser();
    if (!user) {
      accountActions.innerHTML = `
        <a href="login.html?portal=renter" class="auth-btn">Student Login</a>
        <a href="login.html?portal=owner" class="auth-btn primary" style="background:var(--teal);border-color:var(--teal);">Owner Portal</a>
      `;
    } else {
      const isHost = user.role === 'host';

      if (isHost) {
        // OWNER / LANDLADY NAVIGATION
        const hostUnread = window.Auth.getUnreadCount('host');
        accountActions.innerHTML = `
          <a href="admin.html#inquiries" class="topnav-inq-btn" title="Student Inquiries" style="position:relative; display:inline-flex; align-items:center; gap:6px; color:var(--white); font-size:13px; font-weight:600; padding:6px 14px; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.22); border-radius:var(--radius-full);">
            <span>💬 Inquiries</span>
            <span class="unread-badge ${hostUnread > 0 ? 'has-unread' : ''}" id="adminInquiryBadge" style="${hostUnread > 0 ? 'display:inline-flex;' : 'display:none;'}">${hostUnread}</span>
          </a>
          <a href="admin.html#post" class="btn-post-nav" aria-label="Post a room">
            <span>+</span> Post Room
          </a>
          <div class="profile-dropdown">
            <button class="profile-dropdown-trigger" aria-label="Landlady menu" id="profileMenuBtn">
              <img src="${user.avatarUrl || 'assets/avatars/ate_maria.jpg'}" alt="${user.name}">
              <span>${user.name.split(' ')[0]} (Landlady)</span>
            </button>
            <div class="profile-dropdown-menu" id="profileDropdownMenu">
              <div style="padding:8px 12px; border-bottom:1px solid var(--line); font-size:12px; color:var(--muted);">
                <strong style="color:var(--teal-deep); display:block; font-size:13px;">${user.name}</strong>
                <span>Boarding House Operator</span>
              </div>
              <a href="admin.html">Host Dashboard</a>
              <a href="admin.html#listings">My Properties</a>
              <a href="admin.html#reservations">Tenant Bookings</a>
              <a href="admin.html#inquiries">
                Student Inquiries
                <span class="unread-badge" style="${hostUnread > 0 ? 'display:inline-flex;' : 'display:none;'}">${hostUnread}</span>
              </a>
              <a href="admin.html#post">+ Post New Room</a>
              <a href="#" id="logoutBtn" style="color:var(--clay); border-top:1px solid var(--line); margin-top:4px;">Log Out</a>
            </div>
          </div>
        `;
      } else {
        // RENTER / STUDENT NAVIGATION (STRICTLY NO OWNER CONTROLS)
        const guestUnread = window.Auth.getUnreadCount('guest');
        accountActions.innerHTML = `
          <a href="profile.html?tab=inquiries" class="topnav-inq-btn" title="My Messages" style="position:relative; display:inline-flex; align-items:center; gap:6px; color:var(--ink); font-size:13px; font-weight:600; padding:6px 14px; background:var(--paper); border:1px solid var(--line); border-radius:var(--radius-full);">
            <span>💬 Messages</span>
            <span class="unread-badge ${guestUnread > 0 ? 'has-unread' : ''}" id="inquiryUnreadBadge" style="${guestUnread > 0 ? 'display:inline-flex;' : 'display:none;'}">${guestUnread}</span>
          </a>
          <div class="profile-dropdown">
            <button class="profile-dropdown-trigger" aria-label="Student menu" id="profileMenuBtn">
              <img src="${user.avatarUrl || 'assets/avatars/sarah_student.jpg'}" alt="${user.name}">
              <span>${user.name.split(' ')[0]}</span>
            </button>
            <div class="profile-dropdown-menu" id="profileDropdownMenu">
              <div style="padding:8px 12px; border-bottom:1px solid var(--line); font-size:12px; color:var(--muted);">
                <strong style="color:var(--teal-deep); display:block; font-size:13px;">${user.name}</strong>
                <span>Student Tenant</span>
              </div>
              <a href="profile.html">My Student Profile</a>
              <a href="profile.html?tab=trips">My Bookings</a>
              <a href="profile.html?tab=inquiries">
                Messages &amp; Inquiries
                <span class="unread-badge" style="${guestUnread > 0 ? 'display:inline-flex;' : 'display:none;'}">${guestUnread}</span>
              </a>
              <a href="saved-apartments.html">Saved Stays</a>
              <a href="#" id="logoutBtn" style="color:var(--clay); border-top:1px solid var(--line); margin-top:4px;">Log Out</a>
            </div>
          </div>
        `;
      }
    }

    setupDropdown();
    setupAuthButtons();
    updateUnreadBadges();
  }

  function updateUnreadBadges() {
    if (!window.Auth) return;
    const guestCount = window.Auth.getUnreadCount('guest');
    const hostCount = window.Auth.getUnreadCount('host');

    const guestBadges = document.querySelectorAll('#inquiryUnreadBadge, .inquiry-unread-badge');
    guestBadges.forEach(b => {
      b.textContent = String(guestCount);
      b.style.display = guestCount > 0 ? 'inline-flex' : 'none';
      if (guestCount > 0) b.classList.add('has-unread');
      else b.classList.remove('has-unread');
    });

    const hostBadges = document.querySelectorAll('#adminInquiryBadge, .admin-inquiry-badge');
    hostBadges.forEach(b => {
      b.textContent = String(hostCount);
      b.style.display = hostCount > 0 ? 'inline-flex' : 'none';
      if (hostCount > 0) b.classList.add('has-unread');
      else b.classList.remove('has-unread');
    });
  }

  function setupAuthButtons() {
    document.querySelectorAll('[data-auth-open]').forEach((button) => {
      button.addEventListener('click', () => {
        openAuthModal(button.dataset.authOpen || 'signup', window.location.href);
      });
    });
  }

  function ensureAuthModal() {
    let modal = document.getElementById('authModal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.id = 'authModal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="auth-modal-backdrop" data-auth-close></div>
      <section class="auth-modal-panel" role="dialog" aria-modal="true" aria-labelledby="authModalTitle">
        <button class="auth-modal-close" type="button" data-auth-close aria-label="Close">x</button>
        <div class="auth-modal-tabs">
          <button type="button" class="auth-modal-tab" data-auth-tab="signin">Log in</button>
          <button type="button" class="auth-modal-tab" data-auth-tab="signup">Sign up</button>
        </div>
        <h2 id="authModalTitle">Create your account</h2>
        <p class="auth-modal-copy">Sign up or log in to reserve this apartment and manage your trips.</p>
        <form id="authModalForm">
          <label class="auth-modal-field" data-auth-name-field>
            <span>Full name</span>
            <input id="authModalName" type="text" autocomplete="name" placeholder="John Doe">
          </label>
          <label class="auth-modal-field">
            <span>Email address</span>
            <input id="authModalEmail" type="email" autocomplete="email" placeholder="name@example.com" required>
          </label>
          <label class="auth-modal-field">
            <span>Password</span>
            <input id="authModalPassword" type="password" autocomplete="current-password" placeholder="Password" required>
          </label>
          <div class="auth-modal-role" data-auth-role-field>
            <span>I want to</span>
            <div>
              <button type="button" class="is-active" data-auth-role="guest">Book stays</button>
              <button type="button" data-auth-role="host">Host stays</button>
            </div>
          </div>
          <div class="auth-modal-error" id="authModalError"></div>
          <button class="auth-modal-submit" type="submit">Create account</button>
        </form>
      </section>
    `;
    document.body.appendChild(modal);

    modal.querySelectorAll('[data-auth-close]').forEach((item) => {
      item.addEventListener('click', closeAuthModal);
    });

    modal.querySelectorAll('[data-auth-tab]').forEach((tab) => {
      tab.addEventListener('click', () => setAuthModalMode(tab.dataset.authTab));
    });

    modal.querySelectorAll('[data-auth-role]').forEach((roleButton) => {
      roleButton.addEventListener('click', () => {
        modal.querySelectorAll('[data-auth-role]').forEach((button) => button.classList.remove('is-active'));
        roleButton.classList.add('is-active');
      });
    });

    modal.querySelector('#authModalForm').addEventListener('submit', handleAuthModalSubmit);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal.classList.contains('is-open')) closeAuthModal();
    });
    return modal;
  }

  function setAuthModalMode(mode) {
    const modal = ensureAuthModal();
    const activeMode = mode === 'signin' ? 'signin' : 'signup';
    modal.dataset.mode = activeMode;
    modal.querySelectorAll('[data-auth-tab]').forEach((tab) => {
      tab.classList.toggle('is-active', tab.dataset.authTab === activeMode);
    });
    modal.querySelector('[data-auth-name-field]').hidden = activeMode === 'signin';
    modal.querySelector('[data-auth-role-field]').hidden = activeMode === 'signin';
    modal.querySelector('#authModalTitle').textContent = activeMode === 'signin' ? 'Log in to continue' : 'Create your account';
    modal.querySelector('.auth-modal-submit').textContent = activeMode === 'signin' ? 'Log in' : 'Create account';
    modal.querySelector('#authModalPassword').setAttribute('autocomplete', activeMode === 'signin' ? 'current-password' : 'new-password');
    modal.querySelector('#authModalError').textContent = '';
  }

  function openAuthModal(mode = 'signup', redirectTo = '') {
    const modal = ensureAuthModal();
    modal.dataset.redirectTo = redirectTo || '';
    setAuthModalMode(mode);
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    setTimeout(() => modal.querySelector('#authModalEmail').focus(), 0);
  }

  function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  }

  async function handleAuthModalSubmit(event) {
    event.preventDefault();
    const modal = ensureAuthModal();
    const mode = modal.dataset.mode || 'signup';
    const error = modal.querySelector('#authModalError');
    const name = modal.querySelector('#authModalName').value.trim();
    const email = modal.querySelector('#authModalEmail').value.trim();
    const password = modal.querySelector('#authModalPassword').value;
    const activeRole = modal.querySelector('[data-auth-role].is-active');
    const role = activeRole ? activeRole.dataset.authRole : 'guest';

    error.textContent = '';
    if (!email || !password) {
      error.textContent = 'Please enter your email and password.';
      return;
    }
    if (mode === 'signup' && !name) {
      error.textContent = 'Please enter your full name.';
      return;
    }

    const result = mode === 'signin'
      ? await window.Auth.login(email, password)
      : await window.Auth.register(name, email, password, role);

    if (!result.success) {
      error.textContent = result.message || 'Unable to continue. Please try again.';
      return;
    }

    closeAuthModal();
    const redirectTo = modal.dataset.redirectTo || '';
    if (redirectTo) {
      window.location.href = redirectTo;
    } else if (result.user.role === 'host') {
      window.location.href = 'admin.html';
    } else {
      window.location.reload();
    }
  }

  function setupDropdown() {
    const btn = document.getElementById('profileMenuBtn');
    const menu = document.getElementById('profileDropdownMenu');
    if (!btn || !menu) return;

    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      menu.classList.toggle('show');
    });

    document.addEventListener('click', () => menu.classList.remove('show'));

    const logoutButton = document.getElementById('logoutBtn');
    if (logoutButton) {
      logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.Auth.logout();
      });
    }
  }

  function initHeader() {
    renderHeaderActions();
    updateUnreadBadges();
    document.addEventListener('apartly:data-ready', () => {
      renderHeaderActions();
      updateUnreadBadges();
    });
    document.addEventListener('apartly:unread-updated', updateUnreadBadges);
    document.addEventListener('apartly:chat-updated', updateUnreadBadges);
    document.addEventListener('apartly:user-switched', () => {
      renderHeaderActions();
      updateUnreadBadges();
    });
    const params = new URLSearchParams(window.location.search);
    const authMode = params.get('auth');
    if (authMode) {
      const next = params.get('next') || '';
      setTimeout(() => openAuthModal(authMode, next), 0);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeader);
  } else {
    initHeader();
  }
})();
