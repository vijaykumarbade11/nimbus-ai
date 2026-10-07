document.addEventListener('DOMContentLoaded', async () => {
  const root = document.getElementById('schemesList');
  const search = document.getElementById('schemeSearch');
  const coverage = document.getElementById('schemeCoverage');
  if (!root) return;

  let allSchemes = [];
  const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
  const safeOfficialUrl = (value) => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' ? url.href : '';
    } catch {
      return '';
    }
  };

  const render = () => {
    const query = (search?.value || '').trim().toLowerCase();
    const state = coverage?.value || '';
    const filtered = allSchemes.filter((scheme) => {
      const searchable = `${scheme.name} ${scheme.category} ${scheme.department} ${scheme.state} ${scheme.eligibility} ${scheme.benefits}`.toLowerCase();
      return searchable.includes(query) && (!state || scheme.state === state);
    });
    if (!filtered.length) {
      root.textContent = 'No schemes match your search.';
      return;
    }
    root.innerHTML = filtered.map((scheme) => {
      const officialUrl = safeOfficialUrl(scheme.officialUrl);
      const localRelevance = scheme.state === 'Maharashtra'
        ? 'For eligible applicants in Maharashtra, including Ahmedpur when the component and application window are active.'
        : 'Central programme; Ahmedpur farmers may qualify when the scheme, crop/season, and current rules apply.';
      return `
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
        <p><strong>Ahmedpur relevance:</strong> ${localRelevance}</p>
        <p><strong>Eligibility summary:</strong> ${escapeHtml(scheme.eligibility)}</p>
        <p><strong>Documents to check:</strong> ${escapeHtml((scheme.documents || []).join(', '))}</p>
        <p><strong>How to apply:</strong> ${escapeHtml(scheme.applicationProcess)}</p>
        <div class="scheme-actions">
          ${officialUrl ? `<a class="btn btn-primary" href="${escapeHtml(officialUrl)}" target="_blank" rel="noopener noreferrer">Check official scheme information</a>` : '<span class="warning-note">Official link not configured. Ask the taluka agriculture office.</span>'}
        </div>
      </article>
    `;
    }).join('');
    window.setTimeout(() => window.NimbusTranslate?.(), 0);
  };

  const loadSchemes = async () => {
    root.textContent = 'Loading scheme directory…';
    try {
    const response = await window.NimbusApi.request('/api/schemes');
    const schemes = await response.json();

      if (!response.ok || !Array.isArray(schemes)) {
        throw new Error('The scheme service returned an invalid response.');
      }
      if (!schemes.length) {
        root.innerHTML = '<p class="warning-note">No schemes are listed right now. Check the official government portals or ask the taluka agriculture office.</p>';
        return;
      }

      allSchemes = schemes;
      [...new Set(schemes.map((scheme) => scheme.state).filter(Boolean))].forEach((state) => {
        if (coverage && !Array.from(coverage.options).some((option) => option.value === state)) {
          coverage.add(new Option(state, state));
        }
      });
      render();
    } catch (error) {
      console.error('Unable to load government scheme directory:', error);
      root.innerHTML = `<p class="warning-note">Unable to load the scheme directory: ${escapeHtml(error.message)} Check the official portals below, or retry.</p><button class="btn btn-secondary" id="retrySchemes" type="button">Retry loading schemes</button>`;
      root.querySelector('#retrySchemes')?.addEventListener('click', loadSchemes);
    }
  };

  search?.addEventListener('input', render);
  coverage?.addEventListener('change', render);
  await loadSchemes();
});
