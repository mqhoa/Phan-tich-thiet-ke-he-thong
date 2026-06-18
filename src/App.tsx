import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Users, 
  Calendar, 
  FileText, 
  Plus, 
  Search, 
  Check, 
  X, 
  AlertTriangle, 
  RefreshCw, 
  Clock, 
  Clipboard, 
  ArrowRight,
  UserCheck,
  ShieldAlert,
  LogOut,
  Pill,
  HeartPulse,
  Trash2,
  Lock,
  UserPlus
} from "lucide-react";
import { api, getAuthToken, setAuthToken, removeAuthToken } from "./services/api";
import { 
  Role, 
  AppointmentStatus, 
  PrescriptionStatus, 
  User, 
  Patient, 
  Appointment, 
  MedicalRecord, 
  Prescription, 
  Medicine, 
  DrugInteraction, 
  Audit 
} from "./types";

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
    } catch (err: any) {
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
      fetchData();
    }
  }, [token]);

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
    } catch (err: any) {
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
    } catch (err: any) {
      setErrorMessage(err.message || "Đăng ký không thành công. Hãy thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    setToken(null);
    setCurrentUser(null);
    setActiveTab("dashboard");
    setLoginUsername("");
    setLoginPassword("");
  };

  // Helper arrays for Doctor lists (hardcoded simulated list of active doctors or retrieved from list)
  const DOCTORS_LIST = [
    { id: "doc_1", name: "BS. Nguyễn Văn An (Khoa Nội)" },
    { id: "doc_2", name: "BS. Lê Thị Bình (Khoa Nhi)" }
  ];

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
    } catch (err: any) {
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
    } catch (err: any) {
      setErrorMessage(err.message || "Vui lòng kiểm tra lại thông tin lịch khám.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId: string, status: AppointmentStatus, additionalData: any = {}) => {
    setLoading(true);
    try {
      await api.put(`/appointments/${appointmentId}`, { status, ...additionalData });
      setSuccessMessage(`Đã cập nhật trạng thái lịch khám thành ${status}`);
      fetchData();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
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
    } catch (err: any) {
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
    } catch (err: any) {
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
    } catch (err: any) {
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
    } catch (err: any) {
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
    <div id="app_root" className="min-h-screen bg-[#f1f5f9] text-[#1e293b] font-sans antialiased selection:bg-blue-500 selection:text-white">
      
      {/* Alert Top Bar */}
      {errorMessage && (
        <div id="error_alert_top" className="bg-red-50 border-b border-red-200 text-red-800 px-4 py-3 sticky top-0 z-50 flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <p className="text-sm font-semibold">{errorMessage}</p>
          </div>
          <button id="close_error_btn" onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {successMessage && (
        <div id="success_alert_top" className="bg-emerald-50 border-b border-emerald-200 text-emerald-800 px-4 py-3 sticky top-0 z-50 flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-semibold">{successMessage}</p>
          </div>
          <button id="close_success_btn" onClick={() => setSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Auth Screen Overlay */}
      {!token ? (
        <div id="auth_container" className="min-h-screen flex items-center justify-center bg-slate-950 p-4 transition-all duration-300">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#1e1b4b,transparent)] opacity-40 pointer-events-none"></div>
          
          <div id="auth_card" className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-8 z-10">
            <div className="text-center mb-8">
              <div className="inline-flex p-3 bg-blue-500/10 rounded-xl text-blue-400 mb-3">
                <HeartPulse id="header_app_logo" className="w-8 h-8" />
              </div>
              <h1 id="auth_app_title" className="text-2xl font-black text-white tracking-tight">HỆ THỐNG Y TẾ SỐ MEDISYS</h1>
              <p className="text-slate-400 text-xs uppercase tracking-widest mt-1">Hồ sơ bệnh án &amp; Kho dược phẩm thông minh</p>
            </div>

            {/* Simulated fast login instructions */}
            <div className="bg-slate-800/60 rounded-xl p-3 mb-6 border border-slate-700/80">
              <span className="text-xs font-bold text-blue-400 block mb-1">Tài khoản demo sẵn có (mật khẩu: 123):</span>
              <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-300 font-mono">
                <div>• Patient: <span className="text-emerald-300">patient1</span></div>
                <div>• Doctor: <span className="text-indigo-300">doctor1</span></div>
                <div>• Pharmacist: <span className="text-amber-300">pharmacist</span></div>
                <div>• Admin: <span className="text-red-300">admin</span></div>
              </div>
            </div>

            <div className="flex gap-4 mb-6 border-b border-slate-800 pb-2">
              <button
                id="tab_login_select"
                onClick={() => { setAuthMode("login"); setErrorMessage(null); }}
                className={`flex-1 pb-2 text-sm font-semibold transition ${authMode === "login" ? "text-white border-b-2 border-blue-500" : "text-slate-500 hover:text-slate-300"}`}
              >
                Đăng nhập
              </button>
              <button
                id="tab_register_select"
                onClick={() => { setAuthMode("register"); setErrorMessage(null); }}
                className={`flex-1 pb-2 text-sm font-semibold transition ${authMode === "register" ? "text-white border-b-2 border-blue-500" : "text-slate-500 hover:text-slate-300"}`}
              >
                Đăng ký Bệnh nhân
              </button>
            </div>

            {authMode === "login" ? (
              <form id="login_form" onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Tên tài khoản</label>
                  <input
                    id="login_username_input"
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    required
                    placeholder="Nhập tên đăng nhập"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-lg py-2.5 px-3.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Mật khẩu bảo mật</label>
                  <input
                    id="login_password_input"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-lg py-2.5 px-3.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  id="login_submit_btn"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500 disabled:opacity-50 mt-2"
                >
                  {loading ? "Đang kết nối đến hệ thống..." : "Xác thực đăng nhập"}
                </button>
              </form>
            ) : (
              <form id="register_form" onSubmit={handleRegister} className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Tài khoản</label>
                    <input
                      id="reg_username"
                      type="text"
                      required
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                      placeholder="Username"
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-lg py-1.5 px-2.5 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Mật khẩu</label>
                    <input
                      id="reg_password"
                      type="password"
                      required
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-lg py-1.5 px-2.5 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Họ và tên bệnh nhân</label>
                  <input
                    id="reg_fullName"
                    type="text"
                    required
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    placeholder="Vd: Nguyễn Văn A"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-lg py-1.5 px-2.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Giới tính</label>
                    <select
                      id="reg_gender"
                      value={registerForm.gender}
                      onChange={(e) => setRegisterForm({ ...registerForm, gender: e.target.value })}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-lg py-1.5 px-2.5 text-white text-xs focus:outline-none focus:border-blue-500"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Ngày sinh</label>
                    <input
                      id="reg_dob"
                      type="date"
                      required
                      value={registerForm.dob}
                      onChange={(e) => setRegisterForm({ ...registerForm, dob: e.target.value })}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-lg py-1.5 px-2.5 text-white text-xs focus:outline-none focus:border-blue-500"
                    >
                    </input>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Số điện thoại</label>
                    <input
                      id="reg_phone"
                      type="tel"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                      placeholder="0912..."
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-lg py-1.5 px-2.5 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Mã thẻ BHYT</label>
                    <input
                      id="reg_insurance"
                      type="text"
                      value={registerForm.insuranceNumber}
                      onChange={(e) => setRegisterForm({ ...registerForm, insuranceNumber: e.target.value })}
                      placeholder="GD-4-79-..."
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-lg py-1.5 px-2.5 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Địa chỉ thường trú</label>
                  <input
                    id="reg_address"
                    type="text"
                    value={registerForm.address}
                    onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                    placeholder="Số nhà, Tên đường, Tỉnh/TP"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-lg py-1.5 px-2.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Hòm thư (Email)</label>
                  <input
                    id="reg_email"
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    placeholder="email@vidu.com"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-lg py-1.5 px-2.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  id="register_submit_btn"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg text-xs transition-all focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 mt-4"
                >
                  {loading ? "Đang tiến hành tạo tài khoản..." : "Xác nhận Đăng ký & Tạo hồ sơ y tế"}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        /* Bento Grid Main Layout Container */
        <div id="main_layout_container" className="flex flex-col min-h-screen">
          
          {/* Top Bar for Mobile & Desktop Overview */}
          <header id="top_app_navbar" className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-blue-500/10 rounded-lg text-blue-600 font-extrabold sm:block hidden">
                <HeartPulse id="medisys_logo_navbar" className="w-6 h-6" />
              </span>
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-900 m-0">MEDISYS E-HEALTH PORTAL</h2>
                <p className="text-[11px] text-slate-500 font-semibold m-0">TRÌNH ĐIỀU HÀNH BỆNH ÁN &amp; NHÀ THUỐC BỆNH VIỆN</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right sm:block hidden">
                <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">Người dùng đang đăng nhập</div>
                <div id="user_display_badge" className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {currentUser?.name}
                </div>
              </div>

              <div className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-700 uppercase">
                VAI TRÒ: {currentUser?.role}
              </div>

              <button
                id="btn_logout"
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
                title="Đăng xuất khỏi hệ thống"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </header>

          <div id="grid_layout_wrapper" className="flex-1 flex max-w-[1600px] w-full mx-auto p-4 gap-4 overflow-hidden">
            
            {/* Sidebar Navigation - Left Side of space */}
            <aside id="main_sidebar_menu" className="w-64 bg-slate-900 text-slate-200 rounded-2xl flex flex-col p-4 shadow-xl shrink-0">
              <div className="text-center pb-6 border-b border-slate-800 mb-6">
                <div className="font-black text-xl text-blue-400 tracking-wider">MEDISYS</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">HỆ THỐNG Y TẾ DI ĐỘNG</div>
              </div>

              <nav className="space-y-1.5 flex-1 select-none">
                <button
                  id="tab_nav_dashboard"
                  onClick={() => { setActiveTab("dashboard"); setSearchTerm(""); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === "dashboard" ? "bg-blue-600 text-white shadow-md shadow-blue-900/30" : "hover:bg-slate-800 text-slate-400 hover:text-white"}`}
                >
                  <Activity className="w-4 h-4" />
                  <span>Tổng quan hệ thống</span>
                </button>

                <button
                  id="tab_nav_patients"
                  onClick={() => { setActiveTab("patients"); setSearchTerm(""); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === "patients" ? "bg-blue-600 text-white shadow-md shadow-blue-900/30" : "hover:bg-slate-800 text-slate-400 hover:text-white"}`}
                >
                  <Users className="w-4 h-4" />
                  <span>Quản lý Bệnh nhân</span>
                </button>

                <button
                  id="tab_nav_appointments"
                  onClick={() => { setActiveTab("appointments"); setSearchTerm(""); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === "appointments" ? "bg-blue-600 text-white shadow-md shadow-blue-900/30" : "hover:bg-slate-800 text-slate-400 hover:text-white"}`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Quản lý Lịch khám</span>
                </button>

                <button
                  id="tab_nav_records"
                  onClick={() => { setActiveTab("records"); setSearchTerm(""); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === "records" ? "bg-blue-600 text-white shadow-md shadow-blue-900/30" : "hover:bg-slate-800 text-slate-400 hover:text-white"}`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Hồ sơ Bệnh án</span>
                </button>

                <button
                  id="tab_nav_prescriptions"
                  onClick={() => { setActiveTab("prescriptions"); setSearchTerm(""); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === "prescriptions" ? "bg-blue-600 text-white shadow-md shadow-blue-900/30" : "hover:bg-slate-800 text-slate-400 hover:text-white"}`}
                >
                  <Clipboard className="w-4 h-4" />
                  <span>Đơn thuốc điện tử</span>
                </button>

                <button
                  id="tab_nav_medicines"
                  onClick={() => { setActiveTab("medicines"); setSearchTerm(""); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === "medicines" ? "bg-blue-600 text-white shadow-md shadow-blue-900/30" : "hover:bg-slate-800 text-slate-400 hover:text-white"}`}
                >
                  <Pill className="w-4 h-4" />
                  <span>Quản lý Kho thuốc</span>
                </button>

                {currentUser?.role === Role.ADMIN && (
                  <button
                    id="tab_nav_audits"
                    onClick={() => { setActiveTab("audits"); setSearchTerm(""); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === "audits" ? "bg-blue-600 text-white shadow-md shadow-blue-900/30" : "hover:bg-slate-800 text-slate-400 hover:text-white"}`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Nhật ký Kiểm toán (Audits)</span>
                  </button>
                )}
              </nav>

              <div id="sidebar_logged_profile" className="mt-auto bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
                <div className="text-slate-400 font-semibold mb-1">Phiên làm việc:</div>
                <div className="font-bold text-slate-200 text-sm truncate">{currentUser?.name}</div>
                <div className="text-blue-400 font-mono tracking-wider mt-0.5 mt-1 block">Tài khoản: @{currentUser?.username}</div>
              </div>
            </aside>

            {/* Main Dynamic Workspace Area */}
            <main id="main_workspace_pane" className="flex-1 flex flex-col overflow-y-auto max-h-[calc(100vh-130px)] space-y-4">
              
              {/* Dynamic Search Box for list tables (Except log tabs) */}
              {activeTab !== "dashboard" && activeTab !== "audits" && (
                <div id="search_banner_box" className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Search className="w-4 h-4" />
                    </span>
                    <input
                      id="table_search_input"
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Tìm kiếm nhanh bằng từ khóa hoặc mã số..."
                      className="w-full bg-slate-50 border border-slate-250 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
                    />
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {activeTab === "patients" && (currentUser?.role === Role.ADMIN || currentUser?.role === Role.DOCTOR) && (
                      <button
                        id="btn_add_patient_action"
                        onClick={handleAddPatientClick}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg text-xs flex items-center gap-1.5 transition"
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
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg text-xs flex items-center gap-1.5 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Đặt Lịch khám</span>
                      </button>
                    )}

                    {activeTab === "medicines" && (currentUser?.role === Role.ADMIN || currentUser?.role === Role.PHARMACIST) && (
                      <button
                        id="btn_add_medicine_action"
                        onClick={handleAddMedicineClick}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg text-xs flex items-center gap-1.5 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Nhập thuốc mới</span>
                      </button>
                    )}

                    <button
                      id="btn_refresh_action"
                      onClick={fetchData}
                      className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition"
                      title="Làm mới dữ liệu từ máy chủ"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* 1. DASHBOARD VIEW (BENTO GRIDS STYLE) */}
              {activeTab === "dashboard" && (
                <div id="bento_dashboard_view" className="grid grid-cols-1 md:grid-cols-12 gap-4 animate-fade-in">
                  
                  {/* Bento Row 1: Key Metrics (Cards Column Span 3 each, total 4 grids) */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm md:col-span-3 flex items-center gap-4">
                    <div className="p-3.5 bg-sky-100 text-sky-600 rounded-xl">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">Tổng Bệnh nhân</div>
                      <div id="stat_total_patients" className="text-2xl font-black text-slate-800 mt-1">{patients.length}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Hồ sơ giấy tờ hoàn chỉnh</div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm md:col-span-3 flex items-center gap-4">
                    <div className="p-3.5 bg-blue-100 text-blue-600 rounded-xl">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">Lịch hẹn tổng</div>
                      <div id="stat_total_appointments" className="text-2xl font-black text-slate-800 mt-1">
                        {appointments.filter(a => a.status === AppointmentStatus.PENDING || a.status === AppointmentStatus.CONFIRMED).length}
                      </div>
                      <div className="text-[10px] text-slate-500">Chờ khám và xử lý duyệt</div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm md:col-span-3 flex items-center gap-4">
                    <div className="p-3.5 bg-indigo-100 text-indigo-600 rounded-xl">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">Hành lý Bệnh án</div>
                      <div id="stat_total_records" className="text-2xl font-black text-slate-800 mt-1">{medicalRecords.length}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Đã lập hồ sơ lâm sàng</div>
                    </div>
                  </div>

                  <div className="bg-[#3b82f6] text-white rounded-2xl p-5 shadow-sm md:col-span-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest opacity-90">Trạng thái hệ thống</div>
                      <div className="text-lg font-extrabold mt-1">Hoạt động bình thường</div>
                      <div className="text-[10px] opacity-75 mt-0.5">Lưu trữ máy chủ ngoại tuyến an toàn</div>
                    </div>
                    <Activity className="w-8 h-8 opacity-40 animate-pulse" />
                  </div>

                  {/* Bento Row 2: Appointments Grid & Pharmacy quick checkout */}
                  {/* Left Side: Appointments List (Span 7) */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm md:col-span-7 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                        <h2 className="text-base font-bold text-slate-900 m-0">Lịch khám sắp tới chờ duyệt</h2>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                          Tổng cộng ({appointments.filter(a => a.status === AppointmentStatus.PENDING).length})
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {appointments.filter(a => a.status === AppointmentStatus.PENDING).slice(0, 3).map((apt) => (
                          <div key={apt._id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-slate-400 uppercase">{apt.code}</div>
                              <div className="font-extrabold text-slate-800 text-sm">{getPatientName(apt.patient_id)}</div>
                              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(apt.appointmentDate).toLocaleString()} - Bác sĩ phụ trách: {getDoctorName(apt.doctor_id)}
                              </div>
                              <p className="text-xs text-slate-600 mt-1.5 italic font-medium">Lý do khám: "{apt.reason}"</p>
                            </div>

                            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px] uppercase">
                              Chờ duyệt
                            </span>
                          </div>
                        ))}

                        {appointments.filter(a => a.status === AppointmentStatus.PENDING).length === 0 && (
                          <div className="text-center py-8 text-slate-400 text-sm">
                            Không có lịch khám mới nào đang chờ duyệt hôm nay.
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      id="view_all_appointments_btn"
                      onClick={() => setActiveTab("appointments")}
                      className="mt-4 text-center text-xs font-bold text-blue-600 hover:text-blue-500 transition flex items-center justify-end gap-1"
                    >
                      <span>Xem chi tiết màn lịch hẹn</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Right Side: Pharmacy quick prescription pending dispenser (Span 5) */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm md:col-span-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                        <h2 className="text-base font-bold text-slate-900 m-0">Đơn thuốc chờ cấp phát</h2>
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                          Quầy thuốc ({prescriptions.filter(p => p.status === PrescriptionStatus.PENDING).length})
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {prescriptions.filter(p => p.status === PrescriptionStatus.PENDING).slice(0, 3).map((pres) => (
                          <div key={pres._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-slate-400 uppercase">{pres.code}</div>
                              <div className="font-extrabold text-slate-800 text-sm">Bệnh nhân: {getPatientName(pres.patient_id)}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                Kê đơn bởi Bác sĩ: {getDoctorName(pres.doctor_id)} - Số lượng loại thuốc: {pres.details.length}
                              </div>
                            </div>
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-[10px] font-bold uppercase">
                              Chờ xử lý
                            </span>
                          </div>
                        ))}

                        {prescriptions.filter(p => p.status === PrescriptionStatus.PENDING).length === 0 && (
                          <div className="text-center py-8 text-slate-400 text-sm col-span-12">
                            Mọi đơn dược đều đã hoàn thiện cấp phát xuất kho.
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      id="view_all_prescriptions_btn"
                      onClick={() => setActiveTab("prescriptions")}
                      className="mt-4 text-center text-xs font-bold text-blue-600 hover:text-blue-500 transition flex items-center justify-end gap-1"
                    >
                      <span>Xem và cấp phát đơn thuốc</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Bento Row 3: Patient logs & Stock alert alerts (Span 6 and 6) */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm md:col-span-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                        <h2 className="text-base font-bold text-slate-900 m-0">Lịch sử bệnh án ghi nhận gần đây</h2>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                          Xem thêm
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {medicalRecords.slice(0, 3).map((rec) => (
                          <div key={rec._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-indigo-500 font-mono">{rec.code}</div>
                              <div className="font-extrabold text-slate-800 text-sm">Chẩn đoán: {rec.diagnosis}</div>
                              <div className="text-[11px] text-slate-500 mt-1 italic">
                                "Triệu chứng: {rec.symptoms}"
                              </div>
                            </div>
                            <div className="text-right text-xs">
                              <span className="font-extrabold text-slate-800 block">{getPatientName(rec.patient_id)}</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">{new Date(rec.visitDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}

                        {medicalRecords.length === 0 && (
                          <div className="text-center py-8 text-slate-400 text-sm col-span-12">
                            Chưa có dữ liệu bệnh án điện tử nào được lưu trên hệ thống.
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      id="view_all_records_btn"
                      onClick={() => setActiveTab("records")}
                      className="mt-4 text-center text-xs font-bold text-blue-600 hover:text-blue-500 transition flex items-center justify-end gap-1"
                    >
                      <span>Toàn bộ bệnh án lâm sàng</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Stock alerting indicator */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm md:col-span-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                        <h2 className="text-base font-bold text-slate-900 m-0">Cảnh báo tồn kho</h2>
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md uppercase">
                          Sắp hết thuốc
                        </span>
                      </div>

                      <div className="space-y-2">
                        {medicines.map((med) => {
                          const isLow = med.stock <= 100;
                          return (
                            <div key={med._id} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-none">
                              <span className="font-extrabold text-slate-700 text-xs">{med.name}</span>
                              <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${isLow ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"}`}>
                                Tồn: {med.stock} {med.unit}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      id="view_medicines_dashboard_link"
                      onClick={() => setActiveTab("medicines")}
                      className="mt-4 text-center text-xs font-bold text-blue-600 hover:text-blue-500 transition flex items-center justify-end gap-1"
                    >
                      <span>Vào quản lý kho dược</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              )}

              {/* 2. PATIENTS MODULE VIEW */}
              {activeTab === "patients" && (
                <div id="patients_view_wrapper" className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 m-0">Hồ sơ đăng ký bệnh nhân</h2>
                      <p className="text-xs text-slate-500 m-0">Danh sách đăng ký thường trú và theo dõi bảo hiểm y tế toàn dân.</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                          <th className="px-6 py-3.5">Mã số</th>
                          <th className="px-6 py-3.5">Họ và tên</th>
                          <th className="px-6 py-3.5">Thông tin cá nhân</th>
                          <th className="px-6 py-3.5">Số thẻ BHYT</th>
                          <th className="px-6 py-3.5">Thường trú tại</th>
                          {(currentUser?.role === Role.ADMIN || currentUser?.role === Role.DOCTOR) && (
                            <th className="px-6 py-3.5 text-center">Hành động</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                        {filteredPatients.map((patient) => (
                          <tr key={patient._id} className="hover:bg-slate-50 transition">
                            <td className="px-6 py-4 font-mono font-bold text-slate-500 text-xs">
                              {patient._id}
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-extrabold text-slate-900 text-sm block">{patient.fullName}</span>
                              <span className="text-xs text-slate-500 font-medium block">Mail: {patient.email || "chưa khai báo"}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <span className="px-2 py-0.5 bg-slate-150 text-xs font-bold rounded-md">{patient.gender}</span>
                                <span className="text-slate-500 text-xs font-medium">NS: {patient.dob}</span>
                              </div>
                              <span className="text-xs font-semibold text-slate-600 mt-1 block">SĐT: {patient.phone}</span>
                            </td>
                            <td className="px-6 py-4 font-mono text-xs font-medium text-indigo-600">
                              {patient.insuranceNumber || "Không Khai Báo BHYT"}
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-600 max-w-[240px] truncate" title={patient.address}>
                              {patient.address}
                            </td>
                            {(currentUser?.role === Role.ADMIN || currentUser?.role === Role.DOCTOR) && (
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <div className="inline-flex justify-center gap-2">
                                  <button
                                    id={`edit_patient_${patient._id}`}
                                    onClick={() => handleEditPatientClick(patient)}
                                    className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200/80 font-bold px-3 py-1.5 rounded-lg text-xs transition"
                                  >
                                    Cập nhật hồ sơ
                                  </button>

                                  {currentUser?.role === Role.DOCTOR && (
                                    <button
                                      id={`doctor_exam_patient_${patient._id}`}
                                      onClick={() => {
                                        setAppointmentForm(prev => ({
                                          ...prev,
                                          patient_id: patient._id,
                                          doctor_id: currentUser.doctorId || "doc_1",
                                          appointmentDate: new Date().toISOString().slice(0, 16),
                                          reason: "Khám trực tiếp tại quầy"
                                        }));
                                        setShowAppointmentModal(true);
                                      }}
                                      className="bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-250 font-bold px-3 py-1.5 rounded-lg text-xs transition"
                                    >
                                      Bắt đầu khám
                                    </button>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}

                        {filteredPatients.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center py-12 text-slate-400 text-sm bg-slate-50/50">
                              Không có bệnh nhân hợp lệ khớp với từ khóa tìm kiếm.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 3. APPOINTMENTS MODULE VIEW */}
              {activeTab === "appointments" && (
                <div id="appointments_view_wrapper" className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 m-0">Lịch đăng ký hẹn khám</h2>
                      <p className="text-xs text-slate-500 m-0">Sử dụng để phê duyệt thời gian hẹn khám lâm sàng của bệnh nhân và chỉ định bác sĩ điều trị.</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                          <th className="px-6 py-3.5">Mã lịch khám</th>
                          <th className="px-6 py-3.5">Tên bệnh nhân</th>
                          <th className="px-6 py-3.5">Bác sĩ phụ trách</th>
                          <th className="px-6 py-3.5">Ngày hẹn chính thức</th>
                          <th className="px-6 py-3.5">Trạng thái xử lý</th>
                          <th className="px-6 py-3.5">Lý do điều trị</th>
                          <th className="px-6 py-3.5 text-center">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                        {appointments.map((apt) => (
                          <tr key={apt._id} className="hover:bg-slate-50 transition">
                            <td className="px-6 py-4 font-mono font-bold text-xs text-slate-500">
                              {apt.code}
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-extrabold text-slate-800 text-sm">{getPatientName(apt.patient_id)}</span>
                            </td>
                            <td className="px-6 py-4 font-semibold text-slate-600">
                              {getDoctorName(apt.doctor_id)}
                            </td>
                            <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                              {new Date(apt.appointmentDate).toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                apt.status === AppointmentStatus.PENDING ? "bg-amber-100 text-amber-800" :
                                apt.status === AppointmentStatus.CONFIRMED ? "bg-blue-100 text-blue-800" :
                                apt.status === AppointmentStatus.COMPLETED ? "bg-emerald-100 text-emerald-800" :
                                "bg-red-100 text-red-800"
                              }`}>
                                {apt.status === AppointmentStatus.PENDING ? "CHỜ DUYỆT" :
                                 apt.status === AppointmentStatus.CONFIRMED ? "XÁC NHẬN" :
                                 apt.status === AppointmentStatus.COMPLETED ? "ĐÃ KHÁM" : "HỦY LỊCH"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-600 max-w-[250px] truncate" title={apt.reason}>
                              {apt.reason}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-xs">
                              {currentUser?.role === Role.ADMIN && apt.status === AppointmentStatus.PENDING && (
                                <div className="inline-flex justify-center gap-1.5">
                                  <button
                                    id={`approve_appt_${apt._id}`}
                                    onClick={() => handleUpdateAppointmentStatus(apt._id, AppointmentStatus.CONFIRMED)}
                                    className="bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-200 px-2.5 py-1.5 rounded-lg font-bold transition"
                                  >
                                    Phê duyệt
                                  </button>
                                  <button
                                    id={`cancel_appt_${apt._id}`}
                                    onClick={() => handleUpdateAppointmentStatus(apt._id, AppointmentStatus.CANCELLED)}
                                    className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 px-2.5 py-1.5 rounded-lg font-bold transition"
                                  >
                                    Hủy bỏ
                                  </button>
                                </div>
                              )}

                              {currentUser?.role === Role.DOCTOR && apt.status === AppointmentStatus.CONFIRMED && (
                                <button
                                  id={`examining_doctor_action_${apt._id}`}
                                  onClick={() => handleOpenRecordCreator(apt)}
                                  className="bg-emerald-600 text-white hover:bg-emerald-500 font-extrabold px-3 py-1.5 rounded-lg transition"
                                >
                                  Lập bệnh án
                                </button>
                              )}

                              {currentUser?.role === Role.PATIENT && apt.status === AppointmentStatus.PENDING && (
                                <button
                                  id={`patient_cancel_appt_${apt._id}`}
                                  onClick={() => handleUpdateAppointmentStatus(apt._id, AppointmentStatus.CANCELLED)}
                                  className="bg-rose-50 text-rose-700 hover:bg-rose-700 hover:text-white border border-rose-200 px-3 py-1.5 rounded-lg font-bold transition text-xs"
                                >
                                  Hủy lịch
                                </button>
                              )}

                              {apt.status === AppointmentStatus.COMPLETED && (
                                <span className="text-slate-400 font-bold italic">Khám hoàn tất</span>
                              )}
                              
                              {apt.status === AppointmentStatus.CANCELLED && (
                                <span className="text-rose-400 font-bold italic">Đã hủy</span>
                              )}
                            </td>
                          </tr>
                        ))}

                        {appointments.length === 0 && (
                          <tr>
                            <td colSpan={7} className="text-center py-12 text-slate-500 bg-slate-50/50">
                              Chưa có bất kỳ dữ liệu lịch khám nào trên hệ thống.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 4. MEDICAL RECORDS MODULE VIEW */}
              {activeTab === "records" && (
                <div id="medical_records_view_wrapper" className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 m-0">Quản lý Hồ sơ Bệnh án điện tử</h2>
                      <p className="text-xs text-slate-500 m-0">Hồ sơ lâm sàng về các bệnh nhân, chẩn đoán chi tiết và hướng dẫn chăm sóc định kỳ của bác sĩ.</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                          <th className="px-6 py-3.5">ID Hồ Sơ</th>
                          <th className="px-6 py-3.5">Bệnh nhân</th>
                          <th className="px-6 py-3.5">Bác sĩ khám bệnh</th>
                          <th className="px-6 py-3.5">Triệu chứng ban đầu</th>
                          <th className="px-6 py-3.5">Kết quả Chẩn đoán</th>
                          <th className="px-6 py-3.5">Lời dặn bác sĩ</th>
                          <th className="px-6 py-3.5 text-center">Đơn thuốc hành lý</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                        {medicalRecords.map((rec) => (
                          <tr key={rec._id} className="hover:bg-slate-50 transition">
                            <td className="px-6 py-4 font-mono font-bold text-xs text-slate-500">
                              {rec.code}
                            </td>
                            <td className="px-6 py-4 font-extrabold text-slate-900 text-sm">
                              {getPatientName(rec.patient_id)}
                            </td>
                            <td className="px-6 py-4 font-semibold text-slate-600">
                              {getDoctorName(rec.doctor_id)}
                            </td>
                            <td className="px-6 py-4 text-xs font-semibold text-red-900/80">
                              {rec.symptoms}
                            </td>
                            <td className="px-6 py-4 text-xs font-black text-slate-800">
                              {rec.diagnosis}
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-600">
                              {rec.notes || "Không ghi chú"}
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap">
                              {(currentUser?.role === Role.ADMIN || currentUser?.role === Role.DOCTOR) ? (
                                <button
                                  id={`btn_issue_prescription_${rec._id}`}
                                  onClick={() => handleOpenPrescriptionCreator(rec)}
                                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-3 py-1.5 rounded-lg text-xs transition inline-flex items-center gap-1"
                                >
                                  <Pill className="w-3.5 h-3.5" />
                                  Kê đơn thuốc
                                </button>
                              ) : (
                                <span className="text-slate-400 italic text-xs font-semibold">Bấm tab thuốc</span>
                              )}
                            </td>
                          </tr>
                        ))}

                        {medicalRecords.length === 0 && (
                          <tr>
                            <td colSpan={7} className="text-center py-12 text-slate-500 bg-slate-50/50">
                              Chưa phát sinh bệnh án điều trị ngoại trú cho bất kỳ bệnh nhân nào.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 5. PRESCRIPTIONS MODULE VIEW */}
              {activeTab === "prescriptions" && (
                <div id="prescriptions_view_wrapper" className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 m-0">Quản lý Đơn thuốc Điện tử</h2>
                      <p className="text-xs text-slate-500 m-0">Nhà thuốc hoặc Bệnh nhân tra cứu đơn thuốc, định lượng và tiến hành phê duyệt cấp phát hàng hóa tại quầy giao thuốc.</p>
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    {prescriptions.map((pres) => (
                      <div key={pres._id} className="border border-slate-200/90 rounded-2xl p-5 bg-slate-50/70 hover:bg-slate-50 transition shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                          <div>
                            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-md uppercase mr-2">{pres.code}</span>
                            <span className="text-sm font-extrabold text-slate-800">Bệnh nhân: {getPatientName(pres.patient_id)}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              pres.status === PrescriptionStatus.DISPENSED ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                            }`}>
                              {pres.status === PrescriptionStatus.DISPENSED ? "ĐÃ CẤP PHÁT XUẤT KHO" : "MỚI - CHỜ NHẬN THUỐC"}
                            </span>

                            {(currentUser?.role === Role.ADMIN || currentUser?.role === Role.PHARMACIST) && pres.status === PrescriptionStatus.PENDING && (
                              <button
                                id={`dispense_btn_${pres._id}`}
                                onClick={() => handleDispensePrescription(pres._id)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition"
                              >
                                Cấp phát xuất kho &amp; Trừ tồn
                              </button>
                            )}
                          </div>
                        </div>

                        {/* List of Details medicines */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {pres.details.map((detail, idx) => (
                            <div key={detail._id || idx} className="bg-white p-3 rounded-xl border border-slate-150 flex items-start gap-3">
                              <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-0.5">
                                <Pill className="w-4 h-4" />
                              </span>
                              <div className="text-xs">
                                <div className="font-extrabold text-slate-900 text-sm">{getMedicineName(detail.medicine_id)}</div>
                                <div className="text-slate-500 font-semibold mt-0.5">Số lượng bốc: <span className="text-indigo-600 font-bold">{detail.quantity}</span> viên / hộp</div>
                                <div className="text-slate-700 font-medium mt-1">Liều lý: {detail.dosage}</div>
                                <div className="text-slate-500 mt-0.5">Hướng dẫn chỉ định: {detail.instruction}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {prescriptions.length === 0 && (
                      <div className="text-center py-12 text-slate-500 bg-slate-50/50 border border-slate-150 rounded-2xl">
                        Xem đơn thuốc của bạn hoặc tạo mới đính kèm dựa trên bệnh án từ bác sĩ.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 6. MEDICINES & INTERACTIONS LIST VIEW */}
              {activeTab === "medicines" && (
                <div id="medicines_view_wrapper" className="space-y-4">
                  
                  {/* Category A: Medicine inventories */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                      <div>
                        <h2 className="text-base font-bold text-slate-900 m-0">Quản lý kho Dược phẩm của Bệnh viện</h2>
                        <p className="text-xs text-slate-500 m-0">Khai báo thuốc mới, theo dõi số lượng hạt dẻ trong kho và ngày hết hạn an toàn.</p>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                            <th className="px-6 py-3.5">Mã thuốc</th>
                            <th className="px-6 py-3.5">Tên thương phẩm</th>
                            <th className="px-6 py-3.5">Lượng tồn kho thực tế</th>
                            <th className="px-6 py-3.5">Giá niêm yết</th>
                            <th className="px-6 py-3.5">Hạn sử dụng ghi nhận</th>
                            {(currentUser?.role === Role.ADMIN || currentUser?.role === Role.PHARMACIST) && (
                              <th className="px-6 py-3.5 text-center">Thao tác sửa</th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                          {filteredMedicines.map((med) => {
                            const isLow = med.stock <= 100;
                            return (
                              <tr key={med._id} className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4 font-mono font-bold text-xs text-slate-500">
                                  {med.code}
                                </td>
                                <td className="px-6 py-4 font-extrabold text-slate-900 text-sm">
                                  {med.name}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${isLow ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"}`}>
                                      {med.stock} {med.unit}
                                    </span>
                                    {isLow && <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest sm:inline hidden">Yêu cầu nhập thêm</span>}
                                  </div>
                                </td>
                                <td className="px-6 py-4 font-mono font-bold text-slate-900 text-xs">
                                  {med.price.toLocaleString()} VNĐ / {med.unit}
                                </td>
                                <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                                  {med.expiryDate}
                                </td>
                                {(currentUser?.role === Role.ADMIN || currentUser?.role === Role.PHARMACIST) && (
                                  <td className="px-6 py-4 text-center whitespace-nowrap">
                                    <button
                                      id={`edit_med_btn_${med._id}`}
                                      onClick={() => handleEditMedicineClick(med)}
                                      className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                                    >
                                      Sửa định lượng
                                    </button>
                                  </td>
                                )}
                              </tr>
                            );
                          })}

                          {filteredMedicines.length === 0 && (
                            <tr>
                              <td colSpan={6} className="text-center py-12 text-slate-500 bg-slate-50/50">
                                Không tìm thấy loại thuốc tương ứng trong kho.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Category B: Drug Interactions logic table */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden p-5 space-y-4">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 m-0">Kiểm tra &amp; Thiết lập quy tắc Tương tác thuốc (Chống chỉ định chéo)</h2>
                      <p className="text-xs text-slate-500 m-0">Cơ chế phát hiển rủi ro an toàn dược phẩm cho người bệnh. Khi thêm đơn kết hợp, hệ thống tự động đưa cảnh báo ngăn tai biến y tế.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {interactions.map((inter) => (
                        <div key={inter._id} className="p-4 bg-red-50/50 rounded-2xl border border-red-150 shadow-sm flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                          <div className="text-xs space-y-1">
                            <div className="font-extrabold text-red-950 uppercase tracking-tight">CẢNH BÁO: {inter.medicineA} ＆ {inter.medicineB}</div>
                            <p className="text-red-900/80 font-medium leading-relaxed italic">"{inter.warning}"</p>
                            <div className="text-[10px] text-red-500/80 font-mono tracking-wider mt-1 block">QUY TẮC PHÁP LÝ: {inter.code}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* 7. AUDITS LOG MODULE VIEW */}
              {activeTab === "audits" && currentUser?.role === Role.ADMIN && (
                <div id="audits_view_wrapper" className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 m-0">Nhật ký Kiểm toán Hệ thống (Audit Logs)</h2>
                      <p className="text-xs text-slate-500 m-0">Lưu lại mọi thao tác nghiệp vụ, thời gian thực thi, hành vi tạo hồ sơ hay xuất kho dược phục vụ bảo mật hạ tầng.</p>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    {audits.map((aud) => (
                      <div key={aud._id} className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl flex items-start sm:items-center justify-between flex-col sm:flex-row gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-500 uppercase">{aud.action}</span>
                            <span className="p-1 bg-blue-105 text-blue-700 rounded text-[9px] font-bold uppercase">{aud.entity_type}</span>
                          </div>
                          <div className="text-sm font-semibold text-slate-800 mt-1">
                            {aud.details}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5 block">MÃ KHÓA: {aud.entity_id}</div>
                        </div>

                        <div className="text-right text-xs shrink-0 self-start sm:self-center">
                          <span className="font-extrabold text-indigo-900 block">Thực hiện: {aud.username} ({aud.role})</span>
                          <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{new Date(aud.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}

                    {audits.length === 0 && (
                      <div className="text-center py-12 text-slate-400 text-sm">
                        Chưa phát sinh nhật ký kiểm toán mới của dịch vụ.
                      </div>
                    )}
                  </div>
                </div>
              )}

            </main>
          </div>
        </div>
      )}

      {/* FOOTER COOPERATIVE SYSTEM GREETINGS */}
      <footer className="bg-slate-900 text-slate-400 text-center py-4 text-xs font-medium border-t border-slate-800 shrink-0">
        <p className="m-0 text-slate-400 opacity-80">© 2026 MEDISYS E-HEALTH SYSTEM • THIẾT KẾ BENTO GRID GIAO DIỆN PHÒNG KHÁM</p>
      </footer>

      {/* MODALS SECTION FOR ADD / EDIT FUNCTIONS */}

      {/* A. PATIENT CREATOR / EDITOR MODAL */}
      {showPatientModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-2xl animate-scale-up flex flex-col my-auto max-h-[calc(100vh-2rem)] overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <h3 className="text-sm font-black uppercase tracking-wider">{editingPatient ? "CẬP NHẬT THÔNG TIN BỆNH NHÂN" : "THÊM MỚI BỆNH NHÂN ĐĂNG KÝ"}</h3>
              <button aria-label="Đóng" onClick={() => setShowPatientModal(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePatient} className="p-6 space-y-4 overflow-y-auto max-h-[65vh] flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Họ và tên bệnh nhân (Bắt buộc)</label>
                <input
                  type="text"
                  required
                  value={patientForm.fullName}
                  onChange={(e) => setPatientForm({ ...patientForm, fullName: e.target.value })}
                  placeholder="Vd: Nguyễn Văn A"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Giới tính</label>
                  <select
                    value={patientForm.gender}
                    onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ngày sinh</label>
                  <input
                    type="date"
                    required
                    value={patientForm.dob}
                    onChange={(e) => setPatientForm({ ...patientForm, dob: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Số điện thoại liên lạc</label>
                  <input
                    type="tel"
                    required
                    value={patientForm.phone}
                    onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                    placeholder="0911..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Số BHYT (Nếu có)</label>
                  <input
                    type="text"
                    value={patientForm.insuranceNumber}
                    onChange={(e) => setPatientForm({ ...patientForm, insuranceNumber: e.target.value })}
                    placeholder="GD-4-..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Địa chỉ thường trú</label>
                <input
                  type="text"
                  required
                  value={patientForm.address}
                  onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })}
                  placeholder="Phường/Xã/Quận/Huyện/Tỉnh/TP"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Địa chỉ Email liên hệ</label>
                <input
                  type="email"
                  value={patientForm.email}
                  onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                  placeholder="nhap.email@mau.vn"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPatientModal(false)}
                  className="bg-slate-100 hover:bg-slate-250 text-slate-700 font-bold px-4 py-2 rounded-lg text-xs transition"
                >
                  Hủy thao tác
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg text-xs transition"
                >
                  {editingPatient ? "Lưu thay đổi" : "Lưu hồ sơ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* B. APPOINTMENT RESERVER MODAL */}
      {showAppointmentModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-2xl animate-scale-up flex flex-col my-auto max-h-[calc(100vh-2rem)] overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <h3 className="text-sm font-black uppercase tracking-wider">ĐĂNG KÝ HẸN LỊCH KHÁM CHUYÊN KHOA</h3>
              <button aria-label="Đóng" onClick={() => setShowAppointmentModal(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="p-6 space-y-4 overflow-y-auto max-h-[65vh] flex-1">
              {currentUser?.role === Role.ADMIN ? (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Chọn bệnh nhân</label>
                  <select
                    value={appointmentForm.patient_id}
                    required
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, patient_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none"
                  >
                    <option value="">-- Chọn bệnh nhân --</option>
                    {patients.map(p => (
                      <option key={p._id} value={p._id}>{p.fullName} ({p.phone})</option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bác sĩ khám phụ trách</label>
                <select
                  value={appointmentForm.doctor_id}
                  required
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, doctor_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none"
                >
                  {DOCTORS_LIST.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Thời gian hẹn mong muốn</label>
                <input
                  type="datetime-local"
                  required
                  value={appointmentForm.appointmentDate}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, appointmentDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Triệu chứng lâm sàng / Lý do đăng ký</label>
                <textarea
                  required
                  rows={3}
                  value={appointmentForm.reason}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, reason: e.target.value })}
                  placeholder="Vd: Sốt cao liên tục 2 ngày, ho có đờm, rát cổ họng thắt nghẹn..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAppointmentModal(false)}
                  className="bg-slate-100 hover:bg-slate-250 text-slate-700 font-bold px-4 py-2 rounded-lg text-xs transition"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg text-xs transition"
                >
                  Xác nhận đặt lịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* C. MEDICAL RECORD CREATION MODAL */}
      {showRecordModal && activeAppointmentForRecord && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-2xl animate-scale-up flex flex-col my-auto max-h-[calc(100vh-2rem)] overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <h3 className="text-sm font-black uppercase tracking-wider">THIẾT LẬP BỆNH ÁN KHÁM LÂM SÀNG</h3>
              <button aria-label="Đóng" onClick={() => setShowRecordModal(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-blue-50 p-4 border-b border-blue-150 text-xs shrink-0">
              <span className="font-extrabold text-blue-900 block uppercase">ĐANG KHÁM CHO BỆNH NHÂN:</span>
              <span className="font-black text-slate-800 text-sm block mt-0.5">{getPatientName(activeAppointmentForRecord.patient_id)}</span>
              <span className="text-slate-500 block mt-1">Lý do lúc đăng ký: "{activeAppointmentForRecord.reason}"</span>
            </div>

            <form onSubmit={handleCreateMedicalRecord} className="p-6 space-y-4 overflow-y-auto max-h-[50vh] flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ghi nhận triệu chứng lâm sàng (Bắt buộc)</label>
                <input
                  type="text"
                  required
                  value={recordForm.symptoms}
                  onChange={(e) => setRecordForm({ ...recordForm, symptoms: e.target.value })}
                  placeholder="Vd: Sốt ho khan rát họng, mệt mỏi ăn không tiêu..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bác sĩ chẩn đoán bệnh lý chính (Bắt buộc)</label>
                <input
                  type="text"
                  required
                  value={recordForm.diagnosis}
                  onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                  placeholder="Vd: Viêm họng cấp tính do nhiễm vi rút"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Lời dặn chi tiết của bác sĩ &amp; Ghi chú khác</label>
                <textarea
                  rows={3}
                  value={recordForm.notes}
                  onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                  placeholder="Uống nhiều nước ấm, nghỉ ngơi, quay lại tái khám sau 3 ngày nếu không thuyên giảm..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="bg-slate-100 hover:bg-slate-250 text-slate-705 font-bold px-4 py-2 rounded-lg text-xs transition"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg text-xs transition"
                >
                  Xác nhận lưu bệnh án
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* D. PRESCRIPTION CREATOR MODAL WITH INTERACTION SYSTEM */}
      {showPrescriptionModal && activeRecordForPrescription && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl border border-slate-200 shadow-2xl animate-scale-up flex flex-col my-auto max-h-[calc(100vh-2rem)] overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <h3 className="text-sm font-black uppercase tracking-wider">KÊ ĐƠN THUỐC ĐIỆN TỬ CHO BỆNH NHÂN</h3>
              <button aria-label="Đóng" onClick={() => setShowPrescriptionModal(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-indigo-50 p-4 border-b border-indigo-150 text-xs shrink-0">
              <span className="font-extrabold text-indigo-900 block uppercase">BỆNH ÁN THAM CHIẾU: {activeRecordForPrescription.code}</span>
              <span className="font-black text-slate-800 text-sm block mt-0.5">Bệnh nhân: {getPatientName(activeRecordForPrescription.patient_id)}</span>
              <span className="text-slate-600 block mt-1">Chẩn đoán từ bác sĩ: "{activeRecordForPrescription.diagnosis}"</span>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[50vh] flex-1">
              
              {/* Medicine Select options and interaction warning triggers */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Click vào thuốc để thêm vào đơn:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {medicines.map(med => (
                    <button
                      key={med._id}
                      type="button"
                      onClick={() => handleAddMedicineToPrescription(med._id)}
                      className="p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-400 rounded-xl text-left transition"
                    >
                      <div className="font-bold text-slate-800 text-xs">{med.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Tồn kho: {med.stock} {med.unit}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Real time warning display system */}
              {interactionWarnings.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-rose-800 font-extrabold text-xs">
                    <AlertTriangle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
                    <span>CẢNH BÁO TƯƠNG TÁC THUỐC PHÁT HIỆN</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-rose-900/90 font-medium">
                    {interactionWarnings.map((warning, i) => (
                      <li key={i}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Chosen Prescribed list table */}
              <form onSubmit={handleCreatePrescription} className="space-y-4">
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">Danh sách thuốc đã chọn ({prescribedDrugs.length}):</h4>
                  
                  {prescribedDrugs.map((item, index) => (
                    <div key={index} className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex items-start justify-between flex-wrap sm:flex-nowrap gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="font-bold text-indigo-950 text-sm">{getMedicineName(item.medicine_id)}</div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <label className="text-[10px] text-slate-400 font-bold block mb-0.5">Số viên</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setPrescribedDrugs(prev => prev.map((p, i) => i === index ? { ...p, quantity: val } : p));
                              }}
                              className="w-full bg-white border border-slate-200 rounded p-1"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 font-bold block mb-0.5">Liều dùng</label>
                            <input
                              type="text"
                              value={item.dosage}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPrescribedDrugs(prev => prev.map((p, i) => i === index ? { ...p, dosage: val } : p));
                              }}
                              className="w-full bg-white border border-slate-200 rounded p-1"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 font-bold block mb-0.5">Lời dặn</label>
                            <input
                              type="text"
                              value={item.instruction}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPrescribedDrugs(prev => prev.map((p, i) => i === index ? { ...p, instruction: val } : p));
                              }}
                              className="w-full bg-white border border-slate-200 rounded p-1"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemovePrescribedDrug(index)}
                        className="text-slate-400 hover:text-red-600 p-2 border border-slate-200 rounded-lg hover:bg-slate-100 mt-2 sm:mt-0 transition shrink-0"
                        title="Xóa ra khỏi đơn thuốc"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {prescribedDrugs.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                      Hãy chọn thuốc ở danh mục phí trên để lập đơn thuốc.
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPrescriptionModal(false)}
                    className="bg-slate-100 hover:bg-slate-250 text-slate-700 font-bold px-4 py-2 rounded-lg text-xs transition"
                  >
                    Bỏ qua
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-lg text-xs transition"
                  >
                    Xác nhận ký tên &amp; Gửi đơn thuốc
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* E. MEDICINES INVENTORY IMPORT MODAL */}
      {showMedicineModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-2xl animate-scale-up flex flex-col my-auto max-h-[calc(100vh-2rem)] overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <h3 className="text-sm font-black uppercase tracking-wider">{editingMedicine ? "CẬP NHẬT KHO THUỐC" : "NHẬP DANH MỤC THUỐC MỚI CHI TIẾT"}</h3>
              <button aria-label="Đóng" onClick={() => setShowMedicineModal(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMedicine} className="p-6 space-y-4 overflow-y-auto max-h-[65vh] flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mã định danh thuốc</label>
                  <input
                    type="text"
                    required
                    value={medicineForm.code}
                    onChange={(e) => setMedicineForm({ ...medicineForm, code: e.target.value })}
                    placeholder="Vd: PARA500"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tên biệt dược</label>
                  <input
                    type="text"
                    required
                    value={medicineForm.name}
                    onChange={(e) => setMedicineForm({ ...medicineForm, name: e.target.value })}
                    placeholder="Vd: Paracetamol 500mg"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Số lượng tồn</label>
                  <input
                    type="number"
                    required
                    value={medicineForm.stock}
                    onChange={(e) => setMedicineForm({ ...medicineForm, stock: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Đơn vị đo</label>
                  <input
                    type="text"
                    required
                    value={medicineForm.unit}
                    onChange={(e) => setMedicineForm({ ...medicineForm, unit: e.target.value })}
                    placeholder="viên/hộp"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Đơn giá (VNĐ)</label>
                  <input
                    type="number"
                    required
                    value={medicineForm.price}
                    onChange={(e) => setMedicineForm({ ...medicineForm, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ngày hết hạn (Expiry date)</label>
                <input
                  type="date"
                  required
                  value={medicineForm.expiryDate}
                  onChange={(e) => setMedicineForm({ ...medicineForm, expiryDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMedicineModal(false)}
                  className="bg-slate-100 hover:bg-slate-250 text-slate-700 font-bold px-4 py-2 rounded-lg text-xs transition"
                >
                  Hủy quay lại
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg text-xs transition"
                >
                  Xác nhận lưu kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
