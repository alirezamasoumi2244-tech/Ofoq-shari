package com.ofoqshari.bz

import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.WindowManager
import com.getcapacitor.BridgeActivity
import ir.tapsell.plus.TapsellPlus
import ir.tapsell.plus.TapsellPlusInitListener
import ir.tapsell.plus.model.AdNetworkError
import ir.tapsell.plus.model.AdNetworks

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        registerPlugin(AzanPlugin::class.java)
        super.onCreate(savedInstanceState)
        initializeTapsellPlus()
        handleAzan(intent)
    }

    private fun initializeTapsellPlus() {
        try {
            // Same dashboard App Key already configured in tools/patch_android.py.
            val appKey = "mkerkacpddbnttkiceabqptdpissipciqmojhhdkceocgbfkcchppfhpmhlemgafodclej"
            TapsellPlus.initialize(this, appKey, object : TapsellPlusInitListener {
                override fun onInitializeSuccess(adNetworks: AdNetworks) {
                    Log.i("AzanAds", "Tapsell Plus initialized: $adNetworks")
                    AzanAds.onSdkReadyFromActivity()
                }

                override fun onInitializeFailed(adNetworks: AdNetworks, error: AdNetworkError) {
                    val message = "${adNetworks.name()}: ${error.errorMessage}"
                    Log.e("AzanAds", "Tapsell Plus initialization failed: $message")
                    AzanAds.onSdkInitFailed(message)
                }
            })
        } catch (e: Exception) {
            Log.e("AzanAds", "Tapsell Plus initialization threw", e)
            AzanAds.onSdkInitFailed(e.message ?: "initialization error")
        }
    }

    @Suppress("DEPRECATION")
    override fun onBackPressed() {
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
