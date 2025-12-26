import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  mobile: string;
  vehicle_no: string;
  email?: string;
  created_at: Date;
  source: 'excel' | 'admin';
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  vehicle_no: { type: String, required: true },
  email: { type: String },
  created_at: { type: Date, default: Date.now },
  source: { type: String, enum: ['excel', 'admin'], default: 'admin' },
});

export default (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', UserSchema);

