// ============================================================
// AUTH — thin wrapper around Supabase Auth, with a demo-mode fallback.
//
// Every function here first awaits window.veyaSupabaseReady (see
// supabase-client.js). If that resolves to null (no SUPABASE_URL /
// SUPABASE_ANON_KEY configured yet), these functions fall back to the
// pre-auth demo behavior that already exists in this project — pages
// keep working, they just aren't backed by a real account yet.
// ============================================================

async function veyaSignUpWithEmail(email, password) {
  const client = await window.veyaSupabaseReady;
  if (!client) {
    return { ok: true, demo: true, message: 'Supabase not configured — continuing in local demo mode.' };
  }
  const { data, error } = await client.auth.signUp({ email, password });
  if (error) return { ok: false, error: error.message };
  return { ok: true, user: data.user, session: data.session };
}

async function veyaSignInWithEmail(email, password) {
  const client = await window.veyaSupabaseReady;
  if (!client) {
    return { ok: true, demo: true, message: 'Supabase not configured — continuing in local demo mode.' };
  }
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  return { ok: true, user: data.user, session: data.session };
}

async function veyaSignInWithGoogle() {
  const client = await window.veyaSupabaseReady;
  if (!client) {
    return { ok: true, demo: true, message: 'Supabase not configured — continuing in local demo mode.' };
  }
  // Redirects the browser to Google, then back to this same origin —
  // there's no synchronous "result" to return here.
  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/dashboard.html' },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, redirecting: true };
}

async function veyaSignOut() {
  const client = await window.veyaSupabaseReady;
  if (!client) return { ok: true, demo: true };
  const { error } = await client.auth.signOut();
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

async function veyaGetSession() {
  const client = await window.veyaSupabaseReady;
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data.session || null;
}

// ---- page guard for private pages ----
// Call this at the top of dashboard.html / matches.html / application.html /
// scholarship.html / onboarding.html. Behavior:
//   - Supabase not configured yet -> allow through (demo mode, unchanged).
//   - Supabase configured but no session -> redirect to login.html.
//   - Supabase configured and session present -> allow through.
async function veyaRequireAuth() {
  const client = await window.veyaSupabaseReady;
  if (!client) return true; // demo mode — no change to existing behavior
  const session = await veyaGetSession();
  if (!session) {
    const next = encodeURIComponent(window.location.pathname);
    window.location.href = `login.html?next=${next}`;
    return false;
  }
  return true;
}
