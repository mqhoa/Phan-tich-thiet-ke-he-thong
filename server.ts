import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { Role, AppointmentStatus, PrescriptionStatus, User, Patient, Appointment, MedicalRecord, PrescriptionDetail, Prescription, Medicine, DrugInteraction, Audit } from "./src/types";

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to file persistence
const DB_FILE_PATH = path.join(process.cwd(), "e_health_db.json");

// Define Initial Seed Data
const DEFAULT_MEDICINES: Medicine[] = [
  { _id: "med_1", code: "PARA500", name: "Paracetamol 500mg", stock: 120, unit: "viên", price: 1500, expiryDate: "2027-12-31" },
  { _id: "med_2", code: "ASPI81", name: "Aspirin 81mg", stock: 80, unit: "viên", price: 2000, expiryDate: "2027-10-15" },
  { _id: "med_3", code: "IBU400", name: "Ibuprofen 400mg", stock: 150, unit: "viên", price: 3000, expiryDate: "2027-08-20" },
  { _id: "med_4", code: "AMOX500", name: "Amoxicillin 500mg", stock: 200, unit: "viên", price: 4500, expiryDate: "2027-06-11" },
  { _id: "med_5", code: "DECOL", name: "Decolgen Forte", stock: 90, unit: "viên", price: 2500, expiryDate: "2026-11-30" },
  { _id: "med_6", code: "VITC", name: "Vitamin C 500mg", stock: 350, unit: "viên", price: 800, expiryDate: "2028-01-01" },
];

const DEFAULT_DRUG_INTERACTIONS: DrugInteraction[] = [
  { _id: "int_1", code: "INT_PARA_ASPI", medicineA: "Paracetamol 500mg", medicineB: "Aspirin 81mg", warning: "Không nên dùng chung hai loại thuốc giảm đau hạ sốt đồng thời, có thể gây quá liều hoặc tăng áp lực thải độc lên gan." },
  { _id: "int_2", code: "INT_IBU_ASPI", medicineA: "Ibuprofen 400mg", medicineB: "Aspirin 81mg", warning: "Tương tác nghiêm trọng: Ibuprofen ngăn chặn tác động kháng tiểu cầu của Aspirin liều thấp, dồng thời tăng nguy cơ loét dạ dày hoặc xuất huyết đường tiêu hóa." },
];

const DEFAULT_USERS: User[] = [
  { _id: "u_admin", username: "admin", password: "123", name: "Người Quản Trị Hệ Thống", role: Role.ADMIN, email: "admin@ehealth.org", phone: "0911234567" },
  { _id: "u_doctor1", username: "doctor1", password: "123", name: "BS. Nguyễn Văn An", role: Role.DOCTOR, email: "an.nguyen@ehealth.org", phone: "0922334455", doctorId: "doc_1" },
  { _id: "u_doctor2", username: "doctor2", password: "123", name: "BS. Lê Thị Bình", role: Role.DOCTOR, email: "binh.le@ehealth.org", phone: "0933445566", doctorId: "doc_2" },
  { _id: "u_pharmacist", username: "pharmacist", password: "123", name: "DS. Trần Minh Tâm", role: Role.PHARMACIST, email: "tam.tran@ehealth.org", phone: "0944556677" },
  { _id: "u_patient1", username: "patient1", password: "123", name: "Trần Văn Cường", role: Role.PATIENT, email: "cuong.tran@gmail.com", phone: "0987654321", patientId: "pat_1" },
  { _id: "u_patient2", username: "patient2", password: "123", name: "Nguyễn Thị Mai", role: Role.PATIENT, email: "mai.nguyen@gmail.com", phone: "0977123456", patientId: "pat_2" },
];

const DEFAULT_PATIENTS: Patient[] = [
  { _id: "pat_1", fullName: "Trần Văn Cường", gender: "Nam", dob: "1990-05-14", address: "123 Đường Lê Lợi, Quận 1, TP. HCM", phone: "0987654321", insuranceNumber: "GD-4-79-11-222-0001", email: "cuong.tran@gmail.com" },
  { _id: "pat_2", fullName: "Nguyễn Thị Mai", gender: "Nữ", dob: "1995-12-25", address: "456 Đường Nguyễn Huệ, Quận 3, TP. HCM", phone: "0977123456", insuranceNumber: "GD-4-79-11-222-0002", email: "mai.nguyen@gmail.com" },
];

