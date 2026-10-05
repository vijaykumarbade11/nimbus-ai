document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');

  const handleAuthSuccess = (data) => {
    if (!data?.token) {
      throw new Error('Authentication token was not returned by the server.');
    }

    localStorage.setItem('nimbus-token', data.token);
    localStorage.setItem('nimbus-farmer', JSON.stringify(data.farmer || {}));
    window.location.href = 'dashboard.html';
  };

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const mobile = document.getElementById('mobile')?.value?.trim();
    const statusEl = document.getElementById('loginStatus');
    const submitButton = form.querySelector('button[type="submit"]');

    if (statusEl) statusEl.textContent = '';
    if (!mobile) {
      if (statusEl) statusEl.textContent = 'Enter your mobile number.';
      return;
    }

    if (submitButton) submitButton.disabled = true;

    try {
      const response = await fetch(window.NimbusApi?.url?.('/api/auth/login') || '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile })
      });

      const responseText = await response.text();
      let data = {};

      if (responseText.trim()) {
        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error(`Login service returned an invalid response (HTTP ${response.status}).`);
        }
      }

      if (!response.ok) {
        const validationMessage = data.errors?.[0]?.msg;
        throw new Error(data.message || validationMessage || `Login failed (HTTP ${response.status}).`);
      }

      handleAuthSuccess(data);
    } catch (error) {
      const message = error.message || 'Login failed. Please try again.';
      if (statusEl) statusEl.textContent = message;
      else alert(message);
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
});
