import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, addressesTable } from "@workspace/db";
import {
  UpdateUserProfileBody,
  AddAddressBody,
  DeleteAddressParams,
  GetUserProfileResponse,
  UpdateUserProfileResponse,
  ListAddressesResponse,
  AddAddressResponse,
  DeleteAddressResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middleware/auth";

const router: IRouter = Router();

router.get("/users/profile", requireAuth, async (_req, res, next): Promise<void> => {
  try {
    const userId: number = res.locals.userId;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    res.json(GetUserProfileResponse.parse({ ...user, loyaltyPoints: user.loyaltyPoints, createdAt: user.createdAt.toISOString() }));
  } catch (err) { next(err); }
});

router.patch("/users/profile", requireAuth, async (req, res, next): Promise<void> => {
  try {
    const userId: number = res.locals.userId;
    const parsed = UpdateUserProfileBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
    const [user] = await db.update(usersTable).set(parsed.data).where(eq(usersTable.id, userId)).returning();
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    res.json(UpdateUserProfileResponse.parse({ ...user, loyaltyPoints: user.loyaltyPoints, createdAt: user.createdAt.toISOString() }));
  } catch (err) { next(err); }
});

router.get("/users/addresses", requireAuth, async (_req, res, next): Promise<void> => {
  try {
    const userId: number = res.locals.userId;
    const addresses = await db.select().from(addressesTable).where(eq(addressesTable.userId, userId));
    res.json(ListAddressesResponse.parse(addresses.map(a => ({
      ...a,
      latitude: a.latitude ? parseFloat(a.latitude) : null,
      longitude: a.longitude ? parseFloat(a.longitude) : null,
    }))));
  } catch (err) { next(err); }
});

router.post("/users/addresses", requireAuth, async (req, res, next): Promise<void> => {
  try {
    const userId: number = res.locals.userId;
    const parsed = AddAddressBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
    const [address] = await db.insert(addressesTable).values({
      ...parsed.data,
      userId,
      latitude: parsed.data.latitude?.toString() ?? null,
      longitude: parsed.data.longitude?.toString() ?? null,
    }).returning();
    res.status(201).json(AddAddressResponse.parse({
      ...address,
      latitude: address.latitude ? parseFloat(address.latitude) : null,
      longitude: address.longitude ? parseFloat(address.longitude) : null,
    }));
  } catch (err) { next(err); }
});

router.delete("/users/addresses/:addressId", requireAuth, async (req, res, next): Promise<void> => {
  try {
    const raw = Array.isArray(req.params.addressId) ? req.params.addressId[0] : req.params.addressId;
    const params = DeleteAddressParams.safeParse({ addressId: parseInt(raw, 10) });
    if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
    const [address] = await db.delete(addressesTable).where(eq(addressesTable.id, params.data.addressId)).returning();
    if (!address) { res.status(404).json({ error: "Address not found" }); return; }
    res.json(DeleteAddressResponse.parse({
      ...address,
      latitude: address.latitude ? parseFloat(address.latitude) : null,
      longitude: address.longitude ? parseFloat(address.longitude) : null,
    }));
  } catch (err) { next(err); }
});

export default router;
