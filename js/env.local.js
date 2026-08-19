// ============================================================
// LOCAL DEV FALLBACK ONLY.
//
// On a real Vercel deploy, api/config.js (backed by the SUPABASE_URL /
// SUPABASE_ANON_KEY environment variables you set in Vercel's dashboard)
// is always tried first and takes precedence over this file — see
// js/supabase-client.js.
//
// This file exists purely so the site also works when previewed locally
// with a plain static server (e.g. `npx serve .`), which doesn't run
// Vercel's /api serverless functions. The Supabase "anon" key is
// designed by Supabase to be public/exposed in client code — real
// access control comes from Row Level Security policies on your
// tables, not from hiding this key — so this is safe to keep here.
// ============================================================

window.VEYA_LOCAL_ENV = {
  SUPABASE_URL: 'https://srixdoljqtspcauhbhdm.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_w6JRuny2CXBaDAlEzuxtUw_Vh02u3AI',
};
