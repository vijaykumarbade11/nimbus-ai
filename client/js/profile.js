document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('profileForm');
  const status = document.getElementById('profileStatus');
  const villageSelect = document.getElementById('profileVillage');
  if (!form || !status || !villageSelect) return;

  const villages = window.AhmedpurVillages || ['Ahmedpur'];
  villageSelect.replaceChildren(
    new Option('Choose your village', ''),
    ...villages.map((village) => new Option(village, village))
  );

  const setFormValues = (farmer) => {
    const profile = {
      village: 'Ahmedpur',
      taluka: 'Ahmedpur',
      district: 'Latur',
      state: 'Maharashtra',
      language: localStorage.getItem('nimbus-language') || 'mr',
      ...farmer
    };
    ['name', 'mobile', 'village', 'taluka', 'district', 'state', 'language', 'farmSize', 'soilType', 'irrigationType']
      .forEach((field) => {
        if (form.elements[field]) form.elements[field].value = profile[field] || '';
      });
    form.elements.mainCrops.value = Array.isArray(profile.mainCrops) ? profile.mainCrops.join(', ') : '';
  };
  const setStatus = (message, successful = false) => {
    status.textContent = window.NimbusI18n?.t?.(message) || message;
    status.classList.toggle('success', successful);
  };

  setFormValues(window.NimbusLocation?.getFarmer?.() || {});

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    setStatus('Saving your profile…');
    const payload = Object.fromEntries(new FormData(form).entries());
    payload.mainCrops = String(payload.mainCrops || '').split(',').map((crop) => crop.trim()).filter(Boolean);

    try {
      localStorage.setItem('nimbus-farmer', JSON.stringify(payload));
      if (['mr', 'hi', 'en'].includes(payload.language)) {
        localStorage.setItem('nimbus-language', payload.language);
        window.NimbusTranslate?.();
      }
      setStatus('Profile saved on this device.', true);
    } catch (error) {
      setStatus(error.message || 'Could not save farmer profile.');
    } finally {
      submitButton.disabled = false;
    }
  });
});
