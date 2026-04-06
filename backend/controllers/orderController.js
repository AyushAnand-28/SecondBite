import Order from "../models/Order.js";
import Product from "../models/Product.js";

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private (CONSUMER)
const placeOrder = async (req, res) => {
  try {
    const { storeId, items } = req.body;
    // items: [{ productId, quantity }]

    if (!storeId || !items || items.length === 0) {
      return res.status(400).json({ message: "storeId and items are required" });
    }

    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }
      if (product.status !== "AVAILABLE" || product.quantity < item.quantity) {
        return res.status(400).json({
          message: `"${product.name}" is unavailable or has insufficient stock`,
        });
      }

      // Snapshot product details at time of order
      orderItems.push({
        product: product._id,
        name: product.name,
        imageUrl: product.imageUrl,
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        quantity: item.quantity,
        unit: product.unit,
      });

      totalPrice += product.price * item.quantity;

      // Decrement stock
      product.quantity -= item.quantity;
      if (product.quantity === 0) product.status = "SOLD_OUT";
      await product.save();
    }

    const order = await Order.create({
      user: req.user._id,
      store: storeId,
      items: orderItems,
      totalPrice,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in consumer's order history
// @route   GET /api/orders/me
// @access  Private (CONSUMER)
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("store", "name city address")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders for a store owner's stores
// @route   GET /api/orders/store/:storeId
// @access  Private (STORE_OWNER)
const getStoreOrders = async (req, res) => {
  try {
    const orders = await Order.find({ store: req.params.storeId })
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (STORE_OWNER)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    const updated = await order.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel an order (consumer only, PENDING orders only)
// @route   PATCH /api/orders/:id/cancel
// @access  Private (CONSUMER)
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Ensure the order belongs to this consumer
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorised to cancel this order" });
    }

    if (order.status !== "PENDING") {
      return res.status(400).json({ message: `Cannot cancel an order that is already ${order.status.toLowerCase()}` });
    }

    // Restock products
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.quantity += item.quantity;
        if (product.status === "SOLD_OUT" && product.quantity > 0) product.status = "AVAILABLE";
        await product.save();
      }
    }

    order.status = "CANCELLED";
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { placeOrder, getMyOrders, getStoreOrders, updateOrderStatus, cancelOrder };
