import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Stock from '@/models/Stock';
import { getAuthUser } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      is_defective,
      low_stock_threshold,
    } = await request.json();
    
    const updateData: any = {};
    if (product_name) updateData.product_name = product_name;
    if (batch_no) updateData.batch_no = batch_no;
    if (quantity_in !== undefined) updateData.quantity_in = quantity_in;
    if (unit_price !== undefined) updateData.unit_price = unit_price;
    if (supplier) updateData.supplier = supplier;
    if (purchase_date) updateData.purchase_date = new Date(purchase_date);
    if (is_defective !== undefined) updateData.is_defective = is_defective;
    if (low_stock_threshold !== undefined) updateData.low_stock_threshold = low_stock_threshold;
    
    const stock = await Stock.findByIdAndUpdate(params.id, updateData, {
      new: true,
      runValidators: true,
    });
    
    if (!stock) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
    }

    const stockWithRemaining = {
      ...stock.toObject(),
      remaining_quantity: stock.quantity_in - stock.quantity_used,
    };

    return NextResponse.json({ success: true, stock: stockWithRemaining });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update stock' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(request);
    
    if (!authUser || authUser.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    
    const stock = await Stock.findByIdAndDelete(params.id);
    
    if (!stock) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Stock deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete stock' },
      { status: 500 }
    );
  }
}

