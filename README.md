# SUFI — Smart Unified Food Intelligence

> Full-stack restaurant discovery, reservation, and intelligence platform.

**Version:** 1.0 — March 2026
**Repository:** github.com/crumbler002-bit/SUFI
**Stack:** Python (FastAPI) · TypeScript (Next.js) · PostgreSQL · Redis · pgvector

---

## What is SUFI?

SUFI — Smart Unified Food Intelligence — is a full-stack restaurant discovery and reservation platform built for the next generation of diners and restaurateurs. Unlike transactional directories that simply list restaurants, SUFI is an intelligent ecosystem: every interaction teaches the platform more about a user's preferences, making each subsequent discovery smarter and more personal.

The platform serves two distinct but deeply connected audiences — diners who want frictionless discovery and booking, and restaurant owners who want real operational control, visibility into their business, and tools to grow it. SUFI connects these two sides through a shared intelligence layer powered by AI search, multi-signal ranking, and real-time analytics.

### Core Philosophy

- Discovery should feel personal, not algorithmic — SUFI adapts to who you are.
- Reservation is not just booking — it is the beginning of a relationship between diner and restaurant.
- Owners deserve the same quality of tools as large enterprise POS systems, without the enterprise price.
- Every signal — a click, a reservation, a review — makes the platform smarter for everyone.

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Backend API | Python · FastAPI | REST endpoints, business logic, auth |
| Frontend | TypeScript · Next.js | Diner app, Owner Dashboard |
| Primary Database | PostgreSQL | Users, restaurants, reservations, reviews |
| Vector Search | pgvector extension | AI-powered semantic cuisine search |
| Cache / Queue | Redis | Ranking cache, session store, job queue |
| Styling | Tailwind CSS | Responsive UI across all surfaces |
| Migrations | Alembic | Schema versioning |
| Scripts | PowerShell | Dev environment setup and automation |

---

## How SUFI is Different

The restaurant-tech space is crowded with well-funded incumbents. SUFI does not attempt to out-market them — it out-thinks them.

| Capability | SUFI | Zomato / Swiggy | OpenTable | Yelp |
|---|---|---|---|---|
| Core model | Discovery + Reservation + Intelligence | Food delivery first | Reservation widget | Reviews and discovery |
| AI-powered search | Yes — vector semantic search (pgvector) | Basic keyword filters | No | No |
| Multi-signal ranking | Yes — 6-signal composite score | Rating + sponsored | Rating only | Rating + paid listings |
| AI Concierge | Conversational booking assistant | No | No | No |
| Owner Dashboard | Full ops control panel | Basic analytics | Reservation management only | Response to reviews only |
| Tier + promotion system | Built-in monetization for owners | Paid ads | No | Yelp Ads |
| Personalization | Per-user cuisine preference scoring | Order history based | None | None |
| Real-time analytics | Revenue, CTR, reservation heatmaps | Order volume dashboards | Cover count reports | Review analytics only |
| Commission model | Tier subscription, not per-order cut | 18-25% per order | $1-1.5/diner | Advertising spend |

### Key Differentiators

- SUFI is a **reservation platform, not a delivery platform** — it competes on experience, not logistics.
- Unlike OpenTable (pure reservation widget), SUFI **drives traffic** to restaurants through smart discovery before the booking happens.
- Unlike Zomato, SUFI gives owners **operational dashboards** with seat-level booking visibility — not just post-order data.
- The **multi-signal ranking engine** means SUFI's feed cannot simply be bought — quality and engagement always contribute alongside paid tiers.
- **Vector search** means users can type "smoky slow-cooked meat with a good wine list" and SUFI understands it — no other competitor in this tier does this.

---

## What SUFI Provides to Diners

### Discovery and Search

- **AI Semantic Search** — find restaurants by mood, cuisine style, or ingredient using natural language.
- **Multi-signal ranked feed** — results ordered by quality, engagement, distance, trending activity, and personal preference simultaneously.
- **Cuisine preference scoring** — the more a diner uses SUFI, the more accurately it predicts what they will love.
- **Trending Restaurants** — a live feed of restaurants gaining rapid popularity in the past 7 days.
- **Location-aware ranking** — nearby restaurants naturally score higher without hard cutoffs.

