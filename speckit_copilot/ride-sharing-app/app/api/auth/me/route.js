import { NextResponse } from 'next/server';
import { verifyToken, extractToken } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function GET(request) {
  try {
    // Extract token from cookies
    const token = extractToken(request);

    if (!token) {
      return NextResponse.json({ message: 'No token found' }, { status: 401 });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Connect to database
    await connectDB();

    // Fetch user from database (excluding password)
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: user.toPublicJSON ? user.toPublicJSON() : user,
    });
  } catch (error) {
    console.error('Auth ME error:', error);
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }
}
