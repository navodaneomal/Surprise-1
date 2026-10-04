# Deploying Case File 001

The game is the **`site/`** folder: plain static files with no server code, no
database and no external requests. The repository is already configured for
Vercel and Netlify (`vercel.json`, `netlify.toml`), so **you don't need to change
any settings**. Both hosts publish only `site/` and never the solutions.

---

## Vercel (import from GitHub)

1. Go to **https://vercel.com/new** and import **Surprise-1**.
2. Leave every setting as it is. *Framework: Other*, *Root Directory: blank*.
   `vercel.json` sets the rest.
3. Press **Deploy**. Your link is the *Production* domain, e.g.
   `https://surprise-1.vercel.app`.

Already created the project before this fix? Open it in Vercel and choose
**Deployments → ⋯ → Redeploy** on the newest deployment, or just push any commit.

## Netlify — Option 1: drag and drop (no account setup)

1. Download **`case-file-001-website.zip`** and **unzip it**. Netlify Drop
   cannot take a zip file.
2. Go to **https://app.netlify.com/drop**.
3. Drag the unzipped folder **`case-file-001-website`** onto the page.

To update later, drag a fresh folder onto your site's **Deploys** page.

## Netlify — Option 2: import from GitHub

1. **https://app.netlify.com** → *Add new site* → *Import an existing project* →
   GitHub → **Surprise-1**.
2. Leave the settings as they are (`netlify.toml` sets publish = `site`) and press
   **Deploy**.

## Other options

- **Cloudflare Pages:** *Workers & Pages → Create → Pages → Upload assets* and
  upload the unzipped `case-file-001-website` folder.
- **GitHub Pages:** *Settings → Pages → Source: GitHub Actions*, then *Actions →
  Deploy site to GitHub Pages → Run workflow*. It needs a public repo on a free
  plan, which would expose the solutions.
- **One file:** `dist/case-file-001.html` is the whole game in one offline file.
  It's good for laptops; phones don't always run HTML attachments.
- **Locally:** `npm run serve` → http://localhost:8080, or double-click
  `site/index.html`.

Even if a host serves the whole project folder by mistake, the root `index.html`
forwards to the game, and `_redirects` keeps the docs and source out of reach on
Netlify.

---

## Troubleshooting

| What you see | Why | Fix |
|---|---|---|
| Vercel **404: NOT_FOUND** | Deployed before `vercel.json` existed, so Vercel served the project root | Redeploy (see above). Make sure *Root Directory* is blank and there's no *Output Directory* override |
| Netlify **"Page not found"** after a drop | A zip, or the wrong folder, was dropped | Unzip `case-file-001-website.zip` and drop **that folder** |
| Vercel asks you to **log in** | You opened a *Preview* URL; previews are protected by default | Use the *Production* domain shown on the project page |
| An old version keeps showing | Browser cache | Hard refresh, or open the link in a private window |
| The build log shows a build error | A typo after editing `src/content` | The deploy still serves the last committed `site/`. Run `npm run build` locally to see the error |

Still stuck? Copy the link you deployed, or a screenshot of the error, and share it.

---

## Before you send the link

- **Make the GitHub repo private.** It contains every answer. On GitHub: *Settings →
  General → Danger Zone → Change repository visibility → Private*. Vercel and
  Netlify both deploy private repos on their free plans.
- **Test on her kind of phone.** Sound should play after *Begin Investigation*
  (phone not on silent).
- **Reset your own progress** (*Settings → Reset investigation*) if you
  play-tested in the browser she'll use.
- **Privacy:** pages are served with `noindex` and robots are blocked, so search
  engines shouldn't list it. Anyone with the link can still open it.
