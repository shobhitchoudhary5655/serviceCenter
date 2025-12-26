import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
// Import models index to register all models
import '@/models';
import Invoice from '@/models/Invoice';
import { getAuthUser } from '@/lib/auth';
import { sendWhatsAppMessage, formatMessageTemplate } from '@/lib/whatsapp';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(request);
    
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const invoice = await Invoice.findById(params.id)
      .populate({
        path: 'service_id',
        populate: { path: 'user_id', select: 'name mobile vehicle_no email' },
      });
    
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const service: any = invoice.service_id;
    const user: any = service.user_id;

    const message = formatMessageTemplate(
      `Dear {{name}},\n\nYour invoice {{invoice_no}} for vehicle {{vehicle_no}} has been generated.\n\nTotal Amount: ₹{{final_amount}}\n\nThank you for your service!`,
      {
        name: user.name,
        invoice_no: invoice.invoice_no,
        vehicle_no: user.vehicle_no,
        final_amount: invoice.final_amount.toFixed(2),
      }
    );

    const sent = await sendWhatsAppMessage({
      to: user.mobile,
      message,
      type: 'text',
    });

    if (sent) {
      invoice.sent_on_whatsapp = true;
      invoice.sent_at = new Date();
      await invoice.save();
    }

    return NextResponse.json({
      success: sent,
      message: sent ? 'Invoice sent successfully' : 'Failed to send invoice',
      invoice,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to send invoice' },
      { status: 500 }
    );
  }
}

