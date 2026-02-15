import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getProducts);                                                       // Public
router.get("/:id", getProductById);                                                 // Public
router.post("/", protect, authorize("STORE_OWNER"), createProduct);                 // Add product
router.put("/:id", protect, authorize("STORE_OWNER"), updateProduct);               // Update product
router.delete("/:id", protect, authorize("STORE_OWNER"), deleteProduct);            // Delete product

export default router;
