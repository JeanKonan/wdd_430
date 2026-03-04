/**
 * Contract Tests: Ride Update & Delete Endpoints
 * 
 * Tests the PUT /api/rides/[id] and DELETE /api/rides/[id] endpoints with:
 * - Valid ride update
 * - Authorization checks (only driver can edit)
 * - Status validation (only Available rides can be edited)
 * - Valid ride cancellation
 */

import { PUT as updateRideHandler, DELETE as deleteRideHandler } from '@/app/api/rides/[id]/route';
import Ride from '@/models/Ride';
import User from '@/models/User';
import * as auth from '@/lib/auth';

jest.mock('@/lib/db', () => ({
  connectDB: jest.fn().mockResolvedValue(),
}));
jest.mock('@/models/Ride');
jest.mock('@/models/User');
jest.mock('@/lib/auth');

describe('Ride Update & Delete Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PUT /api/rides/[id]', () => {
    it('should update a ride with valid data', async () => {
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
        save: jest.fn().mockResolvedValue(),
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

      auth.extractToken.mockReturnValue('valid-token');
      auth.verifyToken.mockReturnValue({ userId: 'user123' });

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      Ride.findById.mockResolvedValue(mockRide);

      const newFutureDate = new Date();
      newFutureDate.setHours(newFutureDate.getHours() + 4);

      const request = {
        json: jest.fn().mockResolvedValue({
          location: 'San Jose',
          destination: 'San Diego',
          departureTime: newFutureDate.toISOString(),
          totalSeats: 5,
          availableSeats: 5,
          itinerary: 'Updated route',
        }),
      };

      const response = await updateRideHandler(request, { params: { id: 'ride123' } });
      const data = await response.json();

      if (response.status !== 200) {
        console.log('Unexpected response:', data);
      }

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockRide.save).toHaveBeenCalled();
    });

    it('should reject update from non-driver user', async () => {
      const mockRide = {
        _id: 'ride123',
        driverId: 'different-driver',
        status: 'Available',
      };

      auth.extractToken.mockReturnValue('valid-token');
      auth.verifyToken.mockReturnValue({ userId: 'user123' });

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: 'user123' }),
      });

      Ride.findById.mockResolvedValue(mockRide);

      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 2);

      const request = {
        json: jest.fn().mockResolvedValue({
          location: 'San Jose',
          destination: 'San Diego',
          departureTime: futureDate.toISOString(),
          totalSeats: 4,
          availableSeats: 4,
        }),
      };

      const response = await updateRideHandler(request, { params: { id: 'ride123' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
    });

    it('should reject update if ride status is not Available', async () => {
      const mockRide = {
        _id: 'ride123',
        driverId: 'user123',
        status: 'Full',
      };

      auth.extractToken.mockReturnValue('valid-token');
      auth.verifyToken.mockReturnValue({ userId: 'user123' });

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: 'user123' }),
      });

      Ride.findById.mockResolvedValue(mockRide);

      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 2);

      const request = {
        json: jest.fn().mockResolvedValue({
          location: 'San Jose',
          destination: 'San Diego',
          departureTime: futureDate.toISOString(),
          totalSeats: 4,
          availableSeats: 4,
        }),
      };

      const response = await updateRideHandler(request, { params: { id: 'ride123' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject update with missing authentication', async () => {
      auth.extractToken.mockReturnValue(null);

      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 2);

      const request = {
        json: jest.fn().mockResolvedValue({
          location: 'San Jose',
          destination: 'San Diego',
          departureTime: futureDate.toISOString(),
          totalSeats: 4,
          availableSeats: 4,
        }),
      };

      const response = await updateRideHandler(request, { params: { id: 'ride123' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });

  describe('DELETE /api/rides/[id]', () => {
    it('should cancel a ride successfully', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'driver@example.com',
      };

      const mockRide = {
        _id: 'ride123',
        driverId: 'user123',
        status: 'Available',
        save: jest.fn().mockResolvedValue(),
      };

      auth.extractToken.mockReturnValue('valid-token');
      auth.verifyToken.mockReturnValue({ userId: 'user123' });

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      Ride.findById.mockResolvedValue(mockRide);

      const request = {};

      const response = await deleteRideHandler(request, { params: { id: 'ride123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockRide.status).toBe('Cancelled');
      expect(mockRide.save).toHaveBeenCalled();
    });

    it('should reject cancellation from non-driver user', async () => {
      const mockRide = {
        _id: 'ride123',
        driverId: 'different-driver',
        status: 'Available',
      };

      auth.extractToken.mockReturnValue('valid-token');
      auth.verifyToken.mockReturnValue({ userId: 'user123' });

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: 'user123' }),
      });

      Ride.findById.mockResolvedValue(mockRide);

      const request = {};

      const response = await deleteRideHandler(request, { params: { id: 'ride123' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
    });

    it('should reject cancellation if ride is not Available', async () => {
      const mockRide = {
        _id: 'ride123',
        driverId: 'user123',
        status: 'Cancelled',
      };

      auth.extractToken.mockReturnValue('valid-token');
      auth.verifyToken.mockReturnValue({ userId: 'user123' });

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: 'user123' }),
      });

      Ride.findById.mockResolvedValue(mockRide);

      const request = {};

      const response = await deleteRideHandler(request, { params: { id: 'ride123' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });
});
