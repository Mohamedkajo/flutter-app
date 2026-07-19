import { Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { auditLogsTable } from "@workspace/db";

export interface AuditContext {
  action: string;
  entity: string;
  entityId?: string | number;
  details?: Record<string, any>;
}

// Call this from route handlers to log admin actions
export async function logAudit(req: Request, context: AuditContext): Promise<void> {
  try {
    const userId = (req as any).userId;
    const userEmail = (req as any).userEmail;
    const userName = (req as any).userName;
    await db.insert(auditLogsTable).values({
      userId,
      userEmail,
      userName,
      action: context.action,
      entity: context.entity,
      entityId: context.entityId != null ? String(context.entityId) : undefined,
      details: context.details ? JSON.stringify(context.details) : undefined,
      ipAddress: req.ip,
    });
  } catch {
    // Never let audit logging break the request
  }
}
