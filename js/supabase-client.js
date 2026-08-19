// ============================================================
// SUPABASE CLIENT BOOTSTRAP
//
// Loads the Supabase JS SDK from a CDN (no build step / bundler in this
// project), fetches { supabaseUrl, supabaseAnonKey } from /api/config
// (see api/config.js — values come from Vercel environment variables,
// never hardcoded here), and initializes a single shared client.
//
// window.veyaSupabaseReady is a Promise<SupabaseClient|null> — other
// scripts should `await window.veyaSupabaseReady` before using auth.
// It resolves to `null` (not a rejection) if Supabase isn't configured
// yet, so pages can fall back to demo/local behavior instead of
// breaking outright — see auth.js for how that fallback is used.
// ============================================================

(function () {
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error('Failed to load ' + src));
      document.head.appendChild(s);
    });
  }

  window.veyaSupabaseReady = (async () => {
    try {
      let supabaseUrl, supabaseAnonKey;

      const res = await fetch('/api/config').catch(() => null);
      if (res && res.ok) {
        ({ supabaseUrl, supabaseAnonKey } = await res.json());
      } else if (window.VEYA_LOCAL_ENV) {
        // Local fallback for testing without Vercel's serverless functions
        // (e.g. `npx serve .`) — see js/env.local.js. On a real Vercel
        // deploy, /api/config (backed by real env vars) is always tried
        // first and takes precedence over this.
        console.warn('Veya: /api/config unavailable — using js/env.local.js for local testing.');
        supabaseUrl = window.VEYA_LOCAL_ENV.SUPABASE_URL;
        supabaseAnonKey = window.VEYA_LOCAL_ENV.SUPABASE_ANON_KEY;
      } else {
        console.warn('Veya: Supabase not configured yet — falling back to local demo auth/profile storage.');
        return null;
      }

      if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Veya: Supabase config incomplete — falling back to local demo auth/profile storage.');
        return null;
      }

      await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js');
      if (!window.supabase || !window.supabase.createClient) {
        console.error('Veya: Supabase SDK failed to load from CDN.');
        return null;
      }
      const client = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
      return client;
    } catch (err) {
      console.warn('Veya: could not initialize Supabase, falling back to local demo auth/profile storage.', err);
      return null;
    }
  })();
})();
