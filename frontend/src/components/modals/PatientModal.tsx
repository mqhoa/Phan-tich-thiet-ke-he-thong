import React from "react";
import { X } from "lucide-react";
import type { Patient } from "../../types";

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPatient: Patient | null;
  patientForm: {
    fullName: string;
    gender: string;
    dob: string;
    address: string;
    phone: string;
    insuranceNumber: string;
    email: string;
  };
  setPatientForm: React.Dispatch<React.SetStateAction<{
    fullName: string;
    gender: string;
    dob: string;
    address: string;
    phone: string;
    insuranceNumber: string;
    email: string;
  }>>;
  onSubmit: (e: React.FormEvent) => void;
}

export default function PatientModal({
  isOpen,
  onClose,
  editingPatient,
  patientForm,
  setPatientForm,
  onSubmit
}: PatientModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-start sm:items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="glass-panel border border-white/15 rounded-2xl w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-scale-up flex flex-col my-auto max-h-[calc(100vh-2rem)] overflow-hidden bg-[#070708]">
        <div className="bg-white/[0.02] text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-white/10">
          <h3 className="text-sm font-black uppercase tracking-wider text-sky-400">{editingPatient ? "CẬP NHẬT THÔNG TIN BỆNH NHÂN" : "THÊM MỚI BỆNH NHÂN ĐĂNG KÝ"}</h3>
          <button aria-label="Đóng" onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[65vh] flex-1">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Họ và tên bệnh nhân (Bắt buộc)</label>
            <input
              type="text"
              required
              value={patientForm.fullName}
              onChange={(e) => setPatientForm({ ...patientForm, fullName: e.target.value })}
              placeholder="Vd: Nguyễn Văn A"
              className="w-full bg-[#121214] border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-sky-500 text-white placeholder-slate-600 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Giới tính</label>
              <select
                value={patientForm.gender}
                onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                className="w-full bg-[#121214] border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-sky-500 text-white transition"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Ngày sinh</label>
              <input
                type="date"
                required
                value={patientForm.dob}
                onChange={(e) => setPatientForm({ ...patientForm, dob: e.target.value })}
                className="w-full bg-[#121214] border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-sky-500 text-white transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Số điện thoại liên lạc</label>
              <input
                type="text"
                required
                value={patientForm.phone}
                onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                placeholder="0911..."
                className="w-full bg-[#121214] border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-sky-500 text-white placeholder-slate-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Số BHYT (Nếu có)</label>
              <input
                type="text"
                value={patientForm.insuranceNumber}
                onChange={(e) => setPatientForm({ ...patientForm, insuranceNumber: e.target.value })}
                placeholder="GD-4-..."
                className="w-full bg-[#121214] border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-sky-500 text-white placeholder-slate-600 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Địa chỉ thường trú</label>
            <input
              type="text"
              required
              value={patientForm.address}
              onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })}
              placeholder="Phường/Xã/Quận/Huyện/Tỉnh/TP"
              className="w-full bg-[#121214] border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-sky-500 text-white placeholder-slate-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Địa chỉ Email liên hệ</label>
            <input
              type="email"
              value={patientForm.email}
              onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
              placeholder="nhap.email@mau.vn"
              className="w-full bg-[#121214] border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-sky-500 text-white placeholder-slate-600 transition"
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 font-bold px-4 py-2 rounded-lg text-xs transition border border-white/10"
            >
              Hủy thao tác
            </button>
            <button
              type="submit"
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold px-4 py-2 rounded-lg text-xs transition shadow-[0_0_15px_rgba(56,189,248,0.25)]"
            >
              {editingPatient ? "Lưu thay đổi" : "Lưu hồ sơ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
