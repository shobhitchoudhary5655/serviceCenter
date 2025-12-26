import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IServiceProduct extends Document {
  service_id: mongoose.Types.ObjectId;
  stock_id: mongoose.Types.ObjectId;
  quantity_used: number;
  created_at: Date;
}

const ServiceProductSchema: Schema = new Schema({
  service_id: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
  stock_id: { type: Schema.Types.ObjectId, ref: 'Stock', required: true },
  quantity_used: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
});

export default (mongoose.models.ServiceProduct as Model<IServiceProduct>) || mongoose.model<IServiceProduct>('ServiceProduct', ServiceProductSchema);

