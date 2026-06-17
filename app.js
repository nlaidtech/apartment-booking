const listingFilters = document.querySelector('#listingFilters');

if (listingFilters) {
  const cards = Array.from(document.querySelectorAll('[data-listing-card]'));
  const resultCount = document.querySelector('[data-listing-count]');
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
  applyFilters();
}