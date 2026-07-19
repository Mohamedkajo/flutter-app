import { Router, type IRouter } from "express";
import {
  db,
  usersTable,
  storesTable,
  productsTable,
  categoriesTable,
  ordersTable,
  orderItemsTable,
  couponsTable,
  notificationsTable,
  walletTransactionsTable,
  walletsTable,
  driversTable,
  reviewsTable,
  bannersTable,
  cmsPagesTable,
} from "@workspace/db";
import { eq, ilike, or, desc, and, sql, asc, inArray } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { requireAdmin } from "../middleware/adminAuth";
import bcrypt from "bcryptjs";
import {
  UpdateAdminUserBody,
  UpdateAdminStoreBody,
  UpdateAdminProductBody,
  CreateAdminCategoryBody,
  UpdateAdminCategoryBody,
  UpdateAdminOrderBody,
  CreateAdminCouponBody,
  UpdateAdminCouponBody,
  BroadcastNotificationBody,
  UpdateAdminSettingsBody,
} from "@workspace/api-zod";
import { z } from "zod";

const router: IRouter = Router();

// ─── In-memory settings store (default values) ────────────────────────────
let systemSettings = {
  platformName: "Cargo",
  currency: "EGP",
  defaultDeliveryFee: 10,
  maxDeliveryRadius: 50,
  commissionRate: 15,
  supportEmail: "support@cargo.app",
  supportPhone: null as string | null,
  maintenanceMode: false,
  allowGuestCheckout: false,
  loyaltyPointsRate: 1,
  minWithdrawal: 100,
};

// ─── Zod schemas for new endpoints ────────────────────────────────────────
const CreateUserBody = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  role: z.enum(["customer", "merchant", "driver", "admin"]).default("customer"),
});

const CreateStoreBody = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  logo: z.string().optional(),
  image: z.string().min(1),
  categoryName: z.string().min(1),
  categoryId: z.number().int().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  deliveryTime: z.string().optional(),
  deliveryFee: z.number().optional(),
  minOrder: z.number().optional(),
  userId: z.number().int().optional(),
});

const CreateProductBody = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  originalPrice: z.number().optional(),
  image: z.string().min(1),
  storeId: z.number().int(),
  categoryName: z.string().min(1),
  discountPercent: z.number().int().optional(),
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

const BannerBody = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  image: z.string().min(1),
  link: z.string().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});

const CmsPageBody = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string(),
  metaDescription: z.string().optional(),
  isPublished: z.boolean().optional(),
});

// helper to format store
function fmtStore(store: typeof storesTable.$inferSelect, owner?: { name: string; email: string } | null, stats?: { count: number; total: number } | null) {
  return {
    id: store.id, userId: store.userId, name: store.name, slug: store.slug,
    logo: store.logo ?? null, image: store.image, categoryName: store.categoryName,
    categoryId: store.categoryId ?? null, rating: store.rating, reviewCount: store.reviewCount,
    deliveryTime: store.deliveryTime, deliveryFee: store.deliveryFee, minOrder: store.minOrder,
    isOpen: store.isOpen, isFeatured: store.isFeatured, isVerified: store.isVerified,
    isTrending: store.isTrending, isOnline: store.isOnline,
    address: store.address ?? null, phone: store.phone ?? null,
    ownerName: owner?.name ?? null, ownerEmail: owner?.email ?? null,
    totalOrders: Number(stats?.count ?? 0), totalRevenue: Number(stats?.total ?? 0),
    createdAt: store.createdAt.toISOString(),
  };
}

// helper to format user
function fmtUser(u: typeof usersTable.$inferSelect, extra: { totalOrders?: number; totalSpent?: number } = {}) {
  return {
    id: u.id, name: u.name, email: u.email, phone: u.phone ?? null,
    avatar: u.avatar ?? null, role: u.role, loyaltyPoints: u.loyaltyPoints,
    isActive: true, totalOrders: extra.totalOrders ?? 0, totalSpent: extra.totalSpent ?? 0,
    createdAt: u.createdAt.toISOString(),
  };
}

// helper to format product
function fmtProduct(p: typeof productsTable.$inferSelect) {
  return {
    id: p.id, name: p.name, description: p.description ?? null,
    price: p.price, originalPrice: p.originalPrice ?? null, image: p.image,
    storeId: p.storeId, storeName: p.storeName, categoryName: p.categoryName,
    rating: p.rating, reviewCount: p.reviewCount, isAvailable: p.isAvailable,
    isFeatured: p.isFeatured, discountPercent: p.discountPercent ?? null,
    tags: p.tags ? (JSON.parse(p.tags) as string[]) : [],
  };
}

// ─── USERS ────────────────────────────────────────────────────────────────

