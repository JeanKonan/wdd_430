---
description: "Prototype Task Breakdown for Ride-Sharing Web Application - MVP Focus"
---

# Prototype Tasks: Ride-Sharing Web Application (MVP)

**Branch**: `001-ride-sharing`  
**Date**: 2026-01-20  
**Scope**: User Stories 1-3 (Authentication, Create Rides, Browse & Book)  
**Timeline**: 2-week sprint for initial prototype  
**Input**: spec.md (5 user stories), plan.md (Next.js architecture), research.md (tech decisions)

## Overview

This is a **prototype-focused task breakdown** targeting only the critical MVP features: user authentication, ride creation, and ride discovery/booking. This allows rapid validation of core functionality with a 2-week timeline. Post-launch enhancements (ratings, request management, notifications) can be added incrementally.

**Prototype Exit Criteria**:
- Users can register, login, logout ✅
- Users can create rides with location/time/seats ✅
- Users can search/browse rides and request to join ✅
- Database persists all data ✅
- API contracts tested with E2E tests ✅
- Deployed and accessible online ✅

---

## Phase 1: Setup (Days 1-2)

**Goal**: Bootstrap Next.js project, configure database, establish project structure

### Setup Tasks

 - [X] T001 [P] Initialize Next.js 14 project with App Router, install dependencies (`npm create next-app@latest`)
  - File: `package.json`, `next.config.js`
  - Install: Next.js 14.x, React 18.x, Mongoose, bcrypt, jsonwebtoken, joi, swr
  - Result: Scaffolded `ride-sharing-app/` with Next.js App Router; installed `mongoose bcrypt jsonwebtoken joi swr`

 - [X] T002 [P] Set up MongoDB connection pool and environment configuration
  - File: `lib/db.js`, `.env.example`, `.env.local`
  - Add Mongoose connection with pooling, error handling
  - Result: Created `lib/db.js` with cached connection, added `.env.example` and `.env.local` with `MONGODB_URI` and `JWT_SECRET`; `.gitignore` already covers `.env*`

- [X] T003 [P] Configure Tailwind CSS and global styles for consistent UI
  - File: `app/layout.jsx`, `styles/globals.css`, `tailwind.config.js`
  - Create reusable component patterns (buttons, forms, cards)
  - Result: Installed tailwindcss, postcss, autoprefixer; created tailwind.config.js, postcss.config.js, app/globals.css with component patterns (buttons, forms, cards, alerts, badges); updated app/layout.jsx with header/footer and globals import; created app/page.jsx home page showcasing Tailwind styling

- [X] T004 [P] Set up ESLint and Prettier for code quality
  - File: `.eslintrc.js`, `.prettierrc.js`
  - Pre-commit hooks configured
  - Result: Created .eslintrc.json (Next.js core-web-vitals), .prettierrc.json (100 printWidth, singleQuote), .prettierignore; added npm scripts for lint and format; fixed postcss.config.js to use CommonJS syntax

- [X] T005 Create project directory structure (components, services, models, hooks, lib)
  - File: Root directory structure matching plan.md
  - Result: Created directories: lib/ (utils, auth, validators, db), components/ (auth/, rides/), models/, services/, hooks/, tests/ (api/, integration/); added README placeholders in each directory

- [X] T006 [P] Configure Jest for API route testing
  - File: `jest.config.js`
  - Add test database configuration
  - Result: Installed jest, @testing-library/react, @testing-library/jest-dom, jest-environment-jsdom; created jest.config.js with coverage thresholds and path aliases; created jest.setup.js with mocks for Next.js router and MongoDB; added npm test and test:ci scripts

---

## Phase 2: Authentication (Days 3-4)

**Goal**: User Story 1 — Users can register, login, logout  
**Acceptance**: Users can create account and authenticate successfully

### User Schema & Utilities

