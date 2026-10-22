import React, { useState } from 'react';
import { APACHE_LOGS, ApacheLogEntry } from '../data/apacheLogData';
import { sound } from '../utils/audio';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Award,
  Globe,
  Radio,
  FileText,
  Filter,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';

export const SocLogMatrixTab: React.FC = () => {
  const [logs] = useState<ApacheLogEntry[]>(APACHE_LOGS);
  const [selectedLogId, setSelectedLogId] = useState<number>(18);
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [mobileTab, setMobileTab] = useState<'logs' | 'analysis'>('logs');

  // Mini-Quiz State
  const [q1Answer, setQ1Answer] = useState<string>('');
  const [q2Answer, setQ2Answer] = useState<string>('');
  const [q3Answer, setQ3Answer] = useState<string>('');
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [copiedFlag, setCopiedFlag] = useState<string | null>(null);

  const selectedLog = logs.find((l) => l.id === selectedLogId) || logs[0];

  const handleSelectLog = (id: number) => {
    sound.playClick();
    setSelectedLogId(id);
    if (window.innerWidth < 1024) {
      setMobileTab('analysis');
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (statusFilter !== 'ALL') {
      if (statusFilter === '200' && log.status !== 200) return false;
      if (statusFilter === '40x' && (log.status < 400 || log.status >= 500)) return false;
      if (statusFilter === '500' && log.status !== 500) return false;
    }
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      log.ip.includes(q) ||
      log.path.toLowerCase().includes(q) ||
      log.userAgent.toLowerCase().includes(q) ||
      log.method.toLowerCase().includes(q) ||
      log.status.toString().includes(q)
    );
  });

  const handleSubmitQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    let score = 0;
    if (q1Answer === '185.220.101.5') score += 34;
    if (q2Answer === '/uploads/shell.php?cmd=id') score += 33;
    if (q3Answer === 'Nikto/2.1.6') score += 33;

    setQuizScore(score);
    setQuizSubmitted(true);

    if (score >= 67) {
      sound.playSuccess();
    } else {
      sound.playError();
    }
  };

  const handleResetQuiz = () => {
    sound.playClick();
    setQ1Answer('');
    setQ2Answer('');
    setQ3Answer('');
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  const getStatusBadge = (status: number) => {
    if (status === 200) {
      return 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60';
    }
    if (status === 302) {
      return 'bg-blue-950/80 text-blue-300 border border-blue-700/60';
    }
    if (status >= 400 && status < 500) {
      return 'bg-amber-950/80 text-amber-300 border border-amber-700/60';
    }
    return 'bg-red-950/80 text-red-300 border border-red-700/60';
  };

  return (
    <div className="flex-1 w-full h-full min-h-0 overflow-hidden flex flex-col bg-[#0b0f19]">
      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden px-3 py-2 bg-[#0e1424] border-b border-[#1e293b] flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center p-1 bg-slate-950/80 border border-slate-800 rounded-xl w-full gap-1">
          <button
            onClick={() => {
              sound.playClick();
              setMobileTab('logs');
            }}
            className={`flex-1 py-2 px-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'logs'
                ? 'bg-rose-950/80 text-rose-300 border border-rose-500/60 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Apache Logs ({filteredLogs.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setMobileTab('analysis');
            }}
            className={`flex-1 py-2 px-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'analysis'
                ? 'bg-amber-950/80 text-amber-300 border border-amber-500/60 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Điều Tra & Triage Quiz</span>
          </button>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0 overflow-hidden flex flex-col lg:flex-row">
        {/* LEFT PANE: Apache Access Log Stream & Field Breakdown (60% on desktop) */}
        <div
          className={`w-full lg:w-[60%] h-full flex flex-col border-r border-[#1e293b] bg-[#0c1222] overflow-hidden ${
            mobileTab === 'logs' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Stream Filter Header */}
          <div className="px-3.5 sm:px-4 py-2.5 bg-[#0e1628] border-b border-[#1e293b] flex flex-wrap items-center justify-between gap-2.5 shrink-0">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide">
                Nhật Ký Máy Chủ Web (Apache Access Log)
              </span>
              <span className="text-xs font-mono text-slate-300 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-lg font-bold">
                25 Records
              </span>
            </div>

            {/* Quick Status Filter */}
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="text-slate-400 text-xs font-bold">Status:</span>
              {['ALL', '200', '40x', '500'].map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    sound.playClick();
                    setStatusFilter(st);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-slate-800 text-white border border-slate-600 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Filter search bar */}
          <div className="px-3.5 sm:px-4 py-2 bg-[#090f1d] border-b border-[#1e293b] flex items-center gap-2 shrink-0">
            <div className="flex-1 flex items-center bg-[#070b14] border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-mono focus-within:border-rose-500 transition-colors shadow-sm">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Lọc nhật ký: gõ IP, đường dẫn URL (/shell.php), hoặc User-Agent..."
                className="w-full bg-transparent outline-none text-white text-xs sm:text-sm font-mono"
              />
            </div>
          </div>

          {/* 25-Row Apache Log Table (Scrollable) */}
          <div className="flex-1 overflow-y-auto bg-[#070b14]">
            <table className="w-full text-left font-mono text-xs border-collapse select-none">
              <thead className="bg-[#0e1628] text-slate-300 sticky top-0 border-b border-[#1e293b] text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-2 px-3 w-10">#</th>
                  <th className="py-2 px-3 w-32">Client IP</th>
                  <th className="py-2 px-3 w-16">Method</th>
                  <th className="py-2 px-3">Request Path (URI)</th>
                  <th className="py-2 px-3 w-16 text-center">Status</th>
                  <th className="py-2 px-3 w-16 text-right">Bytes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredLogs.map((log) => {
                  const isSelected = log.id === selectedLogId;

                  return (
                    <tr
                      key={log.id}
                      onClick={() => handleSelectLog(log.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-950/80 text-blue-100 font-bold border-l-4 border-blue-500'
                          : log.isAttack
                          ? 'bg-red-950/30 text-slate-200 hover:bg-red-950/50'
                          : 'hover:bg-slate-900/80 text-slate-300'
                      }`}
                    >
                      <td className="py-2 px-3 text-slate-500">{log.id}</td>
                      <td className="py-2 px-3 truncate font-bold text-slate-200">{log.ip}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`text-xs font-extrabold ${
                            log.method === 'POST' ? 'text-amber-400' : 'text-blue-400'
                          }`}
                        >
                          {log.method}
                        </span>
                      </td>
                      <td className="py-2 px-3 truncate max-w-xs font-medium">
                        {log.path}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${getStatusBadge(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right tabular-nums text-slate-400 font-bold">
                        {log.bytes}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Selected Log Inspector Panel (Bottom of Left Column) */}
          <div className="h-48 border-t border-[#1e293b] bg-[#0e1628] p-3.5 overflow-y-auto shrink-0 space-y-2.5 select-text font-mono text-xs sm:text-sm">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1.5 text-xs font-bold">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="text-white">
                  Phân Tích Chi Tiết Dòng Log #{selectedLog.id}
                </span>
              </div>
              {selectedLog.isAttack && (
                <span className="text-xs font-bold text-red-300 bg-red-950/80 border border-red-700 px-2.5 py-0.5 rounded-lg shadow-sm">
                  ⚠️ Dấu vết tấn công: {selectedLog.attackType}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 font-bold block">Địa chỉ IP</span>
                <span className="text-white font-bold text-xs sm:text-sm">{selectedLog.ip}</span>
              </div>
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 font-bold block">Thời gian</span>
                <span className="text-slate-200 truncate block text-xs">{selectedLog.timestamp}</span>
              </div>
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 font-bold block">HTTP Method & Status</span>
                <span className="text-white font-bold text-xs sm:text-sm">
                  {selectedLog.method} ➔ {selectedLog.status}
                </span>
              </div>
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 font-bold block">Dung lượng</span>
                <span className="text-white font-bold text-xs sm:text-sm">{selectedLog.bytes} Bytes</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm">
              <span className="text-xs text-slate-400 font-bold block mb-0.5">User-Agent Header:</span>
              <code className="text-slate-200 font-bold break-all">{selectedLog.userAgent}</code>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Incident Triage Mini-Quiz Arena (40% on desktop) */}
        <div
          className={`w-full lg:w-[40%] h-full flex flex-col bg-[#0b0f19] overflow-y-auto p-4 space-y-4 ${
            mobileTab === 'analysis' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Quiz Intro Card */}
          <div className="p-4 rounded-xl border border-[#1e293b] bg-[#0f172a] shadow-sm">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white uppercase tracking-wide mb-1.5">
              <Radio className="w-4 h-4 text-amber-400" />
              <span>Đấu Trường Điều Tra Sự Cố (SOC Triage Quiz)</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Hãy phân tích 25 dòng nhật ký máy chủ Apache ở khung bên trái để trả lời 3 câu hỏi điều tra nghiệp vụ dưới đây.
            </p>
          </div>

          {/* Quiz Form */}
          <form onSubmit={handleSubmitQuiz} className="space-y-4">
            {/* Question 1 */}
            <div className="p-4 rounded-xl border border-[#1e293b] bg-[#0f172a] space-y-2.5 shadow-sm">
              <div className="text-xs sm:text-sm font-bold text-white leading-snug">
                Câu 1: Địa chỉ IP nào đã thực hiện hành vi quét cổng & fuzzing URL bất thường?
              </div>
              <div className="space-y-2 text-xs font-mono">
                {[
                  { val: '192.168.1.50', label: '192.168.1.50 (User nội bộ)' },
                  { val: '185.220.101.5', label: '185.220.101.5 (IP tấn công ngoại vi)' },
                  { val: '192.168.1.10', label: '192.168.1.10 (Uptime Monitor)' },
                  { val: '10.0.0.1', label: '10.0.0.1 (Gateway máy chủ)' },
                ].map((opt) => (
                  <label
                    key={opt.val}
                    onClick={() => sound.playClick()}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all min-h-[46px] ${
                      q1Answer === opt.val
                        ? 'bg-red-950/50 border-red-500 text-white shadow-md shadow-red-950/50'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="q1"
                      value={opt.val}
                      checked={q1Answer === opt.val}
                      onChange={(e) => setQ1Answer(e.target.value)}
                      className="accent-red-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs sm:text-sm font-bold">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Question 2 */}
            <div className="p-4 rounded-xl border border-[#1e293b] bg-[#0f172a] space-y-2.5 shadow-sm">
              <div className="text-xs sm:text-sm font-bold text-white leading-snug">
                Câu 2: Cuộc tấn công vào file nào đã trả về mã HTTP 200 OK (Khai thác thành công)?
              </div>
              <div className="space-y-2 text-xs font-mono">
                {[
                  { val: '/view?file=../../../../etc/passwd', label: '/view?file=../../../../etc/passwd (Status 400)' },
                  { val: '/api/login?user=admin\'%20OR%20\'1\'=\'1', label: '/api/login?user=admin\'... (Status 500)' },
                  { val: '/uploads/shell.php?cmd=id', label: '/uploads/shell.php?cmd=id (Status 200 OK)' },
                  { val: '/robots.txt', label: '/robots.txt (Status 200 File tĩnh)' },
                ].map((opt) => (
                  <label
                    key={opt.val}
                    onClick={() => sound.playClick()}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all min-h-[46px] ${
                      q2Answer === opt.val
                        ? 'bg-red-950/50 border-red-500 text-white shadow-md shadow-red-950/50'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="q2"
                      value={opt.val}
                      checked={q2Answer === opt.val}
                      onChange={(e) => setQ2Answer(e.target.value)}
                      className="accent-red-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="truncate text-xs sm:text-sm font-bold">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Question 3 */}
            <div className="p-4 rounded-xl border border-[#1e293b] bg-[#0f172a] space-y-2.5 shadow-sm">
              <div className="text-xs sm:text-sm font-bold text-white leading-snug">
                Câu 3: Kẻ tấn công đã sử dụng công cụ gì trong giai đoạn quét dò đường (Dựa trên User-Agent)?
              </div>
              <div className="space-y-2 text-xs font-mono">
                {[
                  { val: 'Nikto/2.1.6', label: 'Nikto Web Scanner (Nikto/2.1.6)' },
                  { val: 'sqlmap/1.7', label: 'sqlmap Automated SQLi Tool' },
                  { val: 'Nmap', label: 'Nmap Scripting Engine' },
                  { val: 'PostmanRuntime', label: 'Postman API Client' },
                ].map((opt) => (
                  <label
                    key={opt.val}
                    onClick={() => sound.playClick()}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all min-h-[46px] ${
                      q3Answer === opt.val
                        ? 'bg-red-950/50 border-red-500 text-white shadow-md shadow-red-950/50'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="q3"
                      value={opt.val}
                      checked={q3Answer === opt.val}
                      onChange={(e) => setQ3Answer(e.target.value)}
                      className="accent-red-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs sm:text-sm font-bold">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={!q1Answer || !q2Answer || !q3Answer}
                className="flex-1 h-12 px-5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-40 text-white font-extrabold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-950/60 active:scale-[0.99]"
              >
                <Award className="w-4 h-4" />
                <span>Nộp Kết Quả Điều Tra & Chấm Điểm</span>
              </button>

              {quizSubmitted && (
                <button
                  type="button"
                  onClick={handleResetQuiz}
                  className="w-12 h-12 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 cursor-pointer shadow-sm"
                  title="Làm lại bài trắc nghiệm"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          {/* Detailed Pedagogical Feedback Panel */}
          {quizSubmitted && (
            <div className="p-4 sm:p-5 rounded-xl border border-slate-700 bg-[#0f172a] space-y-3.5 shadow-lg animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-xs sm:text-sm font-extrabold text-white">Báo Cáo Đánh Giá Điều Tra Viên</span>
                <span className="text-xs sm:text-sm font-mono font-extrabold text-emerald-400">
                  {quizScore}/100 ĐIỂM {quizScore === 100 && '🏆 XUẤT SẮC!'}
                </span>
              </div>

              {quizScore >= 67 && (
                <div className="p-3.5 rounded-xl bg-amber-950/50 border border-amber-500/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs sm:text-sm shadow-md">
                  <div className="flex items-center gap-2 text-amber-200 flex-wrap">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-bold">Mã cờ chiến thắng (CTF Flag):</span>
                    <code className="font-mono bg-black/80 px-2 py-1 rounded text-amber-300 font-extrabold select-all">
                      FLAG&#123;soc_analyst_apache_log_triage_2026&#125;
                    </code>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const flagText = 'FLAG{soc_analyst_apache_log_triage_2026}';
                      navigator.clipboard.writeText(flagText);
                      sound.playClick();
                      setCopiedFlag(flagText);
                      setTimeout(() => setCopiedFlag(null), 2000);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0"
                  >
                    {copiedFlag === 'FLAG{soc_analyst_apache_log_triage_2026}' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Đã sao chép cờ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Chạm để sao chép cờ</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed text-slate-200">
                <div className="p-3 rounded-xl bg-black/60 border border-slate-800 space-y-1">
                  <div className="font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Dấu vết 1 (IP Nguồn Tấn Công):</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Địa chỉ <strong className="text-red-300 font-mono font-bold">185.220.101.5</strong> liên tục gửi hàng loạt truy vấn thăm dò tài nguyên nhạy cảm (/robots.txt, /admin.php, /.env) và Directory Traversal trong thời gian cực ngắn.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-black/60 border border-slate-800 space-y-1">
                  <div className="font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Dấu vết 2 (Khai thác thành công 200 OK):</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300">
                    File <strong className="text-emerald-300 font-mono font-bold">/uploads/shell.php?cmd=id</strong> trả về mã 200 với 68 bytes dữ liệu. Đây là bằng chứng cho thấy kẻ tấn công đã tải thành công Web Shell lên thư mục upload và đang thực thi lệnh tùy ý!
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-black/60 border border-slate-800 space-y-1">
                  <div className="font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Dấu vết 3 (User-Agent Nhận Diện):</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Chuỗi <strong className="text-amber-300 font-mono font-bold">Mozilla/5.0 (Nikto/2.1.6)</strong> phản ánh công cụ rà quét lỗ hổng mã nguồn mở Nikto thường được tin tặc sử dụng trong bước Reconnaissance ban đầu.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
