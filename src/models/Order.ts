import mongoose, { Schema, Document } from "mongoose";

export interface OrderType extends Document {
  shopName: string;
  clientName?: string;
  clientNumber?: string;

  deliveryDate: string;
  pickupDate: string;

  category: string;
  subcategory: string;

  measurements: Record<string, number>;
}

const OrderSchema = new Schema<OrderType>(
  {
    shopName: { type: String, required: true },
    clientName: { type: String },
    clientNumber: { type: String },

    deliveryDate: { type: String, required: true },
    pickupDate: { type: String, required: true },

    category: { type: String, required: true },
    subcategory: { type: String, required: true },

    measurements: {
      type: Map,
      of: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order ||
  mongoose.model<OrderType>("Order", OrderSchema);
