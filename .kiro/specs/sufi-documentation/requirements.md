# Requirements Document

## Introduction

SUFI is a full-stack intelligent restaurant reservation and management platform. It combines a FastAPI + PostgreSQL + Redis backend with a Next.js 16 frontend to deliver three distinct experiences: a guest discovery surface, a customer booking flow powered by an AI Concierge, and an Owner OS for restaurant operators. The platform's intelligence layer continuously optimises table utilisation, predicts no-shows, manages waitlists, and surfaces actionable insights to owners — all in real time.

This document captures the functional requirements for the SUFI platform documentation spec, covering every subsystem from authentication through ML-driven automation.

---

## Glossary

- **System**: The SUFI platform as a whole (backend + frontend).
- **API**: The FastAPI backend application served at the root URL.
- **Concierge**: The multi-turn AI chat agent accessible at `POST /concierge/chat`.
- **Owner_OS**: The owner-facing dashboard and management interface at `/owner`.
- **Intelligence_Layer**: The collection of backend services — Demand Engine, No-Show Engine, Table Optimizer, Waitlist Optimizer, Priority Scorer, Rescheduler, and ML Pipeline.
- **Table_Optimizer**: The service that auto-assigns the best-fit table for a reservation using time-window overlap detection and utilisation scoring.
- **Waitlist_Service**: The service that manages waitlist entries and promotes waiting users when a slot becomes available.
- **Automation_Executor**: The background service that runs the auto-cancel and reschedule cycle triggered after each dashboard load.
- **MeiliSearch**: The full-text search engine used for restaurant search with a PostgreSQL fallback.
- **Redis**: The in-memory cache and pub/sub broker used for session memory, dashboard caching, and WebSocket fan-out.
- **Guest**: An unauthenticated user browsing the platform.
- **Customer**: An authenticated user with role `customer`.
- **Owner**: An authenticated user with role `owner` or `restaurant_owner`.
- **Brand**: A logical grouping of one or more restaurant locations under a single owner identity.
- **Location**: A single physical restaurant instance belonging to a Brand.
- **Tier**: A subscription level (e.g. Free, Pro, Premium) that affects ranking boosts and feature access.
- **Promotion**: A time-limited boost applied to a restaurant's search and discovery ranking.
- **Dynamic_Pricing_Rule**: A configurable rule that adjusts pricing based on demand signals.
- **Embedding**: A 1536-dimensional vector representation of a restaurant used for semantic/vector search.
- **Session**: A Concierge conversation identified by a UUID, persisted in Redis with a 2-hour TTL.
- **Priority_Score**: A numeric score assigned to each reservation reflecting no-show risk, party size, and VIP status.

---

## Requirements

### Requirement 1: User Authentication

**User Story:** As a visitor, I want to register and log in with a role, so that I can access features appropriate to my account type.

#### Acceptance Criteria

1. WHEN a registration request is received with a unique email, name, password, and role (`customer` or `owner`), THE API SHALL create a new user record and return a JWT access token along with the user's id, email, name, and role.
2. IF a registration request is received with an email that already exists in the database, THEN THE API SHALL return HTTP 400 with the message "Email already registered".
3. WHEN a login request is received with a valid email and password combination, THE API SHALL return a JWT access token and the user's id, email, name, and role.
4. IF a login request is received with an invalid email or password, THEN THE API SHALL return HTTP 401 with the message "Invalid email or password".
5. THE API SHALL encode the user's `user_id` and `role` as claims inside every issued JWT.
6. WHILE a request carries a valid JWT in the `Authorization: Bearer` header, THE API SHALL resolve the authenticated user and make it available to protected route handlers.
7. IF a request to a protected route carries an absent or invalid JWT, THEN THE API SHALL return HTTP 401.

---

### Requirement 2: Restaurant Discovery and Search

**User Story:** As a guest or customer, I want to browse and search restaurants, so that I can find a place that matches my preferences.

#### Acceptance Criteria

