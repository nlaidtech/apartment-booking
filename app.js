// app.js - Apartly PH Boarding House & Transient Booking Frontend Controller

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.Auth) return;
  await window.Auth.ready;

  const listingsGrid = document.getElementById('listingsGrid');
  const listingFilters = document.getElementById('listingFilters');
  const resultCount = document.querySelector('[data-listing-count]');
  const savedCountEl = document.querySelector('[data-saved-count]');
  const toastContainer = document.getElementById('toastContainer');

  // Modal elements
  const modalBackdrop = document.getElementById('propertyModalBackdrop');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalImg = document.getElementById('modalImg');
  const modalTitle = document.getElementById('modalTitle');
  const modalLocation = document.getElementById('modalLocation');
  const modalRoomType = document.getElementById('modalRoomType');
  const modalRating = document.getElementById('modalRating');
  const modalPrice = document.getElementById('modalPrice');
  const modalHostAvatar = document.getElementById('modalHostAvatar');
  const modalHostName = document.getElementById('modalHostName');
  const modalHostBio = document.getElementById('modalHostBio');
  const modalDesc = document.getElementById('modalDesc');
  const modalAmenitiesList = document.getElementById('modalAmenitiesList');
  const modalCheckin = document.getElementById('modalCheckin');
  const modalCheckout = document.getElementById('modalCheckout');
  const modalNightsBreakdown = document.getElementById('modalNightsBreakdown');
  const modalTotalPrice = document.getElementById('modalTotalPrice');
  const modalReserveBtn = document.getElementById('modalReserveBtn');

  let activeModalListing = null;

  // --- 1. TOAST NOTIFICATION ---
  function showToast(message, type = 'info') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span style="color: ${type === 'success' ? '#E8A33D' : '#FFFFFF'};">✓</span>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 2500);
  }

  // --- 2. SAVED COUNT BADGE ---
  function updateSavedBadge() {
    if (!savedCountEl) return;
    const saved = window.Auth.getSavedListings();
    savedCountEl.textContent = saved.length;
  }
  updateSavedBadge();

  // --- 3. RENDER LISTINGS GRID ---
  function renderListingGrid() {
    if (!listingsGrid) return;
    const listings = window.Auth.getListings();
    const savedIds = window.Auth.getSavedListings();

    listingsGrid.innerHTML = '';

    if (listings.length === 0) {
      listingsGrid.innerHTML = `
        <div class="empty-state">
          <h3>No boarding houses found</h3>
          <p>Try resetting the city or room filters to see available stays.</p>
        </div>
      `;
      if (resultCount) resultCount.textContent = '0';
      return;
    }

    listings.forEach(listing => {
      const isSaved = savedIds.includes(listing.id);
      const card = document.createElement('article');
      card.className = 'listing-card';
      card.setAttribute('data-id', listing.id);
      card.setAttribute('data-location', listing.location);
      card.setAttribute('data-room-type', listing.roomType);
      card.setAttribute('data-amenities', (listing.amenities || []).join(','));
      card.setAttribute('data-price', listing.price);
      card.setAttribute('data-campus', (listing.campusNearby || '') + ' ' + listing.location);

      let badgeLabel = 'Verified Stay';
      if (listing.name.includes('Student')) badgeLabel = 'Near Campus';
      else if (listing.name.includes('Ladies')) badgeLabel = 'Ladies Only';
      else if (listing.name.includes('Own CR')) badgeLabel = 'Private CR';

      card.innerHTML = `
        <div class="listing-media">
          <img src="${listing.imageUrl}" alt="${listing.name}" class="listing-img" loading="lazy">
          <span class="listing-pill-badge">
            <span style="color: var(--gold);">✓</span>
            ${badgeLabel}
          </span>
          <button type="button" class="listing-save-btn ${isSaved ? 'is-saved' : ''}" data-id="${listing.id}" aria-label="Save to shortlist">
            <svg viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>

        <div class="listing-body">
          <div class="listing-header-row">
            <h3 class="listing-title">${listing.name}</h3>
            <span class="listing-rating">
              <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              ${listing.rating}
            </span>
          </div>

          <div class="listing-location-sub">
            <span>📍 ${listing.location} &bull; ${listing.roomType}</span>
          </div>

          <div style="font-size: 12px; font-weight: 600; color: var(--teal-deep); margin: 3px 0 2px;">
            🎓 ${listing.campusNearby || 'Near university belt'}
          </div>

          <div style="font-size: 11.5px; color: var(--muted); margin-bottom: 6px;">
            <span>⏰ ${listing.curfew || '10 PM Curfew'}</span>
          </div>

          <div class="listing-tags-row">
            ${(listing.amenities || []).slice(0, 3).map(am => `<span class="listing-tag">${am}</span>`).join('')}
          </div>

          <div class="listing-footer-row">
            <div class="listing-price-block">
              <span class="listing-price-main">₱${listing.price}</span>
              <span class="listing-price-sub">/ night</span>
            </div>
            <div class="listing-actions-wrap">
              <button type="button" class="listing-btn-view view-modal-btn" data-id="${listing.id}">Quick View</button>
              <button type="button" class="listing-btn-book direct-book-btn" data-id="${listing.id}">Book</button>
            </div>
          </div>
        </div>
      `;
      listingsGrid.appendChild(card);
    });

    attachCardListeners();
    applyFilters();
  }

  // --- 4. ATTACH CARD LISTENERS ---
  function attachCardListeners() {
    // Save Toggle
    document.querySelectorAll('.listing-save-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id, 10);
        window.Auth.toggleSaveListing(id);
        const isNowSaved = window.Auth.getSavedListings().includes(id);
        btn.classList.toggle('is-saved', isNowSaved);
        updateSavedBadge();
        showToast(isNowSaved ? 'Saved to your shortlist' : 'Removed from shortlist', isNowSaved ? 'success' : 'info');
      });
    });

    // Quick View Modal
    document.querySelectorAll('.view-modal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id, 10);
        openListingModal(id);
      });
    });

    // Direct Book
    document.querySelectorAll('.direct-book-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id, 10);
        const listings = window.Auth.getListings();
        const listing = listings.find(l => l.id === id);
        if (!listing) return;

        const pendingBooking = {
          listingId: listing.id,
          checkIn: '15 Oct',
          checkOut: '18 Oct',
          checkInRaw: '2026-10-15',
          checkOutRaw: '2026-10-18',
          guests: 1,
          pricePerNight: listing.price,
          nights: 3,
          totalPrice: (listing.price * 3) + 100
        };
        localStorage.setItem('pendingBooking', JSON.stringify(pendingBooking));
        window.location.href = 'checkout.html';
      });
    });
  }

  // --- 5. MODAL QUICK VIEW ---
  function openListingModal(listingId) {
    const listings = window.Auth.getListings();
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return;

    activeModalListing = listing;

    const users = window.Auth.getUsers();
    const host = users.find(u => u.id === listing.hostId) || users[0];

    modalImg.src = listing.imageUrl;
    modalTitle.textContent = listing.name;
    modalLocation.textContent = `${listing.location}, Philippines`;
    modalRoomType.textContent = listing.roomType;
    modalRating.textContent = `⭐ ${listing.rating} (${listing.reviewsCount} reviews)`;
    modalPrice.textContent = `₱${listing.price}`;
    modalDesc.textContent = listing.description;

    if (host) {
      modalHostAvatar.src = host.avatarUrl || 'assets/avatars/ate_maria.jpg';
      modalHostName.textContent = host.name;
      modalHostBio.textContent = host.bio || 'Verified Boarding House Caretaker';
    }

    const modalCampusText = document.getElementById('modalCampusText');
    if (modalCampusText) modalCampusText.textContent = listing.campusNearby || 'Near university belt';

    const modalCurfewText = document.getElementById('modalCurfewText');
    if (modalCurfewText) modalCurfewText.textContent = listing.curfew || '10:00 PM Gate Curfew';

    const modalUtilitiesText = document.getElementById('modalUtilitiesText');
    if (modalUtilitiesText) modalUtilitiesText.textContent = listing.utilities || 'Submetered electric · Free drinking water';

    modalAmenitiesList.innerHTML = (listing.amenities || []).map(am => `
      <div class="modal-amenity-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 13l4 4L19 7"/></svg>
        <span>${am}</span>
      </div>
    `).join('');

    calculateModalPrice();
    if (typeof renderModalChat === 'function') renderModalChat(listing);
    if (typeof renderModalReviews === 'function') renderModalReviews(listing.id);

    modalBackdrop.classList.add('is-active');
    modalBackdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeListingModal() {
    modalBackdrop.classList.remove('is-active');
    modalBackdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeListingModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeListingModal();
    });
  }

  function calculateModalPrice() {
    if (!activeModalListing || !modalCheckin || !modalCheckout) return;

    const d1 = new Date(modalCheckin.value);
    const d2 = new Date(modalCheckout.value);

    let nights = 3;
    if (!isNaN(d1) && !isNaN(d2) && d2 > d1) {
      nights = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
    }

    const baseCost = activeModalListing.price * nights;
    const utilityFee = 100;
    const total = baseCost + utilityFee;

    modalNightsBreakdown.textContent = `₱${activeModalListing.price} x ${nights} night${nights > 1 ? 's' : ''}`;
    modalTotalPrice.textContent = `Total: ₱${total.toLocaleString()}`;
  }

  if (modalCheckin) modalCheckin.addEventListener('change', calculateModalPrice);
  if (modalCheckout) modalCheckout.addEventListener('change', calculateModalPrice);

  if (modalReserveBtn) {
    modalReserveBtn.addEventListener('click', () => {
      if (!activeModalListing) return;

      const d1 = new Date(modalCheckin.value);
      const d2 = new Date(modalCheckout.value);
      let nights = 3;
      if (!isNaN(d1) && !isNaN(d2) && d2 > d1) {
        nights = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
      }

      const total = (activeModalListing.price * nights) + 100;
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const formatStr = (d) => `${d.getDate()} ${months[d.getMonth()]}`;

      const pendingBooking = {
        listingId: activeModalListing.id,
        checkIn: formatStr(d1),
        checkOut: formatStr(d2),
        checkInRaw: modalCheckin.value,
        checkOutRaw: modalCheckout.value,
        guests: 1,
        pricePerNight: activeModalListing.price,
        nights: nights,
        totalPrice: total
      };

      localStorage.setItem('pendingBooking', JSON.stringify(pendingBooking));
      window.location.href = 'checkout.html';
    });
  }

  // --- 6. CATEGORY & CAMPUS BAR PILLS ---
  let activeCampus = 'all';
  const campusButtons = document.querySelectorAll('.campus-bar .campus-pill');
  campusButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      campusButtons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      activeCampus = btn.dataset.campus || 'all';

      // Automatically sync city filter if a campus in another city was picked
      if (listingFilters) {
        if (activeCampus === 'UM Tagum') listingFilters.elements.location.value = 'Tagum City';
        else if (activeCampus === 'Davao Doctors' || activeCampus === 'Ateneo') listingFilters.elements.location.value = 'Davao City';
        else if (activeCampus === 'USC') listingFilters.elements.location.value = 'Cebu City';
        else if (activeCampus === 'all') listingFilters.elements.location.value = 'all';
      }

      // Sync with Leaflet map view if open
      if (typeof leafletMap !== 'undefined' && leafletMap && typeof CAMPUS_LOCATIONS !== 'undefined') {
        if (activeCampus !== 'all' && CAMPUS_LOCATIONS[activeCampus]) {
          const loc = CAMPUS_LOCATIONS[activeCampus];
          leafletMap.setView([loc.lat, loc.lng], 15);
        } else {
          leafletMap.setView([7.4474, 125.8078], 13);
        }
      }

      applyFilters();
    });
  });

  const categoryButtons = document.querySelectorAll('.filterbar .pill');
  categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.dataset.category;
      const amenity = btn.dataset.amenity;

      if (category) {
        listingFilters.elements.roomType.value = category === 'all' ? 'all' : category;
      }

      if (amenity) {
        listingFilters.elements.amenity.value = amenity;
      }

      applyFilters();
    });
  });

  // Priority amenity filter chips (if present)
  const priorityChips = document.querySelectorAll('.priority-filter-chip');
  priorityChips.forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('is-active');
      applyFilters();
    });
  });

  // --- 7. FILTER LOGIC ---
  function applyFilters() {
    if (!listingFilters) return;
    const controls = listingFilters.elements;
    const location = controls.location.value;
    const roomType = controls.roomType.value;
    const amenity = controls.amenity.value;
    const maxPrice = Number(controls.price.value || 1000);

    const activePriorityFilters = Array.from(document.querySelectorAll('.priority-filter-chip.is-active'))
      .map(c => c.dataset.amenityFilter.toLowerCase());

    const cards = Array.from(document.querySelectorAll('.listing-card'));
    let visibleCount = 0;

    cards.forEach(card => {
      const cardLocation = card.dataset.location;
      const cardRoomType = card.dataset.roomType;
      const cardAmenities = (card.dataset.amenities || '').toLowerCase();
      const cardPrice = Number(card.dataset.price || 0);
      const cardCampus = (card.dataset.campus || '').toLowerCase();

      const locationOk = location === 'all' || cardLocation === location;
      const roomTypeOk = roomType === 'all' || cardRoomType.toLowerCase().includes(roomType.toLowerCase());
      const amenityOk = amenity === 'all' || cardAmenities.includes(amenity.toLowerCase());
      const priceOk = cardPrice <= maxPrice;
      const campusOk = activeCampus === 'all' || cardCampus.includes(activeCampus.toLowerCase());
      const priorityOk = activePriorityFilters.length === 0 || activePriorityFilters.every(f => cardAmenities.includes(f));

      const isMatch = locationOk && roomTypeOk && amenityOk && priceOk && campusOk && priorityOk;
      card.style.display = isMatch ? 'flex' : 'none';
      if (isMatch) visibleCount++;
    });

    if (resultCount) {
      resultCount.textContent = String(visibleCount);
    }
  }

  if (listingFilters) {
    listingFilters.addEventListener('change', applyFilters);
    listingFilters.addEventListener('input', (e) => {
      if (e.target.name === 'price') {
        const priceVal = document.querySelector('[data-price-value]');
        if (priceVal) priceVal.textContent = `Up to ₱${Number(e.target.value).toLocaleString()}`;
      }
      applyFilters();
    });
  }

  // --- 8. TOP SEARCH SYNC ---
  const topSearchLocation = document.getElementById('topSearchLocation');
  const topSearchForm = document.getElementById('topSearchForm');

  function syncTopSearch() {
    if (!topSearchLocation || !listingFilters) return;
    const text = topSearchLocation.value.trim().toLowerCase();
    const locSelect = listingFilters.elements.location;

    if (text.includes('tagum')) locSelect.value = 'Tagum City';
    else if (text.includes('davao')) locSelect.value = 'Davao City';
    else if (text.includes('cebu')) locSelect.value = 'Cebu City';
    else if (text === '' || text.includes('all')) locSelect.value = 'all';

    applyFilters();
  }

  if (topSearchLocation) {
    topSearchLocation.addEventListener('input', syncTopSearch);
  }
  if (topSearchForm) {
    topSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      syncTopSearch();
    });
  }

  // --- 9. POST PROPERTY MODAL & IMAGE UPLOADER ---
  const postPropertyModal = document.getElementById('postPropertyModal');
  const postModalCloseBtn = document.getElementById('postModalCloseBtn');
  const propertyPhotoInput = document.getElementById('propertyPhotoInput');
  const postPhotoPreview = document.getElementById('postPhotoPreview');
  const selectedPhotoUrl = document.getElementById('selectedPhotoUrl');
  const presetThumbs = document.querySelectorAll('.preset-photo-thumb');
  const postPropertyForm = document.getElementById('postPropertyForm');

  function closePostModal() {
    if (!postPropertyModal) return;
    postPropertyModal.classList.remove('is-active');
    postPropertyModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (postModalCloseBtn) postModalCloseBtn.addEventListener('click', closePostModal);
  if (postPropertyModal) {
    postPropertyModal.addEventListener('click', (e) => {
      if (e.target === postPropertyModal) closePostModal();
    });
  }

  // Real File Upload using FileReader
  if (propertyPhotoInput) {
    propertyPhotoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (PNG, JPG, WEBP).');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target.result;
        if (postPhotoPreview) postPhotoPreview.src = base64Data;
        if (selectedPhotoUrl) selectedPhotoUrl.value = base64Data;
        presetThumbs.forEach(t => t.classList.remove('is-selected'));
        showToast('Photo uploaded successfully!', 'success');
      };
      reader.readAsDataURL(file);
    });
  }

  // Preset Photo Selector
  presetThumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      presetThumbs.forEach(t => t.classList.remove('is-selected'));
      thumb.classList.add('is-selected');
      const presetUrl = thumb.dataset.preset;
      if (postPhotoPreview) postPhotoPreview.src = presetUrl;
      if (selectedPhotoUrl) selectedPhotoUrl.value = presetUrl;
    });
  });

  // Handle Post Form Submit
  if (postPropertyForm) {
    postPropertyForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('postTitle').value.trim();
      const location = document.getElementById('postCity').value;
      const roomType = document.getElementById('postRoomType').value;
      const price = Number(document.getElementById('postPrice').value) || 450;
      const description = document.getElementById('postDesc').value.trim();
      const imageUrl = selectedPhotoUrl.value || 'assets/properties/ph_bunk_dorm.jpg';

      const checkedAmenities = Array.from(document.querySelectorAll('input[name="postAmenities"]:checked')).map(cb => cb.value);

      const currentUser = window.Auth.getCurrentUser();
      const newListing = {
        name,
        location,
        roomType,
        price,
        imageUrl,
        description,
        amenities: checkedAmenities.length ? checkedAmenities : ['WiFi', 'Aircon', 'Own CR'],
        hostId: currentUser ? currentUser.id : 'host-1'
      };

      window.Auth.addListing(newListing);
      closePostModal();
      postPropertyForm.reset();
      showToast('Boarding room posted successfully! It is now live in the catalog.', 'success');
      renderListingGrid();
    });
  }

  // --- 10. STUDENT INQUIRY & TWO-WAY CHAT FLOW IN PROPERTY MODAL ---
  const toggleInquiryBtn = document.getElementById('toggleInquiryBtn');
  const inquiryFormBox = document.getElementById('inquiryFormBox');
  const modalChatFeed = document.getElementById('modalChatFeed');
  const modalChatTextInput = document.getElementById('modalChatTextInput');
  const modalChatFileInput = document.getElementById('modalChatFileInput');
  const modalChatSendBtn = document.getElementById('modalChatSendBtn');
  const modalChatPhotoPreview = document.getElementById('modalChatPhotoPreview');
  const modalChatPhotoImg = document.getElementById('modalChatPhotoImg');
  const modalChatPhotoRemove = document.getElementById('modalChatPhotoRemove');
  const modalChatPhotoName = document.getElementById('modalChatPhotoName');

  let modalAttachedImage = null;

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  function renderModalChat(listing) {
    if (!modalChatFeed) return;
    const targetListing = listing || activeModalListing;
    if (!targetListing) {
      modalChatFeed.innerHTML = '<div style="font-size:12.5px;color:var(--muted);text-align:center;padding:12px;">Select a room to view chat.</div>';
      return;
    }

    const currentUser = window.Auth.getCurrentUser();
    const inquiries = window.Auth.getInquiries();
    const thread = inquiries.find(inq => 
      inq.listingId === targetListing.id &&
      (currentUser ? (inq.guestId === currentUser.id || inq.guestEmail === currentUser.email) : true)
    );

    if (!thread || !thread.messages || thread.messages.length === 0) {
      modalChatFeed.innerHTML = `
        <div style="font-size:12px; color:var(--muted); text-align:center; padding:12px 0;">
          No messages yet. Ask Ate Maria / Landlady questions or send proof of payment / room queries!
        </div>
      `;
      return;
    }

    modalChatFeed.innerHTML = thread.messages.map(m => {
      const isHost = m.senderRole === 'host';
      return `
        <div class="chat-msg-row ${isHost ? 'host' : 'guest'}" style="margin-bottom:8px;">
          <span class="chat-sender-tag">
            <strong>${escapeHtml(m.senderName || (isHost ? 'Landlady' : 'You'))}</strong> &bull; ${escapeHtml(m.timestamp || '')}
          </span>
          <div class="chat-msg-bubble">
            ${m.text ? `<div>${escapeHtml(m.text)}</div>` : ''}
            ${m.imageUrl ? `
              <img src="${m.imageUrl}" class="chat-attachment-img" alt="Chat attachment" onclick="window.open(this.src)" title="Click to view full image">
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    modalChatFeed.scrollTop = modalChatFeed.scrollHeight;
  }

  if (toggleInquiryBtn && inquiryFormBox) {
    toggleInquiryBtn.addEventListener('click', () => {
      const isHidden = inquiryFormBox.style.display === 'none';
      inquiryFormBox.style.display = isHidden ? 'block' : 'none';
      if (isHidden) {
        renderModalChat(activeModalListing);
        if (modalChatTextInput) modalChatTextInput.focus();
      }
    });
  }

  if (modalChatFileInput) {
    modalChatFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        alert('Please choose an image file (PNG, JPG, WEBP).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        modalAttachedImage = event.target.result;
        if (modalChatPhotoImg) modalChatPhotoImg.src = modalAttachedImage;
        if (modalChatPhotoName) modalChatPhotoName.textContent = file.name;
        if (modalChatPhotoPreview) modalChatPhotoPreview.style.display = 'flex';
      };
      reader.readAsDataURL(file);
    });
  }

  if (modalChatPhotoRemove) {
    modalChatPhotoRemove.addEventListener('click', () => {
      modalAttachedImage = null;
      if (modalChatFileInput) modalChatFileInput.value = '';
      if (modalChatPhotoPreview) modalChatPhotoPreview.style.display = 'none';
    });
  }

  function handleSendModalMessage() {
    if (!activeModalListing) return;
    const text = (modalChatTextInput ? modalChatTextInput.value : '').trim();
    const imageUrl = modalAttachedImage;

    if (!text && !imageUrl) {
      alert('Please enter a message or attach a picture.');
      return;
    }

    const currentUser = window.Auth.getCurrentUser();
    const inquiries = window.Auth.getInquiries();
    const existingThread = inquiries.find(inq => 
      inq.listingId === activeModalListing.id &&
      (currentUser ? (inq.guestId === currentUser.id || inq.guestEmail === currentUser.email) : true)
    );

    if (existingThread) {
      window.Auth.sendChatMessage(existingThread.id, {
        senderRole: 'guest',
        senderName: currentUser ? currentUser.name : 'Student Boarder',
        text,
        imageUrl
      });
    } else {
      window.Auth.addInquiry({
        listingId: activeModalListing.id,
        propertyName: activeModalListing.name,
        hostId: activeModalListing.hostId,
        message: text,
        imageUrl
      });
    }

    if (modalChatTextInput) modalChatTextInput.value = '';
    modalAttachedImage = null;
    if (modalChatFileInput) modalChatFileInput.value = '';
    if (modalChatPhotoPreview) modalChatPhotoPreview.style.display = 'none';

    renderModalChat(activeModalListing);
    showToast('Message sent to landlady!', 'success');
  }

  if (modalChatSendBtn) {
    modalChatSendBtn.addEventListener('click', handleSendModalMessage);
  }

  if (modalChatTextInput) {
    modalChatTextInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSendModalMessage();
      }
    });
  }

  document.addEventListener('apartly:chat-updated', (e) => {
    if (activeModalListing) {
      renderModalChat(activeModalListing);
    }
  });

  // --- 11. STUDENT REVIEWS & RATINGS SYSTEM ---
  function renderModalReviews(listingId) {
    const list = document.getElementById('modalReviewsList');
    const summary = document.getElementById('modalReviewSummary');
    const cleanScore = document.getElementById('modalCleanScore');
    const wifiScore = document.getElementById('modalWifiScore');
    const hostScore = document.getElementById('modalHostScore');
    if (!list) return;

    const reviews = window.Auth.getListingReviews(listingId);
    if (!reviews || reviews.length === 0) {
      list.innerHTML = `<div style="font-size:12px; color:var(--muted); text-align:center; padding:12px 0;">No student reviews written yet. Be the first to share your experience!</div>`;
      if (summary) summary.textContent = '⭐ New Listing • Verified Landlady';
      if (cleanScore) cleanScore.textContent = '5.0';
      if (wifiScore) wifiScore.textContent = '5.0';
      if (hostScore) hostScore.textContent = '5.0';
      return;
    }

    const avg = (reviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) / reviews.length).toFixed(1);
    const avgClean = (reviews.reduce((sum, r) => sum + Number(r.cleanliness || 5), 0) / reviews.length).toFixed(1);
    const avgWifi = (reviews.reduce((sum, r) => sum + Number(r.wifi || 5), 0) / reviews.length).toFixed(1);
    const avgHost = (reviews.reduce((sum, r) => sum + Number(r.landlady || 5), 0) / reviews.length).toFixed(1);

    if (summary) summary.textContent = `⭐ ${avg} • Based on ${reviews.length} student review${reviews.length > 1 ? 's' : ''}`;
    if (cleanScore) cleanScore.textContent = avgClean;
    if (wifiScore) wifiScore.textContent = avgWifi;
    if (hostScore) hostScore.textContent = avgHost;

    list.innerHTML = reviews.map(r => `
      <div style="background:var(--paper); border:1px solid var(--line); border-radius:var(--radius-sm); padding:10px 12px; font-size:12.5px;">
        <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:4px;">
          <div>
            <strong style="color:var(--teal-deep);">${escapeHtml(r.authorName)}</strong>
            <span style="font-size:11px; color:var(--muted); margin-left:6px;">${escapeHtml(r.authorRole || 'Verified Boarder')}</span>
          </div>
          <span style="color:var(--gold); font-weight:700; letter-spacing:1px;">${'⭐'.repeat(r.rating || 5)}</span>
        </div>
        <p style="margin:0 0 6px; color:var(--ink); line-height:1.45;">${escapeHtml(r.comment)}</p>
        <div style="font-size:10.5px; color:var(--muted-light);">${escapeHtml(r.date || 'Recently')}</div>
      </div>
    `).join('');
  }

  const writeReviewModal = document.getElementById('writeReviewModal');
  const openWriteReviewBtn = document.getElementById('openWriteReviewBtn');
  const closeReviewModalBtn = document.getElementById('closeReviewModalBtn');
  const cancelReviewBtn = document.getElementById('cancelReviewBtn');
  const writeReviewForm = document.getElementById('writeReviewForm');
  const starRatingPicker = document.getElementById('starRatingPicker');
  const selectedStarRating = document.getElementById('selectedStarRating');

  function openReviewModal() {
    if (!writeReviewModal) return;
    writeReviewModal.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }

  function closeReviewModal() {
    if (!writeReviewModal) return;
    writeReviewModal.classList.remove('is-active');
    document.body.style.overflow = '';
  }

  if (openWriteReviewBtn) openWriteReviewBtn.addEventListener('click', openReviewModal);
  if (closeReviewModalBtn) closeReviewModalBtn.addEventListener('click', closeReviewModal);
  if (cancelReviewBtn) cancelReviewBtn.addEventListener('click', closeReviewModal);
  if (writeReviewModal) {
    writeReviewModal.addEventListener('click', (e) => {
      if (e.target === writeReviewModal) closeReviewModal();
    });
  }

  if (starRatingPicker) {
    const stars = starRatingPicker.querySelectorAll('[data-star]');
    stars.forEach(star => {
      star.addEventListener('click', () => {
        const val = Number(star.dataset.star);
        if (selectedStarRating) selectedStarRating.value = val;
        stars.forEach((s, idx) => {
          s.style.opacity = idx < val ? '1' : '0.35';
        });
      });
    });
  }

  if (writeReviewForm) {
    writeReviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!activeModalListing) return;

      const rating = Number(selectedStarRating ? selectedStarRating.value : 5);
      const cleanliness = Number(document.getElementById('reviewCleanliness').value);
      const wifi = Number(document.getElementById('reviewWifi').value);
      const landlady = Number(document.getElementById('reviewLandlady').value);
      const comment = document.getElementById('reviewComment').value.trim();

      if (!comment) {
        alert('Please share your thoughts or advice for fellow students.');
        return;
      }

      window.Auth.addReview({
        listingId: activeModalListing.id,
        rating,
        cleanliness,
        wifi,
        landlady,
        comment
      });

      closeReviewModal();
      writeReviewForm.reset();
      if (selectedStarRating) selectedStarRating.value = '5';
      renderModalReviews(activeModalListing.id);
      renderListingGrid();
      showToast('Thank you! Your student review has been posted.', 'success');
    });
  }

  // --- 12. LEAFLET CAMPUS PROXIMITY MAP ---
  let leafletMap = null;
  let mapMarkers = [];
  const viewModeGrid = document.getElementById('viewModeGrid');
  const viewModeMap = document.getElementById('viewModeMap');
  const campusMapContainer = document.getElementById('campusMapContainer');

  const CAMPUS_LOCATIONS = {
    'UM Tagum': { lat: 7.4510, lng: 125.8035, name: 'University of Mindanao Tagum (Main Gate)' },
    'Davao Doctors': { lat: 7.0768, lng: 125.6080, name: 'Davao Doctors College & SPMC' },
    'Ateneo': { lat: 7.0706, lng: 125.6133, name: 'Ateneo de Davao University (Jacinto)' },
    'USC': { lat: 10.3533, lng: 123.9126, name: 'University of San Carlos (Talamban Campus)' }
  };

  const LISTING_COORDINATES = {
    1: { lat: 7.4525, lng: 125.8050 }, // Mankilam (Tagum)
    2: { lat: 7.0725, lng: 125.6150 }, // Roxas Night Market (Davao)
    3: { lat: 7.4485, lng: 125.8090 }, // Pioneer Ave (Tagum)
    4: { lat: 7.0850, lng: 125.6110 }, // Bajada / SPMC (Davao)
    5: { lat: 7.0650, lng: 125.5990 }, // Matina (Davao)
    6: { lat: 10.3550, lng: 123.9140 }  // Cebu City (USC)
  };

  function initCampusMap() {
    if (typeof L === 'undefined' || !campusMapContainer) return;

    if (!leafletMap) {
      leafletMap = L.map('campusMap').setView([7.4474, 125.8078], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(leafletMap);
    }

    renderMapMarkers();
  }

  function renderMapMarkers() {
    if (!leafletMap || typeof L === 'undefined') return;

    mapMarkers.forEach(m => leafletMap.removeLayer(m));
    mapMarkers = [];

    // 1. Add University Landmark Pins
    Object.entries(CAMPUS_LOCATIONS).forEach(([campusKey, loc]) => {
      const universityIcon = L.divIcon({
        className: 'custom-map-pin university',
        html: `<div style="background:#123C3D; color:#FFF; padding:5px 9px; border-radius:20px; font-size:11px; font-weight:700; border:2px solid #E8A33D; white-space:nowrap; box-shadow:0 2px 6px rgba(0,0,0,0.3); display:inline-flex; align-items:center; gap:4px;">🎓 ${campusKey}</div>`,
        iconSize: [110, 30],
        iconAnchor: [55, 15]
      });

      const mark = L.marker([loc.lat, loc.lng], { icon: universityIcon })
        .addTo(leafletMap)
        .bindPopup(`<strong>${loc.name}</strong><br><span style="font-size:12px;color:#666;">Major University Landmark</span>`);
      mapMarkers.push(mark);
    });

    // 2. Add Boarding House Listing Pins
    const listings = window.Auth.getListings();
    listings.forEach(listing => {
      const coords = LISTING_COORDINATES[listing.id] || { lat: 7.4474, lng: 125.8078 };
      const priceIcon = L.divIcon({
        className: 'custom-map-pin listing',
        html: `<div style="background:#C1502E; color:#FFF; padding:4px 10px; border-radius:16px; font-size:12px; font-weight:700; border:2px solid #FFF; white-space:nowrap; box-shadow:0 2px 6px rgba(0,0,0,0.25); cursor:pointer;">₱${listing.price}</div>`,
        iconSize: [60, 26],
        iconAnchor: [30, 13]
      });

      const popupContent = `
        <div style="min-width:180px; text-align:left;">
          <img src="${listing.imageUrl}" style="width:100%; height:95px; object-fit:cover; border-radius:6px; margin-bottom:6px;">
          <strong style="font-size:13px; color:#123C3D; display:block;">${listing.name}</strong>
          <div style="font-size:11.5px; color:#666; margin:2px 0 6px;">📍 ${listing.location} • ₱${listing.price}/night</div>
          <button type="button" style="background:#123C3D; color:#FFF; border:none; border-radius:4px; padding:6px 12px; font-size:11.5px; cursor:pointer; width:100%;" onclick="window.openStayModalFromMap(${listing.id})">
            View Details &amp; Chat
          </button>
        </div>
      `;

      const mark = L.marker([coords.lat, coords.lng], { icon: priceIcon })
        .addTo(leafletMap)
        .bindPopup(popupContent);
      mapMarkers.push(mark);
    });
  }

  window.openStayModalFromMap = function(listingId) {
    openListingModal(listingId);
  };

  if (viewModeGrid && viewModeMap && campusMapContainer) {
    viewModeGrid.addEventListener('click', () => {
      viewModeGrid.classList.add('is-active');
      viewModeGrid.style.background = 'var(--teal)';
      viewModeGrid.style.color = 'var(--white)';
      viewModeMap.classList.remove('is-active');
      viewModeMap.style.background = 'transparent';
      viewModeMap.style.color = 'var(--muted)';

      campusMapContainer.style.display = 'none';
      if (listingsGrid) listingsGrid.style.display = 'grid';
    });

    viewModeMap.addEventListener('click', () => {
      viewModeMap.classList.add('is-active');
      viewModeMap.style.background = 'var(--teal)';
      viewModeMap.style.color = 'var(--white)';
      viewModeGrid.classList.remove('is-active');
      viewModeGrid.style.background = 'transparent';
      viewModeGrid.style.color = 'var(--muted)';

      campusMapContainer.style.display = 'block';
      initCampusMap();
      setTimeout(() => {
        if (leafletMap) leafletMap.invalidateSize();
      }, 100);
    });
  }

  // --- 13. DYNAMIC EVENT LISTENERS ---
  document.addEventListener('apartly:user-switched', (e) => {
    const user = e.detail;
    showToast(`Switched persona to: ${user.name}`, 'info');
    renderListingGrid();
  });

  document.addEventListener('apartly:listing-added', () => {
    renderListingGrid();
    if (leafletMap) renderMapMarkers();
  });

  // Initial load
  renderListingGrid();
});
