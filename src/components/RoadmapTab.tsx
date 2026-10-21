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
    setTimeout(() => setCopiedStatus(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    sound.playSuccess();
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
    <div className="flex-1 w-full h-full min-h-0 overflow-hidden flex flex-col bg-[#09090b]">
      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden px-2.5 py-1.5 bg-[#121215] border-b border-[#27272a] flex items-center justify-between shrink-0">
        <div className="flex items-center p-0.5 bg-black border border-neutral-800 rounded-lg w-full">
          <button
            onClick={() => {
              sound.playClick();
              setMobileTab('roadmap');
            }}
            className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'roadmap'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>90-Day Roadmap ({completedCount}/{totalSkillsCount})</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setMobileTab('writeup');
            }}
            className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'writeup'
                ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-600/50 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Writeup Generator</span>
          </button>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0 overflow-hidden flex flex-col lg:flex-row">
        {/* CỘT TRÁI: Lộ Trình 90 Ngày Tương Tác (52% on desktop) */}
        <div
          className={`w-full lg:w-[52%] h-full flex flex-col border-r border-[#27272a] bg-[#0c0c0e] overflow-hidden ${
            mobileTab === 'roadmap' ? 'flex' : 'hidden lg:flex'
          }`}
        >
        {/* Progress Header */}
        <div className="p-4 bg-[#121215] border-b border-[#27272a] shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-neutral-100 uppercase tracking-wide">
                Lộ Trình 90 Ngày Thực Chiến (Security Engineer Path)
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 tabular-nums">
              {progressPercent}% HOÀN THÀNH ({completedCount}/{totalSkillsCount} MỤC TIÊU)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-neutral-900 border border-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-[10px] font-mono text-neutral-500">
            <span>Tiến độ lưu tự động trong trình duyệt (localStorage)</span>
            <span>CompTIA Sec+ / OSCP / SOC L1 Aligned</span>
          </div>
        </div>

        {/* 3 Stages Checklist */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {ROADMAP_STAGES.map((stage) => {
            const stageCompletedCount = stage.skills.filter((s) => completedSkills[s.id]).length;
            const isStageDone = stageCompletedCount === stage.skills.length;

            return (
              <div
                key={stage.id}
                className="p-3.5 rounded-lg border border-[#27272a] bg-[#121215] space-y-3 transition-colors hover:border-neutral-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.5 rounded mr-2">
                      {stage.badge}
                    </span>
                    <span className="text-xs font-mono text-neutral-400">{stage.timeframe}</span>
                    <h4 className="text-xs font-bold text-neutral-100 mt-1">{stage.stageName}</h4>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-neutral-400">
                    {stageCompletedCount}/{stage.skills.length}
                  </span>
                </div>

                {/* Skill items */}
                <div className="space-y-1.5 pt-1">
                  {stage.skills.map((skill) => {
                    const isChecked = !!completedSkills[skill.id];
                    return (
                      <div
                        key={skill.id}
                        onClick={() => handleToggleSkill(skill.id)}
                        className={`p-2 rounded border cursor-pointer transition-colors flex items-start gap-2.5 ${
                          isChecked
                            ? 'bg-neutral-900/60 border-neutral-800/80 text-neutral-400'
                            : 'bg-black/30 border-neutral-800 text-neutral-200 hover:border-neutral-700'
                        }`}
                      >
                        <button className="mt-0.5 shrink-0">
                          {isChecked ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-950" />
                          ) : (
                            <Circle className="w-4 h-4 text-neutral-600" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-xs font-medium ${
                              isChecked ? 'line-through text-neutral-500' : 'text-neutral-200'
                            }`}
                          >
                            {skill.name}
                          </div>
                          <div className="text-[10px] text-neutral-500 mt-0.5 truncate">
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
        </div>
      </div>

      {/* CỘT PHẢI: Trình Soạn Thảo Writeup Chuẩn 3 Phần (48% on desktop) */}
      <div
        className={`w-full lg:w-[48%] h-full flex flex-col bg-[#09090b] overflow-hidden ${
          mobileTab === 'writeup' ? 'flex' : 'hidden lg:flex'
        }`}
      >
        {/* Writeup Studio Header */}
        <div className="p-3 bg-[#121215] border-b border-[#27272a] flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-neutral-100 uppercase tracking-wide">
              Trình Soạn Thảo Writeup (Feynman Report Studio)
            </span>
          </div>

          {/* Quick templates */}
          <div className="flex items-center gap-1 text-[11px] font-mono">
            <span className="text-neutral-500 text-[10px]">Mẫu bài:</span>
            <button
              onClick={() => handleApplyTemplate('sqli')}
              className="px-2 py-0.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded border border-neutral-800 transition-colors"
            >
              SQLi
            </button>
            <button
              onClick={() => handleApplyTemplate('rce')}
              className="px-2 py-0.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded border border-neutral-800 transition-colors"
            >
              RCE
            </button>
            <button
              onClick={() => handleApplyTemplate('privesc')}
              className="px-2 py-0.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded border border-neutral-800 transition-colors"
            >
              PrivEsc
            </button>
          </div>
        </div>

        {/* 3-Section Structured Editor Form */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 select-text text-xs font-sans">
          {/* Title & CWE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                Tiêu đề báo cáo lỗ hổng:
              </label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="Ví dụ: Báo Cáo SQL Injection trên Cổng ACME..."
                className="w-full px-2.5 py-1.5 bg-[#121215] border border-neutral-700 rounded text-xs text-neutral-200 outline-none focus:border-amber-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                Phân loại CWE / OWASP:
              </label>
              <input
                type="text"
                value={vulnerabilityName}
                onChange={(e) => setVulnerabilityName(e.target.value)}
                placeholder="Ví dụ: CWE-89 / OWASP A03:2021..."
                className="w-full px-2.5 py-1.5 bg-[#121215] border border-neutral-700 rounded text-xs text-neutral-200 outline-none focus:border-amber-500 font-medium"
              />
            </div>
          </div>

          {/* Phần 1: Root Cause */}
          <div className="p-3 rounded-lg border border-neutral-800 bg-[#101013] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                <span>1. Nguyên Nhân Cốt Lõi (Root Cause)</span>
              </span>
              <span className="text-[10px] text-neutral-500">Mã nguồn lỗi & cơ chế phát sinh</span>
            </div>
            <textarea
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              rows={4}
              placeholder="Giải thích vì sao lỗ hổng tồn tại trong mã nguồn (ví dụ: chuỗi f-string chưa lọc, shell=True, thiếu ownership check)..."
              className="w-full p-2 bg-[#09090b] border border-neutral-700 rounded text-xs text-neutral-200 font-mono leading-relaxed outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {/* Phần 2: Exploit Chain */}
          <div className="p-3 rounded-lg border border-neutral-800 bg-[#101013] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wide flex items-center gap-1.5">
                <span>2. Chuỗi Khai Thác (Exploit Chain / PoC)</span>
              </span>
              <span className="text-[10px] text-neutral-500">Các bước tái hiện từng bước</span>
            </div>
            <textarea
              value={exploitChain}
              onChange={(e) => setExploitChain(e.target.value)}
              rows={4}
              placeholder="Mô tả chuỗi hành động tấn công từng bước (Bước 1: gửi payload, Bước 2: bypass auth, Bước 3: rò rỉ token)..."
              className="w-full p-2 bg-[#09090b] border border-neutral-700 rounded text-xs text-neutral-200 font-mono leading-relaxed outline-none focus:border-red-500 resize-none"
            />
          </div>

          {/* Phần 3: Remediation */}
          <div className="p-3 rounded-lg border border-neutral-800 bg-[#101013] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                <span>3. Biện Pháp Khắc Phục (Remediation)</span>
              </span>
              <span className="text-[10px] text-neutral-500">Giải pháp phòng thủ chiều sâu</span>
            </div>
            <textarea
              value={remediation}
              onChange={(e) => setRemediation(e.target.value)}
              rows={4}
              placeholder="Đề xuất cách sửa mã nguồn an toàn (Prepared Statement, Parameterized Query, Regex Whitelisting, CSP)..."
              className="w-full p-2 bg-[#09090b] border border-neutral-700 rounded text-xs text-neutral-200 font-mono leading-relaxed outline-none focus:border-emerald-500 resize-none"
            />
          </div>
        </div>

        {/* Action Export Footer Bar */}
        <div className="p-3 bg-[#121215] border-t border-[#27272a] flex items-center justify-between gap-2 shrink-0">
          <span className="text-[11px] font-mono text-neutral-400">
            Định dạng xuất chuẩn: GitHub Flavored Markdown (.md)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs font-medium border border-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedStatus ? 'Đã sao chép MD!' : 'Sao Chép Markdown'}</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
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
