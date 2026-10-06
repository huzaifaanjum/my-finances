# My Finances

Personal savings planner. Next.js (App Router) + TypeScript, MongoDB Atlas for sync across devices, deployed on Vercel.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in MONGODB_URI and APP_PASSCODE
npm run dev
```

## Structure

- `app/page.tsx` dashboard (client component)
- `app/login/page.tsx` passcode sign-in
- `app/api/state/route.ts` GET/PUT the saved numbers (passcode in the `x-passcode` header)
- `lib/planner.ts` planner logic, glossary tooltips and cloud sync
- `lib/markup.ts` dashboard markup the planner attaches to
- `lib/mongo.ts` cached MongoDB client

Push to `main` and Vercel deploys automatically.
