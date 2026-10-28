<p align="center">
  <img src="public/bsprep-mark.png" alt="BSPrep logo" width="88" />
</p>

<h1 align="center">BSPrep</h1>

<p align="center">
  Tamil-medium prep for IITM BS students, built by students who have been through it.
</p>

<p align="center">
  <a href="https://bsprep.in"><b>bsprep.in</b></a>
  &nbsp;·&nbsp;
  <a href="https://bsprep.in/compiler">Online compiler</a>
  &nbsp;·&nbsp;
  <a href="https://bsprep.in/careers">We are hiring</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-Postgres-3ECF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Deployed_on-Vercel-000000?style=flat-square&logo=vercel" alt="Vercel" />
</p>

<br />

<p align="center">
  <img src="docs/screenshots/hero.png" alt="BSPrep landing page" width="100%" />
</p>

## What is BSPrep

Most people who start the IITM BS program have no clear idea how to prepare for the Qualifier, and almost nothing exists for it in Tamil. BSPrep fills that gap.

You get video courses in Tamil, weekly live classes with mentors who have already cleared the Qualifier, a place to ask doubts, GPA tools, and a compiler that runs in the browser. It is one account and one dashboard instead of five tabs.

BSPrep is an independent student project. It is not an official IIT Madras product.

<br />

<p align="center">
  <img src="docs/screenshots/dashboard.png" alt="BSPrep student dashboard" width="100%" />
</p>

## What you can do

| Feature | Details |
|---|---|
| **Courses** | Tamil video lectures for Qualifier and Foundation subjects, plus bundles and completion certificates |
| **Live classes** | Weekly sessions per subject with recordings, scheduled through Google Calendar |
| **Doubts** | Ask in public or private. Mentors answer, and an AI assistant gives a first reply |
| **Compiler** | Python, Java, C and C++ in the browser. Multi-file editor, share links, no sign in needed |
| **GPA tools** | Course grade calculator, semester GPA and a predictor that tells you the exam score you need |
| **Resources** | Community notes for every subject, with stars and a contributor leaderboard |
| **Three dashboards** | Student, mentor and admin, all on one design system with a dark theme |
| **Admin inbox** | Send announcements and campaigns with one-click unsubscribe |

## Architecture

Everything runs on Next.js. Pages and API routes live in one app on Vercel, `proxy.ts` guards the private routes, and Supabase handles auth and data. Anything that needs a secret key stays on the server.

```mermaid
flowchart LR
  subgraph Browser
    UI["Next.js UI<br/>React 19 and Tailwind"]
    PY["Pyodide<br/>Python in WebAssembly"]
  end

  subgraph Vercel
    PX["proxy.ts<br/>route guards and rate limits"]
    API["API routes<br/>/api/*"]
  end

  subgraph Supabase
    AUTH["Auth"]
    DB[("PostgreSQL<br/>with RLS")]
    ST["Storage"]
  end

  UI --> PX --> API
  UI --> AUTH
  UI --> PY
  UI -. bot check .-> TS["Cloudflare Turnstile"]

  API --> DB
  API --> ST
  API --> RZP["Razorpay<br/>payments"]
  RZP -. webhook .-> API
  API --> RES["Resend<br/>email"]
  API --> OR["OpenRouter<br/>AI doubt replies"]
  API --> PZ["Paiza<br/>Java, C and C++ runs"]
  API --> GCAL["Google Calendar<br/>live class events"]
```

### How a payment flows

The server never trusts the browser. The order is created server-side and the payment signature is checked before anyone is enrolled. A webhook covers the case where the user closes the tab after paying.

```mermaid
sequenceDiagram
  actor S as Student
  participant UI as Next.js app
  participant API as API routes
  participant RZP as Razorpay
  participant DB as Supabase

  S->>UI: Click enroll
  UI->>API: POST /api/payment/create-order
  API->>RZP: Create order
  RZP-->>UI: Order id, open checkout
  S->>RZP: Pay
  RZP-->>UI: Payment id and signature
  UI->>API: POST /api/payment/verify
  API->>API: Check signature
  API->>DB: Create enrollment
  API-->>S: Confirmation email via Resend
  RZP-->>API: POST /api/payment/webhook (backup)
```

> Enrollments are currently closed. Flip `ENROLLMENTS_CLOSED` in `lib/course-catalog.ts` to reopen checkout everywhere.

### Roles

| Role | Lands on | Can do |
|---|---|---|
| Student | `/dashboard` | Courses, live classes, doubts, tools, notes |
| Mentor | `/mentor` | Run live classes and answer doubts for assigned subjects |
| Admin | `/admin` | Users, enrollments, announcements, inbox, analytics, subject assignment |

