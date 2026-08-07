# ASHH — THE INFORMATION

A dark, glassmorphism research portal that indexes primary sources — official government portals, courts, statutory bodies, international organisations, and peer-reviewed journals — across 11 categories: Government, Education, Economy, Election, Judiciary, Health, International, Reports, Think Tanks, Data, and Research.

Plain HTML/CSS/JavaScript. No build step, no framework, no backend required to run. Bookmarks and notes persist locally in the visitor's browser via `localStorage`.

## Project structure

```
.
├── index.html          # markup + meta tags
├── css/
│   └── style.css       # all styling (design tokens at the top)
├── js/
│   ├── data.js          # the source catalog — edit this to add/remove sources
│   └── app.js            # rendering, routing, search, bookmarks, notes
├── vercel.json
├── netlify.toml
├── package.json
└── .gitignore
```

## Run locally

No install needed — any static file server works:

```bash
npx serve .
# or
python3 -m http.server 5173
```

Then open `http://localhost:5173` (or whatever port your server prints).

Opening `index.html` directly via `file://` also mostly works, but some browsers restrict `localStorage` under `file://`, so a local server is recommended.

## Deploy

### Vercel
```bash
npm install -g vercel
vercel
```
Or: push this folder to a GitHub repo → **New Project** on vercel.com → import the repo. `vercel.json` is already included; no framework preset needed (choose "Other").

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```
Or drag-and-drop the whole project folder onto **app.netlify.com/drop**. `netlify.toml` already sets the publish directory to the project root.

### GitHub Pages
1. Push this folder to a GitHub repo.
2. Repo → **Settings → Pages** → Source: `Deploy from a branch` → Branch: `main`, folder: `/ (root)`.
3. Your site publishes at `https://<username>.github.io/<repo>/`.

### Cloudflare Pages
1. Push this folder to a GitHub/GitLab repo.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
3. Build command: leave blank. Build output directory: `/`.

## Editing the source catalog

Everything shown on the site — every category and every card — comes from the `CATEGORIES` array in `js/data.js`. To add a source:

```js
{n:'Source Name', d:'One-line description.', u:'https://example.gov.in'}
```

...inside the relevant category's `sources` array. No other file needs to change.

## What this is — and isn't

This is a fully static frontend. It ships with:
- A curated, hardcoded catalog of ~70 real primary-source links
- Client-side search across all sources
- Bookmarks and notes, persisted per-browser via `localStorage`

It does **not** include (these need a real backend):
- User accounts / login (email, mobile OTP, Google OAuth) with data synced across devices
- A live notifications feed that detects when a ministry, court, or agency actually publishes something new — this needs scheduled scraping/polling jobs and a database
- Server-side search across full-text report contents

If you want those, the natural next step is a small backend (e.g. a Node/Next.js API or a Supabase/Firebase project) for auth and a scheduled job (cron on Vercel/Cloudflare Workers, or a small worker service) that polls each source and writes new items to a shared database, which this frontend can then read from instead of the static `SAMPLE_NOTIFS` array in `js/app.js`.
