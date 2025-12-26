import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
// Import models index to register all models
import '@/models';
import ProductPrice from '@/models/ProductPrice';
import { getAuthUser } from '@/lib/auth';
import { handleApiError } from '@/lib/api-error-handler';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      await connectDB();
    } catch (dbError: any) {
      return handleApiError(dbError, 'Product Prices GET - MongoDB Connection');
    }
    
    const searchParams = request.nextUrl.searchParams;
    const productType = searchParams.get('product_type');
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('is_active') !== 'false';

    const query: any = {};
    
    if (productType) {
      query.product_type = productType;
    }
    
    if (search) {
      query.$or = [
        { product_name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (isActive) {
      query.is_active = true;
    }

    const productPrices = await ProductPrice.find(query)
      .sort({ product_type: 1, product_name: 1 })
      .lean();

    return NextResponse.json({
      productPrices: productPrices || [],
    });
  } catch (error: any) {
    return handleApiError(error, 'Product Prices GET');
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    
    if (!authUser || (authUser.role !== 'owner' && authUser.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
      await connectDB();
    } catch (dbError: any) {
      return handleApiError(dbError, 'Product Prices POST - MongoDB Connection');
    }
    
    const {
      product_name,
      product_type,
      brand,
      price,
      unit,
      is_active,
    } = await request.json();

    if (!product_name || !product_type || price === undefined) {
      return NextResponse.json(
        { error: 'Product name, type, and price are required' },
        { status: 400 }
      );
    }

    // Check for duplicate
    const existing = await ProductPrice.findOne({
      product_name: product_name.trim(),
      product_type,
      brand: brand?.trim() || undefined,
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Product price with this name and type already exists' },
        { status: 400 }
      );
    }

    const productPrice = new ProductPrice({
      product_name: product_name.trim(),
      product_type,
      brand: brand?.trim() || undefined,
      price: parseFloat(price),
      unit: unit || 'per piece',
      is_active: is_active !== false,
    });

    await productPrice.save();

    return NextResponse.json(
      { success: true, productPrice },
      { status: 201 }
    );
  } catch (error: any) {
    return handleApiError(error, 'Product Prices POST');
  }
}

