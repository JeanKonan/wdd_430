import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { registerSchema } from '@/lib/validators';
import { generateToken } from '@/lib/auth';

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const { error, value } = registerSchema.validate(body);
    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: error.details.map((detail) => ({
            field: detail.path[0],
            message: detail.message,
          })),
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: value.email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'User with this email already exists',
        },
        { status: 409 }
      );
    }

    // Create new user (password will be hashed by pre-save hook)
    const user = await User.create({
      email: value.email.toLowerCase(),
      password: value.password,
      fullName: value.fullName,
      phone: value.phone || '',
      bio: value.bio || '',
    });

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // Create response with user data (excluding password)
    const response = NextResponse.json(
      {
        success: true,
        message: 'User registered successfully',
        data: {
          user: user.toPublicJSON(),
          token,
        },
      },
      { status: 201 }
    );

    // Set httpOnly cookie for token
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: 'User with this email already exists',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred during registration',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
