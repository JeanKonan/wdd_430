import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { verifyToken, extractToken } from '@/lib/auth';
import { rideSchema } from '@/lib/validators';
import Ride from '@/models/Ride';
import User from '@/models/User';

/**
 * PUT /api/rides/[id]
 * Update an existing ride (driver only, must be Available status)
 */
export async function PUT(request, { params }) {
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

    // Verify user exists
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Await params if it's a promise (Next.js 15+)
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid ride ID' },
        { status: 400 }
      );
    }

    // Get ride
    const ride = await Ride.findById(id);
    if (!ride) {
      return NextResponse.json(
        { success: false, message: 'Ride not found' },
        { status: 404 }
      );
    }

    // Verify user is the driver
    if (ride.driverId.toString() !== decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Only the driver can edit this ride' },
        { status: 403 }
      );
    }

    // Check ride status
    if (ride.status !== 'Available') {
      return NextResponse.json(
        { success: false, message: 'Can only edit rides with Available status' },
        { status: 400 }
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

    // Update ride
    ride.location = value.location;
    ride.destination = value.destination;
    ride.departureTime = value.departureTime;
    ride.totalSeats = value.totalSeats;
    ride.availableSeats = value.availableSeats;
    ride.itinerary = value.itinerary || '';

    await ride.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Ride updated successfully',
        data: { ride: ride.toJSON() },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update ride error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update ride',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/rides/[id]
 * Cancel a ride (driver only, must be Available status)
 */
export async function DELETE(request, { params }) {
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

    // Verify user exists
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Await params if it's a promise (Next.js 15+)
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid ride ID' },
        { status: 400 }
      );
    }

    // Get ride
    const ride = await Ride.findById(id);
    if (!ride) {
      return NextResponse.json(
        { success: false, message: 'Ride not found' },
        { status: 404 }
      );
    }

    // Verify user is the driver
    if (ride.driverId.toString() !== decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Only the driver can cancel this ride' },
        { status: 403 }
      );
    }

    // Check ride status
    if (ride.status !== 'Available') {
      return NextResponse.json(
        { success: false, message: 'Can only cancel rides with Available status' },
        { status: 400 }
      );
    }

    // Mark ride as cancelled
    ride.status = 'Cancelled';
    await ride.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Ride cancelled successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete ride error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to cancel ride',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
