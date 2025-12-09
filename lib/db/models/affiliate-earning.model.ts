import { Document, Model, model, models, Schema } from "mongoose";

export interface IAffiliateEarning extends Document {
  affiliateUserId: string;
  orderId: string;
  productId: string;
  orderAmount: number;
  commissionPercent: number;
  commissionAmount: number;
  status: "pending" | "confirmed" | "paid";
  createdAt: Date;
  updatedAt: Date;
}

const affiliateEarningSchema = new Schema<IAffiliateEarning>(
  {
    affiliateUserId: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    productId: {
      type: String,
      required: true,
    },
    orderAmount: { type: Number, required: true },
    commissionPercent: { type: Number, default: 10 },
    commissionAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "paid"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const AffiliateEarning =
  (models.AffiliateEarning as Model<IAffiliateEarning>) ||
  model<IAffiliateEarning>("AffiliateEarning", affiliateEarningSchema);

export default AffiliateEarning;
