import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
// Import all models first to ensure they're registered
import '@/models';
import Service from '@/models/Service';
import ServiceProduct from '@/models/ServiceProduct';
import Stock from '@/models/Stock';
import { getAuthUser } from '@/lib/auth';
import { handleApiError } from '@/lib/api-error-handler';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to MongoDB
    try {
      await connectDB();
    } catch (dbError: any) {
      return handleApiError(dbError, 'Services GET - MongoDB Connection');
    }
    
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const serviceType = searchParams.get('service_type');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: any = {};
    
    if (userId) {
      try {
        const mongoose = (await import('mongoose')).default;
        query.user_id = new mongoose.Types.ObjectId(userId);
      } catch (e) {
        query.user_id = userId;
      }
    }
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
        .skip(skip)
        .lean(),
      Service.countDocuments(query),
    ]);

    return NextResponse.json({
      services: services || [],
      pagination: {
        page,
        limit,
        total: total || 0,
        pages: Math.ceil((total || 0) / limit),
      },
    });
  } catch (error: any) {
    return handleApiError(error, 'Services GET');
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    
    if (!authUser || (authUser.role !== 'owner' && authUser.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Connect to MongoDB
    try {
      await connectDB();
    } catch (dbError: any) {
      return handleApiError(dbError, 'Services POST - MongoDB Connection');
    }
    
    const {
      user_id,
      service_date,
      service_type,
      labour_charge,
      parts_charge,
      amount_paid,
      next_due_date,
      products_used, // Array of { stock_id, quantity_used }
      service_details, // Optional: contains oil_name, tyres, etc.
    } = await request.json();

    if (!user_id || !service_date || !service_type || !amount_paid) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    // Convert IDs to ObjectId
    const mongoose = (await import('mongoose')).default;
    let userIdObj: any;
    let createdById: any;
    
    try {
      userIdObj = new mongoose.Types.ObjectId(user_id);
      createdById = new mongoose.Types.ObjectId(authUser.userId);
    } catch (idError: any) {
      console.error('Invalid ObjectId:', idError);
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Create service
    const service = new Service({
      user_id: userIdObj,
      service_date: new Date(service_date),
      service_type,
      labour_charge: labour_charge || 0,
      parts_charge: parts_charge || 0,
      amount_paid,
      next_due_date: next_due_date ? new Date(next_due_date) : null,
      created_by: createdById,
    });

    await service.save();

    // Update stock if products are used
    if (products_used && Array.isArray(products_used)) {
      for (const product of products_used) {
        const { stock_id, quantity_used } = product;
        
        try {
          const stockIdObj = new mongoose.Types.ObjectId(stock_id);
          
          // Create service-product relationship
          const serviceProduct = new ServiceProduct({
            service_id: service._id,
            stock_id: stockIdObj,
            quantity_used,
          });
          await serviceProduct.save();

          // Update stock quantity_used
          await Stock.findByIdAndUpdate(stockIdObj, {
            $inc: { quantity_used: quantity_used },
          });
        } catch (productError: any) {
          console.error('Error processing product:', productError);
          // Continue with other products
        }
      }
    }

    const populatedService = await Service.findById(service._id)
      .populate('user_id', 'name mobile vehicle_no')
      .populate('created_by', 'name');

    return NextResponse.json({ success: true, service: populatedService }, { status: 201 });
  } catch (error: any) {
    return handleApiError(error, 'Services POST');
  }
}

