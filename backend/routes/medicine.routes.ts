import { Router } from "express";
import { getDB, saveDB, logAudit } from "../db/jsonDB";
import { authenticateToken } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import { Role, Medicine } from "../types/index";

const router = Router();

router.get("/", authenticateToken, (req, res) => {
  const db = getDB();
  res.json(db.medicines);
});

router.post("/", authenticateToken, authorizeRoles(Role.ADMIN, Role.PHARMACIST), (req: any, res) => {
  const { name, stock, unit, price, expiryDate, code } = req.body;
  if (!name || stock === undefined || !unit || !price) {
    return res.status(400).json({ message: "Vui lòng điền đầy đủ các thông tin bắt buộc của thuốc." });
  }

  const db = getDB();
  const medId = "med_" + Date.now();
  const medCode = code || `MED-${String(db.medicines.length + 1).padStart(3, "0")}`;

  const newMedicine: Medicine = {
    _id: medId,
    code: medCode,
    name,
    stock: Number(stock) || 0,
    unit,
    price: Number(price) || 0,
    expiryDate: expiryDate || "2027-12-31"
  };

  db.medicines.push(newMedicine);
  saveDB(db);

  logAudit(req.user._id, req.user.username, req.user.role, "CREATE_MEDICINE", "Medicine", medId, `Thêm loại thuốc mới vào kho: ${name} (${stock} ${unit})`);

  res.status(201).json(newMedicine);
});

router.put("/:id", authenticateToken, authorizeRoles(Role.ADMIN, Role.PHARMACIST), (req: any, res) => {
  const { id } = req.params;
  const { name, stock, unit, price, expiryDate, code } = req.body;

  const db = getDB();
  const medIndex = db.medicines.findIndex(m => m._id === id);
  if (medIndex === -1) {
    return res.status(404).json({ message: "Không tìm thấy thông tin thuốc điện tử." });
  }

  const existingMed = db.medicines[medIndex];
  const updatedMed: Medicine = {
    ...existingMed,
    name: name || existingMed.name,
    code: code || existingMed.code,
    stock: stock !== undefined ? Number(stock) : existingMed.stock,
    unit: unit || existingMed.unit,
    price: price !== undefined ? Number(price) : existingMed.price,
    expiryDate: expiryDate || existingMed.expiryDate,
  };

  db.medicines[medIndex] = updatedMed;
  saveDB(db);

  logAudit(req.user._id, req.user.username, req.user.role, "UPDATE_MEDICINE", "Medicine", id, `Cập nhật tồn kho/thông tin thuốc: ${updatedMed.name}, số lượng hiện tại ${updatedMed.stock}`);

  res.json(updatedMed);
});

export default router;
