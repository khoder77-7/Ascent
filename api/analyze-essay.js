// Vercel serverless function (Node runtime).
// Not called by the static prototype yet — application.html currently uses a
// local heuristic (see js scoring in application.html) so the demo works with
// zero backend. Wire this up when you're ready for real AI scoring:
//
//   1. `npm install @anthropic-ai/sdk`
//   2. In the Vercel dashboard, add an environment variable ANTHROPIC_API_KEY
//   3. In application.html, replace the analyzeEssay() heuristic with a
//      fetch('/api/analyze-essay', { method:'POST', body: JSON.stringify({ essay, scholarship }) })
//
// This function asks Claude to score the essay against the specific
// scholarship's criteria and return strict JSON the frontend can render
// directly into the radar chart / subscore bars already built.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST' });
  }

  const { essay, scholarship } = req.body || {};
  if (!essay || !scholarship) {
    return res.status(400).json({ error: 'Missing essay or scholarship in request body' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured on this deployment' });
  }

  const systemPrompt = `You are a scholarship application reviewer. Score the essay strictly against
the given scholarship's criteria. Respond ONLY with JSON, no prose, no markdown fences, matching this shape:
{
  "overall": 0-100,
  "leadership": 0-100,
  "academic_fit": 0-100,
  "personal_story": 0-100,
  "scholarship_alignment": 0-100,
  "biggest_weakness": { "title": string, "body": string },
  "suggestions": [string, string, string, string]
}`;

  const userPrompt = `Scholarship: ${scholarship.name}
Field: ${scholarship.field}
Level: ${scholarship.level}
Stated criteria / mission: ${scholarship.why ? scholarship.why.join('; ') : 'general merit'}

Essay:
"""
${essay}
"""`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    const data = await response.json();
    const text = (data.content || []).map((b) => b.text || '').join('\n').trim();
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error('analyze-essay error:', err);
    return res.status(500).json({ error: 'Analysis failed', detail: String(err) });
  }
}
