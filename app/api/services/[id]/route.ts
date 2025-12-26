import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
// Import models index to register all models
import '@/models';
import Service from '@/models/Service';
import { getAuthUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(request);
    
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const service = await Service.findById(params.id)
      .populate('user_id', 'name mobile vehicle_no email')
      .populate('created_by', 'name');
    
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({ service });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch service' },
      { status: 500 }
    );
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

    await connectDB();
    
    const {
      service_date,
      service_type,
      labour_charge,
      parts_charge,
      amount_paid,
      next_due_date,
      feedback_text,
      feedback_rating,
      complaint_flag,
      complaint_description,
    } = await request.json();
    
    const updateData: any = {};
    if (service_date) updateData.service_date = new Date(service_date);
    if (service_type) updateData.service_type = service_type;
    if (labour_charge !== undefined) updateData.labour_charge = labour_charge;
    if (parts_charge !== undefined) updateData.parts_charge = parts_charge;
    if (amount_paid !== undefined) updateData.amount_paid = amount_paid;
    if (next_due_date) updateData.next_due_date = new Date(next_due_date);
    if (feedback_text !== undefined) updateData.feedback_text = feedback_text;
    if (feedback_rating !== undefined) updateData.feedback_rating = feedback_rating;
    if (complaint_flag !== undefined) updateData.complaint_flag = complaint_flag;
    if (complaint_description !== undefined) updateData.complaint_description = complaint_description;
    
    const service = await Service.findByIdAndUpdate(params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('user_id', 'name mobile vehicle_no')
      .populate('created_by', 'name');
    
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, service });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update service' },
      { status: 500 }
    );
  }
}

