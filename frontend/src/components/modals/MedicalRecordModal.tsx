import React from "react";
import { X } from "lucide-react";
import type { Appointment } from "../../types";

interface MedicalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeAppointmentForRecord: Appointment | null;
  recordForm: {
    symptoms: string;
    diagnosis: string;
    notes: string;
  };
  setRecordForm: React.Dispatch<React.SetStateAction<{
    symptoms: string;
    diagnosis: string;
    notes: string;
  }>>;
  getPatientName: (id: string) => string;
  onSubmit: (e: React.FormEvent) => void;
}

export default function MedicalRecordModal({
  isOpen,
  onClose,
  activeAppointmentForRecord,
  recordForm,
  setRecordForm,
  getPatientName,
  onSubmit
}: MedicalRecordModalProps) {
  if (!isOpen || !activeAppointmentForRecord) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-start sm:items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="glass-panel border border-white/15 rounded-2xl w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-scale-up flex flex-col my-auto max-h-[calc(100vh-2rem)] overflow-hidden bg-[#070708]">
        <div className="bg-white/[0.02] text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-white/10">
          <h3 className="text-sm font-black uppercase tracking-wider text-sky-400">THIẾT LẬP BỆNH ÁN KHÁM LÂM SÀNG</h3>
          <button aria-label="Đóng" onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-sky-500/5 p-4 border-b border-sky-500/10 text-xs shrink-0">
          <span className="font-extrabold text-sky-300 block uppercase tracking-wider text-[10px]">ĐANG KHÁM CHO BỆNH NHÂN:</span>
          <span className="font-black text-white text-sm block mt-1">{getPatientName(activeAppointmentForRecord.patient_id)}</span>
          <span className="text-slate-400 block mt-1.5 italic">Lý do lúc đăng ký: "{activeAppointmentForRecord.reason}"</span>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[50vh] flex-1">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Ghi nhận triệu chứng lâm sàng (Bắt buộc)</label>
            <input
              type="text"
              required
              value={recordForm.symptoms}
              onChange={(e) => setRecordForm({ ...recordForm, symptoms: e.target.value })}
              placeholder="Vd: Sốt ho khan rát họng, mệt mỏi ăn không tiêu..."
              className="w-full bg-[#121214] border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-sky-500 text-white placeholder-slate-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Bác sĩ chẩn đoán bệnh lý chính (Bắt buộc)</label>
            <input
              type="text"
              required
              value={recordForm.diagnosis}
              onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
              placeholder="Vd: Viêm họng cấp tính do nhiễm vi rút"
              className="w-full bg-[#121214] border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-sky-500 text-white placeholder-slate-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Lời dặn chi tiết của bác sĩ &amp; Ghi chú khác</label>
            <textarea
              rows={3}
              value={recordForm.notes}
              onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
              placeholder="Uống nhiều nước ấm, nghỉ ngơi, quay lại tái khám sau 3 ngày nếu không thuyên giảm..."
              className="w-full bg-[#121214] border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-sky-500 text-white placeholder-slate-600 transition"
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-white/[0.05] hover:bg-white/[0.1] text-slate-350 font-bold px-4 py-2 rounded-lg text-xs transition border border-white/10"
            >
              Quay lại
            </button>
            <button
              type="submit"
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold px-4 py-2 rounded-lg text-xs transition shadow-[0_0_15px_rgba(56,189,248,0.25)]"
            >
              Xác nhận lưu bệnh án
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