1. WHEN a discovery request is received with an optional city filter and pagination parameters, THE API SHALL return a paginated list of restaurants ordered by featured status, tier rank, and rating descending, with promotion-adjusted final ranking applied.
2. THE API SHALL cache discovery responses in Redis for 60 seconds using a key scoped to city, page, and limit.
3. WHEN a search request is received with a text query, THE API SHALL attempt to resolve results via MeiliSearch and fall back to a PostgreSQL ILIKE query across name, cuisine, and city fields if MeiliSearch returns no hits.
4. WHEN search results are returned, THE API SHALL separate sponsored (active-promotion) restaurants from organic results and place sponsored results first.
5. WHEN a search request is processed, THE API SHALL record a search impression for each returned restaurant in the analytics table.
6. THE API SHALL expose an autocomplete endpoint that returns up to 5 name suggestions for a partial query.
7. WHEN a restaurant profile is fetched by ID, THE API SHALL record a profile view in the analytics table.
8. THE API SHALL expose a `/restaurants/featured` endpoint returning up to 10 featured restaurants.
9. THE API SHALL expose a `/restaurants/trending` endpoint returning up to 10 featured restaurants ordered by popularity.
10. WHERE a restaurant has a 1536-dimensional embedding stored, THE API SHALL support vector similarity search via the `/vector` routes.

---

### Requirement 3: Restaurant Registration and Profile Management

**User Story:** As an owner, I want to register my restaurant and keep its profile up to date, so that customers can find accurate information.

#### Acceptance Criteria

1. WHEN an authenticated owner submits a restaurant registration request, THE API SHALL create or reuse a Brand record matching the provided brand name, create a new Location record linked to that brand, index the location in MeiliSearch, and return both the brand and location objects.
2. WHEN an owner creates a new location under an existing brand, THE API SHALL link the location to that brand and index it in MeiliSearch.
3. WHEN an owner submits a profile update for a location they own, THE API SHALL update the `about`, `price_range`, `logo_url`, `banner_url`, and `tags` fields, replace all existing tags with the new set, and re-index the restaurant in MeiliSearch.
4. IF a profile update or location creation request is made by a user whose role is not `owner` or `restaurant_owner`, THEN THE API SHALL return HTTP 403.
5. IF a profile update targets a restaurant not owned by the authenticated user, THEN THE API SHALL return HTTP 404.
6. THE API SHALL support uploading and associating images with a restaurant via the restaurant media routes.

---

### Requirement 4: Table and Reservation Management

**User Story:** As a customer, I want to check availability and book a table, so that I have a confirmed seat when I arrive.

#### Acceptance Criteria

1. WHEN an availability request is received for a restaurant, guest count, and optional date, THE API SHALL return a list of 90-minute time slots from 12:00 to 22:00, each annotated with availability status and available table count.
2. WHEN a manual reservation creation request is received with a specific `table_id`, THE API SHALL verify the table is not already reserved for the overlapping time window before creating the reservation.
3. IF a manual reservation request specifies a table that is already reserved for the requested time slot, THEN THE API SHALL return HTTP 400 with the message "Table is already reserved for this time slot".
4. WHEN an auto-create reservation request is received without a `table_id`, THE Table_Optimizer SHALL select the best-fit available table using time-window overlap detection and utilisation scoring, then create the reservation.
5. IF no table is available for an auto-create request, THEN THE Waitlist_Service SHALL add the user to the waitlist for that restaurant, time, and party size, and THE API SHALL return a `waitlisted` status response with the waitlist entry ID.
6. WHEN a reservation is successfully created (manual or auto), THE API SHALL record a commission payment entry, track the reservation in analytics, mark any active promotion, notify the owner of the new booking, broadcast a real-time WebSocket update, update the user's cuisine preference, and invalidate relevant Redis cache keys.
7. WHEN a cancellation request is received for a reservation owned by the authenticated user, THE API SHALL set the reservation status to `cancelled`, invalidate the owner's dashboard cache, notify the owner of the cancellation, and trigger waitlist processing for the freed slot.
8. IF a cancellation request targets a reservation not owned by the authenticated user, THEN THE API SHALL return HTTP 403.
9. THE API SHALL expose a table utilisation report endpoint returning per-table utilisation statistics for a given time window.

---

### Requirement 5: Waitlist and Auto-Promotion

**User Story:** As a customer on a waitlist, I want to be automatically promoted to a confirmed reservation when a slot opens, so that I don't have to monitor availability manually.

#### Acceptance Criteria

1. WHEN a slot becomes available due to a cancellation or auto-cancel, THE Waitlist_Service SHALL query all `waiting` entries for the affected restaurant ordered by creation time, attempt to assign each to the freed slot using the Table_Optimizer, and promote the first successful match to a confirmed reservation.
2. WHEN a waitlist entry is promoted to a confirmed reservation, THE System SHALL update the entry status to `assigned` and create a corresponding reservation record.
3. THE API SHALL expose endpoints to add a user to the waitlist and to retrieve waitlist statistics (waiting count, assigned today, conversion rate, recommended notify count).

