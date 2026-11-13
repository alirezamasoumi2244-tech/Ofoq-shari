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

/**
 * Home-screen widget: next prayer name + time + city.
 * Updated whenever AzanCore.scheduleNext runs or the user opens the app.
 */
class TimesWidget : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (id in appWidgetIds) updateOne(context, appWidgetManager, id)
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
            if (ids.isEmpty()) return
            for (id in ids) updateOne(context, mgr, id)
        }

        private fun updateOne(context: Context, mgr: AppWidgetManager, id: Int) {
            val views = RemoteViews(context.packageName, context.resources.getIdentifier("times_widget", "layout", context.packageName))
            val prefs = AzanCore.prefs(context)
            val config = try { JSONObject(prefs.getString("config", "{}") ?: "{}") } catch (_: Exception) { JSONObject() }
            val events = try { JSONArray(prefs.getString("events", "[]") ?: "[]") } catch (_: Exception) { JSONArray() }
            val city = config.optString("city", "افق شرعی")
            val now = System.currentTimeMillis()
            var nextName = "—"
            var nextTime = "—"
            var sub = "برای به‌روزرسانی برنامه را باز کنید"
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
            // RemoteViews ids must match layout; use try in case layout not yet merged
            try {
                views.setTextViewText(context.resources.getIdentifier("wgt_city", "id", context.packageName), city)
                views.setTextViewText(context.resources.getIdentifier("wgt_name", "id", context.packageName), nextName)
                views.setTextViewText(context.resources.getIdentifier("wgt_time", "id", context.packageName), nextTime)
                views.setTextViewText(context.resources.getIdentifier("wgt_sub", "id", context.packageName), sub)
            } catch (_: Exception) {}

            val launch = context.packageManager.getLaunchIntentForPackage(context.packageName) ?: Intent()
            val pi = PendingIntent.getActivity(context, 0, launch, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
            views.setOnClickPendingIntent(context.resources.getIdentifier("wgt_root", "id", context.packageName), pi)
            mgr.updateAppWidget(id, views)
        }
    }
}
