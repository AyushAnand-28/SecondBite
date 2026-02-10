#!/usr/bin/env bash
set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; RESET='\033[0m'
log()  { echo -e "${GREEN}[setup]${RESET}  $*"; }
info() { echo -e "${CYAN}[info]${RESET}   $*"; }
skip() { echo -e "${YELLOW}[skip]${RESET}   $*  (already exists)"; }

write_file() {
  local path="$1"; shift
  if [[ -f "$path" ]]; then
    skip "$path"
  else
    log "Creating $path"
    cat > "$path"
  fi
}

log "Step 1: directories..."
mkdir -p \
  .github/workflows \
  client/src/{assets,components,pages,services,hooks,store} \
  client/public \
  server/src/{routes,controllers,services,middleware} \
  server/prisma \
  server/tests/{unit,integration} \
  shared/{types,utils,validation} \
  e2e/tests

log "Step 2: root config files..."

write_file ".gitignore" << 'EOF'
node_modules/
dist/
build/
.vite/
.env
.env.*
!.env.example
server/src/generated/
.DS_Store
Thumbs.db
coverage/
playwright-report/
test-results/
EOF

write_file ".eslintrc.cjs" << 'EOF'
/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  env: { node: true, es2022: true, browser: true },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
  },
};
EOF

write_file ".prettierrc" << 'EOF'
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
EOF

write_file ".nvmrc" << 'EOF'
20
EOF

log "Step 3: GitHub Actions workflow..."

write_file ".github/workflows/ci-cd.yml" << 'EOF'
name: SecondBite CI/CD

on:
  push:
    branches: ["main", "develop"]
  pull_request:
    branches: ["main", "develop"]

env:
  NODE_VERSION: "20"

jobs:
  lint-and-test:
    name: Lint & Test
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: secondbite
          POSTGRES_PASSWORD: secondbite_test
          POSTGRES_DB: secondbite_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"
          cache-dependency-path: |
            server/package-lock.json
            client/package-lock.json

      - name: Install server deps
        working-directory: server
        run: npm ci

      - name: Lint server
        working-directory: server
        run: npm run lint

      - name: Format check server
        working-directory: server
        run: npm run format:check

      - name: Generate Prisma client
        working-directory: server
        env:
          DATABASE_URL: postgresql://secondbite:secondbite_test@localhost:5432/secondbite_test
        run: npx prisma generate

      - name: Run migrations
        working-directory: server
        env:
          DATABASE_URL: postgresql://secondbite:secondbite_test@localhost:5432/secondbite_test
        run: npx prisma migrate deploy

      - name: Jest tests
        working-directory: server
        env:
          DATABASE_URL: postgresql://secondbite:secondbite_test@localhost:5432/secondbite_test
          NODE_ENV: test
          JWT_SECRET: ci_test_secret
        run: npm test -- --coverage

      - name: Install client deps
        working-directory: client
        run: npm ci

      - name: Lint client
        working-directory: client
        run: npm run lint

      - name: Format check client
        working-directory: client
        run: npm run format:check

      - name: Build client
        working-directory: client
        run: npm run build

  e2e:
    name: Playwright E2E
    runs-on: ubuntu-latest
    needs: lint-and-test
    if: github.event_name == 'pull_request' && github.base_ref == 'main'

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Install e2e deps
        working-directory: e2e
        run: npm ci

      - name: Install Playwright browsers
        working-directory: e2e
        run: npx playwright install --with-deps chromium

      - name: Run Playwright
        working-directory: e2e
        run: npx playwright test

      - name: Upload report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: e2e/playwright-report/
          retention-days: 7

  deploy:
    name: Deploy to EC2
    runs-on: ubuntu-latest
    needs: lint-and-test
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - uses: actions/checkout@v4

      # Needs these secrets: EC2_HOST, EC2_USER, EC2_SSH_KEY, EC2_DEPLOY_PATH
      - name: SSH deploy
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            set -e
            cd ${{ secrets.EC2_DEPLOY_PATH }}
            git pull origin main
            cd server && npm ci --omit=dev && cd ..
            cd client && npm ci && npm run build && cd ..
            cd server && npx prisma migrate deploy && cd ..
            pm2 restart secondbite-server || pm2 start server/dist/index.js --name secondbite-server
