import { pool } from "../db/pool.js";
import { verifyToken } from "../lib/jwt.js";
export const requireAuth = async (request, response, next) => {
    const header = request.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        return response.status(401).json({ message: "Authentification requise." });
    }
    try {
        const token = header.replace("Bearer ", "");
        const payload = verifyToken(token);
        const result = await pool.query(`
        SELECT
          id,
          organization_id AS "organizationId",
          email,
          role,
          full_name AS "fullName"
        FROM users
        WHERE id = $1
      `, [payload.sub]);
        if (!result.rowCount) {
            return response.status(401).json({ message: "Session invalide." });
        }
        request.user = result.rows[0];
        next();
    }
    catch {
        return response.status(401).json({ message: "Token invalide." });
    }
};
export const requireRole = (allowedRoles) => (request, response, next) => {
    if (!request.user || !allowedRoles.includes(request.user.role)) {
        return response
            .status(403)
            .json({ message: "Vous n'avez pas les permissions necessaires." });
    }
    next();
};
