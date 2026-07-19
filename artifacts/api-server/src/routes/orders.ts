import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, ordersTable, orderItemsTable, cartTable, cartItemsTable } from "@workspace/db";
import {
  ListOrdersQueryParams,
  CreateOrderBody,
  GetOrderParams,
  CancelOrderParams,
  GetOrderTrackingParams,
  ListOrdersResponse,
  CreateOrderResponse,
  GetOrderResponse,
  CancelOrderResponse,
  GetOrderTrackingResponse,
  ListMerchantOrdersResponse,
  ListMerchantOrdersQueryParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middleware/auth";

const router: IRouter = Router();

function orderToDto(o: typeof ordersTable.$inferSelect) {
  return {
    ...o,
    status: o.status as string,
    paymentMethod: o.paymentMethod as string,
    estimatedDelivery: o.estimatedDelivery ?? null,
    driverId: o.driverId ?? null,
    driverName: o.driverName ?? null,
    storeImage: o.storeImage ?? null,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  };
}

router.get("/orders", requireAuth, async (req, res, next): Promise<void> => {
  try {
    const parsed = ListOrdersQueryParams.safeParse(req.query);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

    const orders = await db.select().from(ordersTable)
      .where(eq(ordersTable.userId, res.locals.userId))
      .orderBy(desc(ordersTable.createdAt))
      .limit(parsed.data.limit ?? 20)
      .offset(parsed.data.offset ?? 0);
    res.json(ListOrdersResponse.parse(orders.map(orderToDto)));
  } catch (err) { next(err); }
});

router.post("/orders", requireAuth, async (req, res, next): Promise<void> => {
  try {
    const parsed = CreateOrderBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

    const userId: number = res.locals.userId;
    const [cart] = await db.select().from(cartTable).where(eq(cartTable.userId, userId)).limit(1);
    const items = cart ? await db.select().from(cartItemsTable).where(eq(cartItemsTable.cartId, cart.id)) : [];

    if (items.length === 0) {
      res.status(400).json({ error: "Cart is empty" });
      return;
    }

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const deliveryFee = cart?.deliveryFee ?? 15;
    const discount = cart?.discount ?? 0;
    const total = subtotal + deliveryFee - discount;

    const [order] = await db.insert(ordersTable).values({
      userId,
      storeId: cart?.storeId ?? 1,
      storeName: cart?.storeName ?? "Cargo Store",
      status: "pending",
      subtotal,
      deliveryFee,
      discount,
      total,
      paymentMethod: parsed.data.paymentMethod as "cash" | "card" | "wallet",
      deliveryAddress: (parsed.data as typeof parsed.data & { deliveryAddress?: string }).deliveryAddress ?? "Delivery Address",
      itemCount: items.length,
      estimatedDelivery: "30-45 Min",
      couponCode: cart?.couponCode ?? null,
    }).returning();

    if (items.length > 0) {
      await db.insert(orderItemsTable).values(items.map(i => ({
        orderId: order.id,
        productId: i.productId,
        name: i.name,
        image: i.image,
        price: i.price,
        quantity: i.quantity,
        variant: i.variant ?? null,
        specialInstructions: i.specialInstructions ?? null,
      })));
    }

    // Clear cart
    if (cart) {
      await db.delete(cartItemsTable).where(eq(cartItemsTable.cartId, cart.id));
      await db.update(cartTable).set({ storeId: null, storeName: null, discount: 0, couponCode: null }).where(eq(cartTable.id, cart.id));
    }

    res.status(201).json(CreateOrderResponse.parse(orderToDto(order)));
  } catch (err) { next(err); }
});

router.get("/orders/:orderId", requireAuth, async (req, res, next): Promise<void> => {
  try {
    const raw = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
    const params = GetOrderParams.safeParse({ orderId: parseInt(raw, 10) });
    if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

    const [order] = await db.select().from(ordersTable)
      .where(eq(ordersTable.id, params.data.orderId)).limit(1);
    if (!order) { res.status(404).json({ error: "Order not found" }); return; }
    // Ownership check
    if (order.userId !== res.locals.userId) { res.status(403).json({ error: "Forbidden" }); return; }

    const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));
    const itemsDto = items.map(i => ({ ...i, addons: i.addons ? JSON.parse(i.addons) as string[] : [], variant: i.variant ?? null, specialInstructions: i.specialInstructions ?? null }));

    const statuses = ["pending", "accepted", "preparing", "packed", "driver_assigned", "picked_up", "delivering", "delivered", "completed"];
    const currentIndex = statuses.indexOf(order.status);
    const timeline = statuses.map((s, idx) => ({
      status: s,
      timestamp: idx <= currentIndex ? new Date(Date.now() - (currentIndex - idx) * 600000).toISOString() : new Date().toISOString(),
      label: s.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
      completed: idx <= currentIndex,
    }));

    res.json(GetOrderResponse.parse({ ...orderToDto(order), items: itemsDto, timeline, invoice: null }));
  } catch (err) { next(err); }
});

