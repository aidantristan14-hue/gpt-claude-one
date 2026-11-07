# GPT + Claude chat starter

A Next.js app with one chat interface and a model picker for Auto, Groq, or Claude. Auto routes writing and long prompts to Claude, and other prompts to Groq.

## Run locally

Requires Node.js 20.9 or later. Copy `.env.example` to `.env.local`, add the API key(s) you have, then run `npm install` and `npm run dev`. Open http://localhost:3000.

Set `GROQ_API_KEY` for Groq and/or `ANTHROPIC_API_KEY` for Claude. The default Groq model can be overridden with `GROQ_MODEL`; check Groq's current supported-models documentation if a model is unavailable. Never commit `.env.local` or share your API keys. Provider usage limits and pricing apply.

This starter has no user sign-in, persistent chat history, or public-deployment rate limiting; do not expose an unauthenticated deployment without adding those protections.
