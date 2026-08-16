// ============================================================
// MATCHING ENGINE — explainable, checklist-driven.
// No score is invented: every percentage shown is computed directly
// from the checklist below it, and every checklist line is computed
// from a real field on the scholarship data compared to the profile.
//
// STUDENT_PROFILE is the one example profile used across the whole
// demo (Matches, Dashboard, Application Coach) until real accounts
// exist. Fields left `null` are genuinely unknown — the matcher
// reports them as "missing information," never guesses.
// ============================================================

const STUDENT_PROFILE = {
  citizenship: 'us_citizen',        // 'us_citizen' | 'us_permanent_resident' | 'international' | 'daca'
  levelNow: 'hs_senior',            // 'hs_senior' | 'undergrad' | 'grad' | 'bachelors_complete'
  gpa: 3.8,                         // unweighted, 4.0 scale
  major: 'Computer Science',
  degreeTarget: "Bachelor's",
  financialNeed: 'high',            // 'high' | 'some' | 'limited'
  pellEligible: true,
  firstGen: true,
  collegeReadinessProgram: null,    // not specified
  targetUniversity: null,           // not specified
  ethnicity: null,                  // not disclosed
  gender: null,                     // not disclosed
  familyIncome: null                // exact figure not disclosed
};

function chk(id, label, status, note){
  // status: 'pass' | 'unknown' | 'fail' | 'info'
  return { id, label, status, note };
}

