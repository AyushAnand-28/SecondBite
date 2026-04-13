import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Store from "./models/Store.js";
import Product from "./models/Product.js";
import Order from "./models/Order.js";

dotenv.config();

// ─────────────────────────────────────────────────────────────────────────────
//  SAFETY GUARD
//  Usage (local dev only):
//    $env:SEED_CONFIRM="true"; node seed.js   (PowerShell)
//    SEED_CONFIRM=true node seed.js           (bash/mac)
// ─────────────────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === "production" && process.env.SEED_CONFIRM !== "true") {
  console.error(
    "\n❌  Refusing to seed: NODE_ENV is 'production'.\n" +
    "   Set SEED_CONFIRM=true explicitly if you really intend this.\n"
  );
  process.exit(1);
}

if (process.env.SEED_CONFIRM !== "true") {
  console.error(
    "\n❌  Refusing to seed: SEED_CONFIRM is not 'true'.\n" +
    "   PowerShell:  $env:SEED_CONFIRM=\"true\"; node seed.js\n" +
    "   Bash:        SEED_CONFIRM=true node seed.js\n" +
    "   WARNING: This will DELETE all existing data.\n"
  );
  process.exit(1);
}

console.log("⚠️  SEED_CONFIRM=true detected. Wiping and re-seeding the database...\n");

// ─── Helpers ──────────────────────────────────────────────────────────────────
const days = (n) => new Date(Date.now() + n * 86_400_000);

