// ============================================================
// PROFILE STORE — bridges onboarding answers to the matching engine.
//
// Today this is backed by localStorage (works for a single browser,
// survives refresh/close, does NOT sync across devices). This is a
// deliberate placeholder: once Supabase auth is wired, saveProfile()/
// loadProfile() should write/read the `profiles` table for the signed-in
// user instead of localStorage, and every call site (onboarding.html,
// matching.js) stays the same — only the two functions below change.
// ============================================================

const VEYA_PROFILE_KEY = 'veya_profile_v1';
const VEYA_DRAFT_KEY = 'veya_onboarding_draft_v1';

function saveProfile(profile){
  try {
    localStorage.setItem(VEYA_PROFILE_KEY, JSON.stringify({ ...profile, completedAt: new Date().toISOString() }));
    localStorage.removeItem(VEYA_DRAFT_KEY); // a saved profile supersedes any in-progress draft
    return true;
  } catch (e) {
    console.error('saveProfile failed:', e);
    return false;
  }
}

function loadProfile(){
  try {
    const raw = localStorage.getItem(VEYA_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('loadProfile failed:', e);
    return null;
  }
}

function hasCompletedOnboarding(){
  return loadProfile() !== null;
}

function saveDraft(step, fields){
  try {
    localStorage.setItem(VEYA_DRAFT_KEY, JSON.stringify({ step, fields, savedAt: new Date().toISOString() }));
    return true;
  } catch (e) {
    console.error('saveDraft failed:', e);
    return false;
  }
}

function loadDraft(){
  try {
    const raw = localStorage.getItem(VEYA_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('loadDraft failed:', e);
    return null;
  }
}

function clearDraft(){
  try { localStorage.removeItem(VEYA_DRAFT_KEY); } catch (e) { /* ignore */ }
}

// ============================================================
// SUPABASE SYNC (additive layer — safe to call even if Supabase isn't
// configured yet; each function no-ops gracefully in that case).
//
// These are called explicitly at a few key moments (after onboarding
// completes, and once at login) rather than making every loadProfile()
// call async — that keeps the existing synchronous localStorage flow
// (already tested and working) intact while adding real persistence
// as a layer on top, once credentials are in place.
//
// Expects a Supabase table named "profiles" with at least:
//   id                        uuid, references auth.users(id), primary key
//   citizenship                text
//   level_now                  text
//   gpa                        numeric
//   major                      text
//   degree_target              text
//   financial_need             text
//   pell_eligible               boolean
//   college_readiness_program  text
//   target_university          text
//   ethnicity                  text
//   gender                     text
//   family_income               integer
//   updated_at                  timestamptz default now()
// with Row Level Security enabled and a policy restricting each row to
// its owning user (auth.uid() = id) for select/insert/update.
// ============================================================

function profileToSupabaseRow(profile, userId){
  return {
    id: userId,
    citizenship: profile.citizenship || null,
    level_now: profile.levelNow || null,
    gpa: profile.gpa ?? null,
    major: profile.major || null,
    degree_target: profile.degreeTarget || null,
    financial_need: profile.financialNeed || null,
    pell_eligible: profile.pellEligible ?? null,
    college_readiness_program: profile.collegeReadinessProgram || null,
    target_university: profile.targetUniversity || null,
    ethnicity: profile.ethnicity || null,
    gender: profile.gender || null,
    family_income: profile.familyIncome ?? null,
    updated_at: new Date().toISOString(),
  };
}

function supabaseRowToProfile(row){
  return {
    citizenship: row.citizenship,
    levelNow: row.level_now,
    gpa: row.gpa,
    major: row.major,
    degreeTarget: row.degree_target,
    financialNeed: row.financial_need,
    pellEligible: row.pell_eligible,
    collegeReadinessProgram: row.college_readiness_program,
    targetUniversity: row.target_university,
    ethnicity: row.ethnicity,
    gender: row.gender,
    familyIncome: row.family_income,
  };
}

// Push the local profile up to Supabase for the signed-in user.
// Call this right after saveProfile() completes onboarding.
async function syncProfileToSupabase(profile){
  if (typeof window === 'undefined' || !window.veyaSupabaseReady) return { ok: false, reason: 'not_configured' };
  const client = await window.veyaSupabaseReady;
  if (!client) return { ok: false, reason: 'not_configured' };
  const { data: sessionData } = await client.auth.getSession();
  const user = sessionData.session && sessionData.session.user;
  if (!user) return { ok: false, reason: 'not_signed_in' };

  const { error } = await client.from('profiles').upsert(profileToSupabaseRow(profile, user.id));
  if (error) { console.error('syncProfileToSupabase failed:', error.message); return { ok: false, error: error.message }; }
  return { ok: true };
}

// Pull the signed-in user's profile from Supabase and mirror it into
// localStorage, so the existing synchronous loadProfile()/matching.js
// flow picks it up. Call this once after a successful login, before
// redirecting into the app.
async function syncProfileFromSupabase(){
  if (typeof window === 'undefined' || !window.veyaSupabaseReady) return null;
  const client = await window.veyaSupabaseReady;
  if (!client) return null;
  const { data: sessionData } = await client.auth.getSession();
  const user = sessionData.session && sessionData.session.user;
  if (!user) return null;

  const { data, error } = await client.from('profiles').select('*').eq('id', user.id).maybeSingle();
  if (error) { console.error('syncProfileFromSupabase failed:', error.message); return null; }
  if (!data) return null;

  const profile = supabaseRowToProfile(data);
  saveProfile(profile); // mirrors into localStorage for the existing synchronous flow
  return profile;
}
