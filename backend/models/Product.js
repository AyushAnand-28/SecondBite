import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    price: {
      type: Number,
      required: [true, "Discounted price is required"],
      min: 0,
    },
    originalPrice: {
      type: Number,
      required: [true, "Original price is required"],
      min: 0,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: 0,
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
    category: {
      type: String,
      enum: ["BAKERY", "PRODUCE", "DAIRY", "MEAT", "SEAFOOD", "PANTRY", "PREPARED", "OTHER"],
      default: "OTHER",
    },
    status: {
      type: String,
      enum: ["AVAILABLE", "SOLD_OUT", "EXPIRED"],
      default: "AVAILABLE",
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
  },
  { timestamps: true }
);

// Virtual: discount percentage
productSchema.virtual("discountPercent").get(function () {
  if (!this.originalPrice || this.originalPrice === 0) return 0;
  return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
});

const Product = mongoose.model("Product", productSchema);
export default Product;
