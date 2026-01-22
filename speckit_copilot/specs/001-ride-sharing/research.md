---
description: "Phase 0 Research - Technology Decisions and Best Practices for Ride-Sharing MVP"
---

# Research: Technology Decisions and Best Practices

**Input**: Plan.md technical context  
**Output**: Justification for all technology choices, best practices research, and open questions resolved  
**Date**: 2026-01-20

## Executive Summary

The Ride-Sharing Web Application uses a unified **Next.js 14.x full-stack** approach with **MongoDB 6.x** database. This research validates that Next.js provides superior developer experience for MVP development while maintaining enterprise-grade scalability. Key decisions prioritize:

1. **Simplified Deployment**: Single deployment unit (API Routes + React components) vs. separate frontend/backend
2. **Performance by Default**: React Server Components + ISG for automatic optimization
3. **Developer Productivity**: File-based routing, built-in middleware, integrated API routes
4. **Flexibility**: Mongoose ODM enables rapid schema iteration during MVP phase

---

## Technology Stack Decisions

### Decision: Full-Stack Next.js 14.x with App Router

**Decision**: Use Next.js 14.x with App Router (file-based routing) as unified frontend and backend.

**Rationale**:
- **Unified Development**: Single codebase, single deployment, single environment configuration
- **App Router**: File-based routing intuitive and scalable (compared to Pages Router)
- **React Server Components**: Enable automatic code splitting and reduced client-side JavaScript
- **API Routes**: `/app/api/[route]/route.js` files create REST endpoints without separate Express setup
- **Built-in Middleware**: Authentication, logging, CORS handled natively
- **Deployment Flexibility**: Works on traditional Node.js servers, Vercel (native), or containerized (Docker)

**Rejected Alternative: Separate React + Express**
- Requires two separate deployments (npm build frontend, node start backend)
- Two separate process managers (PM2 or systemd for both)
- Two separate dependency trees (debugging conflicts)
- Network latency between frontend and backend (not significant for MVP)
- **Better for**: Highly distributed teams, independent frontend/backend scaling after MVP

**Rejected Alternative: Next.js Pages Router**
- Pages Router (legacy) still functional but moving toward App Router deprecation
- App Router has better organization for `/app/api/` and `/app/(dashboard)/` route groups
- **Pages Router still valid**: If team more familiar with Pages Router syntax, minimal risk to use it

**Decision Confidence**: HIGH — Next.js dominance in full-stack JS ecosystem, strong community support, active maintenance

---

### Decision: React Server Components (SSR) by Default

**Decision**: Use React Server Components (SSR) for most pages. Only mark interactive components with `'use client'`.

**Rationale**:
- **Performance**: No JavaScript shipped for read-only pages (e.g., browse rides, user profiles)
- **Security**: Database queries execute server-side, eliminating exposure of DB connection strings
- **SEO**: Server-rendered HTML enables search engine crawling (important for ride listings)
- **Automatic Code Splitting**: Next.js analyzes dependencies and only ships necessary JS to client

**Implementation Pattern**:
```javascript
// app/rides/page.jsx - Server Component by default (no 'use client')
export default async function RidesPage() {
  const rides = await fetchRides(); // Runs server-side
  return <RideList rides={rides} />; // HTML sent to browser
}

// components/rides/RideSearchForm.jsx - Client Component (interactive form)
'use client';
export default function RideSearchForm() {
  const [location, setLocation] = useState(''); // Client-side state
  return <form>...</form>;
}
```

**Exception Cases for Client Components**:
- Forms requiring `useState` (search filters, creation forms)
- Real-time updates (SWR polling for new notifications)
- Modal dialogs and dropdowns
- Interactive feedback (click handlers, animations)

**Decision Confidence**: HIGH — Standard Next.js 13+ pattern, enables dramatic performance improvements

---

### Decision: Incremental Static Generation (ISG) for Ride Listings

**Decision**: Use ISG (revalidate every 30-60 seconds) for ride listings page (`/app/rides/page.jsx`).

**Rationale**:
- **Cache Hit Rate**: Most users browse previously-cached ride listings (high throughput, <100ms response)
- **Freshness**: 30-60 second revalidation ensures new rides appear within 1 minute (acceptable for MVP)
- **Database Load**: Dramatically reduces MongoDB query load vs. on-demand rendering
- **Scalability**: Handles traffic spikes gracefully (cache absorbs load)

**Implementation**:
```javascript
// app/rides/page.jsx
export const revalidate = 45; // Revalidate every 45 seconds

export default async function RidesPage() {
  const rides = await fetchRides(); // Cached unless revalidation triggered
  return <RideList rides={rides} />;
}
```

