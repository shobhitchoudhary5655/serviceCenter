import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Staff from '@/models/Staff';

// This endpoint allows creating the first admin user if no users exist
// Also used to check if admin exists (GET request)
export async function GET() {
  try {
    await connectDB();
    const existingStaff = await Staff.findOne();
    return NextResponse.json({ 
      adminExists: !!existingStaff 
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to check admin status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Check if any staff exists
    const existingStaff = await Staff.findOne();
    if (existingStaff) {
      return NextResponse.json(
        { error: 'Admin user already exists. Please login or contact system administrator.' },
        { status: 400 }
      );
    }

    const { email, password, name, mobile } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Create first admin user (always as owner)
    const staff = new Staff({
      name: name || 'Admin User',
      email,
      password,
      role: 'owner',
      mobile: mobile || '1234567890',
      is_active: true,
    });

    await staff.save();

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully. Please login now.',
      user: {
        id: staff._id.toString(),
        name: staff.name,
        email: staff.email,
        role: staff.role,
      },
    }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create admin user' },
      { status: 500 }
    );
  }
}

