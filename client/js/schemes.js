document.addEventListener('DOMContentLoaded', async () => {
  const root = document.getElementById('schemesList');
  const search = document.getElementById('schemeSearch');
  const coverage = document.getElementById('schemeCoverage');
  if (!root) return;

  let allSchemes = [];
  const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
  const render = () => {
    const query = (search?.value || '').trim().toLowerCase();
    const state = coverage?.value || '';
    const filtered = allSchemes.filter((scheme) => {
      const searchable = `${scheme.name} ${scheme.category} ${scheme.department} ${scheme.state}`.toLowerCase();
      return searchable.includes(query) && (!state || scheme.state === state);
    });
    if (!filtered.length) {
      root.textContent = 'No schemes match your search.';
      return;
    }
    root.innerHTML = filtered.map((scheme) => `
      <article class="scheme-card">
        <div class="scheme-head">
          <h3>${escapeHtml(scheme.name)}</h3>
          <span class="scheme-badge">${escapeHtml(scheme.category || 'Support')}</span>
        </div>
        <div class="scheme-meta">
          <span class="scheme-badge">${escapeHtml(scheme.department || 'Government department')}</span>
          <span class="scheme-badge">${escapeHtml(scheme.state || 'Coverage not specified')}</span>
        </div>
        <p><strong>Purpose:</strong> ${escapeHtml(scheme.benefits)}</p>
        <p><strong>Eligibility summary:</strong> ${escapeHtml(scheme.eligibility)}</p>
        <p><strong>Documents to check:</strong> ${escapeHtml((scheme.documents || []).join(', '))}</p>
        <p><strong>How to apply:</strong> ${escapeHtml(scheme.applicationProcess)}</p>
        <div class="scheme-actions">
          <a class="btn btn-primary" href="${escapeHtml(scheme.officialUrl)}" target="_blank" rel="noopener noreferrer">Check official scheme information</a>
        </div>
      </article>
    `).join('');
    window.setTimeout(() => window.NimbusTranslate?.(), 0);
  };

  try {
    const response = await fetch(window.NimbusApi?.url?.('/api/schemes') || '/api/schemes');
    const schemes = await response.json();

    if (!response.ok || !Array.isArray(schemes) || schemes.length === 0) {
      root.innerHTML = '<p class="warning-note">No schemes are available right now.</p>';
      return;
    }

    allSchemes = schemes;
    [...new Set(schemes.map((scheme) => scheme.state).filter(Boolean))].forEach((state) => {
      coverage?.add(new Option(state, state));
    });
    search?.addEventListener('input', render);
    coverage?.addEventListener('change', render);
    render();
  } catch (error) {
    console.error(error);
    root.innerHTML = '<p class="warning-note">Unable to load schemes. Please verify the official government portals directly.</p>';
  }
});
