import { Document, Model, model, models, Schema } from "mongoose";

export interface IAffiliateClick extends Document {
  affiliateUserId: string;
  productId: string;
  clickedAt: Date;
  ipAddress?: string;
}

const affiliateClickSchema = new Schema<IAffiliateClick>(
  {
    affiliateUserId: {
      type: String,
      required: true,
    },
    productId: {
      type: String,
      required: true,
    },
    clickedAt: { type: Date, default: Date.now },
    ipAddress: { type: String },
  },
  {
    timestamps: true,
  }
);

const AffiliateClick =
  (models.AffiliateClick as Model<IAffiliateClick>) ||
  model<IAffiliateClick>("AffiliateClick", affiliateClickSchema);

export default AffiliateClick;
