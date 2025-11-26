// lib/db/models/affiliate.model.ts
import { Document, model, models, Schema } from "mongoose";

export interface IAffiliate extends Document {
  userId: string;
  code: string;
  approved: boolean;
  createdAt: Date;
}

const AffiliateSchema = new Schema<IAffiliate>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  code: { type: String, required: true, unique: true, index: true },
  approved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default models.Affiliate || model<IAffiliate>("Affiliate", AffiliateSchema);
