import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", getProducts);                                                       // Public
router.get("/:id", getProductById);                                                 // Public
router.post("/", protect, authorize("STORE_OWNER"), upload.single("image"), createProduct);                 // Add product
router.put("/:id", protect, authorize("STORE_OWNER"), upload.single("image"), updateProduct);               // Update product
router.delete("/:id", protect, authorize("STORE_OWNER"), deleteProduct);            // Delete product

export default router;
