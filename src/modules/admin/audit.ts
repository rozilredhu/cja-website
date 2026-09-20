import { getDb } from "@/lib/db";

/** Append a row to admin_audit_log for important official / settings changes. */
export async function writeAuditLog(opts: {
  actorUserId: number;
  action: string;
  entityType: string;
  entityId?: string | number | null;
  details?: string | null;
}): Promise<void> {
  try {
    const db = await getDb();
    await db
      .prepare(
        `INSERT INTO admin_audit_log
           (actor_user_id, action, entity_type, entity_id, details)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .bind(
        opts.actorUserId,
        opts.action,
        opts.entityType,
        opts.entityId != null ? String(opts.entityId) : null,
        opts.details ?? null,
      )
      .run();
  } catch {
    // Audit must not break the primary action
  }
}

export async function listRecentAudit(limit = 50): Promise<
  {
    id: number;
    actor_user_id: number | null;
    actor_email: string | null;
    action: string;
    entity_type: string;
    entity_id: string | null;
    details: string | null;
    created_at: string;
  }[]
> {
  const db = await getDb();
  const res = await db
    .prepare(
      `SELECT a.id, a.actor_user_id, u.email AS actor_email,
              a.action, a.entity_type, a.entity_id, a.details, a.created_at
       FROM admin_audit_log a
       LEFT JOIN users u ON u.id = a.actor_user_id
       ORDER BY a.created_at DESC
       LIMIT ?`,
    )
    .bind(limit)
    .all<{
      id: number;
      actor_user_id: number | null;
      actor_email: string | null;
      action: string;
      entity_type: string;
      entity_id: string | null;
      details: string | null;
      created_at: string;
    }>();
  return res.results ?? [];
}
