import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IService extends Document {
  user_id: mongoose.Types.ObjectId;
  branch_id?: mongoose.Types.ObjectId;
  service_date: Date;
  service_type: string;
  labour_charge: number;
  parts_charge: number;
  amount_paid: number;
  next_due_date?: Date;
  feedback_text?: string;
  feedback_rating?: number;
  complaint_flag: boolean;
  complaint_description?: string;
  created_by: mongoose.Types.ObjectId;
  created_at: Date;
}

const ServiceSchema: Schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch' },
  service_date: { type: Date, required: true, default: Date.now },
  service_type: { type: String, required: true },
  labour_charge: { type: Number, default: 0 },
  parts_charge: { type: Number, default: 0 },
  amount_paid: { type: Number, required: true },
  next_due_date: { type: Date },
  feedback_text: { type: String },
  feedback_rating: { type: Number, min: 1, max: 5 },
  complaint_flag: { type: Boolean, default: false },
  complaint_description: { type: String },
  created_by: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
  created_at: { type: Date, default: Date.now },
});

export default (mongoose.models.Service as Model<IService>) || mongoose.model<IService>('Service', ServiceSchema);

