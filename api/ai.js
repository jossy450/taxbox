const DEFAULT_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4o-mini';

const SYSTEM_PROMPT = `You are a helpful Nigerian tax assistant specializing in Lagos State PAYE and IRS tax laws. 
Answer questions about:
- Pay-As-You-Earn (PAYE) tax calculations under NTA 2026
- Lagos State Internal Revenue Service (LIRS) requirements
- Tax reliefs: Consolidated Relief Allowance (CRA), Rent Relief Allowance (RRA)
- Statutory deductions: NHF, NHIS, Pension, Life Assurance
- Tax filing, remittance, and compliance
- Withholding Tax (WHT), Direct Assessment, Development Levy
- Business premises registration and tax obligations

Keep answers concise, accurate, and practical. If you're unsure about a specific rate or regulation, say so. Reference relevant Nigerian tax laws when applicable.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question, apiKey: clientKey, endpoint, model } = req.body || {};

  if (!question || question.trim().length === 0) {
    return res.status(400).json({ error: 'Question is required' });
  }

  const apiKey = clientKey || process.env.AI_API_KEY;
  if (!apiKey) {
    return res.status(400).json({ 
      answer: null,
      error: 'AI not configured. Ask an admin to add an API key in Chatbot Settings.',
      needsConfig: true 
    });
  }

  const url = (endpoint || DEFAULT_ENDPOINT).replace(/\/+$/, '');
  const aiModel = model || DEFAULT_MODEL;

  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };

    // OpenRouter needs referer headers
    if (url.includes('openrouter')) {
      headers['HTTP-Referer'] = 'https://taxbox-two.vercel.app';
      headers['X-Title'] = 'TaxBox NG';
    }

    const aiRes = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: aiModel,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: question },
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      let detail = '';
      try {
        const errJson = JSON.parse(errText);
        detail = errJson.error?.message || errJson.error || '';
      } catch { detail = errText.slice(0, 300); }
      return res.status(502).json({ error: `AI API error (${aiRes.status}): ${detail}` });
    }

    const data = await aiRes.json();
    const answer = data.choices?.[0]?.message?.content;
    if (!answer) {
      return res.status(502).json({ error: 'AI returned empty response' });
    }

    return res.json({ answer, source: 'ai' });
  } catch (err) {
    return res.status(502).json({ error: `Failed to reach AI API: ${err.message}` });
  }
}
