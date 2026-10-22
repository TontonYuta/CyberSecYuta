import React, { useState, useEffect } from 'react';
import { sound } from '../utils/audio';
import {
  Compass,
  CheckCircle2,
  Circle,
  BookOpen,
  Award,
  Download,
  Copy,
  Sparkles,
  FileText,
  RotateCcw,
  Zap,
  Check,
} from 'lucide-react';

interface StageSkill {
  id: string;
  name: string;
  desc: string;
}

interface RoadmapStage {
  id: string;
  stageName: string;
  timeframe: string;
  badge: string;
  skills: StageSkill[];
}

const ROADMAP_STAGES: RoadmapStage[] = [
  {
    id: 'stage-1',
    stageName: 'Giai Đoạn 1: Nền Tảng (Networking & Linux Fundamentals)',
    timeframe: 'Tuần 1 - Tuần 4',
    badge: 'FOUNDATION',
    skills: [
      { id: 's1-osi', name: 'Mô hình mạng OSI 7 tầng & TCP/IP 4 tầng', desc: 'Hiểu cấu trúc gói tin, encapsulation và decapsulation' },
      { id: 's1-handshake', name: 'TCP 3-Way Handshake & Flag Bits (SYN, ACK, FIN, RST)', desc: 'Tính toán Sequence và Acknowledgment number trong luồng dữ liệu' },
      { id: 's1-wireshark', name: 'Bắt và phân tích gói tin với Wireshark / tcpdump', desc: 'Lọc gói tin bằng display filters: ip.addr, tcp.flags, http.request' },
      { id: 's1-linux-perm', name: 'Quản trị phân quyền Linux (chmod, chown, SUID/SGID)', desc: 'Cấu trúc /etc/passwd, /etc/shadow và cơ chế thực thi tiến trình' },
      { id: 's1-bash-script', name: 'Bash Scripting & Tự động hóa phân tích log', desc: 'Sử dụng awk, sed, grep, cut để trích xuất các dấu hiệu bất thường' },
    ],
  },
  {
    id: 'stage-2',
    stageName: 'Giai Đoạn 2: Khai Thác (Web App Pentest & OWASP Top 10)',
    timeframe: 'Tuần 5 - Tuần 8',
    badge: 'EXPLOITATION',
    skills: [
      { id: 's2-sqli', name: 'SQL Injection (Auth Bypass, UNION Attack, Blind SQLi)', desc: 'Khai thác chuỗi f-string chưa lọc và phòng chống bằng Prepared Statement' },
      { id: 's2-rce', name: 'OS Command Injection (RCE)', desc: 'Khai thác dấu chấm phẩy shell (;) và vá lỗi bằng subprocess array args' },
      { id: 's2-idor', name: 'IDOR & Broken Object Level Authorization (BOLA)', desc: 'Tấn công tham số URL query (?id=) và khắc phục qua server session ownership' },
      { id: 's2-xss', name: 'Cross-Site Scripting (Reflected & Stored XSS)', desc: 'Đánh cắp Cookie phiên và thiết lập cờ HttpOnly, SameSite, CSP header' },
      { id: 's2-upload', name: 'Unrestricted Web Shell Upload', desc: 'Vượt qua bộ lọc đuôi file tải mã độc và chặn thực thi trong thư mục /uploads' },
    ],
  },
  {
    id: 'stage-3',
    stageName: 'Giai Đoạn 3: Leo Quyền & Phòng Thủ (PrivEsc, AD & SOC Matrix)',
    timeframe: 'Tuần 9 - Tuần 12',
    badge: 'MASTERY',
    skills: [
      { id: 's3-gtfobins', name: 'Linux Privilege Escalation qua GTFOBins & Sudo NOPASSWD', desc: 'Lợi dụng find, vim, python, awk có quyền root để spawn interactive shell' },
      { id: 's3-suid', name: 'Tìm kiếm & Khai thác các file nhị phân SUID bất thường', desc: 'Lệnh find / -perm -u=s -type f 2>/dev/null để nhận diện vector leo quyền' },
      { id: 's3-siem', name: 'Phân tích nhật ký SIEM / Apache Access Log Triage', desc: 'Phát hiện các mẫu quét Nikto, SQLi error và dấu vết Web Shell 200 OK' },
      { id: 's3-mitre', name: 'Ánh xạ chiến thuật MITRE ATT&CK Matrix & NIST IR Framework', desc: 'Quy trình 6 bước ứng phó sự cố: Phân loại, Cô lập host, Thu hồi token' },
      { id: 's3-writeup', name: 'Soạn thảo Báo cáo Kiểm thử Xâm nhập (Pentest Writeup)', desc: 'Trình bày rõ ràng Root Cause, Exploit Chain và Biện pháp khắc phục' },
    ],
  },
];

