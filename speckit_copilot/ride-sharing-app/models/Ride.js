import mongoose from 'mongoose';

/**
 * Ride Schema
 * 
 * Represents a ride offered by a driver
 * - Driver can create multiple rides
 * - Each ride has a location, destination, and departure time
 * - Ride status tracks availability
 */

const rideSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    departureTime: {
      type: Date,
      required: true,
    },
    totalSeats: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    availableSeats: {
      type: Number,
      required: true,
      min: 0,
      max: 8,
    },
    itinerary: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Available', 'Full', 'Cancelled'],
      default: 'Available',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
rideSchema.index({ location: 1, destination: 1, departureTime: 1 });
rideSchema.index({ driverId: 1 });

export default mongoose.models.Ride || mongoose.model('Ride', rideSchema);
