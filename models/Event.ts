import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEvent extends Document {
  name: string;
  message_template: string;
  target_filter: {
    type: 'all' | 'last_12_months' | 'washing_only' | 'frequent_visitors' | 'custom';
    service_type?: string;
    min_visits?: number;
    custom_query?: any;
  };
  active: boolean;
  schedule_type: 'daily' | 'weekly' | 'monthly' | 'event' | 'manual';
  schedule_date?: Date;
  last_run?: Date;
  created_by: mongoose.Types.ObjectId;
  created_at: Date;
}

const EventSchema: Schema = new Schema({
  name: { type: String, required: true },
  message_template: { type: String, required: true },
  target_filter: {
    type: {
      type: String,
      enum: ['all', 'last_12_months', 'washing_only', 'frequent_visitors', 'custom'],
      default: 'all',
    },
    service_type: { type: String },
    min_visits: { type: Number },
    custom_query: { type: Schema.Types.Mixed },
  },
  active: { type: Boolean, default: true },
  schedule_type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'event', 'manual'],
    default: 'manual',
  },
  schedule_date: { type: Date },
  last_run: { type: Date },
  created_by: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
  created_at: { type: Date, default: Date.now },
});

export default (mongoose.models.Event as Model<IEvent>) || mongoose.model<IEvent>('Event', EventSchema);

