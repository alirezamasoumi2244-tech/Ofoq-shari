package com.ofoqshari.bz

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.widget.RemoteViews
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/** Shared helpers for all prayer widgets */
object WidgetData {
    data class NextInfo(
        val name: String,
        val time: String,
        val sub: String,
        val remainMs: Long,
        val progress: Int,   // 0..1000
        val remainLabel: String
    )

    fun nextAzan(events: JSONArray, now: Long): NextInfo {
        var nextName = "—"
        var nextTime = "—"
        var sub = "برنامه را یک‌بار باز کنید"
        var remainMs = 0L
        var progress = 0
        var remainLabel = "--:--"
        var prevT = now - 3600000L // fallback

        for (i in 0 until events.length()) {
            val e = events.optJSONObject(i) ?: continue
            if (e.optString("type") != "azan") continue
            val t = e.optLong("t", 0)
            if (t > now) {
                nextName = "اذان " + e.optString("name", "")
                nextTime = SimpleDateFormat("HH:mm", Locale.US).format(Date(t))
                remainMs = t - now
                val mins = (remainMs / 60000).toInt()
                sub = when {
                    mins < 1 -> "کمتر از یک دقیقه"
                    mins < 60 -> "$mins دقیقه مانده"
                    else -> "${mins / 60} ساعت و ${mins % 60} دقیقه"
                }
                val totalSec = remainMs / 1000
                val h = totalSec / 3600
                val m = (totalSec % 3600) / 60
                remainLabel = if (h > 0) String.format(Locale.US, "%d:%02d", h, m)
                else String.format(Locale.US, "%d:%02d", m, totalSec % 60)

                // progress: how much of the interval from previous azan has passed
                val span = (t - prevT).coerceAtLeast(1L)
                val done = (now - prevT).coerceIn(0L, span)
                progress = ((done * 1000) / span).toInt().coerceIn(0, 1000)
                break
            } else {
                prevT = t
            }
        }
        return NextInfo(nextName, nextTime, sub, remainMs, progress, remainLabel)
    }

    /** Returns list of (name, time, key) for the 6 main times */
    fun todayTimes(config: JSONObject): List<Triple<String, String, String>> {
        val today = config.optJSONObject("today") ?: return emptyList()
        val order = listOf(
            "fajr" to "صبح",
            "sunrise" to "طلوع",
            "dhuhr" to "ظهر",
            "asr" to "عصر",
            "maghrib" to "مغرب",
            "isha" to "عشا"
        )
        return order.map { (k, n) ->
            Triple(n, today.optString(k, "--:--"), k)
        }
    }

    fun launchPi(context: Context): PendingIntent {
        val launch = context.packageManager.getLaunchIntentForPackage(context.packageName) ?: Intent()
        return PendingIntent.getActivity(context, 0, launch, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
    }

    fun id(context: Context, name: String): Int =
        context.resources.getIdentifier(name, "id", context.packageName)

    fun layout(context: Context, name: String): Int =
        context.resources.getIdentifier(name, "layout", context.packageName)
}

/**
 * Widget 1: اذان بعدی — resizable ~2×2
 */
class TimesWidget : AppWidgetProvider() {
    override fun onUpdate(context: Context, mgr: AppWidgetManager, ids: IntArray) {
        ids.forEach { updateOne(context, mgr, it) }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == ACTION_REFRESH || intent.action == AppWidgetManager.ACTION_APPWIDGET_UPDATE) {
            refreshAll(context)
        }
    }

