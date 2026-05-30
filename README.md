# 🌪️ Vortic.website: The Website Operating System (Powered by the Vext™ Engine)

Vortic.website is a world-class, high-performance, multi-tenant No-Code Website & Landing Page Builder platform designed to deliver sub-10ms page loads globally and maximum advertising conversion rates. 

Under the hood, Vortic's visual design canvas is driven by **Vext™**, an advanced, edge-native, event-driven compiler and distributed worker runtime that converts JSON block schemas into hyper-optimized static HTML, CSS, and JS.

---

## 💎 Brand Architecture: Vortic & Vext™

This platform implements a highly optimized **Unified Single-Domain Architecture (Vortic.website)** designed to capture both the premium design market and high-performance performance-marketers:

* **Vortic (The Creative Dashboard & Serving Network):** Consolidates both the SaaS platform (`vortic.website` and `/editor`) and the dynamic wildcard multi-tenant serving network (`*.vortic.website` e.g., `clinic.vortic.website`). Features a 60fps multiplayer canvas, smart Figma-style absolute layout constraints, magnetic snapping physics, and design token theme engines.
* **Vext™ (The Performance Core):** Represents the raw infrastructure power—the AST compiler, atomic CSS deduplicator, Redis-buffered analytics queues, durable event-sourced saga orchestrators, and autoscaling background worker fleets. It is the guarantee of speed, security, and conversion ROI for dropshippers and SaaS founders.

---

## 📂 Complete File Registry (64 Production-Grade Files)

The codebase is organized as a clean, highly extensible, and type-safe modular distributed system:

