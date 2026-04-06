import express from "express";
import {
  placeOrder,
  getMyOrders,
  getStoreOrders,
  updateOrderStatus,
  cancelOrder,
} from "../controllers/orderController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, authorize("CONSUMER"), placeOrder);                                           // Place order
router.get("/me", protect, authorize("CONSUMER"), getMyOrders);                                         // My orders
router.get("/store/:storeId", protect, authorize("STORE_OWNER"), getStoreOrders);                       // Store's orders
router.put("/:id/status", protect, authorize("STORE_OWNER", "ADMIN"), updateOrderStatus);               // Update status (store owner)
router.patch("/:id/cancel", protect, authorize("CONSUMER"), cancelOrder);                               // Cancel order (consumer)

export default router;
