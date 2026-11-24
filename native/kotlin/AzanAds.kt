package com.ofoqshari.bz

import android.app.Activity
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.Gravity
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import ir.tapsell.plus.AdHolder
import ir.tapsell.plus.AdRequestCallback
import ir.tapsell.plus.AdShowListener
import ir.tapsell.plus.TapsellPlus
import ir.tapsell.plus.model.TapsellPlusAdModel
import ir.tapsell.plus.model.TapsellPlusErrorModel
import org.json.JSONArray
import org.json.JSONObject
import org.json.JSONTokener

/**
 * Tapsell Plus native-banner integration.
 * The dashboard zone IDs supplied for Ofoq Shari belong to Tapsell Plus,
 * not the newer Tapsell Mediation SDK.
 */
object AzanAds {
    private const val TAG = "AzanAds"
    private const val HOME_ZONE = "6b0071167597d07cbabd6e9e"
    private val AZAN_ZONES = arrayOf(
        "6b0071167597d07cbabd6e9e",
        "6b00715f728e2256843b0caf",
        "6b007174728e2256843b0cb0",
        "6b0071897597d07cbabd6e9f"
    )
    private val ALL_ZONES = AZAN_ZONES.distinct()
    private const val POLL_MS = 250L
    private const val SCROLL_MS = 80L
    private const val RETRY_MS = 30_000L
    private const val REFRESH_MS = 75_000L
    private const val REQUEST_TIMEOUT_MS = 15_000L
    private const val JS_RECTS = "window.__azanAdRects ? window.__azanAdRects() : 'null'"

    private class Slot(val name: String, firstZone: String) {
        val zones: List<String> = listOf(firstZone) + ALL_ZONES.filter { it != firstZone }
        var zoneIndex = 0
        var attempts = 0
        var requestToken = 0
        var requesting = false
        var visible = false
        var responseId: String? = null
        var pendingId: String? = null
        var holder: AdHolder? = null
        var wrap: FrameLayout? = null
        var status: TextView? = null
        var lastError: String? = null
        var task: Runnable? = null
    }

    private val main = Handler(Looper.getMainLooper())
    private var activity: Activity? = null
    private var webView: WebView? = null
    private var homeSlot = Slot("home", HOME_ZONE)
    private var azanSlots = listOf(
        Slot("azan1", AZAN_ZONES[0]),
        Slot("azan2", AZAN_ZONES[1]),
        Slot("azan3", AZAN_ZONES[2]),
        Slot("azan4", AZAN_ZONES[3])
    )
    private var azanWrap: LinearLayout? = null
    private var allSlots: List<Slot> = listOf(homeSlot) + azanSlots
    private var attached = false
    private var bridgeAttached = false
    private var scrollHooked = false
    private var polling = false
    private var sdkReady = false
    private var lastScrollRead = 0L

    class RectsBridge {
        @JavascriptInterface
        fun onRects(json: String?) = onRectsFromWeb(json)
        @JavascriptInterface
        fun log(message: String?) = Log.d(TAG, "[web] ${message ?: ""}")
    }

    fun onRectsFromWeb(json: String?) {
        main.post { applyRects(json) }
    }

    fun onSdkReadyFromActivity() {
        main.post {
            sdkReady = true
            Log.i(TAG, "Tapsell Plus initialized")
            allSlots.forEach { kick(it) }
        }
    }

    fun onSdkInitFailed(message: String) {
        main.post {
            sdkReady = false
            Log.e(TAG, "Tapsell Plus initialization failed: $message")
            allSlots.filter { it.visible }.forEach {
                setStatus(it, "راه‌اندازی تبلیغات ناموفق بود", message)
            }
        }
    }

    fun show(act: Activity, wv: WebView?) {
        activity = act
        webView = wv ?: findWebView(act)
        Log.d(TAG, "adsShow: activity=${act.javaClass.simpleName}, webView=${webView != null}, sdkReady=$sdkReady")
        ensureViews(act)
        if (!polling) {
            polling = true
            main.postDelayed({ poll() }, POLL_MS)
        }
        allSlots.forEach { kick(it) }
    }

    fun hide() {
        allSlots.forEach { slot ->
            slot.visible = false
            slot.wrap?.visibility = android.view.View.GONE
        }
        azanWrap?.visibility = android.view.View.GONE
    }

