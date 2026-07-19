import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, cartTable, cartItemsTable, productsTable } from "@workspace/db";
import {
  AddToCartBody,
  UpdateCartItemParams,
  UpdateCartItemBody,
  RemoveCartItemParams,
  GetCartResponse,
  AddToCartResponse,
  UpdateCartItemResponse,
  RemoveCartItemResponse,
  ClearCartResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middleware/auth";

async function getOrCreateCart(userId: number) {
  let [cart] = await db.select().from(cartTable).where(eq(cartTable.userId, userId)).limit(1);
  if (!cart) {
    [cart] = await db.insert(cartTable).values({ userId, deliveryFee: 15, discount: 0 }).returning();
  }
  return cart;
}

async function buildCartResponse(cartId: number) {
  const [cart] = await db.select().from(cartTable).where(eq(cartTable.id, cartId)).limit(1);
  const items = await db.select().from(cartItemsTable).where(eq(cartItemsTable.cartId, cartId));
  const itemsDto = items.map(i => ({
    ...i,
    addons: i.addons ? JSON.parse(i.addons) as string[] : [],
  }));
  const subtotal = itemsDto.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal + (cart?.deliveryFee ?? 15) - (cart?.discount ?? 0);
  return {
    id: cart.id,
    items: itemsDto,
    storeId: cart.storeId ?? null,
    storeName: cart.storeName ?? null,
    subtotal,
    deliveryFee: cart.deliveryFee,
    discount: cart.discount,
    total,
    couponCode: cart.couponCode ?? null,
  };
}

const router: IRouter = Router();

router.get("/cart", requireAuth, async (_req, res, next): Promise<void> => {
  try {
    const cart = await getOrCreateCart(res.locals.userId);
    res.json(GetCartResponse.parse(await buildCartResponse(cart.id)));
  } catch (err) { next(err); }
});

router.delete("/cart", requireAuth, async (_req, res, next): Promise<void> => {
  try {
    const cart = await getOrCreateCart(res.locals.userId);
    await db.delete(cartItemsTable).where(eq(cartItemsTable.cartId, cart.id));
    await db.update(cartTable).set({ storeId: null, storeName: null, couponCode: null, discount: 0 }).where(eq(cartTable.id, cart.id));
    res.json(ClearCartResponse.parse(await buildCartResponse(cart.id)));
  } catch (err) { next(err); }
});

router.post("/cart/items", requireAuth, async (req, res, next): Promise<void> => {
  try {
    const parsed = AddToCartBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

    const cart = await getOrCreateCart(res.locals.userId);
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, parsed.data.productId)).limit(1);
    if (!product) { res.status(404).json({ error: "Product not found" }); return; }

    const [existing] = await db.select().from(cartItemsTable)
      .where(and(eq(cartItemsTable.cartId, cart.id), eq(cartItemsTable.productId, parsed.data.productId))).limit(1);

    if (existing) {
      await db.update(cartItemsTable).set({ quantity: existing.quantity + parsed.data.quantity }).where(eq(cartItemsTable.id, existing.id));
    } else {
      await db.insert(cartItemsTable).values({
        cartId: cart.id,
        productId: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: parsed.data.quantity,
        specialInstructions: parsed.data.specialInstructions ?? null,
      });
      await db.update(cartTable).set({ storeId: product.storeId, storeName: product.storeName }).where(eq(cartTable.id, cart.id));
    }

    res.json(AddToCartResponse.parse(await buildCartResponse(cart.id)));
  } catch (err) { next(err); }
});

router.patch("/cart/items/:itemId", requireAuth, async (req, res, next): Promise<void> => {
  try {
    const rawId = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;
    const params = UpdateCartItemParams.safeParse({ itemId: parseInt(rawId, 10) });
    if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
    const parsed = UpdateCartItemBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

    const cart = await getOrCreateCart(res.locals.userId);
    if (parsed.data.quantity <= 0) {
      await db.delete(cartItemsTable).where(eq(cartItemsTable.id, params.data.itemId));
    } else {
      await db.update(cartItemsTable).set({ quantity: parsed.data.quantity }).where(eq(cartItemsTable.id, params.data.itemId));
    }
    res.json(UpdateCartItemResponse.parse(await buildCartResponse(cart.id)));
  } catch (err) { next(err); }
});

router.delete("/cart/items/:itemId", requireAuth, async (req, res, next): Promise<void> => {
  try {
    const rawId = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;
    const params = RemoveCartItemParams.safeParse({ itemId: parseInt(rawId, 10) });
    if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

    const cart = await getOrCreateCart(res.locals.userId);
    await db.delete(cartItemsTable).where(eq(cartItemsTable.id, params.data.itemId));
    res.json(RemoveCartItemResponse.parse(await buildCartResponse(cart.id)));
  } catch (err) { next(err); }
});

export default router;