- [X] T007 Create User Mongoose schema with bcrypt hashing pre-hook
  - File: `models/User.js`
  - Fields: email (unique), password (hashed), fullName, phone, bio, averageRating, totalRidesCompleted
  - Result: Created User schema with email/password/fullName/phone/bio/averageRating/totalRidesCompleted fields; added bcrypt pre-save hook for password hashing; added comparePassword instance method; added toPublicJSON method; indexed email field; password field has select: false

- [X] T008 [P] Create authentication utilities (JWT token generation, password comparison)
  - File: `lib/auth.js`
  - Functions: generateToken, verifyToken, comparePassword
  - Result: Created auth utilities with generateToken (JWT with 7d expiry), verifyToken (with error handling for expired/invalid tokens), hashPassword, comparePassword (bcrypt), extractToken (from Bearer header or cookies), authenticateRequest (verify from request object)

- [X] T009 [P] Create input validation schemas for registration and login (Joi)
  - File: `lib/validators.js`
  - Schemas: registerSchema, loginSchema
  - Result: Created validation schemas with Joi: registerSchema (email, password with uppercase/lowercase/digit requirement, fullName, phone optional, bio optional), loginSchema (email, password), rideSchema (location, destination, departureTime future validation, availableSeats 1-8, totalSeats, itinerary optional); added validate() helper function with abortEarly: false

### API Routes (Backend)

- [X] T010 Create POST /api/auth/register endpoint with validation and error handling
  - File: `app/api/auth/register/route.js`
  - Test: User can register with valid email/password
  - Result: Created registration endpoint with Joi validation, duplicate email check (409 status), user creation with password auto-hashing, JWT generation, httpOnly cookie response (7 day expiry), public user JSON response (excluding password), MongoDB duplicate key error handling

- [X] T011 Create POST /api/auth/login endpoint with JWT token response
  - File: `app/api/auth/login/route.js`
  - Response: JWT token in httpOnly cookie
  - Result: Created login endpoint with Joi validation, user lookup with password field (+password select), isActive account check, password comparison via comparePassword method, JWT generation, httpOnly cookie (7 day expiry), public user JSON response, consistent 401 error message for security

- [X] T012 Create POST /api/auth/logout endpoint (clear cookie)
  - File: `app/api/auth/logout/route.js`
  - Result: Created logout endpoint that clears the token cookie by setting maxAge to 0, returns success message

- [X] T013 [P] Create authentication middleware for protected routes
  - File: `app/middleware.js`, `lib/auth.js`
  - Redirect unauthenticated users to login
  - Result: Created middleware.js at root level with protected routes array (/dashboard, /rides/create, /my-rides, /my-bookings), token verification via verifyToken, redirect to login with redirect query param, auth routes redirect to dashboard if already logged in (/login, /register), clears invalid tokens, matcher config excludes API routes and static files

### Frontend Pages & Components

- [X] T014 Create login page with form component
  - File: `app/(auth)/login/page.jsx`, `components/auth/LoginForm.jsx`
  - Fields: email, password; link to register page
  - Result: Created LoginForm component with email/password fields, form validation, error display, loading state, redirect parameter support (from middleware), POST to /api/auth/login, router.refresh() after success; created login page at app/login/page.jsx with centered layout, link to register and home

- [X] T015 Create registration page with form component
  - File: `app/(auth)/register/page.jsx`, `components/auth/RegisterForm.jsx`
  - Fields: email, password, fullName; validation feedback
  - Result: Created RegisterForm component with email/password/fullName fields, form validation, error display, loading state, password requirement hint, POST to /api/auth/register, router.refresh() after success; created register page at app/register/page.jsx with centered layout matching login page design, link to login and home

- [X] T016 Create protected dashboard page (redirect if not authenticated)
  - File: `app/(dashboard)/dashboard/page.jsx`
  - Shows authenticated user's name, options to create ride or browse rides
  - Result: Created dashboard page at app/dashboard/page.jsx with useAuth hook for authentication state, displays user's full name and email, logout button in header, navigation cards for Create Ride, Browse Rides, My Bookings, and My Rides with hover effects and icons

