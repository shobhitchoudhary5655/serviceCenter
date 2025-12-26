import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Staff from '@/models/Staff';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const staff = await Staff.findOne({ email: email.toLowerCase().trim(), is_active: true });
    
    if (!staff) {
      // Check if any staff exists at all
      const anyStaff = await Staff.findOne();
      if (!anyStaff) {
        return NextResponse.json(
          { error: 'No admin user found. Please setup admin account first.', setupRequired: true },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isPasswordValid = await staff.comparePassword(password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = generateToken({
      userId: staff._id.toString(),
      email: staff.email,
      role: staff.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: staff._id.toString(),
        name: staff.name,
        email: staff.email,
        role: staff.role,
      },
      token,
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}

