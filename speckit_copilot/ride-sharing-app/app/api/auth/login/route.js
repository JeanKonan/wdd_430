import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { loginSchema } from '@/lib/validators';
import { generateToken } from '@/lib/auth';

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const { error, value } = loginSchema.validate(body);
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

    // Find user by email (include password field)
    const user = await User.findOne({ email: value.email.toLowerCase() }).select('+password');
    
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Check if user account is active
    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: 'Account is inactive. Please contact support.',
        },
        { status: 403 }
      );
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(value.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // Create response with user data (excluding password)
    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        data: {
          user: user.toPublicJSON(),
          token,
        },
      },
      { status: 200 }
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
    console.error('Login error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred during login',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
