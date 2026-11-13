/* AzanGo prayer-time engine.
   Supports multiple methods. Default: Institute of Geophysics, University of Tehran
   (Fajr 17.7°, Maghrib 4.5°, Isha 14°, standard Asr shadow factor 1).
   Algorithm structure follows the well-known PrayTimes.org approach. */
(function (root) {
  'use strict';
  const R = Math.PI / 180;
  const sin = d => Math.sin(d * R), cos = d => Math.cos(d * R), tan = d => Math.tan(d * R);
  const asin = x => Math.asin(x) / R, acos = x => Math.acos(x) / R;
  const atan2 = (y, x) => Math.atan2(y, x) / R, acot = x => Math.atan(1 / x) / R;
  const fix = (a, b) => { a = a - b * Math.floor(a / b); return a < 0 ? a + b : a; };

  const METHODS = {
    tehran:   { name: 'مؤسسه ژئوفیزیک تهران', fajr: 17.7, maghrib: 4.5, isha: 14, asrFactor: 1, riseSet: 0.833 },
    mwl:      { name: 'لیگ جهانی مسلمانان (MWL)', fajr: 18, maghrib: 0, isha: 17, asrFactor: 1, riseSet: 0.833 },
    isna:     { name: 'انجمن اسلامی آمریکای شمالی (ISNA)', fajr: 15, maghrib: 0, isha: 15, asrFactor: 1, riseSet: 0.833 },
    egypt:    { name: 'هیئت بررسی مصر', fajr: 19.5, maghrib: 0, isha: 17.5, asrFactor: 1, riseSet: 0.833 },
    karachi:  { name: 'دانشگاه علوم اسلامی کراچی', fajr: 18, maghrib: 0, isha: 18, asrFactor: 1, riseSet: 0.833 },
    ummalqura:{ name: 'ام‌القرى (عربستان)', fajr: 18.5, maghrib: 0, isha: 90, asrFactor: 1, riseSet: 0.833 }, // isha = 90 min after maghrib
    jafari:   { name: 'جعفری (شیعه)', fajr: 16, maghrib: 4, isha: 14, asrFactor: 1, riseSet: 0.833 }
  };

  function julian(y, m, d) {
    if (m <= 2) { y -= 1; m += 12; }
    const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
  }
  function sunPos(jd) {
    const D = jd - 2451545.0;
    const g = fix(357.529 + 0.98560028 * D, 360);
    const q = fix(280.459 + 0.98564736 * D, 360);
    const L = fix(q + 1.915 * sin(g) + 0.020 * sin(2 * g), 360);
    const e = 23.439 - 0.00000036 * D;
    const RA = atan2(cos(e) * sin(L), cos(L)) / 15;
    return { decl: asin(sin(e) * sin(L)), eqt: q / 15 - fix(RA, 24) };
  }

  /** Returns {fajr,sunrise,dhuhr,asr,maghrib,isha}: each {min (minutes from local midnight), ms (UTC epoch ms)}.
   *  tz = UTC offset in hours of the place (e.g. 3.5 for Iran).
   *  methodId = key from METHODS or a custom object. */
  function compute(y, m, d, lat, lng, tz, methodId) {
    const M = (typeof methodId === 'string' ? METHODS[methodId] : methodId) || METHODS.tehran;
    const jd = julian(y, m, d) - lng / (15 * 24);
    const mid = t => fix(12 - sunPos(jd + t).eqt, 24);
    const angleTime = (ang, t, ccw) => {
      const decl = sunPos(jd + t).decl;
      const x = (-sin(ang) - sin(decl) * sin(lat)) / (cos(decl) * cos(lat));
      if (x < -1 || x > 1) return NaN;
      const dt = acos(x) / 15;
      return mid(t) + (ccw ? -dt : dt);
    };
    const asrTime = (f, t) => {
      const decl = sunPos(jd + t).decl;
      return angleTime(-acot(f + tan(Math.abs(lat - decl))), t, false);
    };
    let t = { fajr: 5, sunrise: 6, dhuhr: 12, asr: 13, maghrib: 18, isha: 18 };
    for (let i = 0; i < 3; i++) {
      const p = {}; for (const k in t) p[k] = t[k] / 24;
      t = {
        fajr: angleTime(M.fajr, p.fajr, true),
        sunrise: angleTime(M.riseSet, p.sunrise, true),
        dhuhr: mid(p.dhuhr),
        asr: asrTime(M.asrFactor, p.asr),
        maghrib: M.maghrib ? angleTime(M.maghrib, p.maghrib, false) : angleTime(M.riseSet, p.maghrib, false),
        isha: M.isha >= 60 ? null : angleTime(M.isha, p.isha, false) // special handling below
      };
    }
    // Umm al-Qura style: isha = maghrib + fixed minutes
    if (M.isha >= 60) {
      t.isha = t.maghrib + M.isha / 60;
    }
    // midnight ≈ midpoint maghrib → next fajr; imsak ≈ fajr − 10 min
    if (!isNaN(t.maghrib) && !isNaN(t.fajr)) t.midnight = t.maghrib + ((t.fajr + 24) - t.maghrib) / 2;
    if (!isNaN(t.fajr)) t.imsak = t.fajr - 10 / 60;
    const base = Date.UTC(y, m - 1, d), out = {};
    for (const k in t) {
      if (t[k] == null || isNaN(t[k])) { out[k] = { min: 0, ms: 0 }; continue; }
      const h = t[k] + tz - lng / 15;
      const min = Math.round(h * 60);
      out[k] = { min, ms: base + min * 60000 - tz * 3600000 };
    }
    return out;
  }

  /** Qibla direction in degrees from True North (clockwise). Kaaba: 21.4225 N, 39.8262 E */
  function qibla(lat, lng) {
    const kaabaLat = 21.4225, kaabaLng = 39.8262;
    const dLng = (kaabaLng - lng) * R;
    const lat1 = lat * R, lat2 = kaabaLat * R;
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    let brng = Math.atan2(y, x) / R;
    return fix(brng, 360);
  }

  const api = { compute, METHODS, qibla, METHOD: METHODS.tehran };
  if (typeof module !== 'undefined') module.exports = api; else root.PT = api;
})(this);
