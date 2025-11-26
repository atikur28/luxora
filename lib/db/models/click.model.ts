// lib/db/models/click.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IClick extends Document {
  affiliateCode: string;
  productId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  createdAt: Date;
}

const ClickSchema = new Schema<IClick>({
  affiliateCode: { type: String, required: true, index: true },
  productId: { type: String, default: null },
  ip: { type: String, default: null },
  userAgent: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Click || mongoose.model<IClick>("Click", ClickSchema);
