package com.ofoqshari.bz

import android.app.Activity
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.os.Handler
import android.os.Looper
import android.text.SpannableString
import android.text.Spanned
import android.text.style.ForegroundColorSpan
import android.text.style.RelativeSizeSpan
import android.util.Log
import android.view.Gravity
import android.view.ViewGroup
import android.view.ViewTreeObserver
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.widget.Button
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import ir.tapsell.mediation.MediationInitializationListener
import ir.tapsell.mediation.Tapsell
import ir.tapsell.mediation.ad.AdStateListener
import ir.tapsell.mediation.ad.request.BannerSize
import ir.tapsell.mediation.ad.request.RequestResultListener
import ir.tapsell.mediation.ad.show.AdShowCompletionState
import ir.tapsell.mediation.ad.views.banner.BannerContainer
import ir.tapsell.mediation.ad.views.ntv.NativeAdView
import ir.tapsell.mediation.ad.views.ntv.NativeAdViewContainer
import org.json.JSONArray
import org.json.JSONObject
import org.json.JSONTokener

/**
 * تبلیغات تپسل — نسخه ۲.۲.۵ (API دوآرگومانی native + timeout کوتاه‌تر + INTERNET)
 *
 * چیدمان (طبق درخواست کاربر، از نسخه ۲.۲.۰):
 *   ۱) صفحه اصلی (خانه): **۱ تبلیغ بین اوقات نمازها** — بعد از ردیف «اذان ظهر»
 *      (نقطهٔ HTML: ‎#adSlotHome‎)
 *   ۲) صفحه پخش اذان: **۴ تبلیغ زیر دکمهٔ «قطع صدا»** (نقطهٔ HTML: ‎#adSlotAzan‎)
 *
 * نوع تبلیغ‌گاه (نسخهٔ ۲.۲.۱ — مهم):
 *   کاربر در پنل تپسل تبلیغ‌گاه‌ها را از نوع «بنر بومی» (Native Banner) ساخته است.
 *   پس هر اسلات اول با requestNativeAd درخواست می‌دهد و تبلیغ را با ویوهای بومی
 *   خود برنامه (عنوان + توضیح + لوگو + دکمهٔ CTA) نشان می‌دهد؛ اگر فضایی از نوع
 *   «بنر استاندارد» باشد و درخواست بومی پاس نشد، همان فضا با بنر استاندارد 320×50
 *   هم امتحان می‌شود (fallback). نوع موفق هر فضا به خاطر سپرده می‌شود تا
 *   درخواست‌های بعدی مستقیم با همان نوع بروند.
 *
 * سینک اسکرول (نسخهٔ ۲.۲.۱ — رفع «بنر سر جای خودش نمی‌ماند»):
 *   - سمت وب تابع window.__azanAdRects() مختصات اسلات‌ها را می‌دهد و با هر
 *     اسکرول/تغییر اندازه/تعویض صفحه، همان لحظه از طریق پل
 *     window.AzanAdsBridge.onRects(json) به کد بومی می‌فرستد (بدون وقفهٔ نظرسنجی).
 *   - کد بومی هم روی هر تغییر اسکرول WebView گوش می‌دهد (حداکثر هر ۸۰ میلی‌ثانیه)
 *     و یک نظرسنجی ۲۵۰ میلی‌ثانیه‌ای به‌عنوان شبکهٔ ایمن باقی مانده است.
 *   نتیجه: بنر همراه محتوا جابه‌جا می‌شود و مثل یک عنصر ثابت صفحه می‌ماند.
 *
 * عیب‌یابی (برای پشتیبانی تپسل):
 *   - پیام خطای واقعی تپسل (onFailure) داخل کادر هر اسلات با خط کوچک نمایش داده
 *     می‌شود و در Logcat با تگ «AzanAds» ثبت می‌شود: adb logcat -s AzanAds
 *   - با **لمس طولانی روی کادر تبلیغ**، گزارش کامل خطا (کلید، وضعیت راه‌اندازی،
 *     نوع هر فضا و آخرین خطا) در کلیپ‌بورد کپی می‌شود تا برای پشتیبانی تپسل ارسال شود.
 *
 * راه‌اندازی SDK: تپسل مدیشن ۱.۳.۰ با ContentProvider خودش راه‌اندازی می‌شود و کلید
 * را از متادیتای «ir.tapsell.mediation.APPLICATION_KEY» می‌خواند (پچ این کلید را هم
 * manifestPlaceholder و هم متادیتای مستقیم می‌نویسد). امضای همهٔ متدها با بایت‌کد
 * AAR نسخهٔ ۱.۳.۰ (Maven Central) اعتبارسنجی شده است:
 *   requestNativeAd(zone, Activity, RequestResultListener)
 *   requestBannerAd(zone, BannerSize, RequestResultListener)
 *   showNativeAd(adId, NativeAdView, Activity, AdStateListener.Native)
 *   showBannerAd(adId, BannerContainer, Activity, AdStateListener.Banner)
 *   destroyNativeAd(adId) / destroyBannerAd(adId)
 *   setInitializationListener(MediationInitializationListener)
 * AdStateListener.Banner = onAdImpression/onAdClicked/onAdFailed
 * AdStateListener.Native = همان‌ها + onAdClosed(AdShowCompletionState) از Closable
 */
