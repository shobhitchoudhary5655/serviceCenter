import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Service from '@/models/Service';
import ServiceProduct from '@/models/ServiceProduct';
import Stock from '@/models/Stock';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const serviceType = searchParams.get('service_type');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: any = {};
    
    if (userId) query.user_id = userId;
    if (serviceType) query.service_type = serviceType;
    if (startDate || endDate) {
      query.service_date = {};
      if (startDate) query.service_date.$gte = new Date(startDate);
      if (endDate) query.service_date.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    
    const [services, total] = await Promise.all([
      Service.find(query)
        .populate('user_id', 'name mobile vehicle_no')
        .populate('created_by', 'name')
        .sort({ service_date: -1 })
        .limit(limit)
        .skip(skip),
      Service.countDocuments(query),
    ]);

    return NextResponse.json({
      services,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    
    if (!authUser || (authUser.role !== 'owner' && authUser.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    
    const {
      user_id,
      service_date,
      service_type,
      labour_charge,
      parts_charge,
      amount_paid,
      next_due_date,
      products_used, // Array of { stock_id, quantity_used }
    } = await request.json();

    if (!user_id || !service_date || !service_type || !amount_paid) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    // Create service
    const service = new Service({
      user_id,
      service_date: new Date(service_date),
      service_type,
      labour_charge: labour_charge || 0,
      parts_charge: parts_charge || 0,
      amount_paid,
      next_due_date: next_due_date ? new Date(next_due_date) : null,
      created_by: authUser.userId,
    });

    await service.save();

    // Update stock if products are used
    if (products_used && Array.isArray(products_used)) {
      for (const product of products_used) {
        const { stock_id, quantity_used } = product;
        
        // Create service-product relationship
        const serviceProduct = new ServiceProduct({
          service_id: service._id,
          stock_id,
          quantity_used,
        });
        await serviceProduct.save();

        // Update stock quantity_used
        await Stock.findByIdAndUpdate(stock_id, {
          $inc: { quantity_used: quantity_used },
        });
      }
    }

    const populatedService = await Service.findById(service._id)
      .populate('user_id', 'name mobile vehicle_no')
      .populate('created_by', 'name');

    return NextResponse.json({ success: true, service: populatedService }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create service' },
      { status: 500 }
    );
  }
}

