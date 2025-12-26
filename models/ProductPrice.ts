import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProductPrice extends Document {
  product_name: string;
  product_type: 'tyre' | 'oil' | 'battery' | 'filter' | 'brake_pad' | 'other';
  brand?: string;
  price: number;
  unit?: string; // e.g., 'per tyre', 'per liter', 'per piece'
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const ProductPriceSchema: Schema = new Schema({
  product_name: { type: String, required: true },
  product_type: { 
    type: String, 
    enum: ['tyre', 'oil', 'battery', 'filter', 'brake_pad', 'other'],
    required: true 
  },
  brand: { type: String },
  price: { type: Number, required: true },
  unit: { type: String, default: 'per piece' },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Update updated_at before saving
ProductPriceSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

export default (mongoose.models.ProductPrice as Model<IProductPrice>) || 
  mongoose.model<IProductPrice>('ProductPrice', ProductPriceSchema);