    companion object {
        const val ACTION_REFRESH = "com.ofoqshari.bz.WIDGET_REFRESH"

        fun refreshAll(context: Context) {
            val mgr = AppWidgetManager.getInstance(context)
            val ids = mgr.getAppWidgetIds(ComponentName(context, TimesWidget::class.java))
            ids.forEach { updateOne(context, mgr, it) }
            TimesWidgetFull.refreshAll(context)
            TimesWidgetCompact.refreshAll(context)
            TimesWidgetProgress.refreshAll(context)
            TimesWidgetGrid.refreshAll(context)
            TimesWidgetHijri.refreshAll(context)
            TimesWidgetHijriWide.refreshAll(context)
        }

        private fun updateOne(context: Context, mgr: AppWidgetManager, id: Int) {
            val layout = WidgetData.layout(context, "times_widget")
            if (layout == 0) return
            val views = RemoteViews(context.packageName, layout)
            val prefs = AzanCore.prefs(context)
            val config = try { JSONObject(prefs.getString("config", "{}") ?: "{}") } catch (_: Exception) { JSONObject() }
            val events = try { JSONArray(prefs.getString("events", "[]") ?: "[]") } catch (_: Exception) { JSONArray() }
            val city = config.optString("city", "افق شرعی")
            val info = WidgetData.nextAzan(events, System.currentTimeMillis())
            try {
                views.setTextViewText(WidgetData.id(context, "wgt_city"), city)
                views.setTextViewText(WidgetData.id(context, "wgt_name"), info.name)
                views.setTextViewText(WidgetData.id(context, "wgt_time"), info.time)
                views.setTextViewText(WidgetData.id(context, "wgt_sub"), info.sub)
                views.setOnClickPendingIntent(WidgetData.id(context, "wgt_root"), WidgetData.launchPi(context))
            } catch (_: Exception) {}
            mgr.updateAppWidget(id, views)
        }
    }
}

/**
 * Widget 2: اوقات کامل امروز — پهن با گرید و هایلایت
 */
class TimesWidgetFull : AppWidgetProvider() {
    override fun onUpdate(context: Context, mgr: AppWidgetManager, ids: IntArray) {
        ids.forEach { updateOne(context, mgr, it) }
    }

    companion object {
        fun refreshAll(context: Context) {
            val mgr = AppWidgetManager.getInstance(context)
            val ids = mgr.getAppWidgetIds(ComponentName(context, TimesWidgetFull::class.java))
            ids.forEach { updateOne(context, mgr, it) }
        }

        private fun updateOne(context: Context, mgr: AppWidgetManager, id: Int) {
            val layout = WidgetData.layout(context, "times_widget_full")
            if (layout == 0) return
            val views = RemoteViews(context.packageName, layout)
            val prefs = AzanCore.prefs(context)
            val config = try { JSONObject(prefs.getString("config", "{}") ?: "{}") } catch (_: Exception) { JSONObject() }
            val events = try { JSONArray(prefs.getString("events", "[]") ?: "[]") } catch (_: Exception) { JSONArray() }
            val city = config.optString("city", "افق شرعی")
            val times = WidgetData.todayTimes(config)
            val now = System.currentTimeMillis()
            val info = WidgetData.nextAzan(events, now)

            var nextKey = ""
            for (i in 0 until events.length()) {
                val e = events.optJSONObject(i) ?: continue
                if (e.optString("type") != "azan") continue
                val t = e.optLong("t", 0)
                if (t > now) {
                    val n = e.optString("name", "")
                    nextKey = when {
                        n.contains("صبح") || n.contains("فجر") -> "fajr"
                        n.contains("ظهر") -> "dhuhr"
                        n.contains("عصر") -> "asr"
                        n.contains("مغرب") -> "maghrib"
                        n.contains("عشا") -> "isha"
                        else -> ""
                    }
                    break
                }
            }

            try {
                views.setTextViewText(WidgetData.id(context, "wgt_full_city"), "اوقات $city")
                views.setTextViewText(WidgetData.id(context, "wgt_full_next_label"), if (info.name != "—") info.name else "")

                val nameIds = listOf("wgt_full_n1", "wgt_full_n2", "wgt_full_n3", "wgt_full_n4", "wgt_full_n5", "wgt_full_n6")
                val timeIds = listOf("wgt_full_t1", "wgt_full_t2", "wgt_full_t3", "wgt_full_t4", "wgt_full_t5", "wgt_full_t6")

                times.forEachIndexed { idx, triple ->
                    if (idx >= 6) return@forEachIndexed
                    val (n, t, k) = triple
                    views.setTextViewText(WidgetData.id(context, nameIds[idx]), n)
                    views.setTextViewText(WidgetData.id(context, timeIds[idx]), t)

                    val isNext = k == nextKey && k != "sunrise"
                    val nameColor = if (isNext) Color.parseColor("#E8B86D") else Color.parseColor("#99F7EFE4")
                    val timeColor = if (isNext) Color.parseColor("#E8B86D") else Color.parseColor("#FFFFFFF0")
                    views.setTextColor(WidgetData.id(context, nameIds[idx]), nameColor)
                    views.setTextColor(WidgetData.id(context, timeIds[idx]), timeColor)
                }

                views.setOnClickPendingIntent(WidgetData.id(context, "wgt_full_root"), WidgetData.launchPi(context))
            } catch (_: Exception) {}
            mgr.updateAppWidget(id, views)
        }
    }
}

