package com.ofoqshari.bz

import android.app.Activity
import android.graphics.Color
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.Gravity
import android.view.ViewGroup
import android.webkit.WebView
import android.widget.FrameLayout
import android.widget.TextView
import ir.tapsell.mediation.MediationInitializationListener
import ir.tapsell.mediation.Tapsell
import ir.tapsell.mediation.ad.AdStateListener
import ir.tapsell.mediation.ad.request.BannerSize
import ir.tapsell.mediation.ad.request.RequestResultListener
import ir.tapsell.mediation.ad.views.banner.BannerContainer

/**
 * تابلوی تبلیغات تپسل (بنر) — فقط در «بخش پایینی صفحه اصلی» (اذان/خانه) نمایش داده می‌شود.
 *
 * کارکرد:
 *  - یک BannerContainer در پایین صفحه (زیر نوار منو، پایین WebView) اضافه می‌شود
 *    و ارتفاع WebView به‌اندازه بنر کم می‌شود تا چیزی پوشانده نشود.
 *  - بین ۵ فضای تبلیغاتی (Zone) که در پنل تپسل ساخته‌اید می‌چرخد:
 *    اگر یک فضا تبلیغی نداشت، به‌طور خودکار فضای بعدی امتحان می‌شود.
 *    فضای جدید «صفحه اصلی» (نسخه ۲.۱.۴) اول لیست است تا اول از همان پر شود.
 *  - هر ۶۰ ثانیه بنر با فضای بعدی تازه‌سازی می‌شود.
 *  - در بقیه صفحات (تنظیمات، قبله، تقویم، …) و روی صفحه پخش اذان، بنر پنهان می‌شود.
 *  - تا وقتی تبلیغی نیامده، یک نوشتهٔ کوچک وضعیت («در انتظار تبلیغ…» یا
 *    «تبلیغی در دسترس نیست») در همان نوار دیده می‌شود تا علت خالی‌بودن جا معلوم باشد.
 *  - همهٔ مراحل در Logcat با تگ «AzanAds» ثبت می‌شود (adb logcat -s AzanAds).
 *
 * راه‌اندازی (Initialization): طبق مستندات رسمی تپسل مدیشن، SDK به‌طور پیش‌فرض با
 * ContentProvider هنگام باز شدن برنامه خودش راه‌اندازی می‌شود و کلید را از
 * متادیتای «ir.tapsell.mediation.APPLICATION_KEY» مانیفست می‌خواند (پچ این کلید را
 * هم به‌صورت manifestPlaceholder و هم به‌صورت متادیتای مستقیم در مانیفست می‌نویسد).
 * با setInitializationListener هم لحظهٔ کامل‌شدن راه‌اندازی را ثبت و درخواست معلق را تکرار می‌کنیم.
 *
 * مبنای فنی: Tapsell Mediation SDK نسخه ۱.۳.۰
 * (ir.tapsell.mediation:tapsell + ir.tapsell.mediation.adapter:legacy).
 * امضاهای متدها با بایت‌کد AAR نسخه ۱.۳.۰ در Maven Central اعتبارسنجی شده است:
 *   requestBannerAd(zone, BannerSize, RequestResultListener)
 *   showBannerAd(adId, BannerContainer, Activity, AdStateListener.Banner)
 *   destroyBannerAd(adId)
 *   setInitializationListener(MediationInitializationListener)
 */
object AzanAds {

    private const val TAG = "AzanAds"

