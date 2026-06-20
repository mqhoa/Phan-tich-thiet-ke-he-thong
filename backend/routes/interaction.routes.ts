// Drug Interactions Endpoint
import { Router } from "express";
import { getDB, saveDB, logAudit } from "../db/jsonDB";
import { authenticateToken } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import { Role, DrugInteraction } from "../types/index";

const router = Router();

router.get("/", authenticateToken, (req, res) => {
  const db = getDB();
  res.json(db.drug_interactions);
});

router.post("/", authenticateToken, authorizeRoles(Role.ADMIN), (req: any, res) => {
  const { medicineA, medicineB, warning } = req.body;
  if (!medicineA || !medicineB || !warning) {
    return res.status(400).json({ message: "Vui lòng nhập tên 2 loại thuốc cùng nội dung cảnh báo tương tác." });
  }

  const db = getDB();
  const interactionId = "int_" + Date.now();
  const code = `DG-${String(db.drug_interactions.length + 1).padStart(3, "0")}`;

  const newInteraction: DrugInteraction = {
    _id: interactionId,
    code,
    medicineA,
    medicineB,
    warning
  };

  db.drug_interactions.push(newInteraction);
  saveDB(db);

  logAudit(req.user._id, req.user.username, req.user.role, "CREATE_INTERACTION", "DrugInteraction", interactionId, `Thêm quy tắc tương tác thuốc mới: [${medicineA}] & [${medicineB}]`);

  res.status(201).json(newInteraction);
});

export default router;