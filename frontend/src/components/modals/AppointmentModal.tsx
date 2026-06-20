import React from "react";
import { X } from "lucide-react";
import { type Patient, type User, Role } from "../../types";

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  patients: Patient[];
  doctorsList: { id: string; name: string }[];
  appointmentForm: {
    patient_id: string;
    doctor_id: string;
    appointmentDate: string;
    reason: string;
  };
  setAppointmentForm: React.Dispatch<React.SetStateAction<{
    patient_id: string;
    doctor_id: string;
    appointmentDate: string;
    reason: string;
  }>>;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AppointmentModal({
  isOpen,
  onClose,
  currentUser,
  patients,
  doctorsList,
  appointmentForm,
  setAppointmentForm,
  onSubmit
}: AppointmentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-start sm:items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="glass-panel border border-white/15 rounded-2xl w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-scale-up flex flex-col my-auto max-h-[calc(100vh-2rem)] overflow-hidden bg-[#070708]">
        <div className="bg-white/[0.02] text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-white/10">
          <h3 className="text-sm font-black uppercase tracking-wider text-sky-400">ĐĂNG KÝ HẸN LỊCH KHÁM CHUYÊN KHOA</h3>
          <button aria-label="Đóng" onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[65vh] flex-1">
          {currentUser?.role === Role.ADMIN ? (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Chọn bệnh nhân</label>
              <select
                value={appointmentForm.patient_id}
                required
                onChange={(e) => setAppointmentForm({ ...appointmentForm, patient_id: e.target.value })}
                className="w-full bg-[#121214] border border-white/10 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-sky-500 text-white"
              >
                <option value="" className="bg-[#121214]">-- Chọn bệnh nhân --</option>
                {patients.map(p => (
                  <option key={p._id} value={p._id} className="bg-[#121214]">{p.fullName} ({p.phone})</option>
                ))}
              </select>
            </div>
          ) : null}

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Bác sĩ khám phụ trách</label>
            <select
              value={appointmentForm.doctor_id}
              required
              onChange={(e) => setAppointmentForm({ ...appointmentForm, doctor_id: e.target.value })}
              className="w-full bg-[#121214] border border-white/10 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-sky-500 text-white"
            >
              {doctorsList.map(d => (
                <option key={d.id} value={d.id} className="bg-[#121214]">{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Thời gian hẹn mong muốn</label>
            <input
              type="datetime-local"
              required
              value={appointmentForm.appointmentDate}
              onChange={(e) => setAppointmentForm({ ...appointmentForm, appointmentDate: e.target.value })}
              className="w-full bg-[#121214] border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-sky-500 text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Triệu chứng lâm sàng / Lý do đăng ký</label>
            <textarea
              required
              rows={3}
              value={appointmentForm.reason}
              onChange={(e) => setAppointmentForm({ ...appointmentForm, reason: e.target.value })}
              placeholder="Vd: Sốt cao liên tục 2 ngày, ho có đờm, rát cổ họng thắt nghẹn..."
              className="w-full bg-[#121214] border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-sky-500 text-white placeholder-slate-600 transition"
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 font-bold px-4 py-2 rounded-lg text-xs transition border border-white/10"
            >
              Quay lại
            </button>
            <button
              type="submit"
              className="bg-sky-500 hover:bg-sky-400 text-slate-955 bg-sky-500 text-slate-950 font-extrabold px-4 py-2 rounded-lg text-xs transition shadow-[0_0_15px_rgba(56,189,248,0.25)]"
            >
              Xác nhận đặt lịch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
