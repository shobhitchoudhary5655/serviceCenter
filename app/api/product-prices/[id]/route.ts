import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
// Import models index to register all models
import '@/models';
import ProductPrice from '@/models/ProductPrice';
import { getAuthUser } from '@/lib/auth';
import { handleApiError } from '@/lib/api-error-handler';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(request);
    
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      await connectDB();
    } catch (dbError: any) {
      return handleApiError(dbError, 'Product Price GET - MongoDB Connection');
    }
    
    const productPrice = await ProductPrice.findById(params.id);
    
    if (!productPrice) {
      return NextResponse.json({ error: 'Product price not found' }, { status: 404 });
    }

    return NextResponse.json({ productPrice });
  } catch (error: any) {
    return handleApiError(error, 'Product Price GET');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(request);
    
    if (!authUser || (authUser.role !== 'owner' && authUser.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
      await connectDB();
    } catch (dbError: any) {
      return handleApiError(dbError, 'Product Price PUT - MongoDB Connection');
    }
    
    const {
      product_name,
      product_type,
      brand,
      price,
      unit,
      is_active,
    } = await request.json();

    const productPrice = await ProductPrice.findByIdAndUpdate(
      params.id,
      {
        product_name: product_name?.trim(),
        product_type,
        brand: brand?.trim() || undefined,
        price: price !== undefined ? parseFloat(price) : undefined,
        unit,
        is_active,
        updated_at: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!productPrice) {
      return NextResponse.json({ error: 'Product price not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, productPrice });
  } catch (error: any) {
    return handleApiError(error, 'Product Price PUT');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(request);
    
    if (!authUser || (authUser.role !== 'owner' && authUser.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
      await connectDB();
    } catch (dbError: any) {
      return handleApiError(dbError, 'Product Price DELETE - MongoDB Connection');
    }
    
    const productPrice = await ProductPrice.findByIdAndDelete(params.id);

    if (!productPrice) {
      return NextResponse.json({ error: 'Product price not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Product price deleted' });
  } catch (error: any) {
    return handleApiError(error, 'Product Price DELETE');
  }
}

