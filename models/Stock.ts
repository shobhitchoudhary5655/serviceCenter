import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStock extends Document {
  product_name: string;
  batch_no: string;
  quantity_in: number;
  quantity_used: number;
  unit_price: number;
  supplier: string;
  purchase_date: Date;
  is_defective: boolean;
  low_stock_threshold?: number;
  created_at: Date;
}

const StockSchema: Schema = new Schema({
  product_name: { type: String, required: true },
  batch_no: { type: String, required: true },
  quantity_in: { type: Number, required: true },
  quantity_used: { type: Number, default: 0 },
  unit_price: { type: Number, required: true },
  supplier: { type: String, required: true },
  purchase_date: { type: Date, required: true },
  is_defective: { type: Boolean, default: false },
  low_stock_threshold: { type: Number, default: 10 },
  created_at: { type: Date, default: Date.now },
});

StockSchema.virtual('remaining_quantity').get(function() {
  const stock = this as unknown as IStock;
  return stock.quantity_in - stock.quantity_used;
});

export default (mongoose.models.Stock as Model<IStock>) || mongoose.model<IStock>('Stock', StockSchema);

