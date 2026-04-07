# SecondBite 🍔

SecondBite is a hyper-local "dark store" platform that connects local grocery stores, bakeries, and food vendors directly with consumers. It offers a direct channel to seamlessly sell perfectly good but aesthetically imperfect or near-best-by date food at a steep discount.

## 🌟 What Problem Does It Solve?

1. **Food Waste:** Rescues perfectly good food from landfills simply because of aesthetic imperfections or expiring shelf life.
2. **Affordable Nutrition:** Provides budget-conscious consumers access to high-quality, nutritious food at a fraction of retail cost.
3. **Business Loss Recovery:** Enables local vendors to recover costs from inventory that would otherwise be a total loss.

## 🚀 Tech Stack

### Frontend
- **React 19 + Vite:** Component-based UI with an ultra-fast dev server and build tool.
- **Vanilla CSS:** Custom styling for explicit control over a premium "glassmorphism" aesthetic.
- **React Router DOM:** For client-side routing.
- **Axios & Lucide React:** For API requests and iconography.

### Backend
- **Node.js + Express.js:** Lightweight server framework for rapid REST API development.
- **MongoDB + Mongoose:** Flexible NoSQL database schema for varying product categories and orders.
- **JSON Web Tokens (JWT) & bcryptjs:** Stateless, secure role-based authentication (`CONSUMER` and `STORE_OWNER` roles).
- **Multer & Cloudinary:** Efficient image uploading and cloud storage for product images.

## 🛠 Prerequisites

Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)
- [Cloudinary Account](https://cloudinary.com/) (For image hosting)

## 💻 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AyushAnand-28/SecondBite.git
   cd SecondBite
   ```

2. **Environment Setup:**
   Copy the example environment file and configure the variables. Add the created `.env` file to your backend root folder if you start the server from there.
   ```bash
   cp .env.example backend/.env
   ```
   *Note: Ensure you place your MongoDB Connection String, JWT Secret, and Cloudinary credentials inside your `.env`.*

3. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

4. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

## 🏁 Running the Application

To run the application locally, you will need to start both the backend and frontend development servers.

**1. Start the Backend:**
```bash
cd backend
npm run dev
```
*The backend server will run continuously on your defined PORT (e.g., http://localhost:5000) using `nodemon`.*

**2. Start the Frontend:**
```bash
Open a new terminal tab
cd frontend
npm run dev
```
*The Vite development server will start and provide a local URL (e.g., http://localhost:5173).*

## 👥 User Roles

- **Consumer**: Can browse listed products locally from various stores, add items from multiple stores into a single cart, and place orders directly to save costs.
- **Store Owner**: Has a dedicated dashboard to list new discounted items with product images, manage store inventory, and fulfill placed orders to recover possible business losses.
