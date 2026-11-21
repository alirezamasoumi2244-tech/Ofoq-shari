package com.ofoqshari.bz

import android.app.Activity
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.Gravity
import android.view.ViewGroup
import android.webkit.WebView
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import ir.tapsell.mediation.MediationInitializationListener
import ir.tapsell.mediation.Tapsell
import ir.tapsell.mediation.ad.AdStateListener
import ir.tapsell.mediation.ad.request.BannerSize
import ir.tapsell.mediation.ad.request.RequestResultListener
import ir.tapsell.mediation.ad.views.banner.BannerContainer
import org.json.JSONArray
import org.json.JSONObject
import org.json.JSONTokener

/**
 * تبلیغات بنری تپسل — نسخه ۲.۲.۰ (چیدمان درون‌محتوایی)
 *
 * طبق درخواست کاربر، بنرها دیگر نوار ثابت پایین صفحه نیستند؛ هر بنر دقیقاً
 * روی یک نقطه مشخص از صفحهٔ وب نشانده می‌شود:
 *
 *   ۱) صفحه اصلی (خانه): **۱ بنر بین اوقات نمازها** — بعد از ردیف «اذان ظهر»
 *      (نقطهٔ HTML: ‎#adSlotHome‎)
 *   ۲) صفحه پخش اذان: **۴ بنر زیر دکمهٔ «قطع صدا»** (نقطهٔ HTML: ‎#adSlotAzan‎)
 *
 * شیوهٔ کار:
 *  - برنامهٔ وب تابع window.__azanAdRects() را دارد که مختصات دقیق این دو
 *    نقطه را (پیکسل CSS، نسبت به نمای پنجره) برمی‌گرداند؛ فقط وقتی صفحهٔ
 *    مربوطه باز است نقطه وجود دارد، پس در بقیه صفحات بنر خودبه‌خود پنهان می‌شود.
 *  - کد بومی هر ۲۵۰ میلی‌ثانیه این مختصات را می‌خواند، به پیکسل واقعی تبدیل
 *    می‌کند (×density + جابه‌جایی WebView) و بنر تپسل را دقیقاً روی همان‌جا
 *    می‌نشاند؛ با اسکرول هم بنر همراه نقطه جابه‌جا می‌شود.
 *  - بنرها 320×50 هستند؛ در صفحهٔ اذان ۴ اسلات روی هم قرار می‌گیرند و هرکدام
 *    از یک فضای تبلیغاتی (Zone) جداگانه پر می‌شود.
 *  - هر اسلات اگر فضایش پر نشد به‌طور خودکار فضاهای بعدی را امتحان می‌کند
 *    (۲ دور کامل)؛ اگر هیچ‌کدام پر نشد پیام «تبلیغی در دسترس نیست» را نشان
 *    می‌دهد و ۳۰ ثانیه بعد دوباره تلاش می‌کند. هر ۷۵ ثانیه هم بنر تازه می‌شود.
 *  - تا وقتی تبلیغ نیامده، نوشتهٔ کوچک وضعیت داخل همان اسلات دیده می‌شود تا
 *    خالی‌بودن جا معلوم باشد (فقط وقتی اینترنت قطع است یا نوع فضا بنر نیست).
 *  - همهٔ مراحل در Logcat با تگ «AzanAds» ثبت می‌شود: adb logcat -s AzanAds
 *
 * راه‌اندازی (Initialization): SDK تپسل مدیشن ۱.۳.۰ با ContentProvider هنگام
 * باز شدن برنامه خودش راه‌اندازی می‌شود و کلید را از متادیتای
 * «ir.tapsell.mediation.APPLICATION_KEY» مانیفست می‌خواند (پچ این کلید را هم
 * به‌صورت manifestPlaceholder و هم متادیتای مستقیم می‌نویسد). با
 * setInitializationListener لحظهٔ کامل‌شدن راه‌اندازی را ثبت می‌کنیم تا
 * درخواست‌های رد‌شدهٔ قبل از راه‌اندازی دوباره تکرار شوند.
 *
 * مبنای فنی: Tapsell Mediation SDK نسخه ۱.۳.۰
 * (ir.tapsell.mediation:tapsell + ir.tapsell.mediation.adapter:legacy).
 * امضاهای متدها با بایت‌کد AAR نسخه ۱.۳.۰ اعتبارسنجی شده است:
 *   requestBannerAd(zone, BannerSize, RequestResultListener)
 *   showBannerAd(adId, BannerContainer, Activity, AdStateListener.Banner)
 *   destroyBannerAd(adId)
 *   setInitializationListener(MediationInitializationListener)
 */
