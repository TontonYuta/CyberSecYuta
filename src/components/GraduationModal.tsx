import React, { useState } from 'react';
import { sound } from '../utils/audio';
import {
  Award,
  X,
  Download,
  Printer,
  Shield,
  CheckCircle2,
  FileText,
  User,
  Calendar,
  Hash,
  ExternalLink,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface GraduationModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedLessonsCount: number;
}

export const GraduationModal: React.FC<GraduationModalProps> = ({
  isOpen,
  onClose,
  completedLessonsCount,
}) => {
  const [studentName, setStudentName] = useState<string>('Nguyễn Văn An');
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'cert' | 'portfolio' | 'skills'>('cert');

  if (!isOpen) return null;

  const issueDate = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const certId = 'CERT-CYBERSEC-2026-89AF39';

  const verifiedWriteups = [
    {
      title: '01. SQL Injection Authentication Bypass & UNION Data Extraction',
      cwe: 'CWE-89 / OWASP A03:2021',
      summary: 'Khai thác lỗi nối chuỗi f-string trong auth_service.py bằng payload "admin\' --" và khắc phục bằng Prepared Statements.',
    },
    {
      title: '02. OS Command Injection (RCE) via Ping Diagnostic Utility',
      cwe: 'CWE-78 / OWASP A03:2021',
      summary: 'Lợi dụng dấu chấm phẩy shell trong diagnostic_service.py để thực thi whoami; phòng chống bằng subprocess array args và regex.',
    },
    {
      title: '03. Insecure Direct Object References (IDOR) in Healthcare Portal',
      cwe: 'CWE-639 / OWASP A01:2021',
      summary: 'Đột nhập hồ sơ bệnh án qua tham số ?id=1002 và vá lỗi bằng cơ chế đối chiếu quyền sở hữu server-side session.',
    },
    {
      title: '04. Reflected Cross-Site Scripting (XSS) Session Cookie Theft',
      cwe: 'CWE-79 / OWASP A03:2021',
      summary: 'Chèn script vào ô tìm kiếm Helpdesk để đọc document.cookie; phòng vệ bằng HTML Entity Encoding và HttpOnly cookies.',
    },
    {
      title: '05. Linux Local Privilege Escalation via GTFOBins Sudo Find',
      cwe: 'CWE-250 / GTFOBins',
      summary: 'Khai thác đặc quyền find NOPASSWD để spawn root shell EUID=0 và khắc phục cấu hình trong file /etc/sudoers.',
    },
  ];

  const handleExportMarkdownPortfolio = () => {
    sound.playSuccess();
    const mdContent = `# HỒ SƠ ỨNG VIÊN KỸ SƯ AN NINH MẠNG (CYBERSECURITY PORTFOLIO)

**Ứng Viên:** ${studentName}  
**Chứng Chỉ:** CyberSec Practical Security Engineer (Level 1)  
**Mã Xác Thực:** ${certId}  
**Ngày Cấp:** ${issueDate}  
**Đơn Vị Đào Tạo:** CyberSec Academy — Lộ Trình 12 Bài Thực Chiến Chuẩn Nghề  

---

## I. TỔNG QUAN NĂNG LỰC ĐÁNH GIÁ (SKILL MATRIX)
- **Linux Systems & Privilege Escalation:** 90% (Thành thạo CLI, Quản trị phân quyền tệp, GTFOBins, Sudoers audit)
- **Network Protocol & Packet Analysis:** 85% (Wireshark Display Filters, TCP 3-Way Handshake, TCP Stream Reassembly)
- **Web Application Security (OWASP Top 10):** 95% (SQLi, Command Injection, IDOR, XSS, File Upload, Prepared Statements)
- **Incident Response & SOC Triage:** 85% (Phân tích Apache Access Log, nhận diện rà quét Nikto, phát hiện Web Shell 200 OK)

---

## II. DANH MỤC 5 BÁO CÁO LỖ HỔNG THỰC CHIẾN (VERIFIED WRITEUPS)

### 1. SQL Injection Authentication Bypass (CWE-89)
- **Nguyên nhân:** Mã nguồn Python nối chuỗi f-string vào truy vấn SQLite mà không tham số hóa.
- **Khai thác:** Gửi payload \`admin' --\` vô hiệu hóa mệnh đề kiểm tra mật khẩu.
- **Biện pháp:** Áp dụng Prepared Statement \`cursor.execute("SELECT ... WHERE user = ?", (username,))\`.

### 2. OS Command Injection (CWE-78)
- **Nguyên nhân:** Hàm chẩn đoán mạng gọi \`subprocess.Popen(..., shell=True)\`.
- **Khai thác:** Chèn ký tự phân tách lệnh \`127.0.0.1; whoami\` để thực thi mã từ xa.
- **Biện pháp:** Tắt \`shell=False\`, truyền tham số dưới dạng danh sách mảng và kiểm tra whitelist IP.

### 3. Insecure Direct Object References - IDOR (CWE-639)
- **Nguyên nhân:** Máy chủ tin tưởng tham số \`?id=...\` mà không xác minh phiên đăng nhập.
- **Khai thác:** Sửa đổi ID từ 1001 thành 1002 hoặc 9999 để đọc trộm hồ sơ bệnh án Giám đốc.
- **Biện pháp:** Ràng buộc quyền sở hữu ở backend: \`WHERE id = ? AND owner_id = session.user_id\`.

### 4. Cross-Site Scripting - XSS (CWE-79)
- **Nguyên nhân:** In thô dữ liệu tìm kiếm bằng cú pháp EJS \`<%- %>\`.
- **Khai thác:** Gửi payload \`<script>alert(document.cookie)</script>\` đọc trộm session.
- **Biện pháp:** Áp dụng HTML Entity Encoding và thiết lập cờ \`HttpOnly; Secure; SameSite=Strict\`.

### 5. Linux Local Privilege Escalation (GTFOBins)
- **Nguyên nhân:** Cấu hình \`/etc/sudoers\` cấp quyền NOPASSWD cho nhị phân \`/usr/bin/find\`.
- **Khai thác:** Thực thi \`sudo find . -exec /bin/sh \\;\` spawn root shell EUID=0.
- **Biện pháp:** Xóa bỏ đặc quyền NOPASSWD, tuân thủ nguyên tắc đặc quyền tối thiểu (Least Privilege).

---
*Tài liệu được trích xuất trực tiếp từ CyberSec Academy Verified Portfolio.*
`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CyberSec_Portfolio_${studentName.replace(/\s+/g, '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-2.5 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header Bar */}
        <div className="px-4 sm:px-5 py-3.5 bg-[#0e1628] border-b border-slate-800 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-950/90 border border-emerald-500/60 flex items-center justify-center text-emerald-400 shrink-0 shadow-sm">
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
                Hồ Sơ Tốt Nghiệp & Chứng Chỉ Nghề
                <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/60 px-2 py-0.5 rounded-md font-bold hidden sm:inline">
                  JOB-READY
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-3 sm:px-5 py-2.5 bg-[#090f1d] border-b border-slate-800 text-xs font-mono shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('cert');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer text-xs font-bold ${
              activeTab === 'cert'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-600'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Award className="w-4 h-4 text-emerald-400" />
            <span>1. Chứng Chỉ</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('skills');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer text-xs font-bold ${
              activeTab === 'skills'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-600'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span>2. Radar Năng Lực</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('portfolio');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer text-xs font-bold ${
              activeTab === 'portfolio'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-600'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>3. Bộ Báo Cáo</span>
          </button>
        </div>

        {/* Modal Body Viewport */}
        <div className="flex-1 p-3.5 sm:p-5 overflow-y-auto space-y-4">
          {/* TAB 1: CERTIFICATE VIEW */}
          {activeTab === 'cert' && (
            <div className="space-y-4">
              {/* Student Name Quick Editor */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs gap-2">
                <div className="flex items-center gap-2 text-slate-200">
                  <User className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-bold">Họ tên trên chứng chỉ:</span>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="h-9 px-3 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold focus:outline-none focus:border-emerald-500 text-xs sm:text-sm"
                    placeholder="Nhập họ và tên của bạn..."
                  />
                </div>
                <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                  Tên sẽ cập nhật trực tiếp trên chứng chỉ bên dưới
                </span>
              </div>

              {/* Classic CyberSec Certificate Design */}
              <div className="relative p-4 sm:p-8 rounded-xl bg-gradient-to-br from-[#0a0a0d] via-[#111116] to-[#0a0a0d] border-2 border-emerald-600/40 shadow-2xl text-center space-y-4 sm:space-y-5 overflow-hidden">
                {/* Background watermark seal */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                  <Shield className="w-72 sm:w-96 h-72 sm:h-96 text-emerald-500" />
                </div>

                {/* Top Badge */}
                <div className="flex items-center justify-center gap-2">
                  <Shield className="w-5 sm:w-6 h-5 sm:h-6 text-emerald-400" />
                  <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-emerald-400 font-bold">
                    CYBERSEC ACADEMY · PROFESSIONAL CREDENTIAL
                  </span>
                </div>

                {/* Main Heading */}
                <div>
                  <h2 className="text-lg sm:text-2xl font-extrabold tracking-tight text-white uppercase font-sans">
                    CHỨNG CHỈ TỐT NGHIỆP KỸ SƯ AN NINH MẠNG THỰC HÀNH
                  </h2>
                  <p className="text-[11px] sm:text-xs font-mono text-neutral-400 mt-1">
                    PRACTICAL CYBERSECURITY ENGINEER — JOB-READY ACCREDITATION
                  </p>
                </div>

                {/* Recipient */}
                <div className="py-1 sm:py-2">
                  <div className="text-[11px] sm:text-xs text-neutral-400 uppercase tracking-wider">Chứng nhận cấp cho:</div>
                  <div className="text-xl sm:text-3xl font-extrabold text-emerald-300 tracking-tight font-serif mt-1">
                    {studentName || 'Học Viên Xuất Sắc'}
                  </div>
                </div>

                {/* Statement of Accomplishment */}
                <p className="max-w-xl mx-auto text-[11px] sm:text-xs text-neutral-300 leading-relaxed">
                  Đã hoàn thành xuất sắc toàn bộ <strong>12 bài thực hành chuyên sâu</strong> trong lộ trình tuyến tính: Dòng lệnh Linux CLI, Phân quyền SUID, Phân tích gói tin Wireshark & TCP Handshake, Khai thác & Phòng thủ OWASP Top 10 (SQLi, RCE, IDOR, XSS), Phân tích Log điều tra sự cố SOC và Soạn thảo Báo cáo Kỹ thuật chuẩn mực.
                </p>

                {/* Verification Footer (Seal, Hash, Date) */}
                <div className="pt-4 border-t border-neutral-800 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center text-xs font-mono text-neutral-400">
                  <div className="text-center sm:text-left space-y-0.5">
                    <div className="text-[10px] text-neutral-500">MÃ XÁC THỰC CREDENTIAL:</div>
                    <div className="text-neutral-200 font-bold">{certId}</div>
                  </div>

                  {/* Stamp / Red Seal */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-full border-2 border-emerald-500/80 bg-emerald-950/40 flex flex-col items-center justify-center text-[7px] sm:text-[8px] font-extrabold text-emerald-300 tracking-tighter uppercase shadow-lg select-none">
                      <span>CYBERSEC</span>
                      <Shield className="w-3.5 sm:w-4 h-3.5 sm:h-4 my-0.5 text-emerald-400" />
                      <span>VERIFIED</span>
                    </div>
                  </div>

                  <div className="text-center sm:text-right space-y-0.5">
                    <div className="text-[10px] text-neutral-500">NGÀY CẤP CHỨNG CHỈ:</div>
                    <div className="text-neutral-200 font-bold">{issueDate}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RADAR CHART (BIỂU ĐỒ MẠNG NHỆN NĂNG LỰC) */}
          {activeTab === 'skills' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              {/* Radar Chart SVG */}
              <div className="p-4 rounded-xl bg-black/60 border border-neutral-800 flex flex-col items-center justify-center">
                <div className="text-xs font-bold text-neutral-200 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Biểu Đồ Radar Đánh Giá 4 Trụ Cột Năng Lực</span>
                </div>

                <svg viewBox="0 0 320 280" className="w-full max-w-[280px] h-auto overflow-visible">
                  {/* Background polygon rings (25%, 50%, 75%, 100%) */}
                  {[0.25, 0.5, 0.75, 1.0].map((scale) => {
                    const cx = 160;
                    const cy = 140;
                    const r = 90 * scale;
                    const pts = `${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`;
                    return (
                      <polygon
                        key={scale}
                        points={pts}
                        fill="none"
                        stroke="#27272a"
                        strokeWidth="1"
                        strokeDasharray={scale === 1 ? 'none' : '3,3'}
                      />
                    );
                  })}

                  {/* Axis lines */}
                  <line x1="160" y1="50" x2="160" y2="230" stroke="#3f3f46" strokeWidth="1" />
                  <line x1="70" y1="140" x2="250" y2="140" stroke="#3f3f46" strokeWidth="1" />

                  {/* Filled data polygon */}
                  {/*
                    North (Linux): 90% -> cy - 90*0.9 = 140 - 81 = 59
                    East (Network): 85% -> cx + 90*0.85 = 160 + 76.5 = 236.5
                    South (Web AppSec): 95% -> cy + 90*0.95 = 140 + 85.5 = 225.5
                    West (Incident Response): 85% -> cx - 90*0.85 = 160 - 76.5 = 83.5
                  */}
                  <polygon
                    points="160,59 236.5,140 160,225.5 83.5,140"
                    fill="rgba(16, 185, 129, 0.25)"
                    stroke="#10b981"
                    strokeWidth="2.5"
                  />

                  {/* Point circles */}
                  <circle cx="160" cy="59" r="4" fill="#10b981" />
                  <circle cx="236.5" cy="140" r="4" fill="#10b981" />
                  <circle cx="160" cy="225.5" r="4" fill="#10b981" />
                  <circle cx="83.5" cy="140" r="4" fill="#10b981" />

                  {/* Labels */}
                  <text x="160" y="38" textAnchor="middle" fill="#f4f4f5" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    Linux Systems (90%)
                  </text>
                  <text x="256" y="143" textAnchor="start" fill="#f4f4f5" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    Network (85%)
                  </text>
                  <text x="160" y="246" textAnchor="middle" fill="#f4f4f5" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    Web AppSec (95%)
                  </text>
                  <text x="64" y="143" textAnchor="end" fill="#f4f4f5" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    SOC Triage (85%)
                  </text>
                </svg>
              </div>

              {/* Pillar Details Breakdown */}
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-lg bg-[#141418] border border-neutral-800 space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-emerald-400">1. Linux Systems & PrivEsc (90%)</span>
                    <span className="text-neutral-400 font-mono">18/20 điểm</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Làm chủ môi trường dòng lệnh Linux CLI, phân quyền tệp tin rwx, bit SUID, kiểm toán phân quyền sudoers và kỹ thuật leo quyền GTFOBins.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#141418] border border-neutral-800 space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-blue-400">2. Network Analysis & Packets (85%)</span>
                    <span className="text-neutral-400 font-mono">17/20 điểm</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Phân tích mổ xẻ 5 tầng gói tin Wireshark, cơ chế bắt tay 3 bước TCP Handshake, tái tạo luồng dữ liệu TCP Stream và giải mã HTTP plaintext.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#141418] border border-neutral-800 space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-amber-400">3. Web Application Security (95%)</span>
                    <span className="text-neutral-400 font-mono">19/20 điểm</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Thực hành khai thác và vá triệt để các lỗ hổng OWASP Top 10 nguy hiểm: SQL Injection, OS Command Injection RCE, IDOR và Reflected XSS.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#141418] border border-neutral-800 space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-purple-400">4. Incident Response & SOC (85%)</span>
                    <span className="text-neutral-400 font-mono">17/20 điểm</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Đọc hiểu nhật ký máy chủ Apache Access Log, nhận diện mẫu rà quét Nikto, phát hiện Web Shell 200 OK và xử lý theo quy trình NIST IR.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VERIFIED WRITEUPS PORTFOLIO */}
          {activeTab === 'portfolio' && (
            <div className="space-y-3">
              <div className="p-3 rounded bg-amber-950/30 border border-amber-500/40 text-xs text-amber-200">
                <strong>Hồ sơ tuyển dụng thực chiến:</strong> 5 báo cáo dưới đây đã được kiểm chứng qua các bài thực hành trực tiếp trên app. Học viên có thể tải về file Markdown hoặc in kèm chứng chỉ để nộp cho nhà tuyển dụng!
              </div>

              <div className="space-y-2">
                {verifiedWriteups.map((w, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-black/40 border border-neutral-800 space-y-1 hover:border-neutral-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-100">{w.title}</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">
                        {w.cwe}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">{w.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="px-4 sm:px-5 py-3.5 bg-[#0e1628] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-sm">
          <div className="text-xs font-mono text-slate-300">
            Tiến độ: <strong className="text-emerald-400 font-bold">{completedLessonsCount}/12 Bài Học</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="h-10 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm font-bold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>In PDF</span>
            </button>

            <button
              onClick={handleExportMarkdownPortfolio}
              className="h-10 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-950/60 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Tải Báo Cáo Markdown (.MD) Đính Kèm CV</span>
              <span className="sm:hidden">Tải Markdown (.MD)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