/**
 * Widget 3: فشرده — فقط ساعت اذان بعدی + باقی‌مانده
 */
class TimesWidgetCompact : AppWidgetProvider() {
    override fun onUpdate(context: Context, mgr: AppWidgetManager, ids: IntArray) {
        ids.forEach { updateOne(context, mgr, it) }
    }

    companion object {
        fun refreshAll(context: Context) {
            val mgr = AppWidgetManager.getInstance(context)
            val ids = mgr.getAppWidgetIds(ComponentName(context, TimesWidgetCompact::class.java))
            ids.forEach { updateOne(context, mgr, it) }
        }

        private fun updateOne(context: Context, mgr: AppWidgetManager, id: Int) {
            val layout = WidgetData.layout(context, "times_widget_compact")
            if (layout == 0) return
            val views = RemoteViews(context.packageName, layout)
            val prefs = AzanCore.prefs(context)
            val events = try { JSONArray(prefs.getString("events", "[]") ?: "[]") } catch (_: Exception) { JSONArray() }
            val info = WidgetData.nextAzan(events, System.currentTimeMillis())
            try {
                views.setTextViewText(WidgetData.id(context, "wgt_c_name"), info.name)
                views.setTextViewText(WidgetData.id(context, "wgt_c_time"), info.time)
                views.setTextViewText(WidgetData.id(context, "wgt_c_sub"), info.sub)
                views.setOnClickPendingIntent(WidgetData.id(context, "wgt_c_root"), WidgetData.launchPi(context))
            } catch (_: Exception) {}
            mgr.updateAppWidget(id, views)
        }
    }
}

/**
 * Widget 4: اذان بعدی + نوار پیشرفت — گرافیکی‌تر
 */
class TimesWidgetProgress : AppWidgetProvider() {
    override fun onUpdate(context: Context, mgr: AppWidgetManager, ids: IntArray) {
        ids.forEach { updateOne(context, mgr, it) }
    }

    companion object {
        fun refreshAll(context: Context) {
            val mgr = AppWidgetManager.getInstance(context)
            val ids = mgr.getAppWidgetIds(ComponentName(context, TimesWidgetProgress::class.java))
            ids.forEach { updateOne(context, mgr, it) }
        }

        private fun updateOne(context: Context, mgr: AppWidgetManager, id: Int) {
            val layout = WidgetData.layout(context, "times_widget_progress")
            if (layout == 0) return
            val views = RemoteViews(context.packageName, layout)
            val prefs = AzanCore.prefs(context)
            val config = try { JSONObject(prefs.getString("config", "{}") ?: "{}") } catch (_: Exception) { JSONObject() }
            val events = try { JSONArray(prefs.getString("events", "[]") ?: "[]") } catch (_: Exception) { JSONArray() }
            val city = config.optString("city", "افق شرعی")
            val info = WidgetData.nextAzan(events, System.currentTimeMillis())
            try {
                views.setTextViewText(WidgetData.id(context, "wgt_p_city"), city)
                views.setTextViewText(WidgetData.id(context, "wgt_p_name"), info.name)
                views.setTextViewText(WidgetData.id(context, "wgt_p_time"), info.time)
                views.setTextViewText(WidgetData.id(context, "wgt_p_remain"), info.remainLabel)
                views.setTextViewText(WidgetData.id(context, "wgt_p_sub"), info.sub)
                views.setProgressBar(WidgetData.id(context, "wgt_p_bar"), 1000, info.progress, false)
                views.setOnClickPendingIntent(WidgetData.id(context, "wgt_p_root"), WidgetData.launchPi(context))
            } catch (_: Exception) {}
            mgr.updateAppWidget(id, views)
        }
    }
}

