import { pool } from "../db/pool.js";
export const logEvent = async ({ organizationId, actorUserId = null, eventKey, context = {}, }) => {
    await pool.query(`
      INSERT INTO activity_logs (organization_id, actor_user_id, event_key, context)
      VALUES ($1, $2, $3, $4::jsonb)
    `, [organizationId, actorUserId, eventKey, JSON.stringify(context)]);
};
