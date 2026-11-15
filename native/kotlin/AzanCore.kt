package com.ofoqshari.bz

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import org.json.JSONArray
import org.json.JSONObject

/** Stores the event list sent by the web UI and always keeps exactly ONE alarm armed: the next event. */
object AzanCore {
    const val PREFS = "azango"
    const val CH_AZAN = "azan_playback"
    const val CH_PRE = "azan_pre"
    private const val REQ_ALARM = 1001

    fun prefs(c: Context) = c.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun save(c: Context, events: String, config: String) {
        prefs(c).edit().putString("events", events).putString("config", config).apply()
    }

    fun config(c: Context): JSONObject =
        try { JSONObject(prefs(c).getString("config", "{}") ?: "{}") } catch (e: Exception) { JSONObject() }

    @Suppress("DEPRECATION")
    fun vibrator(c: Context): Vibrator? = try {
        if (Build.VERSION.SDK_INT >= 31) c.getSystemService(VibratorManager::class.java)?.defaultVibrator
        else c.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
    } catch (e: Exception) { null }

    /**
     * Native vibration (the WebView's navigator.vibrate is unreliable on many phones).
     * [pattern] uses the same format as the web API: [vibrate, pause, vibrate, ...] in ms.
     * Returns false when the phone has no vibrator or the call failed.
     */
    @Suppress("DEPRECATION")
    fun vibrate(c: Context, pattern: LongArray): Boolean {
        val v = vibrator(c) ?: return false
        return try {
            if (!v.hasVibrator() || pattern.isEmpty()) return false
            // USAGE_ALARM: not blocked by the phone's "touch vibration" switch (the usual reason web vibration stays silent)
            val attrs = AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_ALARM)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build()
            val p = pattern.map { it.coerceIn(0L, 5000L) }.toLongArray()
            if (Build.VERSION.SDK_INT >= 26) {
                val e = if (p.size == 1) VibrationEffect.createOneShot(maxOf(p[0], 10L), VibrationEffect.DEFAULT_AMPLITUDE)
                        else VibrationEffect.createWaveform(longArrayOf(0L) + p, -1)
                v.vibrate(e, attrs)
            } else {
                if (p.size == 1) v.vibrate(maxOf(p[0], 10L), attrs) else v.vibrate(longArrayOf(0L) + p, -1, attrs)
            }
            true
        } catch (e: Exception) { false }
    }

    fun ensureChannels(c: Context) {
        if (Build.VERSION.SDK_INT < 26) return
        val nm = c.getSystemService(NotificationManager::class.java)
        val azan = NotificationChannel(CH_AZAN, "اذان", NotificationManager.IMPORTANCE_HIGH).apply {
            description = "نمایش هنگام پخش اذان و دکمه توقف"
            setSound(null, null)
            lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC
            enableVibration(true)
            setBypassDnd(true)
        }
        val pre = NotificationChannel(CH_PRE, "یادآوری هوشمند اذان", NotificationManager.IMPORTANCE_DEFAULT).apply {
            description = "اعلان چند دقیقه قبل از اذان با جزئیات شهر و ساعت"
            lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC
        }
        // Low-priority channel for optional next-azan status (not used aggressively)
        val status = NotificationChannel("azan_status", "وضعیت اذان بعدی", NotificationManager.IMPORTANCE_LOW).apply {
            description = "یادآوری آرام وضعیت بعدی (اختیاری)"
            setShowBadge(false)
        }
        nm.createNotificationChannel(azan)
        nm.createNotificationChannel(pre)
        nm.createNotificationChannel(status)
    }

    private fun launchIntent(c: Context): PendingIntent {
        val i = c.packageManager.getLaunchIntentForPackage(c.packageName) ?: Intent()
        return PendingIntent.getActivity(c, 0, i, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
    }

    fun launchPending(c: Context) = launchIntent(c)

    private fun alarmIntent(c: Context, o: JSONObject?): PendingIntent {
        val i = Intent(c, AzanReceiver::class.java)
        if (o != null) {
            i.putExtra("t", o.getLong("t"))
            i.putExtra("type", o.optString("type", "azan"))
            i.putExtra("name", o.optString("name", ""))
            i.putExtra("min", o.optInt("min", 0))
        }
        return PendingIntent.getBroadcast(c, REQ_ALARM, i, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
    }

    /** Arms the next not-yet-fired event. Uses setAlarmClock: exact, Doze-proof, needs no special permission. */
    fun scheduleNext(c: Context) {
        val p = prefs(c)
        val am = c.getSystemService(AlarmManager::class.java)
        val arr = try { JSONArray(p.getString("events", "[]")) } catch (e: Exception) { JSONArray() }
        val last = p.getLong("last", 0L)
        val now = System.currentTimeMillis()
        var next: JSONObject? = null
        for (i in 0 until arr.length()) {
            val o = arr.optJSONObject(i) ?: continue
            val t = o.optLong("t", 0L)
            // skip already-fired events and events that are more than 2 minutes stale (e.g. phone was off)
            if (t > last && t >= now - 120_000L && (next == null || t < next.getLong("t"))) next = o
        }
        if (next == null) { am.cancel(alarmIntent(c, null)); TimesWidget.refreshAll(c); return }
        am.setAlarmClock(AlarmManager.AlarmClockInfo(next.getLong("t"), launchIntent(c)), alarmIntent(c, next))
        TimesWidget.refreshAll(c)
    }

    /** True if current local hour is inside quiet window (e.g. 23–5). */
    fun inQuietHours(c: Context): Boolean {
        val cfg = config(c)
        if (!cfg.optBoolean("quietHours", false)) return false
        val start = cfg.optInt("quietStart", 23) // inclusive
        val end = cfg.optInt("quietEnd", 5)     // exclusive
        val cal = java.util.Calendar.getInstance()
        val h = cal.get(java.util.Calendar.HOUR_OF_DAY)
        return if (start < end) h in start until end else (h >= start || h < end)
    }

    fun notifyPre(c: Context, name: String, min: Int) {
        ensureChannels(c)
        val nm = NotificationManagerCompat.from(c)
        if (!nm.areNotificationsEnabled()) return
        // Smart quiet hours: suppress pre-reminders late at night (except Fajr which is intentional)
        val isFajr = name.contains("صبح") || name.contains("فجر")
        if (inQuietHours(c) && !isFajr) return

        val cfg = config(c)
        val smart = cfg.optBoolean("smartNotif", true)
        val city = if (smart) cfg.optString("city", "") else ""
        val today = if (smart) cfg.optJSONObject("today") else null
        // Map short name to time key
        val key = when {
            name.contains("صبح") || name.contains("فجر") -> "fajr"
            name.contains("ظهر") -> "dhuhr"
            name.contains("عصر") -> "asr"
            name.contains("مغرب") -> "maghrib"
            name.contains("عشا") -> "isha"
            else -> ""
        }
        val clock = if (key.isNotEmpty() && today != null) today.optString(key, "") else ""

        val title = when {
            isFajr -> "آماده‌سازی برای اذان صبح"
            name.contains("مغرب") -> "نزدیک افطار / اذان مغرب"
            else -> "اذان $name نزدیک است"
        }
        val line1 = if (min > 0) "$min دقیقه تا اذان $name" else "وقت اذان $name نزدیک است"
        val line2 = buildString {
            if (clock.isNotEmpty()) append("ساعت $clock")
            if (city.isNotEmpty()) {
                if (isNotEmpty()) append(" · ")
                append(city)
            }
        }
        val big = buildString {
            append(line1)
            if (line2.isNotEmpty()) append("\n").append(line2)
            if (isFajr) append("\nآماده‌ی نماز صبح باشید")
            else if (name.contains("مغرب") && cfg.optBoolean("ramadanHint", false))
                append("\nاگر روزه هستید، برای افطار آماده شوید")
        }

        val open = launchIntent(c)
        val dismiss = PendingIntent.getBroadcast(
            c, 2101,
            Intent(c, AzanReceiver::class.java).setAction("com.ofoqshari.bz.DISMISS_PRE"),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val n = NotificationCompat.Builder(c, CH_PRE)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle(title)
            .setContentText(if (line2.isNotEmpty()) "$line1 · $line2" else line1)
            .setStyle(NotificationCompat.BigTextStyle().bigText(big))
            .setContentIntent(open)
            .addAction(android.R.drawable.ic_menu_view, "باز کردن برنامه", open)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "بستن", dismiss)
            .setAutoCancel(true)
            .setOnlyAlertOnce(true)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .build()
        try {
            // Stable id per prayer so updates replace instead of stacking
            val id = 2100 + (key.hashCode() and 0xFF)
            nm.notify(id, n)
        } catch (e: SecurityException) { /* no permission */ }

        // Gentle vibration for smart pre-reminder
        if (cfg.optBoolean("vibratePre", true)) {
            vibrate(c, longArrayOf(120, 80, 120))
        }
    }
}
