# Vortic.website — No‑Code Website Operating System

Vortic.website is a production-oriented, multi-tenant no-code website and landing page builder powered by the **Vext™ Edge Compiler**. It combines a visual editor, a large template marketplace, schema-driven rendering, secure form collection, analytics ingestion, and an edge publishing pipeline in one Next.js application.

The project is designed for SaaS founders, agencies, creators, ecommerce brands, local businesses, medical clinics, real estate teams, restaurants, and performance marketers who need fast, professional landing pages without hand-coding every page.

---

## Current Status

- ✅ Next.js 16 App Router application
- ✅ Production build passes with TypeScript
- ✅ `npm audit --omit=dev` reports zero production vulnerabilities
- ✅ 165 landing page templates registered
- ✅ Visual editor with blocks, styles panel, responsive preview, autosave, publish flow, and template application
- ✅ Template marketplace available at `/templates`
- ✅ Multi-tenant routing via `src/proxy.ts`
- ✅ Prisma schema for users, websites, pages, analytics, assets, domains, versions, and global blocks
- ✅ Secure fallback behavior when database/Redis are not configured

---

## Core Capabilities

### Visual Editor

Route: `/editor`

The editor provides:

- Block-based page schema editing
- Canvas preview for desktop, tablet, and mobile
- Left sidebar for adding blocks
- Template sidebar with all registered templates
- Right properties panel for props, layout, typography, spacing, borders, and visibility
- Undo / redo history
- Keyboard shortcuts
- Autosave workflow
- Publish workflow
- Local draft persistence via `localStorage`
- AI co-authoring suggestions
- Collaboration presence simulation
- Secure sandbox widget preview

You can open the editor with a specific template:

```txt
/editor?template=ai_startup_os
/editor?template=saas_mobile_app
/editor?template=roofing_contractor
```

---

## Template Marketplace

Route: `/templates`

The project includes **165 templates**:

- 10 original niche templates
- 50 professional generated templates in `professionalPack.ts`
- 105 elite expansion templates in `eliteExpansionPack.ts`

Template categories include:

- SaaS
- AI and automation
- Fintech
- Cybersecurity
- Developer tools
- Ecommerce
- Real estate
- Medical and clinics
- Online courses
- Coaching
- Local services
- Fitness
- Restaurants and hospitality
- Agencies and consulting
- Creators and media kits
- Events and nonprofits
- Automotive
- Construction
- Green tech
- Luxury services
- Web3

Each generated template contains:

- Hero section
- Trust/proof bar
- Benefits grid
- Process section
- Lead capture form
- SEO metadata
- Responsive mobile/tablet/desktop values
- Theme colors and conversion-focused copy

Template APIs:

```http
GET /api/website/template
GET /api/website/template?templateId=ai_startup_os
POST /api/website/template
```

---

## Public Routes

| Route | Purpose |
| --- | --- |
| `/` | Main Vortic marketing homepage |
| `/editor` | Visual editor workspace |
| `/templates` | Template marketplace |
| `/pricing` | Pricing page |
| `/contact` | Support/contact page |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/refund` | Refund policy |
| `/_sites/[site]/[slug]` | Multi-tenant published site renderer |

---

## API Routes

| Route | Purpose |
| --- | --- |
| `POST /api/website/save` | Autosave page schema draft |
| `POST /api/website/publish` | Queue publishing workflow and update published content |
| `GET /api/website/template` | List available templates |
| `GET /api/website/template?templateId=...` | Return one full template |
| `POST /api/website/template` | Instantiate template as a page |
| `POST /api/website/ai-adapt` | AI adaptation endpoint |
| `POST /api/forms/submit` | Secure lead/form ingestion |
| `POST /api/analytics/collect` | Buffered analytics ingestion |
| `POST /api/webhooks/stripe` | Subscription webhook handling |

Most database-dependent endpoints include preview fallback behavior so the application remains usable during local setup before PostgreSQL/Redis are configured.

---

## Architecture Overview

```txt
Next.js App Router
├─ Marketing pages
├─ Visual editor
├─ Template marketplace
├─ API routes
├─ Multi-tenant proxy routing
└─ Published site renderer

