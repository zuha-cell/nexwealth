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
  firestore.rules              Firestore security rules — publish this in Firebase Console
  README.md
  scripts/
    convert_weekly_data.py     reference script — proves the xlsx parsing logic (not required to run)
  public/
    favicon.svg
    sharekhan-qr.jpg            QR code shown on /resources
    .assetsignore                required by Cloudflare's asset deploy step
  src/
    layouts/
      Layout.astro               shared header/nav/footer, includes the newsletter widget
    components/
      NewsletterSignup.astro     email opt-in widget, shown in the footer on every page
    pages/
      index.astro                homepage
      about.astro                 licenses, certificates summary, referral links, contact CTA
      contact.astro                lead capture form -> Firestore `leads`
      resources.astro              partner links (Sharekhan account + QR, Turtlemint advisor profile)
      admin/
        index.astro                 admin login (email/password + forgot-password)
        upload.astro                 weekly MF/ETF data upload — parses xlsx in-browser, writes to `mutualFunds`
        subscribers.astro            view + CSV-export `subscribers` and `leads`
      calculators/
        index.astro                list of all planned calculators
        sip.astro                    working example — copy this pattern
    lib/
      firebase.ts                 Firebase client init (reads .env)
    styles/
      global.css                  Tailwind + brand fonts
```

> **Note on hidden files:** `.env.example` and `.gitignore` start with a dot,
> so macOS Finder and some unzip tools hide them by default. They ARE in the
> zip. On Mac, press `Cmd+Shift+.` in Finder to reveal them, or just use the
> terminal (`ls -a`) to confirm.

## Firebase setup (one-time)

1. **Firestore Database** → Create database → pick a Mumbai region (`asia-south1` or `asia-south2`) → **Production mode**.
2. Firestore Database → **Rules** tab → paste in `firestore.rules` from this repo → **Publish**.
3. **Authentication** → Get started → enable **Email/Password** sign-in method.
4. Authentication → **Users** tab → **Add user** → use a real email you can access (needed for password reset later) → this becomes your admin login.
5. **Storage** → Get started → same Mumbai region (not actively used yet, but needed later for uploaded images/PDFs).
6. Project settings → General → Your apps → Web app → copy the config values into `.env` (locally) and into Cloudflare Pages → Settings → Environment variables (for the live site).

## Setting up your admin login

1. Go to `yoursite.com/admin` and log in with the email/password from step 4 above.
2. `/admin/upload` — drop in the weekly "MF & ETFs Ready Reckoner" .xlsx. It parses in your browser, shows a preview count per category, and on confirmation saves every fund into the `mutualFunds` Firestore collection.
3. `/admin/subscribers` — view newsletter subscribers and contact-form leads, and download either as CSV (for importing into an email tool like Brevo/Mailchimp).
4. Forgot your password? Use the "Forgot password?" link on `/admin` (needs a real email on the account), or reset it directly in Firebase Console → Authentication → Users → your admin user → Reset password.

There's currently no per-role permission system — anyone with this login is a full admin. Don't share the password.

## Marketing / promotional emails

The newsletter widget (footer, every page) collects opt-in emails into `subscribers`.
Sending is currently manual: export the CSV from `/admin/subscribers` and
import it into a free-tier email tool (Brevo, Mailchimp) to send campaigns
and posters. WhatsApp broadcast isn't wired up — it requires Meta's WhatsApp
Business API and approval, which is a separate, later project.

## Adding a new calculator

1. Duplicate `src/pages/calculators/sip.astro` to `src/pages/calculators/<name>.astro`.
2. Swap the formula in the `<script>` block.
3. Add it to the `calculators` array in `src/pages/calculators/index.astro` with its `href`.

## Deploying

Push to GitHub, then connect the repo in Cloudflare Pages:
- Build command: `npm run build`
- Output directory: `dist`
- Add your `PUBLIC_FIREBASE_*` env vars in Cloudflare Pages → Settings → Environment variables.
