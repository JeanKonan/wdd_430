# Data Model: MongoDB Schemas

**Date**: 2026-01-20 (Updated for Next.js stack)  
**Feature**: Ride-Sharing Web Application (001-ride-sharing)  
**Database**: MongoDB 6.x with Mongoose 7.x  
**Framework**: Next.js 14.x (API routes in `/app/api/`, models in `/models/`)

## Entity Relationship Diagram

```
┌─────────────────┐
│   User          │
├─────────────────┤
│ _id (PK)        │
│ email (unique)  │
│ fullName        │
│ averageRating   │◄────┐
└─────────────────┘     │
     ▲      │           │
     │      │ (1:M)     │
  (1:M) (1:M)           │ (M:1)
     │      ▼           │
┌─────────────────┐     │
│ Ride            │     │
├─────────────────┤     │
│ _id (PK)        │     │
│ driverId (FK)───┘     │
│ status          │     │
└─────────────────┘     │
     ▲                  │
     │ (1:M)            │
  (M:1)                 │
     │                  │
┌─────────────────┐     │
│ BookingRequest  │     │
├─────────────────┤     │
│ _id (PK)        │     │
│ rideId (FK)─────┘     │
│ passengerId (FK)──────┘
└─────────────────┘

┌─────────────────┐
│ Rating          │
├─────────────────┤
│ _id (PK)        │
│ rideId (FK)     │
│ rater_id (FK)   │◄────── User
│ ratee_id (FK)───┘────── User
└─────────────────┘

┌─────────────────┐
│ Notification    │
├─────────────────┤
│ _id (PK)        │
│ userId (FK)─────┘──── User
└─────────────────┘
```

---

## Schema Definitions

### User Schema

Represents a person using the platform. Can be a driver, passenger, or both.

```javascript
// models/User.js (Next.js)
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    // Authentication
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false // Don't return password by default in queries
    },
    
    // Profile
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    phoneNumber: {
      type: String,
      optional: true,
      match: [/^\+?1?\d{9,15}$/, 'Invalid phone number format']
    },
    bio: {
      type: String,
      default: '',
      maxlength: 500
    },
    
    // Ratings and verification
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRidesCompleted: {
      type: Number,
      default: 0,
      min: 0
    },
    totalRatings: {
      type: Number,
      default: 0,
      min: 0
    },
    verificationBadge: {
      type: String,
      enum: ['', 'trusted_driver', 'trusted_passenger'], // Empty string = no badge
      default: ''
    },
    
    // Email verification
    emailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: {
      type: String,
      default: null,
      select: false
    },
    
    // Account status
    accountStatus: {
      type: String,
      enum: ['active', 'suspended', 'deleted'],
      default: 'active'
    }
  },
  {
    timestamps: true, // Adds createdAt, updatedAt automatically
    collection: 'users'
  }
);

// Index on email for fast lookups
userSchema.index({ email: 1 });

// Middleware: Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method: Compare plain password with hashed
userSchema.methods.comparePassword = async function(plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

// Method: Update rating after new rating submitted
userSchema.methods.updateAverageRating = async function() {
  const Rating = require('./Rating');
  const ratings = await Rating.find({ ratee_id: this._id });
  
  this.totalRatings = ratings.length;
  this.averageRating = ratings.length > 0 
    ? ratings.reduce((sum, r) => sum + r.rating_score, 0) / ratings.length
    : 0;
  
  // Update badge based on ride history and rating
  if (this.totalRidesCompleted >= 10 && this.averageRating >= 4.0) {
    this.verificationBadge = this.totalRidesCompleted > 20 ? 'trusted_driver' : 'trusted_passenger';
  }
  
  await this.save();
};

module.exports = mongoose.model('User', userSchema);
```

**Key Features**:
- Email is unique and lowercase for case-insensitive lookup
- Password never returned in queries (select: false)
- Email verification tracked (FR-005 assumption: email verification required to create rides)
- Ratings denormalized for performance (recalculated on each new rating)
- Badge logic determines "Trusted" status based on ride count + rating
- Pre-save middleware hashes password automatically (security best practice)

---

### Ride Schema

Represents a single ride offering created by a driver.