const DEFAULT_APPOINTMENTS: Appointment[] = [
  { _id: "app_1", code: "LH-0001", patient_id: "pat_1", doctor_id: "doc_1", appointmentDate: "2026-06-18T09:00:00.000Z", status: AppointmentStatus.CONFIRMED, reason: "Đau đầu kéo dài kèm theo sốt nhẹ" },
  { _id: "app_2", code: "LH-0002", patient_id: "pat_2", doctor_id: "doc_2", appointmentDate: "2026-06-18T14:30:00.000Z", status: AppointmentStatus.PENDING, reason: "Tái khám tim mạch cổ chai thở mệt" },
  { _id: "app_3", code: "LH-0003", patient_id: "pat_1", doctor_id: "doc_1", appointmentDate: "2026-06-15T08:30:00.000Z", status: AppointmentStatus.COMPLETED, reason: "Khám định kỳ tổng quát" },
];

const DEFAULT_MEDICAL_RECORDS: MedicalRecord[] = [
  { _id: "rec_1", code: "BA-0001", patient_id: "pat_1", doctor_id: "doc_1", appointment_id: "app_3", symptoms: "Mót ho nhẹ, hắt hơi diện rộng, hơi nhức đầu nhẹ", diagnosis: "Viêm họng cấp tính do thời tiết đột ngột thay đổi", notes: "Uống nhiều nước ấm, xúc miệng nước muối pha loãng sáu lần một ngày, nghỉ ngơi hợp lý.", visitDate: "2026-06-15T09:12:00.000Z" }
];

const DEFAULT_PRESCRIPTIONS: Prescription[] = [
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

const DEFAULT_AUDITS: Audit[] = [
  { _id: "aud_1", user_id: "u_admin", username: "admin", role: "ADMIN", action: "SEED_DATABASE", entity_type: "System", entity_id: "global", details: "Khởi tạo dữ liệu cơ bản cho hệ thống E-Health (Bác sĩ, bệnh nhân, thuốc mẫu).", timestamp: "2026-06-18T00:00:00.000Z" }
];

interface EHealthDB {
  users: User[];
  patients: Patient[];
  appointments: Appointment[];
  medical_records: MedicalRecord[];
  prescriptions: Prescription[];
  medicines: Medicine[];
  drug_interactions: DrugInteraction[];
  audits: Audit[];
}

// Read database from file, or initialize with seed data if absent
function getDB(): EHealthDB {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const fileContent = fs.readFileSync(DB_FILE_PATH, "utf-8");
      return JSON.parse(fileContent);
    }
  } catch (error) {
    console.error("Error reading database file, resetting to defaults:", error);
  }

  // If not existing or error occurred, create the default db setup
  const initDB: EHealthDB = {
    users: DEFAULT_USERS,
    patients: DEFAULT_PATIENTS,
    appointments: DEFAULT_APPOINTMENTS,
    medical_records: DEFAULT_MEDICAL_RECORDS,
    prescriptions: DEFAULT_PRESCRIPTIONS,
    medicines: DEFAULT_MEDICINES,
    drug_interactions: DEFAULT_DRUG_INTERACTIONS,
    audits: DEFAULT_AUDITS,
  };
  saveDB(initDB);
  return initDB;
}

function saveDB(db: EHealthDB) {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing to database file:", error);
  }
}

// Log audit helper
function logAudit(userId: string, username: string, role: string, action: string, entityType: string, entityId: string, details: string) {
  const db = getDB();
  const newAudit: Audit = {
    _id: "aud_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    user_id: userId,
    username,
    role,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details,
    timestamp: new Date().toISOString(),
  };
  db.audits.unshift(newAudit); // Newest first
  saveDB(db);
}

// Authenticate Authorization header helper
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Vui lòng đăng nhập để thực hiện tác vụ này." });
  }

  const token = authHeader.split(" ")[1];
  if (!token.startsWith("jwt-mock-")) {
    return res.status(403).json({ message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn." });
  }

  const parts = token.slice("jwt-mock-".length).split("-");
  const userId = parts[0];
  const role = parts[1] as Role;

  const db = getDB();
  const user = db.users.find(u => u._id === userId);
  if (!user) {
    return res.status(404).json({ message: "Không tìm thấy người dùng." });
  }

  req.user = user;
  next();
}

// Role authorization middleware creator
function authorizeRoles(...allowedRoles: Role[]) {
  return (req: any, res: any, next: any) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Bạn không có quyền thực hiện chức năng này." });
    }
    next();
  };
}

// API Endpoints Definition

// Authenticate / Auth
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Vui lòng nhập tài khoản và mật khẩu." });
  }

  const db = getDB();
  const user = db.users.find(u => u.username === username);

  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Tài khoản hoặc mật khẩu không chính xác." });
  }

  // Create a simulated JWT structured as jwt-mock-[user_id]-[role]
  const token = `jwt-mock-${user._id}-${user.role}-${Date.now()}`;
  
  // Exclude password from returned user object
  const { password: _, ...userSafe } = user;

  logAudit(user._id, user.username, user.role, "LOGIN", "User", user._id, `Người dùng ${user.name} đăng nhập thành công.`);

  res.json({
    token,
    user: userSafe
  });
});

