# Implementation Plan: Ride-Sharing Web Application

**Branch**: `001-ride-sharing` | **Date**: 2026-01-20 | **Spec**: [spec.md](spec.md) | **Updated**: Next.js Stack  
**Input**: Feature specification from `/specs/001-ride-sharing/spec.md`

## Summary

The Ride-Sharing Web Application is an MVP web platform enabling users to create, list, and book rides. Users authenticate via email/password, create ride offerings with location/time/seat details, and passengers search and request bookings. The system manages booking workflows (request → approve/reject → confirm) and tracks user ratings/trust metrics.

**Technical Approach**: Full-stack JavaScript with Next.js 14.x for unified frontend/backend development, providing Server-Side Rendering (SSR) for SEO benefits, API routes eliminating separate backend server, and MongoDB for flexible document storage. This unified approach reduces deployment complexity, improves developer productivity, and enables incremental Static Generation (ISG) for ride listings.

## Technical Context

**Language/Version**: 
- Full-Stack: JavaScript (Next.js 14.x with App Router)
- Back-end API: Next.js 14.x API Routes + Express middleware (optional for advanced use cases)
- Database: MongoDB 6.x

**Primary Dependencies**: 
- Full-Stack: Next.js 14.x, React 18.x, React Server Components, SWR (data fetching), Tailwind CSS
- Backend: Express 4.x (if needed for WebSocket/advanced routing), Mongoose 7.x, bcrypt, jsonwebtoken (JWT), nodemailer, joi (validation)
- Frontend: Next.js built-in form handling, SWR for data synchronization, React Hook Form integration, Axios (optional with SWR)
- Testing: Jest (API routes + utils), Vitest (optional for faster frontend tests), Playwright (E2E)

**Storage**: MongoDB 6.x with Mongoose ODM for schema validation and query support

**Testing**: 
- Unit: Jest (API routes, services)
- Integration: Jest + test database (API endpoints)
- E2E: Playwright (user workflows)
- Coverage target: 80% minimum for critical paths

**Target Platform**: Web (desktop + responsive mobile browsers); deployment on Node.js servers (Docker containers, Vercel optional)

**Project Type**: Full-stack web application (unified Next.js monolith + MongoDB backend)

**Performance Goals**: 
- API response time: <200ms p95 latency for standard queries
- Page load time: <3 seconds for initial page load (including ISG static generation)
- Ride search: <2 seconds for 10k+ listings
- Authentication: <500ms login/registration
- Batch operations: 1000+ items/second for data processing
- Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1

**Constraints**: 
- <200ms p95 latency for API endpoints (FR-009 ride search)
- <3 second page load time on initial visit
- 99.5% uptime target for production
- WCAG 2.1 AA accessibility compliance mandatory
- Asynchronous email delivery (non-blocking)
- 80% minimum code coverage for critical paths
- ISG revalidation strategy for ride listings (30-60 second intervals)

**Scale/Scope**: 
- MVP users: 100-1000 concurrent users
- Expected rides per region: 1000-10,000 active listings
- Requests per second: 100-500 rps during peak hours
- Data retention: 2 years minimum for completed rides and ratings
- MVP scope: 5 user stories (Stories 1-5 per spec); P2 stories can be deferred post-launch

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Code Quality Excellence**: ESLint + Prettier enforce code standards. Next.js conventions (file-based routing, co-located components) promote clarity. API routes follow RESTful conventions. Authentication utilities extracted to middleware. Validation logic centralized in service layer. TypeScript recommended for type safety.
- [x] **Testing Standards**: Jest configured for API routes + unit tests. Vitest for frontend component tests. Coverage reporter integrated. E2E tests with Playwright for user workflows. All tests independent, repeatable, <30 seconds total execution. Test database seeding for integration tests.
- [x] **User Experience Consistency**: React Server Components reduce client-side JavaScript. Form components use consistent patterns. Tailwind CSS enforces unified styling. Error messages clear and actionable. ISG strategy ensures consistent, fast ride listings presentation across all users. Accessibility (WCAG 2.1 AA) built into component layer.
- [x] **Performance Requirements**: MongoDB indexing for location/date searches optimized. Next.js ISG revalidation strategy (30-60s) for ride listings. Async email delivery non-blocking. Server Components reduce hydration time. Image optimization with `next/image`. Core Web Vitals monitoring configured.

