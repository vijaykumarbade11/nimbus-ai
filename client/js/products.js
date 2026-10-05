document.addEventListener('DOMContentLoaded', async () => {
  const root = document.getElementById('productsList');
  const cartCountEl = document.getElementById('cartCount');
  const cartStatusEl = document.getElementById('cartStatus');
  const modal = document.getElementById('productModal');
  const modalContent = document.getElementById('productModalContent');
  const mandiCrop = document.getElementById('mandiCrop');
  const mandiRows = document.getElementById('mandiRows');
  const mandiStatus = document.getElementById('mandiStatus');
  const mandiSource = document.getElementById('mandiSource');

  if (!root) return;

  const loadMandiRates = async () => {
    if (!mandiRows || !mandiCrop) return;
    mandiRows.innerHTML = '<tr><td colspan="7">Loading rates...</td></tr>';
    if (mandiStatus) mandiStatus.hidden = true;
    try {
      const response = await fetch(window.NimbusApi?.url?.(`/api/market-rates?crop=${encodeURIComponent(mandiCrop.value)}`) || `/api/market-rates?crop=${encodeURIComponent(mandiCrop.value)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Market rates unavailable.');
      if (mandiSource) {
        mandiSource.replaceChildren(document.createTextNode(`${data.sourceName} · Source report date: ${data.updatedAt || 'not supplied by source'} · Values are ₹ per quintal where listed. `));
        if (data.sourceUrl && new URL(data.sourceUrl).hostname === 'www.krushikranti.com') {
          const sourceLink = document.createElement('a');
          sourceLink.href = data.sourceUrl;
          sourceLink.target = '_blank';
          sourceLink.rel = 'noopener noreferrer';
          sourceLink.textContent = 'View source report';
          mandiSource.append(sourceLink);
        }
      }
      if (!data.rows?.length) {
        mandiRows.innerHTML = '<tr><td colspan="7">No rates were returned by the public source.</td></tr>';
        return;
      }
      mandiRows.replaceChildren(...data.rows.map((row) => {
        const tableRow = document.createElement('tr');
        [row.market, row.variety, row.unit, row.arrivals, row.minimum, row.maximum].forEach((value) => {
          const cell = document.createElement('td');
          cell.textContent = value == null ? '--' : String(value);
          tableRow.append(cell);
        });
        const modalCell = document.createElement('td');
        const modalValue = document.createElement('strong');
        modalValue.textContent = row.modal == null ? '--' : String(row.modal);
        modalCell.append(modalValue);
        tableRow.append(modalCell);
        return tableRow;
      }));
      if (data.ahmedpurListed === false && mandiStatus) {
        mandiStatus.hidden = false;
        mandiStatus.textContent = 'Ahmedpur was not listed in this source response. These are comparison-market rates only; confirm the local Ahmedpur APMC rate before selling.';
      }
      window.setTimeout(() => window.NimbusTranslate?.(), 0);
    } catch (error) {
      mandiRows.innerHTML = '<tr><td colspan="7">Public market rates are temporarily unavailable.</td></tr>';
      if (mandiStatus) {
        mandiStatus.hidden = false;
        mandiStatus.textContent = `${error.message} Do not treat the retail catalog price as today’s mandi rate.`;
      }
    }
  };

  mandiCrop?.addEventListener('change', loadMandiRates);
  loadMandiRates();

  const cartKey = 'nimbus-cart';
  let products = [];

  const hasStock = (product) => Number(product.stock) > 0;
  const hasKnownPrice = (product) => product.price !== null && product.price !== '' && Number.isFinite(Number(product.price));
  const priceText = (product) => hasKnownPrice(product) ? `₹${Number(product.price).toLocaleString('en-IN')}` : 'Verify live price';
  const marketPriceText = (product) => product.marketPrice !== null && product.marketPrice !== '' && Number.isFinite(Number(product.marketPrice))
    ? `Ahmedpur: ₹${Number(product.marketPrice).toLocaleString('en-IN')} / ${product.marketUnit || product.unit || 'unit'}`
    : 'Ahmedpur: confirm today’s rate';

  const getCart = () => {
    try {
      return JSON.parse(localStorage.getItem(cartKey) || '[]');
    } catch (error) {
      return [];
    }
  };

  const updateCartBadge = () => {
    if (cartCountEl) {
      cartCountEl.textContent = String(getCart().length);
    }
  };

  const announceCartChange = (message) => {
    if (cartStatusEl) cartStatusEl.textContent = message;
  };

  const removeFromCart = (productId) => {
    const cart = getCart().filter((item) => item._id !== productId);
    localStorage.setItem(cartKey, JSON.stringify(cart));
    updateCartBadge();
    renderProducts();
  };

  const addToCart = (product) => {
    if (!hasStock(product)) {
      announceCartChange(`${product.name} needs live seller availability confirmation.`);
      return false;
    }

    const cart = getCart();
    const existing = cart.some((item) => item._id === product._id);
    if (!existing) {
      cart.push({
        _id: product._id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        image: product.image
      });
      localStorage.setItem(cartKey, JSON.stringify(cart));
      updateCartBadge();
      renderProducts();
      announceCartChange(`${product.name} added to cart.`);
      return true;
    }

    removeFromCart(product._id);
    announceCartChange(`${product.name} removed from cart.`);
    return false;
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  };

  const openProductDetail = (product) => {
    if (!modal || !modalContent) return;

    const cart = getCart();
    const inCart = cart.some((item) => item._id === product._id);
    const mapSearch = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${product.name} shop Ahmedpur Latur Maharashtra`)}`;

    modalContent.innerHTML = `
      <div class="modal-body">
        <div class="modal-topline">
          <span class="category-badge">${product.category || 'Agriculture'}</span>
          <span class="stock-pill ${hasStock(product) ? 'in-stock' : 'out-stock'}">${product.availability || (hasStock(product) ? 'In stock' : 'Verify availability')}</span>
        </div>
        <h2 id="modalTitle">${product.name}</h2>
        <div class="detail-price-row">
          <div>
            <span class="detail-price">${priceText(product)}</span>
            <small>per ${product.unit || 'unit'}</small>
          </div>
          <div class="market-price-box">
            <span>Ahmedpur market</span>
            <strong>${marketPriceText(product)}</strong>
          </div>
        </div>
        <p class="detail-description">${product.description || 'No detailed description is available.'}</p>
        <div class="detail-grid">
          <div><span>Seller</span><strong>${product.seller || 'No seller listing verified'}</strong></div>
          <div><span>Location</span><strong>${product.location || 'Ahmedpur Market, Latur'}</strong></div>
          <div><span>Quality</span><strong>${product.quality || 'Fresh stock'}</strong></div>
          <div><span>Stock</span><strong>${hasStock(product) ? `${product.stock} available` : 'Verify with seller'}</strong></div>
          <div><span>Minimum order</span><strong>${product.minOrder || '1 unit'}</strong></div>
          <div><span>Source</span><strong>${product.source || 'Local agri market'}</strong></div>
          <div><span>Seller contact</span><strong>${product.sellerPhone ? `<a href="tel:${product.sellerPhone}">${product.sellerPhone}</a>` : 'Public phone not configured'}</strong></div>
        </div>
        <div class="detail-usage">
          <h3>How to use</h3>
          <p>${product.usage || 'Use according to recommended agricultural practices.'}</p>
        </div>
        <ul class="detail-specs">
          ${(product.specs || []).map((spec) => `<li>${spec}</li>`).join('')}
        </ul>
        <div class="modal-actions">
          <a class="btn btn-light" href="${mapSearch}" target="_blank" rel="noopener noreferrer">Find local sellers on Google Maps</a>
          <button type="button" class="btn btn-primary" data-toggle-cart="${product._id}" ${!inCart && !hasStock(product) ? 'disabled' : ''}>${inCart ? 'Remove from Cart' : hasStock(product) ? 'Add to Cart' : 'Verify Availability'}</button>
          <button type="button" class="btn btn-secondary" data-close="true">Close</button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');

    const toggleCartBtn = modal.querySelector('[data-toggle-cart]');
    toggleCartBtn?.addEventListener('click', () => {
      const selected = products.find((item) => item._id === product._id);
      if (selected) {
        const cart = getCart();
        const inCartNow = cart.some((item) => item._id === product._id);
        if (inCartNow) {
          removeFromCart(product._id);
          announceCartChange(`${product.name} removed from cart.`);
        } else {
          addToCart(selected);
        }
      }
      closeModal();
    });

    modal.querySelectorAll('[data-close]').forEach((button) => {
      button.addEventListener('click', closeModal);
    });
  };

  const renderProducts = () => {
    if (!root) return;

    if (!Array.isArray(products) || products.length === 0) {
      root.innerHTML = '<p class="warning-note">No products available right now.</p>';
      updateCartBadge();
      return;
    }

    const cart = getCart();

    root.innerHTML = products.map((product) => {
      const isInCart = cart.some((item) => item._id === product._id);
      const mapSearch = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${product.name} shop Ahmedpur Latur Maharashtra`)}`;
      return `
        <article class="dashboard-card product-card">
          <div class="product-info">
            <div class="product-topline">
              <span class="category-badge">${product.category || 'Agriculture'}</span>
              <span class="stock-pill ${hasStock(product) ? 'in-stock' : 'out-stock'}">${product.availability || (hasStock(product) ? 'In stock' : 'Verify availability')}</span>
            </div>
            <h3>${product.name}</h3>
            <div class="price-row">
              <span class="price-tag">${priceText(product)}</span>
              <span class="market-tag-line">${marketPriceText(product)}</span>
            </div>
            <p class="product-meta"><i class="fa-solid fa-location-dot"></i> ${product.location || 'Ahmedpur Market, Latur'}</p>
            <p class="product-meta"><i class="fa-solid fa-store"></i> ${product.seller || 'No seller listing verified'}</p>
            <p class="product-meta"><i class="fa-solid fa-phone"></i> ${product.sellerPhone ? `<a href="tel:${product.sellerPhone}">${product.sellerPhone}</a>` : 'Seller phone not publicly configured'}</p>
            <p class="product-description">${product.description || 'Product information is currently unavailable.'}</p>
            <div class="product-specs">
              <span><i class="fa-solid fa-box"></i> ${hasStock(product) ? `${product.stock} available` : 'Live stock verification required'}</span>
              <span><i class="fa-solid fa-indian-rupee-sign"></i> ${product.unit || 'unit'}</span>
            </div>
            <div class="cta-row product-actions">
              <a class="btn btn-light" href="${mapSearch}" target="_blank" rel="noopener noreferrer">Find local sellers</a>
              <button class="btn btn-primary add-cart-btn" type="button" data-id="${product._id}" ${!isInCart && !hasStock(product) ? 'disabled' : ''}>${isInCart ? 'Remove' : hasStock(product) ? 'Add to Cart' : 'Verify Availability'}</button>
              <button class="btn btn-secondary detail-btn" type="button" data-id="${product._id}">View Details</button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    root.querySelectorAll('.add-cart-btn').forEach((button) => {
      button.addEventListener('click', () => {
        const selected = products.find((item) => item._id === button.dataset.id);
        if (!selected) return;
        const isCurrentlyInCart = getCart().some((item) => item._id === selected._id);
        if (isCurrentlyInCart) {
          removeFromCart(selected._id);
          announceCartChange(`${selected.name} removed from cart.`);
        } else {
          addToCart(selected);
        }
      });
    });

    root.querySelectorAll('.detail-btn').forEach((button) => {
      button.addEventListener('click', () => {
        const selected = products.find((item) => item._id === button.dataset.id);
        if (selected) openProductDetail(selected);
      });
    });

    updateCartBadge();
    document.dispatchEvent(new CustomEvent('nimbus-products-rendered'));
  };

  try {
    const response = await fetch(window.NimbusApi?.url?.('/api/products') || '/api/products');
    products = await response.json();
    renderProducts();
    window.setTimeout(() => window.NimbusTranslate?.(), 0);
  } catch (error) {
    console.error(error);
    root.innerHTML = '<p class="warning-note">Unable to load products.</p>';
    updateCartBadge();
  }

  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal || event.target.dataset.close === 'true') {
        closeModal();
      }
    });

    const closeButton = modal.querySelector('.modal-close');
    closeButton?.addEventListener('click', closeModal);
  }

  updateCartBadge();
  document.addEventListener('nimbus-language-changed', () => {
    if (products.length) {
      renderProducts();
      window.setTimeout(() => window.NimbusTranslate?.(), 0);
    }
  });
});
