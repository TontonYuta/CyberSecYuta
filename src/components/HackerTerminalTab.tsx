import React, { useState, useRef, useEffect, useCallback } from 'react';
import { sound } from '../utils/audio';
import { MobileConnectModal } from './MobileConnectModal';
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
  Cpu,
  Laptop,
  Globe,
  Radio,
  AlertCircle,
  Play,
  RotateCcw,
  Smartphone,
  QrCode,
  Wifi,
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

interface BridgeInfo {
  status: string;
  hostname: string;
  platform: string;
  arch: string;
  user: string;
  homeDir: string;
  shell: string;
  lanIp?: string;
  mobileUrl?: string;
  wsUrl?: string;
  tunnelUrl?: string;
  tunnelWsUrl?: string;
  isTunnelActive?: boolean;
}

export const HackerTerminalTab: React.FC = () => {
  // Mode selection: 'real_bash' (actual local laptop bash via WebSocket bridge) vs 'simulated' (web sandbox)
  const [terminalMode, setTerminalMode] = useState<'real_bash' | 'simulated'>('real_bash');
  
  // Bridge host management (can be 127.0.0.1:3001, 192.168.0.109:3001, or tunnel URL)
  const [bridgeHost, setBridgeHost] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('cybersec_bridge_host');
      if (saved) return saved;
    } catch {
      // Ignore
    }
    // Default smart guess
    if (typeof window !== 'undefined') {
      const currentHost = window.location.hostname;
      if (currentHost && currentHost !== 'localhost' && currentHost !== '127.0.0.1' && !currentHost.includes('vercel.app')) {
        return `${currentHost}:3001`;
      }
    }
    return '127.0.0.1:3001';
  });

  // Real bash bridge state
  const [bridgeStatus, setBridgeStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [bridgeInfo, setBridgeInfo] = useState<BridgeInfo | null>(null);
  const [copiedServerCmd, setCopiedServerCmd] = useState<boolean>(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Machine session states (for simulation fallback)
  const [sessionState, setSessionState] = useState<'target_user' | 'target_root'>('target_user');
  const [currentDir, setCurrentDir] = useState<string>('/var/www/html');
  const [commandInput, setCommandInput] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [hasEscalated, setHasEscalated] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [copiedFlag, setCopiedFlag] = useState<boolean>(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial terminal state
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: 'init-1',
      type: 'system',
      text: 'CyberSecYuta Terminal [Real Host Bash & Security Sandbox]',
    },
    {
      id: 'init-2',
      type: 'system',
      text: 'Đang khởi tạo phiên làm việc và kiểm tra kết nối với Bash máy tính cá nhân...',
    },
  ]);

  // Check health and establish WebSocket to bridge
  const checkAndConnectBridge = useCallback(async (targetHost?: string) => {
    const activeHost = (targetHost || bridgeHost).trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    setBridgeStatus('checking');

    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
    // If target host includes a custom protocol or is on localhost
    const httpProtocol = isSecure && !activeHost.startsWith('127.0.0.1') && !activeHost.startsWith('localhost') && !activeHost.startsWith('192.168.') ? 'https://' : 'http://';
    const wsProtocol = httpProtocol === 'https://' ? 'wss://' : 'ws://';

    try {
      // 1. Healthcheck HTTP with 3.5s timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`${httpProtocol}${activeHost}/status`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error('Status endpoint not ok');
      const data: BridgeInfo = await res.json();
      setBridgeInfo(data);

      // 2. Open WebSocket
      if (wsRef.current) {
        wsRef.current.close();
      }

      const ws = new WebSocket(`${wsProtocol}${activeHost}/bash`);
      wsRef.current = ws;

      ws.onopen = () => {
        setBridgeStatus('connected');
        sound.playSuccess();
        setLines((prev) => [
          ...prev,
          {
            id: `ws-conn-${Date.now()}`,
            type: 'success',
            text: `✅ [KẾT NỐI THÀNH CÔNG] Đã gắn trực tiếp vào Bash của máy tính (${data.user}@${data.hostname})!`,
          },
          {
            id: `ws-info-${Date.now()}`,
            type: 'system',
            text: `Host: ${data.hostname} | Shell: ${data.shell} | IP LAN: ${data.lanIp || activeHost} | CWD: ${data.homeDir}`,
          },
          {
            id: `ws-guide-${Date.now()}`,
            type: 'output',
            text: `Mọi câu lệnh bạn gõ trên điện thoại hay máy tính đều được thực thi trực tiếp trên hệ điều hành máy tính.`,
          },
        ]);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'output' || payload.type === 'stderr') {
            const isErr = payload.type === 'stderr';
            const textContent = payload.data;
            if (textContent) {
              setLines((prev) => [
                ...prev,
                {
                  id: `out-${Date.now()}-${Math.random()}`,
                  type: isErr ? 'error' : 'output',
                  text: textContent.trimEnd(),
                },
              ]);
            }
          } else if (payload.type === 'clear') {
            setLines([]);
          }
        } catch {
          if (event.data) {
            setLines((prev) => [
              ...prev,
              {
                id: `out-${Date.now()}-${Math.random()}`,
                type: 'output',
                text: event.data.toString().trimEnd(),
              },
            ]);
          }
        }
      };

      ws.onclose = () => {
        setBridgeStatus('disconnected');
      };

      ws.onerror = () => {
        setBridgeStatus('disconnected');
      };
    } catch {
      setBridgeStatus('disconnected');
    }
  }, [bridgeHost]);

  // Test connection function for modal
  const handleTestConnection = async (hostToTest: string): Promise<boolean> => {
    const clean = hostToTest.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`http://${clean}/status`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return res.ok;
    } catch {
      return false;
    }
  };

  const handleSaveBridgeHost = (newHost: string) => {
    setBridgeHost(newHost);
    try {
      localStorage.setItem('cybersec_bridge_host', newHost);
    } catch {
      // Ignore
    }
    checkAndConnectBridge(newHost);
  };

  useEffect(() => {
    checkAndConnectBridge();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [checkAndConnectBridge]);

  // Auto scroll to bottom
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawCmd = commandInput.trim();
    if (!rawCmd) return;

    sound.playKeypress();
    setHistory((prev) => [...prev, rawCmd]);
    setHistoryIdx(-1);

    // MODE 1: REAL BASH VIA WEBSOCKET
    if (terminalMode === 'real_bash' && bridgeStatus === 'connected' && wsRef.current) {
      const user = bridgeInfo?.user || 'user';
      const host = bridgeInfo?.hostname || 'localhost';

      if (rawCmd.toLowerCase() === 'clear') {
        setLines([]);
        setCommandInput('');
        return;
      }

      setLines((prev) => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          type: 'prompt',
          promptUser: user,
          promptHost: host,
          promptDir: '~',
          text: rawCmd,
        },
      ]);

      wsRef.current.send(JSON.stringify({ type: 'command', command: rawCmd }));
      setCommandInput('');
      return;
    }

    // MODE 2: SIMULATED LAB ENVIRONMENT (Fallback & CTF Sandbox)
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
        id: `out-${Date.now()}-1`,
        type: 'output',
        text: `Danh sách các lệnh hỗ trợ trong Giả lập Sandbox:
  help                             : Hiển thị bảng trợ giúp và mục tiêu nhiệm vụ
  whoami                           : Trả về tên người dùng hiện tại
  id                               : Hiển thị UID, GID và các nhóm quyền
  uname -a                         : Xem phiên bản nhân hệ điều hành Linux Kernel
  pwd                              : Đường dẫn thư mục làm việc hiện tại
  ls [-la]                         : Liệt kê các file trong thư mục
  cat <file>                       : Đọc nội dung tệp tin (ví dụ: cat /etc/passwd, cat /root/flag.txt)
  sudo -l                          : Kiểm tra đặc quyền sudo được cấp phát cho user
  sudo find . -exec /bin/sh \\;     : Khai thác leo quyền GTFOBins qua lệnh find
  exit                             : Thoát phiên root trở lại quyền www-data
  clear                            : Xóa sạch màn hình dòng lệnh`,
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
    } else if (cmd === 'ls' || cmd === 'ls -l' || cmd === 'ls -la') {
      if (isRoot) {
        newEntries.push({
          id: `out-${Date.now()}-ls`,
          type: 'output',
          text: `total 68
drwxr-xr-x  18 root root  4096 Oct 22 00:00 .
drwxr-xr-x  18 root root  4096 Oct 22 00:00 ..
drwxr-xr-x   2 root root  4096 May 15 17:35 bin
drwx------   4 root root  4096 Oct 22 00:00 root
-r--------   1 root root    52 Oct 22 00:00 /root/flag.txt`,
        });
      } else {
        newEntries.push({
          id: `out-${Date.now()}-ls`,
          type: 'output',
          text: `total 24
drwxr-xr-x 2 www-data www-data 4096 Oct 22 00:00 .
drwxr-xr-x 3 root     root     4096 Oct 22 00:00 ..
-rw-r--r-- 1 www-data www-data 1240 Oct 22 00:00 index.php
-rw-r--r-- 1 www-data www-data   45 Oct 22 00:00 .flag_backup.txt`,
        });
      }
    } else if (cmd.startsWith('cat ')) {
      const target = cmd.slice(4).trim();
      if (target === '/etc/passwd') {
        newEntries.push({
          id: `out-${Date.now()}-passwd`,
          type: 'output',
          text: `root:x:0:0:root:/root:/bin/bash\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nsysadmin:x:1000:1000:Sysadmin:/home/sysadmin:/bin/bash`,
        });
      } else if (target === '/root/flag.txt') {
        if (isRoot) {
          newEntries.push({
            id: `out-${Date.now()}-flag`,
            type: 'success',
            text: `🚩 FLAG{gtfobins_sudo_find_root_pwned_2026}\n[CHÚC MỪNG] Bạn đã leo quyền root thành công!`,
          });
          sound.playSuccess();
          setHasEscalated(true);
          setShowCelebration(true);
        } else {
          newEntries.push({
            id: `out-${Date.now()}-flag-deny`,
            type: 'error',
            text: 'cat: /root/flag.txt: Permission denied (Bạn cần quyền root!)',
          });
          sound.playError();
        }
      } else {
        newEntries.push({
          id: `out-${Date.now()}-cat`,
          type: 'output',
          text: `[Nội dung tệp ${target}]: File mẫu trên hệ thống Linux mục tiêu.`,
        });
      }
    } else if (cmd === 'sudo -l') {
      newEntries.push({
        id: `out-${Date.now()}-sudol`,
        type: 'output',
        text: `User www-data may run the following commands on target:\n    (root) NOPASSWD: /usr/bin/find`,
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
        text: `[!] Đang kích hoạt tiến trình con qua -exec của find...\n[+] Spawning shell với đặc quyền root (UID=0)...`,
      });
    } else {
      newEntries.push({
        id: `out-${Date.now()}-unknown`,
        type: 'error',
        text: `bash: ${rawCmd}: command not found (Gõ "help" để xem danh sách lệnh)`,
      });
      sound.playError();
    }

    setLines((prev) => [...prev, ...newEntries]);
    setCommandInput('');
  };

  const copyServerCommand = () => {
    navigator.clipboard.writeText('npm run bash-server');
    sound.playClick();
    setCopiedServerCmd(true);
    setTimeout(() => setCopiedServerCmd(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#070b14] text-slate-100 font-sans">
      {/* Top Bar with Mode Switcher & Mobile Phone Connect Button */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-3.5 py-2.5 bg-[#0d1322] border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="font-mono text-xs font-semibold text-slate-300">
            {terminalMode === 'real_bash'
              ? `bash://${bridgeInfo?.user || 'user'}@${bridgeHost}`
              : 'sandbox://target.local:22'}
          </span>
        </div>

        {/* Action Controls Group */}
        <div className="flex items-center gap-2">
          {/* Mobile / Laptop Connect Button */}
          <button
            onClick={() => {
              sound.playClick();
              setIsMobileModalOpen(true);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              bridgeStatus === 'connected'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
            }`}
            title="Kết nối bash với điện thoại thông minh qua QR hoặc Wi-Fi IP"
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">📱 Kết Nối Điện Thoại</span>
            <span className="sm:hidden">📱 Kết Nối Máy</span>
            <span
              className={`w-2 h-2 rounded-full ${
                bridgeStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
          </button>

          {/* Mode Switcher Pill */}
          <div className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-lg border border-slate-800">
            <button
              onClick={() => {
                setTerminalMode('real_bash');
                if (bridgeStatus === 'disconnected') checkAndConnectBridge();
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                terminalMode === 'real_bash'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Bash Thật</span>
              <span className="md:hidden">Thật</span>
            </button>

            <button
              onClick={() => setTerminalMode('simulated')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                terminalMode === 'simulated'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Sandbox</span>
              <span className="md:hidden">Giả Lập</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Notice Bar (Prompting user to connect phone to laptop) */}
      {terminalMode === 'real_bash' && bridgeStatus === 'disconnected' && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-2.5 bg-amber-950/40 border-b border-amber-800/40 text-xs text-amber-200 shrink-0">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Dùng trên điện thoại:</strong> Bấm nút <strong>"📱 Kết Nối Điện Thoại"</strong> hoặc quét mã QR Wi-Fi để dùng Bash của máy tính!
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsMobileModalOpen(true)}
              className="flex items-center justify-center gap-1 px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Mở Mã QR & IP</span>
            </button>
            <button
              onClick={() => checkAndConnectBridge()}
              className="flex items-center justify-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Thử lại</span>
            </button>
          </div>
        </div>
      )}

      {/* Terminal Output Area */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs sm:text-sm space-y-1.5 bg-[#070b14] select-text">
        {lines.map((line) => {
          if (line.type === 'prompt') {
            return (
              <div key={line.id} className="flex flex-wrap items-baseline gap-1.5 pt-1">
                <span className="text-emerald-400 font-semibold">
                  {line.promptUser}@{line.promptHost}
                </span>
                <span className="text-slate-500">:</span>
                <span className="text-cyan-400 font-medium">{line.promptDir}</span>
                <span className={line.isRootPrompt ? 'text-rose-400 font-bold' : 'text-slate-400 font-bold'}>
                  {line.isRootPrompt ? '#' : '$'}
                </span>
                <span className="text-slate-100 font-medium pl-1 break-all">{line.text}</span>
              </div>
            );
          }

          if (line.type === 'error') {
            return (
              <div key={line.id} className="text-rose-400 whitespace-pre-wrap pl-2 border-l-2 border-rose-500/50">
                {line.text}
              </div>
            );
          }

          if (line.type === 'success') {
            return (
              <div key={line.id} className="text-emerald-400 font-medium whitespace-pre-wrap pl-2 border-l-2 border-emerald-500/50">
                {line.text}
              </div>
            );
          }

          if (line.type === 'system') {
            return (
              <div key={line.id} className="text-amber-300/90 whitespace-pre-wrap">
                {line.text}
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
      <div className="flex items-center gap-1.5 px-3 py-2 bg-[#0d1322] border-t border-slate-800/80 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-400" /> Phím nhanh:
        </span>
        {[
          terminalMode === 'real_bash' ? 'ls -la' : 'whoami',
          terminalMode === 'real_bash' ? 'whoami' : 'id',
          terminalMode === 'real_bash' ? 'uname -a' : 'sudo -l',
          terminalMode === 'real_bash' ? 'pwd' : 'sudo find . -exec /bin/sh \\;',
          terminalMode === 'real_bash' ? 'ip a' : 'cat /root/flag.txt',
          'clear',
        ].map((quickCmd) => (
          <button
            key={quickCmd}
            onClick={() => {
              setCommandInput(quickCmd);
              inputRef.current?.focus();
            }}
            className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-mono text-xs border border-slate-700/60 whitespace-nowrap transition-colors"
          >
            {quickCmd}
          </button>
        ))}
      </div>

      {/* Command Input Form */}
      <form
        onSubmit={handleCommandSubmit}
        className="flex items-center gap-2 px-3 py-2.5 bg-[#090d16] border-t border-slate-800 shrink-0"
      >
        <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm text-emerald-400 font-semibold shrink-0">
          <span>{terminalMode === 'real_bash' ? (bridgeInfo?.user || 'user') : (sessionState === 'target_root' ? 'root' : 'www-data')}</span>
          <span className="text-slate-500">:</span>
          <span className="text-slate-400 font-bold">{sessionState === 'target_root' ? '#' : '$'}</span>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          placeholder={
            terminalMode === 'real_bash'
              ? 'Gõ lệnh bash máy cá nhân (ls, whoami, uname, curl, ...)'
              : 'Gõ lệnh (whoami, id, sudo -l, help, ...)'
          }
          className="flex-1 bg-transparent border-0 outline-none font-mono text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:ring-0"
          autoFocus
        />

        <button
          type="submit"
          className="px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-medium transition-colors shrink-0"
        >
          Chạy
        </button>
      </form>

      {/* Mobile Connection Modal */}
      <MobileConnectModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
        detectedLanIp={bridgeInfo?.lanIp || '192.168.0.109'}
        detectedTunnelUrl={bridgeInfo?.tunnelUrl}
        currentBridgeHost={bridgeHost}
        onSaveBridgeHost={handleSaveBridgeHost}
        onTestConnection={handleTestConnection}
        isConnected={bridgeStatus === 'connected'}
      />
    </div>
  );
};
