import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database catalog data...");

  // Clean existing records if any
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Default Admin & Customer Users
  const customer = await prisma.user.create({
    data: {
      email: "customer@example.com",
      name: "Jane Doe",
      role: "CUSTOMER",
      addresses: {
        create: {
          fullName: "Jane Doe",
          streetLine1: "123 Market St",
          city: "San Francisco",
          state: "CA",
          postalCode: "94105",
          country: "US",
          isDefault: true,
        },
      },
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Store Admin",
      role: "ADMIN",
    },
  });

  // 2. Create Categories
  const audioCategory = await prisma.category.create({
    data: {
      name: "Audio & Acoustics",
      slug: "audio-acoustics",
      description: "High fidelity wireless headphones, earbuds, and premium sound systems.",
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    },
  });

  const wearablesCategory = await prisma.category.create({
    data: {
      name: "Smart Wearables",
      slug: "smart-wearables",
      description: "Precision smartwatches and fitness tracking devices for active lifestyle.",
      imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    },
  });

  const accessoriesCategory = await prisma.category.create({
    data: {
      name: "Desk & Accessories",
      slug: "desk-accessories",
      description: "Ergonomic desk gear, mechanical keyboards, and minimalist everyday carry.",
      imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80",
    },
  });

  // 3. Create Products with Variants
  // Product 1: Wireless ANC Headphones
  await prisma.product.create({
    data: {
      name: "Aura Pro Wireless Headphones",
      slug: "aura-pro-wireless-headphones",
      description: "Studio-grade active noise cancellation with 40-hour battery life, spatial audio, and memory foam comfort.",
      basePrice: 299.00,
      categoryId: audioCategory.id,
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80",
      ],
      featured: true,
      variants: {
        create: [
          {
            sku: "AURA-HEAD-BLK",
            name: "Midnight Black",
            price: 299.00,
            stock: 45,
            attributes: { color: "Midnight Black" },
          },
          {
            sku: "AURA-HEAD-SLV",
            name: "Silver Arctic",
            price: 299.00,
            stock: 30,
            attributes: { color: "Silver Arctic" },
          },
        ],
      },
    },
  });

  // Product 2: Smart Fitness Watch
  await prisma.product.create({
    data: {
      name: "Aura Pulse Smartwatch",
      slug: "aura-pulse-smartwatch",
      description: "Sapphire glass AMOLED display, continuous biometric health tracking, ECG, and 7-day battery life.",
      basePrice: 249.00,
      categoryId: wearablesCategory.id,
      images: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
        "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80",
      ],
      featured: true,
      variants: {
        create: [
          {
            sku: "AURA-WATCH-42-BLK",
            name: "42mm Obsidian",
            price: 249.00,
            stock: 25,
            attributes: { size: "42mm", color: "Obsidian" },
          },
          {
            sku: "AURA-WATCH-46-TIT",
            name: "46mm Titanium",
            price: 289.00,
            stock: 15,
            attributes: { size: "46mm", color: "Titanium" },
          },
        ],
      },
    },
  });

  // Product 3: Mechanical Keyboard
  await prisma.product.create({
    data: {
      name: "Aura Tactile Mechanical Keyboard",
      slug: "aura-tactile-mechanical-keyboard",
      description: "Anodized CNC aluminum body, hot-swappable tactile switches, RGB per-key backlighting, and Bluetooth 5.2.",
      basePrice: 179.00,
      categoryId: accessoriesCategory.id,
      images: [
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80",
      ],
      featured: false,
      variants: {
        create: [
          {
            sku: "AURA-KEY-BROWN",
            name: "Brown Tactile Switches",
            price: 179.00,
            stock: 50,
            attributes: { switch: "Brown Tactile" },
          },
          {
            sku: "AURA-KEY-RED",
            name: "Red Linear Switches",
            price: 179.00,
            stock: 40,
            attributes: { switch: "Red Linear" },
          },
        ],
      },
    },
  });

  // Product 4: Minimalist Wireless Charging Stand
  await prisma.product.create({
    data: {
      name: "Aura 3-in-1 Mag Wireless Charger",
      slug: "aura-3-in-1-mag-wireless-charger",
      description: "Fast 15W Qi2 wireless charging stand designed for phone, watch, and earbuds simultaneously with aerospace aluminum.",
      basePrice: 89.00,
      categoryId: accessoriesCategory.id,
      images: [
        "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&q=80",
      ],
      featured: true,
      variants: {
        create: [
          {
            sku: "AURA-CHG-SPACE",
            name: "Space Gray",
            price: 89.00,
            stock: 60,
            attributes: { color: "Space Gray" },
          },
        ],
      },
    },
  });

  console.log("Seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
