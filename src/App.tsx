import React, { useState, useEffect } from 'react';
import { ActiveTab } from './types';
import { Header, AppMode } from './components/Header';
import { LinearAcademyView } from './components/LinearAcademyView';
import { SandboxTab } from './components/SandboxTab';
import { PacketInspectorTab } from './components/PacketInspectorTab';
import { HackerTerminalTab } from './components/HackerTerminalTab';
import { SocLogMatrixTab } from './components/SocLogMatrixTab';
import { RoadmapTab } from './components/RoadmapTab';
import { QuickCheatSheetModal } from './components/QuickCheatSheetModal';
import { GraduationModal } from './components/GraduationModal';
import { sound } from './utils/audio';
import { Zap, Activity, Terminal, Shield, Compass, BookOpen } from 'lucide-react';

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>('academy');
  const [activeSandboxTab, setActiveSandboxTab] = useState<ActiveTab>('sandbox');
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState<boolean>(false);
  const [isGraduationOpen, setIsGraduationOpen] = useState<boolean>(false);
  const [completedCount, setCompletedCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('cybersec_curriculum_completed');
      if (saved) return JSON.parse(saved).length;
    } catch {
      // Fallback
    }
    return 0;
  });

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setIsCheatSheetOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsCheatSheetOpen(false);
        setIsGraduationOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSandboxTabClick = (tab: ActiveTab) => {
    sound.playClick();
    setActiveSandboxTab(tab);
  };

  return (
    <div className="w-full h-dvh min-h-dvh flex flex-col bg-[#0b0f19] text-[#f1f5f9]">
      {/* Top Header Bar */}
      <Header
        appMode={appMode}
        onAppModeChange={setAppMode}
        activeSandboxTab={activeSandboxTab}
        onSandboxTabChange={setActiveSandboxTab}
        onOpenGraduationModal={() => setIsGraduationOpen(true)}
        completedLessonsCount={completedCount}
      />

      {/* Main Workspace Router */}
      <main className="flex-1 w-full min-h-0 overflow-hidden flex flex-col">
        {appMode === 'academy' ? (
          <LinearAcademyView
            onOpenGraduationModal={() => setIsGraduationOpen(true)}
            onUpdateCompletedCount={setCompletedCount}
          />
        ) : (
          <div className="flex-1 w-full h-full flex flex-col overflow-hidden min-h-0">
            {/* Free Sandbox Sub-Navbar */}
            <div className="h-12 px-2.5 sm:px-4 bg-[#0e1424] border-b border-[#1e293b] flex items-center justify-between gap-2 shrink-0 shadow-sm">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                <button
                  onClick={() => handleSandboxTabClick('sandbox')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeSandboxTab === 'sandbox'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm shadow-amber-950/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Exploit Sandbox</span>
                </button>

                <button
                  onClick={() => handleSandboxTabClick('packets')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeSandboxTab === 'packets'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50 shadow-sm shadow-blue-950/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Packet Inspector</span>
                </button>

                <button
                  onClick={() => handleSandboxTabClick('terminal')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeSandboxTab === 'terminal'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm shadow-emerald-950/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Hacker Terminal</span>
                </button>

                <button
                  onClick={() => handleSandboxTabClick('soc')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeSandboxTab === 'soc'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm shadow-rose-950/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>SOC Log Matrix</span>
                </button>

                <button
                  onClick={() => handleSandboxTabClick('roadmap')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeSandboxTab === 'roadmap'
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/50 shadow-sm shadow-teal-950/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>90-Day Roadmap</span>
                </button>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  setIsCheatSheetOpen(true);
                }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700 rounded-lg hover:text-white hover:border-slate-500 shrink-0 cursor-pointer shadow-sm"
                title="Mở bảng tra cứu nhanh phím tắt và kỹ thuật bảo mật"
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="hidden sm:inline">Cheatsheet (?)</span>
                <span className="sm:hidden">(?)</span>
              </button>
            </div>

            {/* Sandbox Views */}
            <div className="flex-1 w-full min-h-0 overflow-hidden">
              {activeSandboxTab === 'sandbox' && <SandboxTab />}
              {activeSandboxTab === 'packets' && <PacketInspectorTab />}
              {activeSandboxTab === 'terminal' && <HackerTerminalTab />}
              {activeSandboxTab === 'soc' && <SocLogMatrixTab />}
              {activeSandboxTab === 'roadmap' && <RoadmapTab />}
            </div>
          </div>
        )}
      </main>

      {/* Graduation & Job-Ready Portfolio Modal */}
      <GraduationModal
        isOpen={isGraduationOpen}
        onClose={() => setIsGraduationOpen(false)}
        completedLessonsCount={completedCount}
      />

      {/* Quick Security Reference Modal */}
      <QuickCheatSheetModal
        isOpen={isCheatSheetOpen}
        onClose={() => setIsCheatSheetOpen(false)}
      />
    </div>
  );
}
