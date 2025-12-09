# Marketing Agent Web App (Phase 0)

This is a Next.js (App Router) project set up as the foundation for the Marketing Agent.

## Tech Stack
- **Frontend**: Next.js 14+, Tailwind CSS, Shadcn/UI (planned).
- **Backend Service**: Supabase (Postgres, Auth, Edge Functions).
- **AI/ML**: Hugging Face Inference, Replicate, Qdrant (Vector DB).
- **Deployment**: Vercel.

## Getting Started

### 1. Prerequisites
- Node.js 18+
- Supabase CLI (optional, for local functions dev)

### 2. Environment Variables
Copy `.env.example` to `.env.local` and fill in your keys:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

### 3. Installation
```bash
npm install
```

### 4. Running Locally
```bash
npm run dev
```

### 5. Running Tests
```bash
npm run test
```

## Backend Setup (Supabase)

### Schema
The database schema is located in `supabase/schema.sql`. Run this in your Supabase SQL Editor to create the necessary tables (`profiles`, `brands`, `assets`, `campaigns`, `posts`, `llm_cache`).

### Edge Functions
The functions are in `supabase/functions`.
To deploy (requires Supabase CLI):
```bash
supabase functions deploy test-endpoint
```

## Project Structure
- `src/app`: Next.js pages and layouts.
- `src/components`: React components.
- `src/lib`: Utilities (Sentry, etc.).
- `supabase`: Database schema and Edge Functions.
- `.github`: CI/CD workflows.

## CI/CD
GitHub Actions are configured in `.github/workflows/ci.yml` to lint, build, and test on push to `main`.
