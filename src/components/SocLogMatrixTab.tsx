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
    <div className="flex-1 w-full h-full min-h-0 overflow-hidden flex flex-col bg-[#09090b]">
      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden px-2.5 py-1.5 bg-[#121215] border-b border-[#27272a] flex items-center justify-between shrink-0">
        <div className="flex items-center p-0.5 bg-black border border-neutral-800 rounded-lg w-full">
          <button
            onClick={() => {
              sound.playClick();
              setMobileTab('logs');
            }}
            className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'logs'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>Apache Logs ({filteredLogs.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setMobileTab('analysis');
            }}
            className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'analysis'
                ? 'bg-purple-950/80 text-purple-200 border border-purple-600/50 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Điều Tra & Triage Quiz</span>
          </button>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0 overflow-hidden flex flex-col lg:flex-row">
        {/* LEFT PANE: Apache Access Log Stream & Field Breakdown (60% on desktop) */}
        <div
          className={`w-full lg:w-[60%] h-full flex flex-col border-r border-[#27272a] bg-[#0c0c0e] overflow-hidden ${
            mobileTab === 'logs' ? 'flex' : 'hidden lg:flex'
          }`}
        >
        {/* Stream Filter Header */}
        <div className="px-4 py-2.5 bg-[#121215] border-b border-[#27272a] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold text-neutral-100 uppercase tracking-wide">
              Nhật Ký Máy Chủ Web (Apache Access Log)
            </span>
            <span className="text-[10px] font-mono text-neutral-400 border border-neutral-800 rounded px-1.5 py-0.5">
              25 Records
            </span>
          </div>

          {/* Quick Status Filter */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-neutral-500 text-[10px]">HTTP Status:</span>
            {['ALL', '200', '40x', '500'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  sound.playClick();
                  setStatusFilter(st);
                }}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  statusFilter === st
                    ? 'bg-neutral-800 text-white font-bold border border-neutral-600'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Filter search bar */}
        <div className="px-4 py-1.5 bg-[#0e0e11] border-b border-[#27272a] flex items-center gap-2 shrink-0">
          <div className="flex-1 flex items-center bg-[#09090b] border border-neutral-800 rounded px-2.5 py-1 text-xs font-mono focus-within:border-red-500">
            <Search className="w-3.5 h-3.5 text-neutral-500 mr-2 shrink-0" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Lọc nhật ký: gõ IP, đường dẫn URL (/shell.php), hoặc User-Agent..."
              className="w-full bg-transparent outline-none text-neutral-200 text-xs"
            />
          </div>
        </div>

        {/* 25-Row Apache Log Table (Scrollable) */}
        <div className="flex-1 overflow-y-auto bg-[#09090b]">
          <table className="w-full text-left font-mono text-[11px] border-collapse select-none">
            <thead className="bg-[#121215] text-neutral-400 sticky top-0 border-b border-[#27272a] text-[10px] uppercase">
              <tr>
                <th className="py-2 px-3 w-10">#</th>
                <th className="py-2 px-3 w-32">Client IP</th>
                <th className="py-2 px-3 w-16">Method</th>
                <th className="py-2 px-3">Request Path (URI)</th>
                <th className="py-2 px-3 w-16 text-center">Status</th>
                <th className="py-2 px-3 w-16 text-right">Bytes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {filteredLogs.map((log) => {
                const isSelected = log.id === selectedLogId;

                return (
                  <tr
                    key={log.id}
                    onClick={() => handleSelectLog(log.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-950/70 text-blue-100 font-medium border-l-2 border-blue-500'
                        : log.isAttack
                        ? 'bg-red-950/20 text-neutral-200 hover:bg-red-950/40'
                        : 'hover:bg-neutral-900 text-neutral-300'
                    }`}
                  >
                    <td className="py-1.5 px-3 text-neutral-500">{log.id}</td>
                    <td className="py-1.5 px-3 truncate font-semibold">{log.ip}</td>
                    <td className="py-1.5 px-3">
                      <span
                        className={`text-[10px] font-bold ${
                          log.method === 'POST' ? 'text-amber-400' : 'text-blue-400'
                        }`}
                      >
                        {log.method}
                      </span>
                    </td>
                    <td className="py-1.5 px-3 truncate max-w-xs">
                      {log.path}
                    </td>
                    <td className="py-1.5 px-3 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${getStatusBadge(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-1.5 px-3 text-right tabular-nums text-neutral-400">
                      {log.bytes}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Selected Log Inspector Panel (Bottom of Left Column) */}
        <div className="h-44 border-t border-[#27272a] bg-[#101013] p-3 overflow-y-auto shrink-0 space-y-2 select-text font-mono text-xs">
          <div className="flex items-center justify-between text-neutral-400 border-b border-neutral-800 pb-1 text-[11px]">
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-bold text-neutral-200">
                Phân Tích Chi Tiết Dòng Log #{selectedLog.id}
              </span>
            </div>
            {selectedLog.isAttack && (
              <span className="text-[10px] font-bold text-red-400 bg-red-950/60 border border-red-800 px-2 py-0.5 rounded">
                ⚠️ Dấu vết tấn công: {selectedLog.attackType}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
            <div className="p-1.5 bg-black/40 rounded border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">Địa chỉ IP</span>
              <span className="text-neutral-200 font-bold">{selectedLog.ip}</span>
            </div>
            <div className="p-1.5 bg-black/40 rounded border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">Thời gian</span>
              <span className="text-neutral-200 truncate block">{selectedLog.timestamp}</span>
            </div>
            <div className="p-1.5 bg-black/40 rounded border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">HTTP Method & Status</span>
              <span className="text-neutral-200 font-bold">
                {selectedLog.method} ➔ {selectedLog.status}
              </span>
            </div>
            <div className="p-1.5 bg-black/40 rounded border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">Dung lượng trả về</span>
              <span className="text-neutral-200 font-bold">{selectedLog.bytes} Bytes</span>
            </div>
          </div>

          <div className="p-2 rounded bg-black/60 border border-neutral-800 text-[11px]">
            <span className="text-[10px] text-neutral-500 block">User-Agent Header:</span>
            <code className="text-neutral-300 break-all">{selectedLog.userAgent}</code>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Incident Triage Mini-Quiz Arena (40% on desktop) */}
      <div
        className={`w-full lg:w-[40%] h-full flex flex-col bg-[#08080a] overflow-y-auto p-4 space-y-4 ${
          mobileTab === 'analysis' ? 'flex' : 'hidden lg:flex'
        }`}
      >
        {/* Quiz Intro Card */}
        <div className="p-3.5 rounded-lg border border-[#27272a] bg-[#121215]">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-100 uppercase tracking-wide mb-1">
            <Radio className="w-4 h-4 text-amber-400" />
            <span>Đấu Trường Điều Tra Sự Cố (SOC Triage Quiz)</span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Hãy phân tích 25 dòng nhật ký máy chủ Apache ở khung bên trái để trả lời 3 câu hỏi điều tra nghiệp vụ dưới đây.
          </p>
        </div>

        {/* Quiz Form */}
        <form onSubmit={handleSubmitQuiz} className="space-y-4">
          {/* Question 1 */}
          <div className="p-3.5 rounded-lg border border-neutral-800 bg-[#101013] space-y-2">
            <div className="text-xs font-bold text-neutral-200">
              Câu 1: Địa chỉ IP nào đã thực hiện hành vi quét cổng & fuzzing URL bất thường?
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              {[
                { val: '192.168.1.50', label: '192.168.1.50 (User nội bộ)' },
                { val: '185.220.101.5', label: '185.220.101.5 (IP tấn công ngoại vi)' },
                { val: '192.168.1.10', label: '192.168.1.10 (Uptime Monitor)' },
                { val: '10.0.0.1', label: '10.0.0.1 (Gateway máy chủ)' },
              ].map((opt) => (
                <label
                  key={opt.val}
                  onClick={() => sound.playClick()}
                  className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                    q1Answer === opt.val
                      ? 'bg-neutral-800 border-neutral-600 text-white'
                      : 'bg-black/30 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="q1"
                    value={opt.val}
                    checked={q1Answer === opt.val}
                    onChange={(e) => setQ1Answer(e.target.value)}
                    className="accent-red-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Question 2 */}
          <div className="p-3.5 rounded-lg border border-neutral-800 bg-[#101013] space-y-2">
            <div className="text-xs font-bold text-neutral-200">
              Câu 2: Cuộc tấn công vào file nào đã trả về mã HTTP 200 OK (Khai thác thành công)?
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              {[
                { val: '/view?file=../../../../etc/passwd', label: '/view?file=../../../../etc/passwd (Status 400)' },
                { val: '/api/login?user=admin\'%20OR%20\'1\'=\'1', label: '/api/login?user=admin\'... (Status 500)' },
                { val: '/uploads/shell.php?cmd=id', label: '/uploads/shell.php?cmd=id (Status 200 OK)' },
                { val: '/robots.txt', label: '/robots.txt (Status 200 File tĩnh)' },
              ].map((opt) => (
                <label
                  key={opt.val}
                  onClick={() => sound.playClick()}
                  className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                    q2Answer === opt.val
                      ? 'bg-neutral-800 border-neutral-600 text-white'
                      : 'bg-black/30 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="q2"
                    value={opt.val}
                    checked={q2Answer === opt.val}
                    onChange={(e) => setQ2Answer(e.target.value)}
                    className="accent-red-500"
                  />
                  <span className="truncate">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Question 3 */}
          <div className="p-3.5 rounded-lg border border-neutral-800 bg-[#101013] space-y-2">
            <div className="text-xs font-bold text-neutral-200">
              Câu 3: Kẻ tấn công đã sử dụng công cụ gì trong giai đoạn quét dò đường (Dựa trên User-Agent)?
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              {[
                { val: 'Nikto/2.1.6', label: 'Nikto Web Vulnerability Scanner (Nikto/2.1.6)' },
                { val: 'sqlmap/1.7', label: 'sqlmap Automatic SQL Injection Tool' },
                { val: 'Nmap', label: 'Nmap Scripting Engine' },
                { val: 'PostmanRuntime', label: 'Postman API Client' },
              ].map((opt) => (
                <label
                  key={opt.val}
                  onClick={() => sound.playClick()}
                  className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                    q3Answer === opt.val
                      ? 'bg-neutral-800 border-neutral-600 text-white'
                      : 'bg-black/30 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="q3"
                    value={opt.val}
                    checked={q3Answer === opt.val}
                    onChange={(e) => setQ3Answer(e.target.value)}
                    className="accent-red-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={!q1Answer || !q2Answer || !q3Answer}
              className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold rounded text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Award className="w-4 h-4" />
              <span>Nộp Kết Quả Điều Tra & Chấm Điểm</span>
            </button>

            {quizSubmitted && (
              <button
                type="button"
                onClick={handleResetQuiz}
                className="p-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-neutral-700"
                title="Làm lại bài trắc nghiệm"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        {/* Detailed Pedagogical Feedback Panel */}
        {quizSubmitted && (
          <div className="p-4 rounded-lg border border-neutral-700 bg-[#121215] space-y-3 animate-fade-in">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-xs font-bold text-neutral-200">Báo Cáo Đánh Giá Điều Tra Viên</span>
              <span className="text-xs font-mono font-extrabold text-emerald-400">
                {quizScore}/100 ĐIỂM {quizScore === 100 && '🏆 XUẤT SẮC!'}
              </span>
            </div>

            <div className="space-y-2 text-xs leading-relaxed text-neutral-300">
              <div className="p-2 rounded bg-black/40 border border-neutral-800 space-y-1">
                <div className="font-semibold text-neutral-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Dấu vết 1 (IP Nguồn):</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Địa chỉ <strong className="text-red-300 font-mono">185.220.101.5</strong> liên tục gửi hàng loạt truy vấn thăm dò tài nguyên nhạy cảm (/robots.txt, /admin.php, /.env) và Directory Traversal trong thời gian cực ngắn.
                </p>
              </div>

              <div className="p-2 rounded bg-black/40 border border-neutral-800 space-y-1">
                <div className="font-semibold text-neutral-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Dấu vết 2 (Khai thác thành công 200 OK):</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  File <strong className="text-emerald-300 font-mono">/uploads/shell.php?cmd=id</strong> trả về mã 200 với 68 bytes dữ liệu. Đây là bằng chứng không thể chối cãi cho thấy kẻ tấn công đã tải thành công Web Shell lên thư mục upload và đang thực thi lệnh tùy ý!
                </p>
              </div>

              <div className="p-2 rounded bg-black/40 border border-neutral-800 space-y-1">
                <div className="font-semibold text-neutral-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Dấu vết 3 (User-Agent Nhận Diện):</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Chuỗi <strong className="text-amber-300 font-mono">Mozilla/5.0 (Nikto/2.1.6)</strong> phản ánh công cụ rà quét lỗ hổng mã nguồn mở Nikto thường được tin tặc sử dụng trong bước Reconnaissance ban đầu.
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
