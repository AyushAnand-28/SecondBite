# SecondBite: Hyper-Local "Dark Store" for Food Waste

## The Concept
A platform that connects local grocery stores or bakeries with consumers to sell "ugly" produce or items approaching their "best-by" date at a steep discount.

## Impact
Reduces food waste and provides affordable nutrition to low-income students or families.

## Tech Stack
| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React (Vite)                      |
| Backend    | Node.js + Express (ESM modules)   |
| Database   | MongoDB (via Mongoose ODM)        |
| Auth       | JWT + bcryptjs                    |

## Project Flow (High Level)
```
User (Consumer / Store Owner)
        │
        ▼
  [ Frontend - React ]
        │  REST API calls
        ▼
  [ Backend - Express ]
        │
        ├── Auth Routes    → Register / Login (JWT)
        ├── Store Routes   → CRUD for stores (Store Owners only)
        ├── Product Routes → List/Add/Update discounted items
        └── Order Routes   → Place/Track orders (Consumers)
        │
        ▼
  [ MongoDB via Mongoose ]
        │
        ├── User     (role: CONSUMER | STORE_OWNER | ADMIN)
        ├── Store    (owned by STORE_OWNER users)
        ├── Product  (listed by Stores, near-expiry/discounted)
        └── Order    (placed by Consumers, embeds OrderItems)
```

---

## Data Models

### User
- `name`, `email`, `password` (hashed), `phone`
- `role`: `CONSUMER | STORE_OWNER | ADMIN`
- Methods: `matchPassword()` for login comparison

### Store
- `name`, `description`, `address`, `city`, `imageUrl`
- `isVerified` (admin-controlled), `isActive`
- Ref: `owner → User`

### Product
- `name`, `description`, `imageUrl`
- `price` (discounted), `originalPrice` (to show savings)
- `quantity`, `expiryDate`
- `category`: `BAKERY | PRODUCE | DAIRY | MEAT | SEAFOOD | PANTRY | PREPARED | OTHER`
- `status`: `AVAILABLE | SOLD_OUT | EXPIRED`
- Virtual: `discountPercent` (computed from price vs originalPrice)
- Ref: `store → Store`

### Order (with embedded OrderItems)
- `totalPrice`, `status`: `PENDING | CONFIRMED | COMPLETED | CANCELLED`
- `note` (optional consumer message)
- Ref: `user → User`, `store → Store`
- Embedded: `items[]` → `{ product, name, imageUrl, price, quantity }` (price/name snapshot at order time)

---

## Features Implemented & Progress Log

### Phase 1: Project Setup & Foundation ✅
- [x] Backend initialized (`package.json`, ESM modules, Express, CORS, dotenv)
- [x] Database config (`config/db.js`) using Mongoose
- [x] Basic Express server (`server.js`)
- [x] Environment variables (`.env`) with `DATABASE_URL`

### Phase 2: Database Schema (Mongoose Models) ✅
- [x] `models/User.js` — User with role, bcryptjs password hashing, `matchPassword()` helper
- [x] `models/Store.js` — Store with owner ref, city, active/verified flags
- [x] `models/Product.js` — Product with discount, expiry, category, status, `discountPercent` virtual
- [x] `models/Order.js` — Order with embedded OrderItems (price snapshot), status, note

### Phase 3: Authentication ✅
- [x] `POST /api/auth/register` — Register user (role: CONSUMER or STORE_OWNER)
- [x] `POST /api/auth/login` — Login, return JWT
- [x] `GET /api/auth/me` — Get logged-in user profile
- [x] JWT `protect` middleware to guard private routes
- [x] `authorize(...roles)` middleware for role-based access control

### Phase 4: Store & Product APIs ✅
- [x] `POST /api/stores` — Create store (STORE_OWNER only)
- [x] `GET /api/stores` — List all active stores
- [x] `POST /api/products` — Add discounted product to store
- [x] `GET /api/products` — Browse products (filter by city/category/store)
- [x] `PUT /api/products/:id` — Update product (STORE_OWNER)

### Phase 5: Order APIs ✅
- [x] `POST /api/orders` — Place an order (validates stock, decrements quantity, snapshots prices)
- [x] `GET /api/orders/me` — Consumer's order history
- [x] `GET /api/orders/store/:storeId` — Store owner's incoming orders
- [x] `PUT /api/orders/:id/status` — Update order status (STORE_OWNER or ADMIN)

### Phase 6: Frontend — React + Vite ✅
- [x] Landing page (hero, how it works, featured stores)
- [x] Store listing + product browsing
- [x] Cart & checkout flow
- [x] Consumer dashboard (order history)
- [x] Store Owner dashboard (manage products, orders)

### Phase 7: Deployment (TODO)
- [ ] Backend → Render / Railway
- [ ] Frontend → Vercel
- [ ] Database → MongoDB Atlas (free tier)
