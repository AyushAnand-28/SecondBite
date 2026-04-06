import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "./models/User.js";
import Store from "./models/Store.js";
import Product from "./models/Product.js";
import Order from "./models/Order.js";

dotenv.config();

const clearDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL || "mongodb://localhost:27017/secondbite");
    console.log("✅ Connected to MongoDB.");

    await User.deleteMany({});
    await Store.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});

    console.log("🗑️ Successfully wiped all simulated data. Database is totally clean.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error wiping data:", error);
    process.exit(1);
  }
};

clearDB();