router.get("/admin/users", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const { role, search, limit = 50, offset = 0 } = req.query as Record<string, string>;
    const conditions = [];
    if (role) conditions.push(eq(usersTable.role, role as "customer" | "merchant" | "driver" | "admin"));
    if (search) conditions.push(or(ilike(usersTable.name, `%${search}%`), ilike(usersTable.email, `%${search}%`))!);

    const users = await db
      .select()
      .from(usersTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(usersTable.createdAt))
      .limit(Number(limit))
      .offset(Number(offset));

    res.json(users.map((u) => fmtUser(u)));
  } catch (err) { next(err); }
});

router.post("/admin/users/create", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const parsed = CreateUserBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

    const { name, email, password, phone, role } = parsed.data;
    const existing = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length) { res.status(409).json({ error: "Email already in use" }); return; }

    const hashed = await bcrypt.hash(password, 10);
    const [user] = await db.insert(usersTable).values({ name, email, password: hashed, phone: phone ?? null, role }).returning();

    // Create wallet for the new user
    await db.insert(walletsTable).values({ userId: user.id, balance: 0, currency: "EGP" }).onConflictDoNothing();

    res.status(201).json(fmtUser(user));
  } catch (err) { next(err); }
});

router.get("/admin/users/:userId", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId as string, 10);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }

    const [orderStats] = await db
      .select({ total: sql<number>`coalesce(sum(${ordersTable.total}), 0)`, count: sql<number>`count(*)` })
      .from(ordersTable).where(eq(ordersTable.userId, userId));

    res.json(fmtUser(user, { totalOrders: Number(orderStats?.count ?? 0), totalSpent: Number(orderStats?.total ?? 0) }));
  } catch (err) { next(err); }
});

router.patch("/admin/users/:userId", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId as string, 10);
    const parsed = UpdateAdminUserBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

    const { isActive: _isActive, ...updateData } = parsed.data;
    const [user] = await db.update(usersTable).set(updateData).where(eq(usersTable.id, userId)).returning();
    if (!user) { res.status(404).json({ error: "User not found" }); return; }

    res.json(fmtUser(user));
  } catch (err) { next(err); }
});

router.delete("/admin/users/:userId", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId as string, 10);
    const [user] = await db.delete(usersTable).where(eq(usersTable.id, userId)).returning();
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    res.json(fmtUser(user));
  } catch (err) { next(err); }
});

// ─── STORES ───────────────────────────────────────────────────────────────

router.get("/admin/stores", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const { search, category, limit = 50, offset = 0 } = req.query as Record<string, string>;
    const conditions = [];
    if (search) conditions.push(ilike(storesTable.name, `%${search}%`));
    if (category) conditions.push(eq(storesTable.categoryName, category));

    const stores = await db
      .select()
      .from(storesTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(storesTable.createdAt))
      .limit(Number(limit))
      .offset(Number(offset));

    const storeList = await Promise.all(
      stores.map(async (s) => {
        const [owner] = s.userId
          ? await db.select({ name: usersTable.name, email: usersTable.email }).from(usersTable).where(eq(usersTable.id, s.userId)).limit(1)
          : [null];
        const [stats] = await db
          .select({ total: sql<number>`coalesce(sum(${ordersTable.total}), 0)`, count: sql<number>`count(*)` })
          .from(ordersTable).where(eq(ordersTable.storeId, s.id));
        return fmtStore(s, owner, stats ? { count: Number(stats.count), total: Number(stats.total) } : null);
      }),
    );
    res.json(storeList);
  } catch (err) { next(err); }
});

router.post("/admin/stores/create", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const parsed = CreateStoreBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

    const { name, image, categoryName, slug: rawSlug, ...rest } = parsed.data;
    const slug = rawSlug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    // Check slug uniqueness
    const existing = await db.select({ id: storesTable.id }).from(storesTable).where(eq(storesTable.slug, slug)).limit(1);
    if (existing.length) { res.status(409).json({ error: "Slug already in use" }); return; }

    const [store] = await db.insert(storesTable).values({
      name, image, categoryName, slug,
      description: rest.description ?? null,
      logo: rest.logo ?? null,
      categoryId: rest.categoryId ?? null,
      address: rest.address ?? null,
      phone: rest.phone ?? null,
      deliveryTime: rest.deliveryTime ?? "20-30 Min",
      deliveryFee: rest.deliveryFee ?? 10,
      minOrder: rest.minOrder ?? 50,
      userId: rest.userId ?? null,
    }).returning();

    res.status(201).json(fmtStore(store, null, null));
  } catch (err) { next(err); }
});

router.get("/admin/stores/:storeId", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const storeId = parseInt(req.params.storeId as string, 10);
    const [store] = await db.select().from(storesTable).where(eq(storesTable.id, storeId)).limit(1);
    if (!store) { res.status(404).json({ error: "Store not found" }); return; }

    const [owner] = store.userId
      ? await db.select({ name: usersTable.name, email: usersTable.email }).from(usersTable).where(eq(usersTable.id, store.userId)).limit(1)
      : [null];
    const [stats] = await db
      .select({ total: sql<number>`coalesce(sum(${ordersTable.total}), 0)`, count: sql<number>`count(*)` })
      .from(ordersTable).where(eq(ordersTable.storeId, storeId));

    res.json(fmtStore(store, owner, stats ? { count: Number(stats.count), total: Number(stats.total) } : null));
  } catch (err) { next(err); }
});