// ─── Seed ────────────────────────────────────────────────────────────────────
const seedData = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL || "mongodb://localhost:27017/secondbite");
    console.log("✅ Connected to MongoDB.\n");

    // Clear all collections
    await Promise.all([
      User.deleteMany(),
      Store.deleteMany(),
      Product.deleteMany(),
      Order.deleteMany(),
    ]);
    console.log("🗑️  Cleared existing data.\n");

    // ── Users ──────────────────────────────────────────────────────────────
    console.log("👤 Creating users...");

    const [consumer1, consumer2, consumer3, owner1, owner2, owner3] = await Promise.all([
      new User({ name: "Aanya Sharma",  email: "aanya@example.com",  password: "password123", role: "CONSUMER",    phone: "9876543210" }).save(),
      new User({ name: "Rohan Mehta",   email: "rohan@example.com",   password: "password123", role: "CONSUMER",    phone: "9123456789" }).save(),
      new User({ name: "Priya Nair",    email: "priya@example.com",   password: "password123", role: "CONSUMER",    phone: "9988776655" }).save(),
      new User({ name: "Ravi Bakshi",   email: "ravi@example.com",    password: "password123", role: "STORE_OWNER", phone: "9001122334" }).save(),
      new User({ name: "Meera Patel",   email: "meera@example.com",   password: "password123", role: "STORE_OWNER", phone: "9005566778" }).save(),
      new User({ name: "Suresh Kumar",  email: "suresh@example.com",  password: "password123", role: "STORE_OWNER", phone: "9009900990" }).save(),
    ]);
    console.log("   ✅ 6 users created (3 consumers, 3 store owners)\n");

    // ── Stores ─────────────────────────────────────────────────────────────
    console.log("🏪 Creating stores...");

    const [bakery, organics, dairy, deli] = await Store.create([
      {
        name: "Da Maria Artisan Bakery",
        description: "Handcrafted sourdoughs, croissants, and pastries rescued fresh every morning.",
        address: "12 Baker Street, Bandra West",
        city: "Mumbai",
        isVerified: true,
        owner: owner1._id,
      },
      {
        name: "Green Leaf Organics",
        description: "Certified organic produce — slightly imperfect, perfectly edible.",
        address: "45 Farm Road, Koramangala",
        city: "Bengaluru",
        isVerified: true,
        owner: owner2._id,
      },
      {
        name: "Farm Fresh Dairy Co.",
        description: "Local farm-sourced dairy. Near best-before but never past quality.",
        address: "7 Milk Colony, Aundh",
        city: "Pune",
        isVerified: true,
        owner: owner3._id,
      },
      {
        name: "The Corner Deli",
        description: "Prepared meals, charcuterie, and pantry staples at rescue prices.",
        address: "22 Connaught Circle",
        city: "Delhi",
        isVerified: true,
        owner: owner1._id,
      },
    ]);
    console.log("   ✅ 4 stores created\n");

    // ── Products ───────────────────────────────────────────────────────────
    console.log("📦 Creating products...");

    // Placeholder image from Unsplash (public, no auth required)
    const IMG = {
      bread:    "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
      croissant:"https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400",
      muffin:   "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400",
      cake:     "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
      spinach:  "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400",
      tomato:   "https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=400",
      apple:    "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400",
      banana:   "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400",
      milk:     "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400",
      cheese:   "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400",
      butter:   "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400",
      yogurt:   "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400",
      pasta:    "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400",
      sandwich: "https://images.unsplash.com/photo-1554080353-a576cf803bda?w=400",
      salad:    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
      soup:     "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400",
      chicken:  "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400",
      salmon:   "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400",
      nuts:     "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400",
      jam:      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400",
    };

    const products = await Product.create([
      // ── Bakery ──────────────────────────────────────────────────
      {
        name: "Classic Sourdough Loaf",
        description: "Baked this morning. Perfect crust, chewy crumb. Ideal for toast or sandwiches.",
        price: 45, originalPrice: 130, quantity: 8,
        expiryDate: days(1), category: "BAKERY", store: bakery._id,
        imageUrl: IMG.bread,
      },
      {
        name: "Butter Croissant Box (6 pcs)",
        description: "Buttery, flaky croissants from today's batch. Best eaten warm.",
        price: 80, originalPrice: 220, quantity: 4,
        expiryDate: days(1), category: "BAKERY", store: bakery._id,
        imageUrl: IMG.croissant,
      },
      {
        name: "Blueberry Muffin Tray (4 pcs)",
        description: "Moist muffins loaded with fresh blueberries. Same-day bake.",
        price: 60, originalPrice: 160, quantity: 6,
        expiryDate: days(1), category: "BAKERY", store: bakery._id,
        imageUrl: IMG.muffin,
      },
      {
        name: "Chocolate Ganache Cake Slice",
        description: "Rich Belgian chocolate ganache on a moist sponge. Slightly domed — 50% off.",
        price: 55, originalPrice: 120, quantity: 3,
        expiryDate: days(2), category: "BAKERY", store: bakery._id,
        imageUrl: IMG.cake,
      },

      // ── Produce ─────────────────────────────────────────────────
      {
        name: "Organic Spinach Bunch",
        description: "Slightly wilted leaves — great for curries, smoothies, or stir-fry.",
        price: 20, originalPrice: 50, quantity: 15,
        expiryDate: days(1), category: "PRODUCE", store: organics._id,
        imageUrl: IMG.spinach,
      },
      {
        name: "Roma Tomatoes (1 kg)",
        description: "Overripe but perfect for gravies, sauces, and bruschetta.",
        price: 25, originalPrice: 60, quantity: 20,
        expiryDate: days(2), category: "PRODUCE", store: organics._id,
        imageUrl: IMG.tomato,
      },
      {
        name: "Honeycrisp Apples (4 pcs)",
        description: "Cosmetically imperfect but incredibly sweet and crunchy.",
        price: 35, originalPrice: 90, quantity: 12,
        expiryDate: days(4), category: "PRODUCE", store: organics._id,
        imageUrl: IMG.apple,
      },
      {
        name: "Ripe Bananas (6 pcs)",
        description: "Perfect for banana bread, smoothies, or eating straight — deeply sweet.",
        price: 15, originalPrice: 40, quantity: 25,
        expiryDate: days(1), category: "PRODUCE", store: organics._id,
        imageUrl: IMG.banana,
      },

      // ── Dairy ───────────────────────────────────────────────────
      {
        name: "Full-Cream Milk (1L)",
        description: "Pasteurised whole milk from local farms. Best before tomorrow.",
        price: 30, originalPrice: 55, quantity: 20,
        expiryDate: days(1), category: "DAIRY", store: dairy._id,
        imageUrl: IMG.milk,
      },
      {
        name: "Aged Cheddar Block (200g)",
        description: "12-month aged cheddar, sharp and nutty. Close to best-before.",
        price: 120, originalPrice: 280, quantity: 6,
        expiryDate: days(5), category: "DAIRY", store: dairy._id,
        imageUrl: IMG.cheese,
      },
      {
        name: "Cultured Butter (250g)",
        description: "Slow-churned European-style butter. Near expiry but perfect quality.",
        price: 75, originalPrice: 160, quantity: 8,
        expiryDate: days(3), category: "DAIRY", store: dairy._id,
        imageUrl: IMG.butter,
      },
      {
        name: "Greek Yogurt (400g)",
        description: "Thick, tangy, high-protein yogurt. Best before in 2 days.",
        price: 40, originalPrice: 95, quantity: 10,
        expiryDate: days(2), category: "DAIRY", store: dairy._id,
        imageUrl: IMG.yogurt,
      },

      // ── Prepared / Pantry / Meat (Deli) ─────────────────────────
      {
        name: "Pesto Pasta Salad (350g)",
        description: "Ready-to-eat cold pasta with basil pesto, cherry tomatoes, and olives.",
        price: 70, originalPrice: 180, quantity: 5,
        expiryDate: days(1), category: "PREPARED", store: deli._id,
        imageUrl: IMG.pasta,
      },
      {
        name: "Club Sandwich (Whole)",
        description: "Triple-decker chicken and veggie club. Made this morning.",
        price: 65, originalPrice: 150, quantity: 7,
        expiryDate: days(1), category: "PREPARED", store: deli._id,
        imageUrl: IMG.sandwich,
      },
      {
        name: "Garden Salad Bowl",
        description: "Fresh mixed greens, cucumber, carrot, and house vinaigrette.",
        price: 50, originalPrice: 110, quantity: 9,
        expiryDate: days(1), category: "PREPARED", store: deli._id,
        imageUrl: IMG.salad,
      },
      {
        name: "Minestrone Soup (500ml)",
        description: "Hearty Italian vegetable soup. Ready to heat and serve.",
        price: 55, originalPrice: 130, quantity: 4,
        expiryDate: days(2), category: "PREPARED", store: deli._id,
        imageUrl: IMG.soup,
      },
      {
        name: "Rotisserie Chicken (Half)",
        description: "Slow-roasted half chicken seasoned with herbs. Same-day.",
        price: 140, originalPrice: 320, quantity: 3,
        expiryDate: days(1), category: "MEAT", store: deli._id,
        imageUrl: IMG.chicken,
      },
      {
        name: "Atlantic Salmon Fillet (200g)",
        description: "Fresh sushi-grade salmon, best cooked today.",
        price: 180, originalPrice: 400, quantity: 4,
        expiryDate: days(1), category: "SEAFOOD", store: deli._id,
        imageUrl: IMG.salmon,
      },
      {
        name: "Mixed Nuts & Trail Mix (300g)",
        description: "Almonds, cashews, walnuts, dried cranberries. Near best-before.",
        price: 90, originalPrice: 200, quantity: 12,
        expiryDate: days(10), category: "PANTRY", store: deli._id,
        imageUrl: IMG.nuts,
      },
      {
        name: "Strawberry Preserve Jar (250g)",
        description: "Artisan jam made from rescued strawberries. No artificial additives.",
        price: 65, originalPrice: 140, quantity: 8,
        expiryDate: days(30), category: "PANTRY", store: deli._id,
        imageUrl: IMG.jam,
      },
    ]);
    console.log(`   ✅ ${products.length} products created across 4 stores\n`);

    // ── Orders ─────────────────────────────────────────────────────────────
    console.log("🛒 Creating orders...");

    await Order.create([
      // Consumer 1 — 3 orders in different states
      {
        user: consumer1._id, store: bakery._id,
        items: [
          { product: products[0]._id, name: products[0].name, price: products[0].price, quantity: 2 },
          { product: products[1]._id, name: products[1].name, price: products[1].price, quantity: 1 },
        ],
        totalPrice: 2 * 45 + 80,
        status: "COMPLETED",
        note: "Leave at the door, please.",
      },
      {
        user: consumer1._id, store: organics._id,
        items: [
          { product: products[4]._id, name: products[4].name, price: products[4].price, quantity: 2 },
          { product: products[5]._id, name: products[5].name, price: products[5].price, quantity: 1 },
        ],
        totalPrice: 2 * 20 + 25,
        status: "CONFIRMED",
      },
      {
        user: consumer1._id, store: deli._id,
        items: [
          { product: products[12]._id, name: products[12].name, price: products[12].price, quantity: 1 },
          { product: products[14]._id, name: products[14].name, price: products[14].price, quantity: 1 },
        ],
        totalPrice: 70 + 50,
        status: "PENDING",
        note: "Quick pickup in 30 mins.",
      },

      // Consumer 2 — 3 orders
      {
        user: consumer2._id, store: dairy._id,
        items: [
          { product: products[8]._id,  name: products[8].name,  price: products[8].price,  quantity: 2 },
          { product: products[11]._id, name: products[11].name, price: products[11].price, quantity: 1 },
        ],
        totalPrice: 2 * 30 + 40,
        status: "COMPLETED",
      },
      {
        user: consumer2._id, store: bakery._id,
        items: [
          { product: products[3]._id, name: products[3].name, price: products[3].price, quantity: 2 },
        ],
        totalPrice: 2 * 55,
        status: "CONFIRMED",
        note: "Can I get extra napkins?",
      },
      {
        user: consumer2._id, store: deli._id,
        items: [
          { product: products[16]._id, name: products[16].name, price: products[16].price, quantity: 1 },
          { product: products[17]._id, name: products[17].name, price: products[17].price, quantity: 1 },
        ],
        totalPrice: 140 + 180,
        status: "PENDING",
      },

      // Consumer 3 — 2 orders
      {
        user: consumer3._id, store: organics._id,
        items: [
          { product: products[6]._id, name: products[6].name, price: products[6].price, quantity: 3 },
          { product: products[7]._id, name: products[7].name, price: products[7].price, quantity: 2 },
        ],
        totalPrice: 3 * 35 + 2 * 15,
        status: "COMPLETED",
      },
      {
        user: consumer3._id, store: dairy._id,
        items: [
          { product: products[9]._id,  name: products[9].name,  price: products[9].price,  quantity: 1 },
          { product: products[10]._id, name: products[10].name, price: products[10].price, quantity: 2 },
        ],
        totalPrice: 120 + 2 * 75,
        status: "CONFIRMED",
        note: "Sensitive to strong smells — pack separately please.",
      },
    ]);
    console.log("   ✅ 8 orders created\n");

    // ── Summary ────────────────────────────────────────────────────────────
    console.log("─".repeat(55));
    console.log("🌱 SecondBite seed complete!\n");
    console.log("  👤 TEST ACCOUNTS (password: password123)");
    console.log("  ┌──────────────────────────────────────────────────┐");
    console.log("  │ CONSUMER   aanya@example.com                     │");
    console.log("  │ CONSUMER   rohan@example.com                     │");
    console.log("  │ CONSUMER   priya@example.com                     │");
    console.log("  │ STORE OWN  ravi@example.com  (2 stores: Bakery,  │");
    console.log("  │                               Deli)              │");
    console.log("  │ STORE OWN  meera@example.com (1 store: Organics) │");
    console.log("  │ STORE OWN  suresh@example.com(1 store: Dairy)    │");
    console.log("  └──────────────────────────────────────────────────┘");
    console.log("  📦 20 products | 🛒 8 orders (PENDING/CONFIRMED/COMPLETED)");
    console.log("─".repeat(55));

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error.message);
    process.exit(1);
  }
};

seedData();
