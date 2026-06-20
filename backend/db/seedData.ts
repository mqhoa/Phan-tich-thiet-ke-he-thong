import {
  User,
  Patient,
  Appointment,
  MedicalRecord,
  Prescription,
  Medicine,
  DrugInteraction,
  Audit,
  Role,
  AppointmentStatus,
  PrescriptionStatus
} from "../types/index";

// Define Initial Seed Data
export const DEFAULT_MEDICINES: Medicine[] = [
  { _id: "med_1", code: "PARA500", name: "Paracetamol 500mg", stock: 120, unit: "viên", price: 1500, expiryDate: "2027-12-31" },
  { _id: "med_2", code: "ASPI81", name: "Aspirin 81mg", stock: 80, unit: "viên", price: 2000, expiryDate: "2027-10-15" },
  { _id: "med_3", code: "IBU400", name: "Ibuprofen 400mg", stock: 150, unit: "viên", price: 3000, expiryDate: "2027-08-20" },
  { _id: "med_4", code: "AMOX500", name: "Amoxicillin 500mg", stock: 200, unit: "viên", price: 4500, expiryDate: "2027-06-11" },
  { _id: "med_5", code: "DECOL", name: "Decolgen Forte", stock: 90, unit: "viên", price: 2500, expiryDate: "2026-11-30" },
  { _id: "med_6", code: "VITC", name: "Vitamin C 500mg", stock: 350, unit: "viên", price: 800, expiryDate: "2028-01-01" },
];

export const DEFAULT_DRUG_INTERACTIONS: DrugInteraction[] = [
  { _id: "int_1", code: "INT_PARA_ASPI", medicineA: "Paracetamol 500mg", medicineB: "Aspirin 81mg", warning: "Không nên dùng chung hai loại thuốc giảm đau hạ sốt đồng thời, có thể gây quá liều hoặc tăng áp lực thải độc lên gan." },
  { _id: "int_2", code: "INT_IBU_ASPI", medicineA: "Ibuprofen 400mg", medicineB: "Aspirin 81mg", warning: "Tương tác nghiêm trọng: Ibuprofen ngăn chặn tác động kháng tiểu cầu của Aspirin liều thấp, dồng thời tăng nguy cơ loét dạ dày hoặc xuất huyết đường tiêu hóa." },
];

export const DEFAULT_USERS: User[] = [
  { _id: "u_admin", username: "admin", password: "123", name: "Người Quản Trị Hệ Thống", role: Role.ADMIN, email: "admin@ehealth.org", phone: "0911234567" },
  { _id: "u_doctor1", username: "doctor1", password: "123", name: "BS. Nguyễn Văn An", role: Role.DOCTOR, email: "an.nguyen@ehealth.org", phone: "0922334455", doctorId: "doc_1" },
  { _id: "u_doctor2", username: "doctor2", password: "123", name: "BS. Lê Thị Bình", role: Role.DOCTOR, email: "binh.le@ehealth.org", phone: "0933445566", doctorId: "doc_2" },
  { _id: "u_pharmacist", username: "pharmacist", password: "123", name: "DS. Trần Minh Tâm", role: Role.PHARMACIST, email: "tam.tran@ehealth.org", phone: "0944556677" },
  { _id: "u_patient1", username: "patient1", password: "123", name: "Trần Văn Cường", role: Role.PATIENT, email: "cuong.tran@gmail.com", phone: "0987654321", patientId: "pat_1" },
  { _id: "u_patient2", username: "patient2", password: "123", name: "Nguyễn Thị Mai", role: Role.PATIENT, email: "mai.nguyen@gmail.com", phone: "0977123456", patientId: "pat_2" },
];

export const DEFAULT_PATIENTS: Patient[] = [
  { _id: "pat_1", fullName: "Trần Văn Cường", gender: "Nam", dob: "1990-05-14", address: "123 Đường Lê Lợi, Quận 1, TP. HCM", phone: "0987654321", insuranceNumber: "GD-4-79-11-222-0001", email: "cuong.tran@gmail.com" },
  { _id: "pat_2", fullName: "Nguyễn Thị Mai", gender: "Nữ", dob: "1995-12-25", address: "456 Đường Nguyễn Huệ, Quận 3, TP. HCM", phone: "0977123456", insuranceNumber: "GD-4-79-11-222-0002", email: "mai.nguyen@gmail.com" },
];

export const DEFAULT_APPOINTMENTS: Appointment[] = [
  { _id: "app_1", code: "LH-0001", patient_id: "pat_1", doctor_id: "doc_1", appointmentDate: "2026-06-18T09:00:00.000Z", status: AppointmentStatus.CONFIRMED, reason: "Đau đầu kéo dài kèm theo sốt nhẹ" },
  { _id: "app_2", code: "LH-0002", patient_id: "pat_2", doctor_id: "doc_2", appointmentDate: "2026-06-18T14:30:00.000Z", status: AppointmentStatus.PENDING, reason: "Tái khám tim mạch cổ chai thở mệt" },
  { _id: "app_3", code: "LH-0003", patient_id: "pat_1", doctor_id: "doc_1", appointmentDate: "2026-06-15T08:30:00.000Z", status: AppointmentStatus.COMPLETED, reason: "Khám định kỳ tổng quát" },
];

export const DEFAULT_MEDICAL_RECORDS: MedicalRecord[] = [
  { _id: "rec_1", code: "BA-0001", patient_id: "pat_1", doctor_id: "doc_1", appointment_id: "app_3", symptoms: "Mót ho nhẹ, hắt hơi diện rộng, hơi nhức đầu nhẹ", diagnosis: "Viêm họng cấp tính do thời tiết đột ngột thay đổi", notes: "Uống nhiều nước ấm, xúc miệng nước muối pha loãng sáu lần một ngày, nghỉ ngơi hợp lý.", visitDate: "2026-06-15T09:12:00.000Z" }
];

export const DEFAULT_PRESCRIPTIONS: Prescription[] = [
  {
    _id: "pres_1",
    code: "DT-0001",
    patient_id: "pat_1",
    doctor_id: "doc_1",
    medicalRecord_id: "rec_1",
    createdAt: "2026-06-15T09:15:00.000Z",
    status: PrescriptionStatus.DISPENSED,
    details: [
      { _id: "dtl_1", code: "PD-001", prescription_id: "pres_1", medicine_id: "med_1", quantity: 10, dosage: "2 viên/ngày", instruction: "Dùng sau ăn sáng và tối" },
      { _id: "dtl_2", code: "PD-002", prescription_id: "pres_1", medicine_id: "med_6", quantity: 5, dosage: "1 viên/ngày", instruction: "Dùng sau ăn sáng" }
    ]
  }
];

export const DEFAULT_AUDITS: Audit[] = [
  { _id: "aud_1", user_id: "u_admin", username: "admin", role: "ADMIN", action: "SEED_DATABASE", entity_type: "System", entity_id: "global", details: "Khởi tạo dữ liệu cơ bản cho hệ thống E-Health (Bác sĩ, bệnh nhân, thuốc mẫu).", timestamp: "2026-06-18T00:00:00.000Z" }
];

export interface EHealthDB {
  users: User[];
  patients: Patient[];
  appointments: Appointment[];
  medical_records: MedicalRecord[];
  prescriptions: Prescription[];
  medicines: Medicine[];
  drug_interactions: DrugInteraction[];
  audits: Audit[];
}