router.patch("/admin/stores/:storeId", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const storeId = parseInt(req.params.storeId as string, 10);
    const parsed = UpdateAdminStoreBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

    const [store] = await db.update(storesTable).set(parsed.data).where(eq(storesTable.id, storeId)).returning();
    if (!store) { res.status(404).json({ error: "Store not found" }); return; }
    res.json(fmtStore(store, null, null));
  } catch (err) { next(err); }
});

router.delete("/admin/stores/:storeId", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const storeId = parseInt(req.params.storeId as string, 10);
    const [store] = await db.delete(storesTable).where(eq(storesTable.id, storeId)).returning();
    if (!store) { res.status(404).json({ error: "Store not found" }); return; }
    res.json(fmtStore(store, null, null));
  } catch (err) { next(err); }
});

// ─── PRODUCTS ─────────────────────────────────────────────────────────────

router.get("/admin/products", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const { search, storeId, limit = 50, offset = 0 } = req.query as Record<string, string>;
    const conditions = [];
    if (search) conditions.push(ilike(productsTable.name, `%${search}%`));
    if (storeId) conditions.push(eq(productsTable.storeId, parseInt(storeId, 10)));

    const products = await db
      .select()
      .from(productsTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(productsTable.createdAt))
      .limit(Number(limit))
      .offset(Number(offset));

    res.json(products.map(fmtProduct));
  } catch (err) { next(err); }
});

router.post("/admin/products/create", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const parsed = CreateProductBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

    const store = await db.select({ name: storesTable.name }).from(storesTable).where(eq(storesTable.id, parsed.data.storeId)).limit(1);
    if (!store.length) { res.status(400).json({ error: "Store not found" }); return; }

    const [product] = await db.insert(productsTable).values({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      price: parsed.data.price,
      originalPrice: parsed.data.originalPrice ?? null,
      image: parsed.data.image,
      storeId: parsed.data.storeId,
      storeName: store[0].name,
      categoryName: parsed.data.categoryName,
      discountPercent: parsed.data.discountPercent ?? null,
      isAvailable: parsed.data.isAvailable ?? true,
      isFeatured: parsed.data.isFeatured ?? false,
    }).returning();

    res.status(201).json(fmtProduct(product));
  } catch (err) { next(err); }
});

router.patch("/admin/products/:productId", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const productId = parseInt(req.params.productId as string, 10);
    const parsed = UpdateAdminProductBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

    const [product] = await db.update(productsTable).set(parsed.data).where(eq(productsTable.id, productId)).returning();
    if (!product) { res.status(404).json({ error: "Product not found" }); return; }
    res.json(fmtProduct(product));
  } catch (err) { next(err); }
});

router.delete("/admin/products/:productId", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const productId = parseInt(req.params.productId as string, 10);
    const [product] = await db.delete(productsTable).where(eq(productsTable.id, productId)).returning();
    if (!product) { res.status(404).json({ error: "Product not found" }); return; }
    res.json(fmtProduct(product));
  } catch (err) { next(err); }
});

// ─── CATEGORIES ───────────────────────────────────────────────────────────

router.get("/admin/categories", requireAuth, requireAdmin, async (_req, res, next): Promise<void> => {
  try {
    const cats = await db.select().from(categoriesTable).orderBy(asc(categoriesTable.name));
    res.json(cats.map((c) => ({ id: c.id, name: c.name, slug: c.slug, icon: c.icon, image: c.image ?? null, storeCount: c.storeCount })));
  } catch (err) { next(err); }
});

router.post("/admin/categories", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const parsed = CreateAdminCategoryBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

    const [cat] = await db.insert(categoriesTable).values({ name: parsed.data.name, slug: parsed.data.slug, icon: parsed.data.icon, image: parsed.data.image ?? null }).returning();
    res.status(201).json({ id: cat.id, name: cat.name, slug: cat.slug, icon: cat.icon, image: cat.image ?? null, storeCount: cat.storeCount });
  } catch (err) { next(err); }
});

router.patch("/admin/categories/:categoryId", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const categoryId = parseInt(req.params.categoryId as string, 10);
    const parsed = UpdateAdminCategoryBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

    const [cat] = await db.update(categoriesTable).set(parsed.data).where(eq(categoriesTable.id, categoryId)).returning();
    if (!cat) { res.status(404).json({ error: "Category not found" }); return; }
    res.json({ id: cat.id, name: cat.name, slug: cat.slug, icon: cat.icon, image: cat.image ?? null, storeCount: cat.storeCount });
  } catch (err) { next(err); }
});

