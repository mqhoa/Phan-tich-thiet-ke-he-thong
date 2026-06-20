import React from "react";
import { X } from "lucide-react";
import type { Medicine } from "../../types";

interface MedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingMedicine: Medicine | null;
  medicineForm: {
    code: string;
    name: string;
    stock: number;
    unit: string;
    price: number;
    expiryDate: string;
  };
  setMedicineForm: React.Dispatch<React.SetStateAction<{
    code: string;
    name: string;
    stock: number;
    unit: string;
    price: number;
    expiryDate: string;
  }>>;
  onSubmit: (e: React.FormEvent) => void;
}

export default function MedicineModal({
  isOpen,
  onClose,
  editingMedicine,
  medicineForm,
  setMedicineForm,
  onSubmit
}: MedicineModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-start sm:items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="glass-panel border border-white/15 rounded-2xl w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-scale-up flex flex-col my-auto max-h-[calc(100vh-2rem)] overflow-hidden bg-[#070708]">
        <div className="bg-white/[0.02] text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-white/10">
          <h3 className="text-sm font-black uppercase tracking-wider text-sky-400">{editingMedicine ? "CẬP NHẬT KHO THUỐC" : "NHẬP DANH MỤC THUỐC MỚI CHI TIẾT"}</h3>
          <button aria-label="Đóng" onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[65vh] flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Mã định danh thuốc</label>
              <input
                type="text"
                required
                value={medicineForm.code}
                onChange={(e) => setMedicineForm({ ...medicineForm, code: e.target.value })}
                placeholder="Vd: PARA500"
                className="w-full bg-[#121214] border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-sky-500 text-white placeholder-slate-650 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Tên biệt dược</label>
              <input
                type="text"
                required
                value={medicineForm.name}
                onChange={(e) => setMedicineForm({ ...medicineForm, name: e.target.value })}
                placeholder="Vd: Paracetamol 500mg"
                className="w-full bg-[#121214] border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-sky-500 text-white placeholder-slate-650 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Số lượng tồn</label>
              <input
                type="number"
                required
                value={medicineForm.stock}
                onChange={(e) => setMedicineForm({ ...medicineForm, stock: Number(e.target.value) })}
                className="w-full bg-[#121214] border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-sky-500 text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Đơn vị đo</label>
              <input
                type="text"
                required
                value={medicineForm.unit}
                onChange={(e) => setMedicineForm({ ...medicineForm, unit: e.target.value })}
                placeholder="viên/hộp"
                className="w-full bg-[#121214] border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-sky-500 text-white placeholder-slate-630 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Đơn giá (VNĐ)</label>
              <input
                type="number"
                required
                value={medicineForm.price}
                onChange={(e) => setMedicineForm({ ...medicineForm, price: Number(e.target.value) })}
                className="w-full bg-[#121214] border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-sky-500 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Ngày hết hạn (Expiry date)</label>
            <input
              type="date"
              required
              value={medicineForm.expiryDate}
              onChange={(e) => setMedicineForm({ ...medicineForm, expiryDate: e.target.value })}
              className="w-full bg-[#121214] border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-sky-500 text-white"
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 font-bold px-4 py-2 rounded-lg text-xs transition border border-white/10"
            >
              Hủy quay lại
            </button>
            <button
              type="submit"
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold px-4 py-2 rounded-lg text-xs transition shadow-[0_0_15px_rgba(56,189,248,0.25)]"
            >
              Xác nhận lưu kho
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