object AzanAds {

    private const val TAG = "AzanAds"

    /* فضاهای تبلیغاتی تپسل — ۵ فضا:
     * فضای «صفحه اصلی» (6b010ebf…) بنر بین اوقات نمازها را می‌گیرد
     * و ۴ فضای دیگر، ۴ بنر زیر «قطع صدا» را. اگر فضایی پر نشد، همان اسلات
     * به‌طور خودکار از بقیه فضاها هم امتحان می‌کند. */
    private const val HOME_ZONE = "6b010ebfaeabeb750feb8f6f"
    private val AZAN_ZONES = arrayOf(
        "6b0071167597d07cbabd6e9e",
        "6b00715f728e2256843b0caf",
        "6b007174728e2256843b0cb0",
        "6b0071897597d07cbabd6e9f"
    )
    private val ALL_ZONES: Array<String> = arrayOf(HOME_ZONE) + AZAN_ZONES

    private const val BANNER_H_DP = 50        // بنر استاندارد 320×50
    private const val POLL_MS = 250L          // هر چند میلی‌ثانیه جای اسلات خوانده شود
    private const val REFRESH_MS = 75_000L    // تازه‌سازی بنر هر ۷۵ ثانیه
    private const val RETRY_MS = 30_000L      // اگر هیچ فضایی پر نشد، ۳۰ ثانیه بعد دوباره
    private const val ZONE_STEP_MS = 800L     // فاصلهٔ کوتاه بین امتحان فضاها

    private const val JS_RECTS =
        "window.__azanAdRects ? window.__azanAdRects() : 'null'"

    /** یک جای بنر (اسلات): وضعیت درخواست، بنر نمایش‌داده‌شده و نگاه‌دارنده‌های نمایشی */
    private class Slot(val name: String, firstZone: String) {
        val pool: List<String> =
            listOf(firstZone) + ALL_ZONES.filter { it != firstZone }
        var zoneIdx = 0            // فضای جاری در pool
        var attempts = 0           // تعداد تلاش‌های پیاپی ناموفق
        var requesting = false     // درخواست در راه است
        var adId: String? = null   // تبلیغِ در حال نمایش (یا تازه دریافت‌شده)
        var pendingId: String? = null // تبلیغ رسیده ولی اسلات هنوز نمایان نشده
        var visible = false        // آخرین وضعیت نمایان‌بودن اسلات
        var wrap: FrameLayout? = null
        var status: TextView? = null
        var banner: BannerContainer? = null
        var pending: Runnable? = null
    }

    private val main: Handler = Handler(Looper.getMainLooper())
    private var activity: Activity? = null
    private var webView: WebView? = null
    private var attached = false

    private var homeSlot = Slot("home", HOME_ZONE)          // ۱ بنر بین اوقات
    private var azanSlots = listOf(                          // ۴ بنر زیر «قطع صدا»
        Slot("azan1", AZAN_ZONES[0]),
        Slot("azan2", AZAN_ZONES[1]),
        Slot("azan3", AZAN_ZONES[2]),
        Slot("azan4", AZAN_ZONES[3])
    )
    private var azanWrap: LinearLayout? = null
    private var allSlots: List<Slot> = listOf(homeSlot) + azanSlots

    private var polling = false
    private var initListenerSet = false