/**
 * Widget 5: گرید کوچک اوقات امروز
 */
class TimesWidgetGrid : AppWidgetProvider() {
    override fun onUpdate(context: Context, mgr: AppWidgetManager, ids: IntArray) {
        ids.forEach { updateOne(context, mgr, it) }
    }

    companion object {
        fun refreshAll(context: Context) {
            val mgr = AppWidgetManager.getInstance(context)
            val ids = mgr.getAppWidgetIds(ComponentName(context, TimesWidgetGrid::class.java))
            ids.forEach { updateOne(context, mgr, it) }
        }

        private fun updateOne(context: Context, mgr: AppWidgetManager, id: Int) {
            val layout = WidgetData.layout(context, "times_widget_grid")
            if (layout == 0) return
            val views = RemoteViews(context.packageName, layout)
            val prefs = AzanCore.prefs(context)
            val config = try { JSONObject(prefs.getString("config", "{}") ?: "{}") } catch (_: Exception) { JSONObject() }
            val events = try { JSONArray(prefs.getString("events", "[]") ?: "[]") } catch (_: Exception) { JSONArray() }
            val city = config.optString("city", "افق شرعی")
            val times = WidgetData.todayTimes(config)
            val now = System.currentTimeMillis()

            var nextKey = ""
            for (i in 0 until events.length()) {
                val e = events.optJSONObject(i) ?: continue
                if (e.optString("type") != "azan") continue
                val t = e.optLong("t", 0)
                if (t > now) {
                    val n = e.optString("name", "")
                    nextKey = when {
                        n.contains("صبح") || n.contains("فجر") -> "fajr"
                        n.contains("ظهر") -> "dhuhr"
                        n.contains("عصر") -> "asr"
                        n.contains("مغرب") -> "maghrib"
                        n.contains("عشا") -> "isha"
                        else -> ""
                    }
                    break
                }
            }

            try {
                views.setTextViewText(WidgetData.id(context, "wgt_g_title"), "اوقات $city")

                val nameIds = listOf("wgt_g_n1", "wgt_g_n2", "wgt_g_n3", "wgt_g_n4", "wgt_g_n5", "wgt_g_n6")
                val timeIds = listOf("wgt_g_t1", "wgt_g_t2", "wgt_g_t3", "wgt_g_t4", "wgt_g_t5", "wgt_g_t6")

                times.forEachIndexed { idx, triple ->
                    if (idx >= 6) return@forEachIndexed
                    val (n, t, k) = triple
                    views.setTextViewText(WidgetData.id(context, nameIds[idx]), n)
                    views.setTextViewText(WidgetData.id(context, timeIds[idx]), t)

                    val isNext = k == nextKey && k != "sunrise"
                    val nameColor = if (isNext) Color.parseColor("#E8B86D") else Color.parseColor("#99F7EFE4")
                    val timeColor = if (isNext) Color.parseColor("#E8B86D") else Color.parseColor("#FFFFFFF0")
                    views.setTextColor(WidgetData.id(context, nameIds[idx]), nameColor)
                    views.setTextColor(WidgetData.id(context, timeIds[idx]), timeColor)
                }

                views.setOnClickPendingIntent(WidgetData.id(context, "wgt_g_root"), WidgetData.launchPi(context))
            } catch (_: Exception) {}
            mgr.updateAppWidget(id, views)
        }
    }
}

/**
 * Widget 6: تقویم هجری قمری — مربع
 */
class TimesWidgetHijri : AppWidgetProvider() {
    override fun onUpdate(context: Context, mgr: AppWidgetManager, ids: IntArray) {
        ids.forEach { updateOne(context, mgr, it) }
    }