router.delete("/admin/categories/:categoryId", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const categoryId = parseInt(req.params.categoryId as string, 10);
    const [cat] = await db.delete(categoriesTable).where(eq(categoriesTable.id, categoryId)).returning();
    if (!cat) { res.status(404).json({ error: "Category not found" }); return; }
    res.json({ id: cat.id, name: cat.name, slug: cat.slug, icon: cat.icon, image: cat.image ?? null, storeCount: cat.storeCount });
  } catch (err) { next(err); }
});

// ─── ORDERS ───────────────────────────────────────────────────────────────

router.get("/admin/orders", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const { status, storeId, userId, limit = 50, offset = 0 } = req.query as Record<string, string>;
    const conditions = [];
    if (status) conditions.push(eq(ordersTable.status, status as any));
    if (storeId) conditions.push(eq(ordersTable.storeId, parseInt(storeId, 10)));
    if (userId) conditions.push(eq(ordersTable.userId, parseInt(userId, 10)));

    const orders = await db
      .select()
      .from(ordersTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(ordersTable.createdAt))
      .limit(Number(limit))
      .offset(Number(offset));

    res.json(orders.map((o) => ({
      id: o.id, userId: o.userId, storeId: o.storeId, storeName: o.storeName,
      storeImage: o.storeImage ?? null, driverId: o.driverId ?? null,
      driverName: o.driverName ?? null, status: o.status,
      subtotal: o.subtotal, deliveryFee: o.deliveryFee, discount: o.discount, total: o.total,
      paymentMethod: o.paymentMethod, estimatedDelivery: o.estimatedDelivery ?? null,
      deliveryAddress: o.deliveryAddress, createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(), itemCount: o.itemCount,
    })));
  } catch (err) { next(err); }
});

router.get("/admin/orders/:orderId", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const orderId = parseInt(req.params.orderId as string, 10);
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId)).limit(1);
    if (!order) { res.status(404).json({ error: "Order not found" }); return; }

    const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, orderId));
    res.json({
      id: order.id, userId: order.userId, storeId: order.storeId, storeName: order.storeName,
      storeImage: order.storeImage ?? null, driverId: order.driverId ?? null,
      driverName: order.driverName ?? null, status: order.status,
      subtotal: order.subtotal, deliveryFee: order.deliveryFee, discount: order.discount, total: order.total,
      paymentMethod: order.paymentMethod, estimatedDelivery: order.estimatedDelivery ?? null,
      deliveryAddress: order.deliveryAddress, createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(), itemCount: order.itemCount,
      items: items.map((i) => ({
        id: i.id, productId: i.productId, name: i.name, image: i.image,
        price: i.price, quantity: i.quantity, variant: i.variant ?? null,
        addons: i.addons ? (JSON.parse(i.addons) as string[]) : [],
        specialInstructions: i.specialInstructions ?? null,
      })),
      timeline: [], invoice: order.invoice ?? null,
    });
  } catch (err) { next(err); }
});

router.patch("/admin/orders/:orderId", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const orderId = parseInt(req.params.orderId as string, 10);
    const parsed = UpdateAdminOrderBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

    const { driverId, estimatedDelivery, status } = parsed.data;
    const updateData: Record<string, unknown> = { status, updatedAt: new Date() };
    if (driverId !== undefined) updateData.driverId = driverId;
    if (estimatedDelivery !== undefined) updateData.estimatedDelivery = estimatedDelivery;

    const [order] = await db.update(ordersTable).set(updateData).where(eq(ordersTable.id, orderId)).returning();
    if (!order) { res.status(404).json({ error: "Order not found" }); return; }
    res.json({
      id: order.id, userId: order.userId, storeId: order.storeId, storeName: order.storeName,
      storeImage: order.storeImage ?? null, driverId: order.driverId ?? null,
      driverName: order.driverName ?? null, status: order.status,
      subtotal: order.subtotal, deliveryFee: order.deliveryFee, discount: order.discount, total: order.total,
      paymentMethod: order.paymentMethod, estimatedDelivery: order.estimatedDelivery ?? null,
      deliveryAddress: order.deliveryAddress, createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(), itemCount: order.itemCount,
    });
  } catch (err) { next(err); }
});

// ─── COUPONS ──────────────────────────────────────────────────────────────

router.get("/admin/coupons", requireAuth, requireAdmin, async (_req, res, next): Promise<void> => {
  try {
    const coupons = await db.select().from(couponsTable).orderBy(desc(couponsTable.createdAt));
    res.json(coupons.map((c) => ({
      id: c.id, code: c.code, title: c.title, description: c.description ?? null,
      discount: c.discount, type: c.type, minOrder: c.minOrder ?? null,
      maxDiscount: c.maxDiscount ?? null, usageLimit: null, usageCount: 0,
      isActive: c.isActive, expiresAt: c.expiresAt.toISOString(), createdAt: c.createdAt.toISOString(),
    })));
  } catch (err) { next(err); }
});

