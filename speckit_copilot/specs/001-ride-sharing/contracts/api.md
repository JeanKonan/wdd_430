# REST API Contracts: Ride-Sharing Web Application

**Date**: 2026-01-20 (Updated for Next.js API Routes)  
**Feature**: Ride-Sharing Web Application (001-ride-sharing)  
**Format**: OpenAPI 3.0 specification  
**Implementation**: Next.js 14.x API Routes (`/app/api/`)

## Base URL

```
Development: http://localhost:3000/api
Production: https://ride-sharing.example.com/api
```

**Note**: Next.js development server runs on port 3000 by default (vs. Express on 5000)

## Authentication

All endpoints except `/auth/register` and `/auth/login` require a JWT token in the Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

## Response Format

All API responses follow this structure:

### Success Response (200, 201)
```json
{
  "success": true,
  "data": { /* actual response object */ },
  "message": "Operation successful"
}
```

### Error Response (4xx, 5xx)
```json
{
  "success": false,
  "error": "ErrorType",
  "message": "Human-readable error message",
  "statusCode": 400,
  "details": [
    { "field": "fieldName", "message": "Field-specific error" }
  ]
}
```

---

## Authentication Endpoints

### POST /auth/register

Register a new user account.

**User Story**: Story 1 - User Registration and Authentication (FR-001)

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "fullName": "John Doe"
}
```

**Validation**:
- Email: must be valid email format, must not already exist
- Password: minimum 8 characters, must include uppercase, lowercase, and numbers
- fullName: required, max 100 characters

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "userId": "60d5ec49c1234567890abcde",
    "email": "user@example.com",
    "fullName": "John Doe",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  },
  "message": "User registered successfully"
}
```

**Error (400)**:
```json
{
  "success": false,
  "error": "ValidationError",
  "statusCode": 400,
  "details": [
    { "field": "email", "message": "Email already exists" },
    { "field": "password", "message": "Password must contain uppercase letter" }
  ]
}
```

---

### POST /auth/login

Authenticate user with email and password.

**User Story**: Story 1 - User Registration and Authentication (FR-004)

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "userId": "60d5ec49c1234567890abcde",
    "email": "user@example.com",
    "fullName": "John Doe",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  },
  "message": "Login successful"
}
```

**Error (401)**:
```json
{
  "success": false,
  "error": "AuthenticationError",
  "message": "Invalid credentials",
  "statusCode": 401
}
```

---

### POST /auth/logout

Logout current user and invalidate session.

**User Story**: Story 1 - User Registration and Authentication (FR-020)

**Request**: No body

**Response (200)**:
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Ride Endpoints

### POST /rides

Create a new ride.

**User Story**: Story 2 - Create and Edit Rides (FR-004)

**Request**:
```json
{
  "departureLocation": "Seattle, WA",
  "destinationLocation": "Portland, OR",
  "departureDateTime": "2026-02-01T14:00:00Z",
  "totalSeats": 4,
  "itinerary": [
    {
      "order": 1,
      "location": "Seattle Pike Place Market",
      "estimatedArrivalTime": "2026-02-01T14:00:00Z",
      "description": "Starting point"
    },
    {
      "order": 2,
      "location": "Portland Downtown",
      "estimatedArrivalTime": "2026-02-01T18:00:00Z",
      "description": "Final destination"
    }
  ]
}
```

**Validation**:
- departureDateTime: must be in the future
- totalSeats: must be 1-8
- departureLocation, destinationLocation: required, non-empty strings
- itinerary: array of at least 2 waypoints

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "rideId": "60d5ec49c1234567890abcde",
    "driverId": "60d5ec49c1234567890abcdf",
    "departureLocation": "Seattle, WA",
    "destinationLocation": "Portland, OR",
    "departureDateTime": "2026-02-01T14:00:00Z",
    "totalSeats": 4,
    "seatsReserved": 0,
    "availableSeats": 4,
    "status": "available",
    "itinerary": [/*...*/],
    "createdAt": "2026-01-15T10:00:00Z"
  },
  "message": "Ride created successfully"
}
```

---

### GET /rides

Browse and search for available rides.

**User Story**: Story 3 - Browse and Book Available Rides (FR-009)

**Query Parameters**:
- `departureLocation` (string, required): Starting location
- `destinationLocation` (string, required): Destination
- `date` (string, ISO date, required): Travel date (YYYY-MM-DD)
- `sort` (string, optional): Sort field (`departure_time`, `available_seats`), default: `departure_time`
- `order` (string, optional): `asc` or `desc`, default: `asc`
- `limit` (number, optional): Results per page, default: 10, max: 100
- `offset` (number, optional): Pagination offset, default: 0

