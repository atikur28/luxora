// lib/db/models/withdrawal.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IWithdrawal extends Document {
  affiliateCode: string;
  userId: mongoose.Types.ObjectId;
  amount: number;
  method: string;
  account?: string;
  status: "pending" | "approved" | "rejected" | "paid";
  createdAt: Date;
}

const WithdrawalSchema = new Schema<IWithdrawal>({
  affiliateCode: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  method: { type: String, required: true },
  account: { type: String },
  status: { type: String, enum: ["pending", "approved", "rejected", "paid"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Withdrawal || mongoose.model<IWithdrawal>("Withdrawal", WithdrawalSchema);
