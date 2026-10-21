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
    <div className="w-full h-dvh min-h-dvh flex flex-col bg-[#09090b] text-[#f4f4f5]">
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
            <div className="h-10 px-2 sm:px-4 bg-[#111114] border-b border-[#27272a] flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
                <button
                  onClick={() => handleSandboxTabClick('sandbox')}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    activeSandboxTab === 'sandbox'
                      ? 'bg-[#27272a] text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Exploit Sandbox</span>
                </button>

                <button
                  onClick={() => handleSandboxTabClick('packets')}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    activeSandboxTab === 'packets'
                      ? 'bg-[#27272a] text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Packet Inspector</span>
                </button>

                <button
                  onClick={() => handleSandboxTabClick('terminal')}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    activeSandboxTab === 'terminal'
                      ? 'bg-[#27272a] text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Hacker Terminal</span>
                </button>

                <button
                  onClick={() => handleSandboxTabClick('soc')}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    activeSandboxTab === 'soc'
                      ? 'bg-[#27272a] text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>SOC Log Matrix</span>
                </button>

                <button
                  onClick={() => handleSandboxTabClick('roadmap')}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    activeSandboxTab === 'roadmap'
                      ? 'bg-[#27272a] text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>90-Day Roadmap</span>
                </button>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  setIsCheatSheetOpen(true);
                }}
                className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 rounded hover:text-white hover:border-neutral-700 shrink-0 cursor-pointer"
                title="Mở bảng tra cứu nhanh phím tắt và kỹ thuật bảo mật"
              >
                <BookOpen className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
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