router.post("/admin/coupons", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const parsed = CreateAdminCouponBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

    const { usageLimit: _u, isActive, ...rest } = parsed.data;
    const [coupon] = await db.insert(couponsTable).values({
      ...rest,
      type: rest.type as "percentage" | "fixed",
      expiresAt: new Date(rest.expiresAt),
      isActive: isActive ?? true,
    }).returning();

    res.status(201).json({
      id: coupon.id, code: coupon.code, title: coupon.title, description: coupon.description ?? null,
      discount: coupon.discount, type: coupon.type, minOrder: coupon.minOrder ?? null,
      maxDiscount: coupon.maxDiscount ?? null, usageLimit: null, usageCount: 0,
      isActive: coupon.isActive, expiresAt: coupon.expiresAt.toISOString(), createdAt: coupon.createdAt.toISOString(),
    });
  } catch (err) { next(err); }
});

router.patch("/admin/coupons/:couponId", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const couponId = parseInt(req.params.couponId as string, 10);
    const parsed = UpdateAdminCouponBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

    const { usageLimit: _u, expiresAt, ...rest } = parsed.data;
    const updateData: Record<string, unknown> = { ...rest };
    if (expiresAt) updateData.expiresAt = new Date(expiresAt);

    const [coupon] = await db.update(couponsTable).set(updateData).where(eq(couponsTable.id, couponId)).returning();
    if (!coupon) { res.status(404).json({ error: "Coupon not found" }); return; }
    res.json({
      id: coupon.id, code: coupon.code, title: coupon.title, description: coupon.description ?? null,
      discount: coupon.discount, type: coupon.type, minOrder: coupon.minOrder ?? null,
      maxDiscount: coupon.maxDiscount ?? null, usageLimit: null, usageCount: 0,
      isActive: coupon.isActive, expiresAt: coupon.expiresAt.toISOString(), createdAt: coupon.createdAt.toISOString(),
    });
  } catch (err) { next(err); }
});

router.delete("/admin/coupons/:couponId", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const couponId = parseInt(req.params.couponId as string, 10);
    const [coupon] = await db.delete(couponsTable).where(eq(couponsTable.id, couponId)).returning();
    if (!coupon) { res.status(404).json({ error: "Coupon not found" }); return; }
    res.json({
      id: coupon.id, code: coupon.code, title: coupon.title, description: coupon.description ?? null,
      discount: coupon.discount, type: coupon.type, minOrder: coupon.minOrder ?? null,
      maxDiscount: coupon.maxDiscount ?? null, usageLimit: null, usageCount: 0,
      isActive: coupon.isActive, expiresAt: coupon.expiresAt.toISOString(), createdAt: coupon.createdAt.toISOString(),
    });
  } catch (err) { next(err); }
});

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────

router.get("/admin/notifications", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const { userId, type, limit = 50 } = req.query as Record<string, string>;
    const conditions = [];
    if (userId) conditions.push(eq(notificationsTable.userId, parseInt(userId, 10)));
    if (type) conditions.push(eq(notificationsTable.type, type));

    const notifs = await db
      .select()
      .from(notificationsTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(notificationsTable.createdAt))
      .limit(Number(limit));

    res.json(notifs.map((n) => ({
      id: n.id, title: n.title, body: n.body,
      type: n.type as "order" | "promo" | "system" | "driver" | "chat",
      isRead: n.isRead, orderId: n.orderId ?? null, image: n.image ?? null,
      createdAt: n.createdAt.toISOString(),
    })));
  } catch (err) { next(err); }
});

router.post("/admin/notifications/broadcast", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const parsed = BroadcastNotificationBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

    const { title, body, type, targetRole, targetUserIds, image } = parsed.data;
    let userIds: number[] = [];
    if (targetUserIds && targetUserIds.length > 0) {
      userIds = targetUserIds;
    } else {
      const usersQuery = db.select({ id: usersTable.id }).from(usersTable);
      const users = targetRole && targetRole !== "all"
        ? await usersQuery.where(eq(usersTable.role, targetRole as "customer" | "merchant" | "driver" | "admin"))
        : await usersQuery;
      userIds = users.map((u) => u.id);
    }

    if (userIds.length === 0) { res.json({ sent: 0, failed: 0, message: "No users found" }); return; }

    const notifValues = userIds.map((uid) => ({ userId: uid, title, body, type: type || "system", image: image ?? null, isRead: false }));
    let sent = 0, failed = 0;
    for (let i = 0; i < notifValues.length; i += 100) {
      try {
        await db.insert(notificationsTable).values(notifValues.slice(i, i + 100));
        sent += Math.min(100, notifValues.length - i);
      } catch { failed += Math.min(100, notifValues.length - i); }
    }
    res.json({ sent, failed, message: `Broadcast sent to ${sent} users` });
  } catch (err) { next(err); }
});

// ─── WALLET TRANSACTIONS ──────────────────────────────────────────────────

