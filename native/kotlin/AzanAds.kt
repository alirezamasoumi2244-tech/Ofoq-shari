package com.ofoqshari.bz

import android.app.Activity
import android.graphics.Color
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.view.ViewGroup
import android.webkit.WebView
import android.widget.FrameLayout
import ir.tapsell.mediation.Tapsell
import ir.tapsell.mediation.ad.AdStateListener
import ir.tapsell.mediation.ad.request.BannerSize
import ir.tapsell.mediation.ad.request.RequestResultListener
import ir.tapsell.mediation.ad.views.banner.BannerContainer

/**
 * تابلوی تبلیغات تپسل (بنر) — فقط در «بخش پایینی صفحه اذان» (خانه) نمایش داده می‌شود.
 *
 * کارکرد:
 *  - یک BannerContainer در پایین صفحه (زیر نوار منو، پایین WebView) اضافه می‌شود
 *    و ارتفاع WebView به‌اندازه بنر کم می‌شود تا چیزی پوشانده نشود.
 *  - بین ۴ فضای تبلیغاتی (Zone) که در پنل تپسل ساخته‌اید می‌چرخد:
 *    اگر یک فضا تبلیغی نداشت، به‌طور خودکار فضای بعدی امتحان می‌شود.
 *  - هر ۶۰ ثانیه بنر با فضای بعدی تازه‌سازی می‌شود.
 *  - در بقیه صفحات (تنظیمات، قبله، تقویم، …) و روی صفحه پخش اذان، بنر پنهان می‌شود.
 *
 * ✅ از نسخه ۲.۱.۱ «شناسه اپلیکیشن (App Key) تپسل» در tools/patch_android.py وارد شده
 *    و از طریق manifestPlaceholder «TapsellMediationAppKey» به‌طور خودکار در متادیتای
 *    مانیفست (ir.tapsell.mediation.APPLICATION_KEY) می‌نشیند — همان متادیتایی که هم
 *    خود SDK و هم این کلاس موقع شروع می‌خوانند. اگر کلید خالی باشد تبلیغات بی‌صدا
 *    غیرفعال می‌ماند و برنامه به‌هیچ‌وجه خطا نمی‌دهد.
 *
 * مبنای فنی: Tapsell Mediation SDK نسخه ۱.۳.۰
 * (ir.tapsell.mediation:tapsell + ir.tapsell.mediation.adapter:legacy).
 * امضاهای متدها و محل App Key با بایت‌کد خود SDK (AAR نسخه ۱.۳.۰ در Maven Central)
 * اعتبارسنجی شده است:
 *   requestBannerAd(zone, BannerSize, RequestResultListener)
 *   showBannerAd(adId, BannerContainer, Activity, AdStateListener.Banner)
 *   destroyBannerAd(adId)
 */
object AzanAds {

    /* فضاهای تبلیغاتی تپسل — بخش پایینی صفحه اذان */
    private val ZONES = arrayOf(
        "6b0071167597d07cbabd6e9e",
        "6b00715f728e2256843b0caf",
        "6b007174728e2256843b0cb0",
        "6b0071897597d07cbabd6e9f"
    )

    /* اندازه بنر استاندارد 320×50 */
    private const val BANNER_H_DP = 50
    private const val REFRESH_MS = 60_000L     // تازه‌سازی هر ۶۰ ثانیه
    private const val RETRY_MS = 30_000L       // اگر هیچ فضایی پر نشد، ۳۰ ثانیه بعد دوباره

    private val main: Handler = Handler(Looper.getMainLooper())
    private var container: FrameLayout? = null   // نوار پایین (نگهدارنده بنر)
    private var banner: BannerContainer? = null
    private var activity: Activity? = null
    private var webView: WebView? = null

    private var showing = false          // درخواست نمایش از سمت UI فعال است
    private var attached = false         // container به پنجره چسبیده است
    private var adId: String? = null     // تبلیغِ در حال نمایش
    private var zoneIdx = 0
    private var attempts = 0
    private var pending: Runnable? = null

    private var appKey: String? = null   // از متادیتای مانیفست خوانده می‌شود

    /** خواندن App Key از متادیتای مانیفست (patch_android.py مقدار TAPSELL_APP_KEY را اینجا می‌نویسد).
     *  SDK تپسل مقدارش را از همان متادیتای «ir.tapsell.mediation.APPLICATION_KEY» می‌خواند و خودش را
     *  هنگام شروع برنامه به‌طور خودکار راه‌اندازی می‌کند؛ اگر کلید خالی باشد تبلیغی نمی‌آید ولی برنامه سالم می‌ماند. */
    private fun key(): String? {
        if (appKey != null) return appKey
        appKey = try {
            val act = activity ?: return null
            val ai = act.packageManager.getApplicationInfo(act.packageName, android.content.pm.PackageManager.GET_META_DATA)
            val raw = ai?.metaData?.getString("ir.tapsell.mediation.APPLICATION_KEY")
            raw?.trim()?.takeIf { it.isNotEmpty() && it != "PUT_TAPSELL_APP_KEY_HERE" }
        } catch (_: Exception) { null }
        return appKey
    }