    private var appKey: String? = null   // از متادیتای مانیفست خوانده می‌شود

    /* ---------- API عمومی (AzanPlugin) ---------- */

    /** راه‌اندازی؛ از صفحهٔ وب با adsShow صدا زده می‌شود. کاملاً idempotent است. */
    fun show(act: Activity, wv: WebView?) {
        activity = act
        webView = wv ?: findWebView(act)
        Log.d(TAG, "show() on " + act.javaClass.simpleName +
                ", hasWebView=" + (webView != null))
        ensureViews(act)
        if (!polling) {
            polling = true
            main.postDelayed({ poll() }, POLL_MS)
            Log.d(TAG, "position poller started (" + POLL_MS + "ms)")
        }
    }

    /** دیگر استفاده نمی‌شود (بنرها خودشان جای خود را پیدا می‌کنند)؛ برای سازگاری نگه داشته شد. */
    fun hide() {
        Log.d(TAG, "hide() is a no-op since v2.2.0 (slots are DOM-driven)")
    }

    /** آزاد کردن همهٔ منابع (بسته شدن برنامه) */
    fun destroy() {
        polling = false
        attached = false
        for (s in allSlots) {
            cancel(s)
            s.adId?.let { destroyAd(it) }
            s.adId = null
            s.pendingId = null
            s.wrap = null
            s.status = null
            s.banner = null
            s.visible = false
            s.requesting = false
        }
        azanWrap = null
        webView = null
        activity = null
        Log.d(TAG, "destroyed")
    }

    /* ---------- ساخت نماها ---------- */

