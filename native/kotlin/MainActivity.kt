package com.ofoqshari.bz

import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.WindowManager
import com.getcapacitor.BridgeActivity
import ir.tapsell.mediation.MediationInitializationListener
import ir.tapsell.mediation.Tapsell

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        registerPlugin(AzanPlugin::class.java) // must be before super.onCreate
        super.onCreate(savedInstanceState)
        // listener را زود ست کن تا کالبک auto-init تپسل از دست نرود
        try {
            Tapsell.setInitializationListener(object : MediationInitializationListener {
                override fun onInitializationComplete() {
                    Log.d("AzanAds", "Tapsell SDK init complete (from MainActivity)")
                    AzanAds.onSdkReadyFromActivity()
                }
            })
        } catch (e: Exception) {
            Log.w("AzanAds", "early setInitializationListener failed: " + e.message)
        }
        handleAzan(intent)
    }

    /** Keep the app open and let the web UI handle Android's Back button. */
    @Suppress("DEPRECATION")
    override fun onBackPressed() {
        // Always consume the native Back action. The web app returns to its
        // previous screen, and stays on the home screen when there is no parent.
        bridge?.webView?.evaluateJavascript(
            "if (window.handleAndroidBack) { window.handleAndroidBack(); }",
            null
        )
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleAzan(intent)
    }

    /** When opened by the azan notification: show over the lock screen, wake the screen, keep it on. */
    private fun handleAzan(i: Intent?) {
        if (i?.getBooleanExtra("azan", false) != true) return
        if (Build.VERSION.SDK_INT >= 27) { setShowWhenLocked(true); setTurnScreenOn(true) }
        else window.addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON)
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