object AzanAds {

    private const val TAG = "AzanAds"

    /* فضاهای تبلیغاتی تپسل — ۵ فضا:
     * فضای «صفحه اصلی» (6b010ebf…) تبلیغ بین اوقات نمازها را می‌گیرد
     * و ۴ فضای دیگر، ۴ تبلیغ زیر «قطع صدا» را. اگر فضایی پر نشد، همان اسلات
     * به‌طور خودکار بقیهٔ فضاها را هم (با نوع بومی و سپس استاندارد) امتحان می‌کند. */
    private const val HOME_ZONE = "6b010ebfaeabeb750feb8f6f"
    private val AZAN_ZONES = arrayOf(
        "6b0071167597d07cbabd6e9e",
        "6b00715f728e2256843b0caf",
        "6b007174728e2256843b0cb0",
        "6b0071897597d07cbabd6e9f"
    )
    private val ALL_ZONES: Array<String> = arrayOf(HOME_ZONE) + AZAN_ZONES

    private const val POLL_MS = 250L          // نظرسنجی ایمن مختصات اسلات‌ها
    private const val SCROLL_MS = 80L         // بیشترین فاصلهٔ خواندن حین اسکرول
    private const val REFRESH_MS = 75_000L    // تازه‌سازی تبلیغ هر ۷۵ ثانیه
    private const val RETRY_MS = 30_000L      // اگر هیچ فضایی پر نشد، ۳۰ ثانیه بعد دوباره
    private const val ZONE_STEP_MS = 800L     // فاصلهٔ کوتاه بین امتحان فضاها

    private const val JS_RECTS =
        "window.__azanAdRects ? window.__azanAdRects() : 'null'"

    /** نوع تبلیغ هر فضا — پس از اولین موفقیت یاد گرفته می‌شود. */
    private enum class Kind { NATIVE, BANNER }

    /** یک جای تبلیغ (اسلات): وضعیت درخواست، تبلیغِ در حال نمایش و نگاه‌دارنده‌های نمایشی */
    private class Slot(val name: String, firstZone: String) {
        val pool: List<String> =
            listOf(firstZone) + ALL_ZONES.filter { it != firstZone }
        var zoneIdx = 0            // فضای جاری در pool
        var tryBanner = false      // برای فضاهای بی‌نام: اول بومی، بعد استاندارد
        var attempts = 0           // تعداد تلاش‌های پیاپی ناموفق
        var requesting = false     // درخواست در راه است
        var adId: String? = null   // تبلیغِ در حال نمایش
        var pendingId: String? = null   // تبلیغ رسیده ولی اسلات هنوز نمایان نشده
        var pendingKind: Kind? = null
        var lastKind: Kind? = null // نوع تبلیغِ در حال نمایش
        var visible = false        // آخرین وضعیت نمایان‌بودن اسلات
        var lastError: String? = null   // آخرین پیام خطای واقعی تپسل
        var wrap: FrameLayout? = null
        var status: TextView? = null
        var banner: BannerContainer? = null
        var nWrap: NativeAdViewContainer? = null
        var nLogo: ImageView? = null
        var nTitle: TextView? = null
        var nDesc: TextView? = null
        var nCta: Button? = null
        var pending: Runnable? = null
    }

    private val main: Handler = Handler(Looper.getMainLooper())
    private var activity: Activity? = null
    private var webView: WebView? = null
    private var attached = false
    private var bridgeAttached = false
    private var scrollHooked = false

    /** نوع یادگرفته‌شدهٔ هر فضا: بومی یا استاندارد */
    private val zoneKind = HashMap<String, Kind>()

    private var homeSlot = Slot("home", HOME_ZONE)          // ۱ تبلیغ بین اوقات
    private var azanSlots = listOf(                          // ۴ تبلیغ زیر «قطع صدا»
        Slot("azan1", AZAN_ZONES[0]),
        Slot("azan2", AZAN_ZONES[1]),
        Slot("azan3", AZAN_ZONES[2]),
        Slot("azan4", AZAN_ZONES[3])
    )
    private var azanWrap: LinearLayout? = null
    private var allSlots: List<Slot> = listOf(homeSlot) + azanSlots

