document.addEventListener('DOMContentLoaded', async () => {
  const root = document.getElementById('productsList');
  const modal = document.getElementById('productModal');
  const modalContent = document.getElementById('productModalContent');
  const mandiCrop = document.getElementById('mandiCrop');
  const mandiRows = document.getElementById('mandiRows');
  const mandiStatus = document.getElementById('mandiStatus');
  const mandiSource = document.getElementById('mandiSource');

  if (!root) return;

  const loadMandiRates = async () => {
    if (!mandiRows || !mandiCrop) return;
    mandiRows.innerHTML = '<tr><td colspan="8">Loading rates...</td></tr>';
    if (mandiStatus) {
      mandiStatus.hidden = true;
      mandiStatus.textContent = '';
    }
    try {
      const path = `/api/market-rates?crop=${encodeURIComponent(mandiCrop.value)}`;
      const response = await window.NimbusApi.request(path);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Market rates unavailable.');
      if (mandiSource) {
        const reports = data.reports || [data];
        mandiSource.replaceChildren(document.createTextNode(
          `${data.sourceName} · Source report date: ${data.updatedAt || 'not supplied by source'} · Values are ₹ per quintal where listed. `
        ));
        reports.forEach((report, index) => {
          if (!report.sourceUrl || new URL(report.sourceUrl).hostname !== 'www.krushikranti.com') return;
          if (index) mandiSource.append(document.createTextNode(' · '));
          const sourceLink = document.createElement('a');
          sourceLink.href = report.sourceUrl;
          sourceLink.target = '_blank';
          sourceLink.rel = 'noopener noreferrer';
          sourceLink.textContent = reports.length > 1
            ? `${report.cropName} source (${report.updatedAt || 'date not supplied'})`
            : 'View source report';
          mandiSource.append(sourceLink);
        });
        const failedReports = reports.filter((report) => report.error);
        const emptyReports = reports.filter((report) => report.hasRates === false && !report.error);
        const statusParts = [];
        if (failedReports.length) {
          statusParts.push(`Could not load current reports for: ${failedReports.map((report) => report.cropName).join(', ')}.`);
        }
        if (emptyReports.length) {
          statusParts.push(`No price rows were returned for: ${emptyReports.map((report) => report.cropName).join(', ')}.`);
        }
        if (data.ahmedpurListed === false) {
          statusParts.push('Ahmedpur was not listed in these source responses; shown values are comparison-market rates only.');
        }
        if (statusParts.length && mandiStatus) {
          mandiStatus.hidden = false;
          mandiStatus.textContent = `${statusParts.join(' ')} Other returned rates are shown below.`;
        }
      }
      if (!data.rows?.length) {
        mandiRows.innerHTML = '<tr><td colspan="8">No rates were returned by the public source.</td></tr>';
        return;
      }
      mandiRows.replaceChildren(...data.rows.map((row) => {
        const tableRow = document.createElement('tr');
        const formatPrice = (value) => {
          const amount = Number(String(value ?? '').replace(/,/g, ''));
          return Number.isFinite(amount) && String(value ?? '').trim() !== ''
            ? `₹${amount.toLocaleString('en-IN')}`
            : (value == null || value === '' ? '--' : String(value));
        };
        [
          row.cropName || data.cropName || mandiCrop.value,
          row.market,
          row.variety === '---' ? 'Not specified by source' : row.variety,
          row.unit,
          row.arrivals,
          formatPrice(row.minimum),
          formatPrice(row.maximum)
        ].forEach((value) => {
          const cell = document.createElement('td');
          cell.textContent = value == null ? '--' : String(value);
          tableRow.append(cell);
        });
        const modalCell = document.createElement('td');
        const modalValue = document.createElement('strong');
        modalValue.textContent = formatPrice(row.modal);
        modalCell.append(modalValue);
        tableRow.append(modalCell);
        return tableRow;
      }));
      if (data.ahmedpurListed === false && mandiStatus && !mandiStatus.textContent) {
        mandiStatus.hidden = false;
        mandiStatus.textContent = 'Ahmedpur was not listed in this source response. These are comparison-market rates only; confirm the local Ahmedpur APMC rate before selling.';
      }
      window.setTimeout(() => window.NimbusTranslate?.(), 0);
    } catch (error) {
      mandiRows.innerHTML = '<tr><td colspan="8">Public market rates are temporarily unavailable.</td></tr>';
      if (mandiStatus) {
        mandiStatus.hidden = false;
        mandiStatus.textContent = `${error.message} The product directory does not provide today’s mandi price.`;
      }
    }
  };

  mandiCrop?.addEventListener('change', loadMandiRates);
  loadMandiRates();

  let products = [];

  const hasKnownPrice = (product) => product.price !== null && product.price !== '' && Number.isFinite(Number(product.price));
  const priceText = (product) => hasKnownPrice(product) ? `₹${Number(product.price).toLocaleString('en-IN')}` : 'Seller quote required';
  const marketPriceText = (product) => product.marketPrice !== null && product.marketPrice !== '' && Number.isFinite(Number(product.marketPrice))
    ? `Ahmedpur: ₹${Number(product.marketPrice).toLocaleString('en-IN')} / ${product.marketUnit || product.unit || 'unit'}`
    : 'No verified live Ahmedpur price';

  const closeModal = () => {
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  };

  const openProductDetail = (product) => {
    if (!modal || !modalContent) return;

    const mapSearch = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${product.name} shop Ahmedpur Latur Maharashtra`)}`;

    modalContent.innerHTML = `
      <div class="modal-body">
        <div class="modal-topline">
          <span class="category-badge">${product.category || 'Agriculture'}</span>
          <span class="stock-pill verify">${product.availability || 'Confirm with a local seller'}</span>
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
          <div><span>Stock</span><strong>${product.stock ? `${product.stock} available` : 'Not verified'}</strong></div>
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
          <button type="button" class="btn btn-secondary" data-close="true">Close</button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');

    modal.querySelectorAll('[data-close]').forEach((button) => {
      button.addEventListener('click', closeModal);
    });
  };

  const renderProducts = () => {
    if (!root) return;

    if (!Array.isArray(products) || products.length === 0) {
      root.innerHTML = '<p class="warning-note">No products available right now.</p>';
      return;
    }

    root.innerHTML = products.map((product) => {
      const mapSearch = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${product.name} shop Ahmedpur Latur Maharashtra`)}`;
      return `
        <article class="dashboard-card product-card">
          <div class="product-info">
            <div class="product-topline">
              <span class="category-badge">${product.category || 'Agriculture'}</span>
              <span class="stock-pill verify">${product.availability || 'Confirm with a local seller'}</span>
            </div>
            <h3>${product.name}</h3>
            <div class="price-row">
              <span class="price-tag">${priceText(product)}</span>
              <span class="market-tag-line">${marketPriceText(product)}</span>
            </div>
            <p class="product-description">${product.description || 'Product information is currently unavailable.'}</p>
            <div class="product-specs">
              <span><i class="fa-solid fa-box"></i> Stock not verified</span>
              <span><i class="fa-solid fa-indian-rupee-sign"></i> ${product.unit || 'unit'}</span>
            </div>
            <div class="cta-row product-actions">
              <a class="btn btn-light" href="${mapSearch}" target="_blank" rel="noopener noreferrer">Find local sellers on Maps</a>
              <button class="btn btn-primary detail-btn" type="button" data-id="${product._id}">Product details</button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    root.querySelectorAll('.detail-btn').forEach((button) => {
      button.addEventListener('click', () => {
        const selected = products.find((item) => item._id === button.dataset.id);
        if (selected) openProductDetail(selected);
      });
    });

    document.dispatchEvent(new CustomEvent('nimbus-products-rendered'));
  };

  try {
    const response = await window.NimbusApi.request('/api/products');
    products = await response.json();
    renderProducts();
    window.setTimeout(() => window.NimbusTranslate?.(), 0);
  } catch (error) {
    console.error(error);
    root.innerHTML = '<p class="warning-note">Unable to load products.</p>';
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

  document.addEventListener('nimbus-language-changed', () => {
    if (products.length) {
      renderProducts();
      window.setTimeout(() => window.NimbusTranslate?.(), 0);
    }
  });
});