### Booking and Reservations

- **Real-time seat availability** — reserve directly through the platform without calling the restaurant.
- **AI Concierge** — a conversational assistant that helps plan meals, suggests timing, answers questions about the menu, and confirms bookings.
- **Booking history** — full personal reservation history with status tracking (confirmed, completed, cancelled).
- **Smart reminders and notifications** for upcoming reservations.

### Personalization

- **Cuisine preference profile** — built automatically from reservation history and browsing behaviour.
- **Personalized recommendation endpoint** serving results unique to each diner.
- **Similar-user collaborative signals** — if people with matching tastes love a restaurant, SUFI surfaces it.
- **Dietary and preference filters** that become smarter over time.

### Reviews and Trust

- **Verified review system** — only diners who have reserved can leave reviews, eliminating fake entries.
- **Sentiment-scored reviews** that feed back into the restaurant's quality signal.
- Photo uploads and detailed review cards.

---

## What SUFI Provides to Restaurant Owners

SUFI treats restaurant owners as first-class citizens of the platform — not just listings. Owners get a dedicated dashboard that gives full operational control, business intelligence, and marketing tools in one place.

### Profile and Listing Management

- Full restaurant profile editor — name, description, cuisine tags, location, operating hours, photos.
- Menu management — add, update, and categorise dishes with pricing.
- Instant visibility into how the profile appears in diner search results.

### Tier and Promotion System

- **Subscription tiers** (Basic, Standard, Premium, Elite) each providing a ranking boost in the discovery feed.
- **Promotion campaigns** — time-limited boosts that elevate the restaurant in search results during specific windows.
- **Transparent boost model** — owners know exactly how their tier and promotions affect their visibility score.
- Active promotion tracking — see which promotions are live, their expiry, and their performance.

### Analytics Engine

- Revenue analytics — total revenue, average booking value, revenue trends over time.
- **CTR tracking** — how many diner impressions convert to profile visits.
- **Reservation heatmaps** — identify peak booking days, popular time slots, and seasonal trends.
- Cancellation rate monitoring to identify and address booking no-show patterns.
- Review sentiment tracking — monitor how guest sentiment evolves over time.

---

## Owner Dashboard — Full Operational Control

The Owner Dashboard is SUFI's flagship differentiator on the supply side. It is a full control panel giving restaurant operators end-to-end visibility over every aspect of their SUFI presence and bookings.

### Reservation Management

| Feature | What It Shows / Does |
|---|---|
| Live reservation list | Every upcoming reservation with diner name, party size, time slot, and booking date |
| Booking status control | Confirm, mark as seated, mark as completed, or cancel bookings with one click |
| Guest details | Diner contact information, past visit history at this restaurant, special requests |
| Seat / table assignment | Assign specific tables to confirmed bookings and track floor occupancy |
| No-show flagging | Mark diners as no-show; feeds into platform trust scoring |
| Reservation search and filter | Filter by date, party size, status (pending / confirmed / completed / cancelled) |
| Calendar view | Day and week calendar showing all bookings as blocks, enabling at-a-glance floor planning |
| Walk-in entry | Log walk-in guests directly through the dashboard to keep occupancy data accurate |

### Booking Analytics

- Total reservations this week / month with trend vs previous period.
- Peak booking hours chart — visualise which time slots fill fastest.
- Diner retention rate — how many guests return for a second visit.
- Average party size trends to help with table configuration planning.

### Menu and Profile Control

- Edit restaurant description, cuisine categories, and operating hours without contacting SUFI support.
- Upload and manage restaurant photos directly from the dashboard.
- Toggle online/offline status — temporarily pause new reservations during maintenance or closure.
- Menu item management — add dishes, set prices, mark items as unavailable.

### Promotions and Tier Management

- View the restaurant's current subscription tier and its effect on ranking.
- Create and activate new promotions — set duration, type, and target audience window.
- Promotion performance: impressions gained, CTR lift, and reservation uplift during the campaign.
- Billing and subscription management for tier upgrades.

### Review Management