// ---- per-scholarship eligibility logic ----
// Written individually per scholarship (rather than generically parsed)
// so each check reflects that program's actual published criteria.
const MATCHERS = {

  'coca-cola-scholars'(p){
    return [
      chk('level', 'Study level matches', p.levelNow === 'hs_senior' ? 'pass' : 'fail',
        p.levelNow === 'hs_senior' ? 'Open to current high school seniors.' : 'Only open to current high school seniors.'),
      chk('citizenship', 'Citizenship eligible', p.citizenship === 'us_citizen' || p.citizenship === 'us_permanent_resident' ? 'pass' : 'fail',
        'Requires U.S. citizen, national, permanent resident, refugee, asylee, Cuban-Haitian entrant, or humanitarian parolee status.'),
      chk('gpa', 'GPA requirement met', p.gpa >= 3.0 ? 'pass' : 'fail', 'Minimum 3.0 unweighted GPA.'),
      chk('field', 'Field matches', 'pass', 'Achievement-based — open to any field of study.')
    ];
  },

  'dell-scholars'(p){
    return [
      chk('level', 'Study level matches', p.levelNow === 'hs_senior' ? 'pass' : 'fail', 'Open to current high school seniors entering a bachelor\'s program full-time.'),
      chk('gpa', 'GPA requirement met', p.gpa >= 2.4 ? 'pass' : 'fail', 'Minimum 2.4 GPA.'),
      chk('need', 'Pell-eligible / financial need', p.pellEligible === true ? 'pass' : (p.pellEligible === null ? 'unknown' : 'fail'), 'Requires Pell Grant eligibility.'),
      chk('readiness', 'College-readiness program participation', p.collegeReadinessProgram ? 'pass' : 'unknown', 'Requires participation in an approved college-readiness/access program — not yet in your profile.')
    ];
  },

  'questbridge-match'(p){
    return [
      chk('level', 'Study level matches', p.levelNow === 'hs_senior' ? 'pass' : 'fail', 'Open to current high school seniors planning to enroll the following fall.'),
      chk('citizenship', 'Citizenship eligible', p.citizenship === 'us_citizen' || p.citizenship === 'us_permanent_resident' ? 'pass' : 'fail', 'U.S. citizens and permanent residents only — international students living abroad are not eligible.'),
      chk('need', 'Low-income background', p.financialNeed === 'high' ? 'pass' : (p.financialNeed ? 'unknown' : 'unknown'), 'No fixed cutoff published — QuestBridge reviews financial background holistically.'),
      chk('gpa', 'GPA requirement', 'info', 'No fixed GPA or test-score cutoff is published.')
    ];
  },

  'jkc-college-scholarship'(p){
    return [
      chk('level', 'Study level matches', p.levelNow === 'hs_senior' ? 'pass' : 'fail', 'Open to current high school seniors in their final year.'),
      chk('citizenship', 'Location eligible', p.citizenship === 'us_citizen' || p.citizenship === 'us_permanent_resident' ? 'pass' : 'fail', 'Must reside in the U.S. or a U.S. territory and attend all 4 years of high school there.'),
      chk('gpa', 'GPA requirement met', p.gpa >= 3.5 ? 'pass' : 'fail', 'Reported minimum is 3.5–3.75 unweighted GPA depending on source — confirm exact figure on jkcf.org.'),
      chk('income', 'Family income within cap', p.familyIncome ? (p.familyIncome <= 95000 ? 'pass' : 'fail') : 'unknown', 'Considers applicants with family adjusted gross income up to ~$95,000 — your exact family income isn\'t in your profile yet.')
    ];
  },

  'gates-scholarship'(p){
    return [
      chk('level', 'Study level matches', p.levelNow === 'hs_senior' ? 'pass' : 'fail', 'Open to current high school seniors entering a 4-year program full-time.'),
      chk('citizenship', 'Citizenship eligible', p.citizenship === 'us_citizen' || p.citizenship === 'us_permanent_resident' ? 'pass' : 'fail', 'Requires U.S. citizen or permanent resident status.'),
      chk('gpa', 'GPA requirement met', p.gpa >= 3.3 ? 'pass' : 'fail', 'Minimum 3.3 cumulative weighted GPA.'),
      chk('need', 'Pell-eligible', p.pellEligible === true ? 'pass' : 'unknown', 'Requires Pell Grant eligibility.'),
      chk('ethnicity', 'Ethnicity requirement', p.ethnicity ? 'pass' : 'unknown', 'Restricted to applicants identifying as African American, American Indian/Alaska Native, Asian & Pacific Islander American, and/or Hispanic American — not in your profile yet.')
    ];
  },

  'hsf-scholar'(p){
    return [
      chk('level', 'Study level matches', 'pass', 'Open to high school seniors, current undergraduates, and graduate students.'),
      chk('citizenship', 'Citizenship eligible', p.citizenship === 'us_citizen' || p.citizenship === 'daca' || p.citizenship === 'us_permanent_resident' ? 'pass' : 'fail', 'Requires U.S. citizen, permanent legal resident, or DACA status.'),
      chk('gpa', 'GPA requirement met', p.gpa >= 3.0 ? 'pass' : 'fail', 'Minimum 3.0 GPA for high school applicants.'),
      chk('heritage', 'Hispanic heritage requirement', p.ethnicity ? 'pass' : 'unknown', 'Must identify as being of Hispanic heritage — not in your profile yet.')
    ];
  },

  'uncf-general'(p){
    return [
      chk('level', 'Currently enrolled requirement', p.levelNow === 'undergrad' || p.levelNow === 'grad' ? 'pass' : 'fail', 'This award requires current full-time enrollment at a UNCF member institution — it\'s not for incoming students who haven\'t enrolled yet.'),
      chk('school', 'Attends a UNCF member HBCU', p.targetUniversity ? 'unknown' : 'unknown', 'Restricted to the 37 UNCF member institutions — add your target university to check this.'),
      chk('gpa', 'GPA requirement met', p.gpa >= 2.5 ? 'pass' : 'fail', 'Minimum 2.5 GPA.'),
      chk('need', 'Demonstrated financial need', p.financialNeed === 'high' || p.financialNeed === 'some' ? 'pass' : 'unknown', 'Requires demonstrated unmet financial need via FAFSA.')
    ];
  },

  'fulbright-us-student'(p){
    return [
      chk('level', 'Study level matches', (p.levelNow === 'grad' || p.levelNow === 'bachelors_complete') ? 'pass' : 'fail', 'Requires a conferred bachelor\'s degree (or being a graduating senior) — not open to current high school students.'),
      chk('citizenship', 'Citizenship eligible', p.citizenship === 'us_citizen' ? 'pass' : 'fail', 'U.S. citizens/nationals only — permanent residents are not eligible.'),
      chk('gpa', 'GPA requirement', 'info', 'No published minimum GPA — evaluated holistically on proposal quality and record.')
    ];
  },

  'elks-mvs'(p){
    return [
      chk('level', 'Study level matches', p.levelNow === 'hs_senior' ? 'pass' : 'fail', 'Open to current high school seniors (or equivalent).'),
      chk('citizenship', 'Citizenship eligible', p.citizenship === 'us_citizen' ? 'pass' : 'fail', 'U.S. citizens only.'),
      chk('need', 'Financial need considered', p.financialNeed === 'high' || p.financialNeed === 'some' ? 'pass' : 'unknown', 'Judged on scholarship, leadership, and financial need together.'),
      chk('gpa', 'GPA requirement', 'info', 'No fixed minimum GPA is published.')
    ];
  },

  'swe-society-selected'(p){
    return [
      chk('field', 'Field matches', /engineer|computer science|comp sci/i.test(p.major) ? 'pass' : 'fail', 'Restricted to ABET-accredited engineering, engineering technology, or computer science programs.'),
      chk('gender', 'Gender eligibility', p.gender ? (p.gender === 'female' ? 'pass' : 'fail') : 'unknown', 'Open only to applicants who identify as female/woman — not in your profile yet.'),
      chk('level', 'Study level matches', p.levelNow === 'hs_senior' ? 'pass' : 'fail', 'Emerging First Year track covers incoming first-year students, including current high school seniors.')
    ];
  }

};

