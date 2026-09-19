// Cloudflare Pages Function — runs server-side, so the Gemini API key
// never reaches the browser. Deployed automatically alongside the site;
// no separate hosting needed.
//
// Uses Google's Gemini API free tier (no credit card required to start).
// Requires an environment variable named GEMINI_API_KEY set in
// Cloudflare Pages → Settings → Environment variables (NOT prefixed with
// PUBLIC_ — that prefix is only for values safe to expose to the browser).
//
// Free tier note: Google may use free-tier prompts/responses to improve
// their models. Rate limits are modest (roughly 15 requests/minute,
// ~1,000/day on Flash-Lite as of mid-2026) — fine for a small site's chat
// widget, but if traffic grows enough to hit those limits regularly,
// enabling billing on the same Google AI Studio project unlocks much
// higher limits without changing any code here.

const SYSTEM_PROMPT = `You are the NEXWEALTH Education Assistant, embedded on a financial education website in India.

Your role is strictly educational:
- Explain financial concepts (SIP, mutual funds, FDs, inflation, tax basics, etc.)
- Help users understand how to use this website's calculators and data
- Answer general questions about investing concepts, insurance, and personal finance

Hard rules, never break these:
- NEVER recommend a specific stock, mutual fund, or security to buy or sell.
- NEVER give price targets, entry points, exit points, or timing calls of any kind.
- NEVER give personalized investment advice tailored to someone's specific portfolio or situation.
- If asked for stock tips, personalized advice, or "what should I invest in," clearly say
  you can only provide general education, and suggest they use the site's calculators or
  contact the site owner directly via the Contact page for personalized guidance.
- Always keep answers concise, clear, and factual.
- If asked about current events, prices, or anything requiring live data, be upfront that
  you don't have real-time access and the user should check current sources.

You are not a SEBI Registered Investment Adviser and must never imply otherwise.`;

const GEMINI_MODEL = "gemini-2.5-flash-lite"; // highest free-tier request quota of the family

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const userMessage = (body.message || "").slice(0, 2000); // basic length guard

    if (!userMessage.trim()) {
      return new Response(JSON.stringify({ error: "Empty message" }), { status: 400 });
    }

    if (!env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "AI helper not configured yet." }), { status: 500 });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
        generationConfig: { maxOutputTokens: 500 },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(JSON.stringify({ error: "AI request failed", detail: errText }), { status: 502 });
    }

    const data = await response.json();
    const answer =
      data.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Sorry, I couldn't generate a response — please try again in a moment.";

    return new Response(JSON.stringify({ answer }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Something went wrong." }), { status: 500 });
  }
}
