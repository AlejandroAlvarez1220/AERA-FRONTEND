# AERA

AERA is a production-ready perfume manufacturing SaaS built with React, TypeScript, TailwindCSS, and Supabase.

## Architecture

- Frontend: React + Vite + TypeScript
- Hosting: Vercel
- Database + Auth + RLS: Supabase
- Inventory model: manufacturing
  - `materials` are the real stock
  - `products` are virtual and consume materials through BOM

## Environment variables

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Required variables:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Never commit `.env` or any service role key.

## Local development

```bash
npm install
npm run dev
```

## Database setup

Run [supabase/schema.sql](/C:/Users/alvar/OneDrive/Escritorio/aera-frontend/supabase/schema.sql) inside the Supabase SQL Editor.

This schema includes:

- materials
- products
- product_materials
- purchases
- sales
- sale_items
- RLS policies for every table
- `create_sale_with_consumption(jsonb)` to validate and consume materials during sales

## Production deployment

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Prepare AERA for production"
```

If the GitHub repository does not exist yet:

```bash
gh repo create aera-frontend --private --source=. --remote=origin --push
```

If the repository already exists:

```bash
git remote add origin https://github.com/YOUR-USER/aera-frontend.git
git branch -M main
git push -u origin main
```

### 2. Import into Vercel

- Create a new project in Vercel
- Import the GitHub repository
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`

### 3. Configure Vercel environment variables

Add these in Vercel Project Settings > Environment Variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Add them for:

- Production
- Preview
- Development if you use Vercel env sync

### 4. Configure Supabase Auth URLs

In Supabase Auth URL settings:

- Site URL: your production Vercel domain or custom domain
- Additional Redirect URLs:
  - `http://localhost:5173/**`
  - `https://*.vercel.app/**`
  - your final custom domain

### 5. Security checklist

- Use only the Supabase anon key in the frontend
- Do not expose `service_role`
- Keep RLS enabled in Supabase
- Keep auth-protected access through `auth.uid()`
- Review the Vercel headers in [vercel.json](/C:/Users/alvar/OneDrive/Escritorio/aera-frontend/vercel.json)
- Confirm that `.env` is ignored before pushing

### 6. Verify before release

```bash
npm run lint
npm run build
```

## Notes

- The database should stay in Supabase, not Vercel, because this app already depends on Supabase Auth, RLS, and SQL functions.
- Vercel is the correct place for the frontend deployment.
