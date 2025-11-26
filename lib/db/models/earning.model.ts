// lib/db/models/earning.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IEarning extends Document {
  affiliateCode: string;
  userId?: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  amount: number;
  status: 'pending'|'approved'|'paid';
  createdAt: Date;
}

const EarningSchema = new Schema<IEarning>({
  affiliateCode: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending','approved','paid'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Earning || mongoose.model<IEarning>('Earning', EarningSchema);
