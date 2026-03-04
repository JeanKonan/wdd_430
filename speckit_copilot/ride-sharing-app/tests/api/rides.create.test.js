/**
 * Contract Tests: Ride Creation Endpoint
 * 
 * Tests the POST /api/rides endpoint with:
 * - Valid ride creation
 * - Validation error handling (future time, seat count, etc.)
 * - Authorization checks
 */

import { POST as createRideHandler } from '../../app/api/rides/route';
import Ride from '../../models/Ride';
import User from '../../models/User';
import * as auth from '../../lib/auth';

jest.mock('../../lib/db', () => ({
  connectDB: jest.fn().mockResolvedValue(),
}));
jest.mock('../../models/Ride');
jest.mock('../../models/User');
jest.mock('../../lib/auth');

describe('Ride Creation Endpoint (POST /api/rides)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a ride with valid data', async () => {
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 2);

    const mockUser = {
      _id: 'user123',
      email: 'driver@example.com',
      fullName: 'Test Driver',
      isActive: true,
    };

    const mockRide = {
      _id: 'ride123',
      driverId: 'user123',
      location: 'San Francisco',
      destination: 'Los Angeles',
      departureTime: futureDate,
      totalSeats: 4,
      availableSeats: 4,
      itinerary: 'Highway 101',
      status: 'Available',
      toJSON: () => ({
        _id: 'ride123',
        driverId: 'user123',
        location: 'San Francisco',
        destination: 'Los Angeles',
        departureTime: futureDate,
        totalSeats: 4,
        availableSeats: 4,
        itinerary: 'Highway 101',
        status: 'Available',
      }),
    };

    // Mock authentication
    auth.extractToken.mockReturnValue('valid-token');
    auth.verifyToken.mockReturnValue({ userId: 'user123' });

    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    Ride.create.mockResolvedValue(mockRide);

    const request = {
      json: jest.fn().mockResolvedValue({
        location: 'San Francisco',
        destination: 'Los Angeles',
        departureTime: futureDate.toISOString(),
        totalSeats: 4,
        availableSeats: 4,
        itinerary: 'Highway 101',
      }),
    };

    const response = await createRideHandler(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.ride._id).toBe('ride123');
    expect(data.data.ride.location).toBe('San Francisco');
  });

  it('should reject ride with past departure time', async () => {
    const pastDate = new Date();
    pastDate.setHours(pastDate.getHours() - 1);

    const mockUser = {
      _id: 'user123',
      email: 'driver@example.com',
      isActive: true,
    };

    auth.extractToken.mockReturnValue('valid-token');
    auth.verifyToken.mockReturnValue({ userId: 'user123' });

    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    const request = {
      json: jest.fn().mockResolvedValue({
        location: 'San Francisco',
        destination: 'Los Angeles',
        departureTime: pastDate.toISOString(),
        totalSeats: 4,
        availableSeats: 4,
      }),
    };

    const response = await createRideHandler(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.errors).toBeDefined();
  });

  it('should reject ride with invalid seat count (0)', async () => {
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 2);

    const mockUser = {
      _id: 'user123',
      email: 'driver@example.com',
      isActive: true,
    };

    auth.extractToken.mockReturnValue('valid-token');
    auth.verifyToken.mockReturnValue({ userId: 'user123' });

    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    const request = {
      json: jest.fn().mockResolvedValue({
        location: 'San Francisco',
        destination: 'Los Angeles',
        departureTime: futureDate.toISOString(),
        totalSeats: 0,
        availableSeats: 0,
      }),
    };

    const response = await createRideHandler(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.errors).toBeDefined();
  });

  it('should reject ride with seat count > 8', async () => {
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 2);

    const mockUser = {
      _id: 'user123',
      email: 'driver@example.com',
      isActive: true,
    };

    auth.extractToken.mockReturnValue('valid-token');
    auth.verifyToken.mockReturnValue({ userId: 'user123' });

    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    const request = {
      json: jest.fn().mockResolvedValue({
        location: 'San Francisco',
        destination: 'Los Angeles',
        departureTime: futureDate.toISOString(),
        totalSeats: 10,
        availableSeats: 10,
      }),
    };

    const response = await createRideHandler(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should reject ride with available seats > total seats', async () => {
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 2);

    const mockUser = {
      _id: 'user123',
      email: 'driver@example.com',
      isActive: true,
    };

    auth.extractToken.mockReturnValue('valid-token');
    auth.verifyToken.mockReturnValue({ userId: 'user123' });

    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    const request = {
      json: jest.fn().mockResolvedValue({
        location: 'San Francisco',
        destination: 'Los Angeles',
        departureTime: futureDate.toISOString(),
        totalSeats: 4,
        availableSeats: 5,
      }),
    };

    const response = await createRideHandler(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should reject request with missing authentication', async () => {
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 2);

    auth.extractToken.mockReturnValue(null);

    const request = {
      json: jest.fn().mockResolvedValue({
        location: 'San Francisco',
        destination: 'Los Angeles',
        departureTime: futureDate.toISOString(),
        totalSeats: 4,
        availableSeats: 4,
      }),
    };

    const response = await createRideHandler(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
  });
});
