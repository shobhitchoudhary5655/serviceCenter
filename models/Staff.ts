import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IStaff extends Document {
  name: string;
  email: string;
  password: string;
  role: 'owner' | 'admin' | 'invoice_biller';
  mobile: string;
  is_active: boolean;
  created_at: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const StaffSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['owner', 'admin', 'invoice_biller'], required: true },
  mobile: { type: String, required: true },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
});

StaffSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

StaffSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default (mongoose.models.Staff as Model<IStaff>) || mongoose.model<IStaff>('Staff', StaffSchema);

