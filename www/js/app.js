(function () {
  'use strict';
  const PRAYERS = [['fajr', 'اذان صبح'], ['sunrise', 'طلوع آفتاب'], ['dhuhr', 'اذان ظهر'], ['asr', 'اذان عصر'], ['maghrib', 'اذان مغرب'], ['isha', 'اذان عشا']];
  const AZAN = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const NAME = Object.fromEntries(PRAYERS);
  /* inline line-icons (no emoji) */
  const PATHS = {
    pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    home: '<path d="M3.5 11 12 4l8.5 7"/><path d="M6 10v9.5h12V10"/><path d="M10 19.5v-5h4v5"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    gear: '<path d="M10 2.8h4l.6 2.1a7.5 7.5 0 0 1 1.7 1l2-.8 2 3.5-1.5 1.5a7.5 7.5 0 0 1 0 2l1.5 1.5-2 3.5-2-.8a7.5 7.5 0 0 1-1.7 1l-.6 2.1h-4l-.6-2.1a7.5 7.5 0 0 1-1.7-1l-2 .8-2-3.5 1.5-1.5a7.5 7.5 0 0 1 0-2L3.7 8.6l2-3.5 2 .8a7.5 7.5 0 0 1 1.7-1z"/><circle cx="12" cy="11.1" r="2.7"/>',
    bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"/>',
    sound: '<path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
    soff: '<path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.2"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    back: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    chev: '<path d="M14.5 6 8.5 12l6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    play: '<path d="M8 5.5v13l10.5-6.5z"/>',
    stop: '<rect x="6.5" y="6.5" width="11" height="11" rx="2"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    fajr: '<path d="M18.5 14.5A7.5 7.5 0 0 1 9.5 5.5a7.5 7.5 0 1 0 9 9z"/><path d="M17 4v3M15.5 5.5h3"/>',
    sunrise: '<path d="M3.5 18h17M7 18a5 5 0 0 1 10 0M12 6v3M5.5 10.5l1.8 1.8M18.5 10.5l-1.8 1.8"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/>',
    asr: '<path d="M7 18h10a3.5 3.5 0 0 0 .3-7A5 5 0 0 0 8 10a4 4 0 0 0-1 8z"/><path d="M16.5 4.5l.8 1.4M20.2 8.2l-1.4.8M12.5 4.8l-.3 1.5"/>',
    sunset: '<path d="M3.5 19h17M7 19a5 5 0 0 1 10 0M12 4v5M9.5 6.8 12 9.3l2.5-2.5"/>',
    moon: '<path d="M19 14.5A8 8 0 0 1 9.5 5a8 8 0 1 0 9.5 9.5z"/>',
    compass: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3"/><path d="M12 8l2.5 6h-5z"/>',
    text: '<path d="M4 6h16M4 12h10M4 18h14"/>',
    shield: '<path d="M12 3l8 3.5v5.5c0 5-3.5 8.5-8 9.5-4.5-1-8-4.5-8-9.5V6.5z"/>',
    save: '<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h8V4M8 15h8"/>',
    gps: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><path d="M5.6 5.6l2 2M16.4 16.4l2 2M16.4 5.6l-2 2M5.6 16.4l2-2"/>',
    cal: '<rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
    grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>'
  };
  const ic = n => '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' + PATHS[n] + '</svg>';
  const ICON = { fajr: ic('fajr'), sunrise: ic('sunrise'), dhuhr: ic('sun'), asr: ic('asr'), maghrib: ic('sunset'), isha: ic('moon') };
  const SHORT = { fajr: 'صبح', sunrise: 'طلوع آفتاب', dhuhr: 'ظهر', asr: 'عصر', maghrib: 'مغرب', isha: 'عشا' };
  const DEF = {
    cityId: 'tehran', custom: null,
    enabled: { fajr: true, dhuhr: true, asr: false, maghrib: true, isha: false },
    volume: 1, pre: 0, offsets: {}, muezzinId: 'afasy', hijriOffset: 1, // +1: islamic-civil often 1 day behind Iranian visual calendar
    muezzins: [{ id: 'afasy', name: 'اذان پیش‌فرض', path: '', file: '' }],
    setupDone: false,
    obStep: 0,               // onboarding wizard slide (0=city, 1=notifications, 2=battery, 3=azan)
    method: 'tehran',
    fontScale: 1,
    uiMode: 'normal', // normal | elder
    highContrast: false,
    theme: 'green',          // green | blue | sand
    themeMode: 'system',     // system | dark | light
    qada: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0, fast: 0 },
    dhikrCount: 0, dhikrTarget: 33, dhikrName: 'سبحان الله',
    notes: {},               // 'YYYY-M-D' -> text
    vibrateQibla: true,      // master switch for all vibration (name kept for old backups)
    vibrateAzan: false,      // gentle vibration when the azan starts
    dhikrAwake: true,        // keep the screen on in the tasbih page
    showImsak: true,
    showMidnight: true,
    ramadanMode: false,
    streak: { days: 0, last: '' },
    shakeDhikr: true,
    amoled: false,
    qiblaOffset: 0,          // manual calibration degrees
    useMagDecl: true,        // compensate magnetic declination
    favCities: ['tehran'],   // quick favorites
    showProgress: true,      // prayer progress bar
    preciseCd: true,         // countdown with seconds emphasis
    prayedToday: {},         // { fajr: true, ... } marked as prayed today
    prayedDate: '',          // 'YYYY-M-D' for prayedToday validity
    reduceMotion: false,     // less animation
    showSeconds: true,       // show seconds in countdown
    autoCity: true,          // suggest nearest city on GPS
    stickyNext: true,        // keep next prayer visible on home
    dailyGoal: true,         // encourage marking prayers
    hapticHome: true,        // light haptic on home actions
    showKaabaDist: true,     // distance to Mecca in qibla
    weekStart: 'sat',        // calendar week start
    notifyOnPrayed: false,   // optional feedback when marking prayed
    compactHome: false,      // denser home layout
    highlightFriday: true,   // special Friday treatment
    showNextOcc: true,       // show upcoming occasions
    smartNotif: true,        // rich pre-azan notifications
    quietHours: false,       // suppress pre-notif at night (except fajr)
    quietStart: 23,
    quietEnd: 5,
    ramadanHint: true,       // extra maghrib text in Ramadan mode
    preEnabled: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true },
    preFajr: null,           // null = use global pre; else minutes only for fajr
    vibratePre: true,        // vibrate on pre-azan notification
    preOnlyEnabledAzan: true // only pre-notify for azans that are enabled
  };
  const APP_VERSION = '2.1.5';
  const METHOD_LABELS = {
    tehran: 'مؤسسه ژئوفیزیک تهران',
    mwl: 'لیگ جهانی مسلمانان',
    isna: 'ISNA (آمریکای شمالی)',
    egypt: 'هیئت بررسی مصر',
    karachi: 'دانشگاه کراچی',
    ummalqura: 'ام‌القرى',
    jafari: 'جعفری (شیعه)'
  };
  const fa = s => String(s).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
  const p2 = n => String(n).padStart(2, '0');
  const hm = min => fa(p2(Math.floor(min / 60) % 24) + ':' + p2(min % 60));
  /* ---------- vibration: native Android first (the WebView's navigator.vibrate is unreliable), browser API as fallback ---------- */
  const VIB = { tap: [28], done: [70, 70, 70, 70, 180], qibla: [40, 30, 40], rakat: [40], test: [180, 90, 180] };
  async function vib(kind, force) {
    if (!force && !S.vibrateQibla) return null;
    const pat = VIB[kind] || VIB.tap;
    let r = null;
    try { r = await Native.vibrate(pat); } catch (e) { r = null; }
    if (r === null || (r && r.error)) {
      try { if (navigator.vibrate) return { ok: !!navigator.vibrate(pat), has: true }; } catch (e) {}
      return { ok: false, has: false };
    }
    return r;
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  let S = load();
  let setupLocationRequested = false;
  function load() {
    try {
      const raw = localStorage.getItem('azango');
      const o = JSON.parse(raw || '{}');
      const m = Object.assign({}, DEF, o, { enabled: Object.assign({}, DEF.enabled, o.enabled || {}), offsets: Object.assign({}, o.offsets || {}) });
      m.muezzins = (m.muezzins || DEF.muezzins).map(x => (x.id === 'afasy' && !x.path) ? Object.assign({}, x, { name: 'اذان پیش‌فرض' }) : x);
      if (raw && o.setupDone === undefined) m.setupDone = true;
      if (!m.method || !METHOD_LABELS[m.method]) m.method = 'tehran';
      if (![0.9, 1, 1.15, 1.3].includes(m.fontScale)) m.fontScale = 1;
      if (m.uiMode !== 'elder') m.uiMode = 'normal';
      if (!['system', 'light', 'dark'].includes(m.themeMode)) m.themeMode = 'system';
      // One-time fix: islamic-civil was typically 1 day behind Iranian announced Hijri
      if (!m.hijriCalFixed) {
        if (o.hijriOffset === undefined || o.hijriOffset === 0) m.hijriOffset = 1;
        m.hijriCalFixed = true;
      }
      if (!m.preEnabled) m.preEnabled = { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true };
      return m;
    } catch (e) { return JSON.parse(JSON.stringify(DEF)); }
  }
  function save(resched) { localStorage.setItem('azango', JSON.stringify(S)); if (resched !== false) schedule(); }

  /* ---------- location & times ---------- */
  function place() {
    if (S.custom) return S.custom;
    return CITIES.find(c => c.id === S.cityId) || CITIES[0];
  }
  function nearestCity(lat, lng) {
    let best = CITIES[0], bestD = 1e18;
    for (const c of CITIES) {
      const dlat = (c.lat - lat) * Math.PI / 180, dlng = (c.lng - lng) * Math.PI / 180;
      const a = Math.sin(dlat / 2) ** 2 + Math.cos(c.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * Math.sin(dlng / 2) ** 2;
      const d = 2 * 6371 * Math.asin(Math.sqrt(a));
      if (d < bestD) { bestD = d; best = c; }
    }
    return { city: best, km: Math.round(bestD * 10) / 10 };
  }
  function applyGpsPosition(lat, lng, msgEl) {
    const { city, km } = nearestCity(lat, lng);
    S.custom = null;
    S.cityId = city.id;
    save();
    if (msgEl) msgEl.textContent = 'شهر تشخیص‌داده‌شده: ' + city.name + ' (حدود ' + fa(km) + ' کیلومتر)';
    const sel = document.querySelector('.setup-sel');
    if (sel) sel.innerHTML = 'شهر فعلی: <b>' + esc(city.name) + '</b>';
    document.querySelectorAll('#cList .city').forEach(b => {
      const on = b.dataset.city === city.id;
      b.classList.toggle('sel', on);
      const em = b.querySelector('em');
      if (em) em.innerHTML = on ? ic('check') : '';
    });
  }
  const cityNow = tz => new Date(Date.now() + tz * 3600000); // read with getUTC*
  function timesFor(dayMs, p) {
    const d = new Date(dayMs);
    const t = PT.compute(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), p.lat, p.lng, p.tz, S.method || 'tehran');
    for (const k in t) { const o = (S.offsets && S.offsets[k]) || 0; if (o) { t[k].min += o; t[k].ms += o * 60000; } }
    return t;
  }
  function applyUiPrefs() {
    const elder = S.uiMode === 'elder';
    document.body.classList.toggle('elder', elder);
    document.body.classList.toggle('hc', !!S.highContrast || elder);
    document.body.dataset.theme = S.theme || 'green';
    const systemDark = !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const effectiveMode = S.themeMode === 'system' ? (systemDark ? 'dark' : 'light') : (S.themeMode || 'system');
    document.body.dataset.mode = effectiveMode;
    document.body.classList.toggle('amoled', !!S.amoled && effectiveMode === 'dark');
    document.body.classList.toggle('reduce-motion', !!S.reduceMotion);
    document.body.classList.toggle('compact', !!S.compactHome);
    // Friday class for special styling
    try {
      const p = place();
      const cnow = cityNow(p.tz);
      const wd = new Date(cnow.getTime()).getUTCDay(); // 0=Sun ... 5=Fri
      // JS UTC day: need local-ish; cityNow shifts so getUTCDay reflects city
      document.body.classList.toggle('friday', wd === 5 && S.highlightFriday !== false);
    } catch (e) {}
    // elder has its own scale in CSS; normal uses fontScale
    document.documentElement.style.setProperty('--fs', elder ? 1 : (S.fontScale || 1));
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = effectiveMode === 'light' ? '#f4f0e8' : '#140f0a';
  }
  const dayStart = (p, offset) => { const c = cityNow(p.tz); return Date.UTC(c.getUTCFullYear(), c.getUTCMonth(), c.getUTCDate()) + (offset || 0) * 86400000; };

  function nextPrayer(p) {
    const now = Date.now();
    for (let i = 0; i < 3; i++) {
      const t = timesFor(dayStart(p, i), p);
      for (const k of AZAN) if (t[k].ms > now) return { key: k, ms: t[k].ms, min: t[k].min };
    }
    return null;
  }

  function prevMs(p) {
    const now = Date.now();
    let best = 0;
    for (let i = -1; i <= 0; i++) { const t = timesFor(dayStart(p, i), p); for (const k of AZAN) if (t[k].ms <= now && t[k].ms > best) best = t[k].ms; }
    return best;
  }

  /* ---------- calendars (Intl, no network) ---------- */
  function dates(p) {
    const c = cityNow(p.tz);
    const fmt = (loc, o, d) => new Intl.DateTimeFormat(loc, Object.assign({ timeZone: 'UTC' }, o)).format(d);
    const shamsi = fmt('fa-IR-u-ca-persian', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }, c);
    // Hijri: islamic-civil is tabular and often 1 day behind common Iranian/announced dates.
    // Default offset +1; user can fine-tune in settings. Umm al-Qura used when available.
    const h = new Date(c.getTime() + (S.hijriOffset != null ? S.hijriOffset : 1) * 86400000);
    let qamari, lp;
    try {
      qamari = fmt('fa-IR-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' }, h);
      lp = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', { timeZone: 'UTC', month: 'numeric', day: 'numeric' }).formatToParts(h);
    } catch (e) {
      qamari = fmt('fa-IR-u-ca-islamic-civil', { day: 'numeric', month: 'long', year: 'numeric' }, h);
      lp = new Intl.DateTimeFormat('en-US-u-ca-islamic-civil', { timeZone: 'UTC', month: 'numeric', day: 'numeric' }).formatToParts(h);
    }
    const greg = fmt('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }, c);
    const sp = new Intl.DateTimeFormat('en-US-u-ca-persian', { timeZone: 'UTC', month: 'numeric', day: 'numeric' }).formatToParts(c);
    const get = (parts, type) => (parts.find(x => x.type === type) || {}).value;
    const shamsiMD = get(sp, 'month') + '/' + get(sp, 'day');
    const lunarMD = get(lp, 'month') + '/' + get(lp, 'day');
    return { shamsi, qamari, greg, shamsiMD, lunarMD };
  }


  /* ---------- prayer completion & daily helpers ---------- */
  function todayKey(p) {
    const c = cityNow(p ? p.tz : place().tz);
    return c.getUTCFullYear() + '-' + (c.getUTCMonth() + 1) + '-' + c.getUTCDate();
  }
  function ensurePrayedDay() {
    const k = todayKey();
    if (S.prayedDate !== k) {
      S.prayedToday = {};
      S.prayedDate = k;
    }
  }
  function isPrayed(key) {
    ensurePrayedDay();
    return !!(S.prayedToday && S.prayedToday[key]);
  }
  function togglePrayed(key) {
    ensurePrayedDay();
    if (!S.prayedToday) S.prayedToday = {};
    S.prayedToday[key] = !S.prayedToday[key];
    // simple streak: if all 5 azan prayers marked, advance streak
    const all = AZAN.every(k => S.prayedToday[k]);
    if (all) {
      const k = todayKey();
      if (S.streak.last !== k) {
        S.streak.days = (S.streak.days || 0) + 1;
        S.streak.last = k;
      }
    }
    save(false);
    if (S.hapticHome !== false) vib('tap');
    return S.prayedToday[key];
  }
  function prayedCount() {
    ensurePrayedDay();
    return AZAN.filter(k => S.prayedToday[k]).length;
  }
  function kaabaDistanceKm(lat, lng) {
    // Haversine to Kaaba approx 21.4225, 39.8262
    const R = 6371, toR = Math.PI / 180;
    const dLat = (21.4225 - lat) * toR, dLng = (39.8262 - lng) * toR;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat*toR)*Math.cos(21.4225*toR)*Math.sin(dLng/2)**2;
    return Math.round(2 * R * Math.asin(Math.sqrt(a)));
  }
  function shareTextTimes() {
    const p = place(), t = timesFor(dayStart(p, 0), p), d = dates(p);
    let s = 'اوقات شرعی ' + p.name + '\n' + d.shamsi + '\n' + d.qamari + '\n\n';
    PRAYERS.forEach(([k, n]) => { s += n + ': ' + hm(t[k].min) + '\n'; });
    if (t.imsak) s += 'امساک: ' + hm(t.imsak.min) + '\n';
    s += '\n— افق شرعی';
    return s;
  }
  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
    }
    try {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      const ok = document.execCommand('copy'); document.body.removeChild(ta);
      return Promise.resolve(ok);
    } catch (e) { return Promise.resolve(false); }
  }

  /* ---------- scheduling (hands a 45-day event list to Kotlin) ---------- */
  function buildEvents() {
    const p = place(), out = [], now = Date.now();
    const preEn = S.preEnabled || {};
    for (let i = 0; i < 45; i++) {
      const t = timesFor(dayStart(p, i), p);
      for (const k of AZAN) {
        if (!S.enabled[k]) continue;
        const ms = t[k].ms;
        if (ms < now - 120000) continue;
        // Advanced pre: global minutes, optional different Fajr minutes, per-prayer toggle
        let preMin = S.pre || 0;
        if (k === 'fajr' && S.preFajr != null && S.preFajr !== '') preMin = parseInt(S.preFajr, 10) || 0;
        const preOn = preMin > 0 && (preEn[k] !== false);
        if (preOn && ms - preMin * 60000 > now)
          out.push({ t: ms - preMin * 60000, type: 'pre', key: k, name: SHORT[k], min: preMin });
        out.push({ t: ms, type: 'azan', key: k, name: SHORT[k] });
      }
    }
    return out;
  }
  function muezzin() { return S.muezzins.find(m => m.id === S.muezzinId) || S.muezzins[0]; }
  function schedule() {
    if (!Native.available()) return;
    const p = place();
    const tms = timesFor(dayStart(p, 0), p);
    const d = dates(p);
    const today = {};
    PRAYERS.forEach(([k]) => { today[k] = hm(tms[k].min); });
    if (tms.imsak) today.imsak = hm(tms.imsak.min);
    const occ = (typeof CONTENT !== 'undefined' && CONTENT.occFor) ? CONTENT.occFor(d.shamsiMD, d.lunarMD) : [];
    Native.schedule(buildEvents(), {
      path: muezzin().path || '',
      volume: S.volume,
      city: p.name,
      today: today,
      method: S.method || 'tehran',
      vibrate: !!S.vibrateAzan,
      shamsi: d.shamsi,
      qamari: d.qamari,
      shamsiMD: d.shamsiMD,
      lunarMD: d.lunarMD,
      occasions: occ.map(o => o.text).slice(0, 3),
      smartNotif: S.smartNotif !== false,
      quietHours: !!S.quietHours,
      quietStart: S.quietStart || 23,
      quietEnd: S.quietEnd || 5,
      ramadanHint: !!(S.ramadanMode && S.ramadanHint !== false),
      vibratePre: S.vibratePre !== false
    });
  }

  /* ---------- UI helpers ---------- */
  const app = document.getElementById('app');
  const nav = document.getElementById('nav');
  let page = 'home', lastDay = '';
  const NAV = [['home', ic('home'), 'خانه'], ['times', ic('clock'), 'اوقات'], ['qibla', ic('compass'), 'قبله'], ['calendar', ic('cal'), 'تقویم'], ['tools', ic('grid'), 'ابزارها']];
  const SUB = { city: 'انتخاب شهر', azan: 'تنظیمات اذان', muezzin: 'مؤذن و فایل صوتی', notif: 'اعلان‌ها', about: 'درباره برنامه', method: 'روش محاسبه', qibla: 'قبله‌نما', display: 'نمایش و حالت', backup: 'پشتیبان‌گیری', privacy: 'حریم خصوصی', tools: 'ابزارها', dhikr: 'ذکرشمار', rakat: 'رکعت‌شمار', qada: 'نماز و روزه قضا', convert: 'تبدیل تاریخ', duas: 'ادعیه و اذکار', names: 'اسماء الحسنی', wudu: 'وضو و نماز', week: 'اوقات هفته', faq: 'راهنما', compare: 'مقایسه روش‌ها', calendar: 'تقویم' };

  /* ---------- navigation: every screen is a history entry, so the phone's Back button returns to the previous menu ---------- */
  const TOP = ['times', 'qibla', 'calendar', 'tools', 'settings'];
  let stack = ['home'];
  function show(pg) {
    if (page === 'qibla' && pg !== 'qibla') stopQiblaCompass();
    page = pg; cal.first = null; render(); window.scrollTo(0, 0); syncAwake(pg);
    if (app.classList) { app.classList.remove('enter'); void app.offsetWidth; app.classList.add('enter'); }
  }
  /* screen stays on only in the tasbih / rak'at pages (never while the azan screen manages it itself) */
  let pageAwake = false;
  function syncAwake(pg) {
    const want = (pg === 'dhikr' && S.dhikrAwake !== false) || pg === 'rakat';
    if (want === pageAwake) return;
    pageAwake = want;
    if (!want && typeof ov !== 'undefined' && !ov.hidden) return;
    Native.keepAwake(want);
  }
  function go(pg) {
    if (pg === page) return show(pg);
    const k = stack.lastIndexOf(pg);
    if (k >= 0) { history.go(k - (stack.length - 1)); return; }          // already open below: step back to it
    if (stack.length === 2 && TOP.includes(stack[1]) && TOP.includes(pg)) { // switching between main tabs
      stack[1] = pg; try { history.replaceState({ i: 1 }, ''); } catch (e) {}
      return show(pg);
    }
    stack.push(pg); try { history.pushState({ i: stack.length - 1 }, ''); } catch (e) {}
    show(pg);
  }
  function goRoot(pg) { stack = [pg]; try { history.replaceState({ i: 0 }, ''); } catch (e) {} show(pg); }
  function goBack(fb) { if (stack.length > 1) history.back(); else go(fb || 'home'); }
  window.go = go; window.goBack = goBack;
  // Called by MainActivity for the physical/system Back button.
  // At the root screen it deliberately does nothing instead of exiting.
  window.handleAndroidBack = function () {
    if (!ov.hidden) { closeAzan(); return true; }
    if (stack.length > 1) { goBack(); return true; }
    if (page !== 'home' && page !== 'setup') { goRoot('home'); return true; }
    return true;
  };

  function header(title, back) {
    return '<header class="top">' +
      (back ? '<button class="back" onclick="goBack(\'' + back + '\')">' + ic('back') + ' بازگشت</button>' : '') +
      '<h1>' + title + '</h1>' +
      (back ? '' : '<button class="ibtn" onclick="go(\'settings\')" aria-label="تنظیمات">' + ic('gear') + '</button>') +
      '</header>';
  }
  function toggle(id, on, attr) {
    return '<button class="sw' + (on ? ' on' : '') + '" role="switch" aria-checked="' + !!on + '" data-' + (attr || 'sw') + '="' + id + '"><span></span></button>';
  }

  /* ---------- calendar: month grid with Shamsi (big), Gregorian + Hijri (small) and occasions ---------- */
  const SH_M = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
  const WK = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
  const DAYMS = 86400000;
  const _fP = new Intl.DateTimeFormat('en-US-u-ca-persian', { timeZone: 'UTC', year: 'numeric', month: 'numeric', day: 'numeric' });
  const _fH = new Intl.DateTimeFormat('en-US-u-ca-islamic-civil', { timeZone: 'UTC', year: 'numeric', month: 'numeric', day: 'numeric' });
  const parts = (f, ms) => { const o = {}; f.formatToParts(new Date(ms)).forEach(x => { if (x.type === 'year' || x.type === 'month' || x.type === 'day') o[x.type] = parseInt(x.value, 10); }); return o; };
  const occOf = (sp, hp) => (typeof CONTENT !== 'undefined' && CONTENT.occFor) ? CONTENT.occFor(sp.month + '/' + sp.day, hp.month + '/' + hp.day) : [];
  const cal = { first: null, sel: null };
  const calToday = () => { const c = cityNow(place().tz); return Date.UTC(c.getUTCFullYear(), c.getUTCMonth(), c.getUTCDate(), 12); };
  const monthFirst = ms => ms - (parts(_fP, ms).day - 1) * DAYMS;
  function calMonth(n) {
    const t = calToday();
    cal.first = n > 0 ? monthFirst(cal.first + 31 * DAYMS) : monthFirst(cal.first - DAYMS);
    cal.sel = (monthFirst(t) === cal.first) ? t : cal.first;
  }
  function calHtml() {
    const today = calToday(), off = (S.hijriOffset || 0) * DAYMS;
    if (cal.first == null) { cal.first = monthFirst(today); cal.sel = today; }
    const first = cal.first, len = Math.round((monthFirst(first + 31 * DAYMS) - first) / DAYMS), last = first + (len - 1) * DAYMS;
    const sp0 = parts(_fP, first), lead = (new Date(first).getUTCDay() + 1) % 7;
    const rng = (loc, o, a, b) => { const f = new Intl.DateTimeFormat(loc, Object.assign({ timeZone: 'UTC' }, o)), x = f.format(new Date(a)), y = f.format(new Date(b)); return x === y ? x : x + ' – ' + y; };
    const hSub = rng('fa-IR-u-ca-islamic-civil', { month: 'long', year: 'numeric' }, first + off, last + off);
    const gSub = rng('en-GB', { month: 'short', year: 'numeric' }, first, last);
    let cells = '';
    for (let i = 0; i < lead; i++) cells += '<span class="cday blank"></span>';
    for (let i = 0; i < len; i++) {
      const ms = first + i * DAYMS, hp = parts(_fH, ms + off), wd = new Date(ms).getUTCDay();
      const oc = occOf({ month: sp0.month, day: i + 1 }, hp);
      const isHol = oc.some(o => o.holiday);
      const isFri = wd === 5;
      cells += '<button class="cday' + (isFri ? ' fri' : '') + (oc.length ? ' occ' : '') + (isHol ? ' hol' : '') + (ms === today ? ' today' : '') + (ms === cal.sel ? ' sel' : '') + '" data-cal-day="' + ms + '">' +
        '<b>' + fa(i + 1) + '</b><small><span>' + new Date(ms).getUTCDate() + '</span><span>' + fa(hp.day) + '</span></small></button>';
    }
    const sel = cal.sel, sp = parts(_fP, sel), hs = parts(_fH, sel + off), oc = occOf(sp, hs);
    const a = _cvFormatAll(new Date(sel)), q = _cvFormatAll(new Date(sel + off)).qamari;
    return '<div class="cal-h"><button class="cal-nav" data-cal-nav="-1" aria-label="ماه قبل">' + ic('back') + '</button>' +
      '<div class="t"><b>' + SH_M[sp0.month - 1] + ' ' + fa(sp0.year) + '</b><small>' + esc(hSub) + ' · <span dir="ltr">' + esc(gSub) + '</span></small></div>' +
      '<button class="cal-nav" data-cal-nav="1" aria-label="ماه بعد">' + ic('chev') + '</button></div>' +
      '<div class="cal-g">' + WK.map((w, i) => '<span class="cal-w' + (i === 6 ? ' fri' : '') + '">' + w + '</span>').join('') + cells + '</div>' +
      '<p class="hint cal-leg">اعداد کوچک: میلادی · قمری · <span class="leg-hol">تعطیل</span> · <span class="leg-fri">جمعه</span></p>' +
      '<div class="cal-d"><b>' + esc(a.shamsi) + '</b><div>' + esc(q) + '</div><div dir="ltr" style="text-align:right">' + esc(a.gregEn) + '</div>' +
      (oc.length ? '<div>' + oc.map(o => '<span class="chip' + (o.holiday ? ' chip-hol' : '') + '">' + (o.holiday ? 'تعطیل · ' : '') + esc(o.text) + '</span>').join('') + '</div>' : '') + '</div>' +
      ((monthFirst(today) !== first || sel !== today) ? '<button class="btn alt wide" data-cal-today="1" style="margin-top:10px">برگشت به امروز</button>' : '');
  }
  function refreshCal() { const h = document.getElementById('calHost'); if (h) h.innerHTML = calHtml(); }
  function renderCalendar() {
    app.innerHTML = header('تقویم') + '<section class="card cal" id="calHost">' + calHtml() + '</section>' +
      '<button class="btn alt wide" onclick="go(\'convert\')">' + ic('cal') + ' تبدیل تاریخ</button>';
  }

  /* ---------- pages ---------- */
  function renderHome() {
    const p = place(), d = dates(p), tms = timesFor(dayStart(p, 0), p), nx = nextPrayer(p), now = Date.now();
    const occ = (typeof CONTENT !== 'undefined' && CONTENT.occFor) ? CONTENT.occFor(d.shamsiMD, d.lunarMD) : [];
    const occHtml = occ.length ? '<div class="chip-row">' + occ.map(o => '<span class="chip">' + esc(o.text) + '</span>').join('') + '</div>' : '';
    let ramadan = '';
    if (S.ramadanMode && tms.imsak && tms.maghrib) {
      let focus = null;
      if (now < tms.imsak.ms) focus = { label: 'تا امساک', ms: tms.imsak.ms };
      else if (now < tms.maghrib.ms) focus = { label: 'تا افطار', ms: tms.maghrib.ms };
      if (focus) {
        const s = Math.max(0, Math.floor((focus.ms - now) / 1000));
        ramadan = '<section class="card ramadan"><div class="lbl">' + focus.label + '</div>' +
          '<div class="ramadan-cd" id="ramCd">' + fa(p2(Math.floor(s / 3600)) + ':' + p2(Math.floor(s % 3600 / 60)) + ':' + p2(s % 60)) + '</div></section>';
      }
    }
    const streak = (S.streak && S.streak.days) ? S.streak.days : 0;
    const extra = [];
    if (S.showImsak && tms.imsak) extra.push(['امساک', tms.imsak.min]);
    if (S.showMidnight && tms.midnight) extra.push(['نیمه‌شب شرعی', tms.midnight.min]);
    ensurePrayedDay();
    const pc = prayedCount();
    const rows = PRAYERS.map(([k]) => {
      const done = isPrayed(k);
      const cls = (nx && nx.key === k ? ' on' : (tms[k].ms <= now ? ' past' : '')) + (done ? ' done' : '');
      const check = AZAN.includes(k) ? '<button class="pray-check' + (done ? ' on' : '') + '" data-pray="' + k + '" aria-label="علامت نماز">' + (done ? '✓' : '○') + '</button>' : '';
      return '<div class="trow' + cls + '"><i>' + ICON[k] + '</i><span>' + SHORT[k] + '</span>' + check + '<b>' + hm(tms[k].min) + '</b></div>';
    }).join('') + extra.map(([n, min]) => '<div class="trow dim"><span>' + n + '</span><b>' + hm(min) + '</b></div>').join('');
    const goalHtml = S.dailyGoal !== false ? '<div class="goal-bar"><span>امروز ' + fa(pc) + ' از ۵ نماز</span><div class="goal-track"><div class="goal-fill" style="width:' + (pc*20) + '%"></div></div></div>' : '';
    const q = (id, icn, t, main) => '<button class="qbtn' + (main ? ' main' : '') + '"' + (id === 'namazMode' ? ' id="namazMode"' : ' onclick="go(\'' + id + '\')"') + '><i>' + icn + '</i><span>' + t + '</span></button>';
    app.innerHTML =
      '<header class="hbar">' +
        '<button class="city-pill" onclick="go(\'city\')">' + ic('pin') + '<b>' + esc(p.name) + '</b></button>' +
        '<div id="clock" class="bar-clock">--:--</div>' +
        '<button class="ibtn" onclick="go(\'settings\')" aria-label="تنظیمات">' + ic('gear') + '</button>' +
      '</header>' +
      '<div class="date-line"><span>' + esc(d.shamsi) + '</span><span class="sep">·</span><span>' + esc(d.qamari) + '</span></div>' +
      occHtml + ramadan +
      '<section class="hero2">' +
        '<div><div class="focus-label">اذان بعدی</div><div class="focus-name" id="nxName">' + (nx ? SHORT[nx.key] : '—') + '</div>' +
        (streak ? '<div class="focus-streak">پیوستگی ' + fa(streak) + ' روز</div>' : '') + '</div>' +
        '<div id="cd" class="focus-cd">--:--:--</div>' +
        (S.showProgress !== false ? '<div class="prog-wrap"><div class="prog-bar" id="progBar"></div><div class="prog-lbl" id="progLbl"></div></div>' : '') +
      '</section>' +
      '<div class="qrow">' + q('namazMode', ic('check'), 'نماز', true) + q('dhikr', ic('moon'), 'ذکر') + q('duas', ic('mic'), 'ادعیه') + q('week', ic('clock'), 'اوقات هفته') + '</div>' +
      goalHtml +
      '<h2>اوقات امروز</h2><section class="tlist">' + rows + '</section>' +
      '<div class="quick home-actions"><button class="btn alt" id="copyTimes">کپی اوقات</button><button class="btn alt" id="shareTimesHome">اشتراک</button></div>' +
      '<h2>تقویم</h2><section class="card cal" id="calHost">' + calHtml() + '</section>';
    tick();
    // bind prayer checks
    app.querySelectorAll('[data-pray]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const k = btn.getAttribute('data-pray');
        const on = togglePrayed(k);
        btn.classList.toggle('on', on);
        btn.textContent = on ? '✓' : '○';
        const row = btn.closest('.trow');
        if (row) row.classList.toggle('done', on);
        const fill = document.querySelector('.goal-fill');
        const label = document.querySelector('.goal-bar span');
        if (fill) fill.style.width = (prayedCount()*20) + '%';
        if (label) label.textContent = 'امروز ' + fa(prayedCount()) + ' از ۵ نماز';
      });
    });
    const ct = document.getElementById('copyTimes');
    if (ct) ct.onclick = () => copyToClipboard(shareTextTimes()).then(ok => { if (ok) { ct.textContent = 'کپی شد ✓'; setTimeout(() => ct.textContent = 'کپی اوقات', 1500); } });
    const sh = document.getElementById('shareTimesHome');
    if (sh) sh.onclick = () => {
      const text = shareTextTimes();
      if (navigator.share) navigator.share({ text }).catch(() => copyToClipboard(text));
      else copyToClipboard(text).then(() => { sh.textContent = 'کپی شد'; setTimeout(() => sh.textContent = 'اشتراک', 1500); });
    };
  }
  function renderTimes() {
    const p = place(), t = timesFor(dayStart(p, 0), p), t2 = timesFor(dayStart(p, 1), p);
    const mName = METHOD_LABELS[S.method] || METHOD_LABELS.tehran;
    app.innerHTML = header('اوقات شرعی امروز') +
      '<p class="hint">شهر: ' + esc(p.name) + ' · روش: ' + esc(mName) + '</p><section class="list big">' +
      PRAYERS.map(([k, n]) => '<div class="row"><span><i>' + ICON[k] + '</i>' + n + '</span><b>' + hm(t[k].min) + '</b></div>').join('') +
      (t.imsak ? '<div class="row dim"><span>امساک (روزه)</span><b>' + hm(t.imsak.min) + '</b></div>' : '') +
      (t.midnight ? '<div class="row dim"><span>نیمه‌شب شرعی</span><b>' + hm(t.midnight.min) + '</b></div>' : '') +
      '</section>' +
      '<div class="quick"><button class="btn alt" id="shareTimes">اشتراک‌گذاری اوقات امروز</button></div>' +
      '<h2>فردا</h2><section class="list">' +
      PRAYERS.map(([k, n]) => '<div class="row dim"><span><i>' + ICON[k] + '</i>' + n + '</span><b>' + hm(t2[k].min) + '</b></div>').join('') + '</section>';
  }
  function renderSettings() {
    const G = [
      ['اذان و اعلان', [
        ['azan', 'bell', 'تنظیمات اذان', 'فعال‌سازی و اصلاح دقیقه'],
        ['muezzin', 'mic', 'مؤذن و صدا', 'فایل صوتی اذان'],
        ['notif', 'sound', 'اعلان‌ها', 'مجوز و باتری']]],
      ['موقعیت و محاسبه', [
        ['city', 'pin', 'شهر و موقعیت', place().name],
        ['method', 'clock', 'روش محاسبه', METHOD_LABELS[S.method] || 'تهران']]],
      ['ظاهر', [
        ['display', 'text', 'نمایش و حالت', 'فونت، کنتراست، تم']]],
      ['اطلاعات', [
        ['backup', 'save', 'پشتیبان‌گیری', 'خروجی و بازیابی'],
        ['privacy', 'shield', 'حریم خصوصی', 'بدون ارسال داده'],
        ['about', 'info', 'درباره برنامه', 'معرفی و راهنما']]]
    ];
    app.innerHTML = header('تنظیمات', 'home') + G.map(([t, rows]) =>
      '<div class="sgroup-t">' + t + '</div><section class="sgroup">' +
      rows.map(([id, icn, title, sub]) =>
        '<button class="srow" onclick="go(\'' + id + '\')"><span class="sic">' + ic(icn) + '</span>' +
        '<span class="st"><b>' + title + '</b><small>' + esc(sub) + '</small></span><span class="gt">' + ic('chev') + '</span></button>'
      ).join('') + '</section>'
    ).join('');
  }
  function renderCity() {
    const favs = S.favCities || [];
    const provs = Array.from(new Set(CITIES.map(c => c.prov))).sort((a,b) => a.localeCompare(b, 'fa'));
    const list = CITIES.slice().sort((p, q) => p.name.localeCompare(q.name, 'fa'));
    app.innerHTML = header('انتخاب شهر', 'settings') +
      '<p class="hint">فقط شهرهای ایران. می‌توانید بر اساس استان فیلتر کنید یا به علاقه‌مندی‌ها اضافه کنید.</p>' +
      (favs.length ? '<div class="section-label">علاقه‌مندی‌ها</div><div class="fav-row">' +
        favs.map(id => {
          const c = CITIES.find(x => x.id === id);
          if (!c) return '';
          return '<button class="chip' + (!S.custom && S.cityId === id ? ' on' : '') + '" data-city="' + id + '">' + esc(c.name) + '</button>';
        }).join('') + '</div>' : '') +
      '<section class="form"><label>فیلتر استان<select id="provFilter"><option value="">همه استان‌ها</option>' +
      provs.map(pr => '<option value="' + esc(pr) + '">' + esc(pr) + '</option>').join('') +
      '</select></label>' +
      '<input id="cSearch" type="search" placeholder="جستجوی شهر یا استان" autocomplete="off"></section>' +
      '<section class="menu menu-modern" id="cList">' +
      list.map(x =>
        '<div class="mi city' + (!S.custom && S.cityId === x.id ? ' sel' : '') + '" data-city="' + x.id + '" data-search="' + x.name + ' ' + x.prov + '" data-prov="' + x.prov + '">' +
        '<button class="mi-main" data-city="' + x.id + '"><span><b>' + esc(x.name) + '</b><small>استان ' + esc(x.prov) + '</small></span></button>' +
        '<button class="fav-btn' + (favs.indexOf(x.id) >= 0 ? ' on' : '') + '" data-fav="' + x.id + '" aria-label="علاقه">★</button>' +
        '</div>'
      ).join('') + '</section>' +
      '<h2 class="section-label">موقعیت دستی / GPS</h2>' +
      '<section class="form">' +
      '<label>نام<input id="cName" value="' + esc((S.custom && S.custom.name) || '') + '" placeholder="مثلاً محله من"></label>' +
      '<div class="actions"><label>عرض<input id="cLat" dir="ltr" inputmode="decimal" value="' + ((S.custom && S.custom.lat) || '') + '"></label>' +
      '<label>طول<input id="cLng" dir="ltr" inputmode="decimal" value="' + ((S.custom && S.custom.lng) || '') + '"></label></div>' +
      '<label>منطقه زمانی (ساعت از UTC)<input id="cTz" dir="ltr" inputmode="decimal" value="' + ((S.custom && S.custom.tz) != null ? S.custom.tz : 3.5) + '"></label>' +
      '<button class="btn" id="cSave">ذخیره موقعیت دستی</button>' +
      '<button class="btn alt" id="cGps">موقعیت فعلی (GPS)</button>' +
      '<div id="cMsg" class="hint"></div><div id="gpsMsg" class="hint"></div></section>';
  }
  function renderAzan() {
    app.innerHTML = header('تنظیمات اذان', 'settings') +
      '<section class="menu">' + AZAN.map(k => '<div class="mi"><span><b>' + NAME[k] + '</b><small>پخش خودکار</small></span>' + toggle(k, S.enabled[k]) + '</div>').join('') + '</section>' +
      '<section class="menu"><div class="mi"><span><b>ویبره هنگام شروع اذان</b><small>یک لرزش ملایم همراه با اذان</small></span><button class="sw' + (S.vibrateAzan ? ' on' : '') + '" data-vibazan="1"></button></div></section>' +
      '<section class="form"><label>میزان صدا: <b id="volV">' + fa(Math.round(S.volume * 100)) + '٪</b><input id="vol" type="range" min="10" max="100" value="' + Math.round(S.volume * 100) + '"></label>' +
      '<button class="btn" id="tPlay">' + ic('play') + ' آزمایش صدای اذان</button><button class="btn alt" id="tStop">' + ic('stop') + ' توقف صدا</button><div id="aMsg" class="hint"></div></section>' +
      '<h2>اصلاح دقیقه اوقات</h2><p class="hint">اگر اوقات شهر شما با تقویم رسمی چند دقیقه فرق داشت، همین‌جا هر وقت را کم یا زیاد کنید. اذان و شمارش معکوس هم با همین اصلاح انجام می‌شود.</p><section class="list">' +
      PRAYERS.map(([k, n]) => { const o = S.offsets[k] || 0; return '<div class="row"><span>' + n + '</span><span class="stp"><button class="stb" data-off="' + k + ':-1" aria-label="کم کردن">' + ic('minus') + '</button><b>' + (o > 0 ? '+' : '') + fa(o) + '</b><button class="stb" data-off="' + k + ':1" aria-label="زیاد کردن">' + ic('plus') + '</button></span></div>'; }).join('') + '</section>';
  }
  function renderMuezzin() {
    app.innerHTML = header('مؤذن و فایل صوتی', 'settings') +
      '<p class="hint">اذان پیش‌فرض داخل برنامه است و بدون اینترنت پخش می‌شود. اگر مؤذن دیگری می‌خواهید، فایل صوتی آن را با دکمه «انتخاب فایل» وارد کنید.</p>' +
      S.muezzins.map(m => '<section class="card' + (m.id === S.muezzinId ? ' sel' : '') + '"><h3>' + esc(m.name) + (m.id === S.muezzinId ? ' <small class="badge">انتخاب‌شده</small>' : '') + '</h3><div class="hint">' + (m.path ? 'فایل: ' + esc(m.file || 'انتخاب شده') : 'اذان پیش‌فرض داخل برنامه') + '</div>' +
        '<div class="btns"><button class="btn" data-use="' + m.id + '">استفاده</button><button class="btn alt" data-pick="' + m.id + '">انتخاب فایل</button><button class="btn alt" data-try="' + m.id + '">آزمایش</button>' + (m.path ? '<button class="btn alt" data-clear="' + m.id + '">حذف فایل</button>' : '') +
        (m.id !== 'afasy' ? '<button class="btn danger" data-del="' + m.id + '">حذف</button>' : '') + '</div></section>').join('') +
      '<button class="btn wide" id="mAdd">' + ic('plus') + ' افزودن مؤذن دلخواه</button><button class="btn alt wide" id="mStop">' + ic('stop') + ' توقف صدا</button><div id="mMsg" class="hint"></div>';
  }
  function renderNotif() {
    const preEn = S.preEnabled || {};
    const preFajrVal = (S.preFajr == null || S.preFajr === '') ? '' : String(S.preFajr);
    app.innerHTML = header('اعلان‌ها', 'settings') +
      '<h2>یادآوری قبل از اذان</h2>' +
      '<section class="form"><label>زمان پیش‌فرض<select id="pre">' +
      [0, 5, 10, 15, 20, 30, 45, 60].map(v => '<option value="' + v + '"' + (S.pre === v ? ' selected' : '') + '>' + (v ? fa(v) + ' دقیقه قبل' : 'خاموش') + '</option>').join('') + '</select></label>' +
      '<label>فقط برای اذان صبح (اختیاری)<select id="preFajr">' +
      '<option value=""' + (preFajrVal === '' ? ' selected' : '') + '>همان پیش‌فرض</option>' +
      [5, 10, 15, 20, 30, 45, 60].map(v => '<option value="' + v + '"' + (preFajrVal === String(v) ? ' selected' : '') + '>' + fa(v) + ' دقیقه قبل</option>').join('') +
      '</select></label></section>' +
      '<h2>یادآوری برای هر وقت</h2><section class="menu">' +
      AZAN.map(k => '<div class="mi"><span><b>' + NAME[k] + '</b><small>یادآوری قبل از این اذان</small></span><button class="sw' + (preEn[k] !== false ? ' on' : '') + '" data-preen="' + k + '"></button></div>').join('') +
      '</section>' +
      '<h2>اعلان هوشمند</h2><section class="menu">' +
        '<div class="mi"><span><b>اعلان هوشمند</b><small>شهر، ساعت اذان و متن مناسب هر وقت</small></span><button class="sw' + (S.smartNotif !== false ? ' on' : '') + '" data-smartn="1"></button></div>' +
        '<div class="mi"><span><b>ویبره یادآوری</b><small>لرزش هنگام اعلان قبل از اذان</small></span><button class="sw' + (S.vibratePre !== false ? ' on' : '') + '" data-vibpre="1"></button></div>' +
        '<div class="mi"><span><b>ساعات سکوت شب</b><small>یادآوری غیرصبح در شب قطع شود</small></span><button class="sw' + (S.quietHours ? ' on' : '') + '" data-quiet="1"></button></div>' +
        '<div class="mi"><span><b>راهنمای رمضان</b><small>متن اضافه برای مغرب</small></span><button class="sw' + (S.ramadanHint !== false ? ' on' : '') + '" data-ramhint="1"></button></div>' +
      '</section>' +
      (S.quietHours ? '<section class="form"><label>شروع سکوت<select id="qStart">' +
        Array.from({length:24},(_,h)=>'<option value="'+h+'"'+((S.quietStart||23)===h?' selected':'')+'>'+fa(h)+'</option>').join('') +
        '</select></label><label>پایان سکوت<select id="qEnd">' +
        Array.from({length:24},(_,h)=>'<option value="'+h+'"'+((S.quietEnd||5)===h?' selected':'')+'>'+fa(h)+'</option>').join('') +
        '</select></label></section>' : '') +
      '<h2>مجوزها و باتری</h2><section class="form">' +
      '<div id="st" class="hint">در حال بررسی وضعیت…</div>' +
      '<button class="btn" id="nAsk">اجازه نمایش اعلان</button><button class="btn" id="nBat">خارج کردن از محدودیت باتری</button><button class="btn alt" id="nApp">تنظیمات برنامه در اندروید</button></section>' +
      '<p class="hint">اعلان هوشمند متن کامل‌تری نشان می‌دهد. ساعات سکوت فقط یادآوری قبل از اذان را محدود می‌کند؛ خودِ اذان همیشه پخش می‌شود. برای هر وقت می‌توانید یادآوری را جدا خاموش کنید.</p>' +
      '<p class="hint">در سامسونگ، شیائومی، هواوی و اوپو گزینه «شروع خودکار» و «بدون محدودیت باتری» را فعال کنید.</p>';
    Native.status().then(s => {
      const el = document.getElementById('st'); if (!el) return;
      if (!s) { el.textContent = 'این صفحه فقط روی گوشی وضعیت را نشان می‌دهد.'; return; }
      el.innerHTML = 'اعلان: <b>' + (s.notifications ? 'فعال' : 'غیرفعال') + '</b><br>بدون محدودیت باتری: <b>' + (s.ignoringBattery ? 'بله' : 'خیر') + '</b>' +
        (s.fullScreen === undefined ? '' : '<br>نمایش اذان روی صفحه قفل: <b>' + (s.fullScreen ? 'مجاز' : 'غیرمجاز') + '</b>' + (s.fullScreen ? '' : '<br><button class="btn" id="nFs" style="margin-top:8px">اجازه نمایش روی صفحه قفل</button>'));
    });
  }
  function renderAbout() {
    app.innerHTML = header('درباره برنامه', 'settings') +
      '<section class="card"><h3>افق شرعی</h3>' +
      '' +
      '<p>افق شرعی یک برنامه کاملاً فارسی و راست‌چین برای نمایش اوقات شرعی، پخش اذان، قبله‌نما و ابزارهای عبادی است. رابط کاربری بزرگ، ساده و مناسب سالمندان طراحی شده تا همه بتوانند به راحتی از آن استفاده کنند.</p>' +
      '<p>روش پیش‌فرض محاسبه اوقات، <b>مؤسسه ژئوفیزیک دانشگاه تهران</b> است که برای شهرهای ایران دقیق‌ترین نتیجه را می‌دهد. در تنظیمات می‌توانید روش‌های دیگر (MWL، ISNA، مصر، کراچی، ام‌القرى، جعفری و …) را انتخاب کنید.</p>' +
      '<p class="hint">اوقات محاسبه‌شده را حتماً با تقویم رسمی یا اعلام محلی شهر خود مقایسه کنید. اختلاف ۱ تا ۳ دقیقه‌ای به‌خاطر ارتفاع، افق و روش محاسبه کاملاً طبیعی است. از بخش «اصلاح دقیقه» در تنظیمات اذان می‌توانید هر وقت را جداگانه جلو یا عقب ببرید.</p>' +
      '<p>قابلیت‌های اصلی برنامه:</p>' +
      '<ul class="hint" style="padding-right:18px;margin:8px 0">' +
      '<li>اوقات شرعی روزانه + امساک و نیمه‌شب شرعی</li>' +
      '<li>پخش اذان با امکان انتخاب مؤذن و فایل صوتی دلخواه</li>' +
      '<li>قبله‌نمای زنده با حسگر جهت‌یابی</li>' +
      '<li>تقویم هم‌زمان شمسی، قمری و میلادی همراه مناسبت‌ها</li>' +
      '<li>ذکرشمار، رکعت‌شمار، ثبت نماز و روزه قضا</li>' +
      '<li>اذکار صبح و شام، دعاهای کوتاه و اسماء الحسنی</li>' +
      '<li>ویجت صفحه اصلی، پشتیبان‌گیری و حالت رمضان</li>' +
      '</ul>' +
      '<p class="hint">برنامه کاملاً آفلاین کار می‌کند و هیچ داده‌ای به سرور ارسال نمی‌شود. همه تنظیمات و اطلاعات فقط روی گوشی شما ذخیره می‌گردند.</p>' +
      '<div class="form"><label>اصلاح تاریخ قمری (اگر یک روز عقب/جلو است)<select id="hj">' + [-3,-2,-1,0,1,2,3].map(v => '<option value="' + v + '"' + ((S.hijriOffset != null ? S.hijriOffset : 1) === v ? ' selected' : '') + '>' + (v > 0 ? '+' : '') + fa(v) + ' روز' + (v === 1 ? ' (پیشنهادی)' : '') + '</option>').join('') + '</select></label><p class="hint">تقویم قمری جدولی گاهی یک روز با اعلام رسمی فرق دارد. پیش‌فرض +۱ روز است.</p></div></section>' +
      '<section class="card"><h3>هشدار — نسخه رسمی</h3>' +
      '<p class="hint">فقط نسخه رسمی افق شرعی را از استورهای رسمی <b>کافه بازار</b> و <b>مایکت</b> نصب کنید. نسخه‌های غیررسمی ممکن است ویروسی یا دستکاری‌شده باشند و <b>تیم برنامه‌نویسی B-Z هیچ مسئولیتی در قبال نسخه‌های غیررسمی و ویروسی نمی‌پذیرد</b>.</p></section>' +
      '<section class="card"><h3>ما را دنبال کنید</h3>' +
      '<p class="hint" style="margin:0 0 10px">با دنبال کردن صفحهٔ ما در گیت‌هاب، از نسخه‌های جدید زودتر باخبر می‌شوید و با ستاره‌دادن به پروژه، به بهتر شدن افق شرعی کمک می‌کنید.</p>' +
      '<button class="btn wide" id="ghOpen" type="button">⭐ دنبال کردن در گیت‌هاب</button></section>' +
      '<p class="hint" style="text-align:center;margin-top:12px">تمام داده‌ها فقط روی دستگاه شما ذخیره می‌شوند. · ساخته‌شده با عشق برای کاربران فارسی‌زبان</p>';
  }
  function renderMethod() {
    app.innerHTML = header('روش محاسبه اوقات', 'settings') +
      '<p class="hint">روش پیش‌فرض برای ایران، مؤسسه ژئوفیزیک دانشگاه تهران است. برای شهرهای خارج از ایران یا ترجیح شخصی، روش دیگری انتخاب کنید.</p><section class="menu">' +
      Object.keys(METHOD_LABELS).map(id => '<button class="mi' + (S.method === id ? ' sel' : '') + '" data-method="' + id + '"><span><b>' + METHOD_LABELS[id] + '</b></span><em>' + (S.method === id ? ic('check') : '') + '</em></button>').join('') +
      '</section>';
  }
  /* ---------- live Qibla compass (device orientation) ---------- */
  let qiblaHeading = 0, qiblaListener = null, qiblaBearing = 0, qiblaSmooth = 0;
  function stopQiblaCompass() {
    if (qiblaListener) {
      window.removeEventListener('deviceorientationabsolute', qiblaListener);
      window.removeEventListener('deviceorientation', qiblaListener);
      qiblaListener = null;
    }
  }
  function startQiblaCompass(bearing) {
    stopQiblaCompass();
    // bearing is true-north qibla; convert for magnetic compass if enabled
    const p = place();
    let target = bearing;
    if (S.useMagDecl !== false && PT.qiblaMagnetic) {
      target = PT.qiblaMagnetic(p.lat, p.lng);
    }
    target = (target + (S.qiblaOffset || 0) + 360) % 360;
    qiblaBearing = target;
    qiblaSmooth = 0;
    let lastVib = 0;
    const onOrient = (e) => {
      let heading = null;
      // Prefer absolute / compass heading
      if (typeof e.webkitCompassHeading === 'number' && !isNaN(e.webkitCompassHeading)) {
        heading = e.webkitCompassHeading;
      } else if (e.absolute === true && typeof e.alpha === 'number' && !isNaN(e.alpha)) {
        heading = (360 - e.alpha) % 360;
      } else if (typeof e.alpha === 'number' && !isNaN(e.alpha)) {
        heading = (360 - e.alpha) % 360;
      }
      if (heading == null) return;
      // Screen orientation compensation (phone rotated in hand / landscape)
      let orient = 0;
      try {
        if (screen.orientation && typeof screen.orientation.angle === 'number') orient = screen.orientation.angle;
        else if (typeof window.orientation === 'number') orient = window.orientation;
      } catch (_) {}
      heading = (heading + orient + 360) % 360;
      // Adaptive smoothing: less lag when almost aligned
      let diff = heading - qiblaSmooth;
      while (diff > 180) diff -= 360;
      while (diff < -180) diff += 360;
      const alpha = Math.abs(diff) < 15 ? 0.45 : 0.22;
      qiblaSmooth = (qiblaSmooth + diff * alpha + 360) % 360;
      qiblaHeading = qiblaSmooth;
      const arrow = document.getElementById('qArrow');
      const status = document.getElementById('qStatus');
      const liveDeg = document.getElementById('qLive');
      if (!arrow) return;
      const rot = (qiblaBearing - qiblaHeading + 360) % 360;
      arrow.style.transform = 'rotate(' + rot + 'deg)';
      const off = Math.min(Math.abs(rot), 360 - Math.abs(rot));
      if (liveDeg) liveDeg.textContent = fa(Math.round(off)) + '°';
      if (status) {
        const aligned = off < 4;
        const beta = typeof e.beta === 'number' ? e.beta : 0;
        const gamma = typeof e.gamma === 'number' ? e.gamma : 0;
        const flat = Math.abs(beta) < 20 && Math.abs(gamma) < 20;
        let msg = aligned ? '✓ رو به قبله هستید' : (off < 15 ? 'نزدیک — کمی بچرخانید' : 'گوشی را بچرخانید تا فلش بالا برود');
        if (!flat) msg += ' · گوشی را افقی نگه دارید';
        status.textContent = msg;
        status.className = 'hint' + (aligned && flat ? ' q-ok' : '');
        const lv = document.getElementById('qLevel');
        if (lv) lv.textContent = flat ? 'تراز افقی ✓' : 'کج — صاف کنید';
        if (aligned && flat && S.vibrateQibla && Date.now() - lastVib > 2500) {
          vib('qibla');
          lastVib = Date.now();
        }
      }
    };
    qiblaListener = onOrient;
    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute', onOrient, true);
    } else {
      window.addEventListener('deviceorientation', onOrient, true);
    }
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().then(state => {
        const el = document.getElementById('qStatus');
        if (state !== 'granted' && el) el.textContent = 'اجازه دسترسی به حسگر جهت لازم است.';
      }).catch(() => {});
    }
  }
  function renderQibla() {
    const p = place();
    const degTrue = PT.qibla(p.lat, p.lng);
    const decl = PT.magneticDeclination ? PT.magneticDeclination(p.lat, p.lng) : 0;
    const degMag = PT.qiblaMagnetic ? PT.qiblaMagnetic(p.lat, p.lng) : ((degTrue - decl) + 360) % 360;
    const dist = PT.qiblaDistance ? PT.qiblaDistance(p.lat, p.lng) : (S.showKaabaDist !== false ? kaabaDistanceKm(p.lat, p.lng) : null);
    const degFa = fa(degTrue.toFixed(1));
    const startBrng = degTrue;
    const basis = S.custom ? 'موقعیت دقیق (GPS)' : 'شهر ' + p.name;
    app.innerHTML = header('قبله‌نما', 'home') +
      '<section class="card qibla-card">' +
      '<div class="qibla-city">' + ic('pin') + esc(p.name) + '</div>' +
      '<div class="qibla-stage"><div class="qibla-arrow" id="qArrow"></div></div>' +
      '<div class="qibla-deg" id="qLive">' + degFa + '°</div>' +
      '<p class="hint" id="qStatus">در حال اتصال به قطب‌نما… گوشی را صاف و افقی نگه دارید</p>' +
      '<p class="hint" id="qLevel">تراز افقی…</p></section>' +
      '<section class="card">' +
      '<div class="row"><span>قبله از شهر ' + esc(p.name) + ' (شمال حقیقی)</span><b>' + degFa + '°</b></div>' +
      '<div class="row"><span>زاویه قطب‌نما (شمال مغناطیسی)</span><b>' + fa(degMag.toFixed(1)) + '°</b></div>' +
      '<div class="row"><span>انحراف مغناطیسی (مدل WMM2025)</span><b>' + fa(Math.abs(decl).toFixed(1)) + '° ' + (decl >= 0 ? 'شرقاً' : 'غرباً') + '</b></div>' +
      (dist != null ? '<div class="row"><span>فاصله تا کعبه</span><b>' + fa(dist) + ' کیلومتر</b></div>' : '') +
      '<div class="row"><span>مبنای محاسبه</span><b>' + esc(basis) + '</b></div>' +
      '<div class="row"><span>مختصات</span><b dir="ltr">' + (Math.round(p.lat * 10000) / 10000) + ', ' + (Math.round(p.lng * 10000) / 10000) + '</b></div></section>' +
      '<section class="form">' +
      '<label>کالیبراسیون دستی (درجه)<select id="qOff">' +
      [-10,-8,-6,-4,-2,0,2,4,6,8,10].map(v =>
        '<option value="' + v + '"' + ((S.qiblaOffset||0) === v ? ' selected' : '') + '>' +
        (v > 0 ? '+' : '') + fa(v) + '°</option>').join('') +
      '</select></label>' +
      '<div class="mi"><span><b>جبران انحراف مغناطیسی</b><small>مدل جهانی WMM2025 — دقیق در همه شهرها</small></span>' +
      '<button class="sw' + (S.useMagDecl !== false ? ' on' : '') + '" data-magdec="1"></button></div>' +
      '</section>' +
      '<p class="hint">زاویه قبله دقیقاً از مختصات شهر شما محاسبه می‌شود؛ برای دقت بیشتر در «تنظیمات ← شهر و موقعیت» می‌توانید موقعیت دقیق GPS را ثبت کنید. فلش همیشه به سمت قبله قفل است. وقتی فلش بالا باشد و پیام سبز شود، رو به قبله‌اید. از فلز و آهنربا دور بمانید و گوشی را یک‌بار به شکل عدد ۸ بچرخانید تا قطب‌نما کالیبره شود.</p>';
    setTimeout(() => startQiblaCompass(startBrng), 50);
  }
  function renderDisplay() {
    const elder = S.uiMode === 'elder';
    const scales = [[0.9, 'کوچک'], [1, 'متوسط'], [1.15, 'بزرگ'], [1.3, 'خیلی بزرگ']];
    app.innerHTML = header('نمایش و حالت', 'settings') +
      '<p class="hint">حالت رابط را انتخاب کنید. حالت سالمندان نوشته‌ها و دکمه‌ها را خیلی بزرگ‌تر می‌کند.</p>' +
      '<div class="mode-pick">' +
        '<button type="button" class="mode-card' + (!elder ? ' on' : '') + '" data-uimode="normal">' +
          '<b>عادی</b><small>ظریف و جمع‌وجور مناسب همه</small></button>' +
        '<button type="button" class="mode-card' + (elder ? ' on' : '') + '" data-uimode="elder">' +
          '<b>سالمندان</b><small>دکمه‌های خیلی بزرگ و خوانا</small></button>' +
      '</div>' +
      (elder ? '' :
      '<section class="form"><label>اندازه نوشته (حالت عادی)<select id="fontScale">' +
      scales.map(([v, n]) => '<option value="' + v + '"' + (S.fontScale === v ? ' selected' : '') + '>' + n + '</option>').join('') +
      '</select></label></section>') +
      '<h2>حالت روشن / تاریک</h2><section class="menu">' +
      [['system','مطابق تم دستگاه'],['dark','تاریک'],['light','روشن']].map(([id,n]) =>
        '<button class="mi' + ((S.themeMode || 'system') === id ? ' sel' : '') + '" data-thememode="' + id + '"><span><b>تم ' + n + '</b></span><em>' + ((S.themeMode || 'system') === id ? ic('check') : '') + '</em></button>').join('') +
      '</section>' +
      '<h2>رنگ تاکید</h2><section class="menu">' +
      [['green','سبز'],['blue','آبی'],['sand','خاکی']].map(([id,n]) =>
        '<button class="mi' + (S.theme === id ? ' sel' : '') + '" data-theme="' + id + '"><span><b>تم ' + n + '</b></span><em>' + (S.theme === id ? ic('check') : '') + '</em></button>').join('') +
      '</section>' +
      '<section class="menu">' +
        '<div class="mi"><span><b>کنتراست بالا</b><small>متن روشن‌تر</small></span><button class="sw' + (S.highContrast ? ' on' : '') + '" data-hc="1"></button></div>' +
        '<div class="mi"><span><b>سیاه خالص (AMOLED)</b><small>صرفه‌جویی باتری</small></span><button class="sw' + (S.amoled ? ' on' : '') + '" data-amoled="1"></button></div>' +
        '<div class="mi"><span><b>کاهش حرکت</b><small>انیمیشن کمتر برای راحتی چشم</small></span><button class="sw' + (S.reduceMotion ? ' on' : '') + '" data-rmotion="1"></button></div>' +
        '<div class="mi"><span><b>خانه فشرده</b><small>فاصله کمتر بین بخش‌ها</small></span><button class="sw' + (S.compactHome ? ' on' : '') + '" data-compact="1"></button></div>' +
        '<div class="mi"><span><b>هدف روزانه نماز</b><small>نوار پیشرفت ۵ نماز</small></span><button class="sw' + (S.dailyGoal !== false ? ' on' : '') + '" data-dgoal="1"></button></div>' +
        '<div class="mi"><span><b>هایلایت جمعه</b><small>ظاهر ویژه روز جمعه</small></span><button class="sw' + (S.highlightFriday !== false ? ' on' : '') + '" data-fri="1"></button></div>' +
        '<div class="mi"><span><b>حالت رمضان</b><small>امساک و افطار برجسته</small></span><button class="sw' + (S.ramadanMode ? ' on' : '') + '" data-ramadan="1"></button></div>' +
        '<div class="mi"><span><b>نمایش امساک</b></span><button class="sw' + (S.showImsak ? ' on' : '') + '" data-imsak="1"></button></div>' +
        '<div class="mi"><span><b>نمایش نیمه‌شب شرعی</b></span><button class="sw' + (S.showMidnight ? ' on' : '') + '" data-midn="1"></button></div>' +
        '<div class="mi"><span><b>تکان برای ذکر</b></span><button class="sw' + (S.shakeDhikr ? ' on' : '') + '" data-shake="1"></button></div>' +
        '<div class="mi"><span><b>ویبره</b><small>ذکرشمار، رکعت‌شمار و قبله‌نما</small></span><button class="sw' + (S.vibrateQibla ? ' on' : '') + '" data-vibsw="1"></button></div>' +
      '</section>';
  }

  function renderBackup() {
    app.innerHTML = header('پشتیبان‌گیری تنظیمات', 'settings') +
      '<p class="hint">می‌توانید تمام تنظیمات (شهر، اذان‌ها، اصلاحات و …) را در یک فایل ذخیره کنید و بعداً بازیابی کنید. فایل صوتی اذان در این پشتیبان نیست.</p>' +
      '<section class="form"><button class="btn" id="bkExport">خروجی تنظیمات (دانلود JSON)</button>' +
      '<button class="btn alt" id="bkImport">بازیابی از فایل</button><input type="file" id="bkFile" accept="application/json,.json" style="display:none">' +
      '<div id="bkMsg" class="hint"></div></section>';
  }
  function renderPrivacy() {
    app.innerHTML = header('حریم خصوصی', 'settings') +
      '<section class="card"><h3>' + ic('shield') + ' سیاست حفظ حریم خصوصی — افق شرعی</h3>' +
      '<p>تمام اطلاعات شخصی شما — شهر، اذان‌های انتخابی، تنظیمات، فایل صوتی، قضاها و ذکرها — <b>صددرصد محلی (لوکال)</b> و فقط در حافظه داخلی همین دستگاه ذخیره می‌شود. هیچ سرور و حساب کاربری وجود ندارد و این داده‌ها هرگز از گوشی شما خارج نمی‌شوند.</p>' +
      '<p>چون داده‌های شما هیچ‌وقت به هیچ سروری نمی‌رود، <b>احتمال هک شدن و افشای اطلاعات شخصی عملاً به صفر می‌رسد</b>. تنها راه دسترسی به داده‌های شما، دسترسی فیزیکی به خود گوشی است.</p>' +
      '<p>موقعیت GPS فقط وقتی خودتان دکمه «موقعیت فعلی» را بزنید خوانده می‌شود و همان لحظه روی دستگاه به نزدیک‌ترین شهر تبدیل می‌شود؛ هرگز ذخیره یا ارسال نمی‌شود.</p>' +
      '<p>اعلان‌ها و سرویس پخش اذان فقط برای عملکرد برنامه لازم هستند و هیچ آمار، آنالیتیکس یا ردیابی از شما جمع‌آوری نمی‌شود.</p>' +
      '<p>فایل‌های صوتی اذان که وارد می‌کنید فقط در حافظه خصوصی برنامه کپی می‌شوند.</p>' +
      '<p>حذف برنامه، پاک شدن کامل و همیشگی تمام داده‌هاست.</p>' +
      '</section>' +
      '<section class="card"><h3>' + ic('info') + ' تبلیغات تپسل و اینترنت</h3>' +
      '<p>قابلیت‌های اصلی برنامه (اوقات شرعی، اذان، قبله‌نما، تقویم و ابزارها) مثل قبل <b>کاملاً آفلاین</b> کار می‌کنند؛ بدون اینترنت هیچ چیز از دست نمی‌رود.</p>' +
      '<p>تنها بخش متصل به اینترنت، <b>بنر تبلیغاتی تپسل در پایین صفحه اذان</b> است. این بنر از شبکه تبلیغاتی تپسل بارگذاری می‌شود و ممکن است شبکه تبلیغاتی از «شناسه تبلیغاتی گوگل» (GAID) برای انتخاب تبلیغ متناسب استفاده کند.</p>' +
      '<p>برنامه هیچ اطلاعات شخصی، مذهبی یا موقعیتی به تپسل نمی‌فرستد؛ تبلیغ فقط یک تصویر است که از اینترنت می‌آید. اگر اینترنت قطع باشد فقط جای تبلیغ خالی می‌ماند و بقیه برنامه بدون مشکل کار می‌کند.</p>' +
      '</section>' +
      '<section class="card"><h3>' + ic('info') + ' هشدار مهم — نسخه رسمی</h3>' +
      '<p>حتماً <b>نسخه رسمی افق شرعی را از استورهای رسمی کافه بازار و مایکت</b> نصب کنید. نصب فایل APK از گروه‌ها، کانال‌ها و سایت‌های ناشناس خطرناک است.</p>' +
      '<p>نسخه‌های غیررسمی ممکن است دستکاری‌شده، آلوده به ویروس یا دارای کدهای جاسوسی باشند. <b>تیم برنامه‌نویسی B-Z هیچ مسئولیتی در قبال نسخه‌های غیررسمی و ویروسی نمی‌پذیرد</b> و مسئولیت استفاده از آن‌ها کاملاً بر عهده کاربر است.</p>' +
      '</section>';
  }
  /* ---------- first-run wizard: 4 slides — مکان → اعلان‌ها → باتری → اذان ---------- */
  const OB_STEPS = ['مکان', 'اعلان‌ها', 'باتری', 'اذان'];
  function renderSetup() {
    const step = Math.max(0, Math.min(OB_STEPS.length - 1, S.obStep || 0));
    const selected = place();
    const dots = OB_STEPS.map((n, i) => {
      const cls = i === step ? ' on' : (i < step ? ' done' : '');
      const inner = i < step ? ic('check') : fa(i + 1);
      return '<div class="ob-dot' + cls + '"><span class="ob-dot-c">' + inner + '</span><span class="ob-dot-t">' + n + '</span></div>';
    }).join('');
    let stepTitle = '', body = '';
    if (step === 0) {
      stepTitle = 'شهر و مکان';
      body = '<section class="card setup-card"><h3>' + ic('pin') + ' شهر خود را انتخاب کنید</h3>' +
        '<p class="hint">اوقات شرعی، اذان و قبله دقیقاً بر اساس مختصات همین شهر محاسبه می‌شود. شهر را از فهرست انتخاب کنید یا با GPS نزدیک‌ترین شهر خودکار پیدا شود؛ موقعیت شما فقط روی دستگاه می‌ماند و جایی ارسال نمی‌شود.</p>' +
        '<input id="cSearch" type="search" placeholder="جستجوی شهر یا استان" autocomplete="off">' +
        '<div class="setup-city-list" id="cList">' +
        CITIES.slice().sort((p, q) => p.name.localeCompare(q.name, 'fa')).map(x =>
          '<button class="mi city' + (!S.custom && S.cityId === x.id ? ' sel' : '') + '" data-city="' + x.id + '" data-search="' + x.name + ' ' + x.prov + '">' +
          '<span><b>' + x.name + '</b><small>استان ' + x.prov + '</small></span><em>' + (!S.custom && S.cityId === x.id ? ic('check') : '') + '</em></button>'
        ).join('') + '</div>' +
        '<p class="hint setup-sel">شهر فعلی: <b>' + esc(selected.name) + '</b></p>' +
        '<button class="btn alt" id="setupGps">' + ic('gps') + ' تشخیص خودکار شهر با GPS</button>' +
        '<div id="gpsMsg" class="hint"></div></section>';
    } else if (step === 1) {
      stepTitle = 'اعلان‌ها';
      body = '<section class="card setup-card"><h3>' + ic('bell') + ' اجازه نمایش اعلان</h3>' +
        '<p class="hint">برای نمایش یادآوری‌ها و پخش مطمئن اذان، اجازه اعلان لازم است. بدون این اجازه، اذان فقط وقتی برنامه باز است پخش می‌شود. اگر پنجره اجازه باز شد، «اجازه دادن» را بزنید.</p>' +
        '<button class="btn" id="nAsk">' + ic('bell') + ' اجازه نمایش اعلان</button>' +
        '<div id="st" class="hint">وضعیت اعلان پس از درخواست اینجا نمایش داده می‌شود.</div></section>';
    } else if (step === 2) {
      stepTitle = 'باتری';
      body = '<section class="card setup-card"><h3>' + ic('sound') + ' خارج کردن از محدودیت باتری</h3>' +
        '<p class="hint">اندروید برای صرفه‌جویی باتری ممکن است سرویس اذان را متوقف کند. با دکمه زیر اجازه دهید افق شرعی بدون محدودیت کار کند تا اذان سر وقت پخش شود.</p>' +
        '<button class="btn alt" id="nBat">خارج کردن از محدودیت باتری</button>' +
        '<div id="stBat" class="hint">وضعیت باتری پس از تنظیم اینجا نمایش داده می‌شود.</div>' +
        '<p class="hint">در گوشی‌های سامسونگ، شیائومی، هواوی و اوپو گزینه «شروع خودکار» را هم در تنظیمات فعال کنید.</p></section>';
    } else {
      stepTitle = 'انتخاب اذان‌ها';
      body = '<section class="card setup-card"><h3>' + ic('bell') + ' چه اذان‌هایی را می‌خواهید؟</h3>' +
        '<p class="hint">هر اذان را روشن کنید تا در ساعت دقیق خودکار پخش شود. هر وقت خواستید از «تنظیمات ← تنظیمات اذان» می‌توانید تغییرش دهید.</p>' +
        '<section class="menu">' + AZAN.map(k => '<div class="mi"><span><b>' + NAME[k] + '</b><small>پخش خودکار در وقت شرعی</small></span>' + toggle(k, S.enabled[k], 'obazan') + '</div>').join('') + '</section></section>';
    }
    app.innerHTML =
      '<section class="hero setup-hero"><div class="pill">' + ic('bell') + ' افق شرعی</div>' +
      '<h1 class="setup-title">خوش آمدید</h1>' +
      '<p class="setup-desc">گام ' + fa(step + 1) + ' از ' + fa(OB_STEPS.length) + ' · ' + stepTitle + '</p></section>' +
      '<div class="ob-dots">' + dots + '</div>' +
      body +
      '<div class="ob-nav">' +
      (step > 0 ? '<button class="btn alt" id="obPrev">' + ic('back') + ' قبلی</button>' : '') +
      (step < OB_STEPS.length - 1 ? '<button class="btn" id="obNext">بعدی' + ic('chev') + '</button>' : '') +
      (step === OB_STEPS.length - 1 ? '<button class="btn wide setup-finish" id="setupDone">' + ic('check') + ' شروع استفاده از افق شرعی</button>' : '') +
      '</div>' +
      '<p class="hint" style="text-align:center;margin-top:10px">همه داده‌ها فقط روی گوشی شما ذخیره می‌شود؛ برنامه هیچ چیزی به اینترنت ارسال نمی‌کند.</p>';
    if (Native.available()) {
      Native.status().then(s => {
        if (!s) return;
        const st = document.getElementById('st');
        if (st) st.innerHTML = 'اعلان: <b>' + (s.notifications ? 'فعال ✓' : 'غیرفعال') + '</b>';
        const sb = document.getElementById('stBat');
        if (sb) sb.innerHTML = 'بدون محدودیت باتری: <b>' + (s.ignoringBattery ? 'بله ✓' : 'خیر') + '</b>' +
          (s.fullScreen === undefined ? '' : (s.fullScreen ? '' : '<br><button class="btn" id="nFs" style="margin-top:8px">اجازه نمایش روی صفحه قفل</button>'));
      });
      // درخواست مجوز موقعیت فقط یک‌بار در گام اول؛ در صورت موافقت، شهر نزدیک خودکار انتخاب می‌شود.
      if (step === 0 && !setupLocationRequested) {
        setupLocationRequested = true;
        const doGps = () => {
          if (!navigator.geolocation) return;
          navigator.geolocation.getCurrentPosition(pos => {
            applyGpsPosition(pos.coords.latitude, pos.coords.longitude, document.getElementById('gpsMsg'));
          }, err => {
            const gpsMsg = document.getElementById('gpsMsg');
            if (gpsMsg) gpsMsg.textContent = 'موقعیت دریافت نشد؛ شهر را دستی انتخاب کنید یا دوباره GPS را امتحان کنید.';
          }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 });
        };
        try {
          if (Native.askLocation) Native.askLocation().then(result => {
            if (!result || !result.granted || !navigator.geolocation) return;
            doGps();
          }).catch(() => {});
          else doGps();   // نسخه وب: مرورگر خودش اجازه می‌گیرد
        } catch (e) { /* ignore */ }
      }
    }
  }

  function renderTools() {
    const G = [
      ['عبادت', [['dhikr', 'moon', 'ذکرشمار'], ['rakat', 'check', 'رکعت‌شمار'], ['qada', 'clock', 'قضا'], ['duas', 'mic', 'ادعیه'], ['names', 'sun', 'اسماء'], ['wudu', 'sound', 'وضو']]],
      ['زمان و تقویم', [['calendar', 'cal', 'تقویم'], ['convert', 'cal', 'تبدیل تاریخ'], ['week', 'clock', 'اوقات هفته'], ['compare', 'clock', 'مقایسه روش']]],
      ['راهنما', [['faq', 'info', 'راهنما']]]
    ];
    app.innerHTML = header('ابزارها') + G.map(([t, items]) =>
      '<div class="sgroup-t">' + t + '</div><div class="tgrid">' +
      items.map(([id, icn, title]) => '<button class="tbtn" onclick="go(\'' + id + '\')"><i>' + ic(icn) + '</i><span>' + title + '</span></button>').join('') + '</div>'
    ).join('');
  }
  /* count inside the current round (دور), total and ring progress */
  const DK_C = 653.45;
  function dhikrState() {
    const tg = S.dhikrTarget === 0 ? 0 : (S.dhikrTarget || 33), n = S.dhikrCount || 0;
    if (!tg) return { tg, n, cur: n, round: 0, frac: 0 };
    const round = Math.max(1, Math.ceil(n / tg));
    const cur = n === 0 ? 0 : n - (round - 1) * tg;
    return { tg, n, cur, round, frac: cur / tg };
  }
  function dhikrUpdate() {
    const d = dhikrState(), g = id => document.getElementById(id);
    if (g('dkCount')) g('dkCount').textContent = fa(d.cur);
    if (g('dkRing')) g('dkRing').style.strokeDashoffset = String(DK_C * (1 - (d.tg ? d.frac : 0)));
    if (g('dkRound')) g('dkRound').textContent = d.tg ? 'دور ' + fa(d.round) + ' از هدف ' + fa(d.tg) : 'شمارش آزاد (بدون هدف)';
    if (g('dkTotal')) g('dkTotal').textContent = 'مجموع: ' + fa(d.n);
  }
  function renderDhikr() {
    const presets = (CONTENT && CONTENT.DHIKR_PRESETS) || [];
    const TG = [[33, '۳۳'], [34, '۳۴'], [100, '۱۰۰'], [500, '۵۰۰'], [1000, '۱۰۰۰'], [0, 'آزاد']];
    const cur = S.dhikrTarget === 0 ? 0 : (S.dhikrTarget || 33);
    app.innerHTML = header('ذکرشمار', 'tools') +
      '<section class="card dhikr-card"><div class="dk-name" id="dkName">' + esc(S.dhikrName || 'سبحان الله') + '</div>' +
      '<button class="dk-tap" id="dkTap" aria-label="شمارش">' +
        '<svg class="dk-svg" viewBox="0 0 240 240" aria-hidden="true"><circle class="dk-bg" cx="120" cy="120" r="104"/>' +
        '<circle class="dk-ring" id="dkRing" cx="120" cy="120" r="104" stroke-dasharray="' + DK_C + '" stroke-dashoffset="' + DK_C + '" transform="rotate(-90 120 120)"/></svg>' +
        '<span class="dk-in"><b class="dhikr-count" id="dkCount">۰</b><span class="dk-lbl">برای شمارش بزنید</span></span></button>' +
      '<div class="hint" id="dkRound"></div><div class="hint" id="dkTotal"></div>' +
      '<div class="dk-chips" aria-label="هدف شمارش">' + TG.map(([v, n]) => '<button class="dk-chip' + (v === cur ? ' on' : '') + '" data-dktg="' + v + '">' + n + '</button>').join('') + '</div>' +
      '<div class="quick"><button class="btn alt" id="dkUndo">' + ic('minus') + ' یکی کم</button><button class="btn alt" id="dkReset">صفر کردن</button></div>' +
      '<div id="dkMsg" class="hint"></div></section>' +
      '<section class="menu">' +
        '<div class="mi"><span><b>ویبره</b><small>با هر شمارش و پایان هر دور</small></span><button class="sw' + (S.vibrateQibla ? ' on' : '') + '" id="dkVib" role="switch" aria-checked="' + !!S.vibrateQibla + '"></button></div>' +
        '<div class="mi"><span><b>روشن ماندن صفحه</b><small>هنگام ذکر گفتن صفحه خاموش نشود</small></span><button class="sw' + (S.dhikrAwake !== false ? ' on' : '') + '" id="dkAwake" role="switch" aria-checked="' + (S.dhikrAwake !== false) + '"></button></div>' +
      '</section>' +
      '<h2>انتخاب ذکر</h2><section class="menu">' +
      presets.map(d => '<button class="mi' + (S.dhikrName === d.name ? ' sel' : '') + '" data-dk="' + d.id + '"><span><b>' + esc(d.name) + '</b><small>هدف ' + fa(d.target) + '</small></span></button>').join('') +
      '</section>';
    dhikrUpdate();
  }
  function renderRakat() {
    app.innerHTML = header('رکعت‌شمار', 'tools') +
      '<section class="card dhikr-card"><div class="dhikr-count" id="rkCount">۰</div><div class="hint">رکعت فعلی</div>' +
      '<button class="btn wide dhikr-tap" id="rkTap">رکعت بعدی</button>' +
      '<div class="quick"><button class="btn alt" id="rkReset">از اول</button></div></section>' +
      '<p class="hint">با هر سجدهٔ دوم یا پایان رکعت، یک بار بزنید. برای نماز ۴ رکعتی تا ۴ بشمارید.</p>';
  }
  function renderQada() {
    const q = S.qada || {};
    const rows = [['fajr','صبح'],['dhuhr','ظهر'],['asr','عصر'],['maghrib','مغرب'],['isha','عشا'],['fast','روزه']];
    app.innerHTML = header('نماز و روزه قضا', 'tools') +
      '<p class="hint">تعداد قضاهای باقی‌مانده را ثبت کنید. با دکمه‌ها کم و زیاد کنید.</p><section class="list">' +
      rows.map(([k, n]) => {
        const v = q[k] || 0;
        return '<div class="row"><span>' + n + '</span><span class="stp">' +
          '<button class="stb" data-qada="' + k + ':-1">' + ic('minus') + '</button><b>' + fa(v) + '</b>' +
          '<button class="stb" data-qada="' + k + ':1">' + ic('plus') + '</button></span></div>';
      }).join('') + '</section>';
  }
  function renderDuas() {
    const C = CONTENT || {};
    app.innerHTML = header('ادعیه و اذکار', 'tools') +
      '<h2>اذکار صبح</h2><section class="card">' + (C.ADHKAR_MORNING || []).map(a =>
        '<div class="dua"><div class="ar" dir="rtl">' + esc(a.t) + '</div><div class="hint">' + esc(a.tr) + '</div></div>').join('') + '</section>' +
      '<h2>اذکار شام</h2><section class="card">' + (C.ADHKAR_EVENING || []).map(a =>
        '<div class="dua"><div class="ar" dir="rtl">' + esc(a.t) + '</div><div class="hint">' + esc(a.tr) + '</div></div>').join('') + '</section>' +
      '<h2>دعاهای کوتاه</h2><section class="card">' + (C.DUA_SHORT || []).map(a =>
        '<div class="dua"><b>' + esc(a.title) + '</b><div class="ar" dir="rtl">' + esc(a.ar) + '</div><div class="hint">' + esc(a.fa) + '</div></div>').join('') + '</section>';
  }
  function renderNames() {
    const names = (CONTENT && CONTENT.NAMES99) || [];
    app.innerHTML = header('اسماء الحسنی', 'tools') +
      '<p class="hint">۹۹ نام زیبای خداوند</p><section class="names-grid">' +
      names.map((n, i) => '<div class="name-item"><small>' + fa(i + 1) + '</small><b>' + esc(n) + '</b></div>').join('') +
      '</section>';
  }
  function renderWudu() {
    const steps = (CONTENT && CONTENT.WUDU) || [];
    const pr = (CONTENT && CONTENT.PRAYER_STEPS) || {};
    app.innerHTML = header('وضو و نماز', 'tools') +
      '<h2>مراحل وضو</h2><section class="list">' +
      steps.map((s, i) => '<div class="row"><span><b>' + fa(i + 1) + '.</b> ' + esc(s) + '</span></div>').join('') +
      '</section><h2>رکعات نمازهای واجب</h2><section class="list">' +
      Object.keys(pr).map(k => '<div class="row"><span>' + (NAME[k] || k) + '</span><b>' + esc(pr[k][0]) + '</b></div>').join('') +
      '</section>';
  }
  function renderConvert() {
    app.innerHTML = header('تبدیل تاریخ', 'tools') +
      '<p class="hint">نوع تقویم ورودی را انتخاب کنید، تاریخ را وارد کنید و به همهٔ تقویم‌ها تبدیل می‌شود.</p>' +
      '<section class="form">' +
        '<label>تقویم ورودی<select id="cvType">' +
          '<option value="greg">میلادی</option>' +
          '<option value="shamsi">شمسی (هجری شمسی)</option>' +
          '<option value="qamari">قمری (هجری قمری)</option>' +
        '</select></label>' +
        '<label id="cvLabel">تاریخ (YYYY-MM-DD یا YYYY/MM/DD)<input id="cvIn" dir="ltr" placeholder="2026-11-13" inputmode="numeric"></label>' +
        '<button class="btn wide" id="cvGo">تبدیل به همه</button>' +
        '<button class="btn alt wide" id="cvToday" type="button">امروز را تبدیل کن</button>' +
        '<div id="cvOut" class="card" style="margin-top:12px;min-height:100px"></div>' +
      '</section>' +
      '<p class="hint">مثال شمسی: ۱۴۰۴/۰۸/۲۲ · قمری: ۱۴۴۷/۰۵/۲۲ · میلادی: 2026-11-13</p>';
  }
  function _cvDigits(s) {
    return String(s || '').trim().replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
  }
  function _cvParse(raw) {
    const s = _cvDigits(raw);
    const m = s.match(/^(\d{3,4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
    if (!m) return null;
    return { y: +m[1], mo: +m[2], d: +m[3] };
  }
  function _cvFindGregorian(cal, y, mo, d) {
    let guess;
    if (cal === 'persian') guess = Date.UTC(y + 621, Math.max(0, mo - 1), d, 12);
    else if (cal === 'islamic-civil') guess = Date.UTC(Math.floor(y * 0.97 + 622), Math.max(0, mo - 1), d, 12);
    else return new Date(Date.UTC(y, mo - 1, d, 12));
    const tryRange = (from, to) => {
      for (let delta = from; delta <= to; delta++) {
        const dt = new Date(guess + delta * 86400000);
        const parts = new Intl.DateTimeFormat('en-US-u-ca-' + cal, { timeZone: 'UTC', year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(dt);
        const get = ty => +(parts.find(x => x.type === ty) || {}).value;
        if (get('year') === y && get('month') === mo && get('day') === d) return dt;
      }
      return null;
    };
    return tryRange(-60, 60) || tryRange(-450, 450);
  }
  function _cvFormatAll(dt) {
    if (!dt || isNaN(dt.getTime())) return null;
    const fmt = (loc, o) => new Intl.DateTimeFormat(loc, Object.assign({ timeZone: 'UTC' }, o)).format(dt);
    return {
      shamsi: fmt('fa-IR-u-ca-persian', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      qamari: fmt('fa-IR-u-ca-islamic-civil', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      greg: fmt('fa-IR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      gregEn: fmt('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      iso: fmt('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })
    };
  }
  function runConvert() {
    const type = (document.getElementById('cvType') || {}).value || 'greg';
    const parts = _cvParse((document.getElementById('cvIn') || {}).value);
    const out = document.getElementById('cvOut');
    if (!out) return;
    if (!parts) {
      out.innerHTML = '<p class="hint">تاریخ معتبر وارد کنید. جداکننده می‌تواند - یا / باشد.</p>';
      return;
    }
    let dt = null;
    if (type === 'greg') dt = new Date(Date.UTC(parts.y, parts.mo - 1, parts.d, 12));
    else if (type === 'shamsi') dt = _cvFindGregorian('persian', parts.y, parts.mo, parts.d);
    else dt = _cvFindGregorian('islamic-civil', parts.y, parts.mo, parts.d);
    const all = _cvFormatAll(dt);
    if (!all) {
      out.innerHTML = '<p class="hint">تبدیل ممکن نشد. سال و ماه و روز را بررسی کنید.</p>';
      return;
    }
    out.innerHTML =
      '<div style="margin:6px 0"><b>شمسی:</b> ' + esc(all.shamsi) + '</div>' +
      '<div style="margin:6px 0"><b>قمری:</b> ' + esc(all.qamari) + '</div>' +
      '<div style="margin:6px 0"><b>میلادی:</b> ' + esc(all.greg) + '</div>' +
      '<div style="margin:6px 0"><b>میلادی (لاتین):</b> <span dir="ltr">' + esc(all.gregEn) + '</span></div>' +
      '<div style="margin:6px 0"><b>ISO:</b> <span dir="ltr">' + esc(all.iso) + '</span></div>';
  }

  function renderWeek() {
    const p = place();
    let html = header('اوقات هفته', 'tools') + '<section class="list">';
    for (let i = 0; i < 7; i++) {
      const ds = dayStart(p, i);
      const d = new Date(ds);
      const tms = timesFor(ds, p);
      const label = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'short' }).format(d);
      html += '<div class="row" style="flex-wrap:wrap;gap:4px 12px"><span style="width:100%;font-weight:700">' + esc(label) + '</span>' +
        AZAN.map(k => '<small>' + SHORT[k] + ' ' + hm(tms[k].min) + '</small>').join(' · ') + '</div>';
    }
    html += '</section>';
    app.innerHTML = html;
  }
  
  function renderCompare() {
    const p = place();
    const y = new Date(); // use city day
    const c = cityNow(p.tz);
    const yy = c.getUTCFullYear(), mm = c.getUTCMonth() + 1, dd = c.getUTCDate();
    const methods = Object.keys(METHOD_LABELS);
    let head = '<div class="cmp-head"><span>وقت</span>' + methods.map(m => '<span title="' + METHOD_LABELS[m] + '">' + METHOD_LABELS[m].split(' ')[0] + '</span>').join('') + '</div>';
    let body = AZAN.map(k => {
      const cells = methods.map(m => {
        const tms = PT.compute(yy, mm, dd, p.lat, p.lng, p.tz, m);
        return '<span>' + hm(tms[k].min) + '</span>';
      }).join('');
      return '<div class="cmp-row"><span>' + SHORT[k] + '</span>' + cells + '</div>';
    }).join('');
    app.innerHTML = header('مقایسه روش‌ها', 'tools') +
      '<p class="hint">اوقات امروز «' + esc(p.name) + '» با چند روش رایج. روش فعال شما: <b>' + esc(METHOD_LABELS[S.method] || '') + '</b></p>' +
      '<section class="card cmp">' + head + body + '</section>' +
      '<p class="hint">اختلاف چند دقیقه‌ای بین روش‌ها طبیعی است. روش تهران معمولاً برای ایران مناسب‌تر است.</p>';
  }
function renderFaq() {
    const faqs = [
      ['اذان پخش نمی‌شود؟', '۱) اعلان‌ها را در تنظیمات گوشی مجاز کنید. ۲) محدودیت باتری را برای افق شرعی بردارید. ۳) در شیائومی، هواوی و سامسونگ گزینه «شروع خودکار» یا Auto-start را روشن کنید. ۴) برنامه را Force Stop نکنید. ۵) صدای گوشی را چک کنید و حالت بی‌صدا را خاموش کنید.'],
      ['اوقات شرعی چند دقیقه با تقویم رسمی فرق دارد؟', 'روش محاسبه را در تنظیمات عوض کنید (پیش‌فرض: مؤسسه ژئوفیزیک تهران). از «اصلاح دقیقه» برای هر وقت استفاده کنید. ارتفاع محل، افق و جداول رسمی گاهی ۱ تا ۳ دقیقه اختلاف طبیعی دارند.'],
      ['قبله‌نما دقیق نیست یا می‌لرزد؟', 'گوشی را به شکل عدد ۸ در هوا بچرخانید تا قطب‌نما کالیبره شود. از اجسام فلزی، آهنربا و بلندگو دور شوید. موقعیت دقیق‌تر با GPS به‌دست می‌آید. در تنظیمات می‌توانید آفست دستی وارد کنید.'],
      ['حریم خصوصی چگونه است؟', 'تمام داده‌ها (شهر، تنظیمات، قضاها، ذکرها) فقط روی گوشی شما ذخیره می‌شوند. هیچ سروری، حساب کاربری یا ارسال داده به اینترنت وجود ندارد؛ پس احتمال هک شدن و افشای اطلاعات عملاً صفر است.'],
      ['نسخه رسمی را از کجا نصب کنم؟', 'حتماً نسخه رسمی افق شرعی را از استورهای رسمی کافه بازار و مایکت نصب کنید. نسخه‌های غیررسمی ممکن است دستکاری‌شده یا آلوده به ویروس باشند و تیم برنامه‌نویسی B-Z هیچ مسئولیتی در قبال نسخه‌های غیررسمی و ویروسی نمی‌پذیرد.'],
      ['چطور شهر را عوض کنم؟', 'از صفحه اصلی روی نام شهر بزنید یا از تنظیمات > شهر و موقعیت. می‌توانید استان را فیلتر کنید، به علاقه‌مندی‌ها اضافه کنید یا با GPS شهر نزدیک را پیدا کنید.'],
      ['روش محاسبه چیست و کدام را انتخاب کنم؟', 'پیش‌فرض برای ایران «مؤسسه ژئوفیزیک دانشگاه تهران» است. روش‌های دیگر مثل MWL، ISNA، مصر، کراچی، ام‌القرى و جعفری هم موجودند. برای ایران معمولاً همان تهران بهترین است.'],
      ['چطور اذان را زودتر یا دیرتر پخش کنم؟', 'در تنظیمات اذان برای هر وقت «اصلاح دقیقه» را تنظیم کنید (مثبت یا منفی). یادآوری قبل از اذان هم جداگانه قابل تنظیم است.'],
      ['مؤذن یا فایل صوتی را چطور عوض کنم؟', 'از تنظیمات > مؤذن و فایل صوتی می‌توانید مؤذن پیش‌فرض را انتخاب کنید یا فایل صوتی دلخواه خود را اضافه کنید.'],
      ['اعلان‌ها کار نمی‌کنند؟', 'مجوز اعلان را بدهید. در اندروید‌های جدید، «اعلان‌های حساس» یا Scheduled notifications را بررسی کنید. محدودیت باتری و بهینه‌سازی را برای برنامه خاموش کنید.'],
      ['بعد از ری‌استارت گوشی اذان قطع می‌شود؟', 'برنامه باید اجازه شروع خودکار داشته باشد. BootReceiver برای زمان‌بندی مجدد بعد از روشن شدن گوشی طراحی شده است. شروع خودکار را در تنظیمات گوشی فعال کنید.'],
      ['چطور پشتیبان بگیرم؟', 'از تنظیمات > پشتیبان‌گیری می‌توانید تنظیمات را به صورت فایل JSON خروجی بگیرید و بعداً بازیابی کنید.'],
      ['ویجت اوقات شرعی کجاست؟', 'روی صفحه اصلی گوشی لمس طولانی کنید، ویجت‌ها را باز کنید و «افق شرعی» را اضافه کنید. چند اندازه (فشرده و کامل) موجود است.'],
      ['ذکرشمار و رکعت‌شمار چطور کار می‌کنند؟', 'از ابزارها > ذکرشمار یا رکعت‌شمار. با هر ضربه شمارش افزایش می‌یابد. می‌توانید هدف تعیین کنید و ویبره را روشن/خاموش کنید.'],
      ['قضاهای نماز و روزه را چطور ثبت کنم؟', 'از ابزارها > نماز و روزه قضا تعداد باقی‌مانده هر نماز و روزه را وارد کنید و با دکمه‌ها کم و زیاد کنید.'],
      ['تقویم و مناسبت‌ها از کجا می‌آیند؟', 'تقویم شمسی، قمری و میلادی هم‌زمان نمایش داده می‌شود. مناسبت‌های مذهبی و ملی به صورت آفلاین در برنامه ذخیره شده‌اند.'],
      ['حالت رمضان چیست؟', 'در نمایش و حالت می‌توانید حالت رمضان را فعال کنید تا شمارش معکوس تا امساک و افطار روی صفحه اصلی دیده شود.'],
      ['چطور تم و اندازه فونت را عوض کنم؟', 'از تنظیمات > نمایش و حالت: اندازه فونت، کنتراست بالا، تم‌های رنگی و حالت سالمندپسند در دسترس است.'],
      ['GPS کار نمی‌کند یا شهر اشتباه پیدا می‌کند؟', 'مجوز موقعیت را بدهید. در فضای باز امتحان کنید. اگر GPS دقیق نبود، شهر را دستی از لیست انتخاب کنید.'],
      ['صدا در حالت بی‌صدا یا Do Not Disturb پخش می‌شود؟', 'بسته به تنظیمات اندروید، اعلان‌های اولویت‌دار ممکن است در DND پخش شوند. حجم اذان را در تنظیمات برنامه و گوشی بررسی کنید.'],
      ['برنامه اینترنت لازم دارد؟', 'محاسبه اوقات، اذان، قبله، تقویم، اذکار و همه قابلیت‌های اصلی کاملاً آفلاین هستند. اینترنت فقط برای بارگذاری بنر تبلیغ تپسل در پایین صفحه اذان لازم است؛ اگر اینترنت نباشد فقط جای تبلیغ خالی می‌ماند و بقیه برنامه بدون مشکل کار می‌کند.']
    ];
    app.innerHTML = header('راهنما و سوالات پرتکرار', 'tools') +
      faqs.map(([q, a]) => '<section class="card"><h3>' + q + '</h3><p class="hint">' + a + '</p></section>').join('');
  }


  const R = { home: renderHome, times: renderTimes, settings: renderSettings, city: renderCity, azan: renderAzan, muezzin: renderMuezzin, notif: renderNotif, about: renderAbout, setup: renderSetup, method: renderMethod, qibla: renderQibla, display: renderDisplay, backup: renderBackup, privacy: renderPrivacy, tools: renderTools, calendar: renderCalendar, dhikr: renderDhikr, rakat: renderRakat, qada: renderQada, duas: renderDuas, names: renderNames, wudu: renderWudu, convert: renderConvert, week: renderWeek, faq: renderFaq, compare: renderCompare };
  function render() {
    (R[page] || renderHome)();
    if (page === 'setup') {
      nav.innerHTML = '';
      nav.style.display = 'none';
      document.getElementById('app').style.paddingBottom = '24px';
    } else {
      nav.style.display = '';
      document.getElementById('app').style.paddingBottom = '';
      const TOOLSUB = ['dhikr', 'rakat', 'qada', 'duas', 'names', 'wudu', 'convert', 'week', 'faq', 'compare'];
      const top = ['home', 'times', 'qibla', 'calendar', 'tools'].includes(page) ? page : (TOOLSUB.includes(page) ? 'tools' : '');
      nav.innerHTML = NAV.map(([id, icn, t]) => '<button class="' + (id === top ? 'on' : '') + (id === 'qibla' ? ' mid' : '') + '" onclick="go(\'' + id + '\')"><i>' + icn + '</i>' + t + '</button>').join('');
    }
    syncAds();
  }

  /* ---------- تبلیغات تپسل: بنر فقط پایین صفحه اذان (خانه) ----------
     در بقیه صفحات، حین راه‌اندازی اولیه و روی صفحه پخش اذان، بنر پنهان می‌شود.
     در نسخه وب (مرورگر) Native.available() برابر false است و کاری انجام نمی‌شود. */
  function syncAds() {
    if (!Native.available()) return;
    const azanOpen = !ov.hidden;
    if (page === 'home' && S.setupDone && !azanOpen) Native.adsShow();
    else Native.adsHide();
  }

  /* ---------- live tick (GPU-friendly: minimal style writes) ---------- */
  let _ringSec = -1;

  function updatePrayerProgress() {
    if (S.showProgress === false) return;
    const bar = document.getElementById('progBar');
    const lbl = document.getElementById('progLbl');
    if (!bar) return;
    const p = place();
    const now = Date.now();
    const tms = timesFor(dayStart(p, 0), p);
    const keys = AZAN;
    let prev = null, next = null;
    for (const k of keys) {
      if (tms[k].ms <= now) prev = k;
      else if (!next) next = k;
    }
    if (!next) {
      const t2 = timesFor(dayStart(p, 1), p);
      next = keys[0];
      const start = prev ? tms[prev].ms : dayStart(p, 0);
      const end = t2[next].ms;
      const pct = Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100));
      bar.style.width = pct + '%';
      if (lbl) lbl.textContent = 'تا ' + SHORT[next] + ' فردا';
      return;
    }
    const start = prev ? tms[prev].ms : dayStart(p, 0);
    const end = tms[next].ms;
    const pct = Math.max(0, Math.min(100, ((now - start) / Math.max(1, end - start)) * 100));
    bar.style.width = pct + '%';
    if (lbl) lbl.textContent = (prev ? SHORT[prev] + ' → ' : '') + SHORT[next] + ' · ' + fa(Math.round(pct)) + '٪';
  }

  function tick() {
    const p = place(), c = cityNow(p.tz);
    const key = c.getUTCFullYear() + '-' + c.getUTCMonth() + '-' + c.getUTCDate();
    if (page === 'home') {
      if (lastDay && key !== lastDay) { lastDay = key; renderHome(); schedule(); return; }
      updatePrayerProgress();
      const ram = document.getElementById('ramCd');
      if (ram && S.ramadanMode) {
        const tms = timesFor(dayStart(p, 0), p); const now = Date.now();
        let target = null;
        if (tms.imsak && now < tms.imsak.ms) target = tms.imsak.ms;
        else if (tms.maghrib && now < tms.maghrib.ms) target = tms.maghrib.ms;
        if (target) { let s = Math.max(0, Math.floor((target - now) / 1000)); ram.textContent = fa(p2(Math.floor(s/3600))+':'+p2(Math.floor(s%3600/60))+':'+p2(s%60)); }
      }
      lastDay = key;
      const ck = document.getElementById('clock');
      if (ck) ck.textContent = fa(p2(c.getUTCHours()) + ':' + p2(c.getUTCMinutes()) + ':' + p2(c.getUTCSeconds()));
      const nx = nextPrayer(p), cd = document.getElementById('cd');
      if (nx && cd) {
        const now = Date.now();
        let s = Math.max(0, Math.floor((nx.ms - now) / 1000));
        cd.textContent = fa(p2(Math.floor(s / 3600)) + ':' + p2(Math.floor(s % 3600 / 60)) + ':' + p2(s % 60));
        // حلقه پیشرفت فقط هر ۵ ثانیه — کاهش فشار GPU
        if (s % 5 === 0 && s !== _ringSec) {
          _ringSec = s;
          const rp = document.getElementById('rp'), pv = prevMs(p);
          if (rp) {
            const fr = pv ? Math.min(1, Math.max(0, (now - pv) / (nx.ms - pv))) : 0;
            rp.style.strokeDashoffset = String(339.3 * (1 - fr));
          }
        }
        const n = document.getElementById('nxName'), a = document.getElementById('nxAt');
        if (n && n.textContent !== SHORT[nx.key]) renderHome();
        else if (a) {
          const t = 'ساعت ' + hm(nx.min);
          if (a.textContent !== t) a.textContent = t;
        }
      }
    }
  }

  /* ---------- azan screen (shown while the azan is playing) ---------- */
  const ov = document.createElement('div');
  ov.id = 'azanScreen'; ov.hidden = true;
  document.body.appendChild(ov);
  let ovKey = null, ovClosed = null, ovMuted = false, ovBusy = false, ovShown = false, ovDone = false, ovHist = false, ovAwake = false;
  function awake(on) { if (ovAwake !== on) { ovAwake = on; Native.keepAwake(on); } }
  /* Closing = stop the azan, hide the screen. Triggered by the Close button or the phone's Back button. */
  function closeAzan(stopAudio) {
    ovClosed = ovKey; ovKey = null; ovDone = false; ov.hidden = true; ov.className = '';
    awake(false); if (stopAudio !== false) Native.stop();
    if (ovHist) { ovHist = false; try { history.back(); } catch (e) {} }
    syncAds();                                   // بنر تپسل (اگر صفحه خانه باشد) دوباره برمی‌گردد
  }
  window.addEventListener('popstate', e => {
    ovHist = false;
    if (!ov.hidden) { closeAzan(); return; }                      // Back closes the azan screen first
    const i = e.state && typeof e.state.i === 'number' ? e.state.i : -1;
    if (i < 0 || i >= stack.length - 1) return;                   // not one of our screens / nothing to do
    stack = stack.slice(0, i + 1); show(stack[i]);                // Back = previous menu
  });
  const fmtMS = ms => { const t = Math.max(0, Math.round(ms / 1000)); return fa(Math.floor(t / 60) + ':' + p2(t % 60)); };
  const azanKeyOf = name => Object.keys(SHORT).find(k => SHORT[k] === name) || '';
  function ovBuild(s, p) {
    const k = azanKeyOf(s.name);
    ov.className = ''; ov.dataset.k = k || 'test';
    ov.innerHTML = '<div class="ov-glow"></div><div class="ov-wave"></div><div class="ov-wave w2"></div><div class="ov-in">' +
      '<div class="ov-pill">' + ic('pin') + ' ' + esc(p.name) + '</div>' +
      '<div class="ov-icon">' + (ICON[k] || ic('moon')) + '</div>' +
      '<div class="ov-sub">' + (s.name ? 'وقت اذان' : 'آزمایش صدای اذان') + '</div>' +
      '<div class="ov-title">' + (s.name ? esc(s.name) : 'اذان') + '</div>' +
      '<div id="ovClock" class="ov-clock"></div>' +
      '<div id="ovDate" class="ov-date"></div><div id="ovDate2" class="ov-date2"></div>' +
      '<div class="ov-prog" id="ovProg"><i id="ovBar"></i></div>' +
      '<div class="ov-pt" id="ovPt"><span id="ovPos" dir="ltr"></span><span id="ovDur" dir="ltr"></span></div>' +
      '<div class="ov-dua"><span class="ov-dl">صلوات</span>اللّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَآلِ مُحَمَّدٍ وَعَجِّلْ فَرَجَهُمْ</div>' +
      '<div id="ovMsg" class="ov-msg"></div>' +
      '<div class="ov-vol"><button class="ov-vb" id="ovVd" aria-label="کم کردن صدا">' + ic('minus') + '</button>' +
      '<input id="ovVol" type="range" min="5" max="100" value="100" aria-label="میزان صدا">' +
      '<button class="ov-vb" id="ovVu" aria-label="زیاد کردن صدا">' + ic('plus') + '</button></div>' +
      '<div class="ov-btns"><button id="ovMute" class="ov-btn">' + ic('soff') + ' قطع صدا</button><button id="ovClose" class="ov-btn alt">' + ic('close') + ' بستن</button></div>' +
      '<div id="ovNext" class="ov-next"></div>' +
      '<div class="ov-hint">با پایان اذان این صفحه خودکار بسته می‌شود. برای بستن زودتر، دکمه بازگشت گوشی یا «بستن» را بزنید.</div></div>';
  }
  async function pollAzan() {
    if (document.hidden || ovBusy) return;
    ovBusy = true;
    try {
      const s = await Native.state();
      if (!s) return;
      const live = s.playing && s.startedAt !== ovClosed;
      if (!live && (ov.hidden || ovKey === null)) return;       // nothing to show
      const p = place(), g = id => document.getElementById(id);
      if (live && ovKey !== s.startedAt) {                      // a new azan started: build the screen
        ovKey = s.startedAt; ovShown = false; ovDone = false;
        ovBuild(s, p);
        ov.hidden = false; ov.scrollTop = 0;
        if (!ovHist) { try { history.pushState({ azan: 1 }, ''); ovHist = true; } catch (e) {} }
        syncAds();                                // روی صفحه پخش اذان، بنر تپسل پنهان شود
      }
      const c = cityNow(p.tz), dt = dates(p);
      g('ovClock').textContent = fa(p2(c.getUTCHours()) + ':' + p2(c.getUTCMinutes()) + ':' + p2(c.getUTCSeconds()));
      g('ovDate').textContent = dt.shamsi;
      g('ovDate2').textContent = dt.qamari;
      const nx = nextPrayer(p);
      g('ovNext').textContent = nx ? 'اذان بعدی: ' + SHORT[nx.key] + ' · ساعت ' + hm(nx.min) : '';
      if (live) {
        awake(true); ovDone = false; ovMuted = !!s.muted;
        ov.classList.toggle('muted', ovMuted);
        g('ovMsg').textContent = ovMuted ? 'صدا قطع شد' : '';
        if (ovShown !== ovMuted) { g('ovMute').innerHTML = ovMuted ? ic('sound') + ' پخش صدا' : ic('soff') + ' قطع صدا'; ovShown = ovMuted; }
        const hasDur = s.dur > 0;                               // playback progress
        g('ovProg').style.visibility = g('ovPt').style.visibility = hasDur ? 'visible' : 'hidden';
        if (hasDur) {
          g('ovBar').style.width = Math.min(100, Math.max(0, s.pos / s.dur * 100)) + '%';
          g('ovPos').textContent = fmtMS(s.pos); g('ovDur').textContent = fmtMS(s.dur);
        }
        const vs = g('ovVol');
        if (vs && typeof s.volume === 'number' && document.activeElement !== vs) vs.value = Math.round(s.volume * 100);
      } else {                                                  // azan finished by itself: close the screen automatically
        closeAzan(false);
      }
    } finally { ovBusy = false; }
  }

  /* ---------- events ---------- */
  document.addEventListener('click', async e => {
    const el = e.target.closest('button'); if (!el) return;
    const msg = id => document.getElementById(id);
    if (el.dataset.calDay) { cal.sel = +el.dataset.calDay; return refreshCal(); }
    if (el.dataset.calNav) { calMonth(+el.dataset.calNav); return refreshCal(); }
    if (el.dataset.calToday) { cal.first = null; return refreshCal(); }
    if (el.dataset.sw) { S.enabled[el.dataset.sw] = !S.enabled[el.dataset.sw]; save(); return renderAzan(); }
    if (el.dataset.city) {
      S.cityId = el.dataset.city; S.custom = null; save(false);
      if (page === 'setup') return renderSetup();
      return renderCity();
    }
    if (el.id === 'obNext') { S.obStep = Math.min(OB_STEPS.length - 1, (S.obStep || 0) + 1); save(false); renderSetup(); window.scrollTo(0, 0); return; }
    if (el.id === 'obPrev') { S.obStep = Math.max(0, (S.obStep || 0) - 1); save(false); renderSetup(); window.scrollTo(0, 0); return; }
    if (el.dataset.obazan) {
      const k = el.dataset.obazan;
      S.enabled[k] = !S.enabled[k];
      save();
      return renderSetup();
    }
    if (el.id === 'setupDone') {
      S.setupDone = true; S.obStep = 0; save();
      vib('done', true);
      goRoot('home');
      return;
    }
    if (el.id === 'cSave') {
      const lat = parseFloat(msg('cLat').value), lng = parseFloat(msg('cLng').value), tz = parseFloat(msg('cTz').value), name = msg('cName').value.trim() || 'موقعیت من';
      if (!(lat >= -66 && lat <= 66) || !(lng >= -180 && lng <= 180) || !(tz >= -12 && tz <= 14)) { msg('cMsg').textContent = 'مقادیر واردشده معتبر نیست.'; return; }
      S.custom = { id: 'custom', name, lat, lng, tz }; save(); msg('cMsg').textContent = 'ذخیره شد';
    }
    if (el.id === 'tPlay') { const r = await Native.play(muezzin().path, S.volume); msg('aMsg').textContent = Native.available() ? (r && r.error ? 'خطا: ' + r.error : (muezzin().path ? 'در حال پخش…' : 'اذان پیش‌فرض برنامه پخش می‌شود.')) : 'پخش صدا فقط روی گوشی ممکن است.'; }
    if (el.id === 'tStop' || el.id === 'mStop') Native.stop();
    if (el.dataset.clear) { const m = S.muezzins.find(x => x.id === el.dataset.clear); if (m) { m.path = ''; m.file = ''; save(); renderMuezzin(); } }
    if (el.dataset.off) { const [k, dd] = el.dataset.off.split(':'); S.offsets[k] = Math.max(-15, Math.min(15, (S.offsets[k] || 0) + Number(dd))); save(); renderAzan(); }
    if (el.dataset.use) { S.muezzinId = el.dataset.use; save(); renderMuezzin(); }
    if (el.dataset.try) { const m = S.muezzins.find(x => x.id === el.dataset.try); Native.play(m.path, S.volume); }
    if (el.dataset.pick) {
      const m = S.muezzins.find(x => x.id === el.dataset.pick), r = await Native.importAudio(m.id);
      if (r && r.path) { m.path = r.path; m.file = r.name || ''; save(); renderMuezzin(); }
      else if (r && r.error) msg('mMsg').textContent = 'فایل وارد نشد: ' + r.error;
      else if (!r) msg('mMsg').textContent = 'انتخاب فایل فقط روی گوشی ممکن است.';
    }
    if (el.dataset.del) { S.muezzins = S.muezzins.filter(x => x.id !== el.dataset.del); if (S.muezzinId === el.dataset.del) S.muezzinId = 'afasy'; save(); renderMuezzin(); }
    if (el.id === 'mAdd') { const n = (window.prompt('نام مؤذن:') || '').trim(); if (n) { S.muezzins.push({ id: 'm' + Date.now(), name: n, path: '', file: '' }); save(false); renderMuezzin(); } }
    if (el.id === 'ovMute') { await Native.mute(!ovMuted); setTimeout(pollAzan, 300); }
    if (el.id === 'ovClose') closeAzan();
    if (el.id === 'ovVd' || el.id === 'ovVu') {
      const vs = document.getElementById('ovVol');
      if (vs) { vs.value = Math.max(5, Math.min(100, (+vs.value || 100) + (el.id === 'ovVu' ? 10 : -10))); Native.volume(vs.value / 100); }
    }
    if (el.id === 'nFs') Native.fullScreenSettings();
    if (el.id === 'nAsk') {
      await Native.askNotifications();
      setTimeout(() => { if (page === 'setup') renderSetup(); else if (page === 'notif') renderNotif(); }, 800);
    }
    if (el.id === 'nBat') {
      Native.batterySettings();
      setTimeout(() => { if (page === 'setup') renderSetup(); else if (page === 'notif') renderNotif(); }, 1200);
    }
    if (el.id === 'setupGps') {
      const msg = document.getElementById('gpsMsg');
      if (!navigator.geolocation) {
        if (msg) msg.textContent = 'GPS در این دستگاه پشتیبانی نمی‌شود.';
        return;
      }
      if (msg) msg.textContent = 'در حال دریافت موقعیت…';
      navigator.geolocation.getCurrentPosition(pos => {
        applyGpsPosition(pos.coords.latitude, pos.coords.longitude, msg);
      }, err => {
        if (msg) msg.textContent = 'موقعیت گرفته نشد. اجازه مکان را فعال کنید. (' + (err.message || err.code) + ')';
      }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 });
    }
    if (el.id === 'nApp') Native.appSettings();
    if (el.id === 'ghOpen') {
      const url = 'https://github.com/alirezamasoumi2244-tech/Ofoq-shari';
      if (Native.available()) Native.openUrl(url);
      else window.open(url, '_blank', 'noopener,noreferrer');
    }
    if (el.dataset.method) {
      S.method = el.dataset.method; save(); renderMethod();
    }
    if (el.dataset.magdec) {
      S.useMagDecl = !(S.useMagDecl !== false);
      save(false); renderQibla();
    }
    if (el.dataset.fav) {
      const id = el.dataset.fav;
      if (!S.favCities) S.favCities = [];
      const i = S.favCities.indexOf(id);
      if (i >= 0) S.favCities.splice(i, 1); else {
        if (S.favCities.length >= 6) S.favCities.shift();
        S.favCities.push(id);
      }
      save(false); renderCity();
    }

    if (el.dataset.uimode) {
      S.uiMode = el.dataset.uimode;
      applyUiPrefs(); save(false); renderDisplay();
    }
    if (el.dataset.hc) {
      S.highContrast = !S.highContrast; applyUiPrefs(); save(false); renderDisplay();
    }
    if (el.dataset.theme) { S.theme = el.dataset.theme; applyUiPrefs(); save(false); renderDisplay(); }
    if (el.dataset.thememode) { S.themeMode = el.dataset.thememode; applyUiPrefs(); save(false); renderDisplay(); }
    if (el.dataset.imsak) { S.showImsak = !S.showImsak; save(false); renderDisplay(); }
    if (el.dataset.midn) { S.showMidnight = !S.showMidnight; save(false); renderDisplay(); }
    if (el.dataset.amoled) { S.amoled = !S.amoled; applyUiPrefs(); save(false); renderDisplay(); }
    if (el.dataset.rmotion) { S.reduceMotion = !S.reduceMotion; applyUiPrefs(); save(false); renderDisplay(); }
    if (el.dataset.compact) { S.compactHome = !S.compactHome; applyUiPrefs(); save(false); renderDisplay(); }
    if (el.dataset.dgoal) { S.dailyGoal = !(S.dailyGoal !== false); save(false); renderDisplay(); }
    if (el.dataset.fri) { S.highlightFriday = !(S.highlightFriday !== false); applyUiPrefs(); save(false); renderDisplay(); }
    if (el.dataset.smartn) { S.smartNotif = !(S.smartNotif !== false); save(); renderNotif(); }
    if (el.dataset.quiet) { S.quietHours = !S.quietHours; save(); renderNotif(); }
    if (el.dataset.ramhint) { S.ramadanHint = !(S.ramadanHint !== false); save(); renderNotif(); }
    if (el.dataset.vibpre) { S.vibratePre = !(S.vibratePre !== false); save(); renderNotif(); }
    if (el.dataset.preen) {
      if (!S.preEnabled) S.preEnabled = { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true };
      const k = el.dataset.preen;
      S.preEnabled[k] = S.preEnabled[k] === false ? true : false;
      save(); renderNotif();
    }
    if (el.dataset.ramadan) { S.ramadanMode = !S.ramadanMode; save(false); renderDisplay(); }
    if (el.dataset.shake) { S.shakeDhikr = !S.shakeDhikr; save(false); renderDisplay(); }
    if (el.dataset.vibsw) { S.vibrateQibla = !S.vibrateQibla; save(false); renderDisplay(); if (S.vibrateQibla) vib('test'); }
    if (el.dataset.vibazan) { S.vibrateAzan = !S.vibrateAzan; save(); renderAzan(); }
    if (el.id === 'namazMode') {
      const key = new Date().toISOString().slice(0, 10);
      if (!S.streak) S.streak = { days: 0, last: '' };
      if (S.streak.last !== key) {
        const yest = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        S.streak.days = (S.streak.last === yest) ? (S.streak.days || 0) + 1 : 1;
        S.streak.last = key; save(false);
      }
      Native.keepAwake(true); go('rakat');
    }
    if (el.id === 'cGps') {
      const msg = document.getElementById('gpsMsg');
      if (!navigator.geolocation) { msg.textContent = 'GPS در این دستگاه پشتیبانی نمی‌شود.'; return; }
      msg.textContent = 'در حال دریافت موقعیت…';
      navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude, lng = pos.coords.longitude;
        // تخمین tz ساده برای ایران
        const tz = (lng > 44 && lng < 64 && lat > 25 && lat < 40) ? 3.5 : -Math.round(lng / 15 * 2) / 2;
        S.custom = { id: 'custom', name: 'موقعیت فعلی (GPS)', lat: Math.round(lat * 10000) / 10000, lng: Math.round(lng * 10000) / 10000, tz };
        save(); msg.textContent = 'موقعیت ذخیره شد: ' + fa(S.custom.lat) + ' ، ' + fa(S.custom.lng);
        setTimeout(() => renderCity(), 600);
      }, err => {
        msg.textContent = 'موقعیت گرفته نشد. اجازه مکان را در تنظیمات گوشی فعال کنید. (' + (err.message || err.code) + ')';
      }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
    }
    if (el.id === 'bkExport') {
      try {
        const data = JSON.stringify(S, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'azango-settings-' + new Date().toISOString().slice(0, 10) + '.json';
        a.click();
        URL.revokeObjectURL(a.href);
        document.getElementById('bkMsg').textContent = 'فایل تنظیمات دانلود شد.';
      } catch (e) { document.getElementById('bkMsg').textContent = 'خطا در خروجی: ' + e.message; }
    }
    if (el.id === 'bkImport') {
      document.getElementById('bkFile').click();
    }

    if (el.id === 'dkTap') {
      S.dhikrCount = (S.dhikrCount || 0) + 1;
      dhikrUpdate();
      const d = dhikrState();
      vib(d.tg && d.cur === d.tg ? 'done' : 'tap');
      save(false);
    }
    if (el.id === 'dkUndo') { S.dhikrCount = Math.max(0, (S.dhikrCount || 0) - 1); dhikrUpdate(); save(false); }
    if (el.id === 'dkReset') {                       // two taps, so it can't be reset by accident
      if (!el.dataset.arm) {
        el.dataset.arm = '1'; el.textContent = 'مطمئنید؟ دوباره بزنید';
        setTimeout(() => { if (el.isConnected) { delete el.dataset.arm; el.textContent = 'صفر کردن'; } }, 3000);
      } else { S.dhikrCount = 0; save(false); renderDhikr(); }
    }
    if (el.dataset.dktg !== undefined) { S.dhikrTarget = parseInt(el.dataset.dktg, 10) || 0; save(false); renderDhikr(); }
    if (el.id === 'dkVib') {
      S.vibrateQibla = !S.vibrateQibla; save(false); renderDhikr();
      if (S.vibrateQibla) {
        const r = await vib('test'), m = document.getElementById('dkMsg');
        if (m && r && !r.ok) m.textContent = r.has === false ? 'این دستگاه موتور ویبره ندارد.' : 'ویبره اجرا نشد. در تنظیمات گوشی (صدا و ویبره) شدت ویبره را بررسی کنید و حالت صرفه‌جویی باتری را خاموش کنید.';
      }
    }
    if (el.id === 'dkAwake') { S.dhikrAwake = S.dhikrAwake === false; save(false); renderDhikr(); syncAwake(page); }
    if (el.dataset.dk) {
      const pr = ((CONTENT && CONTENT.DHIKR_PRESETS) || []).find(x => x.id === el.dataset.dk);
      if (pr) { S.dhikrName = pr.name; S.dhikrTarget = pr.target; S.dhikrCount = 0; save(false); renderDhikr(); window.scrollTo(0, 0); }
    }
    if (el.id === 'rkTap') {
      const elc = document.getElementById('rkCount');
      if (elc) { const n = (parseInt(elc.dataset.n || '0', 10) + 1); elc.dataset.n = n; elc.textContent = fa(n); vib('rakat'); }
    }
    if (el.id === 'rkReset') { const elc = document.getElementById('rkCount'); if (elc) { elc.dataset.n = 0; elc.textContent = fa(0); } }
    if (el.dataset.qada) {
      const [k, dd] = el.dataset.qada.split(':');
      if (!S.qada) S.qada = { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0, fast: 0 };
      S.qada[k] = Math.max(0, (S.qada[k] || 0) + Number(dd));
      save(false); renderQada();
    }
    if (el.id === 'cvGo') { runConvert(); }
    if (el.id === 'cvToday') {
      const d = new Date();
      const iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const sel = document.getElementById('cvType');
      if (sel) sel.value = 'greg';
      const inp = document.getElementById('cvIn');
      if (inp) inp.value = iso;
      runConvert();
    }
    if (el.id === 'shareTimes') {
      const p = place(), tms = timesFor(dayStart(p, 0), p);
      const lines = ['اوقات شرعی ' + p.name + ' — افق شرعی'];
      PRAYERS.forEach(([k, n]) => lines.push(n + ': ' + hm(tms[k].min)));
      const text = lines.join('\n');
      if (navigator.share) navigator.share({ title: 'اوقات شرعی', text: text }).catch(function(){});
      else if (navigator.clipboard) { navigator.clipboard.writeText(text); alert('اوقات در کلیپ‌بورد کپی شد'); }
    }
  });
  document.addEventListener('input', e => {
    if (e.target.id === 'cSearch') {
      const q = e.target.value.trim();
      const prov = (document.getElementById('provFilter') || {}).value || '';
      document.querySelectorAll('#cList .city').forEach(b => {
        const matchQ = !q || (b.dataset.search || '').indexOf(q) >= 0;
        const matchP = !prov || b.dataset.prov === prov;
        b.style.display = (matchQ && matchP) ? '' : 'none';
      });
    }
    if (e.target.id === 'vol') { S.volume = e.target.value / 100; document.getElementById('volV').textContent = fa(e.target.value) + '٪'; }
    if (e.target.id === 'ovVol') Native.volume(e.target.value / 100);   // live volume on the azan screen
  });
  document.addEventListener('change', e => {
    if (e.target.id === 'cvType') {
      const inp = document.getElementById('cvIn');
      if (!inp) return;
      if (e.target.value === 'greg') inp.placeholder = '2026-11-13';
      else if (e.target.value === 'shamsi') inp.placeholder = '1404/08/22';
      else inp.placeholder = '1447/05/22';
    }
    if (e.target.id === 'vol') save();
    if (e.target.id === 'pre') { S.pre = parseInt(e.target.value, 10); save(); }
    if (e.target.id === 'preFajr') { S.preFajr = e.target.value === '' ? null : parseInt(e.target.value, 10); save(); }
    if (e.target.id === 'qStart') { S.quietStart = parseInt(e.target.value, 10) || 23; save(); }
    if (e.target.id === 'qEnd') { S.quietEnd = parseInt(e.target.value, 10) || 5; save(); }
    if (e.target.id === 'hj') { S.hijriOffset = parseInt(e.target.value, 10); save(false); }
    if (e.target.id === 'fontScale') {
      S.fontScale = parseFloat(e.target.value) || 1;
      applyUiPrefs(); save(false);
    }
    if (e.target.id === 'qOff') {
      S.qiblaOffset = parseInt(e.target.value, 10) || 0;
      save(false);
      const p = place();
      startQiblaCompass(PT.qibla(p.lat, p.lng));
    }
    if (e.target.id === 'provFilter') {
      const prov = e.target.value;
      document.querySelectorAll('#cList .city').forEach(b => {
        const matchProv = !prov || b.dataset.prov === prov;
        const q = (document.getElementById('cSearch') || {}).value || '';
        const matchQ = !q.trim() || (b.dataset.search || '').indexOf(q.trim()) >= 0;
        b.style.display = (matchProv && matchQ) ? '' : 'none';
      });
    }

    if (e.target.id === 'bkFile' && e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const o = JSON.parse(reader.result);
          if (!o || typeof o !== 'object') throw new Error('فرمت نامعتبر');
          const m = Object.assign({}, DEF, o, { enabled: Object.assign({}, DEF.enabled, o.enabled || {}), offsets: Object.assign({}, o.offsets || {}) });
          if (m.muezzins) m.muezzins = m.muezzins.map(x => (x.id === 'afasy' && !x.path) ? Object.assign({}, x, { name: 'اذان پیش‌فرض' }) : x);
          S = m; save(); applyUiPrefs();
          document.getElementById('bkMsg').textContent = 'تنظیمات با موفقیت بازیابی شد.';
          setTimeout(() => go('settings'), 800);
        } catch (err) {
          document.getElementById('bkMsg').textContent = 'بازیابی ناموفق: ' + (err.message || err);
        }
      };
      reader.readAsText(f);
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { stopQiblaCompass(); }
    else {
      schedule(); pollAzan();
      if (page === 'home') renderHome();
      if (page === 'qibla') { const p = place(); startQiblaCompass(PT.qibla(p.lat, p.lng)); }
    }
  });

  // اولین ورود: راه‌اندازی شهر و دسترسی‌ها
  applyUiPrefs();
  if (window.matchMedia) {
    const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystemThemeChange = () => { if (S.themeMode === 'system') applyUiPrefs(); };
    if (systemThemeQuery.addEventListener) systemThemeQuery.addEventListener('change', onSystemThemeChange);
    else if (systemThemeQuery.addListener) systemThemeQuery.addListener(onSystemThemeChange);
  }
  if (!S.setupDone) page = 'setup';
  stack = [page]; try { history.replaceState({ i: 0 }, ''); } catch (e) {}
  render();
  if (S.setupDone) schedule();
  setInterval(tick, 1000);
  setInterval(pollAzan, 1000);
  // shake → dhikr count
  let lastShake = 0;
  window.addEventListener('devicemotion', e => {
    if (!S.shakeDhikr || page !== 'dhikr') return;
    const a = e.accelerationIncludingGravity;
    if (!a) return;
    const force = Math.abs(a.x) + Math.abs(a.y) + Math.abs(a.z);
    const now = Date.now();
    if (force > 25 && now - lastShake > 600) {
      lastShake = now;
      S.dhikrCount = (S.dhikrCount || 0) + 1;
      dhikrUpdate();
      const d = dhikrState();
      vib(d.tg && d.cur === d.tg ? 'done' : 'tap');
      save(false);
    }
  }, { passive: true });
})();