    private var polling = false
    private var initListenerSet = false
    private var sdkReady = false
    private var lastScrollRead = 0L

    private var appKey: String? = null   // از متادیتای مانیفست خوانده می‌شود

    /* ---------- پل وب → بومی (سینک اسکرول) ---------- */

    /** از JS با window.AzanAdsBridge.onRects(json) صدا زده می‌شود؛ مختصات لحظهٔ اسکرول. */
    class RectsBridge {
        @JavascriptInterface
        fun onRects(json: String?) {
            AzanAds.onRectsFromWeb(json)
        }

        @JavascriptInterface
        fun log(msg: String?) {
            AzanAds.logFromWeb(msg)
        }
    }

    /** نقطهٔ ورود پل وب — به نخ اصلی منتقل می‌کند (عمومی تا از RectsBridge قابل صدا باشد). */
    fun onRectsFromWeb(json: String?) {
        main.post { applyRects(json) }
    }

    /** لاگ سمت وب با همان تگ — برای عیب‌یابی. */
    fun logFromWeb(msg: String?) {
        Log.d(TAG, "[web] " + (msg ?: ""))
    }

    /* ---------- API عمومی (AzanPlugin) ---------- */

    /** راه‌اندازی؛ از صفحهٔ وب با adsShow صدا زده می‌شود. کاملاً idempotent است. */
    fun show(act: Activity, wv: WebView?) {
        activity = act
        webView = wv ?: findWebView(act)
        Log.d(TAG, "show() on " + act.javaClass.simpleName +
                ", hasWebView=" + (webView != null))
        // listener را زود ست کن تا اگر SDK قبلاً init شده، باز هم وضعیت را همگام کنیم
        watchInitialization()
        ensureViews(act)
        if (!polling) {
            polling = true
            main.postDelayed({ poll() }, POLL_MS)
            Log.d(TAG, "position poller started (" + POLL_MS + "ms)")
        }
        // اگر SDK هنوز waiting است، چند ثانیه بعد optimistic ready شو و درخواست‌ها را از سر بگیر
        main.postDelayed({ forceReadyIfWaiting() }, 4_000L)
        main.postDelayed({ forceReadyIfWaiting() }, 10_000L)
    }

    /**
     * اگر auto-init تپسل قبل از setInitializationListener تمام شده باشد،
     * کالبک هرگز نمی‌آید و sdkReady=false می‌ماند. بعد از چند ثانیه آن را true می‌کنیم
     * و درخواست‌های معلق را دوباره می‌زنیم.
     */
    private fun forceReadyIfWaiting() {
        if (sdkReady) return
        Log.w(TAG, "SDK init still waiting — forcing ready and re-kicking slots")
        markSdkReadyAndKick()
    }

    /** از MainActivity وقتی کالبک init زود می‌آید صدا زده می‌شود. */
    fun onSdkReadyFromActivity() {
        main.post { markSdkReadyAndKick() }
    }

    private fun markSdkReadyAndKick() {
        sdkReady = true
        initListenerSet = true
        for (s in allSlots) {
            if (s.requesting) {
                s.requesting = false
                s.attempts = 0
            }
            if (s.visible) kick(s)
        }
    }

    /** دیگر استفاده نمی‌شود (تبلیغ‌ها خودشان جای خود را پیدا می‌کنند)؛ برای سازگاری ماند. */
    fun hide() {
        Log.d(TAG, "hide() is a no-op since v2.2.0 (slots are DOM-driven)")
    }