router.post("/orders/:orderId/cancel", requireAuth, async (req, res, next): Promise<void> => {
  try {
    const raw = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
    const params = CancelOrderParams.safeParse({ orderId: parseInt(raw, 10) });
    if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

    // Verify ownership first
    const [existing] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.orderId)).limit(1);
    if (!existing) { res.status(404).json({ error: "Order not found" }); return; }
    if (existing.userId !== res.locals.userId) { res.status(403).json({ error: "Forbidden" }); return; }

    const [order] = await db.update(ordersTable)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(ordersTable.id, params.data.orderId))
      .returning();
    res.json(CancelOrderResponse.parse(orderToDto(order)));
  } catch (err) { next(err); }
});

router.get("/orders/:orderId/tracking", requireAuth, async (req, res, next): Promise<void> => {
  try {
    const raw = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
    const params = GetOrderTrackingParams.safeParse({ orderId: parseInt(raw, 10) });
    if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.orderId)).limit(1);
    if (!order) { res.status(404).json({ error: "Order not found" }); return; }
    if (order.userId !== res.locals.userId) { res.status(403).json({ error: "Forbidden" }); return; }

    res.json(GetOrderTrackingResponse.parse({
      orderId: order.id,
      status: order.status,
      eta: "15 Min",
      driverName: order.driverName ?? "Ahmed Hassan",
      driverPhone: "+971501234567",
      driverAvatar: null,
      driverRating: 4.8,
      driverLat: 25.2048,
      driverLng: 55.2708,
      storeAddress: "123 Store Street, Dubai",
      deliveryAddress: order.deliveryAddress,
      timeline: [
        { status: "pending",   timestamp: order.createdAt.toISOString(), label: "Order Placed",    completed: true },
        { status: "accepted",  timestamp: new Date(Date.now() - 300000).toISOString(), label: "Order Accepted", completed: true },
        { status: "preparing", timestamp: new Date(Date.now() - 200000).toISOString(), label: "Preparing",      completed: ["preparing","packed","driver_assigned","picked_up","delivering","delivered","completed"].includes(order.status) },
        { status: "picked_up", timestamp: new Date(Date.now() - 100000).toISOString(), label: "Picked Up",      completed: ["picked_up","delivering","delivered","completed"].includes(order.status) },
        { status: "delivered", timestamp: new Date().toISOString(),                    label: "Delivered",      completed: ["delivered","completed"].includes(order.status) },
      ],
    }));
  } catch (err) { next(err); }
});

// Merchant orders (role check TODO: add merchant role guard)
router.get("/merchant/orders", requireAuth, async (req, res, next): Promise<void> => {
  try {
    const parsed = ListMerchantOrdersQueryParams.safeParse(req.query);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
    const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(20);
    res.json(ListMerchantOrdersResponse.parse(orders.map(orderToDto)));
  } catch (err) { next(err); }
});

export default router;
