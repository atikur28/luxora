// lib/db/models/user.model.ts
import { IUserInput } from "@/types";
import { Document, Model, model, models, Schema } from "mongoose";

export interface IUser extends Document, IUserInput {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  // affiliate fields
  affiliateCode?: string | null;
  affiliateRequest?: boolean;
  affiliateClicks?: number;
  affiliateEarnings?: number;
  affiliateOrders?: number;
  wallet?: number;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, required: true, default: "User" },
    password: { type: String },
    image: { type: String },
    emailVerified: { type: Boolean, default: false },
<<<<<<< Updated upstream
=======
    affiliateRequest: { type: Boolean, default: false },

    // NEW affiliate fields
    affiliateCode: { type: String, default: null, index: true },
    affiliateClicks: { type: Number, default: 0 },
    affiliateEarnings: { type: Number, default: 0 },
    affiliateOrders: { type: Number, default: 0 },
    wallet: { type: Number, default: 0 },
>>>>>>> Stashed changes
  },
  {
    timestamps: true,
  }
);

const User = (models.User as Model<IUser>) || model<IUser>("User", userSchema);

export default User;