router.get("/admin/wallet/transactions", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const { userId, type, limit = 50, offset = 0 } = req.query as Record<string, string>;
    const txRows = await db
      .select({
        id: walletTransactionsTable.id,
        walletId: walletTransactionsTable.walletId,
        userId: walletsTable.userId,
        type: walletTransactionsTable.type,
        amount: walletTransactionsTable.amount,
        description: walletTransactionsTable.description,
        orderId: walletTransactionsTable.orderId,
        createdAt: walletTransactionsTable.createdAt,
        userName: usersTable.name,
        userEmail: usersTable.email,
      })
      .from(walletTransactionsTable)
      .leftJoin(walletsTable, eq(walletTransactionsTable.walletId, walletsTable.id))
      .leftJoin(usersTable, eq(walletsTable.userId, usersTable.id))
      .where(and(
        userId ? eq(walletsTable.userId, parseInt(userId, 10)) : undefined,
        type ? eq(walletTransactionsTable.type, type as "credit" | "debit" | "refund" | "reward") : undefined,
      ))
      .orderBy(desc(walletTransactionsTable.createdAt))
      .limit(Number(limit))
      .offset(Number(offset));

    res.json(txRows.map((t) => ({
      id: t.id, userId: t.userId ?? 0, userName: t.userName ?? null, userEmail: t.userEmail ?? null,
      type: t.type, amount: t.amount, description: t.description, orderId: t.orderId ?? null,
      createdAt: t.createdAt.toISOString(),
    })));
  } catch (err) { next(err); }
});

// ─── REVIEWS ──────────────────────────────────────────────────────────────

router.get("/admin/reviews", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const { storeId, productId, limit = 50, offset = 0 } = req.query as Record<string, string>;
    const conditions = [];
    if (storeId) conditions.push(eq(reviewsTable.storeId, parseInt(storeId, 10)));
    if (productId) conditions.push(eq(reviewsTable.productId, parseInt(productId, 10)));

    const reviews = await db
      .select()
      .from(reviewsTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(reviewsTable.createdAt))
      .limit(Number(limit))
      .offset(Number(offset));

    res.json(reviews.map((r) => ({
      id: r.id, userId: r.userId, userName: r.userName, userAvatar: r.userAvatar ?? null,
      storeId: r.storeId ?? null, productId: r.productId ?? null, orderId: r.orderId ?? null,
      rating: r.rating, comment: r.comment ?? null, createdAt: r.createdAt.toISOString(),
    })));
  } catch (err) { next(err); }
});

router.delete("/admin/reviews/:reviewId", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const reviewId = parseInt(req.params.reviewId as string, 10);
    const [review] = await db.delete(reviewsTable).where(eq(reviewsTable.id, reviewId)).returning();
    if (!review) { res.status(404).json({ error: "Review not found" }); return; }
    res.json({
      id: review.id, userId: review.userId, userName: review.userName, userAvatar: review.userAvatar ?? null,
      storeId: review.storeId ?? null, productId: review.productId ?? null, orderId: review.orderId ?? null,
      rating: review.rating, comment: review.comment ?? null, createdAt: review.createdAt.toISOString(),
    });
  } catch (err) { next(err); }
});

// ─── BANNERS ──────────────────────────────────────────────────────────────

router.get("/admin/banners", requireAuth, requireAdmin, async (_req, res, next): Promise<void> => {
  try {
    const banners = await db.select().from(bannersTable).orderBy(asc(bannersTable.displayOrder));
    res.json(banners.map((b) => ({
      id: b.id, title: b.title, subtitle: b.subtitle ?? null, image: b.image, link: b.link ?? null,
      isActive: b.isActive, displayOrder: b.displayOrder,
      createdAt: b.createdAt.toISOString(), updatedAt: b.updatedAt.toISOString(),
    })));
  } catch (err) { next(err); }
});

router.post("/admin/banners", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const parsed = BannerBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

    const [banner] = await db.insert(bannersTable).values({
      title: parsed.data.title,
      subtitle: parsed.data.subtitle ?? null,
      image: parsed.data.image,
      link: parsed.data.link ?? null,
      isActive: parsed.data.isActive ?? true,
      displayOrder: parsed.data.displayOrder ?? 0,
    }).returning();

    res.status(201).json({
      id: banner.id, title: banner.title, subtitle: banner.subtitle ?? null, image: banner.image, link: banner.link ?? null,
      isActive: banner.isActive, displayOrder: banner.displayOrder,
      createdAt: banner.createdAt.toISOString(), updatedAt: banner.updatedAt.toISOString(),
    });
  } catch (err) { next(err); }
});

router.patch("/admin/banners/:bannerId", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const bannerId = parseInt(req.params.bannerId as string, 10);
    const parsed = BannerBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

    const [banner] = await db.update(bannersTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(bannersTable.id, bannerId)).returning();
    if (!banner) { res.status(404).json({ error: "Banner not found" }); return; }
    res.json({
      id: banner.id, title: banner.title, subtitle: banner.subtitle ?? null, image: banner.image, link: banner.link ?? null,
      isActive: banner.isActive, displayOrder: banner.displayOrder,
      createdAt: banner.createdAt.toISOString(), updatedAt: banner.updatedAt.toISOString(),
    });
  } catch (err) { next(err); }
});

