package com.nettv.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.view.KeyEvent;
import android.view.View;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 1. Obtenemos el WebView que Capacitor crea automáticamente
        WebView webView = this.bridge.getWebView();
        
        if (webView != null) {
            // 2. Aplicamos la configuración de tu amigo para el Autoplay
            WebSettings settings = webView.getSettings();
            settings.setMediaPlaybackRequiresUserGesture(false); 
            settings.setDomStorageEnabled(true);
            settings.setJavaScriptEnabled(true);

            // 3. Forzamos el foco nativo
            webView.setFocusable(true);
            webView.setFocusableInTouchMode(true);
            webView.requestFocus(View.FOCUS_DOWN);

            // 4. Listener para recuperar el foco si se pierde
            webView.setOnFocusChangeListener((v, hasFocus) -> {
                if (!hasFocus) {
                    webView.requestFocus(View.FOCUS_DOWN);
                }
            });
        }
    }

    // 5. Sobrescribimos la intercepción de teclas del control remoto
    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        WebView webView = this.bridge.getWebView();
        if (webView != null) {
            // Reenviamos el evento directo al iframe/DOM de Angular
            webView.dispatchKeyEvent(event);
        }
        return super.onKeyDown(keyCode, event);
    }
}