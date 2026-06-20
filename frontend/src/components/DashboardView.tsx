import { 
  Activity, 
  Users, 
  Calendar, 
  FileText, 
  Clock, 
  ArrowRight 
} from "lucide-react";
import { 
  AppointmentStatus, 
  PrescriptionStatus, 
  type Appointment, 
  type MedicalRecord, 
  type Prescription, 
  type Medicine 
} from "../types";

interface DashboardViewProps {
  patientsCount: number;
  appointments: Appointment[];
  medicalRecords: MedicalRecord[];
  prescriptions: Prescription[];
  medicines: Medicine[];
  getPatientName: (id: string) => string;
  getDoctorName: (id: string) => string;
  setActiveTab: (tab: string) => void;
}

export default function DashboardView({
  patientsCount,
  appointments,
  medicalRecords,
  prescriptions,
  medicines,
  getPatientName,
  getDoctorName,
  setActiveTab
}: DashboardViewProps) {
  return (
    <div id="bento_dashboard_view" className="grid grid-cols-1 md:grid-cols-12 gap-4 animate-fade-in relative z-10">
      
      {/* Bento Row 1: Key Metrics */}
      <div className="glass-panel rounded-2xl p-5 shadow-2xl md:col-span-3 flex items-center gap-4 border-white/10 hover:border-sky-500/30 transition-all group">
        <div className="p-3.5 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20 shadow-[0_0_15px_rgba(56,189,248,0.1)] group-hover:scale-105 transition-transform duration-300">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Tổng Bệnh nhân</div>
          <div id="stat_total_patients" className="text-2xl font-black text-white mt-1.5 leading-none">{patientsCount}</div>
          <div className="text-[10px] text-slate-500 mt-1">Hồ sơ khám chữa hoàn chỉnh</div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-5 shadow-2xl md:col-span-3 flex items-center gap-4 border-white/10 hover:border-sky-500/30 transition-all group">
        <div className="p-3.5 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20 shadow-[0_0_15px_rgba(56,189,248,0.1)] group-hover:scale-105 transition-transform duration-300">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Lịch hẹn tổng</div>
          <div id="stat_total_appointments" className="text-2xl font-black text-white mt-1.5 leading-none">
            {appointments.filter(a => a.status === AppointmentStatus.PENDING || a.status === AppointmentStatus.CONFIRMED).length}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Chờ khám và xử lý duyệt</div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-5 shadow-2xl md:col-span-3 flex items-center gap-4 border-white/10 hover:border-sky-500/30 transition-all group">
        <div className="p-3.5 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.1)] group-hover:scale-105 transition-transform duration-300">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Hành lý Bệnh án</div>
          <div id="stat_total_records" className="text-2xl font-black text-white mt-1.5 leading-none">{medicalRecords.length}</div>
          <div className="text-[10px] text-slate-500 mt-1">Hồ sơ lâm sàng điện tử</div>
        </div>
      </div>

      <div className="glass-panel-glow text-white rounded-2xl p-5 shadow-2xl md:col-span-3 flex items-center justify-between group">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-sky-300 tracking-wider">Trạng thái hệ thống</div>
          <div className="text-sm font-black mt-1.5 text-white">Hoạt động bình thường</div>
          <div className="text-[10px] text-sky-400/60 mt-0.5">Mạng nội bộ an toàn (SSL)</div>
        </div>
        <Activity className="w-6 h-6 text-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.4)] animate-pulse shrink-0" />
      </div>

      {/* Bento Row 2: Appointments Grid & Pharmacy quick checkout */}
      {/* Left Side: Appointments List */}
      <div className="glass-panel rounded-2xl p-5 shadow-2xl md:col-span-7 flex flex-col justify-between border-white/10">
        <div>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
            <h2 className="text-sm font-extrabold text-white m-0 tracking-wider">Lịch khám sắp tới chờ duyệt</h2>
            <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-1 rounded-md border border-sky-500/20 shadow-[0_0_10px_rgba(56,189,248,0.05)]">
              Tổng cộng ({appointments.filter(a => a.status === AppointmentStatus.PENDING).length})
            </span>
          </div>

          <div className="space-y-2.5">
            {appointments.filter(a => a.status === AppointmentStatus.PENDING).slice(0, 3).map((apt) => (
              <div key={apt._id} className="p-3.5 bg-white/[0.02] rounded-xl border border-white/5 hover:border-white/10 transition-all flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{apt.code}</div>
                  <div className="font-extrabold text-white text-sm mt-0.5">{getPatientName(apt.patient_id)}</div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    {new Date(apt.appointmentDate).toLocaleString()} - Bác sĩ: {getDoctorName(apt.doctor_id)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 italic font-medium">Lý do khám: "{apt.reason}"</p>
                </div>

                <span className="px-2.5 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-full font-bold text-[9px] uppercase tracking-wider">
                  Chờ duyệt
                </span>
              </div>
            ))}

            {appointments.filter(a => a.status === AppointmentStatus.PENDING).length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">
                Không có lịch khám mới nào đang chờ duyệt hôm nay.
              </div>
            )}
          </div>
        </div>

        <button
          id="view_all_appointments_btn"
          onClick={() => setActiveTab("appointments")}
          className="mt-4 text-xs font-bold text-sky-400 hover:text-sky-300 transition-all flex items-center justify-end gap-1 hover:translate-x-1"
        >
          <span>Xem chi tiết màn lịch hẹn</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right Side: Pharmacy quick prescription pending dispenser */}
      <div className="glass-panel rounded-2xl p-5 shadow-2xl md:col-span-5 flex flex-col justify-between border-white/10">
        <div>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
            <h2 className="text-sm font-extrabold text-white m-0 tracking-wider">Đơn thuốc chờ cấp phát</h2>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
              Quầy thuốc ({prescriptions.filter(p => p.status === PrescriptionStatus.PENDING).length})
            </span>
          </div>

          <div className="space-y-2.5">
            {prescriptions.filter(p => p.status === PrescriptionStatus.PENDING).slice(0, 3).map((pres) => (
              <div key={pres._id} className="p-3 bg-white/[0.02] rounded-xl border border-white/5 hover:border-white/10 transition-all flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{pres.code}</div>
                  <div className="font-extrabold text-white text-sm mt-0.5">Bệnh nhân: {getPatientName(pres.patient_id)}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Bác sĩ kê: {getDoctorName(pres.doctor_id)} - Số loại: {pres.details.length}
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-full font-bold text-[9px] uppercase tracking-wider">
                  Chờ cấp
                </span>
              </div>
            ))}

            {prescriptions.filter(p => p.status === PrescriptionStatus.PENDING).length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">
                Mọi đơn dược đều đã cấp phát xuất kho.
              </div>
            )}
          </div>
        </div>

        <button
          id="view_all_prescriptions_btn"
          onClick={() => setActiveTab("prescriptions")}
          className="mt-4 text-xs font-bold text-sky-400 hover:text-sky-300 transition-all flex items-center justify-end gap-1 hover:translate-x-1"
        >
          <span>Xem và cấp phát đơn thuốc</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bento Row 3: Patient logs & Stock alert alerts */}
      <div className="glass-panel rounded-2xl p-5 shadow-2xl md:col-span-8 flex flex-col justify-between border-white/10">
        <div>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
            <h2 className="text-sm font-extrabold text-white m-0 tracking-wider">Lịch sử bệnh án ghi nhận gần đây</h2>
            <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">
              Lâm sàng
            </span>
          </div>

          <div className="space-y-2.5">
            {medicalRecords.slice(0, 3).map((rec) => (
              <div key={rec._id} className="p-3 bg-white/[0.02] rounded-xl border border-white/5 hover:border-white/10 transition-all flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-bold text-sky-400 font-mono tracking-wider">{rec.code}</div>
                  <div className="font-extrabold text-white text-sm mt-0.5">Chẩn đoán: {rec.diagnosis}</div>
                  <div className="text-[11px] text-slate-400 mt-1 italic">
                    "Triệu chứng: {rec.symptoms}"
                  </div>
                </div>
                <div className="text-right text-xs shrink-0 pl-4">
                  <span className="font-extrabold text-white block">{getPatientName(rec.patient_id)}</span>
                  <span className="text-[10px] text-slate-500 block mt-1">{new Date(rec.visitDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))}

            {medicalRecords.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">
                Chưa có dữ liệu bệnh án điện tử nào được lưu.
              </div>
            )}
          </div>
        </div>

        <button
          id="view_all_records_btn"
          onClick={() => setActiveTab("records")}
          className="mt-4 text-xs font-bold text-sky-400 hover:text-sky-300 transition-all flex items-center justify-end gap-1 hover:translate-x-1"
        >
          <span>Toàn bộ bệnh án lâm sàng</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Stock alerting indicator */}
      <div className="glass-panel rounded-2xl p-5 shadow-2xl md:col-span-4 flex flex-col justify-between border-white/10">
        <div>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
            <h2 className="text-sm font-extrabold text-white m-0 tracking-wider">Cảnh báo tồn kho</h2>
            <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20 uppercase tracking-wide">
              Nhà thuốc
            </span>
          </div>

          <div className="space-y-2">
            {medicines.map((med) => {
              const isLow = med.stock <= 100;
              return (
                <div key={med._id} className="flex justify-between items-center py-2 border-b border-white/5 last:border-none">
                  <span className="font-extrabold text-slate-200 text-xs">{med.name}</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wide border ${isLow ? "bg-rose-500/10 text-rose-300 border-rose-500/20" : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"}`}>
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
          className="mt-4 text-xs font-bold text-sky-400 hover:text-sky-300 transition-all flex items-center justify-end gap-1 hover:translate-x-1"
        >
          <span>Vào quản lý kho dược</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
