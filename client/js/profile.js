document.addEventListener('DOMContentLoaded', () => {
  const profileCard = document.querySelector('.dashboard-card');
  if (!profileCard) return;

  let farmer = {};
  try {
    farmer = JSON.parse(localStorage.getItem('nimbus-farmer') || '{}');
  } catch (error) {
    farmer = {};
  }

  profileCard.innerHTML = `
    <p><strong>Name:</strong> ${farmer.name || 'Farmer profile not available'}</p>
    <p><strong>Mobile Number:</strong> ${farmer.mobile || 'Not available'}</p>
    <p><strong>Village:</strong> ${farmer.village || 'Not available'}</p>
    <p><strong>Taluka:</strong> ${farmer.taluka || 'Not available'}</p>
    <p><strong>District:</strong> ${farmer.district || 'Not available'}</p>
    <p><strong>State:</strong> ${farmer.state || 'Not available'}</p>
    <p><strong>Preferred Language:</strong> ${farmer.language || 'Not available'}</p>
  `;
});