    /** نمایش بنر در پایین صفحه (فقط صفحه اذان/خانه این را صدا می‌زند) */
    fun show(act: Activity, wv: WebView?) {
        activity = act
        webView = wv ?: findWebView(act)
        if (!showing) {
            showing = true
            attempts = 0
            if (key() == null) return       // بدون App Key: بی‌صدا رد شو
            attach(act)
            requestNextZone()
        } else if (attached && container?.visibility != android.view.View.VISIBLE) {
            attach(act)                     // بعد از برگشتن از صفحه دیگر دوباره وصل کن
        }
    }

    /** پنهان کردن بنر (بقیه صفحات) */
    fun hide() {
        showing = false
        cancelPending()
        val act = activity ?: return
        if (!attached) return
        act.runOnUiThread {
            setWebMargin(0)
            container?.visibility = android.view.View.GONE
            destroyAd()
            // بنر را از پنجره جدا می‌کنیم تا در صفحات دیگر منابع نگه ندارد
            detach(act)
        }
    }

    /** آزاد کردن همه منابع (بسته شدن برنامه) */
    fun destroy() {
        showing = false
        attached = false
        cancelPending()
        destroyAd()
        container = null
        banner = null
        webView = null
        activity = null
    }

    /* ---------- داخلی ---------- */

    private fun attach(act: Activity) {
        if (attached) { container?.visibility = android.view.View.VISIBLE; return }
        val root = act.findViewById<ViewGroup>(android.R.id.content) ?: return
        val bar = FrameLayout(act)
        bar.layoutParams = FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, dp(act, BANNER_H_DP), Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL)
        bar.setBackgroundColor(Color.TRANSPARENT)

        val bc = BannerContainer(act)
        bc.layoutParams = FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT,
            Gravity.CENTER)
        bar.addView(bc)
        bar.visibility = if (showing) android.view.View.VISIBLE else android.view.View.GONE

        root.addView(bar)
        container = bar
        banner = bc
        attached = true
    }

    private fun detach(act: Activity) {
        container?.let { (it.parent as? ViewGroup)?.removeView(it) }
        container = null
        banner = null
        attached = false
        setWebMargin(0)
    }

    private fun requestNextZone() {
        if (!showing || banner == null) return
        val zone = ZONES[zoneIdx % ZONES.size]
        val act = activity ?: return
        try {
            Tapsell.requestBannerAd(zone, BannerSize.BANNER_320_50, object : RequestResultListener {
                override fun onSuccess(id: String) { main.post { showAd(act, id) } }
                override fun onFailure(message: String) { main.post { onFail(message) } }
            })
        } catch (_: Exception) { onFail("request failed") }
    }

    private fun showAd(act: Activity, id: String) {
        val bc = banner ?: return
        if (!showing) return
        destroyAd()
        adId = id
        try {
            Tapsell.showBannerAd(id, bc, act, object : AdStateListener.Banner {
                override fun onAdImpression() {
                    main.post {
                        // WebView به‌اندازه نوار بنر جمع می‌شود تا نوار منو بالا بنشانَد
                        setWebMargin(dp(act, BANNER_H_DP))
                        scheduleRefresh()
                    }
                }
                override fun onAdClicked() {}
                override fun onAdFailed(message: String) { main.post { onFail(message) } }
            })
        } catch (_: Exception) { onFail("show failed") }
    }

    private fun onFail(msg: String) {
        if (!showing) return
        attempts++
        zoneIdx++
        if (attempts <= ZONES.size * 2) {          // همه فضاها را امتحان کن (۲ دور)
            requestNextZone()
        } else {
            attempts = 0                           // هیچ‌کدام پر نشد؛ بعداً دوباره
            schedule(RETRY_MS) { requestNextZone() }
        }
    }

    /** هر ۶۰ ثانیه: فضای بعدی، تبلیغ جدید؛ روی موفقیت، قبلی نابود می‌شود */
    private fun scheduleRefresh() {
        cancelPending()
        schedule(REFRESH_MS) {
            if (!showing) return@schedule
            zoneIdx++
            attempts = 0
            requestNextZone()
        }
    }

    private fun schedule(ms: Long, r: Runnable) {
        cancelPending()
        pending = r
        main.postDelayed(r, ms)
    }

    private fun cancelPending() {
        pending?.let { main.removeCallbacks(it) }
        pending = null
    }

    private fun destroyAd() {
        adId?.let { try { Tapsell.destroyBannerAd(it) } catch (_: Exception) {} }
        adId = null
    }

    private fun setWebMargin(px: Int) {
        val wv = webView ?: return
        try {
            wv.post {
                val lp = wv.layoutParams as? ViewGroup.MarginLayoutParams ?: return@post
                if (lp.bottomMargin != px) { lp.bottomMargin = px; wv.layoutParams = lp }
            }
        } catch (_: Exception) {}
    }

    private fun findWebView(act: Activity): WebView? {
        try {
            val root = act.findViewById<ViewGroup>(android.R.id.content)
            return searchWebView(root)
        } catch (_: Exception) { return null }
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

    private fun dp(act: Activity, v: Int): Int =
        Math.round(v * act.resources.displayMetrics.density)
}
