# Veya — AI-powered scholarship application coach

A working front-end prototype of the product you described: profile → ranked
matches → per-scholarship application workspace with AI essay diagnosis →
season dashboard. It's static HTML/CSS/JS (no build step, no dependencies),
so it deploys to Vercel in about a minute and is easy to hand to a backend
developer to wire up to real data.

## Pages

| Page | What it does |
|---|---|
| `index.html` | Landing page — Match Engine hero, Veya Path journey (6 stages), "Veya analyzing an application" showcase, big stats, methodology strip |
| `login.html` | Branded login — Google button, email/password, forgot password (all wired to the demo dashboard, not real auth) |
| `onboarding.html` | Multi-step profile builder (GPA, nationality, degree, major, university, financial situation, achievements, extracurriculars, target country/university) |
| `matches.html` | Ranked scholarship matches — large match %, funding, deadline, why-you-match, and a per-scholarship weakness callout |
| `application.html` | Per-scholarship workspace: requirements checklist, essay editor with a dominant score ring, subscore breakdown (personal story / specificity / why-this-scholarship / structure), and a highlighted "how Veya reads this essay" annotated view |
| `dashboard.html` | Command center: "Next best move" as a full-width hero, large Veya Score ring, funding donut chart, deadline timeline, score trend chart |
| `pricing.html` | Free vs Pro, each tier visualized against the 6-stage Veya Path instead of a generic feature list |
| `trust.html` | Plain-language privacy, terms, document handling, AI disclaimers |

Every page carries a small "Demo" badge next to the logo — this is a UI prototype with illustrative data, not a live service, and that's stated explicitly rather than implied.

Shared design system lives in `css/tokens.css` (colors/type/shadow variables)
and `css/components.css` (nav, buttons, cards, checklist, radar/ring charts).
`js/app.js` has the reusable bits: scroll reveals, animated bars/counters,
the `renderRadar()` and `renderRing()` chart helpers, and checklist toggling.

## Deploying to Vercel

This is a zero-config static site, so the fastest path:

```bash
npm i -g vercel   # if you don't already have it
cd veya
vercel            # follow the prompts, link to your Vercel account
vercel --prod     # ship it
```

Or push this folder to a GitHub repo and import it in the Vercel dashboard —
Vercel will detect it as a static project automatically (no framework preset
needed).

## What's real vs. mocked right now

Everything you see is functional UI wired to realistic sample data, so you
can click through the entire flow end to end:

- **Matching** — `js/scholarships-data.js` holds a mock scholarship dataset.
  The ranking/sorting/filtering logic on `matches.html` is fully live against
  that data.
- **Essay scoring** — `application.html` runs a lightweight in-browser
  heuristic (keyword + length based) so the "Analyze" button produces
  different, sensible-looking scores depending on what you actually type.
  It's a stand-in for a real model call, not a real evaluator.
- **Profile, checklist state, dashboard numbers** — currently static/mock,
  not persisted anywhere.

## Wiring up the real thing

1. **Data layer** — stand up a database (Supabase/Postgres is a fast fit)
   for student profiles, a scholarships table, and application/requirement
   state. Replace `js/scholarships-data.js` with a fetch to your API.
2. **Matching engine** — move the match-scoring logic server-side once you
   have a real scholarship dataset; today's `match` numbers are hand-set per
   mock entry.
3. **Real AI essay scoring** — `api/analyze-essay.js` is a ready-to-use
   Vercel serverless function stub that calls the Claude API with a strict
   JSON-out prompt matching the shape the frontend already renders. Add an
   `ANTHROPIC_API_KEY` environment variable in your Vercel project settings,
   then swap the `analyzeEssay()` heuristic in `application.html` for a
   `fetch('/api/analyze-essay', ...)` call.
4. **Auth** — anything like Clerk/Auth.js in front of the dashboard and
   onboarding flow before this goes further than a prototype.

## Design notes

Palette is a ledger-navy + achievement-gold + match-emerald system (see
`css/tokens.css`), deliberately away from the generic "cream + terracotta" or
"black + acid green" AI-site defaults. Display type is Newsreader (editorial,
a little warmth for a topic that's stressful for students), UI type is Inter,
and data/scores are set in Space Mono to make numbers feel measured rather
than decorative.

Deliberately avoided the tells that make a site read as AI-generated:
emoji-as-UI-icons (replaced with a small hand-drawn-in-code line-icon set,
see the `.ico` elements inline in each page), a generic dot-and-wordmark
logo (the wordmark is just typography — italic "veya" with a single gold
full stop), and perfectly symmetric grids (the audience cards and hero
match-cards carry slight rotation/offset rather than sitting dead-center).
The signature visual is the radar/spoke diagnostic chart and colored status
dots (`renderRadar()` / `.dot-status` in `css/components.css`) — they exist
because the product's own data is naturally multi-axis and tiered, not as
decoration.