**On-Demand Revalidation** (when ride approved/rejected):
```javascript
// app/api/bookings/[id]/approve/route.js
import { revalidatePath } from 'next/cache';

export async function POST(req, context) {
  const booking = await approveBooking(context.params.id);
  revalidatePath('/rides'); // Force immediate cache invalidation
  return Response.json(booking);
}
```

**Alternative: Dynamic Rendering**: Render rides on every request (simpler but 100x slower at scale)

**Decision Confidence**: HIGH — ISG proven pattern for marketplace/listing applications

---

### Decision: SWR (Stale-While-Revalidate) for Client-Side Data Fetching

**Decision**: Use SWR library for real-time data synchronization on client components.

**Rationale**:
- **Automatic Revalidation**: Cache stale data immediately, revalidate in background
- **Built-in Polling**: `useBookings()` hook auto-refetch pending approvals every 5s
- **Focus Management**: Revalidate when user returns to tab (improved UX for notifications)
- **Smaller Bundle**: ~4KB gzipped (React Query ~12KB)
- **Sufficient for MVP**: Covers all current requirements (SWR limitation: no offline support, post-MVP consideration)

**Implementation**:
```javascript
// hooks/useBookings.js
import useSWR from 'swr';

export function useBookings() {
  const { data, error, isLoading } = useSWR(
    '/api/bookings/my-bookings',
    fetcher,
    { refetchInterval: 5000 } // Refetch every 5 seconds
  );
  return { bookings: data, loading: isLoading, error };
}
```

**Alternative: React Query**: More powerful but overkill for MVP. Upgrade path available post-MVP.

**Decision Confidence**: MEDIUM-HIGH — Suitable for MVP, potential migration to React Query if offline support needed

---

### Decision: MongoDB 6.x with Mongoose 7.x ODM

**Decision**: Use MongoDB 6.x as primary database with Mongoose 7.x for schema validation and queries.

**Rationale**:
- **Flexible Schema**: Ride itinerary (array of stops) maps naturally to MongoDB document structure
- **Mongoose Validation**: Pre-save hooks and validation rules enforce data integrity while enabling schema evolution
- **Indexing Strategy**: Compound indexes enable sub-2s searches on 10k+ ride listings
- **Aggregation Pipeline**: Complex queries (e.g., "rides matching my criteria grouped by driver") easier than SQL joins
- **Connection Pooling**: Mongoose handles connection pool management automatically
- **TTL Indexes**: Automatic deletion of old notifications (set once, runs automatically)

**Rejected Alternative: PostgreSQL**
- Strict schema requires migrations for adding optional fields (slower iteration during MVP)
- JSONB type alternative to documents but less natural for JavaScript developers
- Better option post-MVP if data integrity constraints become critical (e.g., financial transactions)

**Rejected Alternative: Firebase (Firestore)**
- Vendor lock-in (harder to migrate if requirements change)
- Less control over indexing strategies (potential performance issues at scale)
- Higher cost at scale (pay per operation)

**Database Design Principles**:
- Each collection has clear purpose (User, Ride, BookingRequest, Rating, Notification)
- Denormalization allowed for performance (average rating stored on User to avoid aggregation on every profile view)
- No cross-collection transactions (too complex for MVP phase)

**Decision Confidence**: HIGH — MongoDB + Mongoose standard in Node.js ecosystem

---

### Decision: Mongoose Pre-Hooks for Business Logic

**Decision**: Implement business logic in Mongoose pre-hooks (not in services) for password hashing and validation.

**Rationale**:
```javascript
// models/User.js
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
```

**Ensures**:
- Password always hashed before save (no way to accidentally skip hashing)
- Comparison method always available on User instances
- Consistency across all save operations (direct saves, updates, etc.)

**Limitation**: Pre-hooks run inside MongoDB transaction, so async operations should be kept minimal. Complex business logic stays in services.

**Decision Confidence**: HIGH — Mongoose standard pattern

---

## Performance Optimization Strategies

### MongoDB Indexing for Ride Search

**Challenge**: User searches "departure=Seattle, destination=Portland, date=2026-02-01" from 10k+ rides. Must complete in <2 seconds.

**Solution**: Compound index on `[location, destination, departureTime]`

```javascript
// models/Ride.js
rideSchema.index({ location: 1, destination: 1, departureTime: 1 });
rideSchema.index({ createdBy: 1 }); // For user's rides
rideSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL for future use
```

**Query Plan**:
```javascript
// services/rides.service.js
db.rides.find({
  location: 'Seattle',
  destination: 'Portland',
  departureTime: { $gte: new Date('2026-02-01') }
}).explain('executionStats');
// Should show: IXSCAN (index scan), not COLLSCAN (collection scan)
```

**Expected Performance**: <100ms for index scan + filtering (well under 2s target)

