import React from "react";
import { X, AlertTriangle, Trash2 } from "lucide-react";
import type { MedicalRecord, Medicine } from "../../types";

interface PrescribedDrug {
  medicine_id: string;
  quantity: number;
  dosage: string;
  instruction: string;
}

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRecordForPrescription: MedicalRecord | null;
  medicines: Medicine[];
  prescribedDrugs: PrescribedDrug[];
  setPrescribedDrugs: React.Dispatch<React.SetStateAction<PrescribedDrug[]>>;
  interactionWarnings: string[];
  handleAddMedicineToPrescription: (medId: string) => void;
  handleRemovePrescribedDrug: (idx: number) => void;
  getPatientName: (id: string) => string;
  getMedicineName: (id: string) => string;
  onSubmit: (e: React.FormEvent) => void;
}

export default function PrescriptionModal({
  isOpen,
  onClose,
  activeRecordForPrescription,
  medicines,
  prescribedDrugs,
  setPrescribedDrugs,
  interactionWarnings,
  handleAddMedicineToPrescription,
  handleRemovePrescribedDrug,
  getPatientName,
  getMedicineName,
  onSubmit
 }: PrescriptionModalProps) {
  if (!isOpen || !activeRecordForPrescription) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-start sm:items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="glass-panel border border-white/15 rounded-2xl w-full max-w-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-scale-up flex flex-col my-auto max-h-[calc(100vh-2rem)] overflow-hidden bg-[#070708]">
        <div className="bg-white/[0.02] text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-white/10">
          <h3 className="text-sm font-black uppercase tracking-wider text-sky-400">KÊ ĐƠN THUỐC ĐIỆN TỬ CHO BỆNH NHÂN</h3>
          <button aria-label="Đóng" onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-sky-500/5 p-4 border-b border-sky-500/10 text-xs shrink-0">
          <span className="font-extrabold text-sky-300 block uppercase tracking-wider text-[10px]">BỆNH ÁN THAM CHIẾU: {activeRecordForPrescription.code}</span>
          <span className="font-black text-white text-sm block mt-1">Bệnh nhân: {getPatientName(activeRecordForPrescription.patient_id)}</span>
          <span className="text-slate-400 block mt-1.5 italic">Chẩn đoán từ bác sĩ: "{activeRecordForPrescription.diagnosis}"</span>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[50vh] flex-1">
          
          {/* Medicine Select options and interaction warning triggers */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Click vào thuốc để thêm vào đơn:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {medicines.map(med => (
                <button
                  key={med._id}
                  type="button"
                  onClick={() => handleAddMedicineToPrescription(med._id)}
                  className="p-2.5 bg-white/[0.01] hover:bg-sky-500/10 border border-white/5 hover:border-sky-500/30 rounded-xl text-left transition-all hover:scale-[1.02]"
                >
                  <div className="font-bold text-white text-xs">{med.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Tồn kho: {med.stock} {med.unit}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Real time warning display system */}
          {interactionWarnings.length > 0 && (
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-rose-300 font-extrabold text-xs">
                <AlertTriangle className="w-4.5 h-4.5 text-rose-400 shrink-0" />
                <span>CẢNH BÁO TƯƠNG TÁC THUỐC PHÁT HIỆN</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-xs text-rose-200/80 font-medium">
                {interactionWarnings.map((warning, i) => (
                  <li key={i}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Chosen Prescribed list table */}
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Danh sách thuốc đã chọn ({prescribedDrugs.length}):</h4>
              
              {prescribedDrugs.map((item, index) => (
                <div key={index} className="bg-white/[0.01] rounded-xl p-3.5 border border-white/5 flex items-start justify-between flex-wrap sm:flex-nowrap gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="font-bold text-white text-sm">{getMedicineName(item.medicine_id)}</div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">Số viên</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setPrescribedDrugs(prev => prev.map((p, i) => i === index ? { ...p, quantity: val } : p));
                          }}
                          className="w-full bg-[#121214] border border-white/10 rounded p-1 text-white focus:outline-none focus:border-sky-500 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">Liều dùng</label>
                        <input
                          type="text"
                          value={item.dosage}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPrescribedDrugs(prev => prev.map((p, i) => i === index ? { ...p, dosage: val } : p));
                          }}
                          className="w-full bg-[#121214] border border-white/10 rounded p-1 text-white focus:outline-none focus:border-sky-500 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block mb-1">Lời dặn</label>
                        <input
                          type="text"
                          value={item.instruction}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPrescribedDrugs(prev => prev.map((p, i) => i === index ? { ...p, instruction: val } : p));
                          }}
                          className="w-full bg-[#121214] border border-white/10 rounded p-1 text-white focus:outline-none focus:border-sky-500 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemovePrescribedDrug(index)}
                    className="text-slate-400 hover:text-rose-450 p-2 border border-white/5 hover:border-rose-400 rounded-lg hover:bg-rose-500/10 hover:border-transparent mt-2 sm:mt-0 transition shrink-0"
                    title="Xóa ra khỏi đơn thuốc"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {prescribedDrugs.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-xs border-2 border-dashed border-white/5 rounded-xl bg-[#0d0d0f]">
                  Hãy chọn thuốc ở danh mục phía trên để lập đơn thuốc.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="bg-white/[0.05] hover:bg-white/[0.1] text-slate-350 font-bold px-4 py-2 rounded-lg text-xs transition border border-white/10"
              >
                Bỏ qua
              </button>
              <button
                type="submit"
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold px-4 py-2 rounded-lg text-xs transition shadow-[0_0_15px_rgba(56,189,248,0.25)]"
              >
                Xác nhận ký tên &amp; Gửi đơn thuốc
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
