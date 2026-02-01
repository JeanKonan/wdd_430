import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken, extractToken } from '@/lib/auth';
import { rideSchema } from '@/lib/validators';
import Ride from '@/models/Ride';
import User from '@/models/User';

/**
 * POST /api/rides
 * Create a new ride (driver only)
 */
export async function POST(request) {
  try {
    // Extract and verify authentication
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Verify user exists and is active
    const user = await User.findById(decoded.userId).select('-password');
    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, message: 'User not found or inactive' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const { error, value } = rideSchema.validate(body, { abortEarly: false, stripUnknown: true, convert: true });
    if (error) {
      const errors = error.details.reduce((acc, err) => {
        acc[err.path[0]] = err.message;
        return acc;
      }, {});

      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }

    // Create ride
    const ride = await Ride.create({
      driverId: decoded.userId,
      location: value.location,
      destination: value.destination,
      departureTime: value.departureTime,
      totalSeats: value.totalSeats,
      availableSeats: value.availableSeats,
      itinerary: value.itinerary || '',
      status: 'Available',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Ride created successfully',
        data: { ride: ride.toJSON() },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create ride error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create ride',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/rides
 * Get rides created by the authenticated user
 */
export async function GET(request) {
  try {
    // Extract and verify authentication
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Get user's rides
    const rides = await Ride.find({ driverId: decoded.userId }).sort({
      departureTime: -1,
    });

    return NextResponse.json(
      {
        success: true,
        data: { rides: rides.map((r) => r.toJSON()) },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get rides error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch rides',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