**Decision Confidence**: HIGH — Standard MongoDB indexing pattern

---

### Image Optimization with Next.js `next/image`

**Challenge**: User profile pictures and ride preview images loaded on every page (performance impact).

**Solution**: Use Next.js `Image` component for automatic optimization

```javascript
// components/common/ProfilePicture.jsx
import Image from 'next/image';

export default function ProfilePicture({ src, alt }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={64}
      height={64}
      priority={false} // Lazy-load by default
      sizes="(max-width: 640px) 32px, 64px"
    />
  );
}
```

**Automatically**:
- Converts to WebP (85% smaller)
- Lazy-loads below fold
- Responsive images served at correct resolution
- Prevents Cumulative Layout Shift (CLS)

**Decision Confidence**: HIGH — Next.js native feature

---

### API Response Caching Strategy

**Challenge**: Multiple clients requesting same rides repeatedly.

**Solution**: Conditional HTTP caching headers

```javascript
// app/api/rides/route.js
export async function GET(request) {
  const rides = await fetchRides();
  
  return Response.json(rides, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      // Public: can cache in CDN and browser
      // s-maxage=60: cache for 60s in CDN
      // stale-while-revalidate=300: serve stale for 5m while revalidating
    }
  });
}
```

**Result**: CDN (Cloudflare, Vercel Edge) caches response for 60s, eliminating database queries

**Decision Confidence**: HIGH — HTTP standard caching mechanism

---

## Security Considerations

### Password Hashing Strategy

**Decision**: bcrypt with cost factor 10 (balance between security and performance)

**Implementation**:
```javascript
import bcrypt from 'bcrypt';

// Registration
const hashed = await bcrypt.hash(password, 10); // 10 = rounds (2^10 iterations)

// Login verification
const isValid = await bcrypt.compare(candidatePassword, hashed);
```

**Why bcrypt**:
- Adaptive cost (increases difficulty as computers get faster)
- Salting automatic (no separate salt management)
- Timing-attack resistant (constant time comparison)

**Cost Factor Analysis**:
- Factor 8: ~40ms hash time (too fast, vulnerable to brute force)
- Factor 10: ~100ms hash time (acceptable, 10k guesses = 1000s = too slow for attacker)
- Factor 12: ~250ms hash time (slower registration/login, not worth for MVP)

**Decision Confidence**: HIGH — bcrypt industry standard for password hashing

---

### JWT Token Strategy

**Decision**: Stateless JWT tokens stored in httpOnly cookies (not localStorage)

**Rationale**:
```javascript
// Registration: Generate token
const token = jwt.sign(
  { userId: user._id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Store in httpOnly cookie (inaccessible to JavaScript, sent automatically by browser)
response.cookies.set('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS only
  sameSite: 'strict', // CSRF protection
  maxAge: 7 * 24 * 60 * 60 // 7 days
});
```

