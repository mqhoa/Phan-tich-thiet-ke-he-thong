import React, { useState, useEffect } from "react";
import { api, getAuthToken, setAuthToken, removeAuthToken } from "./services/api";
import { 
  Activity, 
  Users, 
  Calendar, 
  FileText, 
  Plus, 
  Search, 
  X, 
  AlertTriangle, 
  RefreshCw, 
  Clipboard, 
  UserCheck, 
  ShieldAlert, 
  LogOut, 
  Pill, 
  HeartPulse 
} from "lucide-react";

// Import types & services
import { 
  Role, 
  AppointmentStatus, 
  type User, 
  type Patient, 
  type Appointment, 
  type MedicalRecord, 
  type Prescription, 
  type Medicine, 
  type DrugInteraction, 
  type Audit 
} from "./types/index";

// Import sub-components
import DashboardView from "./components/DashboardView";
import PatientsView from "./components/PatientsView";
import AppointmentsView from "./components/AppointmentsView";
import MedicalRecordsView from "./components/MedicalRecordsView";
import PrescriptionsView from "./components/PrescriptionsView";
import MedicinesView from "./components/MedicinesView";
import AuditsView from "./components/AuditsView";

// Import modals
import PatientModal from "./components/modals/PatientModal";
import AppointmentModal from "./components/modals/AppointmentModal";
import MedicalRecordModal from "./components/modals/MedicalRecordModal";
import PrescriptionModal from "./components/modals/PrescriptionModal";
import MedicineModal from "./components/modals/MedicineModal";

