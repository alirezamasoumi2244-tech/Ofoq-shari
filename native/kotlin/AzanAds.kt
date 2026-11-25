package com.ofoqshari.bz

import android.app.Activity
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.widget.AbsoluteLayout
import android.widget.FrameLayout
import android.widget.TextView
import com.adivery.sdk.AdiveryAdListener
import com.adivery.sdk.AdiveryNativeAdView
import org.json.JSONArray
import org.json.JSONObject
import org.json.JSONTokener

/** Adivery Native-only placements for Ofoq Shari. */
object AzanAds {
    private const val TAG = "AzanAds"
    private const val HOME_PLACEMENT = "4177bf43-7574-443c-b930-acb5775cf6aa"
    private val AZAN_PLACEMENTS = listOf(
        "8eec5f96-9daf-4936-92b5-ace6239f6164",
        "3391098b-2a21-4b5a-a870-560ea156ac10",
        "125131a5-5a61-4402-85e3-ef9228910bd8",
        "ca80369f-f3ef-4e91-91d4-a514706cfb9d"
    )
    private const val POLL_MS = 250L
    private const val SCROLL_MS = 80L
    private const val RETRY_MS = 30_000L
    private const val JS_RECTS = "window.__azanAdRects ? window.__azanAdRects() : 'null'"

    private class Slot(val name: String, val placementId: String) {
        var visible = false
        var loaded = false
        var loading = false
        var lastError: String? = null
        var wrap: FrameLayout? = null
        var adView: AdiveryNativeAdView? = null
        var status: TextView? = null
        var retry: Runnable? = null
    }

    private val main = Handler(Looper.getMainLooper())
    private var activity: Activity? = null
    private var webView: WebView? = null
    private val homeSlot = Slot("home", HOME_PLACEMENT)
    private val azanSlots = AZAN_PLACEMENTS.mapIndexed { i, id -> Slot("azan${i+1}", id) }
    private val allSlots get() = listOf(homeSlot) + azanSlots
    private var attached = false
    private var bridgeAttached = false
    private var polling = false
    private var lastScrollRead = 0L
    @Volatile private var sdkState = "وضعیت SDK هنوز ثبت نشده"

    fun setSdkState(value: String) { sdkState = value }

    class RectsBridge {
        @JavascriptInterface fun onRects(json: String?) = onRectsFromWeb(json)
        @JavascriptInterface fun log(message: String?) = Log.d(TAG, "[web] ${message ?: ""}")
    }

    fun onRectsFromWeb(json: String?) { main.post { applyRects(json) } }

    fun show(act: Activity, wv: WebView?) {
        activity = act
        webView = wv ?: findWebView(act)
        ensureViews(act)
        if (!polling) {
            polling = true
            main.postDelayed({ poll() }, POLL_MS)
        }
    }

    fun hide() {
        allSlots.forEach { it.visible = false; it.wrap?.visibility = View.GONE }
    }

    fun destroy() {
        polling = false
        attached = false
        allSlots.forEach {
            it.retry?.let(main::removeCallbacks)
            it.retry = null
            it.adView = null
            it.wrap = null
            it.status = null
            it.loaded = false
            it.loading = false
            it.visible = false
        }
        webView = null
        activity = null
    }

