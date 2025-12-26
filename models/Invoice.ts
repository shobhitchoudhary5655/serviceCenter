import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInvoice extends Document {
  service_id: mongoose.Types.ObjectId;
  invoice_no: string;
  total_amount: number;
  gst_amount: number;
  discount_amount: number;
  final_amount: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  sent_on_whatsapp: boolean;
  sent_at?: Date;
  payment_received: boolean;
  payment_date?: Date;
  created_at: Date;
}

const InvoiceSchema: Schema = new Schema({
  service_id: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
  invoice_no: { type: String, required: true, unique: true },
  total_amount: { type: Number, required: true },
  gst_amount: { type: Number, required: true },
  discount_amount: { type: Number, default: 0 },
  final_amount: { type: Number, required: true },
  cgst: { type: Number },
  sgst: { type: Number },
  igst: { type: Number },
  sent_on_whatsapp: { type: Boolean, default: false },
  sent_at: { type: Date },
  payment_received: { type: Boolean, default: false },
  payment_date: { type: Date },
  created_at: { type: Date, default: Date.now },
});

export default (mongoose.models.Invoice as Model<IInvoice>) || mongoose.model<IInvoice>('Invoice', InvoiceSchema);

