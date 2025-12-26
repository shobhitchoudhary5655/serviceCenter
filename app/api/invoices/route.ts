import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
// Import models index to register all models
import '@/models';
import Invoice from '@/models/Invoice';
import Service from '@/models/Service';
import { getAuthUser } from '@/lib/auth';
import { generateInvoiceNo, calculateGST } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const serviceId = searchParams.get('service_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: any = {};
    if (serviceId) query.service_id = serviceId;

    const skip = (page - 1) * limit;
    
    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .populate({
          path: 'service_id',
          populate: { path: 'user_id', select: 'name mobile vehicle_no' },
        })
        .sort({ created_at: -1 })
        .limit(limit)
        .skip(skip),
      Invoice.countDocuments(query),
    ]);

    return NextResponse.json({
      invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    
    if (!authUser || (authUser.role !== 'owner' && authUser.role !== 'admin' && authUser.role !== 'invoice_biller')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    
    const {
      service_id,
      discount_amount,
      gst_rate,
      is_interstate,
    } = await request.json();

    if (!service_id) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    const service = await Service.findById(service_id);
    
    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Check if invoice already exists
    const existingInvoice = await Invoice.findOne({ service_id });
    if (existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice already exists for this service' },
        { status: 400 }
      );
    }

    const totalAmount = (service.labour_charge || 0) + (service.parts_charge || 0);
    const amountAfterDiscount = totalAmount - (discount_amount || 0);
    const gstRate = gst_rate || 18;
    const isInterstate = is_interstate || false;

    const gstCalc = calculateGST(amountAfterDiscount, gstRate, isInterstate);

    const invoice = new Invoice({
      service_id,
      invoice_no: generateInvoiceNo(),
      total_amount: totalAmount,
      discount_amount: discount_amount || 0,
      gst_amount: gstCalc.cgst + gstCalc.sgst + gstCalc.igst,
      cgst: gstCalc.cgst,
      sgst: gstCalc.sgst,
      igst: gstCalc.igst,
      final_amount: gstCalc.total,
    });

    await invoice.save();

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate({
        path: 'service_id',
        populate: { path: 'user_id', select: 'name mobile vehicle_no email' },
      });

    return NextResponse.json({ success: true, invoice: populatedInvoice }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create invoice' },
      { status: 500 }
    );
  }
}

