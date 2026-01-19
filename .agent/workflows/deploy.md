---
description: how to deploy the application to Vercel
---

1. **Push to GitHub**:
   - Initialize git: `git init`
   - Add files: `git add .`
   - Commit: `git commit -m "Initial commit"`
   - Create a repo on [GitHub](https://github.com/new) and follow the instructions to push.

2. **Connect to Vercel**:
   - Go to [Vercel](https://vercel.com/new).
   - Import your GitHub repository.

3. **Configure Environment Variables**:
   - In Vercel Project Settings, add all variables from `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `STRAVA_CLIENT_ID`
     - `STRAVA_CLIENT_SECRET`
     - `STRAVA_REDIRECT_URI` (Update this to `https://your-domain.vercel.app/api/auth/callback/strava`)
     - `NEXT_PUBLIC_MAPBOX_TOKEN`

4. **Update Strava API Settings**:
   - Go to [Strava API Settings](https://www.strava.com/settings/api).
   - Change the "Authorization Callback Domain" to your Vercel domain (e.g., `your-domain.vercel.app`).

5. **Deploy**:
   - Click "Deploy" in Vercel.
