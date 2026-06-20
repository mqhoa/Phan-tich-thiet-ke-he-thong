import { Router } from "express";
import { getDB, saveDB, logAudit } from "../db/jsonDB";
import { authenticateToken } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import { Role, Patient } from "../types/index";

const router = Router();

router.get("/", authenticateToken, (req: any, res) => {
  const db = getDB();
  const user = req.user;

  // PATIENT role can only query their own patient record
  if (user.role === Role.PATIENT) {
    const list = db.patients.filter(p => p._id === user.patientId);
    return res.json(list);
  }

  // ADMIN, DOCTOR, PHARMACIST see all patients
  res.json(db.patients);
});

router.get("/:id", authenticateToken, (req: any, res) => {
  const db = getDB();
  const user = req.user;
  const { id } = req.params;

  if (user.role === Role.PATIENT && user.patientId !== id) {
    return res.status(403).json({ message: "Bạn không có quyền truy cập hồ sơ của bệnh nhân khác." });
  }

  const patient = db.patients.find(p => p._id === id);
  if (!patient) {
    return res.status(404).json({ message: "Không tìm thấy thông tin bệnh nhân." });
  }

  res.json(patient);
});

router.post("/", authenticateToken, authorizeRoles(Role.ADMIN, Role.DOCTOR), (req: any, res) => {
  const { fullName, gender, dob, address, phone, insuranceNumber, email } = req.body;
  if (!fullName) {
    return res.status(400).json({ message: "Vui lòng cung cấp họ và tên bệnh nhân." });
  }

  const db = getDB();
  const patientId = "pat_" + Date.now();
  const newPatient: Patient = {
    _id: patientId,
    fullName,
    gender: gender || "Nam",
    dob: dob || "",
    address: address || "",
    phone: phone || "",
    insuranceNumber: insuranceNumber || "",
    email: email || ""
  };

  db.patients.push(newPatient);
  saveDB(db);

  logAudit(req.user._id, req.user.username, req.user.role, "CREATE_PATIENT", "Patient", patientId, `Tạo hồ sơ bệnh nhân mới: ${fullName}`);

  res.status(201).json(newPatient);
});

router.put("/:id", authenticateToken, authorizeRoles(Role.ADMIN, Role.DOCTOR), (req: any, res) => {
  const { id } = req.params;
  const { fullName, gender, dob, address, phone, insuranceNumber, email } = req.body;

  const db = getDB();
  const patientIndex = db.patients.findIndex(p => p._id === id);
  if (patientIndex === -1) {
    return res.status(404).json({ message: "Không tìm thấy thông tin bệnh nhân." });
  }

  const existingPatient = db.patients[patientIndex];
  const updatedPatient: Patient = {
    ...existingPatient,
    fullName: fullName || existingPatient.fullName,
    gender: gender || existingPatient.gender,
    dob: dob || existingPatient.dob,
    address: address || existingPatient.address,
    phone: phone || existingPatient.phone,
    insuranceNumber: insuranceNumber || existingPatient.insuranceNumber,
    email: email || existingPatient.email,
  };

  db.patients[patientIndex] = updatedPatient;
  saveDB(db);

  logAudit(req.user._id, req.user.username, req.user.role, "UPDATE_PATIENT", "Patient", id, `Cập nhật hồ sơ bệnh nhân: ${updatedPatient.fullName}`);

  res.json(updatedPatient);
});


export default router;