    /** آزاد کردن همهٔ منابع (بسته شدن برنامه) */
    fun destroy() {
        polling = false
        attached = false
        for (s in allSlots) {
            cancel(s)
            s.adId?.let { destroyAd(it, s.lastKind) }
            s.adId = null
            s.pendingId = null
            s.pendingKind = null
            s.lastKind = null
            s.wrap = null
            s.status = null
            s.banner = null
            s.nWrap = null
            s.nLogo = null
            s.nTitle = null
            s.nDesc = null
            s.nCta = null
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
        val root = act.findViewById<ViewGroup>(android.R.id.content) ?: return
        if (!attached) {
            val dens = act.resources.displayMetrics.density

            // اسلات صفحهٔ اصلی — مستقیم روی ریشهٔ پنجره، با مختصات مطلق
            val hs = FrameLayout(act)
            hs.layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT)
            hs.visibility = android.view.View.GONE
            fillSlot(act, hs, homeSlot, dens)
            root.addView(hs)
            homeSlot.wrap = hs

            // جعبهٔ ۴ تبلیغی صفحهٔ اذان — ستون عمودی، هر اسلات وزن برابر
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

        // پل جاوااسکریپت برای ارسال لحظه‌ای مختصات هنگام اسکرول
        val wv = webView
        if (wv != null && !bridgeAttached) {
            bridgeAttached = true
            try {
                wv.addJavascriptInterface(RectsBridge(), "AzanAdsBridge")
                Log.d(TAG, "AzanAdsBridge attached to WebView")
            } catch (e: Exception) {
                Log.w(TAG, "addJavascriptInterface failed: " + e.message)
            }
            // گوش دادن به اسکرول WebView — حرکت بنر همراه محتوا بدون وقفه
            if (!scrollHooked) {
                scrollHooked = true
                wv.viewTreeObserver.addOnScrollChangedListener {
                    val now = System.currentTimeMillis()
                    if (now - lastScrollRead >= SCROLL_MS) {
                        lastScrollRead = now
                        readRectsViaJs()
                    }
                }
            }
        }
    }

    /** داخل هر اسلات: نوشتهٔ وضعیت + BannerContainer + ویوهای تبلیغ بومی */
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
        tv.maxLines = 3
        tv.setPadding(Math.round(8f * dens), 0, Math.round(8f * dens), 0)
        cell.addView(tv)

        val bc = BannerContainer(act)
        bc.layoutParams = FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT, Gravity.CENTER)
        bc.visibility = android.view.View.GONE
        cell.addView(bc)

        // ویوهای تبلیغ بومی (بنر بومی پنل) — لوگو + عنوان/توضیح + دکمهٔ CTA
        val nw = NativeAdViewContainer(act)
        nw.layoutParams = FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
        nw.visibility = android.view.View.GONE
        val row = LinearLayout(act)
        row.orientation = LinearLayout.HORIZONTAL
        row.layoutParams = FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
        row.gravity = Gravity.CENTER_VERTICAL
        row.setPadding(Math.round(10f * dens), Math.round(4f * dens),
            Math.round(10f * dens), Math.round(4f * dens))

        val logo = ImageView(act)
        val lg = GradientDrawable()
        lg.setColor(Color.argb(60, 255, 255, 255))
        lg.cornerRadius = 8f * dens
        logo.background = lg
        logo.scaleType = ImageView.ScaleType.CENTER_CROP
        logo.clipToOutline = true
        val lp = LinearLayout.LayoutParams(Math.round(44f * dens), Math.round(44f * dens))
        lp.setMargins(0, 0, Math.round(10f * dens), 0)
        logo.layoutParams = lp
        row.addView(logo)