function scoreChecks(checks){
  const scored = checks.filter(c => c.status !== 'info');
  if (scored.some(c => c.status === 'fail')){
    return { bucket: 'not_eligible', score: null };
  }
  const passCount = scored.filter(c => c.status === 'pass').length;
  const unknownCount = scored.filter(c => c.status === 'unknown').length;
  const total = scored.length || 1;
  const score = Math.round(100 * (passCount + 0.5 * unknownCount) / total);

  let bucket;
  if (unknownCount === 0) bucket = 'eligible';
  else if (unknownCount >= passCount) bucket = 'missing_info';
  else if (score >= 70) bucket = 'likely';
  else bucket = 'possible';

  return { bucket, score };
}

const BUCKET_META = {
  eligible:     { label: 'Eligible',           color: 'var(--match)' },
  likely:       { label: 'Likely match',       color: 'var(--match)' },
  possible:     { label: 'Possible match',     color: 'var(--gold)' },
  missing_info: { label: 'Missing information', color: 'var(--violet)' },
  not_eligible: { label: 'Not eligible',       color: 'var(--urgent)' }
};

function matchAll(scholarships, profile){
  return scholarships.map(s => {
    const matcherFn = MATCHERS[s.id];
    const checks = matcherFn ? matcherFn(profile) : [];
    const { bucket, score } = scoreChecks(checks);
    return { scholarship: s, checks, bucket, score, meta: BUCKET_META[bucket] };
  });
}

function sortMatches(matches){
  const bucketRank = { eligible: 0, likely: 1, possible: 2, missing_info: 3, not_eligible: 4 };
  return [...matches].sort((a, b) => {
    const closedA = a.scholarship.deadlineStatus === 'closed_for_cycle' ? 1 : 0;
    const closedB = b.scholarship.deadlineStatus === 'closed_for_cycle' ? 1 : 0;
    if (bucketRank[a.bucket] !== bucketRank[b.bucket]) return bucketRank[a.bucket] - bucketRank[b.bucket];
    if (closedA !== closedB) return closedA - closedB;
    return (b.score || 0) - (a.score || 0);
  });
}
