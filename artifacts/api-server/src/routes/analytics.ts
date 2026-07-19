import { Router, type IRouter } from "express";
import { desc, count, sum, eq } from "drizzle-orm";
import { db, ordersTable, usersTable, storesTable } from "@workspace/db";
import {
  GetAnalyticsSummaryResponse,
  GetOrdersByStatusResponse,
  GetRevenueTrendResponse,
  GetTopStoresResponse,
  GetRecentOrdersResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/analytics/summary", async (_req, res): Promise<void> => {
  const [orderStats] = await db.select({ total: count(), revenue: sum(ordersTable.total) }).from(ordersTable);
  const [customerCount] = await db.select({ total: count() }).from(usersTable).where(eq(usersTable.role, "customer"));
  const [storeCount] = await db.select({ total: count() }).from(storesTable);

  res.json(GetAnalyticsSummaryResponse.parse({
    totalOrders: orderStats?.total ?? 0,
    totalRevenue: parseFloat(String(orderStats?.revenue ?? 0)),
    totalCustomers: customerCount?.total ?? 0,
    totalStores: storeCount?.total ?? 0,
    pendingOrders: 12,
    activeDrivers: 24,
    avgOrderValue: orderStats?.total ? parseFloat(String(orderStats?.revenue ?? 0)) / orderStats.total : 0,
    completionRate: 94.5,
  }));
});

router.get("/analytics/orders-by-status", async (_req, res): Promise<void> => {
  const statuses = ["pending", "accepted", "preparing", "delivering", "delivered", "completed", "cancelled"] as const;
  const result = statuses.map(status => ({ status, count: Math.floor(Math.random() * 50) + 5 }));
  res.json(GetOrdersByStatusResponse.parse(result));
});

router.get("/analytics/revenue-trend", async (_req, res): Promise<void> => {
  const today = new Date();
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (29 - i));
    return {
      date: d.toISOString().split("T")[0],
      revenue: 2000 + Math.random() * 5000,
      orders: 20 + Math.floor(Math.random() * 60),
    };
  });
  res.json(GetRevenueTrendResponse.parse(days));
});

router.get("/analytics/top-stores", async (_req, res): Promise<void> => {
  const stores = await db.select().from(storesTable).orderBy(desc(storesTable.rating)).limit(5);
  res.json(GetTopStoresResponse.parse(stores.map(s => ({
    ...s,
    tags: s.productCategories ? JSON.parse(s.productCategories) as string[] : [],
    distance: null,
  }))));
});

router.get("/analytics/recent-orders", async (_req, res): Promise<void> => {
  const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(10);
  res.json(GetRecentOrdersResponse.parse(orders.map(o => ({
    ...o,
    status: o.status as string,
    paymentMethod: o.paymentMethod as string,
    estimatedDelivery: o.estimatedDelivery ?? null,
    driverId: o.driverId ?? null,
    driverName: o.driverName ?? null,
    storeImage: o.storeImage ?? null,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  }))));
});

export default router;
