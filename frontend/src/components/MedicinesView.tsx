
import { AlertTriangle } from "lucide-react";
import { type Medicine, type DrugInteraction, type User, Role } from "../types";

interface MedicinesViewProps {
  filteredMedicines: Medicine[];
  interactions: DrugInteraction[];
  currentUser: User | null;
  onEditMedicineClick: (med: Medicine) => void;
}

export default function MedicinesView({
  filteredMedicines,
  interactions,
  currentUser,
  onEditMedicineClick
}: MedicinesViewProps) {
  return (
    <div id="medicines_view_wrapper" className="space-y-4 animate-fade-in relative z-10">
      
      {/* Category A: Medicine inventories */}
      <div className="glass-panel border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
          <div>
            <h2 className="text-base font-extrabold text-white m-0 tracking-wider">Quản lý kho Dược phẩm của Bệnh viện</h2>
            <p className="text-xs text-slate-400 m-0 mt-0.5">Khai báo thuốc mới, theo dõi số lượng tồn kho thực bản và ngày hết hạn an toàn.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] text-slate-300 uppercase font-bold text-[10px] tracking-wider border-b border-white/10">
                <th className="px-6 py-3.5 font-extrabold">Mã thuốc</th>
                <th className="px-6 py-3.5 font-extrabold">Tên thương phẩm</th>
                <th className="px-6 py-3.5 font-extrabold">Lượng tồn kho thực tế</th>
                <th className="px-6 py-3.5 font-extrabold">Giá niêm yết</th>
                <th className="px-6 py-3.5 font-extrabold">Hạn sử dụng ghi nhận</th>
                {(currentUser?.role === Role.ADMIN || currentUser?.role === Role.PHARMACIST) && (
                  <th className="px-6 py-3.5 text-center font-extrabold">Thao tác sửa</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-slate-300">
              {filteredMedicines.map((med) => {
                const isLow = med.stock <= 100;
                return (
                  <tr key={med._id} className="hover:bg-white/[0.02] transition">
                    <td className="px-6 py-4 font-mono font-bold text-xs text-sky-400">
                      {med.code}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-white text-sm">
                      {med.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${isLow ? "bg-rose-500/10 text-rose-300 border-rose-500/20" : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"}`}>
                          {med.stock} {med.unit}
                        </span>
                        {isLow && <span className="text-[9px] font-bold text-rose-400/90 uppercase tracking-widest sm:inline hidden">Yêu cầu nhập thêm</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-sky-300 text-xs">
                      {med.price.toLocaleString()} VNĐ / {med.unit}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-400">
                      {med.expiryDate}
                    </td>
                    {(currentUser?.role === Role.ADMIN || currentUser?.role === Role.PHARMACIST) && (
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <button
                          id={`edit_med_btn_${med._id}`}
                          onClick={() => onEditMedicineClick(med)}
                          className="bg-white/[0.02] hover:bg-sky-500 hover:text-slate-950 border border-white/10 hover:border-transparent font-bold px-3 py-1.5 rounded-lg text-xs transition-all text-sky-400"
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
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    Không tìm thấy loại thuốc tương ứng trong kho.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category B: Drug Interactions logic table */}
      <div className="glass-panel border border-white/10 rounded-2xl shadow-2xl p-5 space-y-4">
        <div>
          <h2 className="text-base font-extrabold text-white m-0 tracking-wider">Kiểm tra quy tắc Tương tác thuốc (Chống chỉ định chéo)</h2>
          <p className="text-xs text-slate-400 m-0 mt-0.5">Cơ chế phát hiển rủi ro an toàn dược phẩm cho người bệnh. Khi thêm đơn kết hợp, hệ thống tự động cảnh báo.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interactions.map((inter) => (
            <div key={inter._id} className="p-4 bg-rose-500/5 rounded-2xl border border-rose-500/20 shadow-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-450 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-extrabold text-rose-300 uppercase tracking-wider text-[11px]">CẢNH BÁO: {inter.medicineA} ＆ {inter.medicineB}</div>
                <p className="text-rose-200/80 font-medium leading-relaxed italic">"{inter.warning}"</p>
                <div className="text-[10px] text-rose-400/60 font-mono tracking-wider mt-1.5 block">QUY TẮC PHÁP LÝ: {inter.code}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
