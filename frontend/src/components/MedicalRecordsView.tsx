import { Pill } from "lucide-react";
import { type MedicalRecord, type User, Role } from "../types";

interface MedicalRecordsViewProps {
  medicalRecords: MedicalRecord[];
  currentUser: User | null;
  getPatientName: (id: string) => string;
  getDoctorName: (id: string) => string;
  onOpenPrescriptionCreator: (record: MedicalRecord) => void;
}

export default function MedicalRecordsView({
  medicalRecords,
  currentUser,
  getPatientName,
  getDoctorName,
  onOpenPrescriptionCreator
}: MedicalRecordsViewProps) {
  return (
    <div id="medical_records_view_wrapper" className="glass-panel border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in relative z-10">
      <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
        <div>
          <h2 className="text-base font-extrabold text-white m-0 tracking-wider">Quản lý Hồ sơ Bệnh án điện tử</h2>
          <p className="text-xs text-slate-400 m-0 mt-0.5">Hồ sơ lâm sàng về các bệnh nhân, chẩn đoán chi tiết và hướng dẫn chăm sóc định kỳ của bác sĩ.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02] text-slate-300 uppercase font-bold text-[10px] tracking-wider border-b border-white/10">
              <th className="px-6 py-3.5 font-extrabold">ID Hồ Sơ</th>
              <th className="px-6 py-3.5 font-extrabold">Bệnh nhân</th>
              <th className="px-6 py-3.5 font-extrabold">Bác sĩ khám bệnh</th>
              <th className="px-6 py-3.5 font-extrabold">Triệu chứng ban đầu</th>
              <th className="px-6 py-3.5 font-extrabold">Kết quả Chẩn đoán</th>
              <th className="px-6 py-3.5 font-extrabold">Lời dặn bác sĩ</th>
              <th className="px-6 py-3.5 text-center font-extrabold">Đơn thuốc hành lý</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm text-slate-300">
            {medicalRecords.map((rec) => (
              <tr key={rec._id} className="hover:bg-white/[0.02] transition">
                <td className="px-6 py-4 font-mono font-bold text-xs text-sky-400">
                  {rec.code}
                </td>
                <td className="px-6 py-4 font-extrabold text-white text-sm">
                  {getPatientName(rec.patient_id)}
                </td>
                <td className="px-6 py-4 font-bold text-slate-300">
                  {getDoctorName(rec.doctor_id)}
                </td>
                <td className="px-6 py-4 text-xs font-semibold text-rose-300/90">
                  {rec.symptoms}
                </td>
                <td className="px-6 py-4 text-xs font-black text-white">
                  {rec.diagnosis}
                </td>
                <td className="px-6 py-4 text-xs text-slate-400">
                  {rec.notes || "Không ghi chú"}
                </td>
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  {(currentUser?.role === Role.ADMIN || currentUser?.role === Role.DOCTOR) ? (
                    <button
                      id={`btn_issue_prescription_${rec._id}`}
                      onClick={() => onOpenPrescriptionCreator(rec)}
                      className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold px-3 py-1.5 rounded-lg text-xs transition-all inline-flex items-center gap-1.5 shadow-[0_0_15px_rgba(56,189,248,0.2)]"
                    >
                      <Pill className="w-3.5 h-3.5" />
                      Kê đơn thuốc
                    </button>
                  ) : (
                    <span className="text-slate-500 italic text-xs font-bold">Chỉ bác sĩ</span>
                  )}
                </td>
              </tr>
            ))}

            {medicalRecords.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-500">
                  Chưa phát sinh bệnh án điều trị ngoại trú cho bất kỳ bệnh nhân nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
