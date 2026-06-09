# DeCacao Cellar — User Portal

> A personal digital encyclopedia for fine bean-to-bar chocolate. Catalog tasting notes, build a private cellar, compare bars side-by-side, and connect with a community of connoisseurs.

🌐 **Live:** [decacao.app](https://decacao.app)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Routing](#routing)
- [Data Model](#data-model)
- [Authentication](#authentication)
- [State Management](#state-management)
- [Styling](#styling)
- [Performance Optimizations](#performance-optimizations)
- [Deployment](#deployment)
- [Development Workflow](#development-workflow)
- [Related Repositories](#related-repositories)

---

## Overview

**DeCacao Cellar** is a Single Page Application built with React 19 and powered by Supabase as a Backend-as-a-Service. The platform lets enthusiasts of fine chocolate:

- Browse a curated encyclopedia of artisanal bean-to-bar bars
- Discover producers and their philosophy
- Track personal tastings in a private "cellar"
- Compare bars side-by-side with aroma profile analysis
- Rate bars privately and vote on community aroma profiles
- Join tasting events curated by the editorial team
- Explore producer origins on an interactive world map

The application uses no custom backend — the browser communicates directly with Postgres through Supabase's PostgREST layer, secured by Row-Level Security (RLS) policies.

---

## Features

### Public

- **Landing Hero** — Welcome page for guests with platform stats and most-voted bars preview
- **Encyclopedia** — Browse, filter, and search the full chocolate catalog with pagination
- **Bar Detail** — Slug-based URLs (e.g. `/chocolate/chuao-domori`), aroma profile cards, flavor wheel, origin map, archival tasting notes
- **Producer Catalog** — All producers with location filter and origin maps
- **Compare** — Two-bar side-by-side comparison: metadata, aroma family overlap, origin maps
- **Tastings** — Event catalog with upcoming/past filter
- **Community** — Most-active tasters ("Degustatori Attivi"), top-voted bars, user profile lookup
- **World Origin Map** — D3-rendered SVG map highlighting each bar's country of origin with centroid marker for visibility of small nations

### Authenticated

- **Personal Dashboard** — Welcome screen showing personal stats (ratings count, aroma votes, archive size) and quick-access cards
- **My Cellar** — Private tasting notes per bar with inline edit, search, onboarding flow for new users
- **Profile Management** — Avatar upload (Supabase Storage), tasting philosophy, favorite origin
- **Private Rating** — 5-star rating per bar (only the user sees their own vote — no public average)
- **Aroma Voting** — Vote on perceived aroma notes, contributing to community sensory profile
- **Personal Notes on Detail** — Inline note editor on each bar's detail page
- **Real-time Updates** — Supabase Channels subscribe to aroma vote changes for live flavor wheel refresh

### Engagement

- **Toast Notifications** — Global animated toast system for success/error feedback
- **Skeleton Loading** — Animated placeholder cards instead of spinners during data fetch
- **Prefetch on Hover** — Module-level promise cache; hovering a chocolate card triggers detail data fetch in advance
- **SEO Meta Tags** — `usePageMeta` hook sets dynamic `document.title` and Open Graph tags per route
- **Recommendations** — "You might like" section on detail pages, scored by shared tasting notes + same origin
- **Global Search** — Modal triggered from header searches across chocolates and producers

---

## Tech Stack

| Category | Technology |
|---|---|
| Runtime | Browser (V8/SpiderMonkey) |
| Language | TypeScript 5.8 |
| UI Framework | React 19 |
| Build Tool | Vite 6 |
| Router | React Router 7 (SPA) |
| Styling | Tailwind CSS 4 (utility-first, atomic) |
| Animations | motion/react (formerly Framer Motion) |
| Icons | lucide-react |
| Charts | recharts (declarative) |
| Cartography | D3 7 (imperative SVG) |
| Backend (BaaS) | Supabase (Postgres + Auth + Storage + Realtime) |
| Hosting | Vercel |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         BROWSER                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  React 19 SPA (TypeScript, Vite, Tailwind)            │  │
│  │  • Components / Views / Contexts / Hooks              │  │
│  │  • Service layer (Supabase client wrappers)           │  │
│  └─────────────────────┬──────────────────────────────────┘  │
└────────────────────────┼─────────────────────────────────────┘
                         │ HTTPS + WebSocket
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                      SUPABASE CLOUD                          │
│  ┌──────────┬──────────┬──────────┬──────────────────────┐   │
│  │ Postgres │ Auth     │ Storage  │ Realtime (channels)  │   │
│  │ + RLS    │ (JWT)    │ (S3)     │                      │   │
│  └──────────┴──────────┴──────────┴──────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

**Key principle:** there is no custom Node/Express backend. The browser talks directly to PostgREST (Supabase's REST layer over Postgres). All authorization is enforced at the database level via Row-Level Security policies. The JWT issued by Supabase Auth is automatically attached to each request, populating `auth.uid()` inside Postgres for policy evaluation.

---

## Project Structure

```
src/
├── App.tsx                       # Root component, defines routing
├── main.tsx                      # Vite entry point (mounts App)
├── index.css                     # Tailwind directives + theme variables
│
├── components/                   # Reusable presentational components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ChocolateCard.tsx
│   ├── ChocolateFlavorWheel.tsx
│   ├── ChocolateSensoryProfile.tsx
│   ├── OriginMap.tsx             # D3 SVG world map
│   ├── AromaVoting.tsx
│   ├── GlobalSearchModal.tsx
│   ├── CompareFloatingBar.tsx
│   ├── AuthModal.tsx
│   └── SkeletonCard.tsx
│
├── views/                        # Route-level page components
│   ├── HomeView.tsx
│   ├── Encyclopedia.tsx
│   ├── DetailView.tsx
│   ├── Producers.tsx
│   ├── ProducerDetailView.tsx
│   ├── CompareView.tsx
│   ├── Tastings.tsx
│   ├── Community.tsx
│   ├── ProfileView.tsx
│   ├── MyCellarView.tsx
│   ├── UpdatePassword.tsx
│   └── AuthCallback.tsx
│
├── contexts/                     # Cross-cutting state via React Context
│   ├── AuthContext.tsx           # User session + profile
│   ├── ToastContext.tsx          # Global notifications
│   ├── SearchContext.tsx         # Global search modal state
│   ├── CompareContext.tsx        # Bars selected for comparison
│   └── AppSettingsContext.tsx    # Feature flags from app_settings table
│
├── hooks/                        # Custom reusable stateful logic
│   ├── useAuthSettings.ts
│   ├── useChocolates.ts
│   ├── useProducers.ts
│   ├── useChocolateDetail.ts
│   └── usePageMeta.ts            # Updates document.title + OG tags
│
├── services/                     # Supabase data access layer
│   ├── chocolateService.ts
│   ├── producerService.ts
│   ├── aromaService.ts           # In-memory promise caching
│   ├── ratingService.ts          # In-memory promise caching
│   ├── profileService.ts
│   ├── cellarService.ts
│   └── tastingService.ts
│
├── types/                        # TypeScript interfaces
│   └── index.ts
│
├── utils/                        # Pure helper functions
│   ├── slugify.ts                # name + producer → URL slug
│   ├── colorUtils.ts             # ensureVisible, getAromaColors
│   ├── iconUtils.ts              # Lucide icon resolver from slug
│   ├── matchUtils.ts             # producer ↔ chocolate matching
│   └── prefetch.ts               # hover prefetch dispatcher
│
└── lib/
    └── supabase.ts               # Configured Supabase client singleton
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 10 (or pnpm / yarn)
- A **Supabase project** (free tier is fine)

### Installation

```bash
git clone https://github.com/charliezard96/choco-cipsi-s-cellar---user-portal.git
cd choco-cipsi-s-cellar---user-portal
npm install
```

### Configuration

Copy the example environment file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

You'll find these values in your Supabase dashboard under **Project Settings → API**.

### Run

```bash
npm run dev
```

The dev server starts on `http://localhost:3000` (configured in `package.json`) with hot module replacement.

---

## Environment Variables

All client-exposed variables must start with the `VITE_` prefix (Vite convention). They are inlined at build time.

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | yes | Public anonymous key (safe to expose; RLS enforces security) |

**Never** expose the `service_role` key in client code — it bypasses RLS.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server on port 3000 with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run TypeScript compiler in type-check-only mode |
| `npm run clean` | Remove the `dist/` folder |

---

## Routing

The SPA uses React Router v7 with the following routes:

| Path | Component | Auth | Description |
|---|---|---|---|
| `/` | `HomeView` | optional | Landing (guests) or dashboard (authenticated) |
| `/encyclopedia` | `EncyclopediaView` | public | Full chocolate catalog with filters |
| `/chocolate/:id` | `DetailView` | public | Bar detail (`:id` is slug; falls back to numeric DB id) |
| `/producers` | `ProducersView` | public | Producer catalog |
| `/producers/:id` | `ProducerDetailView` | public | Producer detail with collection |
| `/tastings` | `TastingsView` | public | Event catalog (feature-flagged) |
| `/community` | `CommunityView` | public | Active tasters, top bars, profile search |
| `/compare?a=&b=` | `CompareView` | public | Side-by-side comparison |
| `/profile` | `ProfileView` | required | User profile management |
| `/my-cellar` | `MyCellarView` | required | Private tasting notes |
| `/update-password` | `UpdatePasswordView` | required | Password recovery flow |
| `/auth-callback` | `AuthCallback` | — | OAuth redirect handler |

---

## Data Model

The most relevant Supabase tables:

| Table | Purpose |
|---|---|
| `CHOCO_BARS` | Catalog of chocolate bars |
| `CHOCO_MAKERS` | Producers / brands |
| `aroma_profiles` | Master taxonomy of aroma notes (name, group, subgroup, hex color, Lucide icon slug) |
| `BAR_AROMA_RELATION` | Official aroma profile per bar (curated) |
| `bar_level_tags` | User-tagged aroma groups/subgroups per bar |
| `chocolate_aroma_votes` | User votes on perceived aromas per bar |
| `user_ratings` | 5-star ratings (private, only visible to owner in UI) |
| `user_bar_notes` | User's personal tasting notes per bar |
| `tasting_events` | Curated tasting event catalog |
| `profiles` | User profile data (extends `auth.users`) |
| `app_settings` | Feature flags (e.g. `tastings_enabled`, `google_login_enabled`) |

### Aroma System

Each aroma is described by:
- **name** — descriptor (e.g. "Litchi", "Salamoia di Oliva")
- **group_name** — macro family (e.g. "Fruttato", "Verde", "Floreale")
- **subgroup_name** — sub-category (e.g. "Tropicale", "Sotto-maturo")
- **hex_color** — base color for UI rendering
- **icon_slug** — Lucide icon name in kebab-case (e.g. `leaf`, `flower-2`, `cherry`)

The frontend resolves the slug to a Lucide React component dynamically via `getIconHelper()`.

### URL Slugs

`Chocolate.slug` is generated at fetch time from `name + producer`:

```ts
slugify("Chuao", "Domori") → "chuao-domori"
```

The detail view accepts both slug and numeric ID for backward compatibility:

```ts
const chocolate = chocolates.find(c => c.slug === id || c.id === id);
```

---

## Authentication

Authentication is fully delegated to **Supabase Auth**:

1. User clicks "Accedi" → `AuthModal` opens
2. `supabase.auth.signInWithPassword(...)` returns a session with a JWT
3. JWT is stored in `localStorage` automatically
4. `AuthContext` subscribes to `onAuthStateChange` and updates global state
5. Subsequent Supabase calls attach the JWT in the `Authorization` header
6. Postgres validates the JWT and exposes `auth.uid()` to RLS policies

The system supports:
- Email + password
- Google OAuth (feature-flagged via `app_settings`)
- Password recovery via emailed magic link

### Row-Level Security

All sensitive tables have RLS enabled. Typical pattern:

```sql
-- Public read
CREATE POLICY "readable_by_all" ON <table>
  FOR SELECT USING (true);

-- Write only by admin
CREATE POLICY "writable_by_admin" ON <table>
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- User-owned write (e.g. ratings)
CREATE POLICY "owner_can_write" ON user_ratings
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
```

The `is_admin()` function reads `profiles.is_admin` for the current `auth.uid()`.

---

## State Management

The app uses **React Context API** (no Redux, Zustand, or external state libraries). Five providers wrap the application root:

```tsx
<ToastProvider>
  <SearchProvider>
    <CompareProvider>
      <AppSettingsProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </AppSettingsProvider>
    </CompareProvider>
  </SearchProvider>
</ToastProvider>
```

Each context exposes a hook for downstream consumption:

```tsx
const { user, profile, setShowAuthModal } = useAuth();
const { addToast } = useToast();
const { compareList, toggleCompare } = useCompare();
```

**Local component state** is managed with `useState` / `useReducer`.
**Server state** is fetched on-demand by the service layer, with module-level promise caches for deduplication.

---

## Styling

Tailwind CSS 4 with a custom theme defined in `src/index.css`. Key tokens:

```css
@theme {
  --color-primary: #271310;        /* dark chocolate */
  --color-secondary: #6c5e06;      /* gold */
  --color-secondary-container: #f7e382;
  --color-surface: #fafaeb;        /* ivory */
  --font-serif: "Noto Serif";
  --font-sans: "Work Sans";
}
```

- Mobile-first responsive design (`sm:`, `md:`, `lg:` prefixes)
- Accessibility: focus-visible rings via `:focus-visible { @apply outline-2 outline-offset-2 outline-secondary; }`
- Smooth animations via `transition-*` utility classes + motion/react for orchestrated sequences

---

## Performance Optimizations

| Technique | Implementation |
|---|---|
| **Promise caching** | Service-level `Map<id, Promise<T>>` in `aromaService`, `ratingService` |
| **Hover prefetch** | `ChocolateCard` triggers `prefetchChocolateDetail(id)` on `mouseEnter` |
| **Code splitting** | Vite auto-splits routes via dynamic imports |
| **Image lazy loading** | `loading="lazy"` on all `<img>` |
| **Blur-up effect** | Cards animate from skeleton placeholder to image with smooth fade |
| **D3 GeoJSON cache** | World map fetched once per session, stored at module scope |
| **Skeleton placeholders** | `SkeletonCard` shown during initial load instead of spinner |
| **Realtime channels** | WebSocket subscriptions only on `aroma_votes` (high-churn table) |

---

## Deployment

The app is configured for **Vercel** deployment:

```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

The rewrite rule routes all paths to `index.html` so React Router can handle them client-side.

**Environment variables** must be set in the Vercel project settings — separately for Production and Preview environments if you want different Supabase backends per deploy.

**Branch-based previews**: pushing to any non-main branch automatically gets its own preview URL like `https://<project>-git-<branch>.vercel.app`. Useful for testing changes without affecting production.

---

## Development Workflow

The project's git workflow is intentionally lightweight:

- **Default branch:** `main` (deployed to `decacao.app`)
- **Direct commits to `main`** for small fixes and incremental features
- **Feature branches** (`feature/<name>`) for risky or large changes — leverage Vercel preview deploys for testing before merging

Example for a risky change:

```bash
git checkout -b feature/prices
# ...edits...
git push -u origin feature/prices
# → Vercel deploys preview at https://decacao-app-git-feature-prices-<owner>.vercel.app
# Test, then:
git checkout main
git merge feature/prices
git push
```

---

## Related Repositories

- **Admin Portal** — Separate React SPA for catalog management (producers, bars, tasting events, aroma profiles): [choco-cipsi-s-cellar---admin-portal](https://github.com/charliezard96/choco-cipsi-s-cellar---admin-portal)

---

## License

Proprietary. All rights reserved.

---

## Author

Built with care by [@charliezard96](https://github.com/charliezard96).
Coffee, focus, and ~1500 Lucide icons fueled the journey. 🍫
