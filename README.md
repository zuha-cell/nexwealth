# NEXWEALTH — starter scaffold

Matches Phase 1 of the Master Blueprint: Astro + Tailwind frontend, Firebase
backend, deployed to Cloudflare Pages. One calculator (SIP) is fully wired up
as the reference pattern — copy `src/pages/calculators/sip.astro` to build
the rest.

## Run it locally

```bash
npm install
cp .env.example .env      # then fill in your Firebase values
npm run dev                # http://localhost:4321
```

## Project structure

```
nexwealth/
  .env.example                 copy to .env and fill in (hidden file — see note below)
  .gitignore                   hidden file — see note below
  astro.config.mjs
  tailwind.config.cjs
  package.json
  firestore.rules              starter security rules for your collections
  README.md
  scripts/
    convert_weekly_data.py     reference script — proves the parsing logic (not required to run)
  public/
    favicon.svg
  src/
    layouts/Layout.astro       shared header/nav/footer
    pages/
      index.astro              homepage
      about.astro               licenses, referral link, contact options
      contact.astro             lead capture form -> Firestore `leads`
      resources.astro           partner links (Sharekhan, Turtlemint)
      admin/
        index.astro              admin login
        upload.astro             weekly data upload (parses xlsx in-browser)
      calculators/
        index.astro            list of all planned calculators
        sip.astro               working example — copy this pattern
    lib/firebase.ts             Firebase client init (reads .env)
    styles/global.css           Tailwind + brand fonts
```

> **Note on hidden files:** `.env.example` and `.gitignore` start with a dot,
> so macOS Finder and some unzip tools hide them by default. They ARE in the
> zip. On Mac, press `Cmd+Shift+.` in Finder to reveal them, or just use the
> terminal (`ls -a`) to confirm.

## Setting up your admin login

1. Firebase Console → your project → **Authentication** → **Users** tab → **Add user**.
2. Enter your email and a password — this is your admin login, separate from your Firebase account login.
3. Go to `yoursite.com/admin` and log in with those credentials.
4. From there, `/admin/upload` lets you drop in the weekly "MF & ETFs Ready Reckoner" .xlsx — it parses it in your browser, shows a preview count, and on confirmation saves every fund into the `mutualFunds` Firestore collection for the comparison calculators to read.

There's currently no per-role permission system — anyone with this login is a full admin. Don't share the password.

## Adding a new calculator

1. Duplicate `src/pages/calculators/sip.astro` to `src/pages/calculators/<name>.astro`.
2. Swap the formula in the `<script>` block.
3. Add it to the `calculators` array in `src/pages/calculators/index.astro` with its `href`.

## Deploying

Push to GitHub, then connect the repo in Cloudflare Pages:
- Build command: `npm run build`
- Output directory: `dist`
- Add your `PUBLIC_FIREBASE_*` env vars in Cloudflare Pages → Settings → Environment variables.
