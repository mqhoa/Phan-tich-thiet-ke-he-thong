import { Pill } from "lucide-react";
import { type Prescription, type User, Role, PrescriptionStatus } from "../types";

interface PrescriptionsViewProps {
  prescriptions: Prescription[];
  currentUser: User | null;
  getPatientName: (id: string) => string;
  getDoctorName: (id: string) => string;
  getMedicineName: (id: string) => string;
  onDispense: (prescriptionId: string) => void;
}

export default function PrescriptionsView({
  prescriptions,
  currentUser,
  getPatientName,
  getMedicineName,
  onDispense
}: PrescriptionsViewProps) {
  return (
    <div id="prescriptions_view_wrapper" className="glass-panel border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in relative z-10">
      <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
        <div>
          <h2 className="text-base font-extrabold text-white m-0 tracking-wider">Quản lý Đơn thuốc Điện tử</h2>
          <p className="text-xs text-slate-400 m-0 mt-0.5">Nhà thuốc hoặc Bệnh nhân tra cứu đơn thuốc, định lượng và tiến hành phê duyệt cấp phát hàng hóa tại quầy giao thuốc.</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {prescriptions.map((pres) => (
          <div key={pres._id} className="glass-panel border border-white/5 rounded-2xl p-5 bg-white/[0.01] hover:border-white/10 transition-all shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
              <div>
                <span className="text-[10px] font-mono font-bold text-sky-400 bg-white/[0.05] border border-white/10 px-2.5 py-0.5 rounded uppercase mr-2">{pres.code}</span>
                <span className="text-sm font-extrabold text-white">Bệnh nhân: {getPatientName(pres.patient_id)}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                  pres.status === PrescriptionStatus.DISPENSED ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                }`}>
                  {pres.status === PrescriptionStatus.DISPENSED ? "ĐÃ CẤP PHÁT XUẤT KHO" : "MỚI - CHỜ NHẬN THUỐC"}
                </span>

                {(currentUser?.role === Role.ADMIN || currentUser?.role === Role.PHARMACIST) && pres.status === PrescriptionStatus.PENDING && (
                  <button
                    id={`dispense_btn_${pres._id}`}
                    onClick={() => onDispense(pres._id)}
                    className="bg-sky-505 hover:bg-sky-400 bg-sky-500 text-slate-950 font-extrabold px-3 py-1.5 rounded-lg text-xs transition-all shadow-[0_0_15px_rgba(56,189,248,0.2)] active:scale-[0.98]"
                  >
                    Cấp phát xuất kho &amp; Trừ tồn
                  </button>
                )}
              </div>
            </div>

            {/* List of Details medicines */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pres.details.map((detail, idx) => (
                <div key={detail._id || idx} className="bg-white/[0.01] p-3 rounded-xl border border-white/5 flex items-start gap-3 hover:border-white/10 transition-all">
                  <span className="p-1.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-lg shrink-0 mt-0.5">
                    <Pill className="w-4 h-4" />
                  </span>
                  <div className="text-xs">
                    <div className="font-extrabold text-white text-sm">{getMedicineName(detail.medicine_id)}</div>
                    <div className="text-slate-400 font-semibold mt-0.5">Số lượng bốc: <span className="text-sky-300 font-bold">{detail.quantity}</span> viên / hộp</div>
                    <div className="text-slate-300 font-medium mt-1">Liều lượng: {detail.dosage}</div>
                    <div className="text-slate-400 mt-0.5">Hướng dẫn chỉ định: {detail.instruction}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {prescriptions.length === 0 && (
          <div className="text-center py-12 text-slate-500 bg-white/[0.01] border border-white/5 rounded-2xl">
            Xem đơn thuốc của bạn hoặc tạo mới đính kèm dựa trên bệnh án từ bác sĩ.
          </div>
        )}
      </div>
    </div>
  );
}
