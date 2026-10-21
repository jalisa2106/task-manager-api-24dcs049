const express = require('express');

const router = express.Router();

const FALLBACK_MESSAGE = 'AI suggestion is unavailable right now. You can write the description yourself.';

// Simple rate limit: 1 successful AI request per user per task title per minute
const RATE_LIMIT_MS = 60 * 1000;
const lastSuccess = new Map();

// POST /api/ai/generate-description  { title }
router.post('/generate-description', async (req, res) => {
  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
  if (!title || title.length > 100) {
    return res.status(400).json({ error: 'Validation Error', message: 'A title (max 100 characters) is required' });
  }

  const limitKey = `${req.user.id}:${title.toLowerCase()}`;
  const last = lastSuccess.get(limitKey);
  if (last && Date.now() - last < RATE_LIMIT_MS) {
    return res.status(429).json({ error: 'Too Many Requests', message: 'Please wait a minute before generating again' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

    let model = process.env.AI_MODEL || 'gemini-2.5-flash';
    if (model.includes('1.5')) {
      model = 'gemini-2.5-flash';
    }

    // Privacy: only the task title is sent to the AI provider. Never send emails, names or other personal data.
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Write a short, concise task description (maximum 2 sentences) for: ${title}. Provide plain text only without markdown formatting or bullet points.`
                }
              ]
            }
          ]
        }),
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Gemini HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const description = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    if (!description) throw new Error('Empty AI response');

    lastSuccess.set(limitKey, Date.now());
    res.status(200).json({ description, fallback: false });
  } catch (err) {
    // Graceful degradation: the app keeps working, the UI shows a friendly message
    console.error('[AI] request failed:', err.message);
    res.status(200).json({ description: '', fallback: true, message: FALLBACK_MESSAGE });
  }
});

module.exports = router;