- [X] T017 [P] Create useAuth hook for client-side authentication state
  - File: `hooks/useAuth.js`
  - Functions: useAuth() returns {user, login, logout, isLoading}
  - Result: Created useAuth hook that fetches current user from /api/auth/me endpoint using SWR, manages authentication state, provides logout function, handles hydration safely with mounted check

### Testing

- [X] T018 Write contract test for registration endpoint (valid and invalid inputs)
  - File: `tests/api/auth.register.test.js`
  - Test: Valid registration, duplicate email, missing fields

- [X] T019 Write contract test for login endpoint (valid and invalid credentials)
  - File: `tests/api/auth.login.test.js`
  - Test: Valid login, invalid password, non-existent user

- [X] T020 [P] Write integration test for complete auth workflow (register → login)
  - File: `tests/api/auth.integration.test.js`

---

## Phase 3: Ride Creation (Days 5-6)

**Goal**: User Story 2 — Authenticated users can create and edit rides  
**Acceptance**: Users can post new rides and modify them

### Ride Schema

- [ ] T021 Create Ride Mongoose schema with validation
  - File: `models/Ride.js`
  - Fields: driverId (FK User), location, destination, departureTime, availableSeats, totalSeats, itinerary, status
  - Indexes: [location, destination, departureTime], [driverId]

- [ ] T022 [P] Create Ride validation schema (Joi)
  - File: `lib/validators.js` (add rideSchema)
  - Validation: Future departure time, seats 1-8, required fields

### API Routes (Backend)

- [ ] T023 Create POST /api/rides endpoint to create new ride
  - File: `app/api/rides/route.js` (POST)
  - Validate input, create ride, return ride object

- [ ] T024 Create GET /api/rides endpoint to list user's rides
  - File: `app/api/rides/route.js` (GET)
  - Filter: driverId = authenticated user

- [ ] T025 Create PUT /api/rides/[id] endpoint to edit ride
  - File: `app/api/rides/[id]/route.js` (PUT)
  - Validation: Only driver can edit, status must be "Available"

- [ ] T026 [P] Create DELETE /api/rides/[id] endpoint to cancel ride
  - File: `app/api/rides/[id]/route.js` (DELETE)

### Frontend Pages & Components

- [ ] T027 Create ride creation form component
  - File: `components/rides/RideForm.jsx`
  - Fields: departure location, destination, date/time picker, seats (1-8), itinerary

- [ ] T028 Create ride creation page
  - File: `app/(dashboard)/rides/create/page.jsx`
  - Form submission → POST /api/rides → redirect to my-rides

- [ ] T029 Create "My Rides" page showing user's created rides
  - File: `app/(dashboard)/my-rides/page.jsx`
  - List rides with edit/delete buttons, show available seats

- [ ] T030 [P] Create ride edit modal/page
  - File: `app/(dashboard)/rides/[id]/edit/page.jsx`
  - Pre-fill form with current ride data, allow modifications

### Testing

- [ ] T031 Write contract test for ride creation endpoint
  - File: `tests/api/rides.create.test.js`
  - Test: Valid ride, future time validation, invalid seats

- [ ] T032 Write contract test for ride edit endpoint
  - File: `tests/api/rides.update.test.js`
  - Test: Valid update, unauthorized user rejection

- [ ] T033 [P] Write integration test for create-ride workflow
  - File: `tests/api/rides.integration.test.js`

---

## Phase 4: Ride Discovery & Booking (Days 7-8)

**Goal**: User Story 3 — Users can search rides and request to join  
**Acceptance**: Passengers can find and book rides, ride creators see pending requests

### BookingRequest Schema

- [ ] T034 Create BookingRequest Mongoose schema
  - File: `models/BookingRequest.js`
  - Fields: rideId (FK Ride), passengerId (FK User), seatsRequested, status (Pending/Confirmed/Rejected)
  - Unique index: [rideId, passengerId]

### API Routes (Backend)