**All gates PASS** — No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/001-ride-sharing/
├── spec.md              # Feature specification (5 user stories, 21 FRs, success criteria)
├── plan.md              # This file - technical decisions and architecture
├── research.md          # Phase 0 research - technology justification and best practices
├── data-model.md        # Phase 1 design - MongoDB schema documentation
├── contracts/           # Phase 1 design - OpenAPI/REST endpoint specifications
├── quickstart.md        # Phase 1 design - development environment setup
└── checklists/
    └── requirements.md  # Quality validation checklist (passed)
```

### Source Code (repository root) - Next.js Monolith

```text
ride-sharing-app/
├── app/                          # Next.js App Router directory (Pages + API Routes)
│   ├── layout.jsx                # Root layout (header, footer, global styles)
│   ├── page.jsx                  # Home/landing page
│   ├── error.jsx                 # Error boundary
│   ├── not-found.jsx             # 404 page
│   │
│   ├── (auth)/                   # Auth route group (no layout wrapper)
│   │   ├── layout.jsx
│   │   ├── login/
│   │   │   └── page.jsx          # Login page
│   │   ├── register/
│   │   │   └── page.jsx          # Registration page
│   │   └── logout/
│   │       └── route.js          # Logout POST handler
│   │
│   ├── (dashboard)/              # Authenticated routes group
│   │   ├── layout.jsx            # Dashboard layout (sidebar, nav)
│   │   ├── dashboard/
│   │   │   └── page.jsx          # User dashboard
│   │   ├── rides/
│   │   │   ├── page.jsx          # Browse/search rides
│   │   │   ├── [id]/
│   │   │   │   └── page.jsx      # Ride detail view
│   │   │   └── create/
│   │   │       └── page.jsx      # Create new ride page
│   │   ├── my-rides/
│   │   │   └── page.jsx          # User's created rides
│   │   ├── my-bookings/
│   │   │   └── page.jsx          # User's booking requests
│   │   ├── profile/
│   │   │   └── page.jsx          # User profile and ratings
│   │   └── notifications/
│   │       └── page.jsx          # Notification center
│   │
│   ├── api/                      # Next.js API Routes (backend endpoints)
│   │   ├── auth/
│   │   │   ├── register/
│   │   │   │   └── route.js      # POST /api/auth/register
│   │   │   ├── login/
│   │   │   │   └── route.js      # POST /api/auth/login
│   │   │   └── logout/
│   │   │       └── route.js      # POST /api/auth/logout
│   │   ├── rides/
│   │   │   ├── route.js          # GET /api/rides, POST /api/rides (create)
│   │   │   ├── search/
│   │   │   │   └── route.js      # GET /api/rides/search (filtered search)
│   │   │   └── [id]/
│   │   │       └── route.js      # GET/PUT/DELETE /api/rides/:id
│   │   ├── bookings/
│   │   │   ├── route.js          # GET /api/bookings, POST /api/bookings (request)
│   │   │   ├── my-bookings/
│   │   │   │   └── route.js      # GET /api/bookings/my-bookings (user's requests)
│   │   │   └── [id]/
│   │   │       ├── route.js      # GET /api/bookings/:id
│   │   │       ├── approve/
│   │   │       │   └── route.js  # POST /api/bookings/:id/approve
│   │   │       └── reject/
│   │   │           └── route.js  # POST /api/bookings/:id/reject
│   │   ├── users/
│   │   │   └── [id]/
│   │   │       ├── route.js      # GET /api/users/:id (profile)
│   │   │       └── ratings/
│   │   │           └── route.js  # GET/POST /api/users/:id/ratings
│   │   └── notifications/
│   │       ├── route.js          # GET /api/notifications
│   │       └── [id]/
│   │           └── read/
│   │               └── route.js  # POST /api/notifications/:id/read
│   │
│   └── middleware.js             # Next.js middleware for auth redirects, logging
│
├── components/                   # Reusable React components
│   ├── common/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── Sidebar.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── ToastNotification.jsx
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   └── LogoutButton.jsx
│   ├── rides/
│   │   ├── RideCard.jsx
│   │   ├── RideForm.jsx
│   │   ├── RideSearchForm.jsx
│   │   ├── RideDetailModal.jsx
│   │   └── RideList.jsx
│   ├── bookings/
│   │   ├── BookingRequestForm.jsx
│   │   ├── BookingRequestsList.jsx
│   │   ├── BookingApproveButton.jsx
│   │   ├── BookingRejectButton.jsx
│   │   └── BookingStatus.jsx
│   └── profiles/
│       ├── UserProfile.jsx
│       ├── RatingForm.jsx
│       └── RatingsList.jsx
│
├── lib/                          # Shared library utilities
│   ├── db.js                     # MongoDB connection and management
│   ├── auth.js                   # JWT token generation/verification, password hashing
│   ├── validators.js             # Input validation rules (Joi schemas)
│   ├── errors.js                 # Custom error classes
│   └── formatters.js             # Date/currency formatting utilities
│
├── services/                     # Business logic (API route handlers call these)
│   ├── auth.service.js           # Registration, login, password verification
│   ├── rides.service.js          # Ride CRUD, search, filtering, availability checks
│   ├── bookings.service.js       # Booking requests, approvals, rejections
│   ├── ratings.service.js        # User ratings, reviews, average calculations
│   ├── emails.service.js         # Async email notifications (nodemailer)
│   └── notifications.service.js  # In-app notifications
│
├── models/                       # Mongoose schemas (MongoDB)
│   ├── User.js
│   ├── Ride.js
│   ├── BookingRequest.js
│   ├── Rating.js
│   └── Notification.js
│
├── hooks/                        # Custom React hooks
│   ├── useAuth.js                # Authentication state (client-side)
│   ├── useRides.js               # Ride data fetching with SWR
│   ├── useBookings.js            # Booking data fetching
│   ├── useNotifications.js       # Real-time notification updates
│   └── usePagination.js          # Pagination logic
│
├── context/                      # React Context (client-side state)
│   ├── AuthContext.jsx           # User authentication state
│   └── NotificationContext.jsx   # Toast/in-app notifications
│
├── styles/                       # Global styles
│   ├── globals.css
│   └── tailwind.config.js        # Tailwind CSS configuration
│
├── public/                       # Static assets
│   ├── images/
│   └── icons/
│
├── tests/
│   ├── unit/                     # Unit tests
│   │   ├── lib/
│   │   │   ├── auth.test.js
│   │   │   └── validators.test.js
│   │   └── services/
│   │       ├── auth.service.test.js
│   │       ├── rides.service.test.js
│   │       └── bookings.service.test.js
│   ├── api/                      # API route integration tests
│   │   ├── auth.api.test.js
│   │   ├── rides.api.test.js
│   │   └── bookings.api.test.js
│   └── e2e/                      # End-to-end tests (Playwright)
│       ├── auth.e2e.spec.js
│       ├── ride-creation.e2e.spec.js
│       ├── ride-booking.e2e.spec.js
│       └── full-workflow.e2e.spec.js
│
├── .env.local                    # Environment variables (local development)
├── .env.example                  # Environment template
├── .gitignore
├── package.json                  # Dependencies, scripts
├── jest.config.js                # Jest testing configuration
├── vitest.config.js              # Vitest configuration (optional)
├── playwright.config.js          # Playwright E2E configuration
├── next.config.js                # Next.js configuration (image optimization, etc.)
├── tsconfig.json                 # TypeScript configuration (recommended)
├── docker-compose.yml            # MongoDB + development services
├── Dockerfile                    # Production Docker image
└── README.md                     # Project setup and commands
```

**Structure Decision**: Full-stack Next.js monolith (Next.js App Router) selected. API Routes eliminate the need for a separate Express server, reducing deployment complexity. React Server Components (SSR) provide automatic performance optimization. File-based routing promotes clarity and maintainability. This structure enables rapid feature development with tighter frontend-backend integration, while still maintaining clear service layer separation for business logic.

## Technology Decision Rationale

### Frontend/Backend: Next.js 14.x with App Router
- **Why**: Unified full-stack framework eliminates separate frontend/backend deployment complexity. App Router provides file-based routing for clarity. React Server Components enable automatic code splitting and performance optimization. API Routes handle backend logic without separate Express setup. Built-in middleware for authentication. Strong TypeScript support recommended for type safety. Next.js ISG (Incremental Static Generation) enables efficient ride listing caching with dynamic revalidation.
- **Alternative Considered**: Separate React + Express (previous iteration) — requires two separate deployments, more operational overhead, but would allow independent scaling of frontend/backend. For MVP with expected 100-1000 concurrent users, unified deployment reduces complexity without scalability penalty.
- **Alternative Considered**: Remix — similar full-stack capability, but Next.js ecosystem and deployment options (Vercel native support) are more mature. Next.js maintained by Vercel with stronger ecosystem integration.

### Database: MongoDB 6.x with Mongoose ODM
- **Why**: Document model aligns naturally with JavaScript objects. Mongoose provides schema validation while retaining flexibility. Horizontal scalability and indexing support large ride listings (10k+). Aggregation pipeline simplifies complex queries for ride search/filtering. TTL indexes enable automatic notification cleanup.
- **Alternative Considered**: PostgreSQL — provides strict relational integrity but requires schema migrations for evolving requirements. MongoDB's flexibility better supports MVP iterative development where requirements may shift.
- **Alternative Considered**: Firebase (Firestore) — serverless alternative reduces DevOps overhead, but MongoDB provides more control over indexing/aggregation strategies required for complex ride search.

### Testing: Jest + Vitest + Playwright
- **Why**: Jest dominates Node.js/Next.js testing ecosystem, well-established for API route testing. Vitest provides faster feedback for component tests (leverages esbuild). Playwright enables cross-browser E2E testing aligned with accessibility standards (WCAG 2.1 AA verification).
- **Alternative Considered**: Mocha + Chai — lighter but requires more configuration. Jest's built-in mocking and coverage reporting reduce setup burden.

### Styling: Tailwind CSS
- **Why**: Utility-first CSS enables rapid component development while maintaining consistency. Built-in with Next.js. Large community support and ecosystem integration (UI components, plugins).
- **Alternative Considered**: CSS Modules — better scoping but higher verbosity. Tailwind better for MVP velocity.

### Data Fetching (Frontend): SWR
- **Why**: SWR (stale-while-revalidate) provides automatic cache revalidation for real-time ride listings updates. Built-in focus management, polling strategies, mutation patterns. Smaller bundle size than React Query while covering MVP data fetching needs.
- **Alternative Considered**: React Query (TanStack Query) — more powerful but adds unnecessary complexity for MVP-phase requirements. SWR sufficient for current scope.

## Implementation Approach

### Layered Architecture (Next.js Monolith)

```
┌─────────────────────────────────────┐
│    React Components (Browser)       │
│    ├─ Server Components (SSR)       │
│    └─ Client Components (hydration) │
└──────────────┬──────────────────────┘
               │ HTTP/REST