EOF

log "Step 4: Dependabot config..."

write_file ".github/dependabot.yml" << 'EOF'
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/server"
    schedule:
      interval: "weekly"
    labels: ["dependencies", "backend"]

  - package-ecosystem: "npm"
    directory: "/client"
    schedule:
      interval: "weekly"
    labels: ["dependencies", "frontend"]

  - package-ecosystem: "npm"
    directory: "/e2e"
    schedule:
      interval: "weekly"
    labels: ["dependencies", "e2e"]

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    labels: ["dependencies", "ci-cd"]
EOF

log "Step 5: server scaffold..."

write_file "server/package.json" << 'EOF'
{
  "name": "secondbite-server",
  "version": "0.1.0",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write src",
    "format:check": "prettier --check src",
    "test": "jest --runInBand",
    "test:watch": "jest --watch",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^5.13.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.12",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/node": "^20.14.0",
    "@types/supertest": "^6.0.2",
    "@typescript-eslint/eslint-plugin": "^7.13.0",
    "@typescript-eslint/parser": "^7.13.0",
    "eslint": "^8.57.0",
    "eslint-config-prettier": "^9.1.0",
    "jest": "^29.7.0",
    "prettier": "^3.3.2",
    "prisma": "^5.13.0",
    "supertest": "^7.0.0",
    "ts-jest": "^29.1.4",
    "tsx": "^4.15.7",
    "typescript": "^5.4.5"
  }
}
EOF

write_file "server/.env.example" << 'EOF'
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/secondbite?schema=public"
PORT=3000
NODE_ENV=development
JWT_SECRET=change_this_in_production
JWT_EXPIRES_IN=7d
EOF

write_file "server/tsconfig.json" << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
EOF

write_file "server/jest.config.ts" << 'EOF'
import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/index.ts"],
  coverageDirectory: "coverage",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

export default config;
EOF

write_file "server/prisma/schema.prisma" << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  orders Order[]

  @@map("users")
}

model Vendor {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String
  address      String
  phone        String
  logoUrl      String?
  isVerified   Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  products Product[]

  @@map("vendors")
}

model Product {
  id            String   @id @default(cuid())
  vendorId      String
  name          String
  description   String?
  originalPrice Float
  discountPrice Float
  quantity      Int
  expiryDate    DateTime
  imageUrl      String?
  isAvailable   Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  vendor Vendor  @relation(fields: [vendorId], references: [id], onDelete: Cascade)
  orders Order[]

  @@index([vendorId])
  @@index([expiryDate])
  @@index([isAvailable])
  @@map("products")
}

model Order {
  id         String      @id @default(cuid())
  userId     String
  productId  String
  quantity   Int
  totalPrice Float
  status     OrderStatus @default(PENDING)
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt

  user    User    @relation(fields: [userId], references: [id])
  product Product @relation(fields: [productId], references: [id])

  @@index([userId])
  @@index([productId])
  @@index([status])
  @@map("orders")
}

enum OrderStatus {
  PENDING
  CONFIRMED
  READY_FOR_PICKUP
  COMPLETED
  CANCELLED
}
EOF

write_file "server/src/index.ts" << 'EOF'
import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
EOF