    fun destroy() {
        polling = false
        attached = false
        allSlots.forEach { slot ->
            cancel(slot)
            slot.responseId?.let { destroyAd(slot, it) }
            slot.responseId = null
            slot.pendingId = null
            slot.requesting = false
            slot.visible = false
            slot.holder = null
            slot.wrap = null
            slot.status = null
        }
        azanWrap = null
        webView = null
        activity = null
    }

    private fun ensureViews(act: Activity) {
        val root = act.findViewById<ViewGroup>(android.R.id.content) ?: return
        if (!attached) {
            val home = FrameLayout(act)
            home.layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT
            )
            home.visibility = android.view.View.GONE
            fillSlot(act, home, homeSlot)
            root.addView(home)
            homeSlot.wrap = home

            val box = LinearLayout(act).apply {
                orientation = LinearLayout.VERTICAL
                layoutParams = FrameLayout.LayoutParams(
                    ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT
                )
                visibility = android.view.View.GONE
            }
            azanSlots.forEach { slot ->
                val cell = FrameLayout(act)
                cell.layoutParams = LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f
                )
                fillSlot(act, cell, slot)
                box.addView(cell)
                slot.wrap = cell
            }
            root.addView(box)
            azanWrap = box
            attached = true
            Log.d(TAG, "native ad containers attached")
        }

        val wv = webView
        if (wv != null && !bridgeAttached) {
            try {
                wv.addJavascriptInterface(RectsBridge(), "AzanAdsBridge")
                bridgeAttached = true
                Log.d(TAG, "JavaScript bridge attached")
            } catch (e: Exception) {
                Log.e(TAG, "bridge attach failed", e)
            }
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

    private fun fillSlot(act: Activity, cell: FrameLayout, slot: Slot) {
        val bg = GradientDrawable().apply {
            setColor(Color.rgb(36, 28, 20))
            cornerRadius = 14f * act.resources.displayMetrics.density
            setStroke(
                (act.resources.displayMetrics.density).toInt().coerceAtLeast(1),
                Color.argb(60, 232, 184, 109)
            )
        }
        cell.background = bg
        val status = TextView(act).apply {
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT,
                Gravity.CENTER
            )
            text = "در حال آماده‌سازی تبلیغ…"
            textSize = 11f
            setTextColor(Color.LTGRAY)
            gravity = Gravity.CENTER
            maxLines = 3
            setPadding(12, 4, 12, 4)
        }
        cell.addView(status)
        slot.status = status
        try {
            slot.holder = TapsellPlus.createAdHolder(
                act, cell, ir.tapsell.plus.R.layout.native_banner
            )
            Log.d(TAG, "[${slot.name}] native AdHolder created")
        } catch (e: Exception) {
            Log.e(TAG, "[${slot.name}] AdHolder creation failed", e)
            setStatus(slot, "ساخت جایگاه تبلیغ ناموفق بود", e.message ?: "AdHolder error")
        }
    }

    private fun readRectsViaJs() {
        val wv = webView ?: return
        try {
            wv.evaluateJavascript(JS_RECTS) { result -> applyRects(result) }
        } catch (e: Exception) {
            Log.w(TAG, "evaluateJavascript failed: ${e.message}")
        }
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
        val act = activity ?: return
        val wv = webView ?: return
        val root = act.findViewById<ViewGroup>(android.R.id.content) ?: return
        var home: IntArray? = null
        var azan: IntArray? = null
        try {
            var value: Any? = JSONTokener(result ?: "null").nextValue()
            if (value is String) value = JSONTokener(value).nextValue()
            if (value is JSONObject) {
                home = rectOf(value.optJSONArray("home"))
                azan = rectOf(value.optJSONArray("azan"))
            }
        } catch (e: Exception) {
            Log.w(TAG, "rect parse failed: ${e.message}; raw=${result ?: "null"}")
        }
        val rootLoc = IntArray(2)
        val webLoc = IntArray(2)
        root.getLocationInWindow(rootLoc)
        wv.getLocationInWindow(webLoc)
        val ox = webLoc[0] - rootLoc[0]
        val oy = webLoc[1] - rootLoc[1]
        place(homeSlot, home, ox, oy, wv.height)
        placeAzanBox(azan, ox, oy, wv.height)
    }

    private fun rectOf(array: JSONArray?): IntArray? {
        if (array == null || array.length() != 4) return null
        val left = array.optDouble(0)
        val top = array.optDouble(1)
        val width = array.optDouble(2)
        val height = array.optDouble(3)
        if (width < 10 || height < 10) return null
        return intArrayOf(
            left.toInt(), top.toInt(), width.toInt(), height.toInt()
        )
    }

    private fun onScreen(rect: IntArray, viewHeight: Int): Boolean {
        val visibleTop = maxOf(rect[1], 0)
        val visibleBottom = minOf(rect[1] + rect[3], viewHeight)
        return visibleBottom - visibleTop >= rect[3] * 0.45f
    }

    private fun move(view: android.view.View, rect: IntArray, ox: Int, oy: Int) {
        val width = rect[2]
        val height = rect[3]
        val params = view.layoutParams
        if (params.width != width || params.height != height) {
            params.width = width
            params.height = height
            view.layoutParams = params
        }
        view.x = (rect[0] + ox).toFloat()
        view.y = (rect[1] + oy).toFloat()
        view.visibility = android.view.View.VISIBLE
    }

    private fun place(slot: Slot, rect: IntArray?, ox: Int, oy: Int, viewHeight: Int) {
        val wrap = slot.wrap ?: return
        if (rect == null || !onScreen(rect, viewHeight)) {
            wrap.visibility = android.view.View.GONE
            slot.visible = false
            return
        }
        move(wrap, rect, ox, oy)
        if (!slot.visible) {
            wrap.bringToFront()
            wrap.elevation = 24f
        }
        slot.visible = true
        kick(slot)
    }

    private fun placeAzanBox(rect: IntArray?, ox: Int, oy: Int, viewHeight: Int) {
        val box = azanWrap ?: return
        if (rect == null || !onScreen(rect, viewHeight)) {
            box.visibility = android.view.View.GONE
            azanSlots.forEach { it.visible = false }
            return
        }
        move(box, rect, ox, oy)
        box.bringToFront()
        box.elevation = 24f
        azanSlots.forEach {
            it.visible = true
            kick(it)
        }
    }

    private fun kick(slot: Slot) {
        if (!slot.visible || slot.requesting || slot.responseId != null) return
        val pending = slot.pendingId
        if (pending != null) {
            slot.pendingId = null
            showAd(slot, pending)
            return
        }
        if (!sdkReady) {
            setStatus(slot, "در حال اتصال به تپسل…", null)
            return
        }
        if (slot.holder == null) {
            setStatus(slot, "جایگاه تبلیغ آماده نیست", "AdHolder is null")
            return
        }
        requestAd(slot)
    }

    private fun requestAd(slot: Slot) {
        val act = activity ?: return
        val zone = slot.zones[slot.zoneIndex % slot.zones.size]
        slot.requesting = true
        val token = ++slot.requestToken
        setStatus(slot, "در حال دریافت تبلیغ…", slot.lastError)
        Log.d(TAG, "[${slot.name}] request native zone=$zone")
        schedule(slot, REQUEST_TIMEOUT_MS) {
            if (slot.requesting && slot.requestToken == token) {
                slot.requesting = false
                slot.requestToken++
                onRequestFailed(slot, "request timeout after ${REQUEST_TIMEOUT_MS}ms")
            }
        }
        try {
            TapsellPlus.requestNativeAd(act, zone, object : AdRequestCallback() {
                override fun response(model: TapsellPlusAdModel) {
                    super.response(model)
                    main.post {
                        if (!slot.requesting || slot.requestToken != token) {
                            val staleId = model.responseId
                            if (!staleId.isNullOrBlank()) destroyAd(slot, staleId)
                            return@post
                        }
                        cancel(slot)
                        slot.requesting = false
                        slot.attempts = 0
                        slot.lastError = null
                        val id = model.responseId
                        Log.i(TAG, "[${slot.name}] ad response received")
                        if (id.isNullOrBlank()) {
                            onRequestFailed(slot, "empty response id")
                        } else if (slot.visible) {
                            showAd(slot, id)
                        } else {
                            slot.pendingId = id
                        }
                    }
                }

                override fun error(message: String) {
                    main.post {
                        if (!slot.requesting || slot.requestToken != token) return@post
                        cancel(slot)
                        slot.requesting = false
                        Log.w(TAG, "[${slot.name}] request error: $message")
                        onRequestFailed(slot, message)
                    }
                }
            })
        } catch (e: Exception) {
            cancel(slot)
            slot.requesting = false
            Log.e(TAG, "[${slot.name}] request threw", e)
            onRequestFailed(slot, e.message ?: "request failed")
        }
    }

    private fun showAd(slot: Slot, responseId: String) {
        val act = activity ?: return
        val holder = slot.holder ?: run {
            onRequestFailed(slot, "AdHolder missing")
            return
        }
        try {
            slot.responseId = responseId
            setStatus(slot, "در حال نمایش تبلیغ…", null)
            TapsellPlus.showNativeAd(act, responseId, holder, object : AdShowListener() {
                override fun onOpened(model: TapsellPlusAdModel) {
                    super.onOpened(model)
                    Log.i(TAG, "[${slot.name}] native ad opened")
                    main.post {
                        setStatus(slot, null, null)
                        schedule(slot, REFRESH_MS) {
                            if (slot.visible) {
                                slot.responseId?.let { destroyAd(slot, it) }
                                slot.responseId = null
                                requestAd(slot)
                            }
                        }
                    }
                }

                override fun onError(error: TapsellPlusErrorModel) {
                    super.onError(error)
                    val message = error.toString()
                    Log.e(TAG, "[${slot.name}] show error: $message")
                    main.post {
                        cancel(slot)
                        slot.responseId = null
                        destroyAd(slot, responseId)
                        onRequestFailed(slot, message)
                    }
                }
            })
        } catch (e: Exception) {
            slot.responseId = null
            destroyAd(slot, responseId)
            Log.e(TAG, "[${slot.name}] show threw", e)
            onRequestFailed(slot, e.message ?: "show failed")
        }
    }

    private fun onRequestFailed(slot: Slot, message: String) {
        slot.lastError = message
        slot.attempts++
        slot.zoneIndex = (slot.zoneIndex + 1) % slot.zones.size
        Log.w(TAG, "[${slot.name}] trying next zone after failure: $message")
        if (slot.attempts >= slot.zones.size) {
            slot.attempts = 0
            setStatus(slot, "فعلاً تبلیغی در دسترس نیست", message)
            schedule(slot, RETRY_MS) { if (slot.visible) requestAd(slot) }
        } else {
            setStatus(slot, "در حال تلاش برای دریافت تبلیغ…", message)
            schedule(slot, 2_000L) { if (slot.visible) kick(slot) }
        }
    }

    private fun setStatus(slot: Slot, message: String?, error: String?) {
        val view = slot.status ?: return
        if (message == null) {
            view.visibility = android.view.View.GONE
            return
        }
        view.text = if (error.isNullOrBlank()) message else "$message\n$error"
        view.visibility = android.view.View.VISIBLE
    }

    private fun schedule(slot: Slot, delay: Long, action: () -> Unit) {
        cancel(slot)
        val task = Runnable { action() }
        slot.task = task
        main.postDelayed(task, delay)
    }

    private fun cancel(slot: Slot) {
        slot.task?.let { main.removeCallbacks(it) }
        slot.task = null
    }

    private fun destroyAd(slot: Slot, responseId: String) {
        try {
            activity?.let { TapsellPlus.destroyNativeBanner(it, responseId) }
            Log.d(TAG, "[${slot.name}] native ad destroyed")
        } catch (e: Exception) {
            Log.w(TAG, "[${slot.name}] destroy failed: ${e.message}")
        }
    }

    private fun findWebView(act: Activity): WebView? {
        return try {
            searchWebView(act.findViewById(android.R.id.content))
        } catch (_: Exception) {
            null
        }
    }

    private fun searchWebView(view: android.view.View?): WebView? {
        if (view is WebView) return view
        if (view is ViewGroup) {
            for (index in 0 until view.childCount) {
                searchWebView(view.getChildAt(index))?.let { return it }
            }
        }
        return null
    }
}