---

### Requirement 6: AI Concierge

**User Story:** As a guest or customer, I want to describe what I'm looking for in natural language, so that the AI Concierge can find matching restaurants and optionally book a table for me.

#### Acceptance Criteria

1. WHEN a chat request is received at `POST /concierge/chat`, THE Concierge SHALL load the session history from Redis (or in-memory fallback), extract intent and entities from the user's message using an LLM if available or keyword/regex fallback, merge newly extracted entities with entities already collected in the session, and persist both the user message and the assistant reply.
2. THE Concierge SHALL classify each message into one of five intents: `booking`, `cancel`, `recommendation`, `availability`, or `general`.
3. WHEN the intent is `booking` and the session is missing any of `party_size`, `date_str`, or `time_str`, THE Concierge SHALL respond with a targeted follow-up question for the first missing entity and set `needs_input` in the response.
4. WHEN the intent is `booking`, all required entities are present, and the user is authenticated, THE Concierge SHALL invoke the Table_Optimizer to auto-create a reservation at the top-ranked matching restaurant and return a confirmation reply including the reservation ID and time.
5. IF the intent is `booking` and no table is available, THEN THE Concierge SHALL add the user to the waitlist and return a waitlisted confirmation reply.
6. WHEN the intent is `booking` and the user is not authenticated, THE Concierge SHALL return a reply prompting the user to log in.
7. WHEN the intent is `recommendation` or `general`, THE Concierge SHALL return the top matching restaurants with match reasons derived from cuisine, rating, review count, featured status, and budget fit.
8. THE Concierge SHALL support multi-turn sessions: WHEN a `session_id` is provided in the request, THE Concierge SHALL continue the existing conversation; WHEN no `session_id` is provided, THE Concierge SHALL generate a new UUID session and return it in the response.
9. THE Concierge SHALL persist session history with a 2-hour TTL and cap stored messages at 20 to prevent token bloat.
10. WHEN a booking is confirmed, THE Concierge SHALL clear the session history to reset the conversation state.
11. THE API SHALL expose `GET /concierge/history/{session_id}` to retrieve visible conversation history and `DELETE /concierge/history/{session_id}` to reset a session.

---

### Requirement 7: Owner OS — Brand and Reservation Management

**User Story:** As an owner, I want a unified dashboard to manage my brands, locations, and reservations, so that I can operate my restaurant efficiently.

#### Acceptance Criteria

1. WHEN an authenticated owner requests their restaurant list, THE API SHALL return all brands owned by the user, each with its associated locations, plus any unbranded locations.
2. WHEN an owner requests their reservations, THE API SHALL return all reservations across all owned restaurants, ordered by reservation time ascending, each annotated with customer name, party size, status, table ID, and an `is_upcoming` flag.
3. WHERE a `restaurant_id` filter is provided, THE API SHALL scope the reservation list to that single location.
4. WHEN an owner toggles auto-cancellation for a restaurant, THE API SHALL update the `auto_cancellation_enabled` flag on the restaurant record.
5. IF any owner OS request is made by a user whose role is not `owner` or `restaurant_owner`, THEN THE API SHALL return HTTP 403.

---

### Requirement 8: Intelligence Layer — Owner Dashboard

**User Story:** As an owner, I want a real-time intelligence dashboard, so that I can make data-driven decisions about staffing, pricing, and promotions.

#### Acceptance Criteria

1. WHEN an owner requests the intelligence dashboard for a restaurant, THE Intelligence_Layer SHALL compute and return: total reservations today, total tables, no-show rate, fill ratio, demand level, profile views, clicks, search appearances, predicted revenue, recommended overbooking count, revenue at risk, waitlist fill potential, hourly demand heatmap, predicted hourly demand, table efficiency score, idle table count, average utilisation percentage, waitlist depth, waitlist conversion rate, and a list of actionable insight strings.
2. THE Intelligence_Layer SHALL cache the full dashboard payload in Redis for 60 seconds per restaurant.
3. WHEN the dashboard is loaded, THE Automation_Executor SHALL run in the background to evaluate and execute any pending auto-cancel or reschedule actions.
4. THE API SHALL expose a `/owner/intelligence/full/{restaurant_id}` endpoint that accepts an optional `sections` query parameter to return a partial payload, replacing up to 5 separate sub-endpoint calls with a single request.
5. THE API SHALL stream live dashboard updates over WebSocket at `ws://host/ws/dashboard/{restaurant_id}` every 10 seconds, including occupancy rate, live reservation count, demand level, fill ratio, predicted revenue, waitlist depth, insights, and hourly demand.

