import { Router } from "express";

import { getDB, saveDB, logAudit } from "../db/jsonDB";

import { authenticateToken } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

import {
  Role,
  MedicalRecord,
  AppointmentStatus
} from "../types";

const router = Router();

router.get("/", authenticateToken, (req: any, res) => {
  const db = getDB();
  const user = req.user;

  // PATIENT gets their own medical records
  if (user.role === Role.PATIENT) {
    const list = db.medical_records.filter(r => r.patient_id === user.patientId);
    return res.json(list);
  }

  // DOCTOR gets their examination records
  if (user.role === Role.DOCTOR) {
    const docId = user.doctorId || "doc_1";
    const list = db.medical_records.filter(r => r.doctor_id === docId);
    return res.json(list);
  }

  // ADMIN & PHARMACIST see all
  res.json(db.medical_records);
});

router.get("/:id", authenticateToken, (req: any, res) => {
  const db = getDB();
  const user = req.user;
  const { id } = req.params;

  const record = db.medical_records.find(r => r._id === id);
  if (!record) {
    return res.status(404).json({ message: "Không tìm thấy hồ sơ khám bệnh." });
  }

  if (user.role === Role.PATIENT && record.patient_id !== user.patientId) {
    return res.status(403).json({ message: "Bạn không có quyền truy cập hồ sơ khám của bệnh nhân khác." });
  }

  res.json(record);
});

router.post("/", authenticateToken, authorizeRoles(Role.ADMIN, Role.DOCTOR), (req: any, res) => {
  const { patient_id, appointment_id, symptoms, diagnosis, notes } = req.body;
  if (!patient_id || !diagnosis || !symptoms) {
    return res.status(400).json({ message: "Vui lòng điền triệu chứng và chẩn đoán bệnh án." });
  }

  const db = getDB();
  const user = req.user;
  const doctor_id = user.doctorId || "doc_1";

  const recordId = "rec_" + Date.now();
  const count = db.medical_records.length + 1;
  const code = `BA-${String(count).padStart(4, "0")}`;

  const newRecord: MedicalRecord = {
    _id: recordId,
    code,
    patient_id,
    doctor_id,
    appointment_id: appointment_id || "",
    symptoms,
    diagnosis,
    notes: notes || "",
    visitDate: new Date().toISOString()
  };

  db.medical_records.push(newRecord);

  // Automatically update the appointment status to COMPLETED if appointment_id is present
  if (appointment_id) {
    const appIdx = db.appointments.findIndex(a => a._id === appointment_id);
    if (appIdx !== -1) {
      db.appointments[appIdx].status = AppointmentStatus.COMPLETED;
    }
  }

  saveDB(db);

  const patientObj = db.patients.find(p => p._id === patient_id);
  const patientName = patientObj ? patientObj.fullName : "Chưa rõ";

  logAudit(user._id, user.username, user.role, "CREATE_RECORD", "MedicalRecord", recordId, `Bác sĩ ${user.name} lập bệnh án ${code} cho bệnh nhân: ${patientName}. Chẩn đoán: ${diagnosis}`);

  res.status(201).json(newRecord);
});

export default router;