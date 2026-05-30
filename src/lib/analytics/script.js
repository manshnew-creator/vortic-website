/**
 * Lightweight, privacy-friendly analytics client-side tracking script
 * Injected automatically on published websites.
 */
(function() {
  const currentScript = document.currentScript;
  const websiteId = currentScript ? currentScript.getAttribute('data-website-id') : null;
  if (!websiteId) return;

  const CONFIG = {
    endpoint: '/api/analytics/collect',
    pageSlug: window.location.pathname || '/',
    visitorId: getOrCreateVisitorId(),
  };

  // Extract analytics details
  const payload = {
    websiteId: websiteId,
    pageSlug: CONFIG.pageSlug,
    visitorId: CONFIG.visitorId,
    userAgent: navigator.userAgent,
    referrer: document.referrer || '',
    eventType: 'PAGE_VIEW',
    eventMetadata: {
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language || '',
      utmSource: getQueryParam('utm_source'),
      utmMedium: getQueryParam('utm_medium'),
      utmCampaign: getQueryParam('utm_campaign'),
    }
  };

  // Immediate Page View log
  sendEvent(payload);

  // Track Clicks on elements marked as CTA or dynamic buttons
  document.addEventListener('click', function(e) {
    const target = e.target;
    if (target && (target.tagName === 'BUTTON' || target.closest('button') || target.tagName === 'A')) {
      sendEvent({
        ...payload,
        eventType: 'CLICK',
        eventMetadata: {
          ...payload.eventMetadata,
          elementId: target.id || '',
          elementText: target.innerText || target.textContent || '',
          elementClass: target.className || '',
        }
      });
    }
  });

  // Utility helpers
  function sendEvent(data) {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(CONFIG.endpoint, JSON.stringify(data));
    } else {
      fetch(CONFIG.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true,
      }).catch(function() {});
    }
  }

  function getOrCreateVisitorId() {
    let id = localStorage.getItem('_saas_visitor_id');
    if (!id) {
      id = 'vis_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('_saas_visitor_id', id);
    }
    return id;
  }

  function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name) || '';
  }
})();
