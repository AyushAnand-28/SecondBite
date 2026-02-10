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