- [ ] T035 Create GET /api/rides/search endpoint with location/destination/date filtering
  - File: `app/api/rides/search/route.js`
  - Query params: location, destination, dateStart, dateEnd
  - Return: Paginated results, available seats, driver name

- [ ] T036 Create GET /api/rides/[id] endpoint to get ride details
  - File: `app/api/rides/[id]/route.js` (GET)
  - Include: Driver info, itinerary, available seats, confirmation count

- [ ] T037 Create POST /api/bookings endpoint to request ride
  - File: `app/api/bookings/route.js` (POST)
  - Validate: Available seats, user not already requesting ride
  - Create BookingRequest with status "Pending"

- [ ] T038 [P] Create GET /api/bookings/my-bookings endpoint
  - File: `app/api/bookings/my-bookings/route.js`
  - Filter: passengerId = authenticated user, return with ride details

- [ ] T039 Create GET /api/rides/[id]/requests endpoint (for ride creator)
  - File: `app/api/rides/[id]/requests/route.js`
  - List pending booking requests for this ride

### Frontend Pages & Components

- [ ] T040 Create ride search form component
  - File: `components/rides/RideSearchForm.jsx`
  - Fields: location, destination, date range, submit button

- [ ] T041 Create ride listing component showing search results
  - File: `components/rides/RideList.jsx`
  - Display: Driver, locations, time, available seats, "View Details" button

- [ ] T042 Create ride detail page with request-to-join form
  - File: `app/(dashboard)/rides/[id]/page.jsx`
  - Show: Full ride info, driver profile, seats selector, request button

- [ ] T043 [P] Create booking request form component
  - File: `components/bookings/BookingRequestForm.jsx`
  - Seats selector (1-available), submit button → POST /api/bookings

- [ ] T044 Create "Browse Rides" page with search and results
  - File: `app/(dashboard)/rides/page.jsx`
  - Integrate: RideSearchForm + RideList components

- [ ] T045 Create "My Bookings" page showing user's requests
  - File: `app/(dashboard)/my-bookings/page.jsx`
  - List: Ride details, driver, status (Pending/Confirmed/Rejected), date

### Testing

- [ ] T046 Write contract test for ride search endpoint
  - File: `tests/api/rides.search.test.js`
  - Test: Valid search, location filtering, pagination

- [ ] T047 Write contract test for booking request endpoint
  - File: `tests/api/bookings.create.test.js`
  - Test: Valid request, available seats validation, duplicate request prevention

- [ ] T048 [P] Write E2E test for complete booking workflow
  - File: `tests/e2e/booking.workflow.spec.js`
  - Scenario: User 1 creates ride → User 2 searches → User 2 requests → appears in User 1's requests

---

## Phase 5: Integration & Deployment (Days 9-10)

**Goal**: Connect all components, test end-to-end, deploy prototype

### Integration

- [ ] T049 Verify all API routes connect properly (no 404s, proper auth)
  - File: `tests/e2e/api.integration.spec.js`
  - Test: All endpoints respond correctly, auth middleware working

- [ ] T050 Test authentication flow across all protected pages
  - File: `tests/e2e/auth.protection.spec.js`
  - Test: Unauthenticated users redirect to login, authenticated users access dashboard

- [ ] T051 [P] Verify Tailwind CSS styling consistency across all pages
  - File: Manual testing, visual regression if available
  - Check: Forms, buttons, cards, spacing on mobile and desktop

### Performance & Optimization

- [ ] T052 Configure MongoDB indexes for ride search query performance
  - File: `models/Ride.js` (indexes)
  - Index: [location, destination, departureTime] for search queries

- [ ] T053 [P] Test ride search performance with mock 1000+ rides
  - File: `tests/performance/ride.search.test.js`
  - Goal: Search completes in <2 seconds

- [ ] T054 Add response caching headers to ride listing endpoints
  - File: `app/api/rides/search/route.js`, `app/api/rides/[id]/route.js`
  - Headers: Cache-Control for 30-60 second caching