- View all reviews left by verified diners, with star rating and full text.
- Respond to reviews publicly — responses are shown below the review on the diner-facing profile.
- Sentiment trend chart — see whether guest sentiment is improving or declining over time.
- Flag inappropriate reviews for moderation.

### Admin Controls (Chain Level)

For restaurant groups managing multiple locations:

- **Multi-location overview** — see all owned restaurants and their key metrics on one screen.
- **Cross-location reservation comparison** — identify which locations are performing best.
- **Staff access management** — grant dashboard access to managers with role-based permissions (view-only vs full control).
- **Centralised promotion management** — run a promotion across all locations simultaneously.

---

## Frontend Architecture — Routing Structure

SUFI separates marketing from product. The landing page explains what SUFI is. The app is where the product lives. These two surfaces are intentionally kept apart — the same way Airbnb, Notion, and Linear do it.

```
/                  →  Landing page       (marketing, feature explanation, CTA)
/app               →  Guest system       (AI Concierge, Discover, Trending)
/app/dashboard     →  Customer system    (reservations, recommendations, history)
/owner             →  Owner OS           (dashboard, analytics, reservations)
```

### Layer 1 — Landing Page (`/`)

Purpose: explain SUFI, convert visitors into users. Nothing functional lives here.

- Hero section with SUFI's value proposition
- Feature highlights: AI Concierge, Smart Discovery, Real-time Booking
- Competitive positioning
- Single CTA: "Start Exploring" → routes to `/app`

What it does NOT contain: live data, dashboards, search results, or any product UI.

### Layer 2 — Guest System (`/app`)

The real product entry point. No login required. A single-surface, state-driven interface — no page reloads, feels like an OS.

| Section | What it does |
|---|---|
| AI Concierge | Natural language input → thinking state → restaurant results → book action |
| Discover | Paginated restaurant grid with search and city filter |
| Trending | Live feed of restaurants gaining rapid popularity |

State machine inside `/app`:

```
idle input  →  thinking (API call in flight)  →  response (results + cards)  →  book modal
```

The `session_id` is maintained across turns so the conversation is continuous within the session. No page navigation happens — the surface morphs.

### Layer 3 — Customer System (`/app/dashboard`)

Requires authentication with role `customer`.

- Reservation history with status (confirmed, completed, cancelled)
- Personalized restaurant recommendations
- Cuisine preference profile (auto-built from booking history)
- Upcoming vs past reservation distinction

### Layer 4 — Owner OS (`/owner`)

Requires authentication with role `owner` or `restaurant_owner`.

- Restaurant and brand overview
- Live reservation management
- Analytics (revenue, CTR, heatmaps)
- Promotion and tier management
- Multi-location support for chains

### Why This Separation Matters

| Concern | Benefit |
|---|---|
| Clean UX | Landing is simple and focused. App is powerful and functional. They never compete. |
| Matches backend design | Backend already models Guest / Customer / Owner as distinct roles. Frontend now mirrors that. |
| Independent iteration | Marketing and product can evolve separately without coupling. |
| Scalability | Each layer can be improved, A/B tested, or replaced without touching the others. |

---

## Full Platform Feature List

### Diner-Facing Features

| Feature | Description | Status |
|---|---|---|
| AI Semantic Search | Natural-language restaurant discovery via pgvector | Implemented |
| Multi-Signal Ranked Feed | 6-signal composite ranking | Implemented |
| Real-Time Reservations | Live seat booking with instant confirmation | Implemented |
| AI Concierge | Conversational booking and recommendation assistant | Implemented |
| Personalized Recommendations | Per-user cuisine scoring, history, collaborative filter | Implemented |
| Trending Restaurants | 7-day growth signal surfaces rising restaurants | Implemented |
| Location-Aware Discovery | Distance decay scoring for proximity-based ranking | Implemented |
| Reservation History | Full booking history with status for each diner | Implemented |
| Review System | Verified post-visit reviews with photo upload | Implemented |
| Cuisine Preference Profile | Auto-built preference model from usage behaviour | Implemented |
| Notifications | Booking confirmations, reminders, cancellation alerts | Implemented |
| Search Filters | Cuisine, location, price, rating, availability filters | Implemented |