---

### Requirement 9: Intelligence Layer — ML Models

**User Story:** As an owner, I want the platform to learn from historical data, so that predictions improve over time.

#### Acceptance Criteria

1. WHEN an owner triggers model training for a restaurant, THE Intelligence_Layer SHALL train a LogisticRegression no-show prediction model on all historical `completed` and `no_show` reservations for that restaurant and save the model to disk.
2. WHEN an owner triggers demand model training, THE Intelligence_Layer SHALL train a RandomForest demand forecasting model on 90 days of historical reservation data and save it to disk.
3. WHEN a no-show prediction request is received with hour, day_of_week, party_size, lead_time_hrs, and user_noshow_history, THE Intelligence_Layer SHALL return a probability between 0.0 and 1.0 and a risk level of `low`, `medium`, or `high`.
4. WHEN a unified ML recommendation request is received, THE Intelligence_Layer SHALL combine no-show probability, demand forecast, and revenue optimisation signals to return one of three actions: `overbook`, `promote`, or `normal`, with a confidence level and plain-language explanation.
5. THE Intelligence_Layer SHALL cache ML recommendation responses in Redis for 5 minutes.
6. IF no trained model exists for a restaurant, THEN THE Intelligence_Layer SHALL return a default probability of 0.0 for no-show predictions and fall back to a moving-average demand forecast.

---

### Requirement 10: Intelligence Layer — Priority Scoring and Rescheduling

**User Story:** As an owner, I want the system to identify at-risk reservations and suggest reschedule options, so that I can protect revenue and reduce cancellations.

#### Acceptance Criteria

1. WHEN the priority list is requested for a restaurant, THE Intelligence_Layer SHALL score each active reservation for today using no-show probability, party size, and VIP status, and return reservations ranked from lowest to highest priority with labels `low`, `medium`, `high`, or `vip`.
2. WHEN a reschedule preview is requested, THE Intelligence_Layer SHALL evaluate each `low`-priority reservation and return either a reschedule action with a new time slot and up to 3 alternatives within a ±2-hour window, or a cancel outcome if no alternative slot is available.
3. THE API SHALL report the count of cancellations avoided by rescheduling in the preview response.

---

### Requirement 11: Automation — Auto-Cancel and Reschedule Executor

**User Story:** As an owner, I want the system to automatically handle low-priority reservations, so that I don't have to manually manage no-show risk.

#### Acceptance Criteria

1. WHEN the Automation_Executor runs for a restaurant with `auto_cancellation_enabled` set to true, THE Automation_Executor SHALL identify low-priority reservations, attempt to reschedule each using the Smart Shift Engine, cancel those for which no alternative slot exists, and log each action as an AutomationAction record.
2. THE API SHALL expose endpoints to retrieve pending automation actions, approve all pending actions, and apply all approved actions for an owner's restaurant.
3. THE API SHALL expose an automation history endpoint returning the last N executed actions for a restaurant, giving owners full visibility into automated decisions.

---

### Requirement 12: Dynamic Pricing

**User Story:** As an owner, I want to define pricing rules that respond to demand signals, so that I can maximise revenue during peak periods.

#### Acceptance Criteria

1. THE API SHALL expose CRUD endpoints for Dynamic_Pricing_Rules scoped to a restaurant.
2. WHEN the demand level for a restaurant is `high`, THE Dynamic_Pricing_Service SHALL apply the relevant active pricing rules to adjust displayed prices.
3. THE API SHALL expose an endpoint to retrieve the current effective price for a restaurant given its demand state.

---

### Requirement 13: Promotions and Subscription Tiers

**User Story:** As an owner, I want to run promotions and subscribe to higher tiers, so that my restaurant appears more prominently in search and discovery results.

#### Acceptance Criteria

1. THE API SHALL expose endpoints to create, list, and deactivate promotions for a restaurant.
2. WHEN a promotion is active for a restaurant, THE System SHALL apply a boost score to that restaurant's final ranking in search and discovery results.
3. WHEN a promotion is active and the restaurant appears in search results, THE System SHALL record a promotion impression.
4. WHEN a reservation is created at a restaurant with an active promotion, THE System SHALL mark the promotion as having generated a reservation.
5. THE API SHALL expose subscription management endpoints to assign a tier to a restaurant.
6. WHEN a restaurant has a non-default tier, THE System SHALL apply the tier's ranking boost to the restaurant's final discovery and search score.

