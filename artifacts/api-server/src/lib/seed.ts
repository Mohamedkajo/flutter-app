import { db } from "@workspace/db";
import {
  usersTable, categoriesTable, storesTable, productsTable,
  productVariantsTable, productAddonsTable, couponsTable,
  flashSalesTable, flashSaleProductsTable, notificationsTable,
  walletsTable, walletTransactionsTable, ordersTable, orderItemsTable,
  cartTable, reviewsTable
} from "@workspace/db";
import { logger } from "./logger";

export async function seed() {
  try {
    // Check if already seeded
    const existingCategories = await db.select().from(categoriesTable).limit(1);
    if (existingCategories.length > 0) {
      logger.info("Database already seeded, skipping");
      return;
    }

    logger.info("Seeding database...");

    // Categories
    const categories = await db.insert(categoriesTable).values([
      { name: "Food", slug: "food", icon: "🍔", storeCount: 45 },
      { name: "Groceries", slug: "groceries", icon: "🛒", storeCount: 32 },
      { name: "Health", slug: "health", icon: "💊", storeCount: 18 },
      { name: "Coffee", slug: "coffee", icon: "☕", storeCount: 24 },
      { name: "Fashion", slug: "fashion", icon: "👗", storeCount: 38 },
      { name: "Electronics", slug: "electronics", icon: "📱", storeCount: 22 },
      { name: "Beauty", slug: "beauty", icon: "💄", storeCount: 15 },
      { name: "Flowers", slug: "flowers", icon: "🌹", storeCount: 8 },
    ]).returning();

    // Users
    const users = await db.insert(usersTable).values([
      { name: "Ahmed Al-Rashid", email: "ahmed@example.com", password: "password123", phone: "+201234567890", role: "customer", loyaltyPoints: 450 },
      { name: "Mohamed Khalil", email: "driver@example.com", password: "password123", phone: "+201234567891", role: "driver", loyaltyPoints: 0 },
      { name: "Sara's Kitchen", email: "merchant@example.com", password: "password123", phone: "+201234567892", role: "merchant", loyaltyPoints: 0 },
      { name: "Admin User", email: "admin@cargo.com", password: "admin123", phone: "+201234567893", role: "admin", loyaltyPoints: 0 },
      { name: "Layla Hassan", email: "layla@example.com", password: "password123", phone: "+201234567894", role: "customer", loyaltyPoints: 220 },
    ]).returning();

    const customer = users[0];
    const merchantUser = users[2];

    // Stores
    const stores = await db.insert(storesTable).values([
      {
        userId: merchantUser.id,
        name: "Sara's Kitchen",
        slug: "saras-kitchen",
        description: "Authentic Egyptian home-cooked meals delivered fresh to your door. Family recipes since 1985.",
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600",
        bannerImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200",
        logo: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200",
        categoryId: categories[0].id,
        categoryName: "Food",
        categoryIcon: "🍔",
        address: "15 El-Tahrir Square, Cairo",
        phone: "+20112345678",
        rating: 4.8,
        reviewCount: 324,
        deliveryTime: "20-30 Min",
        deliveryFee: 15,
        minOrder: 80,
        isOpen: true,
        isFeatured: true,
        isVerified: true,
        isTrending: true,
        productCategories: JSON.stringify(["Grills", "Rice Dishes", "Soups", "Desserts", "Drinks"]),
      },
      {
        name: "Baraka Fresh Market",
        slug: "baraka-fresh-market",
        description: "Premium organic groceries and fresh produce delivered in 30 minutes.",
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600",
        bannerImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200",
        categoryId: categories[1].id,
        categoryName: "Groceries",
        categoryIcon: "🛒",
        address: "45 Corniche El Nil, Maadi",
        phone: "+20123456789",
        rating: 4.6,
        reviewCount: 189,
        deliveryTime: "25-40 Min",
        deliveryFee: 10,
        minOrder: 100,
        isOpen: true,
        isFeatured: true,
        isVerified: true,
        productCategories: JSON.stringify(["Vegetables", "Fruits", "Dairy", "Meat", "Bakery"]),
      },
      {
        name: "Pharma Plus",
        slug: "pharma-plus",
        description: "Medicines, vitamins, and health products delivered 24/7.",
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600",
        logo: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200",
        bannerImage: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1200",
        categoryId: categories[2].id,
        categoryName: "Health",
        categoryIcon: "💊",
        address: "22 Heliopolis St, Cairo",
        phone: "+20198765432",
        rating: 4.9,
        reviewCount: 512,
        deliveryTime: "15-25 Min",
        deliveryFee: 5,
        minOrder: 50,
        isOpen: true,
        isFeatured: false,
        isVerified: true,
        productCategories: JSON.stringify(["Medicines", "Vitamins", "Skincare", "Baby Care"]),
      },
      {
        name: "Blend & Brew",
        slug: "blend-brew",
        description: "Specialty coffee, artisan teas, and fresh pastries from our roastery.",
        image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600",
        bannerImage: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200",
        categoryId: categories[3].id,
        categoryName: "Coffee",
        categoryIcon: "☕",
        address: "8 Garden City, Cairo",
        phone: "+20111222333",
        rating: 4.7,
        reviewCount: 267,
        deliveryTime: "15-20 Min",
        deliveryFee: 12,
        minOrder: 60,
        isOpen: true,
        isFeatured: true,
        isVerified: true,
        isTrending: true,
        productCategories: JSON.stringify(["Hot Coffee", "Cold Brew", "Teas", "Pastries", "Sandwiches"]),
      },
      {
        name: "Noura Fashion",
        slug: "noura-fashion",
        description: "Curated women's fashion — from casual to formal. Free returns within 7 days.",
        image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600",
        logo: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=200",
        bannerImage: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200",
        categoryId: categories[4].id,
        categoryName: "Fashion",
        categoryIcon: "👗",
        address: "City Stars Mall, Nasr City",
        phone: "+20122334455",
        rating: 4.5,
        reviewCount: 143,
        deliveryTime: "Same Day",
        deliveryFee: 20,
        minOrder: 200,
        isOpen: true,
        isFeatured: false,
        isVerified: true,
        isOnline: true,
        productCategories: JSON.stringify(["Dresses", "Tops", "Abayas", "Accessories", "Bags"]),
      },
      {
        name: "TechHub Store",
        slug: "techhub-store",
        description: "Latest smartphones, laptops, accessories, and smart home devices.",
        image: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=600",
        logo: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=200",
        bannerImage: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=1200",
        categoryId: categories[5].id,
        categoryName: "Electronics",
        categoryIcon: "📱",
        address: "5th Settlement, New Cairo",
        phone: "+20133445566",
        rating: 4.4,
        reviewCount: 88,
        deliveryTime: "Next Day",
        deliveryFee: 25,
        minOrder: 500,
        isOpen: true,
        isFeatured: true,
        isVerified: false,
        isOnline: true,
        productCategories: JSON.stringify(["Phones", "Laptops", "Accessories", "Smart Home", "Gaming"]),
      },
      {
        name: "Glow Beauty",
        slug: "glow-beauty",
        description: "Premium beauty products — skincare, makeup, and fragrances from top brands.",
        image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600",
        logo: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200",
        bannerImage: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200",
        categoryId: categories[6].id,
        categoryName: "Beauty",
        categoryIcon: "💄",
        address: "Maadi Grand Mall, Cairo",
        phone: "+20144556677",
        rating: 4.7,
        reviewCount: 210,
        deliveryTime: "Next Day",
        deliveryFee: 15,
        minOrder: 150,
        isOpen: true,
        isFeatured: true,
        isVerified: true,
        isOnline: true,
        productCategories: JSON.stringify(["Skincare", "Makeup", "Fragrance", "Hair Care"]),
      },
      {
        name: "Bloom Flowers",
        slug: "bloom-flowers",
        description: "Fresh flowers and arrangements delivered same day. Weddings, gifts, and everyday blooms.",
        image: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600",
        logo: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=200",
        bannerImage: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=1200",
        categoryId: categories[7].id,
        categoryName: "Flowers",
        categoryIcon: "🌹",
        address: "Zamalek, Cairo",
        phone: "+20155667788",
        rating: 4.8,
        reviewCount: 176,
        deliveryTime: "Same Day",
        deliveryFee: 30,
        minOrder: 120,
        isOpen: true,
        isFeatured: false,
        isVerified: true,
        productCategories: JSON.stringify(["Bouquets", "Arrangements", "Plants", "Wedding"]),
      },
    ]).returning();

    const [sarasKitchen, baraka, pharmaPlusStore, blendBrew, noura, techHub, glowBeauty, bloomFlowers] = stores;

    // Products for Sara's Kitchen
    const sarasProducts = await db.insert(productsTable).values([
      {
        storeId: sarasKitchen.id,
        storeName: sarasKitchen.name,
        name: "Kofta Plate",
        description: "Grilled minced beef kofta served with rice, salad, and tahini sauce. A family favorite.",
        price: 85,
        originalPrice: 100,
        image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400",
        categoryName: "Grills",
        rating: 4.9,
        reviewCount: 142,
        isAvailable: true,
        isFeatured: true,
        discountPercent: 15,
        tags: JSON.stringify(["popular", "grilled", "beef"]),
        preparationTime: "15-20 Min",
      },
      {
        storeId: sarasKitchen.id,
        storeName: sarasKitchen.name,
        name: "Chicken Shawarma",
        description: "Slow-roasted chicken wrapped in soft bread with pickles, garlic sauce and fresh veggies.",
        price: 65,
        image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400",
        categoryName: "Grills",
        rating: 4.7,
        reviewCount: 98,
        isAvailable: true,
        isFeatured: true,
        tags: JSON.stringify(["popular", "chicken"]),
        preparationTime: "10-15 Min",
      },
      {
        storeId: sarasKitchen.id,
        storeName: sarasKitchen.name,
        name: "Molokhia with Rabbit",
        description: "Traditional Egyptian molokhia slow-cooked with tender rabbit. Served with white rice.",
        price: 120,
        image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400",
        categoryName: "Rice Dishes",
        rating: 4.8,
        reviewCount: 67,
        isAvailable: true,
        tags: JSON.stringify(["traditional", "homemade"]),
        preparationTime: "20-25 Min",
      },
      {
        storeId: sarasKitchen.id,
        storeName: sarasKitchen.name,
        name: "Umm Ali",
        description: "Egypt's beloved bread pudding with milk cream, nuts, and coconut. Served warm.",
        price: 45,
        image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400",
        categoryName: "Desserts",
        rating: 4.9,
        reviewCount: 203,
        isAvailable: true,
        isFeatured: true,
        tags: JSON.stringify(["dessert", "sweet", "popular"]),
        preparationTime: "5-10 Min",
      },
    ]).returning();

    // Products for Baraka
    await db.insert(productsTable).values([
      {
        storeId: baraka.id,
        storeName: baraka.name,
        name: "Organic Tomatoes (1kg)",
        description: "Sun-ripened organic tomatoes from local farms. No pesticides.",
        price: 18,
        image: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400",
        categoryName: "Vegetables",
        rating: 4.6,
        reviewCount: 34,
        isAvailable: true,
        tags: JSON.stringify(["organic", "fresh"]),
      },
      {
        storeId: baraka.id,
        storeName: baraka.name,
        name: "Fresh Strawberries",
        description: "Sweet Egyptian strawberries, freshly picked. Perfect for desserts.",
        price: 35,
        originalPrice: 45,
        image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400",
        categoryName: "Fruits",
        rating: 4.8,
        reviewCount: 56,
        isAvailable: true,
        isFeatured: true,
        discountPercent: 22,
        tags: JSON.stringify(["seasonal", "fresh"]),
      },
    ]).returning();

    // Products for Blend & Brew
    const brewProducts = await db.insert(productsTable).values([
      {
        storeId: blendBrew.id,
        storeName: blendBrew.name,
        name: "Signature Espresso",
        description: "Double shot espresso made from our house blend — rich, bold, and perfectly balanced.",
        price: 35,
        image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400",
        categoryName: "Hot Coffee",
        rating: 4.9,
        reviewCount: 89,
        isAvailable: true,
        isFeatured: true,
        tags: JSON.stringify(["coffee", "popular"]),
        preparationTime: "5 Min",
      },
      {
        storeId: blendBrew.id,
        storeName: blendBrew.name,
        name: "Cold Brew Bottle (500ml)",
        description: "18-hour cold-brewed single origin Ethiopian coffee. Smooth, sweet, no bitterness.",
        price: 65,
        image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400",
        categoryName: "Cold Brew",
        rating: 4.8,
        reviewCount: 45,
        isAvailable: true,
        tags: JSON.stringify(["cold", "bottle"]),
        preparationTime: "2 Min",
      },
      {
        storeId: blendBrew.id,
        storeName: blendBrew.name,
        name: "Croissant au Beurre",
        description: "French-style butter croissant baked fresh every morning. Flaky, golden, and irresistible.",
        price: 28,
        image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400",
        categoryName: "Pastries",
        rating: 4.7,
        reviewCount: 112,
        isAvailable: true,
        isFeatured: true,
        tags: JSON.stringify(["pastry", "fresh", "breakfast"]),
        preparationTime: "2 Min",
      },
    ]).returning();

    // Products for TechHub
    await db.insert(productsTable).values([
      {
        storeId: techHub.id,
        storeName: techHub.name,
        name: "iPhone 15 Pro 256GB",
        description: "Apple iPhone 15 Pro with titanium design, A17 Pro chip, and 48MP main camera.",
        price: 45000,
        originalPrice: 48000,
        image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400",
        categoryName: "Phones",
        rating: 4.9,
        reviewCount: 23,
        isAvailable: true,
        isFeatured: true,
        discountPercent: 6,
        tags: JSON.stringify(["apple", "smartphone", "premium"]),
      },
      {
        storeId: techHub.id,
        storeName: techHub.name,
        name: "Samsung Galaxy S24",
        description: "Samsung's flagship with Galaxy AI, 200MP camera, and Snapdragon 8 Gen 3.",
        price: 32000,
        image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400",
        categoryName: "Phones",
        rating: 4.7,
        reviewCount: 15,
        isAvailable: true,
        tags: JSON.stringify(["samsung", "android"]),
      },
    ]).returning();

    // Products for Pharma Plus
    await db.insert(productsTable).values([
      {
        storeId: pharmaPlusStore.id, storeName: pharmaPlusStore.name,
        name: "Panadol Extra (24 tabs)",
        description: "Fast-acting paracetamol + caffeine for headaches, fever and body pain.",
        price: 28, image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
        categoryName: "Medicines", rating: 4.9, reviewCount: 312, isAvailable: true, isFeatured: true,
        tags: JSON.stringify(["pain relief", "fever", "popular"]), preparationTime: "5 Min",
      },
      {
        storeId: pharmaPlusStore.id, storeName: pharmaPlusStore.name,
        name: "Vitamin C 1000mg (30 tabs)",
        description: "High-dose Vitamin C effervescent tablets. Immune booster with orange flavor.",
        price: 75, originalPrice: 90, image: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=400",
        categoryName: "Vitamins", rating: 4.8, reviewCount: 189, isAvailable: true, isFeatured: true, discountPercent: 17,
        tags: JSON.stringify(["immune", "vitamin", "effervescent"]), preparationTime: "5 Min",
      },
      {
        storeId: pharmaPlusStore.id, storeName: pharmaPlusStore.name,
        name: "Cetaphil Gentle Cleanser 250ml",
        description: "Dermatologist-recommended gentle daily face wash for sensitive skin.",
        price: 145, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
        categoryName: "Skincare", rating: 4.7, reviewCount: 94, isAvailable: true,
        tags: JSON.stringify(["skincare", "sensitive", "cleanser"]), preparationTime: "5 Min",
      },
      {
        storeId: pharmaPlusStore.id, storeName: pharmaPlusStore.name,
        name: "Johnson Baby Lotion 200ml",
        description: "Clinically proven gentle baby lotion. No parabens, phthalates or dyes.",
        price: 55, image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400",
        categoryName: "Baby Care", rating: 4.9, reviewCount: 267, isAvailable: true,
        tags: JSON.stringify(["baby", "gentle", "lotion"]), preparationTime: "5 Min",
      },
    ]);

    // Products for Noura Fashion
    await db.insert(productsTable).values([
      {
        storeId: noura.id, storeName: noura.name,
        name: "Floral Maxi Dress",
        description: "Elegant floral print maxi dress. Lightweight chiffon fabric, perfect for all occasions.",
        price: 450, originalPrice: 600, image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400",
        categoryName: "Dresses", rating: 4.6, reviewCount: 78, isAvailable: true, isFeatured: true, discountPercent: 25,
        tags: JSON.stringify(["dress", "floral", "summer"]), preparationTime: "Same Day",
      },
      {
        storeId: noura.id, storeName: noura.name,
        name: "Premium Silk Abaya",
        description: "Luxurious silk-blend abaya with delicate embroidery. Available in multiple colors.",
        price: 890, image: "https://images.unsplash.com/photo-1611042553365-9b101441c135?w=400",
        categoryName: "Abayas", rating: 4.8, reviewCount: 143, isAvailable: true, isFeatured: true,
        tags: JSON.stringify(["abaya", "silk", "luxury"]), preparationTime: "Same Day",
      },
      {
        storeId: noura.id, storeName: noura.name,
        name: "Casual Linen Top",
        description: "Breathable linen top in natural tones. Relaxed fit, pairs with everything.",
        price: 180, originalPrice: 220, image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400",
        categoryName: "Tops", rating: 4.4, reviewCount: 52, isAvailable: true, discountPercent: 18,
        tags: JSON.stringify(["casual", "linen", "top"]), preparationTime: "Same Day",
      },
      {
        storeId: noura.id, storeName: noura.name,
        name: "Leather Tote Bag",
        description: "Genuine leather tote bag with gold hardware. Spacious main compartment with inner pockets.",
        price: 650, image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400",
        categoryName: "Bags", rating: 4.7, reviewCount: 91, isAvailable: true, isFeatured: true,
        tags: JSON.stringify(["bag", "leather", "tote"]), preparationTime: "Same Day",
      },
    ]);

    // Products for Glow Beauty
    await db.insert(productsTable).values([
      {
        storeId: glowBeauty.id, storeName: glowBeauty.name,
        name: "Charlotte Tilbury Magic Cream 50ml",
        description: "Award-winning moisturizer with a radiant-boost complex for luminous skin.",
        price: 380, image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400",
        categoryName: "Skincare", rating: 4.9, reviewCount: 203, isAvailable: true, isFeatured: true,
        tags: JSON.stringify(["luxury", "moisturizer", "glow"]), preparationTime: "10 Min",
      },
      {
        storeId: glowBeauty.id, storeName: glowBeauty.name,
        name: "NYX Professional Lipstick",
        description: "Rich, creamy lip color with a matte finish. Long-wearing formula, 36 shades.",
        price: 95, originalPrice: 120, image: "https://images.unsplash.com/photo-1586495777744-4e6232bf2f7d?w=400",
        categoryName: "Makeup", rating: 4.7, reviewCount: 156, isAvailable: true, discountPercent: 21,
        tags: JSON.stringify(["lipstick", "matte", "makeup"]), preparationTime: "10 Min",
      },
      {
        storeId: glowBeauty.id, storeName: glowBeauty.name,
        name: "Fenty Beauty Foundation",
        description: "The original 40-shade foundation. Buildable medium-to-full coverage, 24h wear.",
        price: 320, image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400",
        categoryName: "Makeup", rating: 4.8, reviewCount: 312, isAvailable: true, isFeatured: true,
        tags: JSON.stringify(["foundation", "fenty", "coverage"]), preparationTime: "10 Min",
      },
      {
        storeId: glowBeauty.id, storeName: glowBeauty.name,
        name: "Rose Gold Perfume 100ml",
        description: "A floral oriental fragrance with notes of rose, oud, and vanilla. Long-lasting.",
        price: 280, originalPrice: 350, image: "https://images.unsplash.com/photo-1541643600914-78b084683702?w=400",
        categoryName: "Fragrance", rating: 4.6, reviewCount: 87, isAvailable: true, discountPercent: 20,
        tags: JSON.stringify(["perfume", "floral", "rose"]), preparationTime: "10 Min",
      },
    ]);

    // Products for Bloom Flowers
    await db.insert(productsTable).values([
      {
        storeId: bloomFlowers.id, storeName: bloomFlowers.name,
        name: "Red Rose Bouquet (12 stems)",
        description: "Fresh premium red roses, hand-tied with baby's breath and ribbon.",
        price: 180, image: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400",
        categoryName: "Bouquets", rating: 4.9, reviewCount: 234, isAvailable: true, isFeatured: true,
        tags: JSON.stringify(["roses", "romantic", "gift"]), preparationTime: "30 Min",
      },
      {
        storeId: bloomFlowers.id, storeName: bloomFlowers.name,
        name: "Mixed Wildflower Arrangement",
        description: "A vibrant mix of seasonal wildflowers in a rustic vase. Cheerful and colorful.",
        price: 220, originalPrice: 280, image: "https://images.unsplash.com/photo-1490750967868-88df5691cc56?w=400",
        categoryName: "Arrangements", rating: 4.7, reviewCount: 118, isAvailable: true, isFeatured: true, discountPercent: 21,
        tags: JSON.stringify(["wildflowers", "colorful", "vase"]), preparationTime: "30 Min",
      },
      {
        storeId: bloomFlowers.id, storeName: bloomFlowers.name,
        name: "White Lily Bouquet",
        description: "Elegant white oriental lilies symbolizing purity and grace. 6 stems per bouquet.",
        price: 160, image: "https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=400",
        categoryName: "Bouquets", rating: 4.8, reviewCount: 76, isAvailable: true,
        tags: JSON.stringify(["lilies", "white", "elegant"]), preparationTime: "30 Min",
      },
      {
        storeId: bloomFlowers.id, storeName: bloomFlowers.name,
        name: "Succulent Gift Box",
        description: "Curated collection of 6 unique succulents in a decorative gift box. Zero maintenance.",
        price: 145, image: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400",
        categoryName: "Plants", rating: 4.6, reviewCount: 93, isAvailable: true,
        tags: JSON.stringify(["succulents", "plants", "gift"]), preparationTime: "30 Min",
      },
    ]);

    // Product Variants
    await db.insert(productVariantsTable).values([
      { productId: sarasProducts[0].id, name: "Half Portion", price: 55, isAvailable: true },
      { productId: sarasProducts[0].id, name: "Full Portion", price: 85, isAvailable: true },
      { productId: sarasProducts[0].id, name: "Double Portion", price: 150, isAvailable: true },
      { productId: brewProducts[0].id, name: "Single Shot", price: 25, isAvailable: true },
      { productId: brewProducts[0].id, name: "Double Shot", price: 35, isAvailable: true },
      { productId: brewProducts[0].id, name: "Triple Shot", price: 45, isAvailable: true },
    ]);

    // Product Addons
    await db.insert(productAddonsTable).values([
      { productId: sarasProducts[0].id, name: "Extra Sauce", price: 5 },
      { productId: sarasProducts[0].id, name: "Extra Pita Bread", price: 8 },
      { productId: sarasProducts[0].id, name: "Side Salad", price: 15 },
      { productId: brewProducts[0].id, name: "Oat Milk", price: 10 },
      { productId: brewProducts[0].id, name: "Vanilla Syrup", price: 8 },
      { productId: brewProducts[0].id, name: "Extra Shot", price: 15 },
    ]);

    // Coupons
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await db.insert(couponsTable).values([
      { code: "CARGO20", title: "20% Off Your First Order", description: "New users get 20% off any order", discount: 20, type: "percentage", minOrder: 100, maxDiscount: 50, expiresAt: futureDate },
      { code: "FLAT30", title: "EGP 30 Off", description: "Save EGP 30 on orders above EGP 200", discount: 30, type: "fixed", minOrder: 200, expiresAt: futureDate },
      { code: "COFFEE15", title: "15% Off Coffee", description: "Exclusive discount for coffee lovers", discount: 15, type: "percentage", minOrder: 60, maxDiscount: 25, expiresAt: futureDate },
      { code: "WELCOME50", title: "EGP 50 Welcome Gift", description: "Special welcome discount for new customers", discount: 50, type: "fixed", minOrder: 150, expiresAt: futureDate },
    ]);

    // Flash Sales
    const flashEndDate = new Date(Date.now() + 6 * 60 * 60 * 1000); // 6 hours
    const [flashSale] = await db.insert(flashSalesTable).values([
      {
        title: "Flash Friday Deals",
        description: "Massive discounts for 6 hours only! Don't miss out.",
        bannerImage: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200",
        endsAt: flashEndDate,
        discountPercent: 30,
        isActive: true,
      },
    ]).returning();

    // Link flash sale products
    await db.insert(flashSaleProductsTable).values([
      { flashSaleId: flashSale.id, productId: sarasProducts[0].id },
      { flashSaleId: flashSale.id, productId: sarasProducts[1].id },
      { flashSaleId: flashSale.id, productId: brewProducts[2].id },
    ]);

    // Wallet for customer
    const [wallet] = await db.insert(walletsTable).values([
      { userId: customer.id, balance: 350, currency: "EGP", loyaltyPoints: 450 },
    ]).returning();

    await db.insert(walletTransactionsTable).values([
      { walletId: wallet.id, type: "credit", amount: 500, description: "Top up via Credit Card" },
      { walletId: wallet.id, type: "debit", amount: 85, description: "Order #1 payment" },
      { walletId: wallet.id, type: "debit", amount: 65, description: "Order #2 payment" },
      { walletId: wallet.id, type: "reward", amount: 25, description: "Loyalty reward — 5 orders" },
      { walletId: wallet.id, type: "credit", amount: 200, description: "Top up via Cash" },
      { walletId: wallet.id, type: "refund", amount: 45, description: "Refund for cancelled order" },
    ]);

    // Seed orders
    const [order1] = await db.insert(ordersTable).values([
      {
        userId: customer.id,
        storeId: sarasKitchen.id,
        storeName: sarasKitchen.name,
        storeImage: sarasKitchen.image,
        status: "completed",
        subtotal: 150,
        deliveryFee: 15,
        discount: 0,
        total: 165,
        paymentMethod: "wallet",
        deliveryAddress: "123 Nile St, Cairo",
        itemCount: 2,
        estimatedDelivery: "25 Min",
        updatedAt: new Date(Date.now() - 86400000),
        createdAt: new Date(Date.now() - 86400000),
      },
      {
        userId: customer.id,
        storeId: blendBrew.id,
        storeName: blendBrew.name,
        storeImage: blendBrew.image,
        status: "delivering",
        subtotal: 98,
        deliveryFee: 12,
        discount: 20,
        total: 90,
        paymentMethod: "cash",
        deliveryAddress: "123 Nile St, Cairo",
        itemCount: 3,
        estimatedDelivery: "15 Min",
        driverName: "Mohamed Khalil",
        updatedAt: new Date(),
        createdAt: new Date(),
      },
    ]).returning();

    await db.insert(orderItemsTable).values([
      { orderId: order1.id, productId: sarasProducts[0].id, name: sarasProducts[0].name, image: sarasProducts[0].image, price: sarasProducts[0].price, quantity: 1 },
      { orderId: order1.id, productId: sarasProducts[3].id, name: sarasProducts[3].name, image: sarasProducts[3].image, price: sarasProducts[3].price, quantity: 1 },
    ]);

    // Notifications
    await db.insert(notificationsTable).values([
      { userId: customer.id, title: "Order On The Way!", body: "Your Blend & Brew order is being delivered by Mohamed. ETA: 15 min", type: "order", isRead: false },
      { userId: customer.id, title: "Flash Sale Alert!", body: "Flash Friday Deals — up to 30% off for the next 6 hours only!", type: "promo", isRead: false },
      { userId: customer.id, title: "Order Delivered", body: "Your Sara's Kitchen order has been delivered. Rate your experience!", type: "order", isRead: true },
      { userId: customer.id, title: "New Coupon!", body: "Use COFFEE15 for 15% off your next coffee order", type: "promo", isRead: true },
      { userId: customer.id, title: "Loyalty Reward", body: "Congratulations! You've earned 25 EGP in loyalty rewards", type: "system", isRead: false },
    ]);

    // Reviews
    await db.insert(reviewsTable).values([
      { userId: customer.id, userName: "Ahmed Al-Rashid", storeId: sarasKitchen.id, rating: 5, comment: "Best kofta in Cairo! Sara's cooking is absolutely amazing. Will definitely order again!" },
      { userId: customer.id, userName: "Ahmed Al-Rashid", storeId: blendBrew.id, rating: 4, comment: "Great coffee, consistent quality. The cold brew is my go-to every morning." },
      { userId: 5, userName: "Layla Hassan", storeId: sarasKitchen.id, rating: 5, comment: "The Umm Ali is out of this world! Tastes exactly like my grandmother used to make." },
    ]);

    logger.info("Database seeded successfully!");
  } catch (err) {
    logger.error({ err }, "Error seeding database");
  }
}
