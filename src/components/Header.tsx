import React, { useState } from 'react';
import { ActiveTab } from '../types';
import {
  Shield,
  Zap,
  Terminal,
  Activity,
  Compass,
  BookOpen,
  Volume2,
  VolumeX,
  Award,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { sound } from '../utils/audio';

export type AppMode = 'academy' | 'sandbox_mode';

interface HeaderProps {
  appMode: AppMode;
  onAppModeChange: (mode: AppMode) => void;
  activeSandboxTab: ActiveTab;
  onSandboxTabChange: (tab: ActiveTab) => void;
  onOpenGraduationModal: () => void;
  completedLessonsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  appMode,
  onAppModeChange,
  activeSandboxTab,
  onSandboxTabChange,
  onOpenGraduationModal,
  completedLessonsCount,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(sound.isMuted);

  const handleToggleMute = () => {
    const nextState = !isMuted;
    sound.isMuted = nextState;
    setIsMuted(nextState);
    if (!nextState) {
      sound.playClick();
    }
  };

  // Rank label logic
  const getRankBadge = (count: number) => {
    if (count >= 12) return { text: '🏆 SẴN SÀNG ĐI LÀM (JOB-READY)', short: '🏆 Job-Ready', color: 'text-emerald-300 bg-emerald-950/80 border-emerald-500' };
    if (count >= 8) return { text: '🛡️ SOC Analyst', short: '🛡️ SOC L1', color: 'text-purple-300 bg-purple-950/80 border-purple-600/60' };
    if (count >= 4) return { text: '⚡ Junior Pentester', short: '⚡ Pentester', color: 'text-blue-300 bg-blue-950/80 border-blue-600/60' };
    return { text: '🌱 Khởi động', short: '🌱 Mới học', color: 'text-amber-300 bg-amber-950/80 border-amber-600/60' };
  };

  const progressPct = Math.round((completedLessonsCount / 12) * 100);
  const rank = getRankBadge(completedLessonsCount);

  return (
    <header className="h-12 w-full bg-[#09090b] border-b border-[#27272a] px-2.5 sm:px-4 flex items-center justify-between gap-2 shrink-0 z-40">
      {/* Zone 1: Brand title & Rank Badge */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-red-950/70 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0">
            <Shield className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xs sm:text-sm tracking-tight text-white flex items-center gap-1.5 whitespace-nowrap">
              CyberSec<span className="text-emerald-400">Yuta</span>
              <span className="hidden xl:inline text-neutral-400 font-normal text-xs">
                — Lộ Trình 12 Bài Thực Chiến Chuẩn Nghề
              </span>
            </span>
          </div>
        </div>

        {/* Dynamic Rank Badge */}
        <span
          className={`text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded border font-semibold whitespace-nowrap hidden sm:inline-block ${rank.color}`}
        >
          <span className="hidden md:inline">{rank.text}</span>
          <span className="md:hidden">{rank.short}</span>
        </span>
      </div>

      {/* Zone 2: Progress Bar & Mode Switcher */}
      <div className="flex items-center gap-2 sm:gap-3 justify-center">
        {/* Graduation Progress Bar (Desktop only) */}
        <div className="flex-1 max-w-xs hidden lg:flex flex-col gap-1 min-w-[140px]">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-neutral-400">Tiến độ tốt nghiệp:</span>
            <span className="text-emerald-400 font-bold tabular-nums">
              {completedLessonsCount}/12 ({progressPct}%)
            </span>
          </div>
          <div className="w-full h-1.5 bg-neutral-900 border border-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Mode Switcher: Học Viện Theo Bài vs Chế Độ Tự Do */}
        <div className="flex items-center p-0.5 bg-[#121215] border border-[#27272a] rounded-md shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              onAppModeChange('academy');
            }}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
              appMode === 'academy'
                ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-600/60 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Học Viện Tuyến Tính</span>
            <span className="sm:hidden">Học Viện</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onAppModeChange('sandbox_mode');
            }}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
              appMode === 'sandbox_mode'
                ? 'bg-neutral-800 text-white border border-neutral-600 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Chế Độ Tự Do</span>
            <span className="sm:hidden">Sandbox</span>
          </button>
        </div>
      </div>

      {/* Zone 3: Graduation Portfolio CTA & Sound Mute Toggle */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          onClick={handleToggleMute}
          className="p-1.5 text-neutral-400 hover:text-white bg-[#121215] border border-[#27272a] rounded transition-colors"
          title={isMuted ? 'Bật âm thanh (Unmute)' : 'Tắt âm thanh (Mute)'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-neutral-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
        </button>

        {/* Graduation Portfolio Button (Glowing emerald when 100%) */}
        <button
          onClick={() => {
            sound.playSuccess();
            onOpenGraduationModal();
          }}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded transition-all whitespace-nowrap shadow-sm cursor-pointer ${
            completedLessonsCount >= 12
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] border border-emerald-400 animate-pulse'
              : 'bg-[#141418] border border-neutral-700 text-emerald-300 hover:border-emerald-500 hover:text-white'
          }`}
          title="Xem chứng chỉ tốt nghiệp và xuất hồ sơ tuyển dụng Portfolio"
        >
          <Award className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="hidden sm:inline">Xem Bằng & Hồ Sơ Xin Việc</span>
          <span className="sm:hidden">Bằng & CV</span>
        </button>
      </div>
    </header>
  );
};
