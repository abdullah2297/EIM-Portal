# EIM Portal

The internal digital hub for the **Data Warehouse Department** — people, teams, initiatives,
achievements, announcements, success stories, competitions and recognition, plus a full admin
panel for managing every one of them.

---

## 1. Quick start

```bash
# 1. install dependencies
npm install

# 2. create your local environment file
cp .env.example .env.local        # then edit the admin credentials + AUTH_SECRET

# 3. (optional) regenerate the sample data set
npm run seed

# 4. run the development server
npm run dev                       # http://localhost:3000
```

Production:

```bash
npm run build
npm start
```

**Admin panel:** <http://localhost:3000/admin> — sign in with the credentials from `.env.local`
(defaults: `admin` / `eim-admin-2026`).

> ⚠️ Everything currently in `/data` is clearly-marked **sample/placeholder content** — fictional
> people, fictional projects, fictional results. Replace it through the admin panel (or by editing
> the JSON files) before showing the portal to the department. Anything still needing real content
> is labelled `PLACEHOLDER` in the data and rendered as an obvious placeholder in the UI.

---

## 2. Technology

| Area          | Choice                                                                 |
| ------------- | ---------------------------------------------------------------------- |
| Framework     | Next.js 15 (App Router, React 19, server + client components)           |
| Language      | JavaScript, with JSDoc typedefs in `src/lib/types.js` for the data model |
| Styling       | Tailwind CSS **and** SCSS — tokens and component classes, no inline CSS |
| UI library    | MUI v7 (dialogs, menus, drawer, pagination, select, snackbar)           |
| Icons         | Material Icons (`@mui/icons-material`) via a curated registry           |
| Backend       | REST API implemented with Next.js route handlers                       |
| Database      | JSON files under `/data`, written atomically                           |
| Auth          | Signed httpOnly session cookie (HMAC-SHA256, Web Crypto)               |
| Dark mode     | Class-based, no flash on first paint, toggle in the header             |

---

## 3. Folder structure

```
eim-portal/
├── data/                         # the JSON "database" – one file per collection
│   ├── department.json           #   singleton: identity, mission, values, portfolios
│   ├── teams.json  sub-teams.json  employees.json
│   ├── initiatives.json  achievements.json  announcements.json
│   ├── success-stories.json  competitions.json
│   ├── gallery.json  recognition.json  submissions.json
├── scripts/
│   ├── seed.mjs                  # deterministic sample-data generator
│   ├── verify-site.mjs           # crawls every route: status, console, overflow, links
│   ├── verify-api.mjs            # REST + auth + CRUD end-to-end checks
│   └── verify-admin-ui.mjs       # browser test of the admin login → CRUD flow
├── src/
│   ├── middleware.js             # protects /admin/* routes
│   ├── app/
│   │   ├── layout.js             # document shell + providers + no-flash theme script
│   │   ├── globals.scss          # single stylesheet entry point (load order documented)
│   │   ├── icon.svg              # favicon
│   │   ├── not-found.js  error.js
│   │   ├── (site)/               # public site (shares header + footer)
│   │   │   ├── page.js                       →  /
│   │   │   ├── department/                   →  /department
│   │   │   ├── teams/                        →  /teams
│   │   │   ├── employees/  employees/[employeeId]/
│   │   │   ├── initiatives/  achievements/  announcements/
│   │   │   ├── success-stories/
│   │   │   ├── competitions/  competitions/[competitionId]/
│   │   │   ├── gallery/  recognition/  search/  contact/
│   │   ├── admin/                # admin panel (own shell, auth-protected)
│   │   │   ├── page.js                       →  /admin  (dashboard)
│   │   │   ├── login/                        →  /admin/login
│   │   │   ├── department/                   →  /admin/department
│   │   │   └── [resource]/  [resource]/new/  [resource]/[id]/
│   │   └── api/                  # REST layer
│   │       ├── [resource]/route.js           GET list, POST create
│   │       ├── [resource]/[id]/route.js      GET, PUT/PATCH, DELETE
│   │       ├── auth/login|logout|session/
│   │       ├── search/  stats/  contact/  participate/
│   ├── components/
│   │   ├── ui/                   # Button, Badge, Avatar, Fields, Tabs, Modal, states…
│   │   ├── layout/               # Header, Footer, PageHeader, Brand, ThemeToggle
│   │   ├── cards/                # Employee, Team, Initiative, Achievement, …
│   │   ├── home/                 # home page sections
│   │   ├── department/           # org chart
│   │   ├── competitions/         # participation form
│   │   └── admin/                # AdminShell, ResourceTable, ResourceForm, relations
│   ├── context/                  # ThemeContext, ToastContext
│   ├── hooks/                    # useAsyncData, useDebouncedValue, useFilters
│   ├── lib/                      # constants, db, query, auth, validation, schemas, types
│   ├── services/                 # HTTP client + one service per collection
│   ├── styles/                   # SCSS: tokens, base, layout, utilities, components/*
│   └── theme/                    # MUI theme built from the same tokens
├── tailwind.config.js  postcss.config.mjs  next.config.mjs  jsconfig.json
└── .env.example
```