```bash
├── package.json               # Package dependencies & NPM scripts (dev, build, worker, seed)
├── tsconfig.json              # TypeScript compilation configuration
├── ARCHITECTURE.md            # Mathematical, architectural, and security system specifications
├── Dockerfile                 # Multi-stage, low-footprint Docker image builder
├── docker-compose.yml         # Local cluster orchestrator (App, Postgres, Redis) with env mapping
│
├── prisma/
│   ├── schema.prisma          # Prisma ORM schemas, indexes, and Optimistic Locking fields
│   ├── seed.ts                # Database seeder matching the Visual Editor ID ('landing_page_demo_1')
│   └── supabase_rls.sql       # SQL script for Row-Level Security (RLS) & automatic user registration triggers
│
├── src/
│   ├── index.ts               # Distributed background worker, heartbeats, and autoscale orchestrator
│   ├── demo.ts                # Simulation playground executing all 7 layers of the platform
│   ├── middleware.ts          # Edge-native routing middleware with distributed Redis lookups (Vortic.website)
│   ├── types/
│   │   └── builder.ts         # Page Builder JSON Schema interfaces typed with TypeScript
│   ├── store/
│   │   └── editorStore.ts     # Zustand store implementing high-speed Structural Sharing & Undo/Redo
│   ├── components/
│   │   ├── editor/            # Visual workspace components
│   │   │   ├── LeftSidebar.tsx
│   │   │   ├── Canvas.tsx
│   │   │   ├── RightPanel.tsx
│   │   │   ├── VisualEditor.tsx
│   │   │   ├── VisualEditorBridge.tsx  # Interactive HUD, snapping overlays, and multiplayer cursors
│   │   │   └── DragDropEngine.tsx      # LERP-smoothed mouse dragging physics engine
│   │   └── renderer/          # Standalone serving components
│   │       ├── Registry.tsx            # Premium verticalized block selectors
│   │       ├── BlockRenderer.tsx       # Recursive AST node renderer
│   │       └── Sandbox.tsx             # Secure isolated custom script embed runtime sandbox
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── authoring.ts            # Spelling corrector (Levenshtein), contrast checker, SEO optimizer
│   │   │   └── generator.ts            # Autonomous AI Page, Section, and Copy copywriting generator
│   │   │   └── llm.ts                  # OpenAI / DeepSeek Edge-native Fetch connector
│   │   ├── analytics/
│   │   │   ├── tracker.ts              # Client-side telemetry tracker with batching
│   │   │   ├── script.js               # Lightweight tracking script (< 1.5KB)
│   │   │   └── ingestor.ts             # Redis-buffered analytics list and Postgres bulk flusher
│   │   ├── assets/
│   │   │   └── optimizer.ts            # Responsive images picture-tag compiler and WebP converter
│   │   ├── cache/
│   │   │   ├── redis.ts                # Distributed Redis Edge-cache provider with fallback
│   │   │   ├── edgeRouter.ts           # Edge serving router & HTML WebStream compilation piped responses
│   │   │   └── invalidation.ts         # Targeted path-based global CDN Purger (Cloudflare API)
│   │   ├── collaboration/
│   │   │   ├── presence.ts             # User mouse cursors, selections, and block locks registry
│   │   │   └── crdtEngine.ts           # Redis-persisted Vector Clock LWW conflict resolution engine
│   │   │   └── yjsClient.ts            # Client-side operational compression & P2P sync protocol
│   │   ├── editor/
│   │   │   └── layoutEngine.ts         # Snapping guidelines, auto-layout flow solver, and constraints
│   │   ├── observability/
│   │   │   ├── telemetry.ts            # OpenTelemetry metrics buffer & Sentry exception tracer
│   │   │   └── exporter.ts             # OTLP trace span exporter
│   │   ├── publishing/
│   │   │   ├── compiler.ts             # AST compiler resolving nested blocks
│   │   │   ├── cssExtractor.ts         # Atomic CSS extraction compiler
│   │   │   ├── assetGraph.ts           # Preloading, preconnecting, and tree-shaking asset graph
│   │   │   ├── incrementalCompiler.ts  # Delta compiler executing builds only on dirty branches
│   │   │   ├── transitiveInvalidator.ts# Parent-child invalidation propagation & dead-nodes pruning
│   │   │   ├── buildScheduler.ts       # Speculative background builds and graph cost heuristics
│   │   │   ├── pipeline.ts             # Compilation pipeline utilizing minifiers and critical-css
│   │   │   ├── pipelineGuard.ts        # Crash-proof compiler isolation and circuit breaker pattern
│   │   │   ├── redirects.ts            # Edge-native 301/302 URL redirect manager
│   │   │   ├── minifier.ts             # Sub-1ms regex HTML/CSS minifier engine
│   │   │   ├── seoSchema.ts            # Google Structured Data Schema (JSON-LD) generator
│   │   │   ├── temporalWorkflows.ts    # Durable Saga transaction orchestrator with back-rollbacks
│   │   │   └── stalledJobRecovery.ts   # Visibility timeout daemon recovering crashed workers
│   │   └── security/
│   │       ├── uuid.ts                 # Secure, collision-free UUID & SEO friendly slugify generator
│   │       ├── hardening.ts            # CNAME DNS lookup verifier and HMAC-SHA256 file signed tokens
│   │       ├── headers.ts              # HTTP headers CSP configurator
│   │       ├── permissions.ts          # Capability-based sandbox permission system for widgets
│   │       ├── quotas.ts               # Subscription plan limits and storage quota guard
│   │       ├── session.ts              # Edge-native JWT session verifier using timing-safe comparisons
│   │       └── rateLimit.ts            # Redis Sorted Set sliding-window distributed rate limiter
```

---

## ⚡ Quick Start & Run Commands

Ensure you have **Node.js (v18+)**, **Docker**, and **NPM** installed.

### 1. Install dependencies
```bash
npm install
```

### 2. Start PostgreSQL & Redis services
```bash
docker-compose up -d
```

### 3. Migrate and Seed Database
```bash
npx prisma migrate dev --name init
npm run db:seed
```

### 4. Start Distributed Background Workers
```bash
npm run worker
```

### 5. Start Development Server
```bash
npm run dev
```

### 6. Execute System-wide Simulation Playground
Verify that all 64 files, AST compilers, Sagas, CRDTs, and Edge serving scripts are working together:
```bash
npx ts-node -O '{"module": "commonjs"}' src/demo.ts
```
