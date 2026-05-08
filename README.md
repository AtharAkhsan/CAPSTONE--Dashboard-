<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# CAPSTONE (Dashboard)

Lightweight React + Vite dashboard starter with Supabase integration and GenAI support.

## Features

- Vite + React (TypeScript)
- Supabase client setup for database/auth/storage
- TailwindCSS for styling
- Example dashboard components and charts

## Prerequisites

- Node.js (recommended v18+)

## Setup (Local Development)

1. Install dependencies:

   `npm install`

2. Create a local env file (copy or create `.env.local`) and add the required variables:

- `VITE_SUPABASE_URL` — your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — your Supabase anon/public key

Example (in `.env.local`):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=public-anon-key
GEMINI_API_KEY=your_gemini_api_key
```

3. Start the dev server:

   `npm run dev`

The dev server runs on port `3000` by default (see `package.json` script).

## Scripts

- `npm run dev` — start dev server (Vite)
- `npm run build` — build for production
- `npm run preview` — preview the production build
- `npm run clean` — remove `dist` folder
- `npm run lint` — run TypeScript type-checking

## Supabase Configuration

The Supabase client is initialized in [src/lib/supabase.ts](src/lib/supabase.ts). It reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the environment. If these values are missing you will see a console warning at startup.

If you haven't created a Supabase project yet, sign up at https://supabase.com, create a project, then copy the project URL and anon key into your `.env.local` file.

## Build & Deploy

1. Build the app:

   `npm run build`

2. Serve or deploy the contents of the `dist` folder with your preferred static hosting (Netlify, Vercel, Cloudflare Pages, etc.). Use `npm run preview` to locally test the production build.

## Troubleshooting

- If the app complains about missing Supabase credentials, confirm `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are present in `.env.local` and restart the dev server.
- For issues with AI features, ensure `GEMINI_API_KEY` is set and valid.

## Next steps

- Hook up your Supabase schemas and RLS policies for production use.
- Add additional dashboard widgets, charts, and auth flows as needed.

---

If you'd like, I can also:

- add a `.env.local.example` file
- create a short `CONTRIBUTING.md` with development guidelines
- set up a netlify/vercel deployment config

Tell me which of the above you want next.