export default function App() {
  // Global Auth states
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [loading, setLoading] = useState<boolean>(false);

  // Forms states
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    phone: "",
    gender: "Nam",
    dob: "",
    address: "",
    insuranceNumber: "",
  });
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Core system data states
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState("");

  // Modal control & dynamic form state recorders
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [patientForm, setPatientForm] = useState({
    fullName: "",
    gender: "Nam",
    dob: "",
    address: "",
    phone: "",
    insuranceNumber: "",
    email: ""
  });

  // Appointment Modal Form states
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({
    patient_id: "",
    doctor_id: "",
    appointmentDate: "",
    reason: ""
  });

  // Medical Record Form states
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [activeAppointmentForRecord, setActiveAppointmentForRecord] = useState<Appointment | null>(null);
  const [recordForm, setRecordForm] = useState({
    symptoms: "",
    diagnosis: "",
    notes: ""
  });

  // Prescription Form states
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [activeRecordForPrescription, setActiveRecordForPrescription] = useState<MedicalRecord | null>(null);
  const [prescribedDrugs, setPrescribedDrugs] = useState<{ medicine_id: string; quantity: number; dosage: string; instruction: string }[]>([]);
  const [interactionWarnings, setInteractionWarnings] = useState<string[]>([]);

  // Medicine Form states
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [medicineForm, setMedicineForm] = useState({
    code: "",
    name: "",
    stock: 0,
    unit: "viên",
    price: 0,
    expiryDate: ""
  });

  // Hardcoded simulated list of active doctors or retrieved from list
  const DOCTORS_LIST = [
    { id: "doc_1", name: "BS. Nguyễn Văn An (Khoa Nội)" },
    { id: "doc_2", name: "BS. Lê Thị Bình (Khoa Nhi)" }
  ];

  // Fetch standard data on login
  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      // Fetch currently authenticated user details
      const userDetails = await api.get("/auth/me");
      setCurrentUser(userDetails);

      // Fetch related collections based on permissions
      const fetchedPatients = await api.get("/patients").catch(() => []);
      setPatients(fetchedPatients);

      const fetchedAppts = await api.get("/appointments").catch(() => []);
      setAppointments(fetchedAppts);

      const fetchedRecords = await api.get("/records").catch(() => []);
      setMedicalRecords(fetchedRecords);

      const fetchedPrescriptions = await api.get("/prescriptions").catch(() => []);
      setPrescriptions(fetchedPrescriptions);

      const fetchedMedicines = await api.get("/medicines").catch(() => []);
      setMedicines(fetchedMedicines);

      const fetchedInteractions = await api.get("/interactions").catch(() => []);
      setInteractions(fetchedInteractions);

      if (userDetails.role === Role.ADMIN) {
        const fetchedAudits = await api.get("/audits").catch(() => []);
        setAudits(fetchedAudits);
      }
    // SỬA LỖI 1: Thay catch (err: any) thành catch (error) và ép kiểu
    } catch (error) {
      const err = error as Error; 
      setErrorMessage(err.message || "Không thể đồng bộ dữ liệu khám bệnh.");
      if (err.message?.includes("Vui lòng đăng nhập")) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchData();
    }
  // Thêm dòng comment dưới đây để tắt cảnh báo ở chữ token
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // SỬA LỖI 2: Đổi từ const handleLogout = () => {} thành function bình thường để được hoisting (có thể gọi trước khi khai báo)
  function handleLogout() {
    removeAuthToken();
    setToken(null);
    setCurrentUser(null);
    setActiveTab("dashboard");
    setLoginUsername("");
    setLoginPassword("");
  }

  // Auth Operations
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    try {
      const data = await api.post("/auth/login", {
        username: loginUsername,
        password: loginPassword,
      });
      setAuthToken(data.token);
      setToken(data.token);
      setCurrentUser(data.user);
      setSuccessMessage(`Chào mừng quay trở lại, ${data.user.name}!`);
      setTimeout(() => setSuccessMessage(null), 3500);
    // SỬA LỖI 1 (Tiếp): Xóa chữ any
    } catch (error) {
      const err = error as Error;
      setErrorMessage(err.message || "Tên đăng nhập hoặc mật khẩu chưa chính xác.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    try {
      const data = await api.post("/auth/register", registerForm);
      setAuthToken(data.token);
      setToken(data.token);
      setCurrentUser(data.user);
      setSuccessMessage("Đăng ký thành công và hoàn tất khởi tạo hồ sơ y tế!");
      setTimeout(() => setSuccessMessage(null), 3500);
    // SỬA LỖI 1 (Tiếp): Xóa chữ any
    } catch (error) {
      const err = error as Error;
      setErrorMessage(err.message || "Đăng ký không thành công. Hãy thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Actions for Patients
  const handleSavePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingPatient) {
        await api.put(`/patients/${editingPatient._id}`, patientForm);
        setSuccessMessage("Cập nhật thông tin bệnh nhân thành công.");
      } else {
        await api.post("/patients", patientForm);
        setSuccessMessage("Thêm mới hồ sơ bệnh nhân thành công.");
      }
      setShowPatientModal(false);
      setEditingPatient(null);
      fetchData();
      setTimeout(() => setSuccessMessage(null), 3000);
    // SỬA LỖI 1 (Tiếp): Xóa chữ any
    } catch (error) {
      const err = error as Error;
      setErrorMessage(err.message || "Lỗi lưu thông tin bệnh nhân.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditPatientClick = (patient: Patient) => {
    setEditingPatient(patient);
    setPatientForm({
      fullName: patient.fullName,
      gender: patient.gender,
      dob: patient.dob,
      address: patient.address,
      phone: patient.phone,
      insuranceNumber: patient.insuranceNumber,
      email: patient.email || ""
    });
    setShowPatientModal(true);
  };

  const handleAddPatientClick = () => {
    setEditingPatient(null);
    setPatientForm({
      fullName: "",
      gender: "Nam",
      dob: "1990-01-01",
      address: "",
      phone: "",
      insuranceNumber: "",
      email: ""
    });
    setShowPatientModal(true);
  };

  const handleStartExamClick = (patient: Patient) => {
    setAppointmentForm({
      patient_id: patient._id,
      doctor_id: currentUser?.doctorId || "doc_1",
      appointmentDate: new Date().toISOString().slice(0, 16),
      reason: "Khám trực tiếp tại quầy"
    });
    setShowAppointmentModal(true);
  };

  // Actions for Appointments
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/appointments", appointmentForm);
      setShowAppointmentModal(false);
      setSuccessMessage("Đặt lịch khám thành công! Vui lòng chờ phê duyệt từ quản trị viên.");
      fetchData();
      setTimeout(() => setSuccessMessage(null), 3000);
      setAppointmentForm({
        patient_id: "",
        doctor_id: "",
        appointmentDate: "",
        reason: ""
      });
    // SỬA LỖI TẠI ĐÂY: Xóa "any" và ép kiểu sang Error
    } catch (error) {
      const err = error as Error;
      setErrorMessage(err.message || "Vui lòng kiểm tra lại thông tin lịch khám.");
    } finally {
      setLoading(false);
    }
  };

  // SỬA LỖI 1: Thay 'additionalData: any = {}' thành 'additionalData: Record<string, unknown> = {}'
  const handleUpdateAppointmentStatus = async (appointmentId: string, status: AppointmentStatus, additionalData: Record<string, unknown> = {}) => {
    setLoading(true);
    try {
      await api.put(`/appointments/${appointmentId}`, { status, ...additionalData });
      setSuccessMessage(`Đã cập nhật trạng thái lịch khám thành ${status}`);
      fetchData();
      setTimeout(() => setSuccessMessage(null), 3000);
    // SỬA LỖI 2: Xóa "any" ở block catch và ép kiểu
    } catch (error) {
      const err = error as Error;
      setErrorMessage(err.message || "Cập nhật lịch khám bất thành.");
    } finally {
      setLoading(false);
    }
  };
  // Actions for Medical Records
  const handleOpenRecordCreator = (appointment: Appointment) => {
    setActiveAppointmentForRecord(appointment);
    setRecordForm({
      symptoms: appointment.reason || "",
      diagnosis: "",
      notes: ""
    });
    setShowRecordModal(true);
  };

  const handleCreateMedicalRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAppointmentForRecord) return;
    setLoading(true);
    try {
      await api.post("/records", {
        patient_id: activeAppointmentForRecord.patient_id,
        appointment_id: activeAppointmentForRecord._id,
        symptoms: recordForm.symptoms,
        diagnosis: recordForm.diagnosis,
        notes: recordForm.notes
      });
      setShowRecordModal(false);
      setSuccessMessage("Lập hồ sơ bệnh án thành công! Bạn hiện có thể kê đơn thuốc mẫu đính kèm.");
      fetchData();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (error) {
      const err = error as Error;
      setErrorMessage(err.message || "Vui lòng nhập đầy đủ chẩn đoán bệnh lý.");
    } finally {
      setLoading(false);
    }
  };

  // Drug Interaction checker during selection
  const handleAddMedicineToPrescription = (medId: string) => {
    const med = medicines.find(m => m._id === medId);
    if (!med) return;

    // Check interaction with already chosen drugs
    const currentChoosenNames = prescribedDrugs.map(d => {
      const dbMed = medicines.find(m => m._id === d.medicine_id);
      return dbMed ? dbMed.name : "";
    }).filter(n => n !== "");

    const warnings: string[] = [];
    currentChoosenNames.forEach(v => {
      const foundInt = interactions.find(inter => 
        (inter.medicineA === med.name && inter.medicineB === v) ||
        (inter.medicineA === v && inter.medicineB === med.name)
      );
      if (foundInt) {
        warnings.push(`CẢNH BÁO TƯƠNG TÁC THUỐC: ${med.name} kết hợp với ${v} sẽ: ${foundInt.warning}`);
      }
    });

    if (warnings.length > 0) {
      setInteractionWarnings(prev => [...prev, ...warnings]);
    }

    setPrescribedDrugs(prev => [
      ...prev,
      { medicine_id: medId, quantity: 10, dosage: "2 viên/ngày", instruction: "Sau ăn" }
    ]);
  };

  const handleRemovePrescribedDrug = (idx: number) => {
    setPrescribedDrugs(prev => prev.filter((_, i) => i !== idx));
    setInteractionWarnings([]); // Clear and re-validate if necessary simpler
  };

  const handleOpenPrescriptionCreator = (record: MedicalRecord) => {
    setActiveRecordForPrescription(record);
    setPrescribedDrugs([]);
    setInteractionWarnings([]);
    setShowPrescriptionModal(true);
  };

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRecordForPrescription) return;
    if (prescribedDrugs.length === 0) {
      setErrorMessage("Vui lòng kê ít nhất 1 loại thuốc.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/prescriptions", {
        patient_id: activeRecordForPrescription.patient_id,
        medicalRecord_id: activeRecordForPrescription._id,
        medicines_list: prescribedDrugs
      });
      setShowPrescriptionModal(false);
      
      if (res.warnings && res.warnings.length > 0) {
        alert("Đơn thuốc đã được kê có cảnh báo tương tác thuốc:\n\n" + res.warnings.join("\n"));
      }

      setSuccessMessage("Đã kê đơn thuốc điện tử. Chờ dược sĩ cấp phát tại quầy.");
      fetchData();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (error) {
      const err = error as Error;
      setErrorMessage(err.message || "Lỗi khởi tạo đơn thuốc.");
    } finally {
      setLoading(false);
    }
  };

  // Actions for Pharmacist (Dispense)
  const handleDispensePrescription = async (prescriptionId: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await api.post(`/prescriptions/${prescriptionId}/dispense`, {});
      setSuccessMessage(data.message || "Cấp phát thuốc thành công!");
      fetchData();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (error) {
      const err = error as Error;
      setErrorMessage(err.message || "Cấp phát thuốc thất bại. Kho không đủ.");
    } finally {
      setLoading(false);
    }
  };

  // Actions for Medicines
  const handleSaveMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingMedicine) {
        await api.put(`/medicines/${editingMedicine._id}`, medicineForm);
        setSuccessMessage("Cập nhật kho thuốc thành công.");
      } else {
        await api.post("/medicines", medicineForm);
        setSuccessMessage("Thêm thuốc mới vào nhà thuốc thành công.");
      }
      setShowMedicineModal(false);
      setEditingMedicine(null);
      fetchData();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      const err = error as Error;
      setErrorMessage(err.message || "Lỗi lưu kho dược phẩm.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditMedicineClick = (med: Medicine) => {
    setEditingMedicine(med);
    setMedicineForm({
      code: med.code,
      name: med.name,
      stock: med.stock,
      unit: med.unit,
      price: med.price,
      expiryDate: med.expiryDate
    });
    setShowMedicineModal(true);
  };

  const handleAddMedicineClick = () => {
    setEditingMedicine(null);
    setMedicineForm({
      code: "",
      name: "",
      stock: 50,
      unit: "viên",
      price: 1500,
      expiryDate: "2027-12-31"
    });
    setShowMedicineModal(true);
  };

  // Utility helpers to match IDs with Display Names
  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p._id === patientId);
    return patient ? patient.fullName : "Bệnh nhân không rõ";
  };

  const getDoctorName = (doctorId: string) => {
    const doc = DOCTORS_LIST.find(d => d.id === doctorId);
    return doc ? doc.name : "Bác sĩ chưa phân bổ";
  };

  const getMedicineName = (medId: string) => {
    const med = medicines.find(m => m._id === medId);
    return med ? med.name : "Thuốc không rõ";
  };

  // Logic to view filtered lists based on Search input
  const filteredPatients = patients.filter(p => 
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.insuranceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm)
  );

  const filteredMedicines = medicines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="app_root" className="min-h-screen bg-[#050505] text-[#f8fafc] font-sans antialiased selection:bg-sky-500 selection:text-slate-900 relative">
      <div className="atmosphere"></div>
      
      {/* Alert Top Bar */}
      {errorMessage && (
        <div id="error_alert_top" className="bg-red-500/10 border-b border-red-500/20 backdrop-blur-md text-red-200 px-4 py-3 sticky top-0 z-50 flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-sm font-semibold">{errorMessage}</p>
          </div>
          <button id="close_error_btn" onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-200 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {successMessage && (
        <div id="success_alert_top" className="bg-sky-500/10 border-b border-sky-500/20 backdrop-blur-md text-sky-200 px-4 py-3 sticky top-0 z-50 flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-sky-400 shrink-0" />
            <p className="text-sm font-semibold">{successMessage}</p>
          </div>
          <button id="close_success_btn" onClick={() => setSuccessMessage(null)} className="text-sky-400 hover:text-sky-200 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Auth Screen Overlay */}
      {!token ? (
        <div id="auth_container" className="min-h-screen flex items-center justify-center p-4 relative z-10">
          <div id="auth_card" className="w-full max-w-lg glass-panel-glow rounded-2xl shadow-2xl overflow-hidden p-8 z-10 transition-all duration-300">
            <div className="text-center mb-8">
              <div className="inline-flex p-3.5 bg-sky-500/10 rounded-full text-sky-400 mb-3 border border-sky-500/20 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                <HeartPulse id="header_app_logo" className="w-8 h-8 animate-pulse" />
              </div>
              <h1 id="auth_app_title" className="text-2xl font-black text-white tracking-tight bg-gradient-to-r from-sky-400 via-sky-200 to-indigo-300 bg-clip-text text-transparent">HỆ THỐNG Y TẾ SỐ MEDISYS</h1>
              <p className="text-sky-400/80 text-[11px] font-semibold uppercase tracking-widest mt-1.5">Hồ sơ bệnh án &amp; Kho dược phẩm thông minh</p>
            </div>

            {/* Demo Accounts */}
            <div className="bg-white/[0.02] rounded-xl p-4 mb-6 border border-white/10">
              <span className="text-xs font-bold text-sky-400 block mb-2 tracking-wide">Tài khoản demo sẵn có (mật khẩu: 123):</span>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 font-mono">
                <div className="flex items-center gap-1.5">• Patient: <span className="text-sky-300 font-bold bg-sky-500/10 px-1.5 py-0.5 rounded">patient1</span></div>
                <div className="flex items-center gap-1.5">• Doctor: <span className="text-violet-300 font-bold bg-violet-500/10 px-1.5 py-0.5 rounded">doctor1</span></div>
                <div className="flex items-center gap-1.5">• Pharmacist: <span className="text-amber-300 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">pharmacist</span></div>
                <div className="flex items-center gap-1.5">• Admin: <span className="text-rose-300 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded">admin</span></div>
              </div>
            </div>

            <div className="flex gap-4 mb-6 border-b border-white/10 pb-2">
              <button
                id="tab_login_select"
                onClick={() => { setAuthMode("login"); setErrorMessage(null); }}
                className={`flex-1 pb-2.5 text-sm font-bold transition-all relative ${authMode === "login" ? "text-sky-400 border-b-2 border-sky-400 text-shadow-glow" : "text-slate-500 hover:text-slate-300"}`}
              >
                Đăng nhập
              </button>
              <button
                id="tab_register_select"
                onClick={() => { setAuthMode("register"); setErrorMessage(null); }}
                className={`flex-1 pb-2.5 text-sm font-bold transition-all relative ${authMode === "register" ? "text-sky-400 border-b-2 border-sky-400 text-shadow-glow" : "text-slate-500 hover:text-slate-300"}`}
              >
                Đăng ký Bệnh nhân
              </button>
            </div>

            {authMode === "login" ? (
              <form id="login_form" onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1.5 tracking-wider">Tên tài khoản</label>
                  <input
                    id="login_username_input"
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    required
                    placeholder="Nhập tên đăng nhập"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 px-3.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1.5 tracking-wider">Mật khẩu bảo mật</label>
                  <input
                    id="login_password_input"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 px-3.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 transition-all"
                  />
                </div>

                <button
                  id="login_submit_btn"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold py-3 rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(56,189,248,0.15)] hover:shadow-[0_0_25px_rgba(56,189,248,0.3)] disabled:opacity-50 mt-4 active:scale-[0.99]"
                >
                  {loading ? "Đang kết nối đến hệ thống..." : "Xác thực đăng nhập"}
                </button>
              </form>
            ) : (
              <form id="register_form" onSubmit={handleRegister} className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1 tracking-wider">Tài khoản</label>
                    <input
                      id="reg_username"
                      type="text"
                      required
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                      placeholder="Username"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1 tracking-wider">Mật khẩu</label>
                    <input
                      id="reg_password"
                      type="password"
                      required
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1 tracking-wider">Họ và tên bệnh nhân</label>
                  <input
                    id="reg_fullName"
                    type="text"
                    required
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    placeholder="Vd: Nguyễn Văn A"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1 tracking-wider">Giới tính</label>
                    <select
                      id="reg_gender"
                      value={registerForm.gender}
                      onChange={(e) => setRegisterForm({ ...registerForm, gender: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 transition-all"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1 tracking-wider">Ngày sinh</label>
                    <input
                      id="reg_dob"
                      type="date"
                      required
                      value={registerForm.dob}
                      onChange={(e) => setRegisterForm({ ...registerForm, dob: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1 tracking-wider">Số điện thoại</label>
                    <input
                      id="reg_phone"
                      type="tel"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                      placeholder="0912..."
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1 tracking-wider">Mã thẻ BHYT</label>
                    <input
                      id="reg_insurance"
                      type="text"
                      value={registerForm.insuranceNumber}
                      onChange={(e) => setRegisterForm({ ...registerForm, insuranceNumber: e.target.value })}
                      placeholder="GD-4-79-..."
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1 tracking-wider">Địa chỉ thường trú</label>
                  <input
                    id="reg_address"
                    type="text"
                    value={registerForm.address}
                    onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                    placeholder="Số nhà, Tên đường, Tỉnh/TP"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1 tracking-wider">Hòm thư (Email)</label>
                  <input
                    id="reg_email"
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    placeholder="email@vidu.com"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 transition-all"
                  />
                </div>

                <button
                  id="register_submit_btn"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3 rounded-xl text-xs transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)] disabled:opacity-50 mt-4 active:scale-[0.99]"
                >
                  {loading ? "Đang tiến hành tạo tài khoản..." : "Xác nhận Đăng ký & Tạo hồ sơ y tế"}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        /* Bento Grid Main Layout Container */
        <div id="main_layout_container" className="flex flex-col min-h-screen relative z-10">
          
          {/* Top Bar */}
          <header id="top_app_navbar" className="glass-panel px-6 py-4 flex items-center justify-between rounded-2xl border border-white/10 mt-4 mx-4 shadow-2xl relative z-20 shrink-0">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-sky-500/10 rounded-xl text-sky-400 font-extrabold sm:block hidden border border-sky-500/20 shadow-[0_0_15px_rgba(56,189,248,0.15)]">
                <HeartPulse id="medisys_logo_navbar" className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <h2 className="text-base font-black tracking-wider text-white m-0 uppercase bg-gradient-to-r from-white via-sky-100 to-indigo-100 bg-clip-text text-transparent">MEDISYS E-HEALTH PORTAL</h2>
                <p className="text-[10px] text-sky-400/80 font-bold m-0 tracking-widest uppercase">TRÌNH ĐIỀU HÀNH BỆNH ÁN &amp; NHÀ THUỐC BỆNH VIỆN</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right sm:block hidden">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Người dùng đang đăng nhập</div>
                <div id="user_display_badge" className="text-xs font-extrabold text-sky-300 flex items-center justify-end gap-1.5 mt-0.5">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8] animate-pulse"></span>
                  {currentUser?.name}
                </div>
              </div>

              <div className="px-3 py-1.5 bg-white/[0.04] border border-white/10 rounded-lg text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                VAI TRÒ: {currentUser?.role}
              </div>

              <button
                id="btn_logout"
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-400 bg-white/[0.02] border border-white/5 hover:border-red-500/20 hover:bg-red-500/10 rounded-lg transition-all"
                title="Đăng xuất khỏi hệ thống"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </header>

          <div id="grid_layout_wrapper" className="flex-1 flex max-w-[1600px] w-full mx-auto p-4 gap-4 overflow-hidden relative z-15">
            
            {/* Sidebar Navigation */}
            <aside id="main_sidebar_menu" className="w-64 glass-panel text-slate-200 rounded-2xl flex flex-col p-4 shadow-2xl shrink-0 border-white/10">
              <div className="text-center pb-5 border-b border-white/10 mb-5">
                <div className="font-black text-xl text-sky-400 tracking-widest uppercase">MEDISYS</div>
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">HỆ THỐNG Y TẾ DI ĐỘNG</div>
              </div>

              <nav className="space-y-1.5 flex-1 select-none">
                <button
                  id="tab_nav_dashboard"
                  onClick={() => { setActiveTab("dashboard"); setSearchTerm(""); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all border ${activeTab === "dashboard" ? "bg-sky-400/10 text-sky-400 border-sky-400/20 shadow-[0_0_15px_rgba(56,189,248,0.1)]" : "border-transparent text-slate-400 hover:text-white hover:bg-white/[0.04]"}`}
                >
                  <Activity className="w-4 h-4" />
                  <span>Tổng quan hệ thống</span>
                </button>

                <button
                  id="tab_nav_patients"
                  onClick={() => { setActiveTab("patients"); setSearchTerm(""); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all border ${activeTab === "patients" ? "bg-sky-400/10 text-sky-400 border-sky-400/20 shadow-[0_0_15px_rgba(56,189,248,0.1)]" : "border-transparent text-slate-400 hover:text-white hover:bg-white/[0.04]"}`}
                >
                  <Users className="w-4 h-4" />
                  <span>Quản lý Bệnh nhân</span>
                </button>

                <button
                  id="tab_nav_appointments"
                  onClick={() => { setActiveTab("appointments"); setSearchTerm(""); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all border ${activeTab === "appointments" ? "bg-sky-400/10 text-sky-400 border-sky-400/20 shadow-[0_0_15px_rgba(56,189,248,0.1)]" : "border-transparent text-slate-400 hover:text-white hover:bg-white/[0.04]"}`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Quản lý Lịch khám</span>
                </button>

                <button
                  id="tab_nav_records"
                  onClick={() => { setActiveTab("records"); setSearchTerm(""); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all border ${activeTab === "records" ? "bg-sky-400/10 text-sky-400 border-sky-400/20 shadow-[0_0_15px_rgba(56,189,248,0.1)]" : "border-transparent text-slate-400 hover:text-white hover:bg-white/[0.04]"}`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Hồ sơ Bệnh án</span>
                </button>

                <button
                  id="tab_nav_prescriptions"
                  onClick={() => { setActiveTab("prescriptions"); setSearchTerm(""); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all border ${activeTab === "prescriptions" ? "bg-sky-400/10 text-sky-400 border-sky-400/20 shadow-[0_0_15px_rgba(56,189,248,0.1)]" : "border-transparent text-slate-400 hover:text-white hover:bg-white/[0.04]"}`}
                >
                  <Clipboard className="w-4 h-4" />
                  <span>Đơn thuốc điện tử</span>
                </button>

                <button
                  id="tab_nav_medicines"
                  onClick={() => { setActiveTab("medicines"); setSearchTerm(""); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all border ${activeTab === "medicines" ? "bg-sky-400/10 text-sky-400 border-sky-400/20 shadow-[0_0_15px_rgba(56,189,248,0.1)]" : "border-transparent text-slate-400 hover:text-white hover:bg-white/[0.04]"}`}
                >
                  <Pill className="w-4 h-4" />
                  <span>Quản lý Kho thuốc</span>
                </button>

                {currentUser?.role === Role.ADMIN && (
                  <button
                    id="tab_nav_audits"
                    onClick={() => { setActiveTab("audits"); setSearchTerm(""); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all border ${activeTab === "audits" ? "bg-sky-400/10 text-sky-400 border-sky-400/20 shadow-[0_0_15px_rgba(56,189,248,0.1)]" : "border-transparent text-slate-400 hover:text-white hover:bg-white/[0.04]"}`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Nhật ký Kiểm toán (Audits)</span>
                  </button>
                )}
              </nav>

              <div id="sidebar_logged_profile" className="mt-auto bg-slate-950/50 p-4 rounded-xl border border-white/5 text-xs">
                <div className="text-slate-400 font-bold mb-1">Phiên làm việc:</div>
                <div className="font-extrabold text-white text-sm truncate">{currentUser?.name}</div>
                <div className="text-sky-300 font-mono tracking-wider mt-1 block">Tài khoản: @{currentUser?.username}</div>
              </div>
            </aside>

            {/* Main Dynamic Workspace Area */}
            <main id="main_workspace_pane" className="flex-1 flex flex-col overflow-y-auto max-h-[calc(100vh-130px)] space-y-4">
              
              {/* Dynamic Search Box for list tables */}
              {activeTab !== "dashboard" && activeTab !== "audits" && (
                <div id="search_banner_box" className="glass-panel p-4 rounded-2xl border border-white/10 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Search className="w-4 h-4" />
                    </span>
                    <input
                      id="table_search_input"
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Tìm kiếm nhanh bằng từ khóa hoặc mã số..."
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-sky-400 focus:bg-white/[0.06] text-white placeholder-slate-500 transition-all"
                    />
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {activeTab === "patients" && (currentUser?.role === Role.ADMIN || currentUser?.role === Role.DOCTOR) && (
                      <button
                        id="btn_add_patient_action"
                        onClick={handleAddPatientClick}
                        className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(56,189,248,0.2)] active:scale-[0.98]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm Bệnh nhân</span>
                      </button>
                    )}

                    {activeTab === "appointments" && (currentUser?.role === Role.ADMIN || currentUser?.role === Role.PATIENT) && (
                      <button
                        id="btn_add_appointment_action"
                        onClick={() => {
                          setAppointmentForm({
                            patient_id: currentUser?.role === Role.PATIENT ? currentUser.patientId || "" : "",
                            doctor_id: "doc_1",
                            appointmentDate: new Date().toISOString().slice(0, 16),
                            reason: ""
                          });
                          setShowAppointmentModal(true);
                        }}
                        className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(56,189,248,0.2)] active:scale-[0.98]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Đặt Lịch khám</span>
                      </button>
                    )}

                    {activeTab === "medicines" && (currentUser?.role === Role.ADMIN || currentUser?.role === Role.PHARMACIST) && (
                      <button
                        id="btn_add_medicine_action"
                        onClick={handleAddMedicineClick}
                        className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(56,189,248,0.2)] active:scale-[0.98]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Nhập thuốc mới</span>
                      </button>
                    )}

                    <button
                      id="btn_refresh_action"
                      onClick={fetchData}
                      className="p-2.5 bg-white/[0.02] border border-white/10 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.04] transition-all"
                      title="Làm mới dữ liệu từ máy chủ"
                    >
                      <RefreshCw className="w-4 h-4 animate-spin-hover" />
                    </button>
                  </div>
                </div>
              )}
              {/* Dynamic Views Navigation */}
              {activeTab === "dashboard" && (
                <DashboardView 
                  patientsCount={patients.length}
                  appointments={appointments}
                  medicalRecords={medicalRecords}
                  prescriptions={prescriptions}
                  medicines={medicines}
                  getPatientName={getPatientName}
                  getDoctorName={getDoctorName}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === "patients" && (
                <PatientsView 
                  filteredPatients={filteredPatients}
                  currentUser={currentUser}
                  onEditPatientClick={handleEditPatientClick}
                  onStartExamClick={handleStartExamClick}
                />
              )}

              {activeTab === "appointments" && (
                <AppointmentsView 
                  appointments={appointments}
                  currentUser={currentUser}
                  getPatientName={getPatientName}
                  getDoctorName={getDoctorName}
                  onUpdateStatus={handleUpdateAppointmentStatus}
                  onOpenRecordCreator={handleOpenRecordCreator}
                />
              )}

              {activeTab === "records" && (
                <MedicalRecordsView 
                  medicalRecords={medicalRecords}
                  currentUser={currentUser}
                  getPatientName={getPatientName}
                  getDoctorName={getDoctorName}
                  onOpenPrescriptionCreator={handleOpenPrescriptionCreator}
                />
              )}

              {activeTab === "prescriptions" && (
                <PrescriptionsView 
                  prescriptions={prescriptions}
                  currentUser={currentUser}
                  getPatientName={getPatientName}
                  getDoctorName={getDoctorName}
                  getMedicineName={getMedicineName}
                  onDispense={handleDispensePrescription}
                />
              )}

              {activeTab === "medicines" && (
                <MedicinesView 
                  filteredMedicines={filteredMedicines}
                  interactions={interactions}
                  currentUser={currentUser}
                  onEditMedicineClick={handleEditMedicineClick}
                />
              )}

              {activeTab === "audits" && currentUser?.role === Role.ADMIN && (
                <AuditsView audits={audits} />
              )}

            </main>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 text-center py-4 text-xs font-medium border-t border-slate-800 shrink-0">
        <p className="m-0 text-slate-400 opacity-80">© 2026 MEDISYS E-HEALTH SYSTEM • THIẾT KẾ BENTO GRID GIAO DIỆN PHÒNG KHÁM</p>
      </footer>

      {/* MODALS SECTION */}
      <PatientModal 
        isOpen={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        editingPatient={editingPatient}
        patientForm={patientForm}
        setPatientForm={setPatientForm}
        onSubmit={handleSavePatient}
      />

      <AppointmentModal 
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        currentUser={currentUser}
        patients={patients}
        doctorsList={DOCTORS_LIST}
        appointmentForm={appointmentForm}
        setAppointmentForm={setAppointmentForm}
        onSubmit={handleCreateAppointment}
      />

      <MedicalRecordModal 
        isOpen={showRecordModal}
        onClose={() => setShowRecordModal(false)}
        activeAppointmentForRecord={activeAppointmentForRecord}
        recordForm={recordForm}
        setRecordForm={setRecordForm}
        getPatientName={getPatientName}
        onSubmit={handleCreateMedicalRecord}
      />

      <PrescriptionModal 
        isOpen={showPrescriptionModal}
        onClose={() => setShowPrescriptionModal(false)}
        activeRecordForPrescription={activeRecordForPrescription}
        medicines={medicines}
        prescribedDrugs={prescribedDrugs}
        setPrescribedDrugs={setPrescribedDrugs}
        interactionWarnings={interactionWarnings}
        handleAddMedicineToPrescription={handleAddMedicineToPrescription}
        handleRemovePrescribedDrug={handleRemovePrescribedDrug}
        getPatientName={getPatientName}
        getMedicineName={getMedicineName}
        onSubmit={handleCreatePrescription}
      />

      <MedicineModal 
        isOpen={showMedicineModal}
        onClose={() => setShowMedicineModal(false)}
        editingMedicine={editingMedicine}
        medicineForm={medicineForm}
        setMedicineForm={setMedicineForm}
        onSubmit={handleSaveMedicine}
      />

    </div>
  );
}