router.delete("/admin/banners/:bannerId", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const bannerId = parseInt(req.params.bannerId as string, 10);
    const [banner] = await db.delete(bannersTable).where(eq(bannersTable.id, bannerId)).returning();
    if (!banner) { res.status(404).json({ error: "Banner not found" }); return; }
    res.json({
      id: banner.id, title: banner.title, subtitle: banner.subtitle ?? null, image: banner.image, link: banner.link ?? null,
      isActive: banner.isActive, displayOrder: banner.displayOrder,
      createdAt: banner.createdAt.toISOString(), updatedAt: banner.updatedAt.toISOString(),
    });
  } catch (err) { next(err); }
});

// ─── CMS PAGES ────────────────────────────────────────────────────────────

router.get("/admin/cms-pages", requireAuth, requireAdmin, async (_req, res, next): Promise<void> => {
  try {
    const pages = await db.select().from(cmsPagesTable).orderBy(asc(cmsPagesTable.title));
    res.json(pages.map((p) => ({
      id: p.id, title: p.title, slug: p.slug, content: p.content,
      metaDescription: p.metaDescription ?? null, isPublished: p.isPublished,
      createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString(),
    })));
  } catch (err) { next(err); }
});

router.post("/admin/cms-pages", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const parsed = CmsPageBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

    const existing = await db.select({ id: cmsPagesTable.id }).from(cmsPagesTable).where(eq(cmsPagesTable.slug, parsed.data.slug)).limit(1);
    if (existing.length) { res.status(409).json({ error: "Slug already in use" }); return; }

    const [page] = await db.insert(cmsPagesTable).values({
      title: parsed.data.title, slug: parsed.data.slug, content: parsed.data.content,
      metaDescription: parsed.data.metaDescription ?? null, isPublished: parsed.data.isPublished ?? false,
    }).returning();

    res.status(201).json({
      id: page.id, title: page.title, slug: page.slug, content: page.content,
      metaDescription: page.metaDescription ?? null, isPublished: page.isPublished,
      createdAt: page.createdAt.toISOString(), updatedAt: page.updatedAt.toISOString(),
    });
  } catch (err) { next(err); }
});

router.patch("/admin/cms-pages/:pageId", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const pageId = parseInt(req.params.pageId as string, 10);
    const parsed = CmsPageBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

    const [page] = await db.update(cmsPagesTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(cmsPagesTable.id, pageId)).returning();
    if (!page) { res.status(404).json({ error: "Page not found" }); return; }
    res.json({
      id: page.id, title: page.title, slug: page.slug, content: page.content,
      metaDescription: page.metaDescription ?? null, isPublished: page.isPublished,
      createdAt: page.createdAt.toISOString(), updatedAt: page.updatedAt.toISOString(),
    });
  } catch (err) { next(err); }
});

router.delete("/admin/cms-pages/:pageId", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const pageId = parseInt(req.params.pageId as string, 10);
    const [page] = await db.delete(cmsPagesTable).where(eq(cmsPagesTable.id, pageId)).returning();
    if (!page) { res.status(404).json({ error: "Page not found" }); return; }
    res.json({
      id: page.id, title: page.title, slug: page.slug, content: page.content,
      metaDescription: page.metaDescription ?? null, isPublished: page.isPublished,
      createdAt: page.createdAt.toISOString(), updatedAt: page.updatedAt.toISOString(),
    });
  } catch (err) { next(err); }
});

// ─── REPORTS ──────────────────────────────────────────────────────────────

router.get("/admin/reports/revenue", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const { from, to, groupBy = "day" } = req.query as Record<string, string>;
    const truncFn = groupBy === "month" ? "month" : groupBy === "week" ? "week" : "day";

    const revenueData = await db.execute(
      sql`SELECT DATE_TRUNC(${truncFn}, ${ordersTable.createdAt}) AS date,
          SUM(${ordersTable.total}) AS revenue, COUNT(*) AS orders
          FROM ${ordersTable}
          WHERE ${ordersTable.status} NOT IN ('cancelled','refunded','returned')
          ${from ? sql`AND ${ordersTable.createdAt} >= ${new Date(from)}` : sql``}
          ${to ? sql`AND ${ordersTable.createdAt} <= ${new Date(to)}` : sql``}
          GROUP BY 1 ORDER BY 1`,
    );

    const [summary] = await db.select({
      totalRevenue: sql<number>`coalesce(sum(${ordersTable.total}),0)`,
      totalOrders: sql<number>`count(*)`,
      refundedAmount: sql<number>`coalesce(sum(case when ${ordersTable.status} in ('refunded','returned') then ${ordersTable.total} else 0 end),0)`,
    }).from(ordersTable);

    const points = (revenueData.rows as Array<{ date: string | Date; revenue: string; orders: string }>).map((r) => ({
      date: typeof r.date === "string" ? r.date.slice(0, 10) : (r.date as Date).toISOString().slice(0, 10),
      revenue: Number(r.revenue), orders: Number(r.orders),
    }));

    res.json({
      totalRevenue: Number(summary?.totalRevenue ?? 0),
      totalOrders: Number(summary?.totalOrders ?? 0),
      avgOrderValue: Number(summary?.totalOrders ?? 0) > 0 ? Number(summary?.totalRevenue ?? 0) / Number(summary?.totalOrders ?? 0) : 0,
      refundedAmount: Number(summary?.refundedAmount ?? 0),
      netRevenue: Number(summary?.totalRevenue ?? 0) - Number(summary?.refundedAmount ?? 0),
      points, topStores: [],
    });
  } catch (err) { next(err); }
});