┌──────────────▼──────────────────────┐
│    Next.js API Routes (Backend)     │
│    ├─ Route Handlers                │
│    ├─ Middleware (Auth, Logging)    │
│    └─ Services (Business Logic)     │
└──────────────┬──────────────────────┘
               │ Mongoose Query
┌──────────────▼──────────────────────┐
│     MongoDB Database                │
│  (Collections: users, rides,        │
│   bookingRequests, ratings, etc.)   │
└─────────────────────────────────────┘
```

### Separation of Concerns

- **Pages** (`app/[route]/page.jsx`): User interface components rendered Server-Side (SSR) by default
- **API Routes** (`app/api/[route]/route.js`): HTTP endpoint handlers with request parsing
- **Services** (`services/`): Business logic isolated from route handlers
- **Models** (`models/`): Mongoose schema definitions and validation
- **Middleware** (`lib/auth.js`, `middleware.js`): Authentication, error handling, request logging
- **Utils** (`lib/`): Shared functions (JWT, validation rules, formatters)

This architecture enables:
- **Server Components**: Automatic code splitting, reduced client JavaScript burden
- **Independent Service Testing**: Business logic tested without HTTP layer
- **Clear API Contracts**: Routes define endpoint specifications in OpenAPI style
- **Authentication Enforcement**: Next.js middleware for automatic redirects to login for protected routes
- **Reusable Validation**: Joi schemas used in both API routes and client-side validation

### Client vs Server Rendering Strategy

- **Server Components** (by default): Pages like browse-rides (read-heavy), user profiles render server-side for SEO and performance
- **Incremental Static Generation (ISG)**: Ride listings page revalidated every 30-60 seconds (configurable) for optimal caching while staying fresh
- **Client Components**: Interactive components like forms, modals, real-time notifications marked with `'use client'`
- **API Routes**: All mutable operations (create, update, delete) handled through API routes with strict authorization checks

### API Design Pattern

All API routes follow REST conventions:
- `GET /api/rides` — List rides
- `POST /api/rides` — Create ride
- `GET /api/rides/[id]` — Get ride detail
- `PUT /api/rides/[id]` — Update ride
- `DELETE /api/rides/[id]` — Delete ride
- `POST /api/bookings/[id]/approve` — Approve booking
- Similar patterns for users, ratings, notifications

Consistent response format across all endpoints (success/error responses with appropriate HTTP status codes).

## Development Workflow

### Phase 1: Foundation (Stories 1-2 focus)
1. Set up Next.js project with App Router, Tailwind CSS, MongoDB connection
2. Implement authentication (register, login, logout) — API routes + Server Components
3. Create User schema with bcrypt password hashing
4. Implement Ride model and ride creation/edit endpoints
5. Frontend: Build auth pages (login, register), layout components
6. API contract testing validates auth and ride endpoints
7. SWR data fetching hooks for API communication

### Phase 2: Core Features (Story 3 focus)
1. Implement ride search/filter endpoints with MongoDB aggregation pipelines
2. Create ride listing pages (browse, search) using ISG for performance
3. Implement BookingRequest model and booking workflow
4. Frontend: Browse rides, ride detail, request to join forms
5. Integration tests validate search performance (<2s for 10k listings)
6. E2E tests verify user workflows: create ride → search → request to join

### Phase 3: Advanced Features (Stories 4-5 focus)
1. Implement request management endpoints (approve, reject)
2. Create Rating model and rating endpoints
3. Implement notification system (in-app + email via nodemailer)
4. Frontend: Request management page, profile, ratings
5. E2E tests validate complete workflows (request → approval → confirmation)

### Phase 4: Polish & Optimization
1. Performance profiling and optimization (Core Web Vitals)
2. Accessibility audit (WCAG 2.1 AA compliance)
3. Security review (password hashing, JWT, rate limiting, input sanitization)
4. ISG strategy tuning for ride listings cache revalidation
5. Production deployment: Docker container, environment configuration
6. Load testing and performance benchmarking

## Next Steps

This plan enables proceeding to:

1. **Phase 0: Research** → Create `research.md` documenting technology decisions, best practices, MongoDB schema patterns, Express middleware best practices
2. **Phase 1: Design** → Create `data-model.md` with MongoDB schemas, `contracts/` with OpenAPI endpoint specifications, `quickstart.md` with dev environment setup
3. **Phase 2: Tasks** → Generate detailed task breakdown mapping user stories to specific implementation tasks

---

**Status**: ✅ Ready for Phase 0 Research
