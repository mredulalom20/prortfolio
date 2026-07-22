# Mobarak Portfolio

Next.js portfolio/CMS app for Mobarak Hossain Rinku.

## Scripts

```bash
npm run dev      # local development
npm run build    # production build
npm run start    # serve production build
npm run lint     # ESLint
npm run mcp:cms  # local CMS MCP server
```

## Required environment

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=uploads
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=uploads
UPLOAD_MAX_MB=10
NEXT_PUBLIC_UPLOAD_MAX_MB=10
```

## Auth model

Admin UI uses Supabase Auth. Admin API routes require a Supabase access token with `user_metadata.role === "admin"`.

Public routes can read published content and submit contact messages. Admin-only routes require authenticated admin access for private reads, writes, deletes, upload signing, media management, recycle bin actions, and page CMS editing.

## CMS pages

Static/CMS HTML pages are served through rewrites in `next.config.mjs` and loaded from:

- `site_settings.page_html_<slug>` when CMS content exists
- `public/<slug>.html` fallback files

Shared page loading logic lives in `lib/pageHtml.js`.

## Production checklist

Before deploy:

```bash
npm run lint
npm run build
npm audit --omit=dev
```

Also verify:

- signed-out admin API mutations return 401/403
- public blog/project/team routes still render
- contact form still submits
- signed-in admin can create/update/delete CMS content