Vext™ Core
├─ Schema renderer
├─ Publishing compiler
├─ CSS extraction/minification
├─ Analytics buffering
├─ Redis fallback cache
├─ Queue and worker runtime
├─ Security hardening
└─ AI authoring/adaptation helpers
```

### Important Directories

```txt
src/app/                         Next.js app routes and API routes
src/components/editor/           Visual editor UI
src/components/renderer/         Schema/block rendering runtime
src/components/layout/           Shared layout components such as PremiumFooter
src/components/ui/               Shared UI utilities such as ToastProvider
src/lib/theme/templates/         Template packs
src/lib/website/                 Schema safety and sanitization helpers
src/lib/security/                Security utilities and hardening
src/lib/publishing/              Publishing/compilation pipeline
src/lib/analytics/               Analytics tracking and ingestion
src/lib/cache/                   Redis and edge cache helpers
src/lib/collaboration/           Presence and CRDT collaboration helpers
src/store/                       Zustand editor store
prisma/                          Database schema, seed, and RLS helpers
public/_static/analytics/        Public analytics script
```

---

## Data Model

The Prisma schema defines:

- `UserProfile`
- `Website`
- `Page`
- `PageVersion`
- `GlobalBlock`
- `DomainConfig`
- `AnalyticsRecord`
- `Asset`

Key features include:

- Multi-website ownership
- Draft and published page content
- Version history
- Domain verification state
- Analytics event storage
- Asset ownership
- Publish status enums
- Subscription plan/status enums

---

## Security Features

The project includes several security layers:

- HTML XSS sanitizer
- Schema sanitization before save/publish
- Safe URL validation
- Blocking `javascript:`, `vbscript:`, and unsafe data URLs
- Automatic `rel="noopener noreferrer"` for user-authored external links
- Honeypot spam filtering
- Distributed rate limiting with Redis fallback
- Secure ID generation
- JWT session validation helpers
- Capability-based sandbox component for custom embeds
- Safer API error messages in production

---

## User Experience Improvements

The current implementation includes:

- Premium global footer used on public pages
- Toast notifications instead of blocking alerts
- Responsive editor height using `h-dvh`
- Mobile tabs for canvas/elements/styles
- Local draft preservation
- Template application from marketplace and editor sidebar
- Better publish/autosave feedback
- Form submission loading states
- Responsive published page renderer

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example environment file:

```bash
cp .env.example .env
```

Then configure at minimum:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
REDIS_URL="redis://..."
NEXT_PUBLIC_ROOT_DOMAIN="vortic.website"
```

For local preview without a database, many API routes will still return fallback responses, but persistence requires PostgreSQL.

### 3. Start local infrastructure

```bash
docker-compose up -d
```

### 4. Generate Prisma client

```bash
npm run prisma:generate
```

### 5. Migrate and seed database

```bash
npm run prisma:migrate
npm run db:seed
```

### 6. Start development server

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
http://localhost:3000/editor
http://localhost:3000/templates
```

---

## Build and Verification

Production build:

```bash
npm run build
```

Start production server:

```bash
npm run start
```

Security audit:

```bash
npm audit --omit=dev
```

Worker runtime:

```bash
npm run worker
```

System playground:

```bash
npx ts-node src/demo.ts
```

---

## Template Usage Examples

Apply a template through the editor URL:

```txt
/editor?template=ai_startup_os
/editor?template=law_firm
/editor?template=coffee_shop
/editor?template=solar_energy
```

Fetch templates through API:

```bash
curl http://localhost:3000/api/website/template
curl "http://localhost:3000/api/website/template?templateId=ai_startup_os"
```

Instantiate a template:

```bash
curl -X POST http://localhost:3000/api/website/template \
  -H "Content-Type: application/json" \
  -d '{"templateId":"ai_startup_os","websiteId":"website_demo_1"}'
```

---

## Publishing Flow

1. User edits a schema inside the editor.
2. Autosave sends schema to `/api/website/save`.
3. Publish sends schema to `/api/website/publish`.
4. The schema is sanitized.
5. A publishing job is queued.
6. `publishedContent` is updated when database is available.
7. Public site renderer loads published schema through `/_sites/[site]/[slug]`.

---

## Multi-Tenant Routing

Multi-tenant routing is handled by:

```txt
src/proxy.ts
```

It distinguishes platform domains from tenant domains and rewrites tenant traffic internally to:

```txt
/_sites/[tenant]/[slug]
```

Platform domains such as localhost, Vercel preview domains, and the root Vortic domain bypass tenant rewrites.

---

## Notes for Production Deployment

Before production deployment, configure:

- PostgreSQL database
- Redis or Upstash Redis
- Supabase keys if used
- Paddle/Stripe webhook secrets depending on billing provider
- Root domain and wildcard DNS
- Cloudflare credentials if CDN purge is enabled
- Secure `NEXTAUTH_SECRET`
- OpenAI/LLM key if AI generation is enabled

Recommended checks:

```bash
npm run build
npm audit --omit=dev
npx prisma validate
```

---

## Brand Summary

**Vortic** is the user-facing website operating system.  
**Vext™** is the performance and compilation core.

Together, they provide a premium no-code experience for building, adapting, publishing, and measuring high-converting websites at edge speed.
