// lib/db/models/AffiliateLink.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IAffiliateLink extends Document {
  user: string;
  product: mongoose.Schema.Types.ObjectId;
  code: string;
  clicks: number;
  createdAt: Date;
}

const AffiliateLinkSchema: Schema = new Schema({
  user: { type: String, required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  code: { type: String, required: true, unique: true }, // <--- enforce uniqueness
  clicks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Prevent model recompilation in dev mode
const AffiliateLink = mongoose.models.AffiliateLink || mongoose.model<IAffiliateLink>("AffiliateLink", AffiliateLinkSchema);

export default AffiliateLink;
