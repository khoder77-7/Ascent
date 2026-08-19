// ============================================================
// AUTH — thin wrapper around Supabase Auth.
//
// FAIL-CLOSED BY DESIGN: if window.veyaSupabaseReady resolves to null
// (Supabase failed to initialize for any reason — misconfigured env
// vars, network failure, SDK failed to load, etc.), every function
// here returns an ERROR. None of them treat a missing client as a
// successful login or a valid session. An auth backend that's down
// must never be indistinguishable from "you're logged in."
// ============================================================

const AUTH_UNAVAILABLE = 'Authentication service is unavailable right now. Please try again in a moment — if this keeps happening, contact support.';

async function veyaSignUpWithEmail(email, password) {
  const client = await window.veyaSupabaseReady;
  if (!client) return { ok: false, error: AUTH_UNAVAILABLE };
  const { data, error } = await client.auth.signUp({ email, password });
  if (error) return { ok: false, error: error.message };
  return { ok: true, user: data.user, session: data.session };
}

async function veyaSignInWithEmail(email, password) {
  const client = await window.veyaSupabaseReady;
  if (!client) return { ok: false, error: AUTH_UNAVAILABLE };
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  if (!data.session) return { ok: false, error: 'Sign-in did not return a valid session. Please try again.' };
  return { ok: true, user: data.user, session: data.session };
}

async function veyaSignInWithGoogle() {
  const client = await window.veyaSupabaseReady;
  if (!client) return { ok: false, error: AUTH_UNAVAILABLE };
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
  if (!client) return { ok: false, error: AUTH_UNAVAILABLE };
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
// scholarship.html / onboarding.html. Fail-closed behavior:
//   - Supabase unreachable/misconfigured -> redirect to login (NOT allowed through).
//   - Supabase reachable but no session   -> redirect to login.
//   - Real session present                -> allow through.
async function veyaRequireAuth() {
  const client = await window.veyaSupabaseReady;
  const next = encodeURIComponent(window.location.pathname);
  if (!client) {
    window.location.href = `login.html?next=${next}&reason=unavailable`;
    return false;
  }
  const session = await veyaGetSession();
  if (!session) {
    window.location.href = `login.html?next=${next}`;
    return false;
  }
  return true;
}
