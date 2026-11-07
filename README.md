# Zamd

Zamd is a simple Next.js chat app using one model through Groq's API. It sends requests directly to Groq from a server-side route; the API key is never sent to the browser. The `openai/gpt-oss-120b` value is the selected Groq model ID, not an OpenAI API endpoint.

## Run locally

Requires Node.js 20.9 or later. Copy `.env.example` to `.env.local` and set `GROQ_API_KEY` to a key created in the Groq Console. Then run:

```bash
npm install
npm run dev
```

Open http://localhost:3000. Restart the dev server after changing `.env.local`. You can override the model with `GROQ_MODEL` if needed. Groq account limits and pricing apply; free availability can change.

Keep `.env.local` private and never commit or share the API key. This starter has no user sign-in, persistent chat history, or public-deployment rate limiting; add those protections before exposing it publicly.
