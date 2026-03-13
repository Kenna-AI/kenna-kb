# Kenna AI — Knowledge Base

Hosted knowledge base + admin console built with Next.js 14, Supabase, and Vercel.

---

## Deploy in 5 steps

### Step 1 — Run the Supabase migration

1. Open your Supabase dashboard → SQL Editor → New query
2. Paste the contents of `supabase/migration.sql`
3. Click Run
4. You should see: "Success. 12 rows affected" (sections + tools seeded)

To get your **service role key** (needed for admin writes):
- Supabase dashboard → Settings → API → `service_role` key (keep this secret)

---

### Step 2 — Push to GitHub

```bash
cd kenna-kb
git init
git add .
git commit -m "init kenna kb"
gh repo create kenna-kb --private --push
# or: git remote add origin <your-repo-url> && git push -u origin main
```

---

### Step 3 — Deploy to Vercel

1. Go to vercel.com → Add New Project
2. Import your `kenna-kb` GitHub repo
3. Framework: Next.js (auto-detected)
4. Click Deploy — first deploy will fail because env vars aren't set yet, that's fine

---

### Step 4 — Set environment variables in Vercel

In your Vercel project → Settings → Environment Variables, add these three:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://edabkuyzbsvsnjbcchoo.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` (your anon key) |
| `SUPABASE_SERVICE_KEY` | Your service_role key from Supabase Settings → API |
| `ADMIN_PASSWORD` | Pick a strong password for the admin console |

Then go to Deployments → click the three dots on the latest → Redeploy.

---

### Step 5 — Done

Your URLs:
- **Knowledge base**: `https://your-project.vercel.app/kb`
- **Admin console**: `https://your-project.vercel.app/admin`

---

## Using the admin console

Go to `/admin`, enter your ADMIN_PASSWORD, then:

- **+ New tool** — opens the tool editor. Fill in name, icon, section, tagline, steps, tips, notes. Hit Create tool.
- **Edit** — opens any existing tool for editing
- **Live / Draft** — toggle visibility without deleting
- **Delete** — removes the tool permanently
- **View ↗** — opens the live KB page for that tool in a new tab

Changes go live instantly — no redeploy needed.

---

## Adding a new section

Currently sections are managed directly in Supabase. To add one:

1. Supabase dashboard → Table Editor → kb_sections
2. Insert row: `title`, `subtitle`, `sort_order`
3. Copy the new section's `id` when creating tools that belong to it

A section manager UI can be added to the admin console on request.

---

## Local development

```bash
npm install
# create .env.local with the 4 variables above
npm run dev
# open http://localhost:3000
```