    companion object {
        fun refreshAll(context: Context) {
            val mgr = AppWidgetManager.getInstance(context)
            val ids = mgr.getAppWidgetIds(ComponentName(context, TimesWidgetHijri::class.java))
            ids.forEach { updateOne(context, mgr, it) }
        }

        private fun updateOne(context: Context, mgr: AppWidgetManager, id: Int) {
            val layout = WidgetData.layout(context, "times_widget_hijri")
            if (layout == 0) return
            val views = RemoteViews(context.packageName, layout)
            val prefs = AzanCore.prefs(context)
            val config = try { JSONObject(prefs.getString("config", "{}") ?: "{}") } catch (_: Exception) { JSONObject() }

            val qamari = config.optString("qamari", "")
            val shamsi = config.optString("shamsi", "")
            val occasions = config.optJSONArray("occasions")

            // Parse qamari like "۱۵ رمضان ۱۴۴۷" or similar (day month year)
            var day = "—"
            var monthYear = qamari.ifEmpty { "برنامه را باز کنید" }
            if (qamari.isNotEmpty()) {
                val parts = qamari.trim().split(Regex("\\s+"))
                if (parts.isNotEmpty()) {
                    day = parts[0]
                    monthYear = parts.drop(1).joinToString(" ")
                }
            }

            var occText = ""
            if (occasions != null && occasions.length() > 0) {
                val list = mutableListOf<String>()
                for (i in 0 until occasions.length()) {
                    val s = occasions.optString(i, "")
                    if (s.isNotEmpty()) list.add(s)
                }
                occText = list.joinToString(" · ")
            }

            try {
                views.setTextViewText(WidgetData.id(context, "wgt_h_day"), day)
                views.setTextViewText(WidgetData.id(context, "wgt_h_month"), monthYear)
                views.setTextViewText(WidgetData.id(context, "wgt_h_shamsi"), if (shamsi.isNotEmpty()) shamsi else "")
                views.setTextViewText(WidgetData.id(context, "wgt_h_occ"), occText)
                views.setOnClickPendingIntent(WidgetData.id(context, "wgt_h_root"), WidgetData.launchPi(context))
            } catch (_: Exception) {}
            mgr.updateAppWidget(id, views)
        }
    }
}

/**
 * Widget 7: تقویم هجری — عریض (قمری + شمسی کنار هم)
 */
class TimesWidgetHijriWide : AppWidgetProvider() {
    override fun onUpdate(context: Context, mgr: AppWidgetManager, ids: IntArray) {
        ids.forEach { updateOne(context, mgr, it) }
    }

    companion object {
        fun refreshAll(context: Context) {
            val mgr = AppWidgetManager.getInstance(context)
            val ids = mgr.getAppWidgetIds(ComponentName(context, TimesWidgetHijriWide::class.java))
            ids.forEach { updateOne(context, mgr, it) }
        }

        private fun updateOne(context: Context, mgr: AppWidgetManager, id: Int) {
            val layout = WidgetData.layout(context, "times_widget_hijri_wide")
            if (layout == 0) return
            val views = RemoteViews(context.packageName, layout)
            val prefs = AzanCore.prefs(context)
            val config = try { JSONObject(prefs.getString("config", "{}") ?: "{}") } catch (_: Exception) { JSONObject() }

            val qamari = config.optString("qamari", "")
            val shamsi = config.optString("shamsi", "")
            val occasions = config.optJSONArray("occasions")

            var day = "—"
            var monthYear = qamari.ifEmpty { "برنامه را باز کنید" }
            if (qamari.isNotEmpty()) {
                val parts = qamari.trim().split(Regex("\\s+"))
                if (parts.isNotEmpty()) {
                    day = parts[0]
                    monthYear = parts.drop(1).joinToString(" ")
                }
            }

            var occText = ""
            if (occasions != null && occasions.length() > 0) {
                val list = mutableListOf<String>()
                for (i in 0 until minOf(2, occasions.length())) {
                    val s = occasions.optString(i, "")
                    if (s.isNotEmpty()) list.add(s)
                }
                occText = list.joinToString("\n")
            }

            try {
                views.setTextViewText(WidgetData.id(context, "wgt_hw_day"), day)
                views.setTextViewText(WidgetData.id(context, "wgt_hw_month"), monthYear)
                views.setTextViewText(WidgetData.id(context, "wgt_hw_shamsi"), if (shamsi.isNotEmpty()) shamsi else "—")
                views.setTextViewText(WidgetData.id(context, "wgt_hw_occ"), occText)
                views.setOnClickPendingIntent(WidgetData.id(context, "wgt_hw_root"), WidgetData.launchPi(context))
            } catch (_: Exception) {}
            mgr.updateAppWidget(id, views)
        }
    }
}
