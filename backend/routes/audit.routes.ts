import { Router } from "express";
import { getDB } from "../db/jsonDB";
import { authenticateToken } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import { Role } from "../types/index";

const router = Router();

router.get("/", authenticateToken, authorizeRoles(Role.ADMIN), (req, res) => {
  const db = getDB();
  res.json(db.audits);
});

export default router;