### Testing & QA

- [ ] T055 Run full test suite (unit, integration, E2E)
  - All tests pass, coverage report generated
  - Target: 80% coverage for critical paths

- [ ] T056 [P] Manual testing checklist (complete user journey)
  - Checklist: Register → Login → Create Ride → Search Rides → Request Booking
  - Test on desktop and mobile browser

- [ ] T057 Security checklist (no obvious vulnerabilities)
  - Passwords hashed, JWT validated, SQL injection prevented, CORS configured

### Documentation

- [ ] T058 Write API documentation (endpoint list, request/response examples)
  - File: `docs/API.md`
  - Format: Markdown with curl examples

- [ ] T059 [P] Document known limitations and post-MVP enhancements
  - File: `docs/ROADMAP.md`
  - Items: Ratings, request management, notifications, payments

- [ ] T060 Create developer quick-start guide (how to run prototype)
  - File: `docs/DEV_SETUP.md`
  - Steps: Clone, npm install, .env.local, npm run dev

### Deployment

- [ ] T061 Configure Docker and docker-compose for production deployment
  - File: `Dockerfile`, `docker-compose.yml`
  - Include: Next.js app, MongoDB

- [ ] T062 [P] Deploy prototype to staging environment (e.g., Vercel, AWS)
  - Deploy: Next.js app to Vercel or EC2
  - Configure: Production environment variables, database URL

- [ ] T063 Verify deployed prototype is accessible and functional
  - Test: All core workflows work in production
  - Check: Performance, error handling, database connectivity

---

## Implementation Notes

### Development Flow (Test-First)

1. **Write Tests First** (T018-T020, T031-T033, etc.):
   - Define expected API contract in test
   - Test fails initially (RED phase)

2. **Implement Endpoints** (T010-T013, T023-T026, etc.):
   - Write minimal code to pass test (GREEN phase)
   - Refactor for clarity (REFACTOR phase)

3. **Connect Frontend** (T014-T017, T027-T030, etc.):
   - React components consume API endpoints
   - SWR hooks for data fetching

### File Paths & Naming

- **API Routes**: `/app/api/[resource]/[action]/route.js`
- **Pages**: `/app/(group)/[route]/page.jsx`
- **Components**: `/components/[category]/[Component].jsx`
- **Models**: `/models/[Entity].js` (Mongoose schemas)
- **Tests**: `/tests/[type]/[feature].test.js`

### Environment Setup

```env
# .env.local
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ride-sharing-dev
JWT_SECRET=dev-secret-min-32-chars
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

### Key Technologies (Prototype Stack)

- **Framework**: Next.js 14.x (App Router)
- **Database**: MongoDB 6.x local (Docker Compose)
- **Authentication**: JWT in httpOnly cookies
- **Frontend**: React 18 with Server Components
- **Data Fetching**: SWR for real-time updates
- **Styling**: Tailwind CSS
- **Testing**: Jest (API), Playwright (E2E)

---

## Prototype Success Criteria

✅ **By End of Phase 5**:
- User can register, login, logout
- User can create rides with location/time/seats
- User can search rides by location/destination
- User can request to join rides
- All data persists in MongoDB
- API contracts validated with tests
- Prototype deployed and accessible online
- Code follows constitution principles (Code Quality, Testing, UX, Performance)

---

## Post-Prototype Roadmap (Stories 4-5)

After prototype validation, add:

1. **Request Management** (Story 4)
   - Ride creators approve/reject booking requests
   - Confirmed passengers see driver contact
   - Notifications sent to passengers

2. **Ratings & Reviews** (Story 5)
   - Users rate each other after rides
   - Average ratings displayed on profiles
   - Trust badges for verified users

3. **Enhanced Features**
   - Real-time notifications (WebSocket instead of email)
   - In-app messaging
   - Ride cancellation policies
   - Payment integration
   - Multiple cities/regions

---

**Status**: Ready to begin Phase 1 setup. Estimated 2-week sprint for complete prototype.
