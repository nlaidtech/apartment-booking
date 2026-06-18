// app.js - Apartment Booking UI interactions

document.addEventListener('DOMContentLoaded', async () => {
  // Ensure data is initialized from Auth
  if (!window.Auth) return;
  await window.Auth.ready;

  const listingGrid = document.querySelector('.listing-grid');
  const listingFilters = document.querySelector('#listingFilters');
  const resultCount = document.querySelector('[data-listing-count]');

  let selectedListingId = 1; // Default is Modern Tagum Stay

  // --- 1. RENDER LISTINGS GRID DYNAMICALLY ---
  function renderListingGrid() {
    if (!listingGrid) return;
    const listings = window.Auth.getListings();
    
    listingGrid.innerHTML = '';
    listings.forEach(listing => {
      const card = document.createElement('article');
      card.className = 'listing-card';
      card.setAttribute('data-listing-card', '');
      card.setAttribute('data-id', listing.id);
      card.setAttribute('data-location', listing.location);
      card.setAttribute('data-room-type', listing.roomType);
      card.setAttribute('data-amenities', listing.amenities.join(','));
      card.setAttribute('data-rating', listing.rating);
      card.setAttribute('data-price', listing.price);

      const savedIds = window.Auth.getSavedListings();
      const isSaved = savedIds.includes(listing.id);

      card.innerHTML = `
        <div style="position: relative;">
          <img src="${listing.imageUrl}" alt="${listing.name}">
          <button class="save-toggle-btn" data-id="${listing.id}" title="${isSaved ? 'Remove from saved' : 'Save listing'}" style="
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255,255,255,0.92);
            border: 0;
            border-radius: 50%;
            width: 34px;
            height: 34px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 1px 4px rgba(0,0,0,0.18);
            transition: background 0.15s;
          ">
            <svg viewBox="0 0 24 24" style="width: 18px; height: 18px; fill: ${isSaved ? '#e83e5a' : 'none'}; stroke: ${isSaved ? '#e83e5a' : '#444'}; stroke-width: 2; transition: fill 0.15s, stroke 0.15s;">
              <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        </div>
        <div class="listing-card-body">
          <div class="listing-card-top">
            <div>
              <h3>${listing.name}</h3>
              <p>${listing.location}</p>
            </div>
            <strong>$${listing.price}</strong>
          </div>
          <div class="listing-meta">
            <span>${listing.roomType}</span>
            <span>${listing.rating} rating</span>
          </div>
          <div class="listing-tags">
            ${listing.amenities.slice(0, 3).map(am => `<span>${am}</span>`).join('')}
          </div>
          <button class="listing-button view-details-btn" data-id="${listing.id}" style="width: 100%; border: 0; cursor: pointer;">View details</button>
        </div>
      `;
      listingGrid.appendChild(card);
    });

    // Attach card details listeners
    document.querySelectorAll('.view-details-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id, 10);
        selectListing(id, true);
      });
    });

    // Attach save toggle listeners
    document.querySelectorAll('.save-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id, 10);
        window.Auth.toggleSaveListing(id);
        const newSaved = window.Auth.getSavedListings();
        const isNowSaved = newSaved.includes(id);
        const svg = btn.querySelector('svg');
        svg.style.fill = isNowSaved ? '#e83e5a' : 'none';
        svg.style.stroke = isNowSaved ? '#e83e5a' : '#444';
        btn.title = isNowSaved ? 'Remove from saved' : 'Save listing';
        showToast(isNowSaved ? 'Saved to your list!' : 'Removed from saved');
      });
    });
  }

  // --- TOAST NOTIFICATION ---
  function showToast(message) {
    let toast = document.getElementById('apartlyToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'apartlyToast';
      toast.style.cssText = `
        position: fixed;
        bottom: 28px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: #1a1d23;
        color: #fff;
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        font-family: Inter, sans-serif;
        box-shadow: 0 4px 20px rgba(0,0,0,0.22);
        opacity: 0;
        transition: opacity 0.2s, transform 0.2s;
        pointer-events: none;
        z-index: 9999;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(10px)';
    }, 2200);
  }

  // --- 2. DYNAMIC DETAILS PANEL RENDERING ---
  function selectListing(id, smoothScroll = false) {
    const listings = window.Auth.getListings();
    const listing = listings.find(l => l.id === id) || listings[0];
    if (!listing) return;

    selectedListingId = listing.id;

    // Update URL parameter without reloading
    const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?listing=' + listing.id;
    window.history.pushState({ path: newurl }, '', newurl);

    // Update text content
    const titleEl = document.querySelector('.headline h1');
    const locationEl = document.querySelector('.headline p');
    const ratingScoreEl = document.querySelector('.rating span:first-child');
    const ratingReviewsEl = document.querySelector('.rating span:last-child');
    const aboutDescEl = document.querySelector('.about p');
    const hostImgEl = document.querySelector('.host-row img');
    const hostNameEl = document.querySelector('.host-row strong');
    const hostReviewsEl = document.querySelector('.host-row span');
    const galleryMainEl = document.querySelector('.gallery-main');
    const gallerySideImages = document.querySelectorAll('.gallery img:not(.gallery-main)');
    const priceNightEl = document.querySelector('.booking-panel .price strong');
    const amenitiesEl = document.querySelector('.amenities');

    if (titleEl) titleEl.textContent = `${listing.name} - City Center Apartment`;
    if (locationEl) locationEl.textContent = `${listing.location}, Davao Region, Philippines`;
    if (ratingScoreEl) ratingScoreEl.textContent = listing.rating;
    if (ratingReviewsEl) ratingReviewsEl.textContent = `${listing.reviewsCount} Reviews`;
    if (aboutDescEl) aboutDescEl.textContent = listing.description;
    if (priceNightEl) priceNightEl.textContent = `$${listing.price}`;

    // Get Host user
    const users = window.Auth.getUsers();
    const hostUser = users.find(u => u.id === listing.hostId) || users[0];
    if (hostUser) {
      if (hostImgEl) hostImgEl.src = hostUser.avatarUrl;
      if (hostNameEl) hostNameEl.textContent = hostUser.name;
      if (hostReviewsEl) hostReviewsEl.textContent = `${hostUser.rating} \u00B7 ${hostUser.reviewsCount} reviews`;
    }

    // Update Gallery
    if (galleryMainEl) galleryMainEl.src = listing.imageUrl;
    // Set some secondary images
    const secImages = [
      'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=700&q=90',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=700&q=90',
      'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=700&q=90',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=700&q=90'
    ];
    gallerySideImages.forEach((img, index) => {
      img.src = secImages[index % secImages.length];
    });

    // Update amenities icons (WiFi, AC, Kitchen, Pool, TV, Parking)
    if (amenitiesEl) {
      const amenitiesSvgMap = {
        'WiFi': '<svg viewBox="0 0 24 24"><path d="M5 13a10 10 0 0 1 14 0M8.5 16.5a5 5 0 0 1 7 0M12 20h.01M2 9a15 15 0 0 1 20 0"/></svg>',
        'AC': '<svg viewBox="0 0 24 24"><path d="M4 7h16v10H4zM8 21h8M9 11h.01M13 11h.01M17 11h.01"/></svg>',
        'Kitchen': '<svg viewBox="0 0 24 24"><path d="M4 13h16M7 13v6m10-6v6M8 5h8l2 8H6l2-8Z"/></svg>',
        'Pool': '<svg viewBox="0 0 24 24"><path d="M5 12h14v7H5zM8 12V8a4 4 0 0 1 8 0v4"/></svg>',
        'TV': '<svg viewBox="0 0 24 24"><path d="M4 5h16v12H4zM9 21h6"/></svg>',
        'Parking': '<svg viewBox="0 0 24 24"><path d="M8 21V4h6a4 4 0 0 1 0 8H8"/></svg>'
      };

      amenitiesEl.innerHTML = listing.amenities.map(am => {
        const svg = amenitiesSvgMap[am] || '<svg viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>';
        return `<span>${svg}${am}</span>`;
      }).join('');
    }

    // Recalculate price breakdown
    calculatePriceBreakdown(listing.price);

    if (smoothScroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // --- 3. DYNAMIC PRICE CALCULATION ---
  function calculatePriceBreakdown(pricePerNight) {
    const checkinDate = document.getElementById('checkinDate');
    const checkoutDate = document.getElementById('checkoutDate');
    const guestCount = document.getElementById('guestCount');
    const priceLines = document.querySelector('.price-lines');

    if (!checkinDate || !checkoutDate || !priceLines) return;

    const d1 = new Date(checkinDate.value);
    const d2 = new Date(checkoutDate.value);
    
    let nights = 3;
    if (!isNaN(d1) && !isNaN(d2) && d2 > d1) {
      const diffTime = Math.abs(d2 - d1);
      nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const baseCost = pricePerNight * nights;
    const cleaningFee = 35;
    const serviceFee = 20;
    const totalCost = baseCost + cleaningFee + serviceFee;

    priceLines.innerHTML = `
      <div><dt>$${pricePerNight} x ${nights} nights</dt><dd>$${baseCost}</dd></div>
      <div><dt>Cleaning fee</dt><dd>$${cleaningFee}</dd></div>
      <div><dt>Service fee</dt><dd>$${serviceFee}</dd></div>
      <div class="total"><dt>Total (USD)</dt><dd>$${totalCost}</dd></div>
    `;

    // Save pending booking details in localStorage
    const pendingBooking = {
      listingId: selectedListingId,
      checkIn: formatDateString(checkinDate.value),
      checkOut: formatDateString(checkoutDate.value),
      checkInRaw: checkinDate.value,
      checkOutRaw: checkoutDate.value,
      guests: parseInt(guestCount ? guestCount.value : 2, 10),
      pricePerNight: pricePerNight,
      nights: nights,
      totalPrice: totalCost
    };
    localStorage.setItem('pendingBooking', JSON.stringify(pendingBooking));
  }

  // Helper formatting: 2026-10-15 -> 15 Oct
  function formatDateString(rawDateStr) {
    if (!rawDateStr) return '';
    const date = new Date(rawDateStr);
    if (isNaN(date)) return '';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  }

  // --- 4. INTERCEPT CHECKOUT RESERVE CLICK ---
  const reserveButton = document.querySelector('.reserve-button');
  if (reserveButton) {
    reserveButton.addEventListener('click', (e) => {
      // Re-trigger calculation to ensure latest values are saved
      const listings = window.Auth.getListings();
      const listing = listings.find(l => l.id === selectedListingId) || listings[0];
      calculatePriceBreakdown(listing.price);
    });
  }

  // --- 5. SEARCH & FILTER INTERACTION LOGIC ---
  if (listingFilters) {
    const controls = listingFilters.elements;
    const priceRange = controls.price;
    const priceValue = document.querySelector('[data-price-value]');

    const updatePriceLabel = () => {
      if (priceValue && priceRange) {
        priceValue.textContent = `$${priceRange.value} max`;
      }
    };

    const matchesFilter = (card) => {
      const location = controls.location.value;
      const roomType = controls.roomType.value;
      const amenity = controls.amenity.value;
      const rating = Number(controls.rating.value || 0);
      const maxPrice = Number(controls.price.value || Infinity);

      const cardLocation = card.dataset.location;
      const cardRoomType = card.dataset.roomType;
      const cardAmenities = (card.dataset.amenities || '').toLowerCase();
      const cardRating = Number(card.dataset.rating || 0);
      const cardPrice = Number(card.dataset.price || 0);

      const locationOk = location === 'all' || cardLocation === location;
      const roomTypeOk = roomType === 'all' || cardRoomType === roomType;
      const amenityOk = amenity === 'all' || cardAmenities.includes(amenity.toLowerCase());
      const ratingOk = cardRating >= rating;
      const priceOk = cardPrice <= maxPrice;

      return locationOk && roomTypeOk && amenityOk && ratingOk && priceOk;
    };

    const applyFilters = () => {
      let visibleCount = 0;
      const cards = Array.from(document.querySelectorAll('[data-listing-card]'));

      cards.forEach((card) => {
        const visible = matchesFilter(card);
        card.classList.toggle('is-hidden', !visible);
        if (visible) {
          visibleCount += 1;
        }
      });

      if (resultCount) {
        resultCount.textContent = String(visibleCount);
      }
    };

    listingFilters.addEventListener('change', applyFilters);
    listingFilters.addEventListener('input', () => {
      updatePriceLabel();
      applyFilters();
    });

    updatePriceLabel();
  }

  // Initialize page components
  // Prefer async listings if available via Auth.getListingsAsync
  if (typeof window.Auth.getListingsAsync === 'function') {
    try {
      const asyncListings = await window.Auth.getListingsAsync();
      // If async returned array, replace local state for rendering
      if (Array.isArray(asyncListings)) {
        // update local cache used by other methods
        if (window.Auth && window.Auth.getListings) {
          // attempt to write to localStorage so other pages see same data
          localStorage.setItem('listings', JSON.stringify(asyncListings));
        }
      }
    } catch (err) {
      console.warn('Failed to load remote listings, using local data', err);
    }
  }

  renderListingGrid();

  // --- 6. WIRE SEARCH PILL TO FILTERS ---
  const searchPill = document.querySelector('.search-pill');
  if (searchPill && listingFilters) {
    const searchLocationInput = searchPill.querySelector('input[aria-label="Location"]');
    const searchDatesInput = searchPill.querySelector('input[aria-label="Dates"]');
    const searchGuestsInput = searchPill.querySelector('input[aria-label="Guests"]');

    // Map typed location text to filter option values
    const locationMap = {
      'tagum': 'Tagum City',
      'tagum city': 'Tagum City',
      'davao': 'Davao City',
      'davao city': 'Davao City',
      'general santos': 'General Santos',
      'gensan': 'General Santos',
      'cebu': 'Cebu City',
      'cebu city': 'Cebu City'
    };

    function syncSearchToFilters() {
      if (searchLocationInput) {
        const typed = searchLocationInput.value.trim().toLowerCase();
        const locationSelect = listingFilters.elements.location;
        if (locationSelect) {
          const mapped = locationMap[typed];
          if (mapped) {
            locationSelect.value = mapped;
          } else if (typed === '' || typed === 'all') {
            locationSelect.value = 'all';
          }
        }
      }
      // Trigger filter application
      const changeEvent = new Event('change');
      listingFilters.dispatchEvent(changeEvent);
    }

    if (searchLocationInput) {
      searchLocationInput.addEventListener('input', syncSearchToFilters);
      searchLocationInput.addEventListener('change', syncSearchToFilters);
      // Sync on initial load
      syncSearchToFilters();
    }

    // Guests pill: update guest count selector in booking panel
    if (searchGuestsInput) {
      searchGuestsInput.addEventListener('change', () => {
        const guestText = searchGuestsInput.value.trim();
        const match = guestText.match(/\d+/);
        if (match) {
          const guestSelect = document.getElementById('guestCount');
          if (guestSelect) {
            guestSelect.value = match[0];
            guestSelect.dispatchEvent(new Event('change'));
          }
        }
      });
    }
  }

  // Read listing param from URL on load
  const urlParams = new URLSearchParams(window.location.search);
  const listingParam = parseInt(urlParams.get('listing'), 10);
  if (!isNaN(listingParam)) {
    selectListing(listingParam);
  } else {
    selectListing(selectedListingId);
  }

  // Bind change listeners to input elements in booking panel
  const checkinInput = document.getElementById('checkinDate');
  const checkoutInput = document.getElementById('checkoutDate');
  const guestInput = document.getElementById('guestCount');

  if (checkinInput && checkoutInput && guestInput) {
    const triggerRecalc = () => {
      const listings = window.Auth.getListings();
      const listing = listings.find(l => l.id === selectedListingId) || listings[0];
      calculatePriceBreakdown(listing.price);
    };

    checkinInput.addEventListener('change', triggerRecalc);
    checkoutInput.addEventListener('change', triggerRecalc);
    guestInput.addEventListener('change', triggerRecalc);
  }
});
