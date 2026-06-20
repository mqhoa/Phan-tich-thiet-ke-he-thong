
import { Router } from "express";
import {
  Role,
  Prescription,
  PrescriptionDetail,
  PrescriptionStatus
} from "../types/index";
import { authenticateToken } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import { getDB, saveDB, logAudit } from "../db/jsonDB";

const router = Router();

router.get("/", authenticateToken, (req: any, res) => {
  const db = getDB();
  const user = req.user;

  if (user.role === Role.PATIENT) {
    const list = db.prescriptions.filter(p => p.patient_id === user.patientId);
    return res.json(list);
  }

  if (user.role === Role.DOCTOR) {
    const docId = user.doctorId || "doc_1";
    const list = db.prescriptions.filter(p => p.doctor_id === docId);
    return res.json(list);
  }

  // PHARMACIST & ADMIN see all prescriptions
  res.json(db.prescriptions);
});

router.get("/:id", authenticateToken, (req: any, res) => {
  const db = getDB();
  const user = req.user;
  const { id } = req.params;

  const prescription = db.prescriptions.find(p => p._id === id);
  if (!prescription) {
    return res.status(404).json({ message: "Không tìm thấy đơn thuốc điện tử." });
  }

  if (user.role === Role.PATIENT && prescription.patient_id !== user.patientId) {
    return res.status(403).json({ message: "Bạn không có quyền xem đơn thuốc của người khác." });
  }

  res.json(prescription);
});

router.post("/", authenticateToken, authorizeRoles(Role.ADMIN, Role.DOCTOR), (req: any, res) => {
  const { patient_id, medicalRecord_id, medicines_list } = req.body;
  // medicines_list expectation: Array of { medicine_id, quantity, dosage, instruction }

  if (!patient_id || !medicalRecord_id || !medicines_list || !Array.isArray(medicines_list) || medicines_list.length === 0) {
    return res.status(400).json({ message: "Vui lòng kê ít nhất một loại thuốc cho bệnh nhân." });
  }

  const db = getDB();
  const user = req.user;
  const doctor_id = user.doctorId || "doc_1";

  // CHECK DRUG INTERACTIONS
  // Find medicine names/details first
  const medicinesDetails = medicines_list.map(f => {
    const med = db.medicines.find(m => m._id === f.medicine_id);
    return med ? med.name : "";
  }).filter(name => name !== "");

  // Find any active warnings
  const warningsOccurred: string[] = [];
  for (let i = 0; i < medicinesDetails.length; i++) {
    for (let j = i + 1; j < medicinesDetails.length; j++) {
      const nameA = medicinesDetails[i];
      const nameB = medicinesDetails[j];
      
      const interaction = db.drug_interactions.find(inter => 
        (inter.medicineA === nameA && inter.medicineB === nameB) ||
        (inter.medicineA === nameB && inter.medicineB === nameA)
      );

      if (interaction) {
        warningsOccurred.push(`Tương tác [${nameA}] & [${nameB}]: ${interaction.warning}`);
      }
    }
  }

  const prescriptionId = "pres_" + Date.now();
  const count = db.prescriptions.length + 1;
  const code = `DT-${String(count).padStart(4, "0")}`;

  const details: PrescriptionDetail[] = medicines_list.map((m, idx) => {
    return {
      _id: `dtl_${Date.now()}_${idx}`,
      code: `PD-${String(count).padStart(3, "0")}-${idx + 1}`,
      prescription_id: prescriptionId,
      medicine_id: m.medicine_id,
      quantity: Number(m.quantity) || 1,
      dosage: m.dosage || "1 viên/ngày",
      instruction: m.instruction || "Sau ăn"
    };
  });

  const newPrescription: Prescription = {
    _id: prescriptionId,
    code,
    patient_id,
    doctor_id,
    medicalRecord_id,
    createdAt: new Date().toISOString(),
    status: PrescriptionStatus.PENDING,
    details
  };

  db.prescriptions.push(newPrescription);
  saveDB(db);

  const patientObj = db.patients.find(p => p._id === patient_id);
  const patientName = patientObj ? patientObj.fullName : "Chưa rõ";

  logAudit(user._id, user.username, user.role, "CREATE_PRESCRIPTION", "Prescription", prescriptionId, 
    `Doctor ${user.name} kê đơn thuốc điện tử ${code} cho bệnh nhân: ${patientName}.${
      warningsOccurred.length > 0 ? " LƯU Ý: Có phát hiện " + warningsOccurred.length + " tương tác thuốc nghiêm trọng." : ""
    }`
  );

  res.status(201).json({
    prescription: newPrescription,
    warnings: warningsOccurred
  });
});

// Pharmacy Dispense API
router.post("/:id/dispense", authenticateToken, authorizeRoles(Role.ADMIN, Role.PHARMACIST), (req: any, res) => {
  const { id } = req.params;
  const db = getDB();
  const user = req.user;

  const prescriptionIdx = db.prescriptions.findIndex(p => p._id === id);
  if (prescriptionIdx === -1) {
    return res.status(404).json({ message: "Không tìm thấy đơn thuốc yêu cầu cấp phát." });
  }

  const prescription = db.prescriptions[prescriptionIdx];
  if (prescription.status !== PrescriptionStatus.PENDING) {
    return res.status(400).json({ message: `Đơn thuốc này đã được cấp phát hoặc bị hủy. Trạng thái hiện tại: ${prescription.status}` });
  }

  // Check inventory stock and subtract quantities
  const outOfStockErrors: string[] = [];
  const medicinesToUpdate: { index: number; newStock: number }[] = [];

  for (const detail of prescription.details) {
    const medIdx = db.medicines.findIndex(m => m._id === detail.medicine_id);
    if (medIdx === -1) {
      outOfStockErrors.push(`Không tìm thấy mã thuốc ${detail.medicine_id} trong hệ thống dữ liệu thuốc.`);
      continue;
    }

    const medicine = db.medicines[medIdx];
    if (medicine.stock < detail.quantity) {
      outOfStockErrors.push(`Thuốc ${medicine.name} không đủ lượng tồn kho. Yêu cầu: ${detail.quantity} ${medicine.unit}, hiện có: ${medicine.stock} ${medicine.unit}.`);
    } else {
      medicinesToUpdate.push({
        index: medIdx,
        newStock: medicine.stock - detail.quantity
      });
    }
  }

  if (outOfStockErrors.length > 0) {
    return res.status(400).json({ 
      message: "Không thể cấp phát đơn thuốc do kho dược phẩm không đảm bảo.",
      errors: outOfStockErrors
    });
  }

  // Deduct inventory stock
  for (const update of medicinesToUpdate) {
    db.medicines[update.index].stock = update.newStock;
  }

  // Update prescription status to DISPENSED
  db.prescriptions[prescriptionIdx].status = PrescriptionStatus.DISPENSED;
  saveDB(db);

  const patientObj = db.patients.find(p => p._id === prescription.patient_id);
  const patientName = patientObj ? patientObj.fullName : "Chưa rõ";

  logAudit(user._id, user.username, user.role, "DISPENSE_MEDICINE", "Prescription", id, 
    `Dược sĩ ${user.name} phê duyệt cấp phát đơn thuốc ${prescription.code} cho bệnh nhân: ${patientName}. Đã tự động khấu trừ số lượng từ kho dược.`
  );

  res.json({
    message: "Cấp phát thuốc thành công! Số lượng thuốc trong kho đã tự động khấu trừ.",
    prescription: db.prescriptions[prescriptionIdx]
  });
});

export default router;