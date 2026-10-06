# My Finances

Personal savings planner. Next.js (App Router) + TypeScript, MongoDB Atlas for sync across devices, deployed on Vercel.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in MONGODB_URI and APP_PASSCODE
npm run dev
```

## Structure

```
app/
  layout.tsx                 root HTML, global CSS, title template
  login/                     passcode sign-in
  (app)/layout.tsx           nav + PlannerProvider, shared by every signed-in page
  (app)/page.tsx, plan/, insights/, monthly/, goals/, millionaire/, pension/, knowledge/
                             one thin page per route: metadata + its view
  api/state, api/knowledge   GET/PUT saved data (passcode in the x-passcode header)
components/
  ui/                        generic building blocks: Card, Kpi, RangeControl, bars, tooltips
  charts/                    SVG axis helpers and chart tooltips
  layout/                    Nav, PageShell (header, health badge, footnote), skeleton
  glossary/                  underlined finance terms with plain-language tooltips
  providers/PlannerProvider  planner state, derived numbers and cloud sync for all pages
  planner/<page>/            the cards and charts for each page
  knowledge/                 Knowledge checklist and its interactive demos
hooks/                       useCloudSync, useKnowledgeProgress, useElementWidth
lib/
  planner/                   pure model: config, projection, loans, investing, pension, insights
  api/client.ts              browser passcode + fetch helpers
  server/                    passcode guard and cached MongoDB client (API routes only)
  format.ts, glossary.ts, routes.ts
```

Saved numbers keep the original MongoDB shape (`lib/planner/serialize.ts`), so existing saves load unchanged.

Push to `main` and Vercel deploys automatically.
