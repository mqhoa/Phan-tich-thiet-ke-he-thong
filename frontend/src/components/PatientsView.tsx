
import { type Patient, type User, Role } from "../types";

interface PatientsViewProps {
  filteredPatients: Patient[];
  currentUser: User | null;
  onEditPatientClick: (patient: Patient) => void;
  onStartExamClick?: (patient: Patient) => void;
}

export default function PatientsView({
  filteredPatients,
  currentUser,
  onEditPatientClick,
  onStartExamClick
}: PatientsViewProps) {
  return (
    <div id="patients_view_wrapper" className="glass-panel border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in relative z-10">
      <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
        <div>
          <h2 className="text-base font-extrabold text-white m-0 tracking-wider">Hồ sơ đăng ký bệnh nhân</h2>
          <p className="text-xs text-slate-400 m-0 mt-0.5">Danh sách đăng ký thường trú và theo dõi bảo hiểm y tế toàn dân.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02] text-slate-300 uppercase font-bold text-[10px] tracking-wider border-b border-white/10">
              <th className="px-6 py-3.5 font-extrabold">Mã số</th>
              <th className="px-6 py-3.5 font-extrabold">Họ và tên</th>
              <th className="px-6 py-3.5 font-extrabold">Thông tin cá nhân</th>
              <th className="px-6 py-3.5 font-extrabold">Số thẻ BHYT</th>
              <th className="px-6 py-3.5 font-extrabold">Thường trú tại</th>
              {(currentUser?.role === Role.ADMIN || currentUser?.role === Role.DOCTOR) && (
                <th className="px-6 py-3.5 text-center font-extrabold">Hành động</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm text-slate-300">
            {filteredPatients.map((patient) => (
              <tr key={patient._id} className="hover:bg-white/[0.02] transition">
                <td className="px-6 py-4 font-mono font-bold text-sky-400 text-xs">
                  {patient._id}
                </td>
                <td className="px-6 py-4">
                  <span className="font-extrabold text-white text-sm block">{patient.fullName}</span>
                  <span className="text-xs text-slate-400 font-medium block mt-0.5">Mail: {patient.email || "chưa khai báo"}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-white/[0.05] border border-white/10 text-sky-400 text-xs font-bold rounded">{patient.gender}</span>
                    <span className="text-slate-400 text-xs font-medium">NS: {patient.dob}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-300 mt-1.5 block">SĐT: {patient.phone}</span>
                </td>
                <td className="px-6 py-4 font-mono text-xs font-medium text-violet-400">
                  {patient.insuranceNumber || "Không Khai Báo BHYT"}
                </td>
                <td className="px-6 py-4 text-xs text-slate-400 max-w-[240px] truncate" title={patient.address}>
                  {patient.address}
                </td>
                {(currentUser?.role === Role.ADMIN || currentUser?.role === Role.DOCTOR) && (
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="inline-flex justify-center gap-2">
                      <button
                        id={`edit_patient_${patient._id}`}
                        onClick={() => onEditPatientClick(patient)}
                        className="bg-white/[0.02] hover:bg-sky-500 hover:text-slate-950 border border-white/10 hover:border-transparent font-bold px-3 py-1.5 rounded-lg text-xs transition-all text-sky-400"
                      >
                        Cập nhật hồ sơ
                      </button>

                      {currentUser?.role === Role.DOCTOR && onStartExamClick && (
                        <button
                          id={`doctor_exam_patient_${patient._id}`}
                          onClick={() => onStartExamClick(patient)}
                          className="bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 hover:border-transparent font-bold px-3 py-1.5 rounded-lg text-xs transition"
                        >
                          Bắt đầu khám
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}

            {filteredPatients.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-500 text-sm">
                  Không có bệnh nhân hợp lệ khớp với từ khóa tìm kiếm.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
