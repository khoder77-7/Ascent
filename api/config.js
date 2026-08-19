// Vercel serverless function (Node runtime).
//
// Serves the Supabase project URL and anon/public key to the client at
// runtime, so the actual values live only in Vercel's environment
// variables — not committed in the static HTML/JS source.
//
// The Supabase "anon" key is designed by Supabase to be public — it's
// safe to expose in browser code, since real access control comes from
// Row Level Security (RLS) policies on your tables, not from hiding this
// key. Serving it through this endpoint instead of hardcoding it is a
// convenience (easy rotation without a redeploy of static files) rather
// than a security requirement.
//
// Required Vercel environment variables (Project Settings → Environment
// Variables), for Production, Preview, and Development:
//   SUPABASE_URL       — e.g. https://xxxxxxxxxxxx.supabase.co
//   SUPABASE_ANON_KEY   — the "anon / public" key from
//                          Supabase → Project Settings → API
//
// After adding them, redeploy (env var changes require a redeploy to
// take effect on Vercel).

export default function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return res.status(500).json({
      error: 'Supabase is not configured on this deployment.',
      detail: 'Set SUPABASE_URL and SUPABASE_ANON_KEY in Vercel → Project Settings → Environment Variables, then redeploy.',
    });
  }

  // Small cache since this almost never changes and is hit on every page load.
  res.setHeader('Cache-Control', 'public, max-age=300');
  return res.status(200).json({ supabaseUrl: url, supabaseAnonKey: anonKey });
}