```javascript
// models/Ride.js (Next.js)
const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema(
  {
    // Driver
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    // Location and timing
    departureLocation: {
      type: String,
      required: true,
      trim: true
    },
    destinationLocation: {
      type: String,
      required: true,
      trim: true
    },
    departureDateTime: {
      type: Date,
      required: true,
      validate: {
        validator: function(value) {
          return value > new Date(); // Must be in the future
        },
        message: 'Departure time must be in the future'
      }
    },
    
    // Seats
    totalSeats: {
      type: Number,
      required: true,
      min: 1,
      max: 8 // FR-006: max 8 seats
    },
    seatsReserved: {
      type: Number,
      default: 0,
      min: 0
    },
    // Calculated on query: availableSeats = totalSeats - seatsReserved
    
    // Itinerary (list of stops/waypoints)
    itinerary: [
      {
        order: Number,
        location: String,
        estimatedArrivalTime: Date,
        description: String // e.g., "pickup at downtown station"
      }
    ],
    
    // Ride status
    status: {
      type: String,
      enum: ['available', 'in_progress', 'completed', 'cancelled'],
      default: 'available'
    },
    
    // Optional: ride cost (future feature)
    estimatedCost: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true,
    collection: 'rides'
  }
);

// Compound index for ride search (most common query)
rideSchema.index({ departureLocation: 1, destinationLocation: 1, departureDateTime: 1 });
// Single index for "my rides" queries
rideSchema.index({ driverId: 1, departureDateTime: -1 });

// Virtual: available seats (not stored, calculated)
rideSchema.virtual('availableSeats').get(function() {
  return this.totalSeats - this.seatsReserved;
});

// Method: Check if ride is full
rideSchema.methods.isFull = function() {
  return this.seatsReserved >= this.totalSeats;
};

// Method: Reserve seats (called when booking approved)
rideSchema.methods.reserveSeats = async function(numberOfSeats) {
  if (this.availableSeats < numberOfSeats) {
    throw new Error('Not enough available seats');
  }
  this.seatsReserved += numberOfSeats;
  await this.save();
};

// Method: Release seats (called if booking rejected/cancelled)
rideSchema.methods.releaseSeats = async function(numberOfSeats) {
  this.seatsReserved = Math.max(0, this.seatsReserved - numberOfSeats);
  await this.save();
};

// Pre-query middleware: auto-transition to 'in_progress' if departure time passed
rideSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function(next) {
  const now = new Date();
  this.updateMany({ departureDateTime: { $lte: now }, status: 'available' }, { status: 'in_progress' });
  next();
});

module.exports = mongoose.model('Ride', rideSchema);
```

**Key Features**:
- Compound index on location + date for efficient ride search (FR-009 performance target: <2 sec for 10k listings)
- `seatsReserved` tracked (available = total - reserved) — enables transactional booking
- Itinerary is array of waypoints (supports complex routes)
- Virtual `availableSeats` computed on read without storing extra data
- Pre-query hook auto-transitions rides to 'in_progress' when departure time passes (FR-007 edge case)

---

### BookingRequest Schema

Represents a passenger's request to join a ride.

```javascript
// models/BookingRequest.js (Next.js)
const mongoose = require('mongoose');

const bookingRequestSchema = new mongoose.Schema(
  {
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: true
    },
    passengerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    seatsRequested: {
      type: Number,
      required: true,
      min: 1,
      max: 8
    },
    
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'cancelled'],
      default: 'pending'
    },
    
    // Timestamps for request lifecycle
    requestedAt: {
      type: Date,
      default: Date.now
    },
    respondedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    collection: 'booking_requests'
  }
);

// Unique index: one request per passenger per ride
bookingRequestSchema.index({ rideId: 1, passengerId: 1 }, { unique: true });
// Index for "pending requests for this ride" queries
bookingRequestSchema.index({ rideId: 1, status: 1 });
// Index for "my booking requests" queries
bookingRequestSchema.index({ passengerId: 1, status: 1 });

module.exports = mongoose.model('BookingRequest', bookingRequestSchema);
```

**Key Features**:
- Unique compound index prevents duplicate requests from same passenger on same ride (FR-010 edge case)
- Status enum clearly defines booking lifecycle (FR-011)
- Timestamps track when request was made and when it was responded to

---

### Rating Schema

Represents a user rating/review of another user after ride completion.

```javascript
// models/Rating.js (Next.js)
const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: true
    },
    
    raterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    ratingScore: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      enum: [1, 2, 3, 4, 5]
    },
    
    reviewText: {
      type: String,
      default: '',
      maxlength: 1000
    }
  },
  {
    timestamps: true,
    collection: 'ratings'
  }
);

// Unique index: one rating per person per ride
ratingSchema.index({ rideId: 1, raterId: 1, rateeId: 1 }, { unique: true });
// Index for "reviews about this user" queries
ratingSchema.index({ rateeId: 1, createdAt: -1 });

// Post-save middleware: update ratee's average rating
ratingSchema.post('save', async function(doc) {
  const User = require('./User');
  const ratee = await User.findById(doc.rateeId);
  if (ratee) {
    await ratee.updateAverageRating();
  }
});

module.exports = mongoose.model('Rating', ratingSchema);
```

