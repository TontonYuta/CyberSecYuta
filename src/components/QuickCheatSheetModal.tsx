import React, { useState } from 'react';
import { X, BookOpen, Shield, Terminal, Network, Code } from 'lucide-react';

interface QuickCheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickCheatSheetModal: React.FC<QuickCheatSheetModalProps> = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<'owasp' | 'ports' | 'linux' | 'http'>('owasp');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-2.5 sm:p-6">
      <div className="w-full max-w-3xl bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl flex flex-col h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3.5 bg-[#0e1628] border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wide">
              CyberSec Engineering Quick Reference & CheatSheet
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex items-center gap-2 p-2.5 bg-[#090f1d] border-b border-slate-800 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveCategory('owasp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'owasp'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-600'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Shield className="w-4 h-4 text-red-400 shrink-0" />
            <span>OWASP Top 10</span>
          </button>

          <button
            onClick={() => setActiveCategory('linux')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'linux'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-600'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Linux PrivEsc & GTFOBins</span>
          </button>

          <button
            onClick={() => setActiveCategory('ports')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'ports'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-600'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Network className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Network Ports</span>
          </button>

          <button
            onClick={() => setActiveCategory('http')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeCategory === 'http'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-600'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Code className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>HTTP Security</span>
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 p-3.5 sm:p-5 overflow-y-auto text-xs sm:text-sm leading-relaxed font-mono select-text space-y-3">
          {activeCategory === 'owasp' && (
            <div className="space-y-2">
              <div className="p-2.5 rounded bg-black/40 border border-neutral-800">
                <span className="text-red-400 font-bold">A01:2021 - Broken Access Control</span>
                <p className="text-neutral-400 mt-0.5">
                  Lỗi bỏ sót kiểm tra phân quyền (IDOR, BOLA). Phòng ngự: Luôn xác minh quyền sở hữu tài nguyên ở tầng máy chủ (Server-side ownership verification).
                </p>
              </div>
              <div className="p-2.5 rounded bg-black/40 border border-neutral-800">
                <span className="text-red-400 font-bold">A02:2021 - Cryptographic Failures</span>
                <p className="text-neutral-400 mt-0.5">
                  Lộ dữ liệu nhạy cảm hoặc dùng thuật toán yếu (MD5, SHA1). Phòng ngự: Bắt buộc TLS 1.3, mã hóa AES-256-GCM, hash mật khẩu bằng bcrypt hoặc Argon2.
                </p>
              </div>
              <div className="p-2.5 rounded bg-black/40 border border-neutral-800">
                <span className="text-red-400 font-bold">A03:2021 - Injection (SQLi, Command Injection, XSS)</span>
                <p className="text-neutral-400 mt-0.5">
                  Dữ liệu đầu vào bị hiểu nhầm thành câu lệnh. Phòng ngự: Dùng Parameterized Queries (Prepared Statements), Context-aware Output Encoding.
                </p>
              </div>
              <div className="p-2.5 rounded bg-black/40 border border-neutral-800">
                <span className="text-amber-400 font-bold">A04:2021 - Insecure Design</span>
                <p className="text-neutral-400 mt-0.5">
                  Thiết kế kiến trúc thiếu mô hình đe dọa (Threat Modeling). Cần tích hợp kiểm thử bảo mật ngay từ giai đoạn thiết kế (Shift Left).
                </p>
              </div>
              <div className="p-2.5 rounded bg-black/40 border border-neutral-800">
                <span className="text-amber-400 font-bold">A05:2021 - Security Misconfiguration</span>
                <p className="text-neutral-400 mt-0.5">
                  Mật khẩu mặc định, cổng debug mở công khai, trang báo lỗi chi tiết stacktrace. Phòng ngự: Đóng tất cả các cổng không cần thiết, tự động hóa Hardening.
                </p>
              </div>
            </div>
          )}

          {activeCategory === 'linux' && (
            <div className="space-y-2">
              <div className="p-2.5 rounded bg-black/40 border border-neutral-800">
                <span className="text-purple-400 font-bold">1. Kiểm tra Sudo NOPASSWD</span>
                <pre className="text-neutral-300 mt-1 bg-black p-2 rounded">
                  $ sudo -l
                </pre>
                <p className="text-neutral-400 text-[11px] mt-1">
                  Kiểm tra xem tài khoản hiện tại có được phép chạy lệnh nhị phân nào với quyền root mà không cần password hay không.
                </p>
              </div>

              <div className="p-2.5 rounded bg-black/40 border border-neutral-800">
                <span className="text-purple-400 font-bold">2. Tìm các tệp nhị phân có SUID bit</span>
                <pre className="text-neutral-300 mt-1 bg-black p-2 rounded">
                  $ find / -perm -u=s -type f 2&gt;/dev/null
                </pre>
                <p className="text-neutral-400 text-[11px] mt-1">
                  Nếu tìm thấy find, bash, cp, nmap có cờ SUID, ta có thể mượn quyền của chủ sở hữu (root) để đọc ghi file tùy ý.
                </p>
              </div>

              <div className="p-2.5 rounded bg-black/40 border border-neutral-800">
                <span className="text-purple-400 font-bold">3. Kỹ thuật GTFOBins kinh điển</span>
                <pre className="text-neutral-300 mt-1 bg-black p-2 rounded">
                  # Qua find:
                  sudo find . -exec /bin/sh \; -quit

                  # Qua vim:
                  sudo vim -c &apos;:!/bin/sh&apos;

                  # Qua python:
                  sudo python3 -c &apos;import os; os.system(&quot;/bin/bash&quot;)&apos;
                </pre>
              </div>
            </div>
          )}

          {activeCategory === 'ports' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              {[
                { port: 21, service: 'FTP', desc: 'File Transfer Protocol (Cleartext)' },
                { port: 22, service: 'SSH', desc: 'Secure Shell (Encrypted remote login)' },
                { port: 25, service: 'SMTP', desc: 'Simple Mail Transfer Protocol' },
                { port: 53, service: 'DNS', desc: 'Domain Name System (UDP/TCP)' },
                { port: 80, service: 'HTTP', desc: 'Hypertext Transfer Protocol' },
                { port: 443, service: 'HTTPS', desc: 'HTTP over TLS/SSL' },
                { port: 3306, service: 'MySQL', desc: 'Relational Database Server' },
                { port: 5432, service: 'PostgreSQL', desc: 'PostgreSQL Database' },
                { port: 6379, service: 'Redis', desc: 'In-memory Key-Value Cache' },
                { port: 8080, service: 'HTTP-Alt', desc: 'Proxy or App Server (Tomcat)' },
              ].map((item) => (
                <div key={item.port} className="p-2 rounded bg-black/40 border border-neutral-800">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-400 font-bold">Port {item.port}</span>
                    <span className="text-neutral-300 font-semibold">{item.service}</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">{item.desc}</div>
                </div>
              ))}
            </div>
          )}

          {activeCategory === 'http' && (
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded bg-black/40 border border-neutral-800">
                <span className="text-emerald-400 font-bold">Bắt buộc các tiêu đề HTTP Security Headers:</span>
                <ul className="text-neutral-400 space-y-1 mt-1 text-[11px] list-disc list-inside">
                  <li><strong className="text-neutral-300">Content-Security-Policy (CSP):</strong> Chống XSS bằng cách hạn chế nguồn load script.</li>
                  <li><strong className="text-neutral-300">X-Frame-Options: DENY:</strong> Ngăn chặn Clickjacking trong thẻ iframe.</li>
                  <li><strong className="text-neutral-300">Strict-Transport-Security (HSTS):</strong> Bắt buộc dùng HTTPS an toàn.</li>
                  <li><strong className="text-neutral-300">Set-Cookie: HttpOnly; Secure; SameSite=Strict:</strong> Bảo vệ token chống XSS và CSRF.</li>
                </ul>
              </div>

              <div className="p-2.5 rounded bg-black/40 border border-neutral-800">
                <span className="text-emerald-400 font-bold">Các mã trạng thái HTTP quan trọng trong Security:</span>
                <ul className="text-neutral-400 space-y-0.5 mt-1 text-[11px]">
                  <li><code className="text-blue-400">200 OK:</code> Yêu cầu thành công.</li>
                  <li><code className="text-amber-400">401 Unauthorized:</code> Chưa xác thực danh tính (thiếu hoặc sai thông tin đăng nhập).</li>
                  <li><code className="text-red-400">403 Forbidden:</code> Đã xác thực nhưng không có quyền truy cập đối tượng (dùng chống IDOR).</li>
                  <li><code className="text-amber-400">404 Not Found:</code> Không tìm thấy tài nguyên.</li>
                  <li><code className="text-red-400">500 Internal Server Error:</code> Máy chủ gặp lỗi cú pháp (dấu hiệu SQLi hoặc RCE).</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-[#18181c] border-t border-[#27272a] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded transition-colors"
          >
            Đóng Cheatsheet
          </button>
        </div>
      </div>
    </div>
  );
};