**Example Request**:
```
GET /api/rides?departureLocation=Seattle&destinationLocation=Portland&date=2026-02-01&sort=departure_time&order=asc&limit=10&offset=0
```

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "rideId": "60d5ec49c1234567890abcde",
      "driverId": "60d5ec49c1234567890abcdf",
      "driver": {
        "userId": "60d5ec49c1234567890abcdf",
        "fullName": "Jane Driver",
        "averageRating": 4.8
      },
      "departureLocation": "Seattle, WA",
      "destinationLocation": "Portland, OR",
      "departureDateTime": "2026-02-01T14:00:00Z",
      "availableSeats": 3,
      "status": "available",
      "estimatedCost": 45
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 42,
    "hasMore": true
  },
  "message": "Rides found"
}
```

**Error (400)**: If no matching rides
```json
{
  "success": true,
  "data": [],
  "pagination": { "total": 0 },
  "message": "No rides found matching criteria"
}
```

---

### GET /rides/:rideId

Get detailed information about a specific ride.

**User Story**: Story 3 - Browse and Book Available Rides

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "rideId": "60d5ec49c1234567890abcde",
    "driverId": "60d5ec49c1234567890abcdf",
    "driver": {
      "userId": "60d5ec49c1234567890abcdf",
      "fullName": "Jane Driver",
      "averageRating": 4.8,
      "totalRidesCompleted": 25,
      "verificationBadge": "trusted_driver"
    },
    "departureLocation": "Seattle, WA",
    "destinationLocation": "Portland, OR",
    "departureDateTime": "2026-02-01T14:00:00Z",
    "totalSeats": 4,
    "seatsReserved": 1,
    "availableSeats": 3,
    "status": "available",
    "itinerary": [
      { "order": 1, "location": "Seattle Pike Place", "estimatedArrivalTime": "2026-02-01T14:00:00Z" },
      { "order": 2, "location": "Portland Downtown", "estimatedArrivalTime": "2026-02-01T18:00:00Z" }
    ],
    "createdAt": "2026-01-15T10:00:00Z"
  },
  "message": "Ride details retrieved"
}
```

---

### PUT /rides/:rideId

Edit an existing ride (only if no confirmed bookings).

**User Story**: Story 2 - Create and Edit Rides (FR-007)

**Request**: Same structure as POST /rides

**Authorization**: Only ride creator (driverId) can edit

**Response (200)**: Updated ride object

**Error (403)**:
```json
{
  "success": false,
  "error": "AuthorizationError",
  "message": "You can only edit your own rides",
  "statusCode": 403
}
```

**Error (400)**:
```json
{
  "success": false,
  "error": "ValidationError",
  "message": "Cannot edit ride with confirmed bookings",
  "statusCode": 400
}
```

---

### DELETE /rides/:rideId

Cancel/delete a ride.

**User Story**: Story 2 - Create and Edit Rides (FR-008)

**Authorization**: Only ride creator can delete

**Response (200)**:
```json
{
  "success": true,
  "message": "Ride cancelled successfully"
}
```

---

## Booking Request Endpoints

### POST /bookings

Request to join a ride.

**User Story**: Story 3 - Browse and Book Available Rides (FR-010)

**Request**:
```json
{
  "rideId": "60d5ec49c1234567890abcde",
  "seatsRequested": 2
}
```

**Validation**:
- seatsRequested: 1-8, must not exceed availableSeats
- Cannot book your own ride

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "requestId": "60d5ec49c1234567890abce0",
    "rideId": "60d5ec49c1234567890abcde",
    "passengerId": "60d5ec49c1234567890abce1",
    "seatsRequested": 2,
    "status": "pending",
    "requestedAt": "2026-01-15T10:30:00Z"
  },
  "message": "Booking request submitted"
}
```

---

### GET /bookings

Get user's booking requests (as passenger).

**User Story**: Story 3 - Browse and Book Available Rides (FR-005)

**Query Parameters**:
- `status` (string, optional): Filter by status (`pending`, `confirmed`, `rejected`)
- `sort` (string, optional): `requested_at` or `departure_time`, default: `requested_at`

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "requestId": "60d5ec49c1234567890abce0",
      "rideId": "60d5ec49c1234567890abcde",
      "ride": {
        "departureLocation": "Seattle, WA",
        "destinationLocation": "Portland, OR",
        "departureDateTime": "2026-02-01T14:00:00Z",
        "driver": {
          "userId": "60d5ec49c1234567890abcdf",
          "fullName": "Jane Driver",
          "phoneNumber": "+1-555-0123"
        }
      },
      "seatsRequested": 2,
      "status": "confirmed",
      "requestedAt": "2026-01-15T10:30:00Z",
      "respondedAt": "2026-01-15T10:45:00Z"
    }
  ],
  "message": "Booking requests retrieved"
}
```

---

### GET /rides/:rideId/bookings

Get all booking requests for a ride (driver only).

**User Story**: Story 4 - Manage Ride Requests and Confirmations (FR-012)

**Authorization**: Only ride creator can view

