import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, driversTable, ordersTable } from "@workspace/db";
import {
  UpdateDriverProfileBody,
  UpdateDriverStatusBody,
  GetDriverProfileResponse,
  UpdateDriverProfileResponse,
  ListDriverOrdersResponse,
  GetDriverEarningsResponse,
  UpdateDriverStatusResponse,
} from "@workspace/api-zod";

const DEFAULT_DRIVER_USER_ID = 2;

async function getOrCreateDriver() {
  let [driver] = await db.select().from(driversTable).limit(1);
  if (!driver) {
    [driver] = await db.insert(driversTable).values({
      userId: DEFAULT_DRIVER_USER_ID,
      name: "Mohamed Khalil",
      phone: "+201234567891",
      vehicleType: "scooter",
      vehiclePlate: "ABC 1234",
      status: "offline",
      rating: 4.9,
      totalDeliveries: 847,
      wallet: 1250,
    }).returning();
  }
  return driver;
}

const router: IRouter = Router();

router.get("/drivers/profile", async (_req, res): Promise<void> => {
  const driver = await getOrCreateDriver();
  res.json(GetDriverProfileResponse.parse({
    ...driver,
    status: driver.status as string,
    vehicleType: driver.vehicleType as string,
    avatar: driver.avatar ?? null,
    vehiclePlate: driver.vehiclePlate ?? null,
  }));
});

router.patch("/drivers/profile", async (req, res): Promise<void> => {
  const parsed = UpdateDriverProfileBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const driver = await getOrCreateDriver();
  const [updated] = await db.update(driversTable).set(parsed.data as any).where(eq(driversTable.id, driver.id)).returning();
  res.json(UpdateDriverProfileResponse.parse({
    ...updated,
    status: updated.status as string,
    vehicleType: updated.vehicleType as string,
    avatar: updated.avatar ?? null,
    vehiclePlate: updated.vehiclePlate ?? null,
  }));
});

router.get("/drivers/orders", async (_req, res): Promise<void> => {
  const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(10);
  res.json(ListDriverOrdersResponse.parse(orders.map(o => ({
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

router.get("/drivers/earnings", async (_req, res): Promise<void> => {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    return { date: d.toISOString().split("T")[0], revenue: 150 + Math.random() * 200, orders: 5 + Math.floor(Math.random() * 10) };
  }).reverse();

  res.json(GetDriverEarningsResponse.parse({
    todayEarnings: 285,
    weekEarnings: 1840,
    monthEarnings: 7200,
    totalDeliveries: 847,
    totalEarnings: 42500,
    pendingPayout: 285,
    dailyBreakdown: days,
  }));
});

router.patch("/drivers/status", async (req, res): Promise<void> => {
  const parsed = UpdateDriverStatusBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const driver = await getOrCreateDriver();
  const [updated] = await db.update(driversTable).set({ status: parsed.data.status as any }).where(eq(driversTable.id, driver.id)).returning();
  res.json(UpdateDriverStatusResponse.parse({
    ...updated,
    status: updated.status as string,
    vehicleType: updated.vehicleType as string,
    avatar: updated.avatar ?? null,
    vehiclePlate: updated.vehiclePlate ?? null,
  }));
});

export default router;