app.post("/api/auth/register", (req, res) => {
  const { username, password, name, email, phone, gender, dob, address, insuranceNumber } = req.body;

  if (!username || !password || !name) {
    return res.status(400).json({ message: "Vui lòng nhập tài khoản, mật khẩu và họ tên." });
  }

  const db = getDB();
  const userExists = db.users.some(u => u.username === username);
  if (userExists) {
    return res.status(400).json({ message: "Tên tài khoản này đã tồn tại." });
  }

  const userId = "u_" + Date.now();
  const patientId = "pat_" + Date.now();

  // Create Patient record linked to this PATIENT account
  const newPatient: Patient = {
    _id: patientId,
    fullName: name,
    gender: gender || "Chưa xác định",
    dob: dob || new Date().toISOString().split("T")[0],
    address: address || "",
    phone: phone || "",
    insuranceNumber: insuranceNumber || "",
    email: email || ""
  };

  const newUser: User = {
    _id: userId,
    username,
    password,
    name,
    role: Role.PATIENT,
    email: email || "",
    phone: phone || "",
    patientId: patientId
  };

  db.patients.push(newPatient);
  db.users.push(newUser);
  saveDB(db);

  logAudit(userId, username, Role.PATIENT, "REGISTER", "User", userId, `Đăng ký tài khoản bệnh nhân và hồ sơ y tế: ${name}`);

  const token = `jwt-mock-${newUser._id}-${newUser.role}-${Date.now()}`;
  const { password: _, ...userSafe } = newUser;

  res.status(201).json({
    token,
    user: userSafe
  });
});

app.get("/api/auth/me", authenticateToken, (req: any, res) => {
  const { password, ...userSafe } = req.user;
  res.json(userSafe);
});

// Patients API
app.get("/api/patients", authenticateToken, (req: any, res) => {
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

app.get("/api/patients/:id", authenticateToken, (req: any, res) => {
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

app.post("/api/patients", authenticateToken, authorizeRoles(Role.ADMIN, Role.DOCTOR), (req: any, res) => {
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

app.put("/api/patients/:id", authenticateToken, authorizeRoles(Role.ADMIN, Role.DOCTOR), (req: any, res) => {
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

// Appointments API
app.get("/api/appointments", authenticateToken, (req: any, res) => {
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

app.post("/api/appointments", authenticateToken, authorizeRoles(Role.ADMIN, Role.PATIENT), (req: any, res) => {
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

app.put("/api/appointments/:id", authenticateToken, (req: any, res) => {
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

// Medical Records API
app.get("/api/records", authenticateToken, (req: any, res) => {
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

app.get("/api/records/:id", authenticateToken, (req: any, res) => {
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

app.post("/api/records", authenticateToken, authorizeRoles(Role.ADMIN, Role.DOCTOR), (req: any, res) => {
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

// Prescriptions API
app.get("/api/prescriptions", authenticateToken, (req: any, res) => {
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

app.get("/api/prescriptions/:id", authenticateToken, (req: any, res) => {
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

app.post("/api/prescriptions", authenticateToken, authorizeRoles(Role.ADMIN, Role.DOCTOR), (req: any, res) => {
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
app.post("/api/prescriptions/:id/dispense", authenticateToken, authorizeRoles(Role.ADMIN, Role.PHARMACIST), (req: any, res) => {
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

// Medicines API
app.get("/api/medicines", authenticateToken, (req, res) => {
  const db = getDB();
  res.json(db.medicines);
});

app.post("/api/medicines", authenticateToken, authorizeRoles(Role.ADMIN, Role.PHARMACIST), (req: any, res) => {
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

app.put("/api/medicines/:id", authenticateToken, authorizeRoles(Role.ADMIN, Role.PHARMACIST), (req: any, res) => {
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

// Drug Interactions Endpoint
app.get("/api/interactions", authenticateToken, (req, res) => {
  const db = getDB();
  res.json(db.drug_interactions);
});

app.post("/api/interactions", authenticateToken, authorizeRoles(Role.ADMIN), (req: any, res) => {
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

// Audits Logs API
app.get("/api/audits", authenticateToken, authorizeRoles(Role.ADMIN), (req, res) => {
  const db = getDB();
  res.json(db.audits);
});

// Vite server setup & handling fallback for modern React SPA
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running beautifully on http://0.0.0.0:${PORT}`);
  });
}

startServer();
