/* Tapsell banner integration for Ofoq Shari. Android / Capacitor Cordova bridge. */
(function () {
  'use strict';
  const APP_KEY = 'mkerkacpddbnttkiceabqptdpissipciqmojhhdkceocgbfkcchppfhpmhlemgafodclej';
  const ZONES = {
    home: '6b010ebfaeabeb750feb8f6f',
    azan: [
      '6b0071167597d07cbabd6e9e',
      '6b00715f728e2256843b0caf',
      '6b007174728e2256843b0cb0',
      '6b0071897597d07cbabd6e9f'
    ]
  };
  let ready = false, active = '', timer = null, index = 0;
  const sdk = () => window.tapsell && typeof window.tapsell.requestBannerAd === 'function' ? window.tapsell : null;
  function dismiss() {
    if (timer) { clearInterval(timer); timer = null; }
    const t = sdk();
    if (t && typeof t.dismiss === 'function') { try { t.dismiss(); } catch (_) {} }
    active = '';
  }
  function request(zone) {
    const t = sdk();
    if (!ready || !t) return false;
    try {
      // Standard 320x50 banner anchored at the bottom-center of the app window.
      t.requestBannerAd(zone, window.tapsell_banner_320x50 || 1,
        window.tapsell_bottom || 2, window.tapsell_center || 5);
      return true;
    } catch (e) { console.warn('Tapsell banner request failed', e); return false; }
  }
  function showHome() {
    dismiss(); active = 'home'; request(ZONES.home);
  }
  function showAzan() {
    dismiss(); active = 'azan'; index = 0;
    request(ZONES.azan[index]);
    // The legacy standard-banner bridge exposes one native banner overlay at a time.
    // Rotate through the four configured azan zones rather than stacking overlapping views.
    timer = setInterval(() => {
      if (active !== 'azan') return;
      index = (index + 1) % ZONES.azan.length;
      const t = sdk();
      if (t && typeof t.dismiss === 'function') { try { t.dismiss(); } catch (_) {} }
      request(ZONES.azan[index]);
    }, 15000);
  }
  function init() {
    if (ready) return;
    const t = sdk();
    if (!t) { console.warn('Tapsell Cordova plugin is not available in this build.'); return; }
    try {
      t.initialize(APP_KEY);
      ready = true;
      if (document.querySelector('#app') && document.querySelector('#app').dataset.page === 'home') showHome();
    } catch (e) { console.warn('Tapsell initialization failed', e); }
  }
  document.addEventListener('deviceready', init, false);
  // Some Capacitor/Cordova combinations dispatch deviceready before this file executes.
  if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
    setTimeout(init, 1200);
  }
  window.TapsellAds = { init, showHome, showAzan, dismiss, isReady: () => ready };
})();
