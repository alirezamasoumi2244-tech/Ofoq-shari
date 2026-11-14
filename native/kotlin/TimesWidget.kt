package com.ofoqshari.bz

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/** Shared helpers for all prayer widgets */
object WidgetData {
    fun nextAzan(events: JSONArray, now: Long): Triple<String, String, String> {
        var nextName = "—"
        var nextTime = "—"
        var sub = "برنامه را یک‌بار باز کنید"
        for (i in 0 until events.length()) {
            val e = events.optJSONObject(i) ?: continue
            if (e.optString("type") != "azan") continue
            val t = e.optLong("t", 0)
            if (t > now) {
                nextName = "اذان " + e.optString("name", "")
                nextTime = SimpleDateFormat("HH:mm", Locale.US).format(Date(t))
                val mins = ((t - now) / 60000).toInt()
                sub = when {
                    mins < 1 -> "کمتر از یک دقیقه"
                    mins < 60 -> "$mins دقیقه مانده"
                    else -> "${mins / 60} ساعت و ${mins % 60} دقیقه"
                }
                break
            }
        }
        return Triple(nextName, nextTime, sub)
    }

    fun todayLines(config: JSONObject): String {
        val today = config.optJSONObject("today") ?: return "برای نمایش اوقات، برنامه را باز کنید"
        val order = listOf(
            "fajr" to "صبح",
            "sunrise" to "طلوع",
            "dhuhr" to "ظهر",
            "asr" to "عصر",
            "maghrib" to "مغرب",
            "isha" to "عشا"
        )
        return order.mapNotNull { (k, n) ->
            val v = today.optString(k, "")
            if (v.isEmpty()) null else "$n  $v"
        }.joinToString("\n")
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
 * Widget 1: اذان بعدی — resizable ~2×2 تا بزرگ
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
            // also refresh sibling widgets
            TimesWidgetFull.refreshAll(context)
            TimesWidgetCompact.refreshAll(context)
        }

        private fun updateOne(context: Context, mgr: AppWidgetManager, id: Int) {
            val layout = WidgetData.layout(context, "times_widget")
            if (layout == 0) return
            val views = RemoteViews(context.packageName, layout)
            val prefs = AzanCore.prefs(context)
            val config = try { JSONObject(prefs.getString("config", "{}") ?: "{}") } catch (_: Exception) { JSONObject() }
            val events = try { JSONArray(prefs.getString("events", "[]") ?: "[]") } catch (_: Exception) { JSONArray() }
            val city = config.optString("city", "افق شرعی")
            val (name, time, sub) = WidgetData.nextAzan(events, System.currentTimeMillis())
            try {
                views.setTextViewText(WidgetData.id(context, "wgt_city"), city)
                views.setTextViewText(WidgetData.id(context, "wgt_name"), name)
                views.setTextViewText(WidgetData.id(context, "wgt_time"), time)
                views.setTextViewText(WidgetData.id(context, "wgt_sub"), sub)
                views.setOnClickPendingIntent(WidgetData.id(context, "wgt_root"), WidgetData.launchPi(context))
            } catch (_: Exception) {}
            mgr.updateAppWidget(id, views)
        }
    }
}

/**
 * Widget 2: اوقات کامل امروز — پهن‌تر
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
            val city = config.optString("city", "افق شرعی")
            val body = WidgetData.todayLines(config)
            try {
                views.setTextViewText(WidgetData.id(context, "wgt_full_city"), "اوقات $city")
                views.setTextViewText(WidgetData.id(context, "wgt_full_body"), body)
                views.setOnClickPendingIntent(WidgetData.id(context, "wgt_full_root"), WidgetData.launchPi(context))
            } catch (_: Exception) {}
            mgr.updateAppWidget(id, views)
        }
    }
}

/**
 * Widget 3: فشرده — فقط ساعت اذان بعدی
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
            val (name, time, _) = WidgetData.nextAzan(events, System.currentTimeMillis())
            try {
                views.setTextViewText(WidgetData.id(context, "wgt_c_name"), name)
                views.setTextViewText(WidgetData.id(context, "wgt_c_time"), time)
                views.setOnClickPendingIntent(WidgetData.id(context, "wgt_c_root"), WidgetData.launchPi(context))
            } catch (_: Exception) {}
            mgr.updateAppWidget(id, views)
        }
    }
}