const WRITEUP_TEMPLATES = {
  sqli: {
    title: 'Báo Cáo: SQL Injection Authentication Bypass trên Cổng ACME Portal',
    vulnerability: 'SQL Injection trong API Xác Thực Người Dùng (CWE-89 / OWASP A03:2021)',
    rootCause: `Hàm xác thực authenticate_user() trong backend/auth_service.py sử dụng cú pháp f-string nối trực tiếp biến người dùng:
query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
Do không sử dụng Prepared Statement, ký tự nháy đơn (') do người dùng nhập vào đã làm thay đổi cấu trúc câu lệnh SQL.`,
    exploitChain: `1. Kẻ tấn công gửi payload: admin' -- vào trường username với mật khẩu bất kỳ.
2. Câu lệnh được máy chủ phân tích thành: SELECT * FROM users WHERE username = 'admin' -- ...
3. Dấu -- đã vô hiệu hóa toàn bộ mệnh đề kiểm tra mật khẩu.
4. Cơ sở dữ liệu trả về bản ghi của tài khoản admin, hệ thống cấp phát phiên quản trị viên SUPERADMIN.`,
    remediation: `1. Sử dụng Parameterized Queries (Prepared Statements) tuyệt đối:
   cursor.execute("SELECT * FROM users WHERE username = ? AND password_hash = ?", (username, hash))
2. Băm mật khẩu bằng thuật toán an toàn như bcrypt hoặc Argon2id.
3. Cấu hình WAF để nhận diện và ngăn chặn các từ khóa SQL độc hại.`,
  },
  rce: {
    title: 'Báo Cáo: OS Command Injection trong Tiện Ích Chẩn Đoán Mạng',
    vulnerability: 'OS Command Injection via Shell Metacharacters (CWE-78 / OWASP A03:2021)',
    rootCause: `Hàm run_network_diagnostic() gọi subprocess.Popen(f"ping -c 2 {host}", shell=True).
Việc bật cờ shell=True cho phép shell Linux thông dịch các ký tự phân tách lệnh như dấu chấm phẩy (;), pipe (|), and (&&).`,
    exploitChain: `1. Kẻ tấn công nhập vào địa chỉ đích: 127.0.0.1; cat /etc/passwd
2. Hệ điều hành thực thi 2 lệnh tuần tự: đầu tiên ping 127.0.0.1, sau đó đọc nội dung file /etc/passwd.
3. Kẻ tấn công trích xuất danh sách tài khoản hệ thống và chuẩn bị bước leo quyền.`,
    remediation: `1. Tuyệt đối không bật shell=True. Truyền đối số dưới dạng danh sách (Array Arguments):
   subprocess.run(["ping", "-c", "2", host], shell=False)
2. Xác thực chặt chẽ đầu vào chỉ chấp nhận địa chỉ IP hợp chuẩn bằng thư viện ipaddress của Python.`,
  },
  privesc: {
    title: 'Báo Cáo: Leo Thang Đặc Quyền Linux qua GTFOBins Sudo Find',
    vulnerability: 'Sudoers Misconfiguration / Insecure Sudo Privilege (CWE-250 / GTFOBins)',
    rootCause: `Tệp cấu hình /etc/sudoers cấp đặc quyền NOPASSWD cho người dùng www-data đối với nhị phân find:
(ALL : ALL) NOPASSWD: /usr/bin/find
Quản trị viên không nhận thức được rằng find hỗ trợ tham số -exec cho phép chạy các lệnh ngoại vi.`,
    exploitChain: `1. Từ phiên shell www-data, kiểm tra sudo -l phát hiện find NOPASSWD.
2. Thực thi lệnh: sudo find . -exec /bin/sh \\;
3. Nhị phân find khởi chạy tiến trình con /bin/sh với EUID=0 (root).
4. Kẻ tấn công giành toàn bộ quyền kiểm soát máy chủ và đọc cờ /root/flag.txt.`,
    remediation: `1. Xóa bỏ đặc quyền NOPASSWD cho find trong /etc/sudoers.
2. Áp dụng nguyên tắc đặc quyền tối thiểu (Least Privilege).
3. Sử dụng công cụ kiểm toán LinPEAS định kỳ để rà quét các tệp nhị phân có nguy cơ GTFOBins.`,
  },
};

