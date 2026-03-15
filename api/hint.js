// api/hint.js — Vercel Serverless Function
// Uses Groq API (completely FREE — no credit card, no billing ever)
// Model: llama-3.3-70b — excellent for coding & DSA explanations

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'API key not configured. Add GROQ_API_KEY in Vercel environment variables.',
    });
  }

  const { prompt, max_tokens = 1500 } = req.body;
  if (!prompt) return res.status(400).json({ error: 'No prompt provided' });

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: 'You are an expert DSA tutor helping beginners learn algorithms and data structures. You give clear, structured explanations with examples.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data.error?.message || 'Groq API error';
      return res.status(response.status).json({ error: errMsg });
    }

    const text = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({ content: text });

  } catch (err) {
    return res.status(500).json({ error: `Server error: ${err.message}` });
  }
}