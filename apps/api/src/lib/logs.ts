import { pool } from "../db/pool.js";
export const logEvent = async ({ organizationId, actorUserId = null, eventKey, context = {}, }) => {
    // If no organizationId provided, fall back to the first organization in DB
    if (!organizationId) {
        const res = await pool.query(`SELECT id FROM organizations LIMIT 1`);
        if (res && res.rows && res.rows.length > 0) {
            // @ts-ignore
            organizationId = res.rows[0].id;
        }
    }

    await pool.query(`
      INSERT INTO activity_logs (organization_id, actor_user_id, event_key, context)
      VALUES ($1, $2, $3, $4::jsonb)
    `, [organizationId, actorUserId, eventKey, JSON.stringify(context)]);
};