**Query Parameters**:
- `status` (string, optional): Filter by status (`pending`, `confirmed`, `rejected`)

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "requestId": "60d5ec49c1234567890abce0",
      "passengerId": "60d5ec49c1234567890abce1",
      "passenger": {
        "userId": "60d5ec49c1234567890abce1",
        "fullName": "John Passenger",
        "averageRating": 4.2
      },
      "seatsRequested": 2,
      "status": "pending",
      "requestedAt": "2026-01-15T10:30:00Z"
    }
  ],
  "message": "Booking requests retrieved"
}
```

---

### POST /bookings/:requestId/approve

Approve a booking request.

**User Story**: Story 4 - Manage Ride Requests and Confirmations (FR-013)

**Authorization**: Only ride creator can approve

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "requestId": "60d5ec49c1234567890abce0",
    "status": "confirmed",
    "respondedAt": "2026-01-15T10:45:00Z"
  },
  "message": "Booking request approved"
}
```

**Error (400)**: If approving would exceed available seats (FR-014)
```json
{
  "success": false,
  "error": "ValidationError",
  "message": "Not enough available seats",
  "statusCode": 400
}
```

---

### POST /bookings/:requestId/reject

Reject a booking request.

**User Story**: Story 4 - Manage Ride Requests and Confirmations (FR-013)

**Request** (optional):
```json
{
  "reason": "I found another passenger"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "requestId": "60d5ec49c1234567890abce0",
    "status": "rejected",
    "respondedAt": "2026-01-15T10:45:00Z"
  },
  "message": "Booking request rejected"
}
```

---

## User / Profile Endpoints

### GET /users/:userId

Get user profile information.

**User Story**: Story 5 - User Profiles and Ratings (FR-016)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "userId": "60d5ec49c1234567890abcdf",
    "fullName": "Jane Driver",
    "phoneNumber": "+1-555-0123",
    "bio": "Experienced driver, always on time",
    "averageRating": 4.8,
    "totalRidesCompleted": 25,
    "totalRatings": 24,
    "verificationBadge": "trusted_driver",
    "createdAt": "2025-06-01T08:00:00Z"
  },
  "message": "User profile retrieved"
}
```

---

### GET /users/:userId/ratings

Get user's ratings and reviews.

**User Story**: Story 5 - User Profiles and Ratings

**Query Parameters**:
- `limit` (number, optional): default 10, max 50
- `offset` (number, optional): default 0

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "ratingId": "60d5ec49c1234567890abce2",
      "rater": {
        "userId": "60d5ec49c1234567890abce3",
        "fullName": "John Passenger"
      },
      "ratingScore": 5,
      "reviewText": "Great driver, very professional and friendly!",
      "createdAt": "2026-01-10T15:30:00Z"
    }
  ],
  "pagination": { "limit": 10, "offset": 0, "total": 24 },
  "message": "Ratings retrieved"
}
```

---

### POST /users/:rideId/ratings

Rate and review another user after ride completion.

**User Story**: Story 5 - User Profiles and Ratings (FR-017)

**Request**:
```json
{
  "rateeId": "60d5ec49c1234567890abcdf",
  "ratingScore": 5,
  "reviewText": "Great driver, very professional!"
}
```

**Validation**:
- ratingScore: must be 1-5
- Can only rate after ride is completed
- Cannot rate yourself
- One rating per person per ride

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "ratingId": "60d5ec49c1234567890abce2",
    "rateeId": "60d5ec49c1234567890abcdf",
    "ratingScore": 5,
    "reviewText": "Great driver, very professional!",
    "createdAt": "2026-01-15T16:00:00Z"
  },
  "message": "Rating submitted"
}
```

---

## Notification Endpoints

### GET /notifications

Get user's notifications.

**User Story**: Story 4 - Manage Ride Requests and Confirmations (FR-021)

**Query Parameters**:
- `unreadOnly` (boolean, optional): default false
- `limit` (number, optional): default 20
- `offset` (number, optional): default 0

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "notificationId": "60d5ec49c1234567890abce4",
      "notificationType": "booking_confirmed",
      "message": "Your booking for Jane's ride has been confirmed",
      "relatedRideId": "60d5ec49c1234567890abcde",
      "fromUser": {
        "userId": "60d5ec49c1234567890abcdf",
        "fullName": "Jane Driver"
      },
      "readAt": null,
      "createdAt": "2026-01-15T10:45:00Z"
    }
  ],
  "pagination": { "limit": 20, "offset": 0, "total": 5 },
  "message": "Notifications retrieved"
}
```

---

### POST /notifications/:notificationId/read

Mark a notification as read.

**Request**: No body

**Response (200)**:
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| ValidationError | 400 | Input validation failed |
| AuthenticationError | 401 | Invalid credentials or missing JWT |
| AuthorizationError | 403 | User lacks permission for this resource |
| NotFoundError | 404 | Resource not found |
| ConflictError | 409 | Resource already exists or conflict with current state |
| InternalServerError | 500 | Unexpected server error |

---

**Status**: ✅ API contracts defined. Ready for quickstart.md
