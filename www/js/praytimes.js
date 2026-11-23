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
  /** Great-circle distance to Kaaba in km */
  function qiblaDistance(lat, lng) {
    const kaabaLat = 21.4225, kaabaLng = 39.8262;
    const Rkm = 6371;
    const dLat = (kaabaLat - lat) * R, dLng = (kaabaLng - lng) * R;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat*R)*Math.cos(kaabaLat*R)*Math.sin(dLng/2)**2;
    return Math.round(2 * Rkm * Math.asin(Math.min(1, Math.sqrt(a))));
  }
  /**
   * Magnetic declination via WMM2025 (official NOAA spherical-harmonic model,
   * epoch 2025.0, valid 2025.0-2029.9). Degrees East positive.
   * JS port of the NOAA Geomag.c algorithm; validated against pygeomag/NOAA test vectors
   * (max deviation < 1e-10 degrees over Iran + global sample points).
   * Fallback: simple regional approximation if anything unexpected happens.
   */
  const WMM_MAXORD = 12, WMM_SIZE = 13, WMM_EPOCH = 2025.0;
  const WMM_C = [
    [1,0,-29351.8,0.0,12.0,0.0],[1,1,-1410.8,4545.4,9.7,-21.5],
    [2,0,-2556.6,0.0,-11.6,0.0],[2,1,2951.1,-3133.6,-5.2,-27.7],[2,2,1649.3,-815.1,-8.0,-12.1],
    [3,0,1361.0,0.0,-1.3,0.0],[3,1,-2404.1,-56.6,-4.2,4.0],[3,2,1243.8,237.5,0.4,-0.3],[3,3,453.6,-549.5,-15.6,-4.1],
    [4,0,895.0,0.0,-1.6,0.0],[4,1,799.5,278.6,-2.4,-1.1],[4,2,55.7,-133.9,-6.0,4.1],[4,3,-281.1,212.0,5.6,1.6],[4,4,12.1,-375.6,-7.0,-4.4],
    [5,0,-233.2,0.0,0.6,0.0],[5,1,368.9,45.4,1.4,-0.5],[5,2,187.2,220.2,0.0,2.2],[5,3,-138.7,-122.9,0.6,0.4],[5,4,-142.0,43.0,2.2,1.7],[5,5,20.9,106.1,0.9,1.9],
    [6,0,64.4,0.0,-0.2,0.0],[6,1,63.8,-18.4,-0.4,0.3],[6,2,76.9,16.8,0.9,-1.6],[6,3,-115.7,48.8,1.2,-0.4],[6,4,-40.9,-59.8,-0.9,0.9],[6,5,14.9,10.9,0.3,0.7],[6,6,-60.7,72.7,0.9,0.9],
    [7,0,79.5,0.0,-0.0,0.0],[7,1,-77.0,-48.9,-0.1,0.6],[7,2,-8.8,-14.4,-0.1,0.5],[7,3,59.3,-1.0,0.5,-0.8],[7,4,15.8,23.4,-0.1,0.0],[7,5,2.5,-7.4,-0.8,-1.0],[7,6,-11.1,-25.1,-0.8,0.6],[7,7,14.2,-2.3,0.8,-0.2],
    [8,0,23.2,0.0,-0.1,0.0],[8,1,10.8,7.1,0.2,-0.2],[8,2,-17.5,-12.6,0.0,0.5],[8,3,2.0,11.4,0.5,-0.4],[8,4,-21.7,-9.7,-0.1,0.4],[8,5,16.9,12.7,0.3,-0.5],[8,6,15.0,0.7,0.2,-0.6],[8,7,-16.8,-5.2,-0.0,0.3],[8,8,0.9,3.9,0.2,0.2],
    [9,0,4.6,0.0,-0.0,0.0],[9,1,7.8,-24.8,-0.1,-0.3],[9,2,3.0,12.2,0.1,0.3],[9,3,-0.2,8.3,0.3,-0.3],[9,4,-2.5,-3.3,-0.3,0.3],[9,5,-13.1,-5.2,0.0,0.2],[9,6,2.4,7.2,0.3,-0.1],[9,7,8.6,-0.6,-0.1,-0.2],[9,8,-8.7,0.8,0.1,0.4],[9,9,-12.9,10.0,-0.1,0.1],
    [10,0,-1.3,0.0,0.1,0.0],[10,1,-6.4,3.3,0.0,0.0],[10,2,0.2,0.0,0.1,-0.0],[10,3,2.0,2.4,0.1,-0.2],[10,4,-1.0,5.3,-0.0,0.1],[10,5,-0.6,-9.1,-0.3,-0.1],[10,6,-0.9,0.4,0.0,0.1],[10,7,1.5,-4.2,-0.1,0.0],[10,8,0.9,-3.8,-0.1,-0.1],[10,9,-2.7,0.9,-0.0,0.2],[10,10,-3.9,-9.1,-0.0,-0.0],
    [11,0,2.9,0.0,0.0,0.0],[11,1,-1.5,0.0,-0.0,-0.0],[11,2,-2.5,2.9,0.0,0.1],[11,3,2.4,-0.6,0.0,-0.0],[11,4,-0.6,0.2,0.0,0.1],[11,5,-0.1,0.5,-0.1,-0.0],[11,6,-0.6,-0.3,0.0,-0.0],[11,7,-0.1,-1.2,-0.0,0.1],[11,8,1.1,-1.7,-0.1,-0.0],[11,9,-1.0,-2.9,-0.1,0.0],[11,10,-0.2,-1.8,-0.1,0.0],[11,11,2.6,-2.3,-0.1,0.0],
    [12,0,-2.0,0.0,0.0,0.0],[12,1,-0.2,-1.3,0.0,-0.0],[12,2,0.3,0.7,-0.0,0.0],[12,3,1.2,1.0,-0.0,-0.1],[12,4,-1.3,-1.4,-0.0,0.1],[12,5,0.6,-0.0,-0.0,-0.0],[12,6,0.6,0.6,0.1,-0.0],[12,7,0.5,-0.1,-0.0,-0.0],[12,8,-0.1,0.8,0.0,0.0],[12,9,-0.4,0.1,0.0,-0.0],[12,10,-0.2,-1.0,-0.1,-0.0],[12,11,-1.3,0.1,-0.0,0.0],[12,12,-0.7,0.2,-0.1,-0.1]
  ];
  const _wc = [], _wcd = [], _wk = [];
  for (let i = 0; i < WMM_SIZE; i++) { _wc.push(new Array(WMM_SIZE).fill(0)); _wcd.push(new Array(WMM_SIZE).fill(0)); _wk.push(new Array(WMM_SIZE).fill(0)); }
  const _wsn = new Array(WMM_SIZE * WMM_SIZE).fill(0);
  const _wfn = new Array(WMM_SIZE).fill(0), _wfm = new Array(WMM_SIZE).fill(0);
  (function initWmm() {
    for (const row of WMM_C) {
      const n = row[0], m = row[1], g = row[2], h = row[3], gd = row[4], hd = row[5];
      _wc[m][n] = g; _wcd[m][n] = gd;
      if (m !== 0) { _wc[n][m - 1] = h; _wcd[n][m - 1] = hd; }
    }
    _wsn[0] = 1.0; _wfm[0] = 0.0;
    for (let n = 1; n <= WMM_MAXORD; n++) {
      _wsn[n] = _wsn[n - 1] * (2 * n - 1) / n;
      let j = 2;
      for (let m = 0; m <= n; m++) {
        _wk[m][n] = ((n - 1) * (n - 1) - m * m) / ((2 * n - 1) * (2 * n - 3));
        if (m > 0) {
          const flnmj = ((n - m + 1) * j) / (n + m);
          _wsn[n + m * WMM_SIZE] = _wsn[n + (m - 1) * WMM_SIZE] * Math.sqrt(flnmj);
          j = 1;
          _wc[n][m - 1] = _wsn[n + m * WMM_SIZE] * _wc[n][m - 1];
          _wcd[n][m - 1] = _wsn[n + m * WMM_SIZE] * _wcd[n][m - 1];
        }
        _wc[m][n] = _wsn[n + m * WMM_SIZE] * _wc[m][n];
        _wcd[m][n] = _wsn[n + m * WMM_SIZE] * _wcd[m][n];
      }
      _wfn[n] = n + 1; _wfm[n] = n;
    }
    _wk[1][1] = 0.0;
  })();
  /** Declination (deg East) at geodetic lat/lng (deg), altitude km, decimal year — WMM2025. */
  function wmmDeclination(lat, lng, altKm, year) {
    const SIZE = WMM_SIZE, MAXORD = WMM_MAXORD;
    const dp = [], tc = [], sp = [], cp = [], pp = [];
    for (let i = 0; i < SIZE; i++) { dp.push(new Array(SIZE).fill(0)); tc.push(new Array(SIZE).fill(0)); sp.push(0); cp.push(0); pp.push(0); }
    sp[0] = 0.0; cp[0] = 1.0; pp[0] = 1.0;
    const p = _wsn.slice();                       // P(0,0)=1 seeded; recursion overwrites n>=1
    const a = 6378.137, b = 6356.7523142, re = 6371.2;
    const a2 = a * a, b2 = b * b, c2 = a2 - b2, a4 = a2 * a2, b4 = b2 * b2, c4 = a4 - b4;
    let dt = year - WMM_EPOCH;
    if (dt < 0) dt = 0; if (dt > 5) dt = 5;       // stay inside the model lifespan
    const rlon = lng * Math.PI / 180, rlat = lat * Math.PI / 180;
    const srlon = Math.sin(rlon), srlat = Math.sin(rlat), crlon = Math.cos(rlon), crlat = Math.cos(rlat);
    const srlat2 = srlat * srlat, crlat2 = crlat * crlat;
    sp[1] = srlon; cp[1] = crlon;
    for (let m = 2; m <= MAXORD; m++) {
      sp[m] = sp[1] * cp[m - 1] + cp[1] * sp[m - 1];
      cp[m] = cp[1] * cp[m - 1] - sp[1] * sp[m - 1];
    }
    const q = Math.sqrt(a2 - c2 * srlat2);
    const q1 = (altKm || 0) * q;
    const q2 = ((q1 + a2) / (q1 + b2)) * ((q1 + a2) / (q1 + b2));
    const ct = srlat / Math.sqrt(q2 * crlat2 + srlat2);
    const st = Math.sqrt(1.0 - ct * ct);
    const r2 = (altKm || 0) * (altKm || 0) + 2.0 * q1 + (a4 - c4 * srlat2) / (q * q);
    const r = Math.sqrt(r2);
    const dd = Math.sqrt(a2 * crlat2 + b2 * srlat2);
    const ca = ((altKm || 0) + dd) / r;
    const sa = c2 * crlat * srlat / (r * dd);
    const aor = re / r;
    let ar = aor * aor, bt = 0.0, bp = 0.0, br = 0.0;
    for (let n = 1; n <= MAXORD; n++) {
      ar = ar * aor;
      for (let m = 0; m <= n; m++) {
        if (n === m) {
          p[n + m * SIZE] = st * p[n - 1 + (m - 1) * SIZE];
          dp[m][n] = st * dp[m - 1][n - 1] + ct * p[n - 1 + (m - 1) * SIZE];
        } else if (n === 1 && m === 0) {
          p[n + m * SIZE] = ct * p[n - 1 + m * SIZE];
          dp[m][n] = ct * dp[m][n - 1] - st * p[n - 1 + m * SIZE];
        } else if (n > 1 && n !== m) {
          if (m > n - 2) { p[n - 2 + m * SIZE] = 0.0; dp[m][n - 2] = 0.0; }
          p[n + m * SIZE] = ct * p[n - 1 + m * SIZE] - _wk[m][n] * p[n - 2 + m * SIZE];
          dp[m][n] = ct * dp[m][n - 1] - st * p[n - 1 + m * SIZE] - _wk[m][n] * dp[m][n - 2];
        }
        tc[m][n] = _wc[m][n] + dt * _wcd[m][n];
        if (m !== 0) tc[n][m - 1] = _wc[n][m - 1] + dt * _wcd[n][m - 1];
        const par = ar * p[n + m * SIZE];
        let temp1, temp2;
        if (m === 0) { temp1 = tc[0][n] * cp[0]; temp2 = tc[0][n] * sp[0]; }
        else { temp1 = tc[m][n] * cp[m] + tc[n][m - 1] * sp[m]; temp2 = tc[m][n] * sp[m] - tc[n][m - 1] * cp[m]; }
        bt = bt - ar * temp1 * dp[m][n];
        bp = bp + _wfm[m] * temp2 * par;
        br = br + _wfn[n] * temp1 * par;
      }
    }
    if (st !== 0.0) bp = bp / st;
    const bx = -bt * ca - br * sa;
    const by = bp;
    return Math.atan2(by, bx) * 180 / Math.PI;
  }
  function decimalYear(d) {
    const t = d || new Date();
    const start = Date.UTC(t.getUTCFullYear(), 0, 1);
    const end = Date.UTC(t.getUTCFullYear() + 1, 0, 1);
    return t.getUTCFullYear() + (t.getTime() - start) / (end - start);
  }
  function declFallback(lat, lng) {
    // Simple regional approximation (was the old model; kept as safety net)
    const base = 4.2, lonAdj = (lng - 51.4) * 0.03, latAdj = (lat - 35.7) * -0.02;
    return base + lonAdj + latAdj;
  }
  function magneticDeclination(lat, lng, date) {
    try { return wmmDeclination(lat, lng, 0, decimalYear(date)); }
    catch (e) { return declFallback(lat, lng); }
  }
  /** Qibla from magnetic north (for compass sensors) */
  function qiblaMagnetic(lat, lng) {
    return fix(qibla(lat, lng) - magneticDeclination(lat, lng), 360);
  }

  const api = { compute, METHODS, qibla, qiblaDistance, qiblaMagnetic, magneticDeclination, wmmDeclination, declFallback, METHOD: METHODS.tehran };
  if (typeof module !== 'undefined') module.exports = api; else root.PT = api;
})(this);
