import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
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
    const search = searchParams.get('search') || '';
    const lowStock = searchParams.get('low_stock') === 'true';
    const defective = searchParams.get('defective') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: any = {};
    
    if (search) {
      query.$or = [
        { product_name: { $regex: search, $options: 'i' } },
        { batch_no: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (defective) {
      query.is_defective = true;
    }

    const skip = (page - 1) * limit;
    
    let stocks = await Stock.find(query).sort({ created_at: -1 }).limit(limit).skip(skip);
    
    // Filter low stock if requested
    if (lowStock) {
      stocks = stocks.filter((stock) => {
        const remaining = stock.quantity_in - stock.quantity_used;
        return remaining <= (stock.low_stock_threshold || 10);
      });
    }

    const total = await Stock.countDocuments(query);
    
    const stocksWithRemaining = stocks.map((stock) => ({
      ...stock.toObject(),
      remaining_quantity: stock.quantity_in - stock.quantity_used,
    }));

    return NextResponse.json({
      stocks: stocksWithRemaining,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stock' },
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
      product_name,
      batch_no,
      quantity_in,
      unit_price,
      supplier,
      purchase_date,
      low_stock_threshold,
    } = await request.json();

    if (!product_name || !batch_no || !quantity_in || !unit_price || !supplier) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    const stock = new Stock({
      product_name,
      batch_no,
      quantity_in,
      quantity_used: 0,
      unit_price,
      supplier,
      purchase_date: purchase_date ? new Date(purchase_date) : new Date(),
      low_stock_threshold: low_stock_threshold || 10,
    });

    await stock.save();

    return NextResponse.json({ success: true, stock }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create stock' },
      { status: 500 }
    );
  }
}

