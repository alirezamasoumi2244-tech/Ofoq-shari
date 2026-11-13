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
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8"/>',
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
    gps: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><path d="M5.6 5.6l2 2M16.4 16.4l2 2M16.4 5.6l-2 2M5.6 16.4l2-2"/>'
  };
  const ic = n => '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' + PATHS[n] + '</svg>';
  const ICON = { fajr: ic('fajr'), sunrise: ic('sunrise'), dhuhr: ic('sun'), asr: ic('asr'), maghrib: ic('sunset'), isha: ic('moon') };
  const SHORT = { fajr: 'صبح', sunrise: 'طلوع آفتاب', dhuhr: 'ظهر', asr: 'عصر', maghrib: 'مغرب', isha: 'عشا' };
  const DEF = {
    cityId: 'tehran', custom: null,
    enabled: { fajr: true, dhuhr: true, asr: false, maghrib: true, isha: false },
    volume: 1, pre: 0, offsets: {}, muezzinId: 'afasy', hijriOffset: 0,
    muezzins: [{ id: 'afasy', name: 'اذان پیش‌فرض', path: '', file: '' }],
    setupDone: false,
    method: 'tehran',
    fontScale: 1,
    highContrast: false,
    theme: 'green',          // green | blue | sand
    qada: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0, fast: 0 },
    dhikrCount: 0, dhikrTarget: 33, dhikrName: 'سبحان الله',
    notes: {},               // 'YYYY-M-D' -> text
    vibrateQibla: true,
    showImsak: true,
    showMidnight: true,
    ramadanMode: false,
    streak: { days: 0, last: '' },
    shakeDhikr: true,
    amoled: false
  };
  const APP_VERSION = '1.3.0';
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
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  let S = load();
  function load() {
    try {
      const raw = localStorage.getItem('azango');
      const o = JSON.parse(raw || '{}');
      const m = Object.assign({}, DEF, o, { enabled: Object.assign({}, DEF.enabled, o.enabled || {}), offsets: Object.assign({}, o.offsets || {}) });
      m.muezzins = (m.muezzins || DEF.muezzins).map(x => (x.id === 'afasy' && !x.path) ? Object.assign({}, x, { name: 'اذان پیش‌فرض' }) : x);
      if (raw && o.setupDone === undefined) m.setupDone = true;
      if (!m.method || !METHOD_LABELS[m.method]) m.method = 'tehran';
      if (![0.9, 1, 1.15, 1.3].includes(m.fontScale)) m.fontScale = 1;
      return m;
    } catch (e) { return JSON.parse(JSON.stringify(DEF)); }
  }
  function save(resched) { localStorage.setItem('azango', JSON.stringify(S)); if (resched !== false) schedule(); }

  /* ---------- location & times ---------- */
  function place() {
    if (S.custom) return S.custom;
    return CITIES.find(c => c.id === S.cityId) || CITIES[0];
  }
  const cityNow = tz => new Date(Date.now() + tz * 3600000); // read with getUTC*
  function timesFor(dayMs, p) {
    const d = new Date(dayMs);
    const t = PT.compute(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), p.lat, p.lng, p.tz, S.method || 'tehran');
    for (const k in t) { const o = (S.offsets && S.offsets[k]) || 0; if (o) { t[k].min += o; t[k].ms += o * 60000; } }
    return t;
  }
  function applyUiPrefs() {
    document.documentElement.style.setProperty('--fs', (S.fontScale || 1));
    document.body.classList.toggle('hc', !!S.highContrast);
    document.body.dataset.theme = S.theme || 'green';
    document.body.classList.toggle('amoled', !!S.amoled);
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
    const h = new Date(c.getTime() + (S.hijriOffset || 0) * 86400000);
    const qamari = fmt('fa-IR-u-ca-islamic-civil', { day: 'numeric', month: 'long', year: 'numeric' }, h);
    const greg = fmt('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }, c);
    // numeric parts for occasions
    const sp = new Intl.DateTimeFormat('en-US-u-ca-persian', { timeZone: 'UTC', month: 'numeric', day: 'numeric' }).formatToParts(c);
    const lp = new Intl.DateTimeFormat('en-US-u-ca-islamic-civil', { timeZone: 'UTC', month: 'numeric', day: 'numeric' }).formatToParts(h);
    const get = (parts, type) => (parts.find(x => x.type === type) || {}).value;
    const shamsiMD = get(sp, 'month') + '/' + get(sp, 'day');
    const lunarMD = get(lp, 'month') + '/' + get(lp, 'day');
    return { shamsi, qamari, greg, shamsiMD, lunarMD };
  }

  /* ---------- scheduling (hands a 45-day event list to Kotlin) ---------- */
  function buildEvents() {
    const p = place(), out = [], now = Date.now();
    for (let i = 0; i < 45; i++) {
      const t = timesFor(dayStart(p, i), p);
      for (const k of AZAN) {
        if (!S.enabled[k]) continue;
        const ms = t[k].ms;
        if (ms < now - 120000) continue;
        if (S.pre > 0 && ms - S.pre * 60000 > now) out.push({ t: ms - S.pre * 60000, type: 'pre', key: k, name: SHORT[k], min: S.pre });
        out.push({ t: ms, type: 'azan', key: k, name: SHORT[k] });
      }
    }
    return out;
  }
  function muezzin() { return S.muezzins.find(m => m.id === S.muezzinId) || S.muezzins[0]; }
  function schedule() {
    if (!Native.available()) return;
    Native.schedule(buildEvents(), { path: muezzin().path || '', volume: S.volume, city: place().name });
  }

  /* ---------- UI helpers ---------- */
  const app = document.getElementById('app');
  const nav = document.getElementById('nav');
  let page = 'home', lastDay = '';
  const NAV = [['home', ic('home'), 'خانه'], ['times', ic('clock'), 'اوقات'], ['tools', ic('moon'), 'ابزار'], ['settings', ic('gear'), 'تنظیمات']];
  const SUB = { city: 'انتخاب شهر', azan: 'تنظیمات اذان', muezzin: 'مؤذن و فایل صوتی', notif: 'اعلان‌ها', about: 'درباره برنامه', method: 'روش محاسبه', qibla: 'قبله‌نما', display: 'نمایش', backup: 'پشتیبان‌گیری', privacy: 'حریم خصوصی', tools: 'ابزارها', dhikr: 'ذکرشمار', rakat: 'رکعت‌شمار', qada: 'نماز و روزه قضا', convert: 'تبدیل تاریخ', duas: 'ادعیه و اذکار', names: 'اسماء الحسنی', wudu: 'وضو و نماز', week: 'اوقات هفته', faq: 'راهنما', compare: 'مقایسه روش‌ها' };

  function go(pg) {
    if (page === 'qibla' && pg !== 'qibla') stopQiblaCompass();
    page = pg; render(); window.scrollTo(0, 0);
    if (app.classList) { app.classList.remove('enter'); void app.offsetWidth; app.classList.add('enter'); }
  }
  window.go = go;

  function header(title, back) {
    return '<header class="top">' + (back ? '<button class="back" onclick="go(\'' + back + '\')">' + ic('back') + ' بازگشت</button>' : '') + '<h1>' + title + '</h1></header>';
  }
  function toggle(id, on) {
    return '<button class="sw' + (on ? ' on' : '') + '" role="switch" aria-checked="' + on + '" data-sw="' + id + '"><span></span></button>';
  }

  /* ---------- pages ---------- */
  function renderHome() {
    const p = place(), d = dates(p), tms = timesFor(dayStart(p, 0), p), nx = nextPrayer(p);
    const occ = (typeof CONTENT !== 'undefined' && CONTENT.occFor) ? CONTENT.occFor(d.shamsiMD, d.lunarMD) : [];
    let occHtml = '';
    if (occ.length) {
      occHtml = '<div class="chip-row">' + occ.map(o => '<span class="chip">' + esc(o.text) + '</span>').join('') + '</div>';
    }
    // Ramadan focus: imsak + maghrib countdown
    let ramadan = '';
    if (S.ramadanMode && tms.imsak && tms.maghrib) {
      const now = Date.now();
      let focus = null;
      if (now < tms.imsak.ms) focus = { label: 'تا امساک', ms: tms.imsak.ms };
      else if (now < tms.maghrib.ms) focus = { label: 'تا افطار', ms: tms.maghrib.ms };
      if (focus) {
        const s = Math.max(0, Math.floor((focus.ms - now) / 1000));
        ramadan = '<section class="card ramadan"><div class="lbl">' + focus.label + '</div>' +
          '<div class="ramadan-cd" id="ramCd">' + fa(p2(Math.floor(s/3600))+':'+p2(Math.floor(s%3600/60))+':'+p2(s%60)) + '</div></section>';
      }
    }
    const streak = (S.streak && S.streak.days) ? S.streak.days : 0;
    const extra = [];
    if (S.showImsak && tms.imsak) extra.push(['امساک', tms.imsak.min]);
    if (S.showMidnight && tms.midnight) extra.push(['نیمه‌شب', tms.midnight.min]);
    app.innerHTML =
      '<section class="hero clean">' +
        '<div class="hero-top"><span class="pill soft">' + ic('pin') + ' ' + esc(p.name) + '</span>' +
        (streak ? '<span class="pill streak">پیوستگی ' + fa(streak) + ' روز</span>' : '') + '</div>' +
        '<div id="clock" class="clock">--:--:--</div>' +
        '<div class="dates"><div class="d1">' + esc(d.shamsi) + '</div><div class="d2">' + esc(d.qamari) + '</div></div>' +
        occHtml +
      '</section>' +
      ramadan +
      '<section class="next clean">' +
        '<div class="next-grid">' +
          '<div><div class="lbl">اذان بعدی</div><div class="nx-name" id="nxName">' + (nx ? SHORT[nx.key] : '—') + '</div></div>' +
          '<div id="cd" class="cd">--:--:--</div>' +
        '</div>' +
      '</section>' +
      '<section class="list clean">' +
        PRAYERS.map(([k, n]) =>
          '<div class="row' + (nx && nx.key === k ? ' hl' : '') + '"><span><i>' + ICON[k] + '</i>' + n + '</span><b>' + hm(tms[k].min) + '</b></div>').join('') +
        extra.map(([n, min]) => '<div class="row dim"><span>' + n + '</span><b>' + hm(min) + '</b></div>').join('') +
      '</section>' +
      '<div class="actions">' +
        '<button class="btn primary" id="namazMode">' + ic('check') + ' حالت نماز</button>' +
        '<button class="btn ghost" onclick="go(\'qibla\')">' + ic('compass') + ' قبله</button>' +
        '<button class="btn ghost" onclick="go(\'dhikr\')">' + ic('moon') + ' ذکر</button>' +
        '<button class="btn ghost" onclick="go(\'compare\')">مقایسه روش‌ها</button>' +
      '</div>';
    tick();
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
    app.innerHTML = header('تنظیمات') + '<section class="menu">' +
      [['tools', ic('moon'), 'ابزارهای مذهبی', 'ذکر، رکعت، دعا، قضا'],
       ['city', ic('pin'), 'انتخاب شهر', place().name],
       ['method', ic('clock'), 'روش محاسبه اوقات', METHOD_LABELS[S.method] || 'تهران'],
       ['qibla', ic('compass'), 'قبله‌نما', 'جهت قبله از موقعیت شما'],
       ['azan', ic('sound'), 'تنظیمات اذان', 'روشن/خاموش، صدا، آزمایش'],
       ['muezzin', ic('mic'), 'مؤذن و فایل صوتی', muezzin().name],
       ['notif', ic('bell'), 'اعلان‌ها', 'قبل از اذان، باتری'],
       ['display', ic('text'), 'نمایش و دسترسی‌پذیری', 'اندازه فونت و کنتراست'],
       ['backup', ic('save'), 'پشتیبان‌گیری تنظیمات', 'خروجی و بازیابی'],
       ['privacy', ic('shield'), 'حریم خصوصی', 'سیاست حفظ حریم خصوصی'],
       ['about', ic('info'), 'درباره برنامه', 'نسخه ' + APP_VERSION]]
        .map(([id, icn, t, s]) => '<button class="mi" onclick="go(\'' + id + '\')"><i>' + icn + '</i><span><b>' + t + '</b><small>' + esc(s) + '</small></span><em>' + ic('chev') + '</em></button>').join('') + '</section>';
  }
  function renderCity() {
    const c = S.custom;
    app.innerHTML = header('انتخاب شهر', 'settings') +
      '<button class="btn wide" id="cGps" style="margin-bottom:12px">' + ic('gps') + ' استفاده از موقعیت فعلی (GPS)</button>' +
      '<div id="gpsMsg" class="hint" style="margin-bottom:10px"></div>' +
      '<input id="cSearch" type="search" placeholder="جستجوی شهر یا استان" autocomplete="off"><section class="menu" id="cList">' +
      CITIES.slice().sort((p, q) => p.name.localeCompare(q.name, 'fa')).map(x => '<button class="mi city' + (!S.custom && S.cityId === x.id ? ' sel' : '') + '" data-city="' + x.id + '" data-search="' + x.name + ' ' + x.prov + '"><span><b>' + x.name + '</b><small>استان ' + x.prov + '</small></span><em>' + (!S.custom && S.cityId === x.id ? ic('check') : '') + '</em></button>').join('') + '</section>' +
      '<h2>موقعیت دستی</h2><section class="form"><label>نام<input id="cName" value="' + esc(c ? c.name : '') + '" placeholder="مثلاً روستای من"></label>' +
      '<label>عرض جغرافیایی<input id="cLat" inputmode="decimal" dir="ltr" value="' + (c ? c.lat : '') + '" placeholder="35.6892"></label>' +
      '<label>طول جغرافیایی<input id="cLng" inputmode="decimal" dir="ltr" value="' + (c ? c.lng : '') + '" placeholder="51.3890"></label>' +
      '<label>اختلاف ساعت با UTC<input id="cTz" inputmode="decimal" dir="ltr" value="' + (c ? c.tz : '3.5') + '"></label>' +
      '<button class="btn" id="cSave">ذخیره موقعیت دستی</button><div id="cMsg" class="hint"></div></section>';
  }
  function renderAzan() {
    app.innerHTML = header('تنظیمات اذان', 'settings') +
      '<section class="menu">' + AZAN.map(k => '<div class="mi"><span><b>' + NAME[k] + '</b><small>پخش خودکار</small></span>' + toggle(k, S.enabled[k]) + '</div>').join('') + '</section>' +
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
    app.innerHTML = header('اعلان‌ها', 'settings') +
      '<section class="form"><label>یادآوری قبل از اذان<select id="pre">' +
      [0, 5, 10, 15, 20, 30].map(v => '<option value="' + v + '"' + (S.pre === v ? ' selected' : '') + '>' + (v ? fa(v) + ' دقیقه قبل' : 'خاموش') + '</option>').join('') + '</select></label>' +
      '<div id="st" class="hint">در حال بررسی وضعیت…</div>' +
      '<button class="btn" id="nAsk">اجازه نمایش اعلان</button><button class="btn" id="nBat">خارج کردن از محدودیت باتری</button><button class="btn alt" id="nApp">تنظیمات برنامه در اندروید</button></section>' +
      '<p class="hint">در گوشی‌های سامسونگ، شیائومی، هواوی، اوپو و … علاوه بر این، گزینه‌های «شروع خودکار / Autostart» و «بدون محدودیت باتری» را برای افق شرعی فعال کنید. اگر برنامه را از «توقف اجباری (Force Stop)» ببندید، اندروید تا باز شدن دوباره برنامه اجازه اجرای هیچ زمان‌بندی را نمی‌دهد.</p>';
    Native.status().then(s => {
      const el = document.getElementById('st'); if (!el) return;
      if (!s) { el.textContent = 'این صفحه فقط روی گوشی وضعیت را نشان می‌دهد.'; return; }
      el.innerHTML = 'اعلان: <b>' + (s.notifications ? 'فعال' : 'غیرفعال') + '</b><br>بدون محدودیت باتری: <b>' + (s.ignoringBattery ? 'بله' : 'خیر') + '</b>' +
        (s.fullScreen === undefined ? '' : '<br>نمایش اذان روی صفحه قفل: <b>' + (s.fullScreen ? 'مجاز' : 'غیرمجاز') + '</b>' + (s.fullScreen ? '' : '<br><button class="btn" id="nFs" style="margin-top:8px">اجازه نمایش روی صفحه قفل</button>'));
    });
  }
  function renderAbout() {
    app.innerHTML = header('درباره برنامه', 'settings') +
      '<section class="card"><h3>افق شرعی</h3><p><b>نسخه ' + fa(APP_VERSION) + '</b> — اوقات شرعی، اذان و قبله‌نما برای کاربران فارسی‌زبان، با رابط بزرگ و ساده.</p>' +
      '<p>روش پیش‌فرض: مؤسسه ژئوفیزیک دانشگاه تهران. می‌توانید روش محاسبه را در تنظیمات تغییر دهید.</p>' +
      '<p class="hint">اوقات را با تقویم رسمی شهر خود مقایسه کنید؛ اختلاف چند دقیقه‌ای ممکن است. از «اصلاح دقیقه» در تنظیمات اذان استفاده کنید.</p>' +
      '<div class="form"><label>اصلاح تاریخ قمری<select id="hj">' + [-2, -1, 0, 1, 2].map(v => '<option value="' + v + '"' + (S.hijriOffset === v ? ' selected' : '') + '>' + (v > 0 ? '+' : '') + fa(v) + ' روز</option>').join('') + '</select></label></div></section>' +
      '<section class="card"><h3>تغییرات نسخه ۱٫۱</h3><ul class="hint" style="padding-right:18px;margin:0">' +
      '<li>روش‌های محاسبه مختلف (تهران، MWL، ISNA و …)</li><li>قبله‌نما</li><li>موقعیت‌یابی GPS</li><li>اندازه فونت و کنتراست بالا</li><li>پشتیبان‌گیری تنظیمات</li><li>صفحه حریم خصوصی</li></ul></section>' +
      '<section class="card"><h3>ما را دنبال کنید</h3>' +
      '<p class="hint" style="margin:0 0 10px">با دنبال کردن صفحهٔ ما در گیت‌هاب، از نسخه‌های جدید زودتر باخبر می‌شوید و با ستاره‌دادن به پروژه، به بهتر شدن افق شرعی کمک می‌کنید.</p>' +
      '<button class="btn wide" id="ghOpen" type="button">⭐ دنبال کردن در گیت‌هاب</button></section>' +
      '<p class="hint" style="text-align:center;margin-top:12px">تمام داده‌ها فقط روی دستگاه شما ذخیره می‌شوند.</p>';
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
    qiblaBearing = bearing;
    qiblaSmooth = 0;
    const onOrient = (e) => {
      // Absolute heading if available; else webkitCompassHeading (iOS); else alpha (relative)
      let heading = null;
      if (typeof e.webkitCompassHeading === 'number' && !isNaN(e.webkitCompassHeading)) {
        heading = e.webkitCompassHeading; // 0 = North, clockwise
      } else if (e.absolute && typeof e.alpha === 'number' && !isNaN(e.alpha)) {
        heading = (360 - e.alpha) % 360; // alpha is counterclockwise from north on many Android
      } else if (typeof e.alpha === 'number' && !isNaN(e.alpha)) {
        heading = (360 - e.alpha) % 360;
      }
      if (heading == null) return;
      // Shortest-path smoothing
      let diff = heading - qiblaSmooth;
      while (diff > 180) diff -= 360;
      while (diff < -180) diff += 360;
      qiblaSmooth = (qiblaSmooth + diff * 0.25 + 360) % 360;
      qiblaHeading = qiblaSmooth;
      const arrow = document.getElementById('qArrow');
      const ring = document.getElementById('qRing');
      const status = document.getElementById('qStatus');
      const liveDeg = document.getElementById('qLive');
      if (!arrow) return;
      // Arrow points to Qibla relative to phone: rotate so Qibla is "up" when phone faces it
      const rot = (qiblaBearing - qiblaHeading + 360) % 360;
      arrow.style.transform = 'rotate(' + rot + 'deg)';
      if (ring) ring.style.transform = 'rotate(' + (-qiblaHeading) + 'deg)'; // north marker stays with world
      if (liveDeg) liveDeg.textContent = fa(Math.round(rot)) + '°';
      if (status) {
        const aligned = Math.min(Math.abs(rot), 360 - Math.abs(rot)) < 8;
        const beta = typeof e.beta === 'number' ? e.beta : 0;
        const gamma = typeof e.gamma === 'number' ? e.gamma : 0;
        const flat = Math.abs(beta) < 25 && Math.abs(gamma) < 25;
        let msg = aligned ? '✓ رو به قبله هستید' : 'گوشی را بچرخانید تا فلش بالا برود';
        if (!flat) msg += ' · گوشی را صاف نگه دارید';
        status.textContent = msg;
        status.className = 'hint' + (aligned && flat ? ' q-ok' : '');
        const lv = document.getElementById('qLevel');
        if (lv) lv.textContent = flat ? 'تراز افقی ✓' : 'کج — صاف کنید';
      }
    };
    qiblaListener = onOrient;
    // Prefer absolute orientation
    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute', onOrient, true);
    } else {
      window.addEventListener('deviceorientation', onOrient, true);
    }
    // Some browsers need permission (iOS 13+)
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().then(state => {
        const el = document.getElementById('qStatus');
        if (state !== 'granted' && el) el.textContent = 'اجازه دسترسی به حسگر جهت لازم است.';
      }).catch(() => {});
    }
  }
  function renderQibla() {
    const p = place();
    const deg = PT.qibla(p.lat, p.lng);
    const degFa = fa(Math.round(deg));
    app.innerHTML = header('قبله‌نما', 'settings') +
      '<section class="card qibla-card">' +
      '<div class="qibla-ring" id="qRing"><div class="qibla-marks" aria-hidden="true">' +
      '<span class="qm n">ش</span><span class="qm e">ق</span><span class="qm s">ج</span><span class="qm w">غ</span></div>' +
      '<div class="qibla-arrow" id="qArrow"></div>' +
      '<div class="qibla-kaaba">کعبه</div></div>' +
      '<div class="qibla-deg" id="qLive">' + degFa + '°</div>' +
      '<p class="hint" id="qStatus">در حال اتصال به قطب‌نما… گوشی را صاف نگه دارید</p></section>' +
      '<p class="hint" id="qLevel">تراز افقی…</p>' +
      '<p class="hint">زاویه قبله از شمال: <b>' + degFa + '°</b> · موقعیت: <b>' + esc(p.name) + '</b></p>' +
      '<p class="hint">فلش سبز همیشه به سمت قبله می‌چرخد. وقتی فلش دقیقاً بالا باشد، رو به قبله ایستاده‌اید. از تداخل فلز و آهنربا دوری کنید.</p>';
    // start after DOM paint
    setTimeout(() => startQiblaCompass(deg), 50);
  }
  function renderDisplay() {
    const scales = [[0.9, 'کوچک'], [1, 'متوسط (پیش‌فرض)'], [1.15, 'بزرگ'], [1.3, 'خیلی بزرگ']];
    app.innerHTML = header('نمایش و دسترسی‌پذیری', 'settings') +
      '<section class="form"><label>اندازه نوشته<select id="fontScale">' +
      scales.map(([v, n]) => '<option value="' + v + '"' + (S.fontScale === v ? ' selected' : '') + '>' + n + '</option>').join('') +
      '</select></label></section>' +
      '<section class="menu"><div class="mi"><span><b>کنتراست بالا</b><small>پس‌زمینه تیره‌تر و متن روشن‌تر</small></span>' +
      '<button class="sw' + (S.highContrast ? ' on' : '') + '" data-hc="1" aria-label="کنتراست بالا"></button></div></section>' +
      '<section class="menu">' +
      '<div class="mi"><span><b>تم سیاه خالص (AMOLED)</b><small>صرفه‌جویی باتری</small></span>' +
      '<button class="sw' + (S.amoled ? ' on' : '') + '" data-amoled="1"></button></div>' +
      '<div class="mi"><span><b>حالت رمضان</b><small>نمایش امساک و افطار برجسته</small></span>' +
      '<button class="sw' + (S.ramadanMode ? ' on' : '') + '" data-ramadan="1"></button></div>' +
      '<div class="mi"><span><b>تکان برای ذکر</b><small>با تکان دادن گوشی بشمار</small></span>' +
      '<button class="sw' + (S.shakeDhikr ? ' on' : '') + '" data-shake="1"></button></div></section>' +
      '<p class="hint">این تنظیمات برای سالمندان و خوانایی بهتر در نور کم طراحی شده‌اند.</p>';
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
      '<section class="card"><h3>سیاست حفظ حریم خصوصی — افق شرعی</h3>' +
      '<p>این برنامه <b>هیچ داده‌ای به سرور ارسال نمی‌کند</b>. تمام اطلاعات (شهر، تنظیمات اذان، فایل صوتی انتخابی، اصلاحات) فقط روی دستگاه شما و در حافظه محلی برنامه ذخیره می‌شود.</p>' +
      '<p>موقعیت GPS فقط وقتی خودتان دکمه «موقعیت فعلی» را بزنید استفاده می‌شود و روی دستگاه می‌ماند؛ به اینترنت یا شخص ثالث فرستاده نمی‌شود.</p>' +
      '<p>اعلان‌ها و سرویس پخش اذان فقط برای عملکرد برنامه لازم هستند و هیچ آمار یا ردیابی جمع‌آوری نمی‌شود.</p>' +
      '<p>فایل‌های صوتی اذان که وارد می‌کنید فقط در حافظه خصوصی برنامه کپی می‌شوند.</p>' +
      '<p class="hint">آخرین به‌روزرسانی: آبان ۱۴۰۴ · نسخه ' + fa(APP_VERSION) + '</p></section>';
  }
  function renderSetup() {
    const selected = place();
    app.innerHTML =
      '<section class="hero setup-hero"><div class="pill">' + ic('bell') + ' افق شرعی</div>' +
      '<h1 class="setup-title">خوش آمدید</h1>' +
      '<p class="setup-desc">برای شروع، شهر خود را انتخاب کنید و دسترسی‌های لازم را بدهید تا اذان در زمان مناسب پخش شود.</p></section>' +
      '<section class="card setup-card"><h3>' + ic('pin') + ' انتخاب شهر</h3>' +
      '<input id="cSearch" type="search" placeholder="جستجوی شهر یا استان" autocomplete="off">' +
      '<div class="setup-city-list" id="cList">' +
      CITIES.slice().sort((p, q) => p.name.localeCompare(q.name, 'fa')).map(x =>
        '<button class="mi city' + (!S.custom && S.cityId === x.id ? ' sel' : '') + '" data-city="' + x.id + '" data-search="' + x.name + ' ' + x.prov + '">' +
        '<span><b>' + x.name + '</b><small>استان ' + x.prov + '</small></span><em>' + (!S.custom && S.cityId === x.id ? ic('check') : '') + '</em></button>'
      ).join('') + '</div>' +
      '<p class="hint setup-sel">شهر فعلی: <b>' + esc(selected.name) + '</b></p></section>' +
      '<section class="card setup-card"><h3>' + ic('bell') + ' دسترسی‌ها</h3>' +
      '<p class="hint">برای پخش اذان و نمایش اعلان، اجازه اعلان‌ها لازم است. در گوشی‌های سامسونگ، شیائومی و هواوی بعداً «شروع خودکار» و «بدون محدودیت باتری» را هم فعال کنید.</p>' +
      '<button class="btn" id="nAsk">' + ic('bell') + ' اجازه نمایش اعلان</button>' +
      '<button class="btn alt" id="nBat">خارج کردن از محدودیت باتری</button>' +
      '<div id="st" class="hint">وضعیت دسترسی بعد از درخواست نمایش داده می‌شود.</div></section>' +
      '<button class="btn wide setup-finish" id="setupDone">شروع استفاده از افق شرعی</button>' +
      '<p class="hint" style="text-align:center;margin-top:8px">پیش‌فرض: اذان صبح، ظهر و مغرب روشن · یادآوری قبل از اذان خاموش</p>';
    // به‌روزرسانی وضعیت دسترسی اگر روی گوشی باشیم
    if (Native.available()) {
      Native.status().then(s => {
        const el = document.getElementById('st'); if (!el || !s) return;
        el.innerHTML = 'اعلان: <b>' + (s.notifications ? 'فعال ✓' : 'غیرفعال') + '</b> · بدون محدودیت باتری: <b>' + (s.ignoringBattery ? 'بله ✓' : 'خیر') + '</b>';
      });
    }
  }

  function renderTools() {
    app.innerHTML = header('ابزارهای مذهبی') + '<section class="menu">' +
      [
        ['dhikr', ic('moon'), 'ذکرشمار (تسبیح)', 'شمارش ذکر با لمس یا ویبره'],
        ['rakat', ic('check'), 'رکعت‌شمار', 'شمارش رکعات نماز'],
        ['qada', ic('clock'), 'نماز و روزه قضا', 'ثبت و پیگیری قضا'],
        ['duas', ic('mic'), 'ادعیه و اذکار', 'اذکار صبح و شام، دعاهای کوتاه'],
        ['names', ic('sun'), 'اسماء الحسنی', '۹۹ نام خداوند'],
        ['wudu', ic('sound'), 'راهنمای وضو و نماز', 'مراحل وضو و رکعات'],
        ['convert', ic('clock'), 'تبدیل تاریخ', 'شمسی ↔ قمری ↔ میلادی'],
        ['week', ic('clock'), 'اوقات هفته', 'جدول ۷ روز آینده'],
        ['qibla', ic('compass'), 'قبله‌نما', 'جهت زنده قبله'],
        ['compare', ic('clock'), 'مقایسه روش‌های محاسبه', 'جدول چند روش کنار هم'],
        ['faq', ic('info'), 'راهنما و نکات', 'سوالات پرتکرار']
      ].map(([id, icn, title, sub]) =>
        '<button class="mi" onclick="go(\'' + id + '\')"><i>' + icn + '</i><span><b>' + title + '</b><small>' + sub + '</small></span><em>' + ic('chev') + '</em></button>'
      ).join('') + '</section>';
  }
  function renderDhikr() {
    const presets = (CONTENT && CONTENT.DHIKR_PRESETS) || [];
    app.innerHTML = header('ذکرشمار', 'tools') +
      '<section class="card dhikr-card"><div class="dhikr-count" id="dkCount">' + fa(S.dhikrCount || 0) + '</div>' +
      '<div class="hint" id="dkName">' + esc(S.dhikrName || 'سبحان الله') + '</div>' +
      '<div class="hint">هدف: ' + fa(S.dhikrTarget || 33) + '</div>' +
      '<button class="btn wide dhikr-tap" id="dkTap">بزن برای شمارش</button>' +
      '<div class="quick"><button class="btn alt" id="dkReset">صفر</button><button class="btn alt" id="dkVib">' + (S.vibrateQibla ? 'ویبره روشن' : 'ویبره خاموش') + '</button></div></section>' +
      '<h2>انتخاب ذکر</h2><section class="menu">' +
      presets.map(d => '<button class="mi" data-dk="' + d.id + '"><span><b>' + esc(d.name) + '</b><small>هدف ' + fa(d.target) + '</small></span></button>').join('') +
      '</section>';
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
      '<section class="form"><label>تاریخ میلادی (نمونه: ۲۰۲۶-۱۱-۱۳)<input id="cvIn" dir="ltr" placeholder="YYYY-MM-DD"></label>' +
      '<button class="btn" id="cvGo">تبدیل</button><div id="cvOut" class="card" style="margin-top:12px;min-height:80px"></div></section>' +
      '<p class="hint">تاریخ امروز دستگاه هم به‌صورت زنده در صفحه اصلی با سه تقویم نمایش داده می‌شود.</p>';
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
    app.innerHTML = header('راهنما', 'tools') +
      '<section class="card"><h3>اذان پخش نمی‌شود؟</h3><p class="hint">۱) اعلان‌ها را مجاز کنید ۲) محدودیت باتری را بردارید ۳) در شیائومی/سامسونگ «شروع خودکار» را روشن کنید ۴) از Force Stop استفاده نکنید.</p></section>' +
      '<section class="card"><h3>اوقات چند دقیقه فرق دارد؟</h3><p class="hint">روش محاسبه را در تنظیمات عوض کنید یا از «اصلاح دقیقه» برای هر وقت استفاده کنید. ارتفاع محل و جدول‌های رسمی گاهی ۱–۳ دقیقه اختلاف دارند.</p></section>' +
      '<section class="card"><h3>قبله دقیق نیست؟</h3><p class="hint">گوشی را به شکل عدد ۸ حرکت دهید تا قطب‌نما کالیبره شود. از فلز و آهنربا دور باشید. GPS موقعیت را دقیق‌تر می‌کند.</p></section>' +
      '<section class="card"><h3>حریم خصوصی</h3><p class="hint">همه داده‌ها فقط روی گوشی شماست؛ هیچ سروری در کار نیست.</p></section>';
  }


  const R = { home: renderHome, times: renderTimes, settings: renderSettings, city: renderCity, azan: renderAzan, muezzin: renderMuezzin, notif: renderNotif, about: renderAbout, setup: renderSetup, method: renderMethod, qibla: renderQibla, display: renderDisplay, backup: renderBackup, privacy: renderPrivacy, tools: renderTools, dhikr: renderDhikr, rakat: renderRakat, qada: renderQada, duas: renderDuas, names: renderNames, wudu: renderWudu, convert: renderConvert, week: renderWeek, faq: renderFaq, compare: renderCompare };
  function render() {
    (R[page] || renderHome)();
    if (page === 'setup') {
      nav.innerHTML = '';
      nav.style.display = 'none';
      document.getElementById('app').style.paddingBottom = '24px';
    } else {
      nav.style.display = '';
      document.getElementById('app').style.paddingBottom = '';
      const top = ['home', 'times', 'tools', 'settings'].includes(page) ? page : (['dhikr','rakat','qada','duas','names','wudu','convert','week','faq','qibla','compare'].includes(page) ? 'tools' : 'settings');
      nav.innerHTML = NAV.map(([id, icn, t]) => '<button class="' + (id === top ? 'on' : '') + '" onclick="go(\'' + id + '\')"><i>' + icn + '</i>' + t + '</button>').join('');
    }
  }

  /* ---------- live tick (GPU-friendly: minimal style writes) ---------- */
  let _ringSec = -1;
  function tick() {
    const p = place(), c = cityNow(p.tz);
    const key = c.getUTCFullYear() + '-' + c.getUTCMonth() + '-' + c.getUTCDate();
    if (page === 'home') {
      if (lastDay && key !== lastDay) { lastDay = key; renderHome(); schedule(); return; }
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
  }
  window.addEventListener('popstate', () => { ovHist = false; if (!ov.hidden) closeAzan(); });
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
        ovKey = s.startedAt; ovShown = false; ovDone = false; ov.className = '';
        ov.innerHTML = '<div class="ov-wave"></div><div class="ov-wave w2"></div><div class="ov-in"><div class="pill">' + ic('pin') + ' ' + esc(p.name) + '</div><div class="ov-icon">' + ic('moon') + '</div>' +
          '<div class="ov-title">' + (s.name ? 'وقت اذان ' + esc(s.name) : 'آزمایش صدای اذان') + '</div><div id="ovClock" class="ov-clock"></div>' +
          '<div id="ovDate" class="ov-date"></div><div id="ovMsg" class="ov-msg"></div>' +
          '<div class="ov-btns"><button id="ovMute" class="ov-btn">' + ic('soff') + ' قطع صدا</button><button id="ovClose" class="ov-btn alt">' + ic('close') + ' بستن</button></div>' +
          '<div class="ov-hint">با پایان اذان این صفحه خودکار بسته می‌شود. برای بستن زودتر، دکمه بازگشت گوشی یا «بستن» را بزنید.</div></div>';
        ov.hidden = false;
        if (!ovHist) { try { history.pushState({ azan: 1 }, ''); ovHist = true; } catch (e) {} }
      }
      const c = cityNow(p.tz);
      g('ovClock').textContent = fa(p2(c.getUTCHours()) + ':' + p2(c.getUTCMinutes()) + ':' + p2(c.getUTCSeconds()));
      g('ovDate').textContent = dates(p).shamsi;
      if (live) {
        awake(true); ovDone = false; ov.className = ''; ovMuted = !!s.muted;
        g('ovMsg').textContent = ovMuted ? 'صدا قطع شد' : '';
        if (ovShown !== ovMuted) { g('ovMute').innerHTML = ovMuted ? ic('sound') + ' پخش صدا' : ic('soff') + ' قطع صدا'; ovShown = ovMuted; }
      } else {                                                  // azan finished by itself: close the screen automatically
        closeAzan(false);
      }
    } finally { ovBusy = false; }
  }

  /* ---------- events ---------- */
  document.addEventListener('click', async e => {
    const el = e.target.closest('button'); if (!el) return;
    const msg = id => document.getElementById(id);
    if (el.dataset.sw) { S.enabled[el.dataset.sw] = !S.enabled[el.dataset.sw]; save(); return renderAzan(); }
    if (el.dataset.city) {
      S.cityId = el.dataset.city; S.custom = null; save(false);
      if (page === 'setup') return renderSetup();
      return renderCity();
    }
    if (el.id === 'setupDone') {
      S.setupDone = true; save();
      go('home');
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
    if (el.id === 'nFs') Native.fullScreenSettings();
    if (el.id === 'nAsk') {
      await Native.askNotifications();
      setTimeout(() => { if (page === 'setup') renderSetup(); else if (page === 'notif') renderNotif(); }, 800);
    }
    if (el.id === 'nBat') {
      Native.batterySettings();
      setTimeout(() => { if (page === 'setup') renderSetup(); else if (page === 'notif') renderNotif(); }, 1200);
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
    if (el.dataset.hc) {
      S.highContrast = !S.highContrast; applyUiPrefs(); save(false); renderDisplay();
    }
    if (el.dataset.theme) { S.theme = el.dataset.theme; applyUiPrefs(); save(false); renderDisplay(); }
    if (el.dataset.imsak) { S.showImsak = !S.showImsak; save(false); renderDisplay(); }
    if (el.dataset.midn) { S.showMidnight = !S.showMidnight; save(false); renderDisplay(); }
    if (el.dataset.amoled) { S.amoled = !S.amoled; applyUiPrefs(); save(false); renderDisplay(); }
    if (el.dataset.ramadan) { S.ramadanMode = !S.ramadanMode; save(false); renderDisplay(); }
    if (el.dataset.shake) { S.shakeDhikr = !S.shakeDhikr; save(false); renderDisplay(); }
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
      const elc = document.getElementById('dkCount');
      if (elc) elc.textContent = fa(S.dhikrCount);
      if (S.vibrateQibla && navigator.vibrate) navigator.vibrate(12);
      if (S.dhikrCount >= (S.dhikrTarget || 33) && S.dhikrCount % (S.dhikrTarget || 33) === 0 && navigator.vibrate) navigator.vibrate([30, 40, 30]);
      save(false);
    }
    if (el.id === 'dkReset') { S.dhikrCount = 0; save(false); renderDhikr(); }
    if (el.id === 'dkVib') { S.vibrateQibla = !S.vibrateQibla; save(false); renderDhikr(); }
    if (el.dataset.dk) {
      const pr = ((CONTENT && CONTENT.DHIKR_PRESETS) || []).find(x => x.id === el.dataset.dk);
      if (pr) { S.dhikrName = pr.name; S.dhikrTarget = pr.target; S.dhikrCount = 0; save(false); renderDhikr(); }
    }
    if (el.id === 'rkTap') {
      const elc = document.getElementById('rkCount');
      if (elc) { const n = (parseInt(elc.dataset.n || '0', 10) + 1); elc.dataset.n = n; elc.textContent = fa(n); if (navigator.vibrate) navigator.vibrate(10); }
    }
    if (el.id === 'rkReset') { const elc = document.getElementById('rkCount'); if (elc) { elc.dataset.n = 0; elc.textContent = fa(0); } }
    if (el.dataset.qada) {
      const [k, dd] = el.dataset.qada.split(':');
      if (!S.qada) S.qada = { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0, fast: 0 };
      S.qada[k] = Math.max(0, (S.qada[k] || 0) + Number(dd));
      save(false); renderQada();
    }
    if (el.id === 'cvGo') {
      const raw = (document.getElementById('cvIn').value || '').trim();
      const out = document.getElementById('cvOut');
      const m = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      if (!m) { out.textContent = 'فرمت را مثل 2026-11-13 وارد کنید.'; return; }
      const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
      const shamsi = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
      const qamari = new Intl.DateTimeFormat('fa-IR-u-ca-islamic-civil', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
      const greg = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
      out.innerHTML = '<div><b>شمسی:</b> ' + esc(shamsi) + '</div><div><b>قمری:</b> ' + esc(qamari) + '</div><div><b>میلادی:</b> ' + esc(greg) + '</div>';
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
    if (e.target.id === 'cSearch') { const q = e.target.value.trim(); document.querySelectorAll('#cList .mi').forEach(b => { b.style.display = (!q || b.dataset.search.indexOf(q) >= 0) ? '' : 'none'; }); }
    if (e.target.id === 'vol') { S.volume = e.target.value / 100; document.getElementById('volV').textContent = fa(e.target.value) + '٪'; }
  });
  document.addEventListener('change', e => {
    if (e.target.id === 'vol') save();
    if (e.target.id === 'pre') { S.pre = parseInt(e.target.value, 10); save(); }
    if (e.target.id === 'hj') { S.hijriOffset = parseInt(e.target.value, 10); save(false); }
    if (e.target.id === 'fontScale') {
      S.fontScale = parseFloat(e.target.value) || 1;
      applyUiPrefs(); save(false);
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
  if (!S.setupDone) page = 'setup';
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
      const elc = document.getElementById('dkCount');
      if (elc) elc.textContent = fa(S.dhikrCount);
      if (S.vibrateQibla && navigator.vibrate) navigator.vibrate(10);
      save(false);
    }
  }, { passive: true });
})();
