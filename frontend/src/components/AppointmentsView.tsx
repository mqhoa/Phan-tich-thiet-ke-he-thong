import { type Appointment, type User, AppointmentStatus, Role } from "../types";

interface AppointmentsViewProps {
  appointments: Appointment[];
  currentUser: User | null;
  getPatientName: (id: string) => string;
  getDoctorName: (id: string) => string;
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
  onOpenRecordCreator: (apt: Appointment) => void;
}

export default function AppointmentsView({
  appointments,
  currentUser,
  getPatientName,
  getDoctorName,
  onUpdateStatus,
  onOpenRecordCreator
}: AppointmentsViewProps) {
  return (
    <div id="appointments_view_wrapper" className="glass-panel border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in relative z-10">
      <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
        <div>
          <h2 className="text-base font-extrabold text-white m-0 tracking-wider">Lịch đăng ký hẹn khám</h2>
          <p className="text-xs text-slate-400 m-0 mt-0.5">Sử dụng để phê duyệt thời gian hẹn khám lâm sàng của bệnh nhân và chỉ định bác sĩ điều trị.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02] text-slate-300 uppercase font-bold text-[10px] tracking-wider border-b border-white/10">
              <th className="px-6 py-3.5 font-extrabold">Mã lịch khám</th>
              <th className="px-6 py-3.5 font-extrabold">Tên bệnh nhân</th>
              <th className="px-6 py-3.5 font-extrabold">Bác sĩ phụ trách</th>
              <th className="px-6 py-3.5 font-extrabold">Ngày hẹn chính thức</th>
              <th className="px-6 py-3.5 font-extrabold">Trạng thái xử lý</th>
              <th className="px-6 py-3.5 font-extrabold">Lý do điều trị</th>
              <th className="px-6 py-3.5 text-center font-extrabold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm text-slate-300">
            {appointments.map((apt) => (
              <tr key={apt._id} className="hover:bg-white/[0.02] transition">
                <td className="px-6 py-4 font-mono font-bold text-xs text-sky-400">
                  {apt.code}
                </td>
                <td className="px-6 py-4">
                  <span className="font-extrabold text-white text-sm">{getPatientName(apt.patient_id)}</span>
                </td>
                <td className="px-6 py-4 font-bold text-slate-300">
                  {getDoctorName(apt.doctor_id)}
                </td>
                <td className="px-6 py-4 text-xs font-semibold text-slate-400">
                  {new Date(apt.appointmentDate).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                    apt.status === AppointmentStatus.PENDING ? "bg-amber-500/10 text-amber-300 border-amber-500/20" :
                    apt.status === AppointmentStatus.CONFIRMED ? "bg-sky-500/10 text-sky-300 border-sky-500/20 shadow-[0_0_10px_rgba(56,189,248,0.05)]" :
                    apt.status === AppointmentStatus.COMPLETED ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" :
                    "bg-rose-500/10 text-rose-300 border-rose-500/20"
                  }`}>
                    {apt.status === AppointmentStatus.PENDING ? "CHỜ DUYỆT" :
                     apt.status === AppointmentStatus.CONFIRMED ? "XÁC NHẬN" :
                     apt.status === AppointmentStatus.COMPLETED ? "ĐÃ KHÁM" : "HỦY LỊCH"}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-slate-400 max-w-[250px] truncate" title={apt.reason}>
                  {apt.reason}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-xs">
                  {currentUser?.role === Role.ADMIN && apt.status === AppointmentStatus.PENDING && (
                    <div className="inline-flex justify-center gap-2">
                      <button
                        id={`approve_appt_${apt._id}`}
                        onClick={() => onUpdateStatus(apt._id, AppointmentStatus.CONFIRMED)}
                        className="bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/20 hover:border-transparent px-2.5 py-1.5 rounded-lg font-bold transition-all"
                      >
                        Phê duyệt
                      </button>
                      <button
                        id={`cancel_appt_${apt._id}`}
                        onClick={() => onUpdateStatus(apt._id, AppointmentStatus.CANCELLED)}
                        className="bg-rose-500/10 text-rose-300 hover:bg-rose-50 hover:text-white border border-rose-500/20 hover:border-transparent px-2.5 py-1.5 rounded-lg font-bold transition-all"
                      >
                        Hủy bỏ
                      </button>
                    </div>
                  )}

                  {currentUser?.role === Role.DOCTOR && apt.status === AppointmentStatus.CONFIRMED && (
                    <button
                      id={`examining_doctor_action_${apt._id}`}
                      onClick={() => onOpenRecordCreator(apt)}
                      className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold px-3 py-1.5 rounded-lg transition-all shadow-[0_0_15px_rgba(56,189,248,0.2)] active:scale-[0.98]"
                     >
                      Lập bệnh án
                    </button>
                  )}

                  {currentUser?.role === Role.PATIENT && apt.status === AppointmentStatus.PENDING && (
                    <button
                      id={`patient_cancel_appt_${apt._id}`}
                      onClick={() => onUpdateStatus(apt._id, AppointmentStatus.CANCELLED)}
                      className="bg-rose-500/10 text-rose-300 hover:bg-rose-500 hover:text-white border border-rose-505/20 px-3 py-1.5 rounded-lg font-bold transition-all text-xs"
                    >
                      Hủy lịch
                    </button>
                  )}

                  {apt.status === AppointmentStatus.COMPLETED && (
                    <span className="text-emerald-400 font-bold italic">Khám hoàn tất</span>
                  )}
                  
                  {apt.status === AppointmentStatus.CANCELLED && (
                    <span className="text-rose-400 font-bold italic">Đã hủy</span>
                  )}
                </td>
              </tr>
            ))}

            {appointments.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-500">
                  Chưa có bất kỳ dữ liệu lịch khám nào trên hệ thống.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
