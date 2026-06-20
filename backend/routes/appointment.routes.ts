
import { Router } from "express";
import { getDB, saveDB, logAudit } from "../db/jsonDB";

import { authenticateToken } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

import {
  Role,
  Appointment,
  AppointmentStatus
} from "../types";

const router = Router();

router.get("/", authenticateToken, (req: any, res) => {
  const db = getDB();
  const user = req.user;

  // PATIENT sees their own appointments
  if (user.role === Role.PATIENT) {
    const list = db.appointments.filter(a => a.patient_id === user.patientId);
    return res.json(list);
  }

  // DOCTOR sees appointments assigned to them
  if (user.role === Role.DOCTOR) {
    // If doctor has specific doctorId, filter by it
    const docId = user.doctorId || "doc_1";
    const list = db.appointments.filter(a => a.doctor_id === docId);
    return res.json(list);
  }

  // ADMIN and PHARMACIST see all appointments
  res.json(db.appointments);
});

router.post("/", authenticateToken, authorizeRoles(Role.ADMIN, Role.PATIENT), (req: any, res) => {
  const { doctor_id, appointmentDate, reason } = req.body;
  const db = getDB();
  const user = req.user;

  let patientId = user.patientId;
  if (user.role === Role.ADMIN) {
    if (!req.body.patient_id) {
      return res.status(400).json({ message: "Vui lòng chọn bệnh nhân đặt lịch (Admin bắt buộc)." });
    }
    patientId = req.body.patient_id;
  }

  if (!patientId) {
    return res.status(400).json({ message: "Vui lòng hoàn thành thông tin bệnh nhân trước khi đặt lịch." });
  }

  if (!doctor_id || !appointmentDate) {
    return res.status(400).json({ message: "Vui lòng chọn bác sĩ và thời gian khám." });
  }

  const app_id = "app_" + Date.now();
  const count = db.appointments.length + 1;
  const code = `LH-${String(count).padStart(4, "0")}`;

  const newApp: Appointment = {
    _id: app_id,
    code,
    patient_id: patientId,
    doctor_id,
    appointmentDate,
    status: AppointmentStatus.PENDING,
    reason: reason || "Khám sức khỏe chung"
  };

  db.appointments.push(newApp);
  saveDB(db);

  const patientObj = db.patients.find(p => p._id === patientId);
  const patientName = patientObj ? patientObj.fullName : "Chưa rõ";

  logAudit(user._id, user.username, user.role, "CREATE_APPOINTMENT", "Appointment", app_id, `Bệnh nhân ${patientName} đặt lịch khám vào ngày ${new Date(appointmentDate).toLocaleString()}`);

  res.status(201).json(newApp);
});

router.put("/:id", authenticateToken, (req: any, res) => {
  const { id } = req.params;
  const { status, doctor_id, appointmentDate, reason } = req.body;
  const db = getDB();
  const user = req.user;

  const appIndex = db.appointments.findIndex(a => a._id === id);
  if (appIndex === -1) {
    return res.status(404).json({ message: "Không tìm thấy lịch khám." });
  }

  const existingApp = db.appointments[appIndex];

  // RBAC checks
  // Patient can only CANCEL their own PENDING appointment
  if (user.role === Role.PATIENT) {
    if (existingApp.patient_id !== user.patientId) {
      return res.status(403).json({ message: "Bạn không thể sửa lịch khám của người khác." });
    }
    if (status !== AppointmentStatus.CANCELLED) {
      return res.status(403).json({ message: "Bệnh nhân chỉ được quyền hủy lịch khám." });
    }
  }

  // Doctor can complete medicine checkout or mark complete, but mostly ADMIN approves
  const updatedApp: Appointment = {
    ...existingApp,
    status: status || existingApp.status,
    doctor_id: doctor_id || existingApp.doctor_id,
    appointmentDate: appointmentDate || existingApp.appointmentDate,
    reason: reason || existingApp.reason,
  };

  db.appointments[appIndex] = updatedApp;
  saveDB(db);

  logAudit(user._id, user.username, user.role, "UPDATE_APPOINTMENT", "Appointment", id, `Cập nhật trạng thái lịch khám ${existingApp.code} thành ${updatedApp.status}`);

  res.json(updatedApp);
});

export default router;
