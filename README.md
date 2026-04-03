# StrideSG Marathon Prototype

Mobile-first marathon training frontend prototype built with Next.js App Router.

## Why this stack

- Next.js works out-of-the-box on Vercel free tier.
- App Router keeps routing simple for prototype pages.
- No backend dependency is required for this version.

## Pages included

- `/` Login page with Google and Strava-style entry options.
- `/home` Dashboard for choosing today view or plan setup.
- `/existing-plan` Today view with training, nutrition, hydration, roadmap, and Strava/manual log actions.
- `/new-plan` Plan Builder with disabled non-42k options, MCQ profile chips, and race date-time input.

## Features

- Mobile-first responsive UI.
- Light and dark theme toggle.
- Live Singapore date/time display (Asia/Singapore timezone).
- Hardcoded prototype data based on the project reference notes.

## Local development

```bash
npm install
npm run dev
```

## Production build check

```bash
npm run build
```

## Deploy to Vercel (free)

1. Push this folder to a GitHub repository.
2. In Vercel, click **Add New Project** and import the repository.
3. Framework preset is detected automatically as Next.js.
4. Click **Deploy**.

No extra environment variables are needed for this prototype.