export const RoadmapTab: React.FC = () => {
  // Saved checked skills state in localStorage
  const [completedSkills, setCompletedSkills] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('cybersec_roadmap_skills');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    // Default initial checked items
    return {
      's1-osi': true,
      's1-handshake': true,
      's2-sqli': true,
      's2-rce': true,
      's3-gtfobins': true,
    };
  });

  // Writeup Studio fields
  const [reportTitle, setReportTitle] = useState<string>(WRITEUP_TEMPLATES.sqli.title);
  const [vulnerabilityName, setVulnerabilityName] = useState<string>(WRITEUP_TEMPLATES.sqli.vulnerability);
  const [rootCause, setRootCause] = useState<string>(WRITEUP_TEMPLATES.sqli.rootCause);
  const [exploitChain, setExploitChain] = useState<string>(WRITEUP_TEMPLATES.sqli.exploitChain);
  const [remediation, setRemediation] = useState<string>(WRITEUP_TEMPLATES.sqli.remediation);
  const [copiedStatus, setCopiedStatus] = useState<boolean>(false);
  const [showWriteupFlag, setShowWriteupFlag] = useState<boolean>(false);
  const [copiedFlag, setCopiedFlag] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'roadmap' | 'writeup'>('roadmap');

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cybersec_roadmap_skills', JSON.stringify(completedSkills));
    } catch {
      // Ignore
    }
  }, [completedSkills]);

  const handleToggleSkill = (skillId: string) => {
    sound.playClick();
    setCompletedSkills((prev) => ({
      ...prev,
      [skillId]: !prev[skillId],
    }));
  };

  // Compute total skills & percentage
  const totalSkillsCount = ROADMAP_STAGES.reduce((acc, stage) => acc + stage.skills.length, 0);
  const completedCount = Object.values(completedSkills).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / totalSkillsCount) * 100);

  const handleApplyTemplate = (type: 'sqli' | 'rce' | 'privesc') => {
    sound.playClick();
    const tpl = WRITEUP_TEMPLATES[type];
    setReportTitle(tpl.title);
    setVulnerabilityName(tpl.vulnerability);
    setRootCause(tpl.rootCause);
    setExploitChain(tpl.exploitChain);
    setRemediation(tpl.remediation);
  };

  const generateMarkdown = () => {
    return `# ${reportTitle}
**Lỗ Hổng:** ${vulnerabilityName}
**Ngày Báo Cáo:** ${new Date().toLocaleDateString('vi-VN')}
**Điều Tra Viên / Pentester:** Security Engineer
**Hệ Thống:** CyberSec Studio Hands-on Lab

---

## 1. Nguyên Nhân Cốt Lõi (Root Cause & Vulnerability Identification)
${rootCause}

---

## 2. Chuỗi Khai Thác (Exploit Chain & Proof of Concept)
${exploitChain}

---

## 3. Biện Pháp Khắc Phục (Remediation & Defense-in-Depth)
${remediation}

---
*Báo cáo được xuất tự động từ CyberSec Studio - Feynman Writeup Studio.*
`;
  };

  const handleCopyMarkdown = () => {
    sound.playSuccess();
    navigator.clipboard.writeText(generateMarkdown());
    setCopiedStatus(true);
    setShowWriteupFlag(true);
    setTimeout(() => setCopiedStatus(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    sound.playSuccess();
    setShowWriteupFlag(true);
    const md = generateMarkdown();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pentest-report-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 w-full h-full min-h-0 overflow-hidden flex flex-col bg-[#0b0f19]">
      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden px-3 py-2 bg-[#0e1424] border-b border-[#1e293b] flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center p-1 bg-slate-950/80 border border-slate-800 rounded-xl w-full gap-1">
          <button
            onClick={() => {
              sound.playClick();
              setMobileTab('roadmap');
            }}
            className={`flex-1 py-2 px-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'roadmap'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/60 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>90-Day Roadmap ({completedCount}/{totalSkillsCount})</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setMobileTab('writeup');
            }}
            className={`flex-1 py-2 px-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'writeup'
                ? 'bg-amber-950/80 text-amber-300 border border-amber-500/60 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Writeup Generator</span>
          </button>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0 overflow-hidden flex flex-col lg:flex-row">
        {/* CỘT TRÁI: Lộ Trình 90 Ngày Tương Tác (52% on desktop) */}
        <div
          className={`w-full lg:w-[52%] h-full flex flex-col border-r border-[#1e293b] bg-[#0c1222] overflow-hidden ${
            mobileTab === 'roadmap' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Progress Header */}
          <div className="p-3.5 sm:p-4 bg-[#0e1628] border-b border-[#1e293b] shrink-0 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide">
                  Lộ Trình 90 Ngày Thực Chiến (Security Engineer Path)
                </h3>
              </div>
              <span className="text-xs font-mono font-extrabold text-emerald-400 tabular-nums bg-emerald-950/80 border border-emerald-700 px-2 py-0.5 rounded-lg">
                {progressPercent}% HOÀN THÀNH ({completedCount}/{totalSkillsCount})
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-900 border border-slate-800 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-300 shadow-sm shadow-emerald-500/50"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs font-mono text-slate-400">
              <span>Tiến độ lưu tự động trong trình duyệt (localStorage)</span>
              <span className="font-bold text-slate-300">CompTIA Sec+ / OSCP Aligned</span>
            </div>
          </div>

          {/* 3 Stages Checklist */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4">
            {ROADMAP_STAGES.map((stage) => {
              const stageCompletedCount = stage.skills.filter((s) => completedSkills[s.id]).length;

              return (
                <div
                  key={stage.id}
                  className="p-4 rounded-xl border border-[#1e293b] bg-[#0f172a] space-y-3.5 shadow-sm transition-colors hover:border-slate-700"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-700 px-2 py-0.5 rounded-lg">
                          {stage.badge}
                        </span>
                        <span className="text-xs font-mono text-slate-400 font-semibold">{stage.timeframe}</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-white mt-1.5">{stage.stageName}</h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                      {stageCompletedCount}/{stage.skills.length} hoàn thành
                    </span>
                  </div>

                  {/* Skill items */}
                  <div className="space-y-2 pt-1">
                    {stage.skills.map((skill) => {
                      const isChecked = !!completedSkills[skill.id];
                      return (
                        <div
                          key={skill.id}
                          onClick={() => handleToggleSkill(skill.id)}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 min-h-[52px] ${
                            isChecked
                              ? 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                              : 'bg-slate-900/90 border-slate-800 text-slate-100 hover:border-slate-700 hover:bg-slate-850'
                          }`}
                        >
                          <button className="mt-0.5 shrink-0 cursor-pointer">
                            {isChecked ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-500" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div
                              className={`text-xs sm:text-sm font-bold leading-snug ${
                                isChecked ? 'line-through text-slate-500' : 'text-white'
                              }`}
                            >
                              {skill.name}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                              {skill.desc}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Capstone Final Master Challenge Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/50 shadow-lg space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs sm:text-sm font-extrabold text-emerald-300 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Đồ Án Tốt Nghiệp Capstone (Bài 13 CTF)</span>
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40">
                  {progressPercent}% HOÀN THÀNH
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Bạn đã vượt qua toàn bộ các kỹ năng cốt lõi. Đây là mã cờ Capstone chứng nhận tốt nghiệp chính thức của bạn:
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-black/80 border border-emerald-500/40">
                <code className="font-mono text-xs sm:text-sm font-extrabold text-emerald-300">
                  FLAG&#123;cybersecyuta_capstone_certified_master_2026&#125;
                </code>
                <button
                  type="button"
                  onClick={() => {
                    const capstoneFlag = 'FLAG{cybersecyuta_capstone_certified_master_2026}';
                    navigator.clipboard.writeText(capstoneFlag);
                    sound.playClick();
                    setCopiedFlag(capstoneFlag);
                    setTimeout(() => setCopiedFlag(null), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0"
                >
                  {copiedFlag === 'FLAG{cybersecyuta_capstone_certified_master_2026}' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Đã sao chép!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép cờ</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: Trình Soạn Thảo Writeup Chuẩn 3 Phần (48% on desktop) */}
        <div
          className={`w-full lg:w-[48%] h-full flex flex-col bg-[#0b0f19] overflow-hidden ${
            mobileTab === 'writeup' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Writeup Studio Header */}
          <div className="p-3.5 bg-[#0e1628] border-b border-[#1e293b] flex flex-wrap items-center justify-between gap-2 shrink-0 shadow-sm">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide">
                Trình Soạn Thảo Writeup (Feynman Report Studio)
              </span>
            </div>

            {/* Quick templates */}
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="text-slate-400 font-bold text-xs">Mẫu nhanh:</span>
              <button
                onClick={() => handleApplyTemplate('sqli')}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-700 font-bold transition-colors cursor-pointer"
              >
                SQLi
              </button>
              <button
                onClick={() => handleApplyTemplate('rce')}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-700 font-bold transition-colors cursor-pointer"
              >
                RCE
              </button>
              <button
                onClick={() => handleApplyTemplate('privesc')}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-700 font-bold transition-colors cursor-pointer"
              >
                PrivEsc
              </button>
            </div>
          </div>

          {/* 3-Section Structured Editor Form */}
          <div className="flex-1 p-3.5 sm:p-5 overflow-y-auto space-y-4 select-text text-xs sm:text-sm font-sans">
            {/* Title & CWE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Tiêu đề báo cáo lỗ hổng:
                </label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="Ví dụ: Báo Cáo SQL Injection trên Cổng ACME..."
                  className="w-full h-11 px-3 bg-[#070b14] border border-slate-700 rounded-xl text-xs sm:text-sm text-white outline-none focus:border-amber-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Phân loại CWE / OWASP:
                </label>
                <input
                  type="text"
                  value={vulnerabilityName}
                  onChange={(e) => setVulnerabilityName(e.target.value)}
                  placeholder="Ví dụ: CWE-89 / OWASP A03:2021..."
                  className="w-full h-11 px-3 bg-[#070b14] border border-slate-700 rounded-xl text-xs sm:text-sm text-white outline-none focus:border-amber-500 font-medium"
                />
              </div>
            </div>

            {/* Phần 1: Root Cause */}
            <div className="p-4 rounded-xl border border-slate-800 bg-[#0f172a] space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                  <span>1. Nguyên Nhân Cốt Lõi (Root Cause)</span>
                </span>
                <span className="text-xs text-slate-400 font-medium">Mã nguồn lỗi & cơ chế phát sinh</span>
              </div>
              <textarea
                value={rootCause}
                onChange={(e) => setRootCause(e.target.value)}
                rows={4}
                placeholder="Giải thích vì sao lỗ hổng tồn tại trong mã nguồn (ví dụ: chuỗi f-string chưa lọc, shell=True, thiếu ownership check)..."
                className="w-full p-3 bg-[#070b14] border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-mono leading-relaxed outline-none focus:border-amber-500 resize-none"
              />
            </div>

            {/* Phần 2: Exploit Chain */}
            <div className="p-4 rounded-xl border border-slate-800 bg-[#0f172a] space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-red-400 uppercase tracking-wide flex items-center gap-1.5">
                  <span>2. Chuỗi Khai Thác (Exploit Chain / PoC)</span>
                </span>
                <span className="text-xs text-slate-400 font-medium">Các bước tái hiện từng bước</span>
              </div>
              <textarea
                value={exploitChain}
                onChange={(e) => setExploitChain(e.target.value)}
                rows={4}
                placeholder="Mô tả chuỗi hành động tấn công từng bước (Bước 1: gửi payload, Bước 2: bypass auth, Bước 3: rò rỉ token)..."
                className="w-full p-3 bg-[#070b14] border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-mono leading-relaxed outline-none focus:border-red-500 resize-none"
              />
            </div>

            {/* Phần 3: Remediation */}
            <div className="p-4 rounded-xl border border-slate-800 bg-[#0f172a] space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                  <span>3. Biện Pháp Khắc Phục (Remediation)</span>
                </span>
                <span className="text-xs text-slate-400 font-medium">Giải pháp phòng thủ chiều sâu</span>
              </div>
              <textarea
                value={remediation}
                onChange={(e) => setRemediation(e.target.value)}
                rows={4}
                placeholder="Đề xuất cách sửa mã nguồn an toàn (Prepared Statement, Parameterized Query, Regex Whitelisting, CSP)..."
                className="w-full p-3 bg-[#070b14] border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-mono leading-relaxed outline-none focus:border-emerald-500 resize-none"
              />
            </div>
          </div>

          {/* Writeup CTF Flag Revealed Banner */}
          {showWriteupFlag && (
            <div className="mx-3.5 sm:mx-5 mb-2 p-3.5 rounded-xl bg-amber-950/50 border border-amber-500/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs sm:text-sm shadow-md animate-fadeIn">
              <div className="flex items-center gap-2 text-amber-200 flex-wrap">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-bold">Mã cờ chiến thắng (CTF Flag Bài 12):</span>
                <code className="font-mono bg-black/80 px-2 py-1 rounded text-amber-300 font-extrabold select-all">
                  FLAG&#123;feynman_security_writeup_master_2026&#125;
                </code>
              </div>
              <button
                type="button"
                onClick={() => {
                  const flagText = 'FLAG{feynman_security_writeup_master_2026}';
                  navigator.clipboard.writeText(flagText);
                  sound.playClick();
                  setCopiedFlag(flagText);
                  setTimeout(() => setCopiedFlag(null), 2000);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0"
              >
                {copiedFlag === 'FLAG{feynman_security_writeup_master_2026}' ? (
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

          {/* Action Export Footer Bar */}
          <div className="p-3.5 bg-[#0e1628] border-t border-[#1e293b] flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-sm">
            <span className="text-xs font-mono text-slate-400">
              Định dạng xuất: GitHub Flavored Markdown (.md)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyMarkdown}
                className="h-10 px-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm active:scale-95"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedStatus ? 'Đã sao chép MD!' : 'Sao Chép Markdown'}</span>
              </button>

              <button
                onClick={handleDownloadMarkdown}
                className="h-10 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-950/60 active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất Báo Cáo (.MD)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
