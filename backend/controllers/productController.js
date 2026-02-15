import Product from "../models/Product.js";
import Store from "../models/Store.js";

// @desc    Add a product to a store
// @route   POST /api/products
// @access  Private (STORE_OWNER)
const createProduct = async (req, res) => {
  try {
    const { name, description, imageUrl, price, originalPrice, quantity, expiryDate, category, storeId } = req.body;

    if (!name || !price || !originalPrice || !quantity || !expiryDate || !storeId) {
      return res.status(400).json({ message: "name, price, originalPrice, quantity, expiryDate, and storeId are required" });
    }

    // Verify the store belongs to the requesting user
    const store = await Store.findById(storeId);
    if (!store) return res.status(404).json({ message: "Store not found" });
    if (store.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to add products to this store" });
    }

    const product = await Product.create({
      name, description, imageUrl, price, originalPrice,
      quantity, expiryDate, category, store: storeId,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all available products (filter by city, category, storeId)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, storeId } = req.query;
    const filter = { status: "AVAILABLE" };
    if (category) filter.category = category.toUpperCase();
    if (storeId) filter.store = storeId;

    const products = await Product.find(filter)
      .populate("store", "name city address")
      .sort({ expiryDate: 1 }); // soonest-expiring first

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("store", "name city address");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (STORE_OWNER — must own the store)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("store");
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.store.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this product" });
    }

    const fields = ["name", "description", "imageUrl", "price", "originalPrice", "quantity", "expiryDate", "category", "status"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    });

    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (STORE_OWNER)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("store");
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.store.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this product" });
    }

    await product.deleteOne();
    res.json({ message: "Product removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { createProduct, getProducts, getProductById, updateProduct, deleteProduct };
