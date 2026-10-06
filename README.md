# FlutterShow — production starter

FlutterShow builds a developer's real Flutter repository and displays it inside the interactive phone UI from the reference project. Users do **not** add workflows, create pull requests, enable GitHub Pages, or modify their repositories.

## Production architecture

```text
GitHub OAuth → FlutterShow UI on Vercel → authenticated Vercel API
                                            ↓
                                  Supabase projects/builds
                                            ↓
                         FlutterShow-owned GitHub Actions worker
                                            ↓
                         flutter build web --release
                                            ↓
                         Supabase Storage public demo files
                                            ↓
                /d/:demoId and portfolio iframe phone preview
```

GitHub Actions is only a replaceable build machine owned by FlutterShow. User repositories remain unchanged and their apps are not deployed to GitHub Pages.

## Included

- Reference FlutterShow UI and interactive phone frame
- Supabase GitHub login
- Per-user projects and build records
- Row Level Security migration
- Public demos with permanent `/d/:demoId` links
- Portfolio iframe support
- Real repository analysis, including nested Flutter apps
- Central build workflow with no user-repository changes
- Flutter web-platform generation when `web/` is missing
- Supabase Storage publishing
- Rebuilds that preserve the public demo link
- Five builds per user per day by default
- Build logs and readable errors

## 1. Supabase setup

### Create the project

1. Create a Supabase project.
2. Open **SQL Editor**.
3. Run `supabase/migrations/20261005_production.sql`.
4. Confirm that `profiles`, `projects`, and `builds` exist.
5. Confirm that Storage contains a public bucket named `demos`.

### Configure GitHub sign-in

1. In GitHub, create an OAuth App.
2. Set its homepage to your FlutterShow domain.
3. Set its callback URL to:

   ```text
   https://YOUR_PROJECT.supabase.co/auth/v1/callback
   ```

4. In Supabase, open **Authentication → Providers → GitHub**.
5. Enter the OAuth client ID and client secret.
6. Under **Authentication → URL Configuration**, set:
   - Site URL: your production domain
   - Redirect URLs: `http://localhost:3000/**` and your production domain

## 2. Create the FlutterShow build repository

The production source must live in one GitHub repository because its Actions runner supplies the Flutter SDK. This repository is FlutterShow infrastructure; users never touch it.

1. Create a repository, for example `yourname/fluttershow`.
2. Push this source code, including `.github/workflows/build-demo.yml`.
3. Open **Settings → Actions → General** and allow Actions.
4. Add repository Actions secrets:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Create the dispatch token

Create a fine-grained GitHub token restricted to the FlutterShow repository:

- **Actions: Read and write**
- **Contents: Read**
- **Metadata: Read**

This token only starts FlutterShow's own workflow. It is never sent to user repositories.

## 3. Deploy the web application to Vercel

Import the FlutterShow repository into Vercel and add:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_API_URL=/api
VITE_SHARE_ORIGIN=https://YOUR_DOMAIN
PUBLIC_APP_ORIGIN=https://YOUR_DOMAIN
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
PLATFORM_GITHUB_REPO=yourname/fluttershow
PLATFORM_GITHUB_TOKEN
PLATFORM_BUILD_WORKFLOW=build-demo.yml
MAX_BUILDS_PER_USER_PER_DAY=5
MAX_CONCURRENT_BUILDS_PER_USER=1
```

Redeploy after adding the variables.

## 4. Local development

```bash
npm install
cp .env.example .env.local
npm install -g vercel
vercel dev
```

Use `vercel dev`, not only `vite`, when testing authentication and `/api` routes.

For UI-only development without the production API:

```bash
npm run dev
```

## 5. First production test

1. Sign in with GitHub.
2. Paste a public Flutter repository URL.
3. Confirm repository analysis succeeds.
4. Select the starting screen.
5. Click **Create Demo**.
6. Watch the build under the FlutterShow repository's Actions tab.
7. When the build succeeds, FlutterShow displays the real app in the phone.
8. Test the permanent `/d/:demoId` link in an incognito window.
9. Paste the iframe snippet into a portfolio page.

## Troubleshooting a build stuck on “Updating”

Open the FlutterShow infrastructure repository—not the user's app—and check
**Actions → FlutterShow build worker**.

- No run: `PLATFORM_GITHUB_REPO`, `PLATFORM_GITHUB_TOKEN`, or token Actions permission is wrong.
- Failure before “Build and publish demo”: verify the workflow repository contains the latest code and `npm ci` succeeds.
- Missing Supabase values: add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as GitHub Actions repository secrets.
- Flutter compilation failure: open the failed “Build and publish demo” step for the real `flutter build web` output.

The application now automatically fails builds that remain queued/running for
more than 40 minutes. To clear records created by an older version immediately,
run this once in Supabase SQL Editor:

```sql
update public.builds
set status = 'failed',
    error_message = 'Build timed out before the worker reported a result.',
    completed_at = now()
where status in ('queued', 'running')
  and created_at < now() - interval '40 minutes';

update public.projects
set status = case when demo_url is null then 'failed' else 'live' end,
    updated_at = now()
where status = 'building'
  and updated_at < now() - interval '40 minutes';
```

## Troubleshooting HTML source appearing in the phone

Supabase Storage intentionally serves `.html` objects as `text/plain`, so its
raw `index.html` URL cannot be used as the iframe source. FlutterShow solves
this with `/api/demo-index/:projectId/:buildId`, which serves only the small
entry document as `text/html`. JavaScript, WASM, fonts, and images continue to
load directly from Supabase's CDN.

If a build created by an older worker shows its HTML source:

1. Deploy the latest FlutterShow code.
2. Rebuild the project; or update `projects.demo_url` to the corresponding
   `/api/demo-index/<project-id>/<build-id>` URL.
3. Ensure `PUBLIC_APP_ORIGIN` exactly matches the deployed FlutterShow origin.

## Supported MVP repositories

- Public GitHub repositories
- Flutter app at root or up to three folders deep
- Apps with or without an existing `web/` directory
- Standard `flutter pub get` and `flutter build web` projects

Expected failures are shown to the user: incompatible plugins, missing environment values, private dependencies, code generation requirements, or compilation errors.

## Production hardening checklist

Before a public launch:

- Put demo files on `demos.yourdomain.com` rather than the main application origin.
- Add a storage cleanup job that removes superseded builds after 7–30 days.
- Add bot protection to build creation.
- Enforce per-user concurrent-build and daily-build limits.
- Add Sentry or another error tracker to Vercel and the worker.
- Add database backups and storage usage alerts.
- Set a maximum repository size and build timeout.
- Reject symlinks or output paths escaping the build directory.
- Review dependencies with `npm audit` and Dependabot.
- Add Terms, Privacy, Acceptable Use, and abuse-reporting pages.
- Monitor GitHub Actions minutes and Supabase bandwidth.
- Use a separate Supabase project for staging.

## Private repositories later

Do not store users' OAuth access tokens. For private repository support, create a GitHub App with read-only Contents permission, store only the installation ID, and mint a short-lived installation token inside the worker. The MVP intentionally supports public repositories first.

## Scaling beyond GitHub Actions

GitHub Actions is suitable for an early multi-user launch with strict limits. When usage grows, replace it with container workers on Fly.io, Render, Railway, ECS, Cloud Run, or Kubernetes. The frontend and database model do not need to change; only `dispatchBuild` and the worker runtime change.

## Commands

```bash
npm run build
npm run preview
```
