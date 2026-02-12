import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Store name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
    },
    imageUrl: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Store = mongoose.model("Store", storeSchema);
export default Store;
