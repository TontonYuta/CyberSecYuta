import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../utils/audio';
import {
  ShieldAlert,
  ShieldCheck,
  Eye,
  EyeOff,
  Sliders,
  Sparkles,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Code2,
  Palette,
  Layout,
  MousePointer2,
  RefreshCw,
  Zap,
  Copy,
  Check,
} from 'lucide-react';

export const UxSecurityTab: React.FC = () => {
  // Clickjacking interactive lab state
  const [iframeOpacity, setIframeOpacity] = useState<number>(0.1);
  const [defenseEnabled, setDefenseEnabled] = useState<boolean>(false);
  const [attackTriggered, setAttackTriggered] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'clickjacking' | 'anti_slop' | 'dark_patterns'>('clickjacking');
  const [copiedFlag, setCopiedFlag] = useState<string | null>(null);

  // Handle lure button click
  const handleLureClick = () => {
    sound.playClick();
    if (defenseEnabled) {
      sound.playSuccess();
      return;
    }
    setAttackTriggered(true);
    sound.playError();
    setTimeout(() => {
      setAttackTriggered(false);
    }, 4000);
  };

  return (
    <div className="flex flex-col h-full bg-[#090d16] text-slate-100 overflow-y-auto">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 border-b border-slate-800/80 bg-gradient-to-b from-[#0f172a] to-[#090d16]">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-2">
            <Palette className="w-4 h-4" /> Chuyên Đề Đặc Biệt: UX/UI & Web Interface Security
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
            Bảo Mật Giao Diện & Tiêu Chuẩn Thiết Kế Hiện Đại (Anti-AI Slop)
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-3xl">
            Tìm hiểu cách thức kẻ tấn công thao túng thị giác người dùng qua kỹ thuật Clickjacking (UI Redressing),
            và ứng dụng các nguyên tắc thiết kế giao diện tối giản, tương phản cao, loại bỏ hoàn toàn các lỗi thẩm mỹ sáo rỗng (AI Slop).
          </p>

          {/* Sub Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={() => setActiveSubTab('clickjacking')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeSubTab === 'clickjacking'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <MousePointer2 className="w-4 h-4" />
              <span>Lab Clickjacking & UI Redressing</span>
            </button>

            <button
              onClick={() => setActiveSubTab('anti_slop')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeSubTab === 'anti_slop'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Bộ Tiêu Chuẩn Chống "AI Slop"</span>
            </button>

            <button
              onClick={() => setActiveSubTab('dark_patterns')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeSubTab === 'dark_patterns'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Nhận Diện Dark Patterns & Phishing UI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-8 max-w-5xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {/* TAB 1: CLICKJACKING LAB */}
          {activeSubTab === 'clickjacking' && (
            <motion.div
              key="clickjacking"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Lab Controls Card */}
              <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800">
                  <div>
                    <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-rose-400" />
                      <span>Thanh Điều Khiển Thị Giác (Visual Transparency)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Kéo thanh trượt để phát hiện lớp bẫy iframe vô hình mà kẻ xấu đặt đè lên màn hình
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setDefenseEnabled(!defenseEnabled);
                        sound.playClick();
                      }}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all ${
                        defenseEnabled
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/50 hover:bg-rose-500/30'
                      }`}
                    >
                      {defenseEnabled ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 text-rose-400" />}
                      <span>{defenseEnabled ? 'ĐÃ BẬT frame-ancestors (An Toàn)' : 'CHƯA BẬT BẢO VỆ (Dễ Bị Tấn Công)'}</span>
                    </button>
                  </div>
                </div>

                {defenseEnabled && (
                  <div className="p-3.5 rounded-xl bg-amber-950/50 border border-amber-500/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs sm:text-sm shadow-md animate-fadeIn">
                    <div className="flex items-center gap-2 text-amber-200 flex-wrap">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="font-bold">Mã cờ chiến thắng (CTF Flag Bài 9):</span>
                      <code className="font-mono bg-black/80 px-2 py-1 rounded text-amber-300 font-extrabold select-all">
                        FLAG&#123;clickjacking_ui_redressing_frame_ancestors_none&#125;
                      </code>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const flagText = 'FLAG{clickjacking_ui_redressing_frame_ancestors_none}';
                        navigator.clipboard.writeText(flagText);
                        sound.playClick();
                        setCopiedFlag(flagText);
                        setTimeout(() => setCopiedFlag(null), 2000);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0"
                    >
                      {copiedFlag === 'FLAG{clickjacking_ui_redressing_frame_ancestors_none}' ? (
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

                {/* Opacity Slider */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-300 shrink-0">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <span>Độ Mờ Lớp Phủ (Opacity): {Math.round(iframeOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={iframeOpacity}
                    onChange={(e) => setIframeOpacity(parseFloat(e.target.value))}
                    className="flex-1 w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                  <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
                    {iframeOpacity < 0.2 ? (
                      <span className="text-rose-400 font-semibold flex items-center gap-1">
                        <EyeOff className="w-3.5 h-3.5" /> Mắt người không nhìn thấy
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> Lộ diện bẫy Iframe
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Interactive Attack Canvas */}
              <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 relative min-h-[380px] flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute top-3 left-4 text-[11px] font-mono text-slate-500">
                  attacker-domain.com/win-prize.html (Trang web mồi chài của tin tặc)
                </div>

                {/* Notification Banner when victim clicks */}
                <AnimatePresence>
                  {attackTriggered && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="absolute top-10 inset-x-4 max-w-md mx-auto p-4 rounded-xl bg-rose-950/90 border border-rose-500/80 text-rose-100 shadow-2xl z-40 text-center"
                    >
                      <div className="flex items-center justify-center gap-2 font-bold text-rose-300 mb-1">
                        <ShieldAlert className="w-5 h-5 text-rose-400" />
                        BẠN VỪA BỊ SẬP BẪY CLICKJACKING!
                      </div>
                      <p className="text-xs text-rose-200">
                        Bạn tưởng rằng mình vừa ấn vào nút <strong>"Nhận 500K"</strong>, nhưng thực ra ngón tay bạn vừa ấn trúng nút <strong>"Xác Nhận Chuyển 50.000.000 VNĐ"</strong> trên tài khoản ngân hàng nhúng ngầm bên dưới!
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Simulated Web Container */}
                <div className="relative w-full max-w-md h-64 rounded-xl bg-slate-900 border border-slate-700/80 p-5 shadow-2xl flex flex-col items-center justify-center text-center">
                  {/* UNDERLYING VICTIM IFRAME (The sensitive action) */}
                  <div
                    style={{ opacity: defenseEnabled ? 0.05 : iframeOpacity }}
                    className={`absolute inset-4 rounded-lg bg-slate-800 border-2 border-dashed ${
                      defenseEnabled ? 'border-emerald-500/40' : 'border-rose-500'
                    } p-4 flex flex-col items-center justify-center z-10 transition-opacity duration-300 pointer-events-none`}
                  >
                    <div className="text-[11px] font-mono font-semibold text-rose-400 mb-1">
                      [Iframe Ngân Hàng]: ibank.target-victim.com/transfer
                    </div>
                    <p className="text-xs text-slate-300 mb-3">
                      Lệnh chuyển tiền: <strong>50.000.000 VNĐ</strong> tới STK <strong>9999-HACKER</strong>
                    </p>
                    <button className="px-5 py-2.5 rounded-lg bg-rose-600 font-bold text-xs text-white shadow-lg shadow-rose-900/50">
                      🔴 Xác Nhận Chuyển Khoản Ngay
                    </button>
                  </div>

                  {/* IFRAME BLOCKED OVERLAY (When defense header is active) */}
                  {defenseEnabled && (
                    <div className="absolute inset-4 rounded-lg bg-slate-950/95 border border-emerald-500/60 p-4 flex flex-col items-center justify-center z-20 text-center">
                      <Lock className="w-8 h-8 text-emerald-400 mb-2" />
                      <div className="font-semibold text-emerald-300 text-sm">
                        Trình Duyệt Đã Chặn Lồng Khung!
                      </div>
                      <p className="text-xs text-slate-400 max-w-xs mt-1">
                        Header <code>Content-Security-Policy: frame-ancestors 'none'</code> đã ngăn chặn trang web ngân hàng bị nhúng vào iframe của kẻ xấu.
                      </p>
                    </div>
                  )}

                  {/* VISIBLE LURE BUTTON (What the victim sees) */}
                  <div className="relative z-0 space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
                      🎉 Vòng Quay May Mắn Trúng Thưởng
                    </div>
                    <h4 className="text-base font-bold text-white">
                      Chúc mừng bạn trúng giải đặc biệt!
                    </h4>
                    <p className="text-xs text-slate-400 max-w-xs">
                      Bấm vào nút bên dưới trong 30 giây để nhận phần quà 500.000 VNĐ vào ví.
                    </p>
                    <button
                      onClick={handleLureClick}
                      className="px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-950/50 cursor-pointer active:scale-95 transition-all"
                    >
                      🎁 Bấm Nhận 500.000 VNĐ Ngay!
                    </button>
                  </div>
                </div>
              </div>

              {/* Code Remediation Guide */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs mb-2">
                    <ShieldAlert className="w-4 h-4" /> Nguyên Nhân Gây Lỗ Hổng
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Website mục tiêu thiếu vắng các HTTP Response Headers quy định quyền hạn nhúng khung. Do đó, bất kỳ trang web độc hại nào cũng có thể nhúng trang của bạn vào thẻ <code>&lt;iframe&gt;</code> và dùng CSS <code>opacity: 0</code> để lừa nạn nhân click.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-2">
                    <ShieldCheck className="w-4 h-4" /> Cách Vá Lỗi Chuẩn Quốc Tế
                  </div>
                  <pre className="p-2.5 rounded bg-black/60 font-mono text-[11px] text-emerald-300 overflow-x-auto border border-emerald-900/40">
{`// Cấu hình Nginx hoặc Express Server:
Content-Security-Policy: frame-ancestors 'none';
X-Frame-Options: DENY;`}
                  </pre>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: ANTI-AI SLOP DESIGN MATRIX */}
          {activeSubTab === 'anti_slop' && (
            <motion.div
              key="anti_slop"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <span>Tuyên Ngôn Thiết Kế Tối Giản: Loại Bỏ Hoàn Toàn "AI Slop"</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                  Dựa trên khảo sát các bài phân tích thiết kế UI/UX hiện đại (như Medium, Impeccable Style, Paralect), các sản phẩm do AI sinh code tự động thường rơi vào vết xe đổ: lạm dụng gradient tím xanh nhòe nhoẹt, card chia 3 cột rập khuôn, và typography vô hồn. Dưới đây là bộ quy chuẩn đối sánh giúp sản phẩm đạt chuẩn tinh tế của kỹ sư thực thụ:
                </p>

                {/* Comparison Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Flaw Column */}
                  <div className="p-5 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-4">
                    <div className="flex items-center gap-2 font-bold text-rose-300 text-sm pb-2 border-b border-rose-900/40">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      5 Dấu Vết Đặc Trưng Của "AI Slop UI"
                    </div>

                    <ul className="space-y-3 text-xs text-rose-200/90 leading-relaxed">
                      <li className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold">1.</span>
                        <span><strong>Gradient Tím & Glow Nhòe Bừa Bãi:</strong> Phủ các vệt màu neon vô nghĩa lên mọi góc màn hình làm đau mắt và giảm độ tương phản văn bản.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold">2.</span>
                        <span><strong>Ma Trận Thẻ Rác (Card Overload):</strong> Nhồi nhét hàng chục khung viền nhỏ có cùng kích cỡ, khiến người dùng không biết đâu là trọng tâm cần nhìn.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold">3.</span>
                        <span><strong>Hiệu Ứng Nảy Tưng Tưng Vô Bổ:</strong> Mọi nút bấm hay hover đều co giãn, nảy đàn hồi quá mức gây chóng mặt và trễ thao tác.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold">4.</span>
                        <span><strong>Biệt Ngữ Sáo Rỗng:</strong> Dùng từ ngữ bóng bẩy như "Nâng tầm chuyển đổi số toàn diện" thay vì miêu tả hành động kỹ thuật cụ thể.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold">5.</span>
                        <span><strong>Mô Phỏng Ảo Thay Vì Thật:</strong> Chỉ cung cấp câu trả lời giả lập lặp đi lặp lại mà không kết nối với môi trường thực tế (như Bash thật trên máy).</span>
                      </li>
                    </ul>
                  </div>

                  {/* Clean Craft Column */}
                  <div className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-4">
                    <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm pb-2 border-b border-emerald-900/40">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Tiêu Chuẩn Thiết Kế Đích Thực (High Craft)
                    </div>

                    <ul className="space-y-3 text-xs text-emerald-200/90 leading-relaxed">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">1.</span>
                        <span><strong>Nền Than Lì & Tương Phản Sắc Nét:</strong> Sử dụng tone Slate Charcoal (`#090d16` & `#0f172a`), màu chữ đạt chuẩn WCAG AA (&gt;4.5:1), dễ đọc ngoài trời.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">2.</span>
                        <span><strong>Phân Cấp Thị Giác Rõ Rệt:</strong> Không gian chính dành cho Bàn Thực Hành (Workbench), các bảng chú thích phụ được thu gọn tinh tế.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">3.</span>
                        <span><strong>Micro-Animations Có Mục Đích:</strong> Hiệu ứng chuyển động nhẹ (Spring Physics, scale 0.98 khi chạm) tạo cảm giác xúc giác cơ học chân thực.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">4.</span>
                        <span><strong>Văn Phong Bình Dân (Anti-Jargon):</strong> Giải thích trực tiếp bằng các ẩn dụ đời thường (quầy lễ tân, khóa cửa phòng khách sạn).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">5.</span>
                        <span><strong>Công Cụ Trực Tiếp (Zero-Friction Sandbox):</strong> Tích hợp trực tiếp môi trường thực hành bảo mật chạy 100% độc lập trên trình duyệt và di động.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: DARK PATTERNS & PHISHING UI */}
          {activeSubTab === 'dark_patterns' && (
            <motion.div
              key="dark_patterns"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <span>Các Mẫu Giao Diện Lừa Đảo (Dark Patterns & Visual Phishing)</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                  Kỹ sư an toàn thông tin và nhà thiết kế sản phẩm cần nhận diện được các chiêu trò thiết kế giao diện bẫy người dùng để phòng chống và bảo vệ khách hàng:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="font-bold text-xs text-amber-300">1. Nút Đóng Giả (Fake Close Button)</div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Tạo biểu tượng dấu nhân (X) nằm ở góc popup, nhưng khi người dùng bấm vào thì lại mở ra một trang tải mã độc hoặc kích hoạt mua hàng ngầm.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="font-bold text-xs text-amber-300">2. Nút Tải Xuống Ngụy Trang (Disguised Ad)</div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Đặt một banner quảng cáo màu xanh lá cây to bản có chữ "DOWNLOAD" nằm ngay cạnh nút tải thật của phần mềm để đánh lừa người dùng bấm nhầm.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="font-bold text-xs text-amber-300">3. Bẫy Tự Động Tích Chọn (Pre-checked Box)</div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Tự động đánh dấu sẵn ô "Tôi đồng ý chia sẻ toàn bộ danh bạ và gia hạn gói cước 500K/tháng" với cỡ chữ siêu nhỏ màu xám nhạt khó nhận biết.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
