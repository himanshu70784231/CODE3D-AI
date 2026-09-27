/**
 * AI Tutor Controller (Section 47)
 * Contextual explanation engine for execution steps, code, errors, algorithms, and complexity.
 * Private API keys remain strictly server-side.
 * If AI_API_KEY is not configured, provides transparent status without fabricating fake responses.
 */

export async function explainContext(req, res) {
  try {
    const {
      action = 'Explain Step',
      code = '',
      lineNumber = null,
      currentStep = null,
      variables = {},
      callStack = [],
      condition = null,
      dsaType = 'array',
      error = null,
      complexity = null,
    } = req.body;

    const apiKey = process.env.AI_API_KEY || null;

    if (!apiKey) {
      return res.status(503).json({
        success: false,
        error: {
          code: 'AI_NOT_CONFIGURED',
          message: 'AI service is not configured. Please supply AI_API_KEY on the backend.',
        },
      });
    }

    // When API key is provided, perform live external call to Google Gemini / AI backend
    try {
      const prompt = `You are the CODE3D-AI Educational Computer Science Tutor.
Action: ${action}
Language: Java/DSA
DSA Structure: ${dsaType}
Current Line: ${lineNumber || 'N/A'}
Active Code Line: ${code.split('\n')[lineNumber - 1] || ''}
Variables: ${JSON.stringify(variables)}
Call Stack: ${JSON.stringify(callStack)}
Condition Evaluated: ${condition ? JSON.stringify(condition) : 'None'}
Error: ${error || 'None'}
Complexity: ${complexity ? JSON.stringify(complexity) : 'N/A'}

Provide a concise, crystal-clear 2-3 paragraph explanation of what this step does in the 3D execution world and memory model.`;

      // Live call to Google Gemini API
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API responded with status ${response.status}`);
      }

      const data = await response.json();
      const explanation = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No explanation generated.';

      return res.json({
        success: true,
        action,
        explanation,
      });
    } catch (aiErr) {
      console.warn('AI API upstream error:', aiErr.message);
      return res.status(502).json({
        success: false,
        error: {
          code: 'AI_UPSTREAM_ERROR',
          message: 'AI provider error occurred while generating explanation.',
        },
      });
    }
  } catch (err) {
    return res.status(500).json({
      error: {
        code: 'AI_SERVER_ERROR',
        message: 'Internal server error while processing AI request.',
      },
    });
  }
}
