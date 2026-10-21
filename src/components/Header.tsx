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
    <header className="h-14 w-full bg-[#0d1322] border-b border-[#1e293b] px-3 sm:px-4 flex items-center justify-between gap-2 shrink-0 z-40 select-none shadow-md">
      {/* Zone 1: Brand title & Rank Badge */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-950/80 border border-rose-500/60 flex items-center justify-center text-rose-400 shrink-0 shadow-sm shadow-rose-950/50">
            <Shield className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5 whitespace-nowrap">
              CyberSec<span className="text-emerald-400 font-black">Yuta</span>
              <span className="hidden xl:inline text-slate-400 font-normal text-xs ml-1">
                — Lộ Trình 12 Bài Thực Chiến Chuẩn Nghề
              </span>
            </span>
          </div>
        </div>

        {/* Dynamic Rank Badge */}
        <span
          className={`text-xs font-mono px-2 py-0.5 rounded-full border font-semibold whitespace-nowrap hidden sm:inline-block ${rank.color}`}
        >
          <span className="hidden md:inline">{rank.text}</span>
          <span className="md:hidden">{rank.short}</span>
        </span>
      </div>

      {/* Zone 2: Progress Bar & Mode Switcher */}
      <div className="flex items-center gap-2 sm:gap-4 justify-center">
        {/* Graduation Progress Bar (Desktop only) */}
        <div className="flex-1 max-w-xs hidden lg:flex flex-col gap-1 min-w-[140px]">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 font-medium">Tiến độ tốt nghiệp:</span>
            <span className="text-emerald-400 font-bold tabular-nums">
              {completedLessonsCount}/12 ({progressPct}%)
            </span>
          </div>
          <div className="w-full h-2 bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Mode Switcher: Học Viện Theo Bài vs Chế Độ Tự Do */}
        <div className="flex items-center p-1 bg-slate-950/90 border border-slate-800 rounded-lg shrink-0 shadow-inner">
          <button
            onClick={() => {
              sound.playClick();
              onAppModeChange('academy');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap cursor-pointer ${
              appMode === 'academy'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-emerald-300" />
            <span className="hidden sm:inline">Học Viện (12 Bài)</span>
            <span className="sm:hidden">Học Viện</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onAppModeChange('sandbox_mode');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap cursor-pointer ${
              appMode === 'sandbox_mode'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 text-blue-300" />
            <span className="hidden sm:inline">Sandbox Tự Do</span>
            <span className="sm:hidden">Sandbox</span>
          </button>
        </div>
      </div>

      {/* Zone 3: Graduation Portfolio CTA & Sound Mute Toggle */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleToggleMute}
          className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white bg-slate-950/80 border border-slate-800 rounded-lg transition-colors cursor-pointer"
          title={isMuted ? 'Bật âm thanh (Unmute)' : 'Tắt âm thanh (Mute)'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* Graduation Portfolio Button (Glowing emerald when 100%) */}
        <button
          onClick={() => {
            sound.playSuccess();
            onOpenGraduationModal();
          }}
          className={`h-9 flex items-center gap-1.5 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap shadow-sm cursor-pointer ${
            completedLessonsCount >= 12
              ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-950/80 border border-emerald-400 animate-pulse'
              : 'bg-slate-900 border border-slate-700 text-emerald-300 hover:border-emerald-500 hover:text-white'
          }`}
          title="Xem chứng chỉ tốt nghiệp và xuất hồ sơ tuyển dụng Portfolio"
        >
          <Award className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="hidden sm:inline">Xem Bằng & Hồ Sơ Xin Việc</span>
          <span className="sm:hidden">Bằng & CV</span>
        </button>
      </div>
    </header>
  );
};
