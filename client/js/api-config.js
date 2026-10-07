const configuredNimbusApiBase = String(window.NIMBUS_API_BASE || '').trim();
const isLocalLiveServer = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  && window.location.port === '5500';

window.NIMBUS_API_BASE = configuredNimbusApiBase
  || (isLocalLiveServer ? `${window.location.protocol}//${window.location.hostname}:5000` : '');
