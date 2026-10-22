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
} from 'lucide-react';

interface MobileConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  detectedLanIp?: string;
  currentBridgeHost: string;
  onSaveBridgeHost: (host: string) => void;
  onTestConnection: (host: string) => Promise<boolean>;
  isConnected: boolean;
}

export const MobileConnectModal: React.FC<MobileConnectModalProps> = ({
  isOpen,
  onClose,
  detectedLanIp = '192.168.0.109',
  currentBridgeHost,
  onSaveBridgeHost,
  onTestConnection,
  isConnected,
}) => {
  const [hostInput, setHostInput] = useState<string>(currentBridgeHost || `${detectedLanIp}:3001`);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'error'>('idle');

  // Compute the URL that mobile devices should open
  const mobileAccessUrl = hostInput.startsWith('http://') || hostInput.startsWith('https://')
    ? hostInput
    : `http://${hostInput}`;

  // Generate QR Code whenever mobileAccessUrl changes
  useEffect(() => {
    QRCode.toDataURL(mobileAccessUrl, {
      width: 240,
      margin: 1.5,
      color: {
        dark: '#070b14',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR code generation error:', err));
  }, [mobileAccessUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(mobileAccessUrl);
    sound.playClick();
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHost = hostInput.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (!cleanHost) return;

    setIsTesting(true);
    setTestResult('idle');

    const success = await onTestConnection(cleanHost);
    setIsTesting(false);

    if (success) {
      sound.playSuccess();
      setTestResult('success');
      onSaveBridgeHost(cleanHost);
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
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">
                Kết Nối Bash Laptop Với Điện Thoại
              </h3>
              <p className="text-[11px] text-slate-400">
                Điều khiển Linux Terminal của máy tính trực tiếp từ smartphone
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Status Indicator */}
          <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            isConnected
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
              : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{isConnected ? 'Đang Kết Nối Trực Tiếp Với Laptop' : 'Chưa Kết Nối Máy Tính (Cần Thiết Lập)'}</span>
            </div>
            <span className="font-mono text-[11px] opacity-80">Port 3001</span>
          </div>

          {/* Option 1: Scan QR Code on Mobile */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wide">
              <QrCode className="w-4 h-4 text-cyan-400" />
              <span>Cách 1: Quét Mã QR Mở Nhanh Bằng Điện Thoại</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
              {/* QR Image Box */}
              <div className="p-2.5 bg-white rounded-xl shadow-md shrink-0 flex items-center justify-center">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code Connect Laptop" className="w-36 h-36 rounded" />
                ) : (
                  <div className="w-36 h-36 bg-slate-200 animate-pulse rounded" />
                )}
              </div>

              {/* Instructions */}
              <div className="space-y-2 text-xs text-slate-300">
                <p className="leading-relaxed">
                  1. Đảm bảo điện thoại và laptop đang cùng kết nối vào <strong>chung một mạng Wi-Fi</strong>.
                </p>
                <p className="leading-relaxed">
                  2. Mở Camera hoặc Zalo/Lens trên điện thoại để quét mã QR mở thẳng đường dẫn:
                </p>
                <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-black/60 border border-slate-700 font-mono text-[11px] text-cyan-300 break-all">
                  <span className="flex-1 truncate">{mobileAccessUrl}</span>
                  <button
                    onClick={handleCopy}
                    className="p-1 text-slate-400 hover:text-white shrink-0"
                    title="Sao chép liên kết"
                  >
                    {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Option 2: Custom Host / IP Settings (Useful directly when using on phone) */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wide">
              <Wifi className="w-4 h-4 text-amber-400" />
              <span>Cách 2: Nhập Địa Chỉ IP Hoặc URL Tunnel Của Laptop</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Nếu bạn đang mở web trên điện thoại (ví dụ qua Vercel), hãy nhập địa chỉ IP Wi-Fi của laptop bên dưới để điện thoại tự động kết nối WebSocket:
            </p>

            <form onSubmit={handleTestAndSave} className="space-y-2.5">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={hostInput}
                  onChange={(e) => setHostInput(e.target.value)}
                  placeholder="Ví dụ: 192.168.0.109:3001 hoặc tunnel URL"
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
                      <span>Đang kiểm tra...</span>
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
                  <span>Kết nối thành công tới Bash máy tính! Điện thoại đã sẵn sàng gõ lệnh.</span>
                </div>
              )}

              {testResult === 'error' && (
                <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/50 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Không thể kết nối. Kiểm tra xem laptop đã chạy "npm run bash-server" và cả hai thiết bị có chung mạng Wi-Fi không.</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#090d16] border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            IP Wi-Fi Laptop: {detectedLanIp}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
