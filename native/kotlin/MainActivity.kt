package com.ofoqshari.bz

import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.WindowManager
import com.adivery.sdk.Adivery
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        registerPlugin(AzanPlugin::class.java)
        super.onCreate(savedInstanceState)
        try {
            Adivery.setLoggingEnabled(true)
            Adivery.configure(application, "4a24d53f-b4ae-47dc-a3a3-7417ed51894f")
            Log.i("AzanAds", "Adivery configured")
        } catch (e: Exception) {
            Log.e("AzanAds", "Adivery initialization failed", e)
        }
        AzanAds.show(this, bridge?.webView)
        handleAzan(intent)
    }

    @Suppress("DEPRECATION")
    override fun onBackPressed() {
        bridge?.webView?.evaluateJavascript(
            "if (window.handleAndroidBack) { window.handleAndroidBack(); }", null
        )
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleAzan(intent)
    }

    private fun handleAzan(intent: Intent?) {
        if (intent?.getBooleanExtra("azan", false) != true) return
        if (Build.VERSION.SDK_INT >= 27) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
        } else {
            window.addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                    WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
            )
        }
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
    }

    override fun onStop() {
        window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        super.onStop()
    }

    override fun onDestroy() {
        try { AzanAds.destroy() } catch (_: Exception) {}
        super.onDestroy()
    }
}
