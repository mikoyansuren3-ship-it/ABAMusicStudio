# ABA Music Academy (Website)

Next.js application — public site, student portal, teacher dashboard, and admin tools.

## Development

```bash
npm install
npm run dev
```

Set environment variables in `.env.local` (Supabase, Stripe, `NEXT_PUBLIC_SITE_URL`). See `.env.example` for the full list.

## Authentication

Auth is handled by Supabase. There are three role-based login portals that share one backend, keyed off `profiles.role`:

| Portal | Login page | Role | Lands on |
| --- | --- | --- | --- |
| Student | `/auth/student/login` | `student` | `/portal` |
| Teacher | `/auth/teacher/login` | `teacher` | `/dashboard` |
| Admin | `/auth/admin/login` | `admin` | `/admin` |

Both **email/password** and **Sign in with Google** are supported on every portal.

### Google OAuth (Sign in with Google)

Google credentials live in the Supabase project, not in this repo — nothing here needs a Google secret. Enabling it is a one-time dashboard task per environment.

**1. Google Cloud Console** — create an OAuth client (APIs & Services → Credentials → Create Credentials → OAuth client ID → **Web application**):

- Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
- Authorized JavaScript origin: `https://<project-ref>.supabase.co`

Find `<project-ref>` in your Supabase project's URL / API settings. First time, also configure the **OAuth consent screen** (External); while it's in *Testing* mode, only accounts listed under *Test users* can sign in — add testers or publish the app.

**2. Supabase Dashboard** — Authentication → Providers → **Google** → enable and paste the **Client ID** + **Client Secret** from step 1.

**3. Supabase Dashboard** — Authentication → URL Configuration → **Redirect URLs** → add the app origins so Supabase may return users to `/auth/callback`:

- `http://localhost:3000/**` (local dev)
- your production URL

> The redirect URI in Google Cloud (step 1) is the **Supabase** callback (`…/auth/v1/callback`), which is different from the app's own `/auth/callback` route. Mixing them up is the most common cause of `redirect_uri_mismatch`.

**How it works in the app**

- The "Continue with Google" button appears on all three login portals and the student sign-up page. It calls `signInWithOAuth` with `redirectTo=/auth/callback?role=<portal>`.
- OAuth returns to [`app/auth/callback/route.ts`](app/auth/callback/route.ts), which exchanges the code, reads `profiles.role`, and **enforces the portal's role** — a Google account whose role doesn't match the portal is signed out with an explanatory message (same behavior as password login).
- First-time Google users are provisioned as `student` via the `handle_new_user` DB trigger (`scripts/003_triggers_and_seed.sql`). Teacher and admin roles are granted separately (teacher access code, or the owner email auto-promotes on the admin portal), so Google on the Teacher/Admin portals is effectively for already-provisioned staff.

**Verify it's enabled** (replace `<project-ref>` and the publishable key):

```bash
curl -s -H "apikey: <publishable-key>" \
  "https://<project-ref>.supabase.co/auth/v1/settings" | grep -o '"google":[a-z]*'
# → "google":true
```

**Troubleshooting**

- `Error 400: redirect_uri_mismatch` — the Google Cloud redirect URI must be the Supabase one (`…/auth/v1/callback`).
- "Access blocked / app not verified" — add your email under *Test users*, or publish the OAuth consent screen.