router.get("/admin/reports/summary", requireAuth, requireAdmin, async (_req, res, next): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [[userStats], [storeStats], [productStats], [orderStats], [todayOrders], [driverStats], [couponStats]] =
      await Promise.all([
        db.select({ total: sql<number>`count(*)` }).from(usersTable),
        db.select({ total: sql<number>`count(*)` }).from(storesTable),
        db.select({ total: sql<number>`count(*)` }).from(productsTable),
        db.select({
          total: sql<number>`count(*)`,
          revenue: sql<number>`coalesce(sum(${ordersTable.total}),0)`,
          pending: sql<number>`sum(case when ${ordersTable.status}='pending' then 1 else 0 end)`,
          completed: sql<number>`sum(case when ${ordersTable.status} in ('delivered','completed') then 1 else 0 end)`,
        }).from(ordersTable),
        db.select({ count: sql<number>`count(*)`, revenue: sql<number>`coalesce(sum(${ordersTable.total}),0)` })
          .from(ordersTable).where(sql`${ordersTable.createdAt} >= ${today}`),
        db.select({ active: sql<number>`count(*)` }).from(driversTable).where(eq(driversTable.status, "online")),
        db.select({ total: sql<number>`count(*)` }).from(couponsTable).where(eq(couponsTable.isActive, true)),
      ]);

    const [newUsersToday] = await db.select({ count: sql<number>`count(*)` }).from(usersTable).where(sql`${usersTable.createdAt} >= ${today}`);
    const totalOrders = Number(orderStats?.total ?? 0);
    const completed = Number(orderStats?.completed ?? 0);

    res.json({
      totalUsers: Number(userStats?.total ?? 0), totalStores: Number(storeStats?.total ?? 0),
      totalProducts: Number(productStats?.total ?? 0), totalOrders,
      totalRevenue: Number(orderStats?.revenue ?? 0), pendingOrders: Number(orderStats?.pending ?? 0),
      activeDrivers: Number(driverStats?.active ?? 0), totalCoupons: Number(couponStats?.total ?? 0),
      newUsersToday: Number(newUsersToday?.count ?? 0), ordersToday: Number(todayOrders?.count ?? 0),
      revenueToday: Number(todayOrders?.revenue ?? 0),
      avgOrderValue: totalOrders > 0 ? Number(orderStats?.revenue ?? 0) / totalOrders : 0,
      completionRate: totalOrders > 0 ? (completed / totalOrders) * 100 : 0,
    });
  } catch (err) { next(err); }
});

// ─── SETTINGS ─────────────────────────────────────────────────────────────

router.get("/admin/settings", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  res.json(systemSettings);
});

router.patch("/admin/settings", requireAuth, requireAdmin, async (req, res, next): Promise<void> => {
  try {
    const parsed = UpdateAdminSettingsBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
    systemSettings = { ...systemSettings, ...parsed.data };
    res.json(systemSettings);
  } catch (err) { next(err); }
});

// ─── ROLES ────────────────────────────────────────────────────────────────

router.get("/admin/roles", requireAuth, requireAdmin, async (_req, res, next): Promise<void> => {
  try {
    const roleDefs = [
      { role: "customer", description: "End-users who browse and order from the marketplace", permissions: ["browse_stores", "place_orders", "manage_profile", "manage_wallet", "write_reviews"] },
      { role: "merchant", description: "Store owners who list products and manage their shop", permissions: ["manage_store", "manage_products", "view_orders", "view_analytics", "manage_profile"] },
      { role: "driver", description: "Delivery drivers who fulfill orders", permissions: ["view_assigned_orders", "update_order_status", "manage_profile", "view_earnings"] },
      { role: "admin", description: "Platform administrators with full access", permissions: ["manage_users", "manage_stores", "manage_products", "manage_orders", "manage_coupons", "manage_categories", "broadcast_notifications", "view_reports", "manage_settings", "manage_banners", "manage_cms"] },
    ];

    const counts = await db.select({ role: usersTable.role, count: sql<number>`count(*)` }).from(usersTable).groupBy(usersTable.role);
    const countMap = Object.fromEntries(counts.map((c) => [c.role, Number(c.count)]));
    res.json(roleDefs.map((r) => ({ ...r, userCount: countMap[r.role] ?? 0 })));
  } catch (err) { next(err); }
});

export default router;