        val col = LinearLayout(act)
        col.orientation = LinearLayout.VERTICAL
        val cp = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f)
        col.layoutParams = cp

        val title = TextView(act)
        title.textSize = 14f
        title.setTextColor(Color.WHITE)
        title.typeface = android.graphics.Typeface.DEFAULT_BOLD
        title.maxLines = 1
        title.ellipsize = android.text.TextUtils.TruncateAt.END
        title.text = ""
        col.addView(title)

        val desc = TextView(act)
        desc.textSize = 11f
        desc.setTextColor(Color.argb(190, 255, 255, 255))
        desc.maxLines = 1
        desc.ellipsize = android.text.TextUtils.TruncateAt.END
        desc.text = ""
        desc.setPadding(0, Math.round(2f * dens), 0, 0)
        col.addView(desc)
        row.addView(col)

        val cta = Button(act)
        cta.textSize = 12f
        cta.setTextColor(Color.argb(255, 26, 18, 10))
        cta.isAllCaps = false
        cta.stateListAnimator = null
        cta.minimumWidth = 0
        cta.minimumHeight = 0
        val ctaBg = GradientDrawable()
        ctaBg.setColor(Color.argb(255, 232, 184, 109))     // طلایی برنامه
        ctaBg.cornerRadius = 10f * dens
        cta.background = ctaBg
        cta.setPadding(Math.round(12f * dens), 0, Math.round(12f * dens), 0)
        val ctaLp = LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT, Math.round(34f * dens))
        ctaLp.setMargins(Math.round(10f * dens), 0, 0, 0)
        cta.gravity = Gravity.CENTER
        cta.layoutParams = ctaLp
        cta.text = ""
        row.addView(cta)

        nw.addView(row)
        cell.addView(nw)

        // لمس طولانی روی کادر تبلیغ = کپی گزارش خطا برای پشتیبانی تپسل
        cell.isLongClickable = true
        cell.setOnLongClickListener {
            try {
                val cm = act.getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager
                cm?.setPrimaryClip(ClipData.newPlainText("AzanAds", diagnose()))
                Toast.makeText(act, "گزارش خطا کپی شد — بفرست برای پشتیبانی تپسل", Toast.LENGTH_SHORT).show()
            } catch (e: Exception) {
                Log.w(TAG, "copy diagnose failed: " + e.message)
            }
            true
        }

        s.status = tv
        s.banner = bc
        s.nWrap = nw
        s.nLogo = logo
        s.nTitle = title
        s.nDesc = desc
        s.nCta = cta
    }

    /* ---------- خواندن جای اسلات‌ها از WebView ---------- */

    private fun readRectsViaJs() {
        val wv = webView ?: return
        try {
            wv.evaluateJavascript(JS_RECTS) { res -> applyRects(res) }
        } catch (e: Exception) {
            Log.w(TAG, "evaluateJavascript failed: " + e.message)
        }
    }

    private fun poll() {
        if (!polling) return
        val act = activity
        if (act == null || act.isFinishing || webView == null) {
            main.postDelayed({ poll() }, POLL_MS)
            return
        }
        readRectsViaJs()
        main.postDelayed({ poll() }, POLL_MS)
    }

    /**
     * مختصات از JS حالا به پیکسل فیزیکی می‌آید (CSS × devicePixelRatio).
     * پس دیگر dens را روی r ضرب نمی‌کنیم؛ فقط آفست WebView نسبت به ریشه را اضافه می‌کنیم.
     */
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

        // آفست WebView نسبت به ریشهٔ content (نوار وضعیت و …) — همه فیزیکی
        val rootLoc = IntArray(2); root.getLocationInWindow(rootLoc)
        val wvLoc = IntArray(2); wv.getLocationInWindow(wvLoc)
        val ox = wvLoc[0] - rootLoc[0]
        val oy = wvLoc[1] - rootLoc[1]
        val viewH = wv.height

        if (home != null) {
            Log.d(TAG, "home rect phys=[" + home.joinToString() + "] ox=" + ox + " oy=" + oy + " viewH=" + viewH)
        }
        place(homeSlot, home, ox, oy, viewH)
        placeAzanBox(azan, ox, oy, viewH)
    }

    /** [چپ، بالا، عرض، ارتفاع] فیزیکی → IntArray؛ اگر نامعتبر بود null */
    private fun rectOf(a: JSONArray?): IntArray? {
        if (a == null || a.length() != 4) return null
        val l = a.optDouble(0)
        val t = a.optDouble(1)
        val w = a.optDouble(2)
        val h = a.optDouble(3)
        // حداقل ~۲۰dp ≈ ۴۰–۶۰px فیزیکی روی گوشی‌های معمول
        if (w < 40 || h < 40) return null
        return intArrayOf(Math.round(l).toInt(), Math.round(t).toInt(), Math.round(w).toInt(), Math.round(h).toInt())
    }

    private fun place(s: Slot, r: IntArray?, ox: Int, oy: Int, viewH: Int) {
        val wrap = s.wrap ?: return
        if (r == null || !onScreen(r, viewH)) {
            if (s.visible) { wrap.visibility = android.view.View.GONE; s.visible = false }
            return
        }
        move(wrap, r, ox, oy)
        if (!s.visible) {
            wrap.bringToFront()
            wrap.elevation = 24f
        }
        s.visible = true
        kick(s)
    }

    private fun placeAzanBox(r: IntArray?, ox: Int, oy: Int, viewH: Int) {
        val box = azanWrap ?: return
        if (r == null || !onScreen(r, viewH)) {
            if (box.visibility != android.view.View.GONE) {
                box.visibility = android.view.View.GONE
                for (s in azanSlots) s.visible = false
            }
            return
        }
        move(box, r, ox, oy)
        if (box.visibility != android.view.View.VISIBLE) {
            box.bringToFront()
            box.elevation = 24f
        }
        for (s in azanSlots) { s.visible = true; kick(s) }
    }

    /**
     * اسلات باید دست‌کم ۴۵٪ داخل ناحیهٔ قابل‌دید WebView باشد.
     * r و viewH هر دو پیکسل فیزیکی‌اند (مختصات از JS با devicePixelRatio آمده).
     * getBoundingClientRect نسبت به viewport است؛ top منفی یعنی اسکرول شده و خارج از دید.
     */
    private fun onScreen(r: IntArray, viewH: Int): Boolean {
        val top = r[1]
        val bottom = r[1] + r[3]
        val visTop = Math.max(top, 0)
        val visBottom = Math.min(bottom, viewH)
        return visBottom - visTop >= r[3] * 0.45f
    }

    /** r فیزیکی است؛ فقط آفست WebView نسبت به ریشه اضافه می‌شود. */
    private fun move(v: android.view.View, r: IntArray, ox: Int, oy: Int) {
        val x = r[0] + ox
        val y = r[1] + oy
        val w = r[2]
        val h = r[3]
        val lp = v.layoutParams
        if (lp.width != w || lp.height != h) {
            lp.width = w
            lp.height = h
            v.layoutParams = lp
        }
        if (v.x != x.toFloat()) v.x = x.toFloat()
        if (v.y != y.toFloat()) v.y = y.toFloat()
        if (v.visibility != android.view.View.VISIBLE) v.visibility = android.view.View.VISIBLE
    }

    /* ---------- چرخهٔ درخواست/نمایش هر اسلات ---------- */

    /** اگر اسلات نمایان است و تبلیغی ندارد، درخواست بده */
    private fun kick(s: Slot) {
        if (!s.visible) return
        val pid = s.pendingId
        if (pid != null) { s.pendingId = null; showAd(s, pid, s.pendingKind ?: Kind.NATIVE); return }
        if (s.requesting || s.adId != null) return
        if (key() == null) {
            s.lastError = "کلید تبلیغ در برنامه ثبت نشده"
            setStatus(s, "کلید تبلیغ در برنامه ثبت نشده", null)   // اشکال بیلد، نه اینترنت
            return
        }
        watchInitialization()
        request(s)
    }

    private fun request(s: Slot) {
        if (s.requesting) return
        val act = activity ?: return
        val zone = s.pool[s.zoneIdx % s.pool.size]
        val known = zoneKind[zone]
        val kind = known ?: if (s.tryBanner) Kind.BANNER else Kind.NATIVE
        s.requesting = true
        setStatus(s, "در انتظار تبلیغ…", s.lastError)
        Log.d(TAG, "[" + s.name + "] request " + kindName(kind) + " zone " +
                (s.zoneIdx % s.pool.size + 1) + "/" + s.pool.size + " -> " + zone +
                " sdkReady=" + sdkReady)
        // اگر onSuccess/onFailure هرگز نیامد، بعد از ۸ثانیه آزاد کن و نوع/فضا بعدی را امتحان کن
        schedule(s, 8_000L) {
            if (s.requesting) {
                Log.w(TAG, "[" + s.name + "] request timeout (8s) zone=" + zone + " kind=" + kindName(kind))
                s.requesting = false
                onFail(s, "timeout 8s (sdk=" + (if (sdkReady) "ready" else "waiting") + ")",
                    zone, known == null, kind)
            }
        }
        // listener را در فیلد نگه می‌داریم تا GC نشود قبل از کالبک
        val listener = object : RequestResultListener {
            override fun onSuccess(id: String) {
                Log.d(TAG, "[" + s.name + "] " + kindName(kind) + " success id=" + id.take(12) + "…")
                main.post {
                    cancel(s)
                    s.requesting = false
                    zoneKind[zone] = kind
                    showAd(s, id, kind)
                }
            }
            override fun onFailure(message: String) {
                Log.w(TAG, "[" + s.name + "] " + kindName(kind) + " failed: " + message)
                main.post {
                    cancel(s)
                    s.requesting = false
                    onFail(s, message, zone, known == null, kind)
                }
            }
        }
        try {
            if (kind == Kind.NATIVE) {
                // API اصلی تپسل ۱.۳.۰: requestNativeAd(zone, listener)
                // overload با Activity فقط برای Applovin لازم است
                try {
                    Tapsell.requestNativeAd(zone, listener)
                } catch (e: Throwable) {
                    Log.w(TAG, "[" + s.name + "] 2-arg native failed, trying with Activity: " + e.message)
                    Tapsell.requestNativeAd(zone, act, listener)
                }
            } else {
                Tapsell.requestBannerAd(zone, BannerSize.BANNER_320_50, listener)
            }
        } catch (e: Exception) {
            Log.w(TAG, "[" + s.name + "] request threw: " + e.message, e)
            cancel(s)
            s.requesting = false
            onFail(s, e.message ?: "request failed", zone, false, kind)
        }
    }

    /** پیام خطا ← تصمیم بعدی: همان فضا با نوع دیگر، یا فضا بعدی، یا پیام وضعیت */
    private fun onFail(s: Slot, msg: String, zone: String, zoneWasUnknown: Boolean, tried: Kind) {
        s.lastError = msg
        if (s.adId != null) {                   // تبلیغ قبلی هنوز نمایش داده می‌شود؛ تازه‌سازی بعداً
            Log.d(TAG, "[" + s.name + "] keep current ad, retry later")
            schedule(s, REFRESH_MS) { if (s.visible) request(s) }
            return
        }
        s.attempts++
        if (zoneWasUnknown && tried == Kind.NATIVE) {
            s.tryBanner = true                  // شاید فضا از نوع بنر استاندارد باشد — همان فضا را امتحان کن
            Log.d(TAG, "[" + s.name + "] try standard banner for " + zone)
            schedule(s, ZONE_STEP_MS) { if (s.visible) request(s) }
            return
        }
        s.tryBanner = false
        s.zoneIdx++
        if (s.attempts <= s.pool.size * 2 + 2) {   // همهٔ فضاها با هر دو نوع (تقریباً ۲ دور)
            schedule(s, ZONE_STEP_MS) { if (s.visible) request(s) }
        } else {
            setStatus(s, "تبلیغی در دسترس نیست", msg)  // هیچ فضایی پر نشد؛ پیام وضعیت + خطای واقعی
            s.attempts = 0
            Log.w(TAG, "[" + s.name + "] all zones failed, last error: " + msg +
                    ", retry in " + RETRY_MS / 1000 + "s")
            schedule(s, RETRY_MS) { if (s.visible) request(s) }
        }
    }

    private fun showAd(s: Slot, id: String, kind: Kind) {
        val act = activity ?: return
        if (!s.visible) {                       // اسلات هنوز روی صفحه نیست؛ بعداً نمایش بده
            s.pendingId = id
            s.pendingKind = kind
            Log.d(TAG, "[" + s.name + "] " + kindName(kind) + " ad queued until slot visible")
            return
        }
        val old = s.adId
        if (old != null && old != id) destroyAd(old, s.lastKind)
        s.adId = id
        s.lastKind = kind
        try {
            if (kind == Kind.NATIVE) {
                val nw = s.nWrap
                val logo = s.nLogo
                val title = s.nTitle
                val desc = s.nDesc
                val cta = s.nCta
                if (nw == null || logo == null || title == null || desc == null || cta == null) {
                    s.adId = null
                    return
                }
                s.banner?.visibility = android.view.View.GONE
                nw.visibility = android.view.View.VISIBLE
                title.text = "…"; desc.text = ""; cta.text = ""
                logo.setImageDrawable(null)
                setStatus(s, null, null)
                val nav = NativeAdView.Builder(nw)
                    .withLogo(logo)
                    .withTitle(title)
                    .withDescription(desc)
                    .withCtaButton(cta)
                    .build()
                Tapsell.showNativeAd(id, nav, act, object : AdStateListener.Native {
                    override fun onAdImpression() {
                        main.post {
                            Log.d(TAG, "[" + s.name + "] native impression")
                            setStatus(s, null, null)
                            scheduleRefresh(s)
                        }
                    }
                    override fun onAdClicked() { Log.d(TAG, "[" + s.name + "] native clicked") }
                    override fun onAdFailed(message: String) {
                        Log.w(TAG, "[" + s.name + "] native show failed: " + message)
                        main.post { s.adId = null; onFail(s, message, s.pool[s.zoneIdx % s.pool.size], false, Kind.NATIVE) }
                    }
                    override fun onAdClosed(state: AdShowCompletionState) {
                        Log.d(TAG, "[" + s.name + "] native closed: " + state)
                    }
                })
            } else {
                s.nWrap?.visibility = android.view.View.GONE
                val bc = s.banner ?: return
                bc.visibility = android.view.View.VISIBLE
                setStatus(s, null, null)
                Tapsell.showBannerAd(id, bc, act, object : AdStateListener.Banner {
                    override fun onAdImpression() {
                        main.post {
                            Log.d(TAG, "[" + s.name + "] banner impression")
                            setStatus(s, null, null)
                            scheduleRefresh(s)
                        }
                    }
                    override fun onAdClicked() { Log.d(TAG, "[" + s.name + "] banner clicked") }
                    override fun onAdFailed(message: String) {
                        Log.w(TAG, "[" + s.name + "] banner show failed: " + message)
                        main.post { s.adId = null; onFail(s, message, s.pool[s.zoneIdx % s.pool.size], false, Kind.BANNER) }
                    }
                })
            }
        } catch (e: Exception) {
            Log.w(TAG, "[" + s.name + "] show threw: " + e.message)
            s.adId = null
            onFail(s, e.message ?: "show failed", s.pool[s.zoneIdx % s.pool.size], false, kind)
        }
    }

    /** هر ۷۵ ثانیه تبلیغ همان فضا تازه می‌شود؛ اگر فضا پر نشد خودش سراغ بعدی می‌رود */
    private fun scheduleRefresh(s: Slot) {
        schedule(s, REFRESH_MS) {
            if (!s.visible || s.requesting) return@schedule
            s.attempts = 0
            Log.d(TAG, "[" + s.name + "] refresh ad")
            request(s)
        }
    }

    /** متن وضعیت + خطای کوچک قرمز زیر آن (پیام واقعی تپسل) */
    private fun setStatus(s: Slot, text: String?, err: String?) {
        val tv = s.status ?: return
        if (text == null) {
            tv.visibility = android.view.View.GONE
            return
        }
        if (err.isNullOrEmpty()) {
            tv.text = text
        } else {
            val short = if (err.length > 60) err.take(60) + "…" else err
            val sp = SpannableString(text + "\n" + short)
            sp.setSpan(RelativeSizeSpan(0.82f), text.length + 1, sp.length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
            sp.setSpan(ForegroundColorSpan(Color.argb(200, 255, 138, 101)),
                text.length + 1, sp.length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
            tv.text = sp
        }
        tv.visibility = android.view.View.VISIBLE
    }

    /** گزارش کامل برای پشتیبانی تپسل — با لمس طولانی روی کادر تبلیغ کپی می‌شود */
    private fun diagnose(): String {
        return try {
            val o = JSONObject()
            o.put("app", activity?.packageName ?: "?")
            o.put("sdk", "tapsell-mediation-1.3.0")
            val k = key()
            o.put("appKey", if (k != null) "present (" + k.take(8) + "…)" else "MISSING")
            o.put("sdkInit", if (sdkReady) "complete" else "waiting")
            val z = JSONObject()
            for (zn in ALL_ZONES) z.put(zn, zoneKind[zn]?.let { kindName(it) } ?: "unknown")
            o.put("zoneKinds", z)
            val arr = JSONArray()
            for (s in allSlots) {
                val so = JSONObject()
                so.put("slot", s.name)
                so.put("visible", s.visible)
                so.put("zone", s.pool[s.zoneIdx % s.pool.size])
                so.put("requesting", s.requesting)
                so.put("attempts", s.attempts)
                so.put("tryBanner", s.tryBanner)
                so.put("lastError", s.lastError ?: "")
                so.put("shown", s.lastKind?.let { kindName(it) } ?: "")
                arr.put(so)
            }
            o.put("slots", arr)
            o.toString(1)
        } catch (e: Exception) {
            "AzanAds diagnose failed: " + e.message
        }
    }

    private fun kindName(k: Kind): String = if (k == Kind.NATIVE) "native" else "banner"

    private fun schedule(s: Slot, ms: Long, r: Runnable) {
        cancel(s)
        s.pending = r
        main.postDelayed(r, ms)
    }

    private fun cancel(s: Slot) {
        s.pending?.let { main.removeCallbacks(it) }
        s.pending = null
    }

    private fun destroyAd(id: String, kind: Kind?) {
        try {
            if (kind == Kind.NATIVE) Tapsell.destroyNativeAd(id) else Tapsell.destroyBannerAd(id)
            Log.d(TAG, "ad destroyed (" + (kind?.let { kindName(it) } ?: "?") + ")")
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

    /**
     * یک‌بار listener راه‌اندازی SDK را ست می‌کند.
     * نکتهٔ مهم: ContentProvider تپسل معمولاً قبل از اولین adsShow اینیت می‌شود؛
     * اگر listener دیر ست شود کالبک از دست می‌رود و sdkReady همیشه false می‌ماند.
     * به‌همین خاطر forceReadyIfWaiting هم بعد از چند ثانیه وضعیت را بازیابی می‌کند.
     */
    private fun watchInitialization() {
        if (initListenerSet) return
        initListenerSet = true
        try {
            Tapsell.setInitializationListener(object : MediationInitializationListener {
                override fun onInitializationComplete() {
                    Log.d(TAG, "Tapsell SDK initialization complete")
                    sdkReady = true
                    main.post {
                        for (s in allSlots) {
                            if (s.requesting) s.requesting = false
                            kick(s)
                        }
                    }
                }
            })
            Log.d(TAG, "initialization listener set (sdkReady=" + sdkReady + ")")
        } catch (e: Exception) {
            Log.w(TAG, "setInitializationListener failed: " + e.message)
            // اگر API خطا داد، حداقل بعداً forceReady کمک کند
            sdkReady = true
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