**Security Benefits**:
- httpOnly prevents XSS attacks (JavaScript cannot access cookie)
- sameSite prevents CSRF attacks (cookies sent only from same origin)
- Stateless tokens (don't require session database)
- Automatic expiration (7 days)

**Expired Token Handling**:
```javascript
// app/middleware.js
export function middleware(request) {
  const token = request.cookies.get('token');
  
  if (!token && isProtectedRoute(request.pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
```

**Decision Confidence**: HIGH — Stateless JWT with httpOnly cookies proven pattern

---

### Input Validation with Joi

**Decision**: Server-side validation with Joi for all API endpoints (not relying on client validation)

**Implementation**:
```javascript
// app/api/auth/register/route.js
import Joi from 'joi';

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  fullName: Joi.string().min(2).required(),
});

export async function POST(request) {
  const body = await request.json();
  const { error, value } = registerSchema.validate(body);
  
  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
  
  // Process validated data
  const user = await createUser(value);
  return Response.json(user);
}
```

**Protects Against**:
- SQL injection (N/A for MongoDB, but prevents NoSQL injection)
- XSS injection (sanitizes input before database storage)
- Type coercion attacks (ensures correct data types)
- Missing required fields (validation before database save)

**Client-Side Validation**: React Hook Form mirrors server schemas for UX (fail fast), but server validation is authoritative

**Decision Confidence**: HIGH — Server-side validation non-negotiable for security

---

## Development Workflow Best Practices

### Test-First Development (TDD)

**Approach**: Write failing contract tests before implementing API routes

**Example: Ride Creation**
```javascript
// tests/api/rides.api.test.js (write first)
describe('POST /api/rides', () => {
  it('creates a ride with valid input', async () => {
    const response = await fetch('/api/rides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        departure: 'Seattle',
        destination: 'Portland',
        departureTime: '2026-02-01T14:00:00Z',
        availableSeats: 4
      })
    });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.status).toBe('Available');
  });
});

// app/api/rides/route.js (implement second)
export async function POST(request) {
  const body = await request.json();
  const { error, value } = rideSchema.validate(body);
  
  if (error) return Response.json({ error: error.message }, { status: 400 });
  
  const ride = await Ride.create({ ...value, createdBy: userId });
  return Response.json(ride, { status: 201 });
}
```

**Red-Green-Refactor Cycle**:
1. **Red**: Test fails (endpoint doesn't exist yet)
2. **Green**: Implement minimal code to pass test
3. **Refactor**: Clean up, optimize, ensure Code Quality Excellence

**Decision Confidence**: HIGH — TDD mandatory per Constitution

---

### Environment Configuration Management

**Decision**: Use `.env.local` for development, `.env.production` for deployment

```javascript
// next.config.js
module.exports = {
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  }
};
```

**.env.local (development)**:
```
MONGODB_URI=mongodb://localhost:27017/ride-sharing
JWT_SECRET=dev-secret-not-for-production
NODE_ENV=development
```

**.env.production**:
```
MONGODB_URI=[production-connection-string]
JWT_SECRET=[generate-random-secret]
NODE_ENV=production
```

**Never commit secrets**: `.env.local` added to `.gitignore`

**Decision Confidence**: HIGH — Standard Next.js practice

---

## Open Questions Resolved

### Q1: How do we prevent duplicate ride bookings (two approvals for same request)?

**A**: MongoDB atomic update with `$inc` operator:
```javascript
// services/bookings.service.js
const result = await Ride.findByIdAndUpdate(
  rideId,
  { $inc: { availableSeats: -seatsRequested } },
  { new: true }
);

if (result.availableSeats < 0) {
  throw new Error('Not enough seats remaining');
}
```

This is atomic at database level (cannot race).

---

### Q2: How do we handle real-time notifications (user sees new booking request immediately)?

**A**: Phase 1: SWR polling every 5 seconds (acceptable for MVP). Phase 2 post-MVP: WebSocket integration with Socket.io if users report delays.

---

### Q3: How do we ensure ride search performance stays <2s as data grows?

**A**: MongoDB indexing strategy documented. Monitoring:
- New Relic or Datadog for slow query detection
- Database query profiling in development
- Load testing with 100k rides (Phase 4)

---

### Q4: Should we use TypeScript?

**A**: **Recommended but not required for MVP**. Suggested approach:
- Phase 1: JavaScript (faster initial development)
- Phase 2: Add TypeScript incrementally (new files, then migrate existing)
- Benefit: IDE autocompletion, type safety, reduced runtime errors

---

## Technology Stack Summary

| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| **Full-Stack** | Next.js | 14.x | SSR, API routes, ISG, file-based routing |
| **Frontend** | React | 18.x | Server Components reduce JS bundle |
| **Data Fetching** | SWR | 2.x | Stale-while-revalidate caching |
| **Styling** | Tailwind CSS | 3.x | Utility-first, rapid development |
| **Forms** | React Hook Form | 7.x | Minimal re-renders, easy validation |
| **Database** | MongoDB | 6.x | Flexible schema, document model aligns with JS |
| **ODM** | Mongoose | 7.x | Schema validation, pre-hooks |
| **Authentication** | bcrypt + JWT | Latest | Industry standard, secure |
| **Testing** | Jest | 29.x | Ecosystem standard for Node.js/Next.js |
| **E2E Testing** | Playwright | 1.x | Cross-browser, reliable selectors |
| **Deployment** | Docker | Latest | Containerization for consistent environments |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| **Next.js API Routes not performant** | LOW | MEDIUM | Load test with JMeter before Phase 2 |
| **MongoDB scaling limits (10k+ rides)** | LOW | MEDIUM | Indexing strategy proven, sharding available post-MVP |
| **ISG revalidation cache invalidation bugs** | MEDIUM | LOW | Thorough testing of `revalidatePath()` behavior |
| **JWT token expiration UX issues** | LOW | LOW | Refresh token strategy implemented early |
| **SWR polling overhead at scale** | LOW | MEDIUM | Monitor network requests, upgrade to WebSocket if needed |

---

## Next Steps

1. **Phase 1**: Create `data-model.md` with MongoDB schemas and indexing strategy
2. **Phase 1**: Create `contracts/api.md` with full REST API specifications
3. **Phase 1**: Create `quickstart.md` with development environment setup
4. **Phase 2**: Execute Phase 1 tasks (project setup, dependencies, linting)

---

**Status**: ✅ Phase 0 Research Complete — All technology decisions justified and open questions resolved. Ready for Phase 1 Design.
