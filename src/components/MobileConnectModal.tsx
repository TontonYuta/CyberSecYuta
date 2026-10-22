import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { sound } from '../utils/audio';
import {
  Smartphone,
  Laptop,
  Wifi,
  QrCode,
  Copy,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  RefreshCw,
  Globe,
  Radio,
  Zap,
  Cloud,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface MobileConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  detectedLanIp?: string;
  detectedTunnelUrl?: string | null;
  currentBridgeHost: string;
  onSaveBridgeHost: (host: string) => void;
  onTestConnection: (host: string) => Promise<boolean>;
  isConnected: boolean;
}

export const MobileConnectModal: React.FC<MobileConnectModalProps> = ({
  isOpen,
  onClose,
  detectedLanIp = '192.168.0.109',
  detectedTunnelUrl,
  currentBridgeHost,
  onSaveBridgeHost,
  onTestConnection,
  isConnected,
}) => {
  const [connectTab, setConnectTab] = useState<'tunnel' | 'lan' | 'manual'>('tunnel');
  const [hostInput, setHostInput] = useState<string>(currentBridgeHost || '');
  const [tunnelQrUrl, setTunnelQrUrl] = useState<string>('');
  const [lanQrUrl, setLanQrUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'error'>('idle');

  const lanAccessUrl = `http://${detectedLanIp}:3001`;
  const tunnelAccessUrl = detectedTunnelUrl || '';

  // Generate QR Codes
  useEffect(() => {
    if (tunnelAccessUrl) {
      QRCode.toDataURL(tunnelAccessUrl, {
        width: 240,
        margin: 1.5,
        color: { dark: '#070b14', light: '#ffffff' },
      })
        .then(setTunnelQrUrl)
        .catch(console.error);
    }

    if (lanAccessUrl) {
      QRCode.toDataURL(lanAccessUrl, {
        width: 240,
        margin: 1.5,
        color: { dark: '#070b14', light: '#ffffff' },
      })
        .then(setLanQrUrl)
        .catch(console.error);
    }
  }, [tunnelAccessUrl, lanAccessUrl]);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    sound.playClick();
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHost = hostInput
      .trim()
      .replace(/^(https?|wss?):\/\//, '')
      .replace(/\/bash$/, '')
      .replace(/\/status$/, '')
      .replace(/\/$/, '');

    if (!cleanHost) return;

    setIsTesting(true);
    setTestResult('idle');

    const success = await onTestConnection(cleanHost);
    setIsTesting(false);

    if (success) {
      sound.playSuccess();
      setTestResult('success');
      onSaveBridgeHost(cleanHost);
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      sound.playError();
      setTestResult('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0c1220] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#090d16] border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">
                Kết Nối Bash Điện Thoại & Cloudflare Tunnel
              </h3>
              <p className="text-[11px] text-slate-400">
                Điều khiển Linux Terminal của máy tính từ bất kỳ đâu qua 4G/5G hoặc Wi-Fi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-[#080d1a] px-3 pt-2 gap-1.5 shrink-0">
          <button
            onClick={() => setConnectTab('tunnel')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-semibold transition-all border-b-2 cursor-pointer ${
              connectTab === 'tunnel'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>4G/5G Từ Xa (Cloudflare)</span>
            {detectedTunnelUrl && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            )}
          </button>

          <button
            onClick={() => setConnectTab('lan')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-semibold transition-all border-b-2 cursor-pointer ${
              connectTab === 'lan'
                ? 'border-emerald-400 text-emerald-300 bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>Cùng Mạng Wi-Fi (LAN)</span>
          </button>

          <button
            onClick={() => setConnectTab('manual')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-semibold transition-all border-b-2 cursor-pointer ${
              connectTab === 'manual'
                ? 'border-amber-400 text-amber-300 bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Tự Cấu Hình IP</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: CLOUDFLARE TUNNEL (RECOMMENDED FOR GLOBAL REMOTE) */}
          {connectTab === 'tunnel' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    Cloudflare Quick Tunnel (Mã Hóa HTTPS/WSS)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px]">
                    Hoạt Động Toàn Cầu
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Không cần chung Wi-Fi! Dù bạn đang ở quán café hay dùng 4G/5G ngoài đường, chỉ cần quét mã QR bên dưới là điện thoại kết nối trực tiếp với Bash máy tính.
                </p>
              </div>

              {detectedTunnelUrl ? (
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="p-2.5 bg-white rounded-xl shadow-lg shrink-0 flex items-center justify-center">
                    {tunnelQrUrl ? (
                      <img src={tunnelQrUrl} alt="Cloudflare Tunnel QR" className="w-36 h-36 rounded" />
                    ) : (
                      <div className="w-36 h-36 bg-slate-200 animate-pulse rounded" />
                    )}
                  </div>

                  <div className="space-y-2.5 flex-1 w-full text-xs">
                    <div className="text-slate-400">Đường dẫn Remote bảo mật:</div>
                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-black/70 border border-cyan-800/60 font-mono text-[11px] text-cyan-300 break-all">
                      <span className="flex-1 truncate">{detectedTunnelUrl}</span>
                      <button
                        onClick={() => handleCopy(detectedTunnelUrl, 'tunnel')}
                        className="p-1 text-slate-400 hover:text-white shrink-0"
                        title="Sao chép liên kết"
                      >
                        {copiedLink === 'tunnel' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={detectedTunnelUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors"
                      >
                        <span>Mở Trên Tab Mới</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        onClick={() => handleCopy(detectedTunnelUrl, 'tunnel-btn')}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                      >
                        {copiedLink === 'tunnel-btn' ? 'Đã chép link' : 'Copy link'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-2">
                  <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
                  <div className="text-xs text-slate-300 font-semibold">
                    Đang thiết lập Cloudflare Tunnel tự động...
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Máy tính đang kết nối với Cloudflare Edge để tạo tên miền HTTPS công cộng.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WI-FI LAN */}
          {connectTab === 'lan' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-slate-300 leading-relaxed">
                Áp dụng khi điện thoại và laptop đang kết nối <strong>chung một mạng Wi-Fi tại nhà hoặc văn phòng</strong>.
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="p-2.5 bg-white rounded-xl shadow-lg shrink-0 flex items-center justify-center">
                  {lanQrUrl ? (
                    <img src={lanQrUrl} alt="LAN QR Code" className="w-36 h-36 rounded" />
                  ) : (
                    <div className="w-36 h-36 bg-slate-200 animate-pulse rounded" />
                  )}
                </div>

                <div className="space-y-2.5 flex-1 w-full text-xs">
                  <div className="text-slate-400">Địa chỉ mạng nội bộ (Port 3001):</div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-black/70 border border-slate-700 font-mono text-[11px] text-emerald-300 break-all">
                    <span className="flex-1 truncate">{lanAccessUrl}</span>
                    <button
                      onClick={() => handleCopy(lanAccessUrl, 'lan')}
                      className="p-1 text-slate-400 hover:text-white shrink-0"
                    >
                      {copiedLink === 'lan' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MANUAL HOST SETTINGS */}
          {connectTab === 'manual' && (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <p className="text-xs text-slate-400 leading-relaxed">
                Tự cấu hình IP hoặc URL máy chủ nếu bạn sử dụng địa chỉ tùy chỉnh:
              </p>

              <form onSubmit={handleTestAndSave} className="space-y-2.5">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={hostInput}
                    onChange={(e) => setHostInput(e.target.value)}
                    placeholder="Ví dụ: 192.168.0.109:3001 hoặc xxx.trycloudflare.com"
                    className="flex-1 px-3.5 py-2.5 rounded-lg bg-black/60 border border-slate-700 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    disabled={isTesting}
                    className="px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white font-semibold text-xs transition-colors shrink-0 flex items-center justify-center gap-1.5"
                  >
                    {isTesting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang thử...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>Lưu & Kết Nối</span>
                      </>
                    )}
                  </button>
                </div>

                {testResult === 'success' && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/50 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Đã kết nối thành công! Đang chuyển sang màn hình Terminal...</span>
                  </div>
                )}

                {testResult === 'error' && (
                  <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/50 text-xs text-rose-300 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>Không thể kết nối. Kiểm tra lại địa chỉ hoặc xem daemon máy tính đã chạy chưa.</span>
                    </div>
                    {hostInput.trim() && (
                      <div className="text-[11px] text-amber-300 pl-6">
                        Mẹo: Bạn có thể bấm nút mở trực tiếp link bên dưới để vào thẳng app mà không lo bị trình duyệt chặn!
                      </div>
                    )}
                  </div>
                )}

                {hostInput.trim() && (
                  <div className="pt-2 border-t border-slate-800">
                    <a
                      href={hostInput.startsWith('http') ? hostInput : `https://${hostInput.trim().replace(/^(https?|wss?):\/\//, '').replace(/\/$/, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-colors w-full justify-center"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Mở Trực Tiếp Trên Trình Duyệt Bằng Link Này</span>
                    </a>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#090d16] border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span>Trạng thái:</span>
            <span className={isConnected ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
              {isConnected ? '● Đã Kết Nối Bash' : '○ Chưa Kết Nối'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
