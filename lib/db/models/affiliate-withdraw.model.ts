import { Document, Model, model, models, Schema } from "mongoose";

export interface IAffiliateWithdraw extends Document {
  affiliateUserId: string;
  amount: number;
  status: "pending" | "paid" | "rejected";
  paymentDetails?: Record<string, string | number | boolean>;
  requestedAt: Date;
  processedAt?: Date;
}

const affiliateWithdrawSchema = new Schema<IAffiliateWithdraw>(
  {
    affiliateUserId: { type: String, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "rejected"],
      default: "pending",
    },
    paymentDetails: { type: Schema.Types.Mixed },
    requestedAt: { type: Date, default: Date.now },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

const AffiliateWithdraw =
  (models.AffiliateWithdraw as Model<IAffiliateWithdraw>) ||
  model<IAffiliateWithdraw>("AffiliateWithdraw", affiliateWithdrawSchema);

export default AffiliateWithdraw;
