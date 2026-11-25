package com.ofoqshari.bz

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat

class AzanReceiver : BroadcastReceiver() {
    override fun onReceive(c: Context, i: Intent) {
        // Smart notification dismiss
        if (i.action == "com.ofoqshari.bz.DISMISS_PRE") {
            try { NotificationManagerCompat.from(c).cancelAll() } catch (_: Exception) {}
            return
        }

        val t = i.getLongExtra("t", 0L)
        val p = AzanCore.prefs(c)
        // Duplicate-protection: never handle the same (or an older) event twice.
        if (t != 0L && t > p.getLong("last", 0L)) {
            val name = i.getStringExtra("name") ?: ""
            when (i.getStringExtra("type")) {
                "pre" -> {
                    AzanCore.notifyPre(c, name, i.getIntExtra("min", 0))
                    p.edit().putLong("last", t).apply()
                }
                else -> try {
                    ContextCompat.startForegroundService(
                        c, Intent(c, AzanService::class.java).putExtra("name", name)
                    )
                    // Only consume this event after Android accepted the foreground-service start.
                    p.edit().putLong("last", t).apply()
                } catch (e: Exception) {
                    // Keep the event eligible for retry instead of silently marking it as played.
                    android.util.Log.e("AzanGo", "cannot start service; event remains pending", e)
                }
            }
        }
        AzanCore.scheduleNext(c)
    }
}
