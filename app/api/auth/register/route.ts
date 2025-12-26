import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Staff from '@/models/Staff';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    
    // Only owner can create new staff
    if (!authUser || authUser.role !== 'owner') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await connectDB();
    
    const { name, email, password, role, mobile } = await request.json();

    if (!name || !email || !password || !role || !mobile) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const existingStaff = await Staff.findOne({ email });
    
    if (existingStaff) {
      return NextResponse.json(
        { error: 'Staff with this email already exists' },
        { status: 400 }
      );
    }

    const staff = new Staff({
      name,
      email,
      password,
      role,
      mobile,
    });

    await staff.save();

    return NextResponse.json({
      success: true,
      staff: {
        id: staff._id.toString(),
        name: staff.name,
        email: staff.email,
        role: staff.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}

