import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, notificationsTable } from "@workspace/db";
import {
  MarkNotificationReadParams,
  ListNotificationsResponse,
  MarkNotificationReadResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middleware/auth";

const router: IRouter = Router();

router.get("/notifications", requireAuth, async (_req, res, next): Promise<void> => {
  try {
    const userId: number = res.locals.userId;
    const notifications = await db.select().from(notificationsTable)
      .where(eq(notificationsTable.userId, userId));
    res.json(ListNotificationsResponse.parse(notifications.map(n => ({
      ...n,
      type: n.type as "order" | "promo" | "system" | "driver" | "chat",
      orderId: n.orderId ?? null,
      image: n.image ?? null,
      createdAt: n.createdAt.toISOString(),
    }))));
  } catch (err) { next(err); }
});

router.post("/notifications/:notificationId/read", requireAuth, async (req, res, next): Promise<void> => {
  try {
    const raw = Array.isArray(req.params.notificationId) ? req.params.notificationId[0] : req.params.notificationId;
    const params = MarkNotificationReadParams.safeParse({ notificationId: parseInt(raw, 10) });
    if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

    const [notification] = await db.update(notificationsTable)
      .set({ isRead: true })
      .where(eq(notificationsTable.id, params.data.notificationId))
      .returning();
    if (!notification) { res.status(404).json({ error: "Notification not found" }); return; }

    // Ownership check
    if (notification.userId !== res.locals.userId) { res.status(403).json({ error: "Forbidden" }); return; }

    res.json(MarkNotificationReadResponse.parse({
      ...notification,
      type: notification.type as "order" | "promo" | "system" | "driver" | "chat",
      orderId: notification.orderId ?? null,
      image: notification.image ?? null,
      createdAt: notification.createdAt.toISOString(),
    }));
  } catch (err) { next(err); }
});

export default router;
