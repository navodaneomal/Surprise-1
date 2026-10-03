# Deploying Case File 001

The website is the **`site/`** folder: plain static files with no server code, no
database, no build step needed to host it, and no external requests. Upload that
folder anywhere that serves files.

> Deploy only `site/`. The repository also contains the solution guide and the
> unsealed puzzle source. Don't publish the whole repo where she could find it.

---

## Option A — Netlify Drop (easiest, 1 minute, free)

1. Go to **https://app.netlify.com/drop**.
2. Drag the **`site`** folder onto the page.
3. You get a link like `https://random-name-123.netlify.app`. You can rename it
   under *Site configuration → Change site name* (e.g. `case-file-001`).

To update after edits: `npm run build`, then drag `site/` onto *Deploys* again.

## Option B — Cloudflare Pages (free)

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Upload assets**.
2. Name the project, upload the **`site`** folder, deploy.

## Option C — GitHub Pages (from this repository)

This repo includes a workflow, `.github/workflows/deploy-pages.yml`, that
publishes **only** the `site/` folder.

1. GitHub → repository **Settings → Pages → Build and deployment → Source:
   GitHub Actions**.
2. **Actions → Deploy site to GitHub Pages → Run workflow.**
3. The link appears in the workflow run (`https://<user>.github.io/<repo>/`).

Notes: Pages for a *private* repository needs a paid GitHub plan. On a free plan
the repo must be public, and then the solutions are public too. If that matters,
use Option A or B instead.

## Option D — Vercel / any static host

Point the host at the `site` folder as the output directory, with no build command
and no framework. Any web server, S3 bucket or shared hosting works the same way.

## Option E — one single file

`npm run build` also writes **`dist/case-file-001.html`**: the whole game in one
self-contained file (fonts, art and scripts inlined), about 470 KB. It runs
offline when opened in a browser.

Caveats: phones don't always open HTML attachments well. Some messaging apps and
file previewers show the file without running its scripts. A hosted link (A–D) is
the most reliable way to send it. The single file is great for laptops, USB
sticks, or as a backup.

## Run it locally

```bash
npm run serve            # http://localhost:8080  (no install needed)
# or
python3 -m http.server --directory site 8080
```

You can also just double-click `site/index.html`. It's built to work from
`file://` (classic scripts, no modules, no fetch).

---

## Before you send the link

- **Test on her kind of phone.** Make sure sound plays after *Begin Investigation*
  (not on silent).
- **Reset your progress** (*Settings → Reset investigation*) if you play-tested in
  the same browser she'll use.
- **Privacy:** the page sets `noindex` and `robots.txt` blocks crawlers, so search
  engines shouldn't list it. Anyone with the link can still open it, so share it
  only with her.
- **After updating:** browsers may cache old files. Hard-refresh (or open in a
  private window) to check the new version. Her progress is keyed to the answers,
  so content edits that don't change answers keep her saved progress.

## Custom domain (optional)

Netlify, Cloudflare Pages and GitHub Pages all support custom domains in their
settings. Nothing in the site needs to change.
