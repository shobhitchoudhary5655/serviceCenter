import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { vehicle_no: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find(query).sort({ created_at: -1 }).limit(limit).skip(skip),
      User.countDocuments(query),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    
    if (!authUser) {
      return NextResponse.json({ 
        error: 'Unauthorized. Please login again.' 
      }, { status: 401 });
    }

    if (authUser.role !== 'owner' && authUser.role !== 'admin') {
      return NextResponse.json({ 
        error: 'You do not have permission to create users.' 
      }, { status: 403 });
    }

    await connectDB();
    
    const body = await request.json();
    const { name, mobile, vehicle_no, email, source } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!mobile || !mobile.trim()) {
      return NextResponse.json(
        { error: 'Mobile number is required' },
        { status: 400 }
      );
    }

    if (!vehicle_no || !vehicle_no.trim()) {
      return NextResponse.json(
        { error: 'Vehicle number is required' },
        { status: 400 }
      );
    }

    // Check for existing user with same mobile
    const existingUser = await User.findOne({ mobile: mobile.trim() });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Customer with this mobile number already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const user = new User({
      name: name.trim(),
      mobile: mobile.trim(),
      vehicle_no: vehicle_no.trim(),
      email: email?.trim() || undefined,
      source: source || 'admin',
    });

    await user.save();

    return NextResponse.json({ 
      success: true, 
      user: {
        _id: user._id,
        name: user.name,
        mobile: user.mobile,
        vehicle_no: user.vehicle_no,
        email: user.email,
        source: user.source,
        created_at: user.created_at,
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create user error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Customer with this mobile number already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create user. Please try again.' },
      { status: 500 }
    );
  }
}