    private fun ensureViews(act: Activity) {
        if (attached) return
        val root = act.findViewById<ViewGroup>(android.R.id.content) ?: return
        val dens = act.resources.displayMetrics.density

        // اسلات صفحهٔ اصلی — مستقیم روی ریشهٔ پنجره، با مختصات مطلق
        val hs = FrameLayout(act)
        hs.layoutParams = FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        hs.visibility = android.view.View.GONE
        fillSlot(act, hs, homeSlot, dens)
        root.addView(hs)
        homeSlot.wrap = hs

        // جعبهٔ ۴ بنری صفحهٔ اذان — ستون عمودی، هر اسلات وزن برابر
        val box = LinearLayout(act)
        box.orientation = LinearLayout.VERTICAL
        box.layoutParams = FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        box.visibility = android.view.View.GONE
        for (s in azanSlots) {
            val cell = FrameLayout(act)
            cell.layoutParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f)
            fillSlot(act, cell, s, dens)
            box.addView(cell)
            s.wrap = cell
        }
        root.addView(box)
        azanWrap = box
        attached = true
        Log.d(TAG, "ad views attached (1 home slot + 4 azan slots)")
    }

    /** داخل هر اسلات: نوشتهٔ وضعیت + BannerContainer وسط‌چین + پس‌زمینهٔ گرد */
    private fun fillSlot(act: Activity, cell: FrameLayout, s: Slot, dens: Float) {
        val bg = GradientDrawable()
        bg.setColor(Color.argb(235, 36, 28, 20))           // #241C14 مثل کارت‌های برنامه
        bg.cornerRadius = 14f * dens
        bg.setStroke(Math.max(1, Math.round(1f * dens)), Color.argb(60, 232, 184, 109))
        cell.background = bg

        val tv = TextView(act)
        tv.layoutParams = FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT, Gravity.CENTER)
        tv.text = "در انتظار تبلیغ…"
        tv.textSize = 11f
        tv.setTextColor(Color.argb(150, 255, 255, 255))
        tv.gravity = Gravity.CENTER
        cell.addView(tv)

        val bc = BannerContainer(act)
        bc.layoutParams = FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT, Gravity.CENTER)
        cell.addView(bc)

        s.status = tv
        s.banner = bc
    }

    /* ---------- خواندن جای اسلات‌ها از WebView ---------- */

    private fun poll() {
        if (!polling) return
        val act = activity
        val wv = webView
        if (act == null || wv == null || act.isFinishing) {
            main.postDelayed({ poll() }, POLL_MS)
            return
        }
        try {
            wv.evaluateJavascript(JS_RECTS) { res -> applyRects(res) }
        } catch (e: Exception) {
            Log.w(TAG, "evaluateJavascript failed: " + e.message)
        }
        main.postDelayed({ poll() }, POLL_MS)
    }

    private fun applyRects(res: String?) {
        if (!polling) return
        val act = activity ?: return
        val wv = webView ?: return
        val root = act.findViewById<ViewGroup>(android.R.id.content) ?: return

        var home: IntArray? = null
        var azan: IntArray? = null
        try {
            var v: Any? = JSONTokener(res ?: "null").nextValue()
            if (v is String) v = JSONTokener(v).nextValue()
            if (v is JSONObject) {
                home = rectOf(v.optJSONArray("home"))
                azan = rectOf(v.optJSONArray("azan"))
            }
        } catch (e: Exception) {
            Log.w(TAG, "rects parse failed: " + e.message)
        }

        // جابه‌جایی WebView نسبت به ریشهٔ پنجره (نوار وضعیت و …)
        val rootLoc = IntArray(2); root.getLocationInWindow(rootLoc)
        val wvLoc = IntArray(2); wv.getLocationInWindow(wvLoc)
        val ox = wvLoc[0] - rootLoc[0]
        val oy = wvLoc[1] - rootLoc[1]
        val dens = act.resources.displayMetrics.density
        val viewH = wv.height

        place(homeSlot, home, ox, oy, dens, viewH)
        placeAzanBox(azan, ox, oy, dens, viewH)
    }

    /** [چپ، بالا، عرض، ارتفاع] → IntArray؛ اگر نامعتبر بود null */
    private fun rectOf(a: JSONArray?): IntArray? {
        if (a == null || a.length() != 4) return null
        val l = a.optDouble(0)
        val t = a.optDouble(1)
        val w = a.optDouble(2)
        val h = a.optDouble(3)
        if (w < 20 || h < 20) return null
        return intArrayOf(Math.round(l).toInt(), Math.round(t).toInt(), Math.round(w).toInt(), Math.round(h).toInt())
    }

    private fun place(s: Slot, r: IntArray?, ox: Int, oy: Int, dens: Float, viewH: Int) {
        val wrap = s.wrap ?: return
        if (r == null || !onScreen(r, oy, viewH)) {
            if (s.visible) { wrap.visibility = android.view.View.GONE; s.visible = false }
            return
        }
        move(wrap, r, ox, oy, dens)
        s.visible = true
        kick(s)
    }

    private fun placeAzanBox(r: IntArray?, ox: Int, oy: Int, dens: Float, viewH: Int) {
        val box = azanWrap ?: return
        if (r == null || !onScreen(r, oy, viewH)) {
            if (box.visibility != android.view.View.GONE) {
                box.visibility = android.view.View.GONE
                for (s in azanSlots) s.visible = false
            }
            return
        }
        move(box, r, ox, oy, dens)
        for (s in azanSlots) { s.visible = true; kick(s) }
    }

    /** اسلات باید دست‌کم ۴۵٪ داخل دید باشد تا بنر نشان داده شود (برش نصفه‌بنر زشت است) */
    private fun onScreen(r: IntArray, oy: Int, viewH: Int): Boolean {
        val top = r[1]; val bottom = r[1] + r[3]
        val visTop = Math.max(top, oy)
        val visBottom = Math.min(bottom, oy + viewH)
        return visBottom - visTop >= r[3] * 0.45f
    }

    private fun move(v: android.view.View, r: IntArray, ox: Int, oy: Int, dens: Float) {
        val x = Math.round(r[0] * dens) + ox
        val y = Math.round(r[1] * dens) + oy
        val w = Math.round(r[2] * dens)
        val h = Math.round(r[3] * dens)
        val lp = v.layoutParams
        if (lp.width != w || lp.height != h) { lp.width = w; lp.height = h; v.layoutParams = lp }
        if (v.x != x.toFloat()) v.x = x.toFloat()
        if (v.y != y.toFloat()) v.y = y.toFloat()
        if (v.visibility != android.view.View.VISIBLE) v.visibility = android.view.View.VISIBLE
    }

    /* ---------- چرخهٔ درخواست/نمایش هر اسلات ---------- */

    /** اگر اسلات نمایان است و تبلیغی ندارد، درخواست بده */
    private fun kick(s: Slot) {
        if (!s.visible) return
        val pid = s.pendingId
        if (pid != null) { s.pendingId = null; showAd(s, pid); return }
        if (s.requesting || s.adId != null) return
        if (key() == null) {
            setStatus(s, "کلید تبلیغ در برنامه ثبت نشده")   // اشکال بیلد، نه اینترنت
            return
        }
        watchInitialization()
        request(s)
    }

    private fun request(s: Slot) {
        if (s.requesting) return
        val act = activity ?: return
        val zone = s.pool[s.zoneIdx % s.pool.size]
        s.requesting = true
        setStatus(s, "در انتظار تبلیغ…")
        Log.d(TAG, "[" + s.name + "] request zone " + (s.zoneIdx % s.pool.size + 1) + "/" +
                s.pool.size + " -> " + zone)
        try {
            Tapsell.requestBannerAd(zone, BannerSize.BANNER_320_50, object : RequestResultListener {
                override fun onSuccess(id: String) {
                    Log.d(TAG, "[" + s.name + "] request success (adId=" + id.take(12) + "…)")
                    main.post { s.requesting = false; showAd(s, id) }
                }
                override fun onFailure(message: String) {
                    Log.w(TAG, "[" + s.name + "] request failed: " + message)
                    main.post { s.requesting = false; onFail(s, message) }
                }
            })
        } catch (e: Exception) {
            Log.w(TAG, "[" + s.name + "] request threw: " + e.message)
            s.requesting = false
            onFail(s, e.message ?: "request failed")
        }
    }

    private fun showAd(s: Slot, id: String) {
        val act = activity ?: return
        val bc = s.banner ?: return
        if (!s.visible) {                       // اسلات هنوز روی صفحه نیست؛ بعداً نمایش بده
            s.pendingId = id
            Log.d(TAG, "[" + s.name + "] ad queued until slot visible")
            return
        }
        val old = s.adId
        if (old != null && old != id) destroyAd(old)
        s.adId = id
        try {
            bc.removeAllViews()
            Tapsell.showBannerAd(id, bc, act, object : AdStateListener.Banner {
                override fun onAdImpression() {
                    main.post {
                        Log.d(TAG, "[" + s.name + "] banner impression")
                        setStatus(s, null)      // نوشتهٔ وضعیت برداشته شود
                        scheduleRefresh(s)
                    }
                }
                override fun onAdClicked() { Log.d(TAG, "[" + s.name + "] banner clicked") }
                override fun onAdFailed(message: String) {
                    Log.w(TAG, "[" + s.name + "] banner show failed: " + message)
                    main.post { s.adId = null; onFail(s, message) }
                }
            })
        } catch (e: Exception) {
            Log.w(TAG, "[" + s.name + "] show threw: " + e.message)
            s.adId = null
            onFail(s, e.message ?: "show failed")
        }
    }

    private fun onFail(s: Slot, msg: String) {
        if (s.adId != null) {                   // بنر قبلی هنوز نمایش داده می‌شود؛ تازه‌سازی بعداً
            Log.d(TAG, "[" + s.name + "] keep current banner, retry later")
            schedule(s, REFRESH_MS) { if (s.visible) request(s) }
            return
        }
        s.attempts++
        s.zoneIdx++
        if (s.attempts <= s.pool.size * 2) {    // همهٔ فضاها را امتحان کن (۲ دور)
            schedule(s, ZONE_STEP_MS) { if (s.visible) request(s) }
        } else {
            setStatus(s, "تبلیغی در دسترس نیست")  // هیچ فضایی پر نشد؛ پیام وضعیت
            s.attempts = 0
            Log.w(TAG, "[" + s.name + "] all zones failed, retry in " + RETRY_MS / 1000 + "s")
            schedule(s, RETRY_MS) { if (s.visible) request(s) }
        }
    }

    /** هر ۷۵ ثانیه بنر همان فضا تازه می‌شود؛ اگر فضا پر نشد خودش سراغ بعدی می‌رود */
    private fun scheduleRefresh(s: Slot) {
        schedule(s, REFRESH_MS) {
            if (!s.visible || s.requesting) return@schedule
            s.attempts = 0
            Log.d(TAG, "[" + s.name + "] refresh banner")
            request(s)
        }
    }

    private fun setStatus(s: Slot, text: String?) {
        val tv = s.status ?: return
        if (text == null) {
            tv.visibility = android.view.View.GONE
        } else {
            tv.text = text
            tv.visibility = android.view.View.VISIBLE
        }
    }

    private fun schedule(s: Slot, ms: Long, r: Runnable) {
        cancel(s)
        s.pending = r
        main.postDelayed(r, ms)
    }

    private fun cancel(s: Slot) {
        s.pending?.let { main.removeCallbacks(it) }
        s.pending = null
    }

    private fun destroyAd(id: String) {
        try {
            Tapsell.destroyBannerAd(id)
            Log.d(TAG, "banner destroyed")
        } catch (e: Exception) { Log.w(TAG, "destroy threw: " + e.message) }
    }

    /* ---------- راه‌اندازی SDK و کلید ---------- */

    /** خواندن App Key از متادیتای مانیفست (patch_android.py این مقدار را می‌نویسد). */
    private fun key(): String? {
        if (appKey != null) return appKey
        appKey = try {
            val act = activity ?: return null
            val ai = act.packageManager.getApplicationInfo(act.packageName, android.content.pm.PackageManager.GET_META_DATA)
            val raw = ai?.metaData?.getString("ir.tapsell.mediation.APPLICATION_KEY")
            raw?.trim()?.takeIf { it.isNotEmpty() && it != "PUT_TAPSELL_APP_KEY_HERE" }
        } catch (e: Exception) {
            Log.w(TAG, "read app key failed: " + e.message)
            null
        }
        Log.d(TAG, "app key present: " + (appKey != null))
        return appKey
    }

    /** یک‌بار listener راه‌اندازی SDK را ست می‌کند تا لحظهٔ آماده‌شدن تپسل لاگ شود
     *  و اگر درخواستی قبل از راه‌اندازی رد شده باشد، دوباره تلاش شود. */
    private fun watchInitialization() {
        if (initListenerSet) return
        initListenerSet = true
        try {
            Tapsell.setInitializationListener(object : MediationInitializationListener {
                override fun onInitializationComplete() {
                    Log.d(TAG, "Tapsell SDK initialization complete")
                    main.post {
                        for (s in allSlots) kick(s)     // درخواست‌های معلق دوباره تلاش شوند
                    }
                }
            })
            Log.d(TAG, "initialization listener set")
        } catch (e: Exception) {
            Log.w(TAG, "setInitializationListener failed: " + e.message)
        }
    }

    /* ---------- ابزار ---------- */

    private fun findWebView(act: Activity): WebView? {
        return try {
            searchWebView(act.findViewById<ViewGroup>(android.R.id.content))
        } catch (_: Exception) { null }
    }

    private fun searchWebView(v: android.view.View?): WebView? {
        if (v is WebView) return v
        if (v is ViewGroup) {
            for (i in 0 until v.childCount) {
                val f = searchWebView(v.getChildAt(i))
                if (f != null) return f
            }
        }
        return null
    }
}
