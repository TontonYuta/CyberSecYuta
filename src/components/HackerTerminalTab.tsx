import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface TerminalLine {
  id: string;
  type: 'system' | 'prompt' | 'output' | 'error' | 'success';
  text: string;
  promptUser?: string;
  promptHost?: string;
  promptDir?: string;
  isRootPrompt?: boolean;
  flagCopyable?: string;
}

export const HackerTerminalTab: React.FC = () => {
  // Machine session states (100% offline-first standalone simulator)
  const [sessionState, setSessionState] = useState<'target_user' | 'target_root'>('target_user');
  const [currentDir, setCurrentDir] = useState<string>('/var/www/html');
  const [commandInput, setCommandInput] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [hasEscalated, setHasEscalated] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [copiedFlagText, setCopiedFlagText] = useState<string | null>(null);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial terminal welcome text
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: 'init-1',
      type: 'system',
      text: 'Linux target.local 5.4.0-150-generic #167-Ubuntu SMP Mon May 15 17:35:05 UTC 2026 x86_64',
    },
    {
      id: 'init-2',
      type: 'system',
      text: 'Phiên làm việc: www-data@target:/var/www/html (Môi trường Sandbox hoàn toàn độc lập, không cần kết nối mạng).',
    },
    {
      id: 'init-3',
      type: 'output',
      text: 'Mẹo: Gõ "help" để xem danh sách lệnh, "ls -la" để tìm file ẩn, hoặc "sudo -l" để trinh sát leo quyền root!',
    },
  ]);

  // Auto scroll to bottom
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const handleCopyFlag = (flag: string) => {
    navigator.clipboard.writeText(flag);
    sound.playClick();
    setCopiedFlagText(flag);
    setTimeout(() => setCopiedFlagText(null), 2000);
  };

  const handleResetTerminal = () => {
    sound.playClick();
    setSessionState('target_user');
    setCurrentDir('/var/www/html');
    setHasEscalated(false);
    setShowCelebration(false);
    setLines([
      {
        id: `reset-${Date.now()}-1`,
        type: 'system',
        text: 'Linux target.local 5.4.0-150-generic #167-Ubuntu x86_64 [ĐÃ LÀM MỚI PHIÊN LÀM VIỆC]',
      },
      {
        id: `reset-${Date.now()}-2`,
        type: 'output',
        text: 'Đã khôi phục quyền www-data@target:/var/www/html. Bạn có thể bắt đầu lại bài thực hành.',
      },
    ]);
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawCmd = commandInput.trim();
    if (!rawCmd) return;

    sound.playKeypress();
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

    if (cmd === 'clear') {
      setLines([]);
      setCommandInput('');
      return;
    }

    if (cmd === 'help') {
      newEntries.push({
        id: `out-${Date.now()}-help`,
        type: 'output',
        text: `Danh sách các lệnh hỗ trợ trong Giả lập Linux CLI:
  whoami                            : Kiểm tra tên người dùng hiện tại
  id                                : Hiển thị UID, GID và các nhóm quyền
  uname -a                          : Xem thông tin hệ điều hành Linux Kernel
  pwd                               : Thư mục làm việc hiện tại
  ls [-la]                          : Liệt kê các tệp tin (bao gồm tệp ẩn có dấu chấm)
  cat <file>                        : Đọc nội dung tệp tin (ví dụ: cat /etc/passwd, cat .flag_backup.txt)
  grep <từ_khóa> <file>             : Tìm kiếm chuỗi ký tự trong file
  sudo -l                           : Kiểm tra danh sách đặc quyền sudo được cấp phát
  sudo find . -exec /bin/sh \\;      : Khai thác lỗ hổng leo quyền root qua lệnh find
  exit                              : Thoát phiên root trở lại quyền người dùng thường
  clear                             : Xóa sạch màn hình dòng lệnh`,
      });
    } else if (cmd === 'whoami') {
      newEntries.push({
        id: `out-${Date.now()}-whoami`,
        type: 'output',
        text: isRoot ? 'root' : 'www-data',
      });
    } else if (cmd === 'id') {
      newEntries.push({
        id: `out-${Date.now()}-id`,
        type: 'output',
        text: isRoot
          ? 'uid=0(root) gid=0(root) groups=0(root)'
          : 'uid=33(www-data) gid=33(www-data) groups=33(www-data)',
      });
    } else if (cmd === 'uname' || cmd === 'uname -a') {
      newEntries.push({
        id: `out-${Date.now()}-uname`,
        type: 'output',
        text: 'Linux target.local 5.4.0-150-generic #167-Ubuntu SMP Mon May 15 17:35:05 UTC 2026 x86_64 x86_64 x86_64 GNU/Linux',
      });
    } else if (cmd === 'pwd') {
      newEntries.push({
        id: `out-${Date.now()}-pwd`,
        type: 'output',
        text: isRoot ? '/' : currentDir,
      });
    } else if (cmd === 'ls' || cmd === 'ls -l' || cmd === 'ls -la' || cmd === 'dir') {
      if (isRoot) {
        newEntries.push({
          id: `out-${Date.now()}-ls`,
          type: 'output',
          text: `total 68
drwx------  4 root root  4096 Oct 22 00:00 .
drwxr-xr-x 20 root root  4096 Oct 20 12:00 ..
-rw-r--r--  1 root root  3106 May 15 17:35 .bashrc
-rw-r--r--  1 root root   161 Jul  9  2024 .profile
-rw-------  1 root root    48 Oct 22 00:00 flag.txt
drwxr-xr-x  3 root root  4096 Oct 20 12:05 snap`,
        });
      } else if (cmd.includes('-a') || cmd.includes('-la')) {
        newEntries.push({
          id: `out-${Date.now()}-ls-a`,
          type: 'output',
          text: `total 24
drwxr-xr-x 2 www-data www-data 4096 Oct 22 00:00 .
drwxr-xr-x 3 root     root     4096 Oct 22 00:00 ..
-rw-r--r-- 1 www-data www-data 1240 Oct 22 00:00 index.php
-rw-r--r-- 1 www-data www-data   45 Oct 22 00:00 .flag_backup.txt`,
        });
      } else {
        newEntries.push({
          id: `out-${Date.now()}-ls`,
          type: 'output',
          text: `index.php`,
        });
      }
    } else if (cmd.startsWith('cat ')) {
      const target = cmd.slice(4).trim();
      if (
        target === '/var/www/html/.flag_backup.txt' ||
        target === '.flag_backup.txt' ||
        target === 'flag_backup.txt'
      ) {
        const flagVal = 'FLAG{linux_cli_bandit_explorer_2026}';
        sound.playSuccess();
        newEntries.push({
          id: `out-${Date.now()}-catflag1`,
          type: 'success',
          text: `🚩 ${flagVal}\n[THÀNH CÔNG] Bạn đã tìm thấy cờ bí mật của Bài 1 trong tệp ẩn!`,
          flagCopyable: flagVal,
        });
      } else if (
        target === '/root/flag.txt' ||
        target === 'flag.txt' ||
        target === '/root/flag'
      ) {
        if (isRoot) {
          const flagVal = 'FLAG{gtfobins_sudo_find_root_pwned_2026}';
          sound.playSuccess();
          setHasEscalated(true);
          setShowCelebration(true);
          newEntries.push({
            id: `out-${Date.now()}-catflag2`,
            type: 'success',
            text: `🚩 ${flagVal}\n[XUẤT SẮC] Bạn đã đọc cờ Root thành công sau khi leo thang đặc quyền!`,
            flagCopyable: flagVal,
          });
        } else {
          sound.playError();
          newEntries.push({
            id: `out-${Date.now()}-flag-deny`,
            type: 'error',
            text: 'cat: /root/flag.txt: Permission denied (Bạn cần đặc quyền root để đọc tệp này!)',
          });
        }
      } else if (target === '/etc/passwd' || target === 'passwd') {
        newEntries.push({
          id: `out-${Date.now()}-passwd`,
          type: 'output',
          text: `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
sysadmin:x:1000:1000:Sysadmin:/home/sysadmin:/bin/bash
sshd:x:110:65534::/run/sshd:/usr/sbin/nologin`,
        });
      } else if (target === '/etc/shadow') {
        sound.playError();
        newEntries.push({
          id: `out-${Date.now()}-shadow`,
          type: 'error',
          text: 'cat: /etc/shadow: Permission denied (Tệp lưu mật khẩu được bảo vệ chặt chẽ)',
        });
      } else if (target === '/etc/os-release') {
        newEntries.push({
          id: `out-${Date.now()}-os`,
          type: 'output',
          text: `NAME="Ubuntu"
VERSION="22.04.4 LTS (Jammy Jellyfish)"
ID=ubuntu
ID_LIKE=debian
PRETTY_NAME="Ubuntu 22.04.4 LTS"
VERSION_ID="22.04"`,
        });
      } else if (target === '/etc/hosts') {
        newEntries.push({
          id: `out-${Date.now()}-hosts`,
          type: 'output',
          text: `127.0.0.1 localhost\n127.0.1.1 target.local target\n192.168.1.1 gateway`,
        });
      } else if (target === 'index.php' || target === '/var/www/html/index.php') {
        newEntries.push({
          id: `out-${Date.now()}-php`,
          type: 'output',
          text: `<?php
  // Cổng thông tin nội bộ Acme Corp
  session_start();
  echo "<h1>Chào mừng đến máy chủ nội bộ target.local</h1>";
?>`,
        });
      } else {
        newEntries.push({
          id: `out-${Date.now()}-cat-default`,
          type: 'output',
          text: `cat: ${target}: No such file or directory. Hãy thử tệp ".flag_backup.txt" hoặc "/etc/passwd".`,
        });
      }
    } else if (cmd.startsWith('grep ')) {
      if (cmd.includes('flag') || cmd.includes('FLAG')) {
        const flagVal = 'FLAG{linux_cli_bandit_explorer_2026}';
        sound.playSuccess();
        newEntries.push({
          id: `out-${Date.now()}-grep`,
          type: 'success',
          text: `/var/www/html/.flag_backup.txt: ${flagVal}`,
          flagCopyable: flagVal,
        });
      } else {
        newEntries.push({
          id: `out-${Date.now()}-grep-empty`,
          type: 'output',
          text: `Không tìm thấy chuỗi phù hợp.`,
        });
      }
    } else if (cmd === 'sudo -l') {
      newEntries.push({
        id: `out-${Date.now()}-sudol`,
        type: 'output',
        text: `Matching Defaults entries for www-data on target:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\\:/usr/local/bin\\:/usr/sbin\\:/usr/bin

User www-data may run the following commands on target:
    (root) NOPASSWD: /usr/bin/find`,
      });
    } else if (
      cmd.includes('sudo find') &&
      (cmd.includes('-exec /bin/sh') || cmd.includes('-exec sh'))
    ) {
      setSessionState('target_root');
      setHasEscalated(true);
      sound.playSuccess();
      newEntries.push({
        id: `out-${Date.now()}-privesc`,
        type: 'success',
        text: `[!] Đang gọi trình thực thi shell qua cờ -exec của find...
[+] Lỗ hổng GTFOBins kích hoạt thành công!
[+] Spawning shell với đặc quyền root (UID=0, GID=0)...
[i] Gõ "whoami" để kiểm tra danh tính mới hoặc "cat /root/flag.txt" để lấy cờ!`,
      });
    } else if (cmd === 'exit') {
      if (isRoot) {
        setSessionState('target_user');
        sound.playClick();
        newEntries.push({
          id: `out-${Date.now()}-exit`,
          type: 'system',
          text: `Đã thoát quyền root. Trở về phiên www-data@target:/var/www/html.`,
        });
      } else {
        newEntries.push({
          id: `out-${Date.now()}-exit-warn`,
          type: 'output',
          text: `Đây là phiên terminal chính, không thể thoát.`,
        });
      }
    } else {
      sound.playError();
      newEntries.push({
        id: `out-${Date.now()}-unknown`,
        type: 'error',
        text: `bash: ${rawCmd}: command not found (Gõ "help" để xem các câu lệnh được hỗ trợ)`,
      });
    }

    setLines((prev) => [...prev, ...newEntries]);
    setCommandInput('');
  };

  return (
    <div className="flex flex-col h-full bg-[#070b14] text-slate-100 font-sans select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2 bg-[#0c1220] border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="font-mono text-xs font-semibold text-slate-300">
            {sessionState === 'target_root' ? 'root@target.local:~#' : 'www-data@target.local:/var/www/html$'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {sessionState === 'target_root' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold animate-pulse">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>ROOT PRIVILEGES (UID=0)</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sandbox Offline 100%</span>
            </span>
          )}

          <button
            onClick={handleResetTerminal}
            className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Làm mới lại terminal về trạng thái ban đầu"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 font-mono text-xs sm:text-sm space-y-1.5 bg-[#070b14] select-text">
        {lines.map((line) => {
          if (line.type === 'system') {
            return (
              <div key={line.id} className="text-slate-500 leading-relaxed">
                # {line.text}
              </div>
            );
          }

          if (line.type === 'prompt') {
            return (
              <div key={line.id} className="flex items-start gap-1.5 text-slate-200">
                <span className={line.isRootPrompt ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {line.promptUser}@{line.promptHost}:{line.promptDir}
                  {line.isRootPrompt ? '#' : '$'}
                </span>
                <span className="text-white font-medium">{line.text}</span>
              </div>
            );
          }

          if (line.type === 'error') {
            return (
              <div key={line.id} className="text-rose-400 leading-relaxed">
                {line.text}
              </div>
            );
          }

          if (line.type === 'success') {
            return (
              <div
                key={line.id}
                className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 space-y-1.5"
              >
                <div className="whitespace-pre-wrap font-semibold">{line.text}</div>
                {line.flagCopyable && (
                  <button
                    onClick={() => handleCopyFlag(line.flagCopyable!)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    {copiedFlagText === line.flagCopyable ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Đã chép cờ vào bộ nhớ tạm!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Chạm để sao chép mã cờ này</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          }

          return (
            <div key={line.id} className="text-slate-300 whitespace-pre-wrap leading-relaxed">
              {line.text}
            </div>
          );
        })}
        <div ref={terminalEndRef} />
      </div>

      {/* Quick Action Chips Bar (Thumb-friendly on mobile) */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-[#0c1220] border-t border-slate-800 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1 font-bold">
          <Zap className="w-3.5 h-3.5 text-amber-400" /> Phím tắt:
        </span>
        {[
          'whoami',
          'id',
          'ls -la',
          'cat .flag_backup.txt',
          'cat /etc/passwd',
          'sudo -l',
          'sudo find . -exec /bin/sh \\;',
          'cat /root/flag.txt',
          'clear',
        ].map((quickCmd) => (
          <button
            key={quickCmd}
            onClick={() => {
              sound.playKeypress();
              setCommandInput(quickCmd);
              inputRef.current?.focus();
            }}
            className="min-h-[38px] px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white font-mono text-xs border border-slate-700 whitespace-nowrap transition-all shadow-sm cursor-pointer"
          >
            {quickCmd}
          </button>
        ))}
      </div>

      {/* Active Input Line */}
      <form
        onSubmit={handleCommandSubmit}
        className="flex items-center gap-2 px-3 py-2.5 bg-[#090d18] border-t border-slate-800 shrink-0"
      >
        <span className={`font-mono text-xs sm:text-sm font-bold shrink-0 ${sessionState === 'target_root' ? 'text-rose-400' : 'text-emerald-400'}`}>
          {sessionState === 'target_root' ? 'root@target:~#' : 'www-data@target:$'}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          placeholder="Nhập lệnh (ví dụ: ls -la, whoami, help)..."
          className="flex-1 bg-transparent font-mono text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none min-h-[36px]"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
        />
        <button
          type="submit"
          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-colors cursor-pointer shrink-0 min-h-[36px]"
        >
          Gửi
        </button>
      </form>
    </div>
  );
};
