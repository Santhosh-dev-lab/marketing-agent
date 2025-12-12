# Deployment & API Key Guide

This project is architected to run entirely on free-tier infrastructure (Supabase + Hugging Face). To launch it using your own credentials, follow these steps.

## 1. Required API Keys

You need to set **Environment Variables** in your Supabase project. The system uses these keys on the server-side, keeping them secure from users.

| Key | Value Description | Service |
| :--- | :--- | :--- |
| `HUGGINGFACE_API_KEY` | Your Access Token (Write) | [Hugging Face](https://huggingface.co/settings/tokens) |
| `SUPABASE_URL` | Your Project URL | [Supabase](https://supabase.com/dashboard) |
| `SUPABASE_ANON_KEY` | Public Anon Key | Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key (Secret) | Supabase |

### How to set them:
1.  Go to your **Supabase Dashboard** > **Settings** > **Edge Functions**.
2.  Add a new secret named `HUGGINGFACE_API_KEY`.
3.  Paste your token (get a free one from [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)).

*Note: `SUPABASE_URL` and keys are often auto-injected in Edge Functions, but it's good practice to verify they exist in `.env.local` for local development.*

## 2. Free Tier Strategy

The system is designed to "stay free" using these specific providers:

### Compute (Supabase Edge Functions)
*   **Limit**: ~500,000 invocations per month for free.
*   **Strategy**: Logic is kept simple. Heavy lifting (AI) is offloaded to Hugging Face, so function execution time is short (mostly waiting for APIs).

### AI Models (Hugging Face Inference API)
*   **Cost**: **$0.00** (Free Tier).
*   **Limit**: Rate limited (approx. requests per hour varies by load).
*   **Models Used**:
    *   `mistralai/Mistral-7B-Instruct-v0.3` (Strategy, Content, Repurposing)
    *   `stabilityai/stable-diffusion-xl-base-1.0` (Image Generation)
    *   `sentence-transformers/all-MiniLM-L6-v2` (Embeddings/RAG)
*   **Strategy**: If you hit rate limits, the system will just error and retry. For a single business/user, the free limits are usually sufficient.

### Database (Supabase PostgreSQL)
*   **Limit**: 500MB Database size.
*   **Strategy**: We use `agent_configs` and `memories` efficiently. Text vectors are small. Images are stored in Storage (1GB free), not the DB.

## 3. Local Development

To run this locally with your keys:
1.  Create a `.env.local` file in the root.
2.  Add:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
    SUPABASE_SERVICE_ROLE_KEY=your_service_key
    HUGGINGFACE_API_KEY=your_hf_key
    ```
3.  Run `supabase start` (if using local DB) or just `npm run dev` to connect to your hosted project.

## 5. Deploying Functions

To push your agent code to the cloud, use the **Supabase CLI**.

### Pre-requisites
1.  Install Supabase CLI: `npm install -g supabase`
2.  Login: `supabase login`
3.  Link your project: `supabase link --project-ref your-project-id`

### Deploy Command
You can deploy all functions at once with this command:

```bash
supabase functions deploy --no-verify-jwt
```

*Note: The `--no-verify-jwt` flag is used if you handle Auth verification inside the function code or if you want them to be publicly accessible (secured by your own logic).*

Alternatively, deploy them individually:
```bash
supabase functions deploy generate-campaign
supabase functions deploy brand-twin-ingest
# ... and so on
```

Once deployed, these functions live on Supabase's Edge Network, running close to your users. They will automatically have access to the Environment Variables (Secrets) you set in the previous step.