## Tech stack

| Area | Tools |
|---|---|
| **Framework** | <img src="https://thesvg.org/icons/nextdotjs/default.svg" width="18" height="18" align="center" alt="" /> Next.js 16 (App Router) &nbsp; <img src="https://thesvg.org/icons/react/default.svg" width="18" height="18" align="center" alt="" /> React 19 &nbsp; <img src="https://thesvg.org/icons/typescript/default.svg" width="18" height="18" align="center" alt="" /> TypeScript |
| **Styling and UI** | <img src="https://thesvg.org/icons/tailwindcss/default.svg" width="18" height="18" align="center" alt="" /> Tailwind CSS v4 &nbsp; Radix UI &nbsp; shadcn/ui &nbsp; <img src="https://thesvg.org/icons/framer/default.svg" width="18" height="18" align="center" alt="" /> Framer Motion &nbsp; Recharts |
| **Auth and data** | <img src="https://thesvg.org/icons/supabase/default.svg" width="18" height="18" align="center" alt="" /> Supabase Auth &nbsp; <img src="https://thesvg.org/icons/postgresql/default.svg" width="18" height="18" align="center" alt="" /> PostgreSQL with row level security &nbsp; <img src="https://thesvg.org/icons/google/default.svg" width="18" height="18" align="center" alt="" /> Google sign in |
| **Payments** | <img src="https://thesvg.org/icons/razorpay/default.svg" width="18" height="18" align="center" alt="" /> Razorpay (server-side orders, signature checks, webhooks) |
| **Email** | <img src="https://thesvg.org/icons/resend/default.svg" width="18" height="18" align="center" alt="" /> Resend |
| **Compiler** | <img src="https://thesvg.org/icons/codemirror/default.svg" width="18" height="18" align="center" alt="" /> CodeMirror 6 &nbsp; <img src="https://thesvg.org/icons/python/default.svg" width="18" height="18" align="center" alt="" /> Pyodide for Python &nbsp; Paiza API for Java, C and C++ |
| **AI** | OpenRouter for first-pass doubt replies |
| **Scheduling** | <img src="https://thesvg.org/icons/google-calendar/default.svg" width="18" height="18" align="center" alt="" /> Google Calendar API through a service account |
| **Security** | <img src="https://thesvg.org/icons/cloudflare/default.svg" width="18" height="18" align="center" alt="" /> Cloudflare Turnstile, rate limiting and security headers in `proxy.ts` |
| **Forms** | React Hook Form &nbsp; <img src="https://thesvg.org/icons/zod/default.svg" width="18" height="18" align="center" alt="" /> Zod |
| **Hosting and analytics** | <img src="https://thesvg.org/icons/vercel/default.svg" width="18" height="18" align="center" alt="" /> Vercel &nbsp; Vercel Analytics &nbsp; <img src="https://thesvg.org/icons/google-analytics/default.svg" width="18" height="18" align="center" alt="" /> Google Analytics |

## Project structure

```text
app/
  (public pages)      landing, courses, resources, doubts, tools, compiler, legal pages
  dashboard/          student dashboard
  mentor/             mentor console
  admin/              admin console
  api/                payments, doubts, compiler, live classes, admin and account routes
components/
  dashboard/          shell, shared views, skeletons and UI kit for the three dashboards
  compiler/           the editor workspace used on /compiler and inside the dashboard
  home/               landing page sections
lib/                  Supabase clients, course catalog, rate limiting, email helpers
scripts/              numbered SQL migrations and a few admin scripts
emails/               HTML email templates
docs/screenshots/     images used in this README
proxy.ts              route guards, rate limits and security headers
```

## Run it locally

You need Node 20 or newer and a Supabase project.

```bash
git clone https://github.com/PRODHOSH/bs-prep.git
cd bs-prep
npm install
```

Add a `.env.local` with your keys (ask the team for the values), then start the dev server.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Database.** Open the Supabase SQL editor and run the numbered files in `scripts/` in order, starting from `001_create_tables.sql`.

**Scripts**

| Command | What it does |
|---|---|
| `npm run dev` | Dev server (webpack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Lint the project |

## Join us

We are hiring mentors, interns and developers. Details are on [bsprep.in/careers](https://bsprep.in/careers).

## Usage

This code is proprietary and all rights are reserved. You are welcome to read it, but you may not copy, fork, redistribute or deploy it, or use any part of it in personal, academic or commercial projects, without written permission from the BSPrep team.

## Disclaimer

BSPrep is an independent student project. It is not affiliated with or endorsed by IIT Madras.