    /* فضاهای تبلیغاتی تپسل — بنر پایین صفحه اصلی (اذان/خانه).
     * فضای اول (6b010ebfaeabeb750feb8f6f) فضای جدید «صفحه اصلی» است و چرخش
     * از آن شروع می‌شود؛ اگر پر نشد به‌طور خودکار سراغ ۴ فضای بعدی می‌رود. */
    private val ZONES = arrayOf(
        "6b010ebfaeabeb750feb8f6f",
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
    private var status: TextView? = null         // نوشتهٔ وضعیت تا قبل از اولین تبلیغ
    private var banner: BannerContainer? = null
    private var activity: Activity? = null
    private var webView: WebView? = null

    private var showing = false          // درخواست نمایش از سمت UI فعال است
    private var attached = false         // container به پنجره چسبیده است
    private var adId: String? = null     // تبلیغِ در حال نمایش
    private var zoneIdx = 0
    private var attempts = 0
    private var pending: Runnable? = null
    private var initListenerSet = false  // listener راه‌اندازی فقط یک‌بار ست می‌شود
    private var initialized = false      // SDK تپسل راه‌اندازی شده است

    private var appKey: String? = null   // از متادیتای مانیفست خوانده می‌شود

    /** خواندن App Key از متادیتای مانیفست (patch_android.py این مقدار را می‌نویسد). */
    private fun key(): String? {
        if (appKey != null) return appKey
        appKey = try {
            val act = activity ?: return null
            val ai = act.packageManager.getApplicationInfo(act.packageName, android.content.pm.PackageManager.GET_META_DATA)
            val raw = ai?.metaData?.getString("ir.tapsell.mediation.APPLICATION_KEY")
            raw?.trim()?.takeIf { it.isNotEmpty() && it != "PUT_TAPSELL_APP_KEY_HERE" }
        } catch (e: Exception) {
            Log.w(TAG, "read app key failed: ${e.message}")
            null
        }
        Log.d(TAG, "app key present: ${appKey != null}")
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
                    initialized = true
                    Log.d(TAG, "Tapsell SDK initialization complete")
                    main.post {
                        if (showing && adId == null && banner != null) requestNextZone()
                    }
                }
            })
            Log.d(TAG, "initialization listener set")
        } catch (e: Exception) {
            Log.w(TAG, "setInitializationListener failed: ${e.message}")
        }
    }

    /** نمایش بنر در پایین صفحه (فقط صفحه اصلی/اذان این را صدا می‌زند) */
    fun show(act: Activity, wv: WebView?) {
        activity = act
        webView = wv ?: findWebView(act)
        Log.d(TAG, "show() on " + act.javaClass.simpleName + ", hasWebView=" + (webView != null))
        if (!showing) {
            showing = true
            attempts = 0
            attach(act)
            if (key() == null) {
                setStatus("کلید تبلیغ در برنامه ثبت نشده")   // اشکال بیلد، نه اینترنت
                return
            }
            watchInitialization()
            setStatus("در انتظار تبلیغ…")
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
        status = null
        banner = null
        webView = null
        activity = null
    }

    /* ---------- داخلی ---------- */

    private fun attach(act: Activity) {
        if (attached) {
            container?.visibility = android.view.View.VISIBLE
            setWebMargin(dp(act, BANNER_H_DP))
            return
        }
        val root = act.findViewById<ViewGroup>(android.R.id.content) ?: return
        val bar = FrameLayout(act)
        bar.layoutParams = FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, dp(act, BANNER_H_DP), Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL)
        bar.setBackgroundColor(Color.TRANSPARENT)

        // نوشتهٔ وضعیت — تا وقتی هیچ تبلیغی نمایش داده نشده، جای خالی بنر را توضیح می‌دهد
        val tv = TextView(act)
        tv.layoutParams = FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT, Gravity.CENTER)
        tv.text = "در انتظار تبلیغ…"
        tv.textSize = 11f
        tv.setTextColor(Color.argb(150, 255, 255, 255))
        tv.gravity = Gravity.CENTER
        bar.addView(tv)

        val bc = BannerContainer(act)
        bc.layoutParams = FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT,
            Gravity.CENTER)
        bar.addView(bc)
        bar.visibility = if (showing) android.view.View.VISIBLE else android.view.View.GONE

        root.addView(bar)
        container = bar
        status = tv
        banner = bc
        attached = true
        // از همین لحظه جا رزرو می‌شود تا نوشتهٔ وضعیت روی نوار منو نیفتد
        setWebMargin(dp(act, BANNER_H_DP))
    }

    private fun detach(act: Activity) {
        container?.let { (it.parent as? ViewGroup)?.removeView(it) }
        container = null
        status = null
        banner = null
        attached = false
        setWebMargin(0)
    }

    private fun requestNextZone() {
        if (!showing || banner == null) return
        val zone = ZONES[zoneIdx % ZONES.size]
        val act = activity ?: return
        Log.d(TAG, "request banner zone " + (zoneIdx % ZONES.size + 1) + "/" + ZONES.size + " -> " + zone)
        try {
            Tapsell.requestBannerAd(zone, BannerSize.BANNER_320_50, object : RequestResultListener {
                override fun onSuccess(id: String) {
                    Log.d(TAG, "request success (adId=" + id.take(12) + "…)")
                    main.post { showAd(act, id) }
                }
                override fun onFailure(message: String) {
                    Log.w(TAG, "request failed: " + message)
                    main.post { onFail(message) }
                }
            })
        } catch (e: Exception) {
            Log.w(TAG, "request threw: " + e.message)
            onFail(e.message ?: "request failed")
        }
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
                        Log.d(TAG, "banner impression")
                        setStatus(null)                       // نوشتهٔ وضعیت برداشته شود
                        setWebMargin(dp(act, BANNER_H_DP))
                        scheduleRefresh()
                    }
                }
                override fun onAdClicked() { Log.d(TAG, "banner clicked") }
                override fun onAdFailed(message: String) {
                    Log.w(TAG, "banner show failed: " + message)
                    main.post { onFail(message) }
                }
            })
        } catch (e: Exception) {
            Log.w(TAG, "show threw: " + e.message)
            onFail(e.message ?: "show failed")
        }
    }

    private fun onFail(msg: String) {
        if (!showing) return
        attempts++
        zoneIdx++
        if (attempts <= ZONES.size * 2) {          // همه فضاها را امتحان کن (۲ دور)
            requestNextZone()
        } else {
            setStatus("تبلیغی در دسترس نیست")       // هیچ فضایی پر نشد؛ پیام وضعیت
            attempts = 0                           // بعداً دوباره
            schedule(RETRY_MS) { requestNextZone() }
        }
    }

    /** نوشتهٔ وضعیت نوار بنر؛ با null مخفی می‌شود (وقتی تبلیغ واقعی نمایش داده شد) */
    private fun setStatus(text: String?) {
        main.post {
            val tv = status ?: return@post
            if (text == null) {
                tv.visibility = android.view.View.GONE
            } else {
                tv.text = text
                tv.visibility = android.view.View.VISIBLE
            }
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
        adId?.let {
            try {
                Tapsell.destroyBannerAd(it)
                Log.d(TAG, "banner destroyed")
            } catch (e: Exception) { Log.w(TAG, "destroy threw: " + e.message) }
        }
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