**Key Features**:
- Unique compound index prevents multiple ratings from same user to same user per ride
- Post-save hook automatically updates ratee's average rating (triggers badge logic)
- Reviews sorted by most recent (descending createdAt)

---

### Notification Schema

Represents system-generated notifications to users.

```javascript
// models/Notification.js (Next.js)
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    notificationType: {
      type: String,
      enum: ['booking_confirmed', 'booking_rejected', 'booking_cancelled', 'ride_updated', 'rating_received'],
      required: true
    },
    
    // Denormalized ride info (for quick display without joins)
    relatedRideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      default: null
    },
    
    // Denormalized user info (who sent the notification)
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    
    message: {
      type: String,
      required: true
    },
    
    readAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    collection: 'notifications'
  }
);

// TTL index: auto-delete notifications after 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });
// Index for "user's notifications" queries
notificationSchema.index({ userId: 1, readAt: 1, createdAt: -1 });

// Method: mark as read
notificationSchema.methods.markAsRead = async function() {
  this.readAt = new Date();
  await this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);
```

**Key Features**:
- TTL index auto-deletes old notifications (30-day retention)
- Denormalized ride/user info for fast display
- Index enables "unread notifications" queries efficiently

---

## Indexing Strategy for Performance

### Query Patterns and Indexes

| User Story | Query Pattern | Index | Why |
|-----------|---------------|-------|-----|
| Story 3: Browse rides | Find rides by location + date | `{ departureLocation, destinationLocation, departureDateTime }` | Most common query; compound index avoids full collection scan |
| Story 2: My rides | Find rides by driver + date | `{ driverId, departureDateTime }` | Driver needs to view their rides quickly |
| Story 4: Pending requests | Find pending requests by ride | `{ rideId, status }` | Driver checks pending requests frequently |
| Story 4: My bookings | Find bookings by passenger | `{ passengerId, status }` | Passenger checks booking status frequently |
| Story 1: Unique email | Find user by email | `{ email: 1 }` | Registration must check email uniqueness instantly |
| Story 5: User profile | Find ratings about user | `{ rateeId, createdAt }` | Display reviews sorted by recency |

### Index Creation

```javascript
// backend/src/models/Ride.js
// Create on startup (idempotent)
rideSchema.index({ departureLocation: 1, destinationLocation: 1, departureDateTime: 1 });
rideSchema.index({ driverId: 1, departureDateTime: -1 });

// backend/src/models/BookingRequest.js
bookingRequestSchema.index({ rideId: 1, status: 1 });
bookingRequestSchema.index({ passengerId: 1, status: 1 });
bookingRequestSchema.index({ rideId: 1, passengerId: 1 }, { unique: true });

// backend/src/models/User.js
userSchema.index({ email: 1 });

// backend/src/models/Rating.js
ratingSchema.index({ rateeId: 1, createdAt: -1 });
```

---

## Data Validation and Constraints

### Application-Level Validation (Mongoose Schemas)

- **Required fields**: email, password, fullName (User), departureLocation, destinationLocation, etc. (Ride)
- **Data type validation**: Numbers for seats (0-8), Dates for departure time, enums for status
- **Business rule validation**: 
  - Departure time must be in future (Ride schema validator)
  - Password >= 8 characters with uppercase, lowercase, numbers (User schema regex)
  - Email format validated with regex
  - Unique email constraint (unique index)
  - Unique booking request per passenger per ride

### Database-Level Constraints

- **Unique indexes**: Email (User), compound ride-passenger (BookingRequest)
- **Foreign keys**: Mongoose ref fields maintain referential integrity (with populate())
- **TTL indexes**: Auto-delete old notifications

---

## Migration Strategy

### Initial Setup (MVP)

```bash
# 1. Create collections (Mongoose auto-creates on first save)
# 2. Create indexes programmatically or manually
db.rides.createIndex({ departureLocation: 1, destinationLocation: 1, departureDateTime: 1 })
db.bookingRequests.createIndex({ rideId: 1, passengerId: 1 }, { unique: true })
```

### Adding New Fields (Post-MVP)

If field is optional with default value, no migration needed:
```javascript
// Just add to schema; existing documents get default value
newOptionalField: { type: String, default: '' }
```

If field is required or needs data transformation:
```javascript
// Use MongoDB script to backfill
db.rides.updateMany(
  { estimatedCost: { $exists: false } },
  { $set: { estimatedCost: 0 } }
)
```

---

**Status**: ✅ Schemas defined and indexed. Ready for API contract generation.