### Owner-Facing Features

| Feature | Description | Status |
|---|---|---|
| Owner Dashboard | Full-featured operational control panel | Implemented |
| Reservation Console | Live list of all bookings with full management controls | Implemented |
| Booking Status Management | Confirm / seat / complete / cancel with one click | Implemented |
| Guest Details and History | Diner info, past visits, special requests per booking | Implemented |
| Calendar View | Day/week calendar of all bookings for floor planning | Implemented |
| Walk-In Entry | Log walk-in guests for complete occupancy tracking | Implemented |
| Analytics Engine | Revenue, CTR, reservations, sentiment, heatmaps | Implemented |
| Tier System | Subscription tiers providing ranking boosts | Implemented |
| Promotion System | Time-limited campaigns with performance tracking | Implemented |
| Menu Management | Add, edit, and categorise dishes with pricing | Implemented |
| Profile Editor | Full control over name, description, photos, hours | Implemented |
| Review Management | View, respond, and flag diner reviews | Implemented |
| Online/Offline Toggle | Pause reservations instantly from the dashboard | Implemented |
| Multi-Location Admin | Chain-level view with cross-location comparison | Implemented |
| Staff Role Management | Role-based access for managers and staff | Implemented |

### Platform and Infrastructure Features

| Feature | Description |
|---|---|
| Multi-Signal Ranking Engine | 6-signal composite: quality, engagement, trending, monetization, location, personalization |
| Vector Search (pgvector) | Semantic restaurant search embedded in PostgreSQL |
| Redis Caching | Ranking results cached per city+user with 5-min TTL |
| A/B Testing Support | Multiple ranking model variants (v1 / v2 / AI) for experimentation |
| JWT Authentication | Secure token-based auth for diner and owner sessions |
| Role-Based Access Control | Diner / Owner / Admin / Super-Admin permission hierarchy |
| Alembic Migrations | Versioned database schema management |
| REST API | Full OpenAPI-documented endpoint suite for all platform operations |
| FastAPI Backend | High-performance async Python API with automatic OpenAPI docs |
| Next.js Frontend | Server-side rendered TypeScript frontend for SEO and performance |

---

## Multi-Signal Ranking Engine

SUFI's ranking engine is the intelligence core of the platform. Rather than sorting restaurants by a single metric, it computes a composite score across six signal categories for every restaurant, in the context of the specific user making the request.

| Signal Category | Signals Used | Formula |
|---|---|---|
| Quality | Rating, total reviews, review sentiment | `rating * 40 + log(reviews + 1) * 10` |
| Engagement | Reservation count, profile clicks, CTR | `reservations * 0.2 + ctr * 30` |
| Trending | Reservations last 7 days, review growth | `reservations_7d * 0.5` |
| Monetization | Tier boost, active promotion boost | `get_tier_boost() + get_promo_boost()` |
| Location | Distance from user in km | `100 / (1 + distance_km)` |
| Personalization | Cuisine preference score, past bookings | `user_preference * 25` |

**Final score** = quality + engagement + trending + tier_boost + promotion_boost + distance + personalization

Results are cached in Redis (key: `ranking:{city}:{user_id}`, TTL: 5 minutes) to keep response times fast even at scale. Multiple ranking model variants can be run simultaneously for A/B testing without platform downtime.

**Where the ranking engine is used:**

- `GET /restaurants/discover` — main discovery feed for all diners
- `GET /restaurants/search` — keyword and semantic search results
- `GET /restaurants/trending` — trending restaurants leaderboard
- `GET /recommendations/personalized` — per-user personalized recommendation feed

---

## API Endpoint Overview

### Authentication

| Endpoint | Description |
|---|---|
| `POST /auth/register` | Register a new diner or owner account |
| `POST /auth/login` | Authenticate and receive JWT token |
| `POST /auth/refresh` | Refresh an expired token |
| `POST /auth/logout` | Invalidate session token |

### Restaurant Discovery

