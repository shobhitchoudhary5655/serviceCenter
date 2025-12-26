import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
// Import models index to register all models
import '@/models';
import Service from '@/models/Service';
import Invoice from '@/models/Invoice';
import Stock from '@/models/Stock';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    
    if (!authUser || (authUser.role !== 'owner' && authUser.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    const dateQuery: any = {};
    if (startDate || endDate) {
      dateQuery.service_date = {};
      if (startDate) dateQuery.service_date.$gte = new Date(startDate);
      if (endDate) dateQuery.service_date.$lte = new Date(endDate);
    }

    // Revenue calculations
    const services = await Service.find(dateQuery);
    const totalRevenue = services.reduce((sum, s) => sum + (s.amount_paid || 0), 0);
    
    const invoices = await Invoice.find({
      ...(startDate || endDate ? {
        created_at: {
          ...(startDate && { $gte: new Date(startDate) }),
          ...(endDate && { $lte: new Date(endDate) }),
        },
      } : {}),
    });
    const invoiceRevenue = invoices.reduce((sum, inv) => sum + (inv.final_amount || 0), 0);

    // Service type breakdown
    const serviceTypes = await Service.aggregate([
      ...(Object.keys(dateQuery).length > 0 ? [{ $match: dateQuery }] : []),
      {
        $group: {
          _id: '$service_type',
          count: { $sum: 1 },
          revenue: { $sum: '$amount_paid' },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    // Stock stats
    const stockItems = await Stock.find();
    const lowStockItems = stockItems.filter((s) => {
      const remaining = s.quantity_in - s.quantity_used;
      return remaining <= (s.low_stock_threshold || 10);
    });
    const defectiveItems = stockItems.filter((s) => s.is_defective);

    // Customer stats
    const totalCustomers = await User.countDocuments();
    const activeCustomers = await Service.distinct('user_id').then((ids) => ids.length);
    
    // Complaints
    const complaints = await Service.countDocuments({
      complaint_flag: true,
      ...dateQuery,
    });

    // Monthly revenue trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyRevenue = await Service.aggregate([
      {
        $match: {
          service_date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$service_date' },
            month: { $month: '$service_date' },
          },
          revenue: { $sum: '$amount_paid' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return NextResponse.json({
      stats: {
        totalRevenue,
        invoiceRevenue,
        totalServices: services.length,
        totalCustomers,
        activeCustomers,
        complaints,
        lowStockCount: lowStockItems.length,
        defectiveCount: defectiveItems.length,
      },
      serviceTypes,
      monthlyRevenue,
      lowStockItems: lowStockItems.map((s) => ({
        ...s.toObject(),
        remaining_quantity: s.quantity_in - s.quantity_used,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