write_file "server/prisma/seed.ts" << 'EOF'
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const vendor = await prisma.vendor.upsert({
    where: { email: "greens@demo.com" },
    update: {},
    create: {
      name: "Green Corner Market",
      email: "greens@demo.com",
      passwordHash: await bcrypt.hash("password123", 10),
      address: "12 Market Street, Springfield",
      phone: "+1-555-0100",
      isVerified: true,
    },
  });

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const in3Days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  await prisma.product.createMany({
    skipDuplicates: true,
    data: [
      {
        vendorId: vendor.id,
        name: "Organic Strawberries",
        description: "Fresh strawberries, best before tomorrow.",
        originalPrice: 4.99,
        discountPrice: 1.99,
        quantity: 20,
        expiryDate: tomorrow,
      },
      {
        vendorId: vendor.id,
        name: "Artisan Sourdough Loaf",
        description: "Freshly baked sourdough, still tastes great.",
        originalPrice: 6.5,
        discountPrice: 2.5,
        quantity: 5,
        expiryDate: in3Days,
      },
    ],
  });

  console.log("Seed done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
EOF

log "Step 6: client scaffold..."

write_file "client/package.json" << 'EOF'
{
  "name": "secondbite-client",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write src",
    "format:check": "prettier --check src"
  },
  "dependencies": {
    "axios": "^1.7.2",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.23.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@typescript-eslint/eslint-plugin": "^7.13.0",
    "@typescript-eslint/parser": "^7.13.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-react-hooks": "^4.6.2",
    "eslint-plugin-react-refresh": "^0.4.7",
    "postcss": "^8.4.38",
    "prettier": "^3.3.2",
    "prettier-plugin-tailwindcss": "^0.6.5",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.4.5",
    "vite": "^5.3.0"
  }
}
EOF

write_file "client/vite.config.ts" << 'EOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
EOF

write_file "client/tailwind.config.ts" << 'EOF'
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          900: "#14532d",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
EOF

write_file "client/index.html" << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Buy near-expiry food at a discount and help reduce food waste." />
    <title>SecondBite | Reduce Food Waste, Save Money</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

write_file "client/src/main.tsx" << 'EOF'
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF

write_file "client/src/App.tsx" << 'EOF'
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div className="p-8 font-sans text-2xl font-bold text-brand-600">
              🌿 SecondBite — coming soon
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
EOF

write_file "client/src/index.css" << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply font-sans bg-white text-gray-900 antialiased;
  }
}
EOF

log "Step 7: shared package..."

write_file "shared/types/index.ts" << 'EOF'
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "READY_FOR_PICKUP"
  | "COMPLETED"
  | "CANCELLED";
EOF

write_file "shared/utils/index.ts" << 'EOF'
export const formatPrice = (amount: number, currency = "USD"): string =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

export const discountPercent = (original: number, discounted: number): number =>
  Math.round(((original - discounted) / original) * 100);

export const isExpiringSoon = (date: Date | string, days = 3): boolean => {
  const expiry = new Date(date).getTime();
  const threshold = days * 24 * 60 * 60 * 1000;
  return expiry - Date.now() <= threshold && expiry > Date.now();
};
EOF

log "Step 8: e2e scaffold..."

write_file "e2e/package.json" << 'EOF'
{
  "name": "secondbite-e2e",
  "version": "0.1.0",
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:report": "playwright show-report"
  },
  "devDependencies": {
    "@playwright/test": "^1.45.0"
  }
}
EOF

write_file "e2e/playwright.config.ts" << 'EOF'
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    cwd: "../client",
  },
});
EOF

write_file "e2e/tests/smoke.spec.ts" << 'EOF'
import { test, expect } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/SecondBite/);
});
EOF

log "Step 9: README..."

if [[ ! -s "README.md" ]]; then
  write_file "README.md" << 'EOF'
# SecondBite

Local vendors list near-expiry food. Consumers buy it at a discount. Less waste, more savings.

## Quick Start

```bash
bash setup.sh

cp server/.env.example server/.env  # fill in DATABASE_URL

cd server && npm install
cd ../client && npm install
cd ../e2e && npm install

# in /server
npx prisma migrate dev
npm run db:seed
npm run dev

# in /client (separate terminal)
npm run dev
```

| Directory | What's in there |
|---|---|
| `/client` | React + Vite + Tailwind |
| `/server` | Express + Prisma API |
| `/shared` | Shared types and utils |
| `/e2e` | Playwright tests |
EOF
fi

echo ""
echo -e "${GREEN}Done! Run 'cp server/.env.example server/.env' and fill in your database URL.${RESET}"
echo ""
info "Then: cd server && npm install && npx prisma migrate dev && npm run dev"
info "And:  cd client && npm install && npm run dev"
echo ""