| Endpoint | Description |
|---|---|
| `GET /restaurants/discover` | Multi-signal ranked discovery feed |
| `GET /restaurants/search` | Semantic + keyword search with filters |
| `GET /restaurants/trending` | Restaurants gaining rapid popularity |
| `GET /restaurants/{id}` | Full restaurant profile detail |

### Reservations

| Endpoint | Description |
|---|---|
| `POST /reservations` | Create a new reservation |
| `GET /reservations/my` | Diner's reservation history |
| `PUT /reservations/{id}` | Update reservation (reschedule) |
| `DELETE /reservations/{id}` | Cancel a reservation |
| `GET /reservations/availability` | Check available slots for a restaurant |

### Owner Dashboard

| Endpoint | Description |
|---|---|
| `GET /owner/reservations` | All bookings for owned restaurant(s) |
| `PUT /owner/reservations/{id}/status` | Update booking status (confirm / seat / complete / cancel) |
| `GET /owner/analytics` | Revenue, CTR, reservation volume analytics |
| `GET /owner/analytics/heatmap` | Booking heatmap by time slot and day |
| `POST /owner/promotions` | Create a new promotion campaign |
| `GET /owner/promotions` | List all promotions with performance metrics |
| `PUT /owner/profile` | Update restaurant profile, photos, hours |
| `PUT /owner/menu` | Add or update menu items |
| `PUT /owner/status` | Toggle restaurant online / offline |

### Recommendations and AI

| Endpoint | Description |
|---|---|
| `GET /recommendations/personalized` | Per-user personalised restaurant feed |
| `POST /concierge/chat` | AI concierge conversational booking endpoint |
| `GET /restaurants/vector-search` | Semantic vector similarity search |

### Reviews

| Endpoint | Description |
|---|---|
| `POST /reviews` | Submit a verified post-visit review |
| `GET /reviews/{restaurant_id}` | Fetch all reviews for a restaurant |
| `POST /reviews/{id}/response` | Owner response to a review |
| `DELETE /reviews/{id}` | Flag or remove a review (admin) |

### Admin

| Endpoint | Description |
|---|---|
| `GET /admin/users` | List and manage all platform users |
| `GET /admin/restaurants` | Review and approve restaurant listings |
| `PUT /admin/restaurants/{id}/tier` | Set or change a restaurant's subscription tier |
| `GET /admin/analytics/platform` | Platform-wide analytics overview |

---

## Core Data Model

| Entity | Key Fields | Relationships |
|---|---|---|
| User | id, email, hashed_password, role, cuisine_preferences, created_at | Has many Reservations, Reviews |
| Restaurant | id, owner_id, name, cuisine_tags, rating, tier, ctr, reservation_count, lat/lng, is_active | Belongs to User (owner), has many Reservations, Reviews, Promotions |
| Reservation | id, user_id, restaurant_id, party_size, slot_time, status, special_requests | Belongs to User and Restaurant |
| Review | id, user_id, restaurant_id, rating, body, sentiment_score, created_at | Belongs to User and Restaurant |
| Promotion | id, restaurant_id, boost_value, start_date, end_date, is_active | Belongs to Restaurant |
| OwnerProfile | id, user_id, restaurant_id, verified, subscription_tier | Belongs to User and Restaurant |

---

## Roadmap and Future Capabilities

| Phase | Feature | Impact |
|---|---|---|
| Near-term | Mobile app (React Native) | Reach diner audience on iOS and Android |
| Near-term | SMS / WhatsApp reservation reminders | Reduce no-show rate by ~30% |
| Near-term | Payment integration for deposits | Guarantee serious bookings, reduce cancellations |
| Mid-term | AI menu recommendation inside Concierge | Increase diner satisfaction and upsell |
| Mid-term | POS system integration for real-time table status | Remove manual table management from dashboard |
| Mid-term | Dynamic pricing suggestions for owners | Revenue optimisation during peak demand |
| Long-term | Predictive no-show model using ML | Alert owners before a no-show happens |
| Long-term | Multi-city expansion with city-level ranking cache | Scale ranking engine to national level |
| Long-term | White-label dashboard for restaurant chains | Enterprise B2B revenue stream |

---

*SUFI Platform Documentation · Confidential · March 2026 · github.com/crumbler002-bit/SUFI*