---

## 4. Pages

| # | Route | Purpose |
|---|-------|---------|
| 1 | `/` | Hero, statistics, teams, featured colleagues, announcements, achievements, initiatives, success stories, competitions, quick links, engagement CTA |
| 2 | `/department` | Overview, mission & vision, values, responsibilities, statistics, org chart, portfolios, 5 teams, 15 sub-teams |
| 3 | `/teams` | Interactive explorer: search, team chips, sub-teams, responsibilities, members, portfolios, achievements |
| 4 | `/employees` | Directory: search + team / sub-team / role filters, sorting, pagination, featured strip |
| 5 | `/employees/[employeeId]` | Full profile: about, responsibilities, expertise, skills, hobbies, interests, achievements, awards, initiatives, fun facts, recognition, colleagues |
| 6 | `/initiatives` | Featured initiative, category chips, filters, pagination, detail modal with contributors + impact |
| 7 | `/achievements` | Highlights, awards, employee recognition, team achievements, milestones, recognition timeline |
| 8 | `/announcements` | Featured announcement, upcoming events, important updates, category filter, reader modal with attachments |
| 9 | `/success-stories` | Featured story, type filter, employee / team / project groups, challenge → solution → result modal |
| 10 | `/competitions` | Active, upcoming, rules, prizes, how to participate, previous, winners, overall leaderboard |
| 11 | `/competitions/[competitionId]` | Brief, rules, timeline, prizes, **Participate Now**, leaderboard, participants, winners |
| 12 | `/gallery` | Featured photos, category + event filters, pagination, lightbox |
| 13 | `/recognition` | Employee & team of the quarter, recent recognitions, appreciation messages, awards, history |
| 14 | `/search` | Global search grouped by content type |
| 15 | `/contact` | Contact information, submit an idea, share a story, suggest an initiative, general contact |

Navigation: `Home | Department | Teams | People | Initiatives | Achievements | News | Success Stories | Competitions`,
with Gallery / Recognition / Contact under the header's "more" menu, global search in the header,
and a hamburger drawer below `xl`.

---

## 5. The admin panel

`/admin` is a complete CMS for the portal. Every collection is created, updated and deleted
through **one** schema-driven screen pair, so adding a field means editing one file
(`src/lib/adminSchemas.js`) rather than a form component.

* **Dashboard** — live content counts, quick actions, submission inbox.
* **Organisation** — Teams, Sub-Teams.
* **People** — Employees (including skills, awards, hobbies, interests, fun facts).
* **Content** — Initiatives, Achievements, Announcements, Success Stories.
* **Engagement** — Competitions (rules, prizes, participants, leaderboard, winners), Gallery,
  Recognition, and the Inbox of everything submitted from the public forms.
* **Settings** — Department profile (identity, narrative, values, portfolios, leadership, contact).

Field types supported by the generic form: text, textarea, number, date, select, checkbox, tag
list, single relation, multi relation, and repeaters for lists of objects (impact metrics, prizes,
skills, awards, attachments, leaderboard rows).

### Authentication

* Credentials come from `ADMIN_USERNAME` / `ADMIN_PASSWORD` in `.env.local`.
* Signing in issues an HMAC-signed, httpOnly session cookie (`AUTH_SECRET`, `AUTH_SESSION_HOURS`).
* `src/middleware.js` redirects unauthenticated visitors from `/admin/*` to `/admin/login`.
* Every write endpoint independently calls `requireAdmin()`, so the API is protected even if the
  middleware is bypassed.
