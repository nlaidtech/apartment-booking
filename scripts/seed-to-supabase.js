// Seed script for Apartly -> Supabase
// Usage: open your app in the browser, open DevTools Console, paste the contents
// of this file or load it from the server, then run: (async () => { await seed(); })();

async function seed() {
  if (!window.Auth) throw new Error('window.Auth not found. Load the app first.');
  await window.Auth.ready;
  if (!window.supabase) throw new Error('Supabase not initialized (window.supabase)');

  // Upsert profiles
  const users = window.Auth.getUsers();
  const profiles = users.map(u => ({
    id: (typeof u.id === 'string' ? u.id : undefined),
    email: u.email,
    name: u.name,
    role: u.role || 'guest',
    avatar_url: u.avatarUrl,
    rating: u.rating || null,
    reviews_count: u.reviewsCount || 0,
    phone: u.phone || null,
    gender: u.gender || null,
    bio: u.bio || null
  }));

  console.log('Upserting profiles...', profiles);
  const { data: upProfiles, error: upProfilesErr } = await window.supabase.from('profiles').upsert(profiles).select();
  if (upProfilesErr) { console.error('profiles upsert error', upProfilesErr); return; }
  console.log('Profiles upserted:', upProfiles);

  // Insert listings if empty
  const { data: existingListings } = await window.supabase.from('listings').select('id').limit(1);
  if (!existingListings || existingListings.length === 0) {
    const listings = window.Auth.getListings().map(l => ({
      host_id: l.hostId || null,
      name: l.name,
      location: l.location,
      room_type: l.roomType,
      amenities: Array.isArray(l.amenities) ? l.amenities : [],
      rating: l.rating || null,
      reviews_count: l.reviewsCount || 0,
      price: l.price || null,
      image_url: l.imageUrl || null,
      description: l.description || ''
    }));
    console.log('Inserting listings...', listings);
    const { data: insListings, error: listingsErr } = await window.supabase.from('listings').insert(listings).select();
    if (listingsErr) { console.error('listings insert error', listingsErr); } else { console.log('Listings inserted:', insListings); }
  } else {
    console.log('Listings table not empty — skipping insert');
  }

  // Insert bookings if empty
  const { data: existingBookings } = await window.supabase.from('bookings').select('id').limit(1);
  if (!existingBookings || existingBookings.length === 0) {
    const bookings = window.Auth.getBookings().map(b => ({
      id: b.id,
      listing_id: b.listingId,
      guest_id: b.guestId || null,
      property_name: b.propertyName || null,
      guest_name: b.guestName,
      guest_email: b.guestEmail,
      guest_phone: b.guestPhone,
      guest_gender: b.guestGender,
      check_in: b.checkIn,
      check_out: b.checkOut,
      guests: b.guests,
      price_per_night: b.pricePerNight,
      nights: b.nights,
      total_price: b.totalPrice,
      status: b.status || 'Confirmed',
      notes: b.notes || ''
    }));
    console.log('Inserting bookings...', bookings);
    const { data: insBookings, error: bookingsErr } = await window.supabase.from('bookings').insert(bookings).select();
    if (bookingsErr) { console.error('bookings insert error', bookingsErr); } else { console.log('Bookings inserted:', insBookings); }
  } else {
    console.log('Bookings table not empty — skipping insert');
  }

  console.log('Seed complete.');
  return true;
}

// expose for console convenience
window.apartlySeed = seed;

export { seed };
