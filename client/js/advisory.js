document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('advisoryForm');
  const resultBox = document.getElementById('advisoryResult');
  if (!form) return;

  document.querySelectorAll('.advisory-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.advisory-tab').forEach((item) => {
        const active = item === tab;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', String(active));
      });
      document.querySelectorAll('.advisory-panel').forEach((panel) => {
        const active = panel.id === tab.dataset.tab;
        panel.classList.toggle('active', active);
        panel.hidden = !active;
      });
    });
  });

  const farmer = window.NimbusLocation?.getFarmer?.() || {};
  const villageSelect = document.getElementById('villageSelect');
  const cropSelect = form.elements.crop;
  const varietyOptions = document.getElementById('cropVarietyOptions');
  const varietySuggestions = {
    Soybean: ['JS-335', 'MAUS-71', 'JS-20-29', 'MAUS-158', 'KDS-726'],
    Cotton: ['Bunny Bt', 'Ajeet 155', 'Rasi 659', 'Mallika Bt'],
    'Tur / Pigeon Pea': ['BDN-711', 'BSMR-736', 'ICPL-87119', 'Vipula'],
    Jowar: ['M-35-1', 'CSV-29R', 'SPV-2217', 'Parbhani Shakti'],
    Maize: ['Vivek QPM-9', 'P-3396', 'NK-6240', '30V92'],
    Paddy: ['Phule Samruddhi', 'Basmati 1509', 'Swarna', 'MTU-1010'],
    Chickpea: ['JAKI-9218', 'Vijay', 'Digvijay', 'BDNG-797'],
    Wheat: ['NIAW-34', 'Phule Samadhan', 'Lok-1', 'HD-2967'],
    Sugarcane: ['Co-86032', 'Phule 265', 'CoM-0265', 'Co-0238'],
    Onion: ['N-2-4-1', 'Bhima Super', 'Bhima Shakti', 'Bhima Kiran']
  };
  const villages = window.AhmedpurVillages || ['Ahmedpur'];

  if (villageSelect) {
    villageSelect.replaceChildren(new Option('Choose village', ''));
    villages.forEach((village) => villageSelect.add(new Option(village, village)));
    villageSelect.value = villages.includes(farmer.village) ? farmer.village : '';
  }

  const updateVarietySuggestions = () => {
    if (!varietyOptions) return;
    varietyOptions.replaceChildren(...(varietySuggestions[cropSelect.value] || []).map((name) => new Option(name, name)));
  };
  cropSelect?.addEventListener('change', updateVarietySuggestions);
  updateVarietySuggestions();

  const photoInput = document.getElementById('cropPhoto');
  const preview = document.getElementById('cropPreview');
  const runScan = document.getElementById('runScan');
  const scanResult = document.getElementById('scanResult');
  let selectedPhoto = null;
  let previewUrl = null;
  let hasPhotoResult = false;
  let hasAdviceResult = false;

  photoInput?.addEventListener('change', () => {
    selectedPhoto = photoInput.files?.[0] || null;
    if (!selectedPhoto || !preview) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedPhoto.type) || selectedPhoto.size > 1200000) {
      selectedPhoto = null;
      photoInput.value = '';
      if (runScan) runScan.disabled = true;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl = null;
      preview.classList.add('hidden');
      preview.removeAttribute('src');
      if (scanResult) scanResult.textContent = 'Choose a JPG, PNG, or WebP image no larger than 1.2 MB.';
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = URL.createObjectURL(selectedPhoto);
    preview.src = previewUrl;
    preview.classList.remove('hidden');
    if (runScan) runScan.disabled = false;
    if (scanResult) scanResult.textContent = `${selectedPhoto.name} selected. Photo review requires the AI vision service to be configured.`;
  });

  const addText = (parent, tag, label, value) => {
    const row = document.createElement(tag);
    if (label) {
      const strong = document.createElement('strong');
      strong.textContent = `${label}: `;
      row.append(strong);
    }
    row.append(document.createTextNode(Array.isArray(value) ? value.join('; ') : (value || 'Not provided')));
    parent.append(row);
  };

  runScan?.addEventListener('click', async () => {
    if (!selectedPhoto || !scanResult) return;
    hasPhotoResult = false;
    const crop = cropSelect.value;
    const stage = form.elements.stage.value;
    const village = villageSelect.value;
    const symptoms = form.elements.symptoms.value.trim();
    const requiredFields = [
      'crop', 'variety', 'sowingDate', 'soilType', 'irrigationType', 'stage', 'symptoms',
      'village', 'soilTestDate', 'soilPH', 'availableNitrogen', 'availablePhosphorus', 'availablePotassium'
    ];
    const missingField = requiredFields.find((name) => !String(form.elements[name]?.value || '').trim());
    if (missingField) {
      scanResult.textContent = 'Complete all required field-plan and soil-test values before requesting a photo review.';
      return;
    }
    scanResult.textContent = 'Sending the selected photo for a cautious visual review…';

    try {
      const imageData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('The selected photo could not be read.'));
        reader.readAsDataURL(selectedPhoto);
      });
      const response = await fetch(window.NimbusApi?.url?.('/api/advisory/disease-detection') || '/api/advisory/disease-detection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...Object.fromEntries(new FormData(form).entries()),
          imageData,
          lang: window.NimbusI18n?.lang?.() || 'mr'
        })
      });
      const data = await response.json();
      if (!response.ok || !data.assessment) throw new Error(data.message || 'Photo review is unavailable.');

      scanResult.replaceChildren();
      const title = document.createElement('h3');
      title.textContent = 'Tentative visual triage — not a diagnosis';
      scanResult.append(title);
      addText(scanResult, 'p', 'Image review', data.assessment.imageAssessment);
      addText(scanResult, 'p', 'Visible features', data.assessment.visibleSymptoms);
      addText(scanResult, 'p', 'Possible causes (unconfirmed)', data.assessment.possibleCauses);
      addText(scanResult, 'p', 'Image limitations', data.assessment.imageLimitations);
      addText(scanResult, 'p', 'Next steps', data.assessment.recommendedNextSteps);
      addText(scanResult, 'p', 'Expert review needed', data.assessment.expertReviewNeeded ? 'Yes' : 'Not indicated by this image');
      addText(scanResult, 'p', 'Safety', data.assessment.safetyWarning);
      hasPhotoResult = true;
      window.setTimeout(() => window.NimbusTranslate?.(), 0);
    } catch (error) {
      scanResult.textContent = error.message || 'Photo review failed; no diagnosis was generated.';
    }
  });

  const soilCard = document.getElementById('soilAdvisoryCard');
  if (soilCard) {
    const locationPath = window.NimbusLocation?.buildWeatherUrl?.('/api/weather/current') || '/api/weather/current';
    const soilPath = locationPath.replace('/api/weather/current', '/api/soil/current');
    try {
      const response = await fetch(window.NimbusApi?.url?.(soilPath) || soilPath);
      const soil = await response.json();
      if (!response.ok || !soil.properties) throw new Error(soil.error || 'Public soil estimate unavailable.');
      soilCard.textContent = `${soil.location?.name || 'Selected location'} · ${soil.depth}. SoilGrids model estimate: clay ${soil.properties.clay ?? '--'}%, sand ${soil.properties.sand ?? '--'}%, silt ${soil.properties.silt ?? '--'}%, organic carbon ${soil.properties.organicCarbon ?? '--'} g/kg. ${soil.limitation} Use a field soil test for farm decisions.`;
    } catch (error) {
      soilCard.textContent = `${error.message || 'Public soil estimate unavailable.'} Use a local soil test for field decisions.`;
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity() || !resultBox) return;

    const formData = new FormData(form);
    const payload = { ...Object.fromEntries(formData.entries()), lang: window.NimbusI18n?.lang?.() || 'mr' };
    hasAdviceResult = false;
    resultBox.textContent = 'Checking weather and soil evidence before requesting advice…';

    try {
      const response = await fetch(window.NimbusApi?.url?.('/api/advisory') || '/api/advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok || !data.advice) throw new Error(data.message || 'Evidence-based advice is unavailable.');

      resultBox.replaceChildren();
      const heading = document.createElement('h3');
      heading.textContent = 'Evidence-based field guidance';
      resultBox.append(heading);
      addText(resultBox, 'p', 'Field', data.location);
      addText(resultBox, 'p', 'Summary', data.advice.summary);
      addText(resultBox, 'p', 'Evidence used', data.advice.evidenceUsed);
      addText(resultBox, 'p', 'Immediate actions', data.advice.immediateActions);
      addText(resultBox, 'p', 'Irrigation', data.advice.irrigation);
      addText(resultBox, 'p', 'Nutrition', data.advice.nutrition);
      addText(resultBox, 'p', 'Pest and disease checks', data.advice.pestAndDiseaseChecks);
      addText(resultBox, 'p', 'Weather timing', data.advice.weatherTiming);
      addText(resultBox, 'p', 'What to confirm', data.advice.whatToConfirm);
      addText(resultBox, 'p', 'Safety', data.advice.safetyWarning);
      addText(resultBox, 'small', 'Data quality', `${data.evidence.weatherSource}; ${data.evidence.soilSource} ${data.evidence.soilDepth}. ${data.evidence.soilLimitation}`);
      hasAdviceResult = true;
      window.setTimeout(() => window.NimbusTranslate?.(), 0);
    } catch (error) {
      resultBox.textContent = `${error.message || 'Unable to generate evidence-based advice.'} No fallback or demo advice was shown.`;
    }
  });

  document.addEventListener('nimbus-language-changed', () => {
    if (hasAdviceResult) form.requestSubmit();
    if (hasPhotoResult && selectedPhoto) runScan?.click();
  });
});