---

### Requirement 14: Analytics

**User Story:** As an owner, I want to see how my restaurant is performing over time, so that I can identify trends and act on them.

#### Acceptance Criteria

1. THE System SHALL record a profile view event in the RestaurantAnalytics table each time a restaurant profile is fetched.
2. THE System SHALL record a search impression event for each restaurant returned in a search or discovery response.
3. THE System SHALL record a reservation event each time a reservation is successfully created.
4. THE API SHALL expose analytics endpoints returning aggregated profile views, search impressions, and reservation counts for a restaurant over a configurable date range.

---

### Requirement 15: Menu Management

**User Story:** As an owner, I want to manage my restaurant's menu, so that customers can see what's available.

#### Acceptance Criteria

1. THE API SHALL expose endpoints to create, list, update, and delete menu categories for a restaurant.
2. THE API SHALL expose endpoints to create, list, update, and delete menu items within a category.
3. IF a menu management request targets a restaurant not owned by the authenticated user, THEN THE API SHALL return HTTP 403.

---

### Requirement 16: Reviews

**User Story:** As a customer, I want to leave a review after dining, so that other users can benefit from my experience.

#### Acceptance Criteria

1. WHEN an authenticated customer submits a review with a rating and optional comment for a restaurant, THE API SHALL create the review record and update the restaurant's aggregate rating and total review count.
2. THE API SHALL expose an endpoint to list all reviews for a restaurant.
3. IF a review submission is made by an unauthenticated user, THEN THE API SHALL return HTTP 401.

---

### Requirement 17: Location and Map Services

**User Story:** As a customer, I want to find restaurants near me, so that I can choose somewhere convenient.

#### Acceptance Criteria

1. THE API SHALL expose a location search endpoint that accepts latitude, longitude, and radius parameters and returns restaurants within the specified radius using PostGIS geography functions.
2. WHEN a restaurant is registered or updated with latitude and longitude values, THE System SHALL store the coordinates in the PostGIS geography column for spatial indexing.
3. THE API SHALL expose an endpoint to retrieve a restaurant's map data including coordinates and Google Place ID.

---

### Requirement 18: Notifications

**User Story:** As an owner, I want to receive real-time notifications for new bookings and cancellations, so that I can stay informed without polling.

#### Acceptance Criteria

1. WHEN a reservation is successfully created, THE System SHALL create a notification record for the restaurant owner and attempt to push it instantly over the owner's active WebSocket connection at `ws://host/ws/owner/{restaurant_id}`.
2. WHEN a reservation is cancelled, THE System SHALL create a cancellation notification for the restaurant owner and push it over the active WebSocket connection.
3. THE API SHALL expose an endpoint to list unread notifications for an owner's restaurant.
4. THE API SHALL expose a WebSocket endpoint at `ws://host/ws/reservations` for broadcasting general reservation state changes to all connected clients.

---

### Requirement 19: Personalised Recommendations

**User Story:** As a customer, I want to receive restaurant recommendations tailored to my history, so that I discover places I'm likely to enjoy.

#### Acceptance Criteria

1. WHEN a recommendation request is received for an authenticated user, THE System SHALL return restaurants ranked by the user's cuisine preference history, location proximity if coordinates are provided, and intelligent ranking weights (rating 0.5, reviews 0.2, reservations 0.2, popularity 0.1).
2. THE System SHALL expose a similar-users recommendation endpoint that returns restaurants popular among users with similar preference profiles.
3. THE System SHALL expose an intelligent ranking endpoint that applies the weighted scoring algorithm without requiring authentication.
4. WHEN a reservation is created, THE System SHALL update the user's cuisine preference record for the booked restaurant's cuisine.
5. THE System SHALL cache personalised recommendation responses in Redis keyed by user ID and limit.

---

### Requirement 20: Rate Limiting and Middleware

**User Story:** As a platform operator, I want rate limiting and request logging in place, so that the API is protected from abuse and observable.

#### Acceptance Criteria

1. THE System SHALL apply rate limiting middleware to all API routes, returning HTTP 429 when a client exceeds the configured request threshold within the time window.
2. THE System SHALL apply logging middleware that records the method, path, status code, and duration for every request.
3. THE System SHALL apply CORS middleware configured to allow requests from the origins specified in the `ALLOWED_ORIGINS` environment variable.

---

### Requirement 21: Frontend — Control Center (AI Concierge Interface)

