import type { Audit } from "../types";

interface AuditsViewProps {
  audits: Audit[];
}

export default function AuditsView({ audits }: AuditsViewProps) {
  return (
    <div id="audits_view_wrapper" className="glass-panel border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in relative z-10">
      <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
        <div>
          <h2 className="text-base font-extrabold text-white m-0 tracking-wider">Nhật ký Kiểm toán Hệ thống (Audit Logs)</h2>
          <p className="text-xs text-slate-400 m-0 mt-0.5">Lưu lại mọi thao tác nghiệp vụ, thời gian thực thi, hành vi tạo hồ sơ hay xuất kho dược phục vụ bảo mật hạ tầng.</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {audits.map((aud) => (
          <div key={aud._id} className="p-3.5 bg-white/[0.01] border border-white/5 hover:border-white/10 transition-all rounded-xl flex items-start sm:items-center justify-between flex-col sm:flex-row gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-sky-400 uppercase">{aud.action}</span>
                <span className="p-1 px-1.5 bg-sky-500/10 text-sky-300 border border-sky-500/20 rounded text-[9px] font-bold uppercase tracking-wider">{aud.entity_type}</span>
              </div>
              <div className="text-sm font-semibold text-slate-200 mt-1.5">
                {aud.details}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1 block">MÃ KHÓA: {aud.entity_id}</div>
            </div>

            <div className="text-right text-xs shrink-0 self-start sm:self-center">
              <span className="font-extrabold text-sky-300 block">Thực hiện: {aud.username} ({aud.role})</span>
              <span className="text-[10px] text-slate-400 font-medium block mt-1">{new Date(aud.timestamp).toLocaleString()}</span>
            </div>
          </div>
        ))}

        {audits.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            Chưa phát sinh nhật ký kiểm toán mới của dịch vụ.
          </div>
        )}
      </div>
    </div>
  );
}