* To move to corporate SSO later, replace `verifyCredentials` in `src/lib/auth.js` — nothing else
  needs to change.

---

## 6. REST API

All endpoints answer with the same envelope:

```jsonc
{ "success": true,  "data": …, "meta": { "total": 40, "page": 2, "pageSize": 12, "totalPages": 4 } }
{ "success": false, "error": { "message": "…", "code": "VALIDATION_FAILED", "details": { … } } }
```

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/:resource` | list — supports `q`, `sort`, `order`, `page`, `pageSize`, `limit`, `ids`, `featuredFirst`, plus per-resource filters |
| POST | `/api/:resource` | create *(admin)* |
| GET | `/api/:resource/:id` | single record |
| PUT / PATCH | `/api/:resource/:id` | update *(admin)* |
| DELETE | `/api/:resource/:id` | delete *(admin)* |
| GET | `/api/search?q=` | global search, grouped by content type |
| GET | `/api/stats` | live content counts |
| POST | `/api/contact` | public submission form |
| POST | `/api/participate` | competition entry |
| POST | `/api/auth/login` · `/logout` · GET `/session` | admin session |

`:resource` is one of `teams`, `sub-teams`, `employees`, `initiatives`, `achievements`,
`announcements`, `success-stories`, `competitions`, `gallery`, `recognition`, `submissions`,
`department`.

The browser never calls `fetch` directly: UI → `src/services/*` → `httpClient` → API. Loading,
empty, error and network-failure states are handled by `DataState` in
`src/components/ui/StateViews.jsx`.

---

## 7. Styling & theming

* **All design tokens live in `src/styles/_tokens.scss`** — colours, font families, font sizes,
  weights, line heights, radii, shadows, spacing and motion. Nothing else hardcodes a colour.
* Each colour is published twice: `--rgb-*` (space-separated channels, so Tailwind opacity
  modifiers like `bg-primary/10` work) and `--color-*` (ready-to-use `rgb()` for SCSS and MUI).
* Dark mode overrides only the `--rgb-*` channels on `.dark`; everything else re-resolves.
* Component styling lives in classes under `src/styles/components/*.scss` (`.card`, `.btn`,
  `.badge`, `.filter-bar`, `.timeline`, `.admin-sidebar`, …). **There are no inline styles**;
  even runtime values such as progress-bar widths use generated step classes.
* The palette is CIB-inspired: deep navy primary, burgundy secondary, gold for recognition and a
  teal accent. Radii are medium (`6 / 10 / 14 / 20 / 28px`).
* To rebrand, edit `_tokens.scss` and the fallback map in `src/theme/muiTheme.js`.

---

## 8. Responsiveness

Mobile-first, verified at 375 / 768 / 1440 px on every route:

* hamburger drawer navigation below `xl`, full nav above;
* card grids collapse 4 → 3 → 2 → 1 column;
* tables scroll horizontally inside a contained wrapper;
* filter rows and tab bars scroll horizontally instead of stretching the page;
* fluid typography via `clamp()`;
* **zero horizontal page overflow** at any tested width (checked by `npm run verify:site`).

---

## 9. Verification

With the app running (`npm start` or `npm run dev`), and Playwright installed
(`npm i -D playwright`) for the browser checks:

```bash
npm run verify:api      # 21 checks: REST, filters, pagination, auth, CRUD, validation
npm run verify:site     # every route × 3 viewports: status, console errors, overflow, links
npm run verify:admin    # browser: login → list → create → validate → edit → delete
```

Latest run: **21/21 API checks passed**, 57 page loads with no console errors, no broken internal
links (91 discovered), and 0 px horizontal overflow on every page at every viewport.

---

## 10. Notes & next steps

* The JSON store is intentionally simple. `src/lib/db.js` is the only module that touches the
  filesystem — swap it for a real database and keep the exported function signatures.
* Images: no photographs ship with the project. Any record with an empty `photo` / `image` field
  renders a labelled `PLACEHOLDER IMAGE` tile or an initials avatar, so gaps are obvious rather
  than hidden. Add URLs through the admin panel to replace them.
* Fonts (Inter + Sora) are requested from Google Fonts in `src/app/layout.js`. If your network
  blocks that CDN, the system font stack in `_tokens.scss` takes over automatically — or
  self-host the fonts and point the stack at them.
* `robots` is set to `noindex` throughout: this is an internal portal.