**User Story:** As a user visiting the home page, I want an AI-powered interface as the primary entry point, so that I can describe what I want and get instant results.

#### Acceptance Criteria

1. WHEN the Control Center page loads, THE System SHALL display an idle input state with an animated background (moving glows, noise texture, SVG flow lines).
2. WHEN the user submits a query, THE System SHALL transition to a thinking state displaying animated chips and SVG flow lines while the Concierge API call is in flight.
3. WHEN the Concierge API returns a response, THE System SHALL display the reply text, a grid of restaurant cards with name, cuisine, rating, city, and match reasons, and a Book action button on each card.
4. WHEN the user clicks Book on a restaurant card, THE System SHALL open the reservation modal pre-filled with the restaurant and any entities already collected in the session.
5. THE System SHALL maintain the `session_id` across turns so the conversation is continuous within a page session.

---

### Requirement 22: Frontend — Discover Page

**User Story:** As a user on the Discover page, I want to browse and filter restaurants, so that I can explore options without using the AI.

#### Acceptance Criteria

1. WHEN the Discover page loads, THE System SHALL fetch and display a paginated grid of restaurants using the `/restaurants/discover` endpoint.
2. THE System SHALL provide a search input and city filter that trigger a new discovery or search request on change.
3. WHEN a restaurant card is clicked, THE System SHALL navigate to or display the restaurant's detail view.

---

### Requirement 23: Frontend — Activity Page

**User Story:** As a customer, I want to view my reservation history, so that I can track past and upcoming bookings.

#### Acceptance Criteria

1. WHEN an authenticated customer visits the Activity page, THE System SHALL fetch and display all reservations associated with their account.
2. THE System SHALL visually distinguish upcoming reservations from past ones.
3. IF the user is not authenticated, THEN THE System SHALL redirect to or display the authentication modal.

---

### Requirement 24: Frontend — Owner OS Page

**User Story:** As an owner, I want a dedicated management interface, so that I can oversee my restaurants and reservations in one place.

#### Acceptance Criteria

1. WHEN an authenticated owner visits the Owner OS page, THE System SHALL display a restaurant overview tab and a reservation management tab.
2. THE System SHALL fetch and display the owner's brands and locations from `GET /owner/restaurants`.
3. THE System SHALL fetch and display the owner's reservations from `GET /owner/reservations`, with filtering by location.
4. IF the authenticated user does not have an owner role, THEN THE System SHALL not render the Owner OS navigation item.

---

### Requirement 25: Frontend — Authentication Modal

**User Story:** As a visitor, I want to register or log in from any page, so that I can access personalised features without navigating away.

#### Acceptance Criteria

1. THE System SHALL display a modal with login and register tabs accessible from the navigation bar.
2. WHEN registering, THE System SHALL present a role selection (Customer or Restaurant Owner) in addition to name, email, and password fields.
3. WHEN authentication succeeds, THE System SHALL store the JWT and user object in the Zustand global store and close the modal.
4. WHEN the user logs out, THE System SHALL clear the JWT and user object from the Zustand store.

---

### Requirement 26: Frontend — Reservation Modal

**User Story:** As a customer, I want a streamlined booking modal, so that I can confirm a reservation in as few steps as possible.

#### Acceptance Criteria

1. THE System SHALL display a reservation modal with restaurant name, date/time picker, and guest count selector.
2. WHEN the modal is opened from the AI Concierge, THE System SHALL pre-fill date, time, and guest count from the entities already extracted in the session.
3. WHEN the user confirms the booking, THE System SHALL call `POST /reservations/auto-create` and display a success or waitlisted confirmation.
4. IF the auto-create call returns a `waitlisted` status, THEN THE System SHALL display a waitlist confirmation message with the waitlist entry ID.

---

### Requirement 27: Frontend — Design System

**User Story:** As a user, I want a consistent and visually polished interface, so that the platform feels premium and trustworthy.

#### Acceptance Criteria

1. THE System SHALL use a dark base colour of `#0B0F1A` as the primary background across all pages.
2. THE System SHALL apply glassmorphism styling (backdrop blur, semi-transparent backgrounds, subtle borders) to card components.
3. THE System SHALL use `#4f8cff` as the primary accent colour for interactive elements, highlights, and call-to-action buttons.
4. THE System SHALL use Framer Motion for page transitions, card entrance animations, and the Concierge thinking-state animation.
5. THE System SHALL use Zustand for global client state (auth, modal visibility, session ID) and React Query for all server state fetching and caching.