    private fun ensureViews(act: Activity) {
        val wv = webView ?: findWebView(act) ?: return
        if (!attached) {
            allSlots.forEach { slot ->
                val frame = FrameLayout(act).apply {
                    layoutParams = AbsoluteLayout.LayoutParams(1, 1, 0, 0)
                    visibility = View.GONE
                    background = GradientDrawable().apply {
                        setColor(Color.rgb(36, 28, 20))
                        cornerRadius = 14f * act.resources.displayMetrics.density
                    }
                }
                val status = TextView(act).apply {
                    layoutParams = FrameLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        Gravity.CENTER
                    )
                    text = "در حال دریافت تبلیغ…"
                    textSize = 10f
                    maxLines = 8
                    setTextIsSelectable(true)
                    setTextColor(Color.LTGRAY)
                    gravity = Gravity.CENTER
                    setPadding(12, 4, 12, 4)
                }
                val ad = LayoutInflater.from(act).inflate(
                    com.ofoqshari.bz.R.layout.adivery_native_slot, frame, false
                ) as AdiveryNativeAdView
                ad.visibility = View.GONE
                frame.addView(status)
                frame.addView(ad, FrameLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT
                ))
                slot.wrap = frame
                slot.status = status
                slot.adView = ad
                ad.setPlacementId(slot.placementId)
                ad.setListener(object : AdiveryAdListener() {
                    override fun onAdLoaded() {
                        main.post {
                            slot.loaded = true
                            slot.loading = false
                            slot.status?.visibility = View.GONE
                            slot.adView?.visibility = View.VISIBLE
                            Log.i(TAG, "[${slot.name}] Native ad loaded placement=${slot.placementId}")
                        }
                    }
                    override fun onAdShown() {
                        Log.i(TAG, "[${slot.name}] Native ad shown")
                    }
                    override fun onAdClicked() {
                        Log.i(TAG, "[${slot.name}] Native ad clicked")
                    }
                    override fun onError(reason: String) {
                        main.post {
                            slot.loaded = false
                            slot.loading = false
                            slot.adView?.visibility = View.GONE
                            showError(slot, reason, "callback onError")
                            scheduleRetry(slot)
                            Log.e(TAG, "[${slot.name}] Adivery error: $reason")
                        }
                    }
                })
                // Each SDK view is a child of the WebView and occupies its exact DOM slot.
                wv.addView(frame, AbsoluteLayout.LayoutParams(1, 1, 0, 0))
            }
            attached = true
        }
        if (!bridgeAttached) {
            try {
                wv.addJavascriptInterface(RectsBridge(), "AzanAdsBridge")
                bridgeAttached = true
                wv.viewTreeObserver.addOnScrollChangedListener {
                    val now = System.currentTimeMillis()
                    if (now - lastScrollRead >= SCROLL_MS) {
                        lastScrollRead = now
                        readRectsViaJs()
                    }
                }
            } catch (e: Exception) { Log.e(TAG, "bridge attach failed", e) }
        }
    }

    private fun readRectsViaJs() {
        try { webView?.evaluateJavascript(JS_RECTS) { applyRects(it) } }
        catch (e: Exception) { Log.w(TAG, "evaluateJavascript failed: ${e.message}") }
    }

    private fun poll() {
        if (!polling) return
        if (activity == null || webView == null) {
            main.postDelayed({ poll() }, POLL_MS)
            return
        }
        readRectsViaJs()
        main.postDelayed({ poll() }, POLL_MS)
    }

    private fun applyRects(result: String?) {
        if (!polling) return
        val wv = webView ?: return
        var home: IntArray? = null
        var azan: JSONArray? = null
        try {
            var value: Any? = JSONTokener(result ?: "null").nextValue()
            if (value is String) value = JSONTokener(value).nextValue()
            if (value is JSONObject) {
                home = rectOf(value.optJSONArray("home"))
                azan = value.optJSONArray("azan")
            }
        } catch (e: Exception) { Log.w(TAG, "rect parse failed: ${e.message}") }
        place(homeSlot, home, wv.width, wv.height, wv.scrollX, wv.scrollY)
        azanSlots.forEachIndexed { index, slot ->
            place(slot, rectOf(azan?.optJSONArray(index)), wv.width, wv.height, wv.scrollX, wv.scrollY)
        }
    }

    private fun rectOf(a: JSONArray?): IntArray? {
        if (a == null || a.length() != 4) return null
        val l=a.optDouble(0); val t=a.optDouble(1); val w=a.optDouble(2); val h=a.optDouble(3)
        if (w < 10 || h < 10) return null
        val d = activity?.resources?.displayMetrics?.density ?: 1f
        return intArrayOf((l*d).toInt(), (t*d).toInt(), (w*d).toInt(), (h*d).toInt())
    }

    private fun onScreen(r: IntArray, width: Int, height: Int, scrollX: Int, scrollY: Int): Boolean {
        val left = maxOf(r[0] - scrollX, 0)
        val right = minOf(r[0] + r[2] - scrollX, width)
        val top = maxOf(r[1] - scrollY, 0)
        val bottom = minOf(r[1] + r[3] - scrollY, height)
        return right - left >= 12 && bottom - top >= 12
    }

    /**
     * Ad slots are measured in document coordinates by JavaScript. Native children
     * of a WebView use viewport coordinates, so subtract the current WebView scroll
     * offsets before laying them out. This keeps each native ad locked to its exact
     * in-page placeholder while scrolling, resizing, and switching screens.
     */
    @Suppress("DEPRECATION")
    private fun move(v: View, r: IntArray, scrollX: Int, scrollY: Int) {
        val parent = webView ?: return
        val left = r[0] - scrollX
        val top = r[1] - scrollY
        parent.updateViewLayout(v, AbsoluteLayout.LayoutParams(r[2], r[3], left, top))
        v.visibility = View.VISIBLE
    }

    private fun place(slot: Slot, r: IntArray?, width: Int, height: Int, scrollX: Int, scrollY: Int) {
        val frame = slot.wrap ?: return
        if (r == null || !onScreen(r, width, height, scrollX, scrollY)) {
            frame.visibility = View.GONE
            slot.visible = false
            return
        }
        move(frame, r, scrollX, scrollY)
        if (!slot.visible) {
            frame.bringToFront()
            frame.elevation = 1f
        }
        slot.visible = true
        load(slot)
    }

    private fun load(slot: Slot) {
        if (!slot.visible || slot.loaded || slot.loading) return
        slot.retry?.let(main::removeCallbacks); slot.retry=null
        val ad=slot.adView ?: return
        slot.loading=true
        slot.status?.text="در حال دریافت تبلیغ…"
        slot.status?.visibility=View.VISIBLE
        try { ad.loadAd() }
        catch (e: Exception) {
            slot.loading=false
            showError(slot, "${e.javaClass.simpleName}: ${e.message ?: "بدون توضیح"}", "فراخوانی loadAd")
            scheduleRetry(slot)
        }
    }

    private fun showError(slot: Slot, reason: String, stage: String) {
        val time = java.text.SimpleDateFormat("HH:mm:ss", java.util.Locale.getDefault())
            .format(java.util.Date())
        val report = """
            خطای دریافت تبلیغ
            جایگاه: ${slot.name}
            مرحله: $stage
            خطا: $reason
            شناسه جایگاه: ${slot.placementId}
            وضعیت SDK: $sdkState
            زمان: $time

            برای ارسال گزارش، متن را لمس طولانی کن و کپی را بزن.
        """.trimIndent()
        slot.status?.text = report
        slot.status?.visibility = View.VISIBLE
        slot.lastError = reason
    }

    private fun scheduleRetry(slot: Slot) {
        slot.retry?.let(main::removeCallbacks)
        val r=Runnable { if (slot.visible && !slot.loaded && !slot.loading) load(slot) }
        slot.retry=r
        main.postDelayed(r,RETRY_MS)
    }

    private fun findWebView(act: Activity): WebView? =
        try { searchWebView(act.findViewById(android.R.id.content)) } catch (_: Exception) { null }

    private fun searchWebView(v: View?): WebView? {
        if (v is WebView) return v
        if (v is ViewGroup) for (i in 0 until v.childCount) searchWebView(v.getChildAt(i))?.let { return it }
        return null
    }
}
