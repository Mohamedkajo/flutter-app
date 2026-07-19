import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, couponsTable } from "@workspace/db";
import {
  ValidateCouponBody,
  ListCouponsResponse,
  ValidateCouponResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/coupons", async (_req, res): Promise<void> => {
  const coupons = await db.select().from(couponsTable).where(eq(couponsTable.isActive, true));
  res.json(ListCouponsResponse.parse(coupons.map(c => ({
    ...c,
    type: c.type as string,
    description: c.description ?? null,
    minOrder: c.minOrder ?? null,
    maxDiscount: c.maxDiscount ?? null,
    isUsed: false,
    expiresAt: c.expiresAt.toISOString(),
  }))));
});

router.post("/coupons/validate", async (req, res): Promise<void> => {
  const parsed = ValidateCouponBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [coupon] = await db.select().from(couponsTable).where(eq(couponsTable.code, parsed.data.code)).limit(1);
  if (!coupon || !coupon.isActive) {
    res.json(ValidateCouponResponse.parse({ valid: false, discount: 0, message: "Invalid or expired coupon", coupon: null }));
    return;
  }

  if (coupon.expiresAt < new Date()) {
    res.json(ValidateCouponResponse.parse({ valid: false, discount: 0, message: "Coupon has expired", coupon: null }));
    return;
  }

  if (coupon.minOrder && parsed.data.orderAmount < coupon.minOrder) {
    res.json(ValidateCouponResponse.parse({ valid: false, discount: 0, message: `Minimum order is ${coupon.minOrder} EGP`, coupon: null }));
    return;
  }

  let discount = coupon.type === "percentage"
    ? (parsed.data.orderAmount * coupon.discount) / 100
    : coupon.discount;

  if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;

  const couponDto = {
    ...coupon,
    type: coupon.type as string,
    description: coupon.description ?? null,
    minOrder: coupon.minOrder ?? null,
    maxDiscount: coupon.maxDiscount ?? null,
    isUsed: false,
    expiresAt: coupon.expiresAt.toISOString(),
  };

  res.json(ValidateCouponResponse.parse({ valid: true, discount, message: null, coupon: couponDto }));
});

export default router;
