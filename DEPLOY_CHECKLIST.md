# Arvectum Site — deployment checklist

## Source and safety

1. Work only from `/Volumes/ArvectumSSD/Arvectum/repos/arvectum-site`.
2. Ensure `git status` is clean and `main` is synchronized with GitHub.
3. Run:
   - `node scripts/check-repository.mjs`
   - `node scripts/check-js.mjs`
   - `node scripts/check-static.mjs`
   - `node scripts/check-assets.mjs`
4. Validate PHP syntax on a host with PHP available.
5. Never copy `public/.env` from Git; production secrets remain server-local.
6. Never overwrite production `api/storage/` runtime records from Git.

## Deploy

1. Back up the current production document root.
2. Deploy the contents of `public/` to the `arvectum.com` document root.
3. Preserve server-local `.env` and runtime `api/storage/` data.
4. Verify permissions on PHP files and `api/storage/.htaccess`.

## Post-deploy

1. Run `node scripts/check-production.mjs`.
2. Verify `/`, `/health.html`, `/api/health.php`, `/robots.txt`, and `/sitemap.xml`.
3. Verify the form submission path and cookie-consent endpoint.
4. Confirm `www.arvectum.com` redirects or serves as intended.
5. If health checks fail, restore the pre-deploy backup before investigating further.

## Repository mirrors

GitHub `arvectum2/arvectum-site` is canonical. GitVerse `arvectum/arvectum-site` is an automated mirror and must converge to the same commit after every GitHub push.
