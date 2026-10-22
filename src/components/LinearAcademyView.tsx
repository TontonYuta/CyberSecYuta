import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CURRICULUM_LESSONS, MODULES_INFO, CurriculumLesson } from '../data/curriculumData';
import { sound } from '../utils/audio';
import { HackerTerminalTab } from './HackerTerminalTab';
import { PacketInspectorTab } from './PacketInspectorTab';
import { SandboxTab } from './SandboxTab';
import { SocLogMatrixTab } from './SocLogMatrixTab';
import { RoadmapTab } from './RoadmapTab';
import { UxSecurityTab } from './UxSecurityTab';
import {
  Lock,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Briefcase,
  Terminal,
  Activity,
  ShieldAlert,
  FileText,
  Award,
  Sparkles,
  Unlock,
  RotateCcw,
  AlertTriangle,
  Maximize2,
  Minimize2,
  Zap,
  Flag,
  Code2,
  Copy,
  Lightbulb,
  Check,
  ShieldCheck,
  Palette,
  ArrowRight,
  ArrowLeft,
  Layers,
  Flame,
  ListOrdered,
} from 'lucide-react';

export type LessonStep = 'theory' | 'example' | 'workbench' | 'ctf' | 'quiz';

interface StepMeta {
  id: LessonStep;
  index: number;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

const LESSON_STEPS: StepMeta[] = [
  { id: 'theory', index: 1, label: '1. Lý Thuyết Nền Tảng', shortLabel: 'Lý Thuyết', icon: BookOpen, accentColor: 'text-cyan-400' },
  { id: 'example', index: 2, label: '2. Code Mẫu Đối Chiếu', shortLabel: 'Code Mẫu', icon: Code2, accentColor: 'text-amber-400' },
  { id: 'workbench', index: 3, label: '3. Bàn Thực Hành', shortLabel: 'Thực Hành', icon: Zap, accentColor: 'text-emerald-400' },
  { id: 'ctf', index: 4, label: '4. Cướp Cờ (CTF)', shortLabel: 'Cướp Cờ', icon: Flag, accentColor: 'text-rose-400' },
  { id: 'quiz', index: 5, label: '5. Phỏng Vấn & Đố Vui', shortLabel: 'Trắc Nghiệm', icon: Briefcase, accentColor: 'text-purple-400' },
];

interface LinearAcademyViewProps {
  onOpenGraduationModal: () => void;
  onUpdateCompletedCount: (count: number) => void;
}

export const LinearAcademyView: React.FC<LinearAcademyViewProps> = ({
  onOpenGraduationModal,
  onUpdateCompletedCount,
}) => {
  // Curriculum state persisted in localStorage
  const [unlockedLessons, setUnlockedLessons] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('cybersec_curriculum_unlocked');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [1]; // Lesson 1 unlocked by default
  });

  const [completedLessons, setCompletedLessons] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('cybersec_curriculum_completed');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [];
  });

  const [activeLessonId, setActiveLessonId] = useState<number>(1);
  const [mobileTab, setMobileTab] = useState<'curriculum' | 'lesson'>('lesson');
  const [lessonStep, setLessonStep] = useState<LessonStep>('theory');
  const [viewMode, setViewMode] = useState<'step' | 'all'>('step');
  const [isFullscreenWorkbench, setIsFullscreenWorkbench] = useState<boolean>(false);

  // Exit challenge state
  const [selectedChallengeOption, setSelectedChallengeOption] = useState<string>('');
  const [challengeFeedback, setChallengeFeedback] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });

  // CTF Challenge state
  const [ctfInput, setCtfInput] = useState<string>('');
  const [ctfStatus, setCtfStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showCtfHint, setShowCtfHint] = useState<boolean>(false);
  const [copiedCodeSnippet, setCopiedCodeSnippet] = useState<string | null>(null);

  const activeLesson =
    CURRICULUM_LESSONS.find((l) => l.id === activeLessonId) || CURRICULUM_LESSONS[0];

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cybersec_curriculum_unlocked', JSON.stringify(unlockedLessons));
      localStorage.setItem('cybersec_curriculum_completed', JSON.stringify(completedLessons));
    } catch {
      // Ignore
    }
    onUpdateCompletedCount(completedLessons.length);
  }, [unlockedLessons, completedLessons, onUpdateCompletedCount]);

  // Reset challenge & CTF when active lesson changes
  useEffect(() => {
    setSelectedChallengeOption('');
    setChallengeFeedback({ status: 'idle', message: '' });
    setCtfInput('');
    setCtfStatus('idle');
    setShowCtfHint(false);
    setLessonStep('theory');
  }, [activeLessonId]);

  const handleSelectLesson = (lessonId: number) => {
    const isUnlocked = unlockedLessons.includes(lessonId);
    if (!isUnlocked) {
      sound.playError();
      return;
    }
    sound.playClick();
    setActiveLessonId(lessonId);
    setMobileTab('lesson');
    setLessonStep('theory');
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    sound.playClick();
    setCopiedCodeSnippet(id);
    setTimeout(() => setCopiedCodeSnippet(null), 2000);
  };

  const handleVerifyCtf = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const input = ctfInput.trim();
    if (!input) return;

    if (input.toLowerCase() === activeLesson.ctf.flag.toLowerCase()) {
      sound.playSuccess();
      setCtfStatus('success');
    } else {
      sound.playError();
      setCtfStatus('error');
    }
  };

  const handleSubmitExitChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallengeOption) return;

    if (selectedChallengeOption === activeLesson.exitChallenge.correctOptionId) {
      sound.playSuccess();
      setChallengeFeedback({
        status: 'success',
        message: `Chính xác! ${activeLesson.exitChallenge.explanation}`,
      });

      if (!completedLessons.includes(activeLessonId)) {
        setCompletedLessons((prev) => [...prev, activeLessonId]);
      }

      const nextId = activeLessonId + 1;
      if (nextId <= CURRICULUM_LESSONS.length && !unlockedLessons.includes(nextId)) {
        setUnlockedLessons((prev) => [...prev, nextId]);
      }

      if (activeLessonId === CURRICULUM_LESSONS.length) {
        setTimeout(() => {
          onOpenGraduationModal();
        }, 1200);
      } else {
        setTimeout(() => {
          setActiveLessonId(nextId);
        }, 1500);
      }
    } else {
      sound.playError();
      setChallengeFeedback({
        status: 'error',
        message: 'Chưa chính xác! Hãy đọc lại tóm tắt lý thuyết hoặc ví dụ mẫu và thử lại nhé.',
      });
    }
  };

  const handleResetProgress = () => {
    sound.playClick();
    setUnlockedLessons([1]);
    setCompletedLessons([]);
    setActiveLessonId(1);
    setLessonStep('theory');
  };

  // Step navigation helpers
  const handleNextStep = () => {
    sound.playClick();
    switch (lessonStep) {
      case 'theory':
        setLessonStep('example');
        break;
      case 'example':
        setLessonStep('workbench');
        break;
      case 'workbench':
        setLessonStep('ctf');
        break;
      case 'ctf':
        setLessonStep('quiz');
        break;
      case 'quiz':
        if (completedLessons.includes(activeLessonId)) {
          if (activeLessonId < CURRICULUM_LESSONS.length) {
            setActiveLessonId(activeLessonId + 1);
          } else {
            onOpenGraduationModal();
          }
        }
        break;
    }
  };

  const handlePrevStep = () => {
    sound.playClick();
    switch (lessonStep) {
      case 'quiz':
        setLessonStep('ctf');
        break;
      case 'ctf':
        setLessonStep('workbench');
        break;
      case 'workbench':
        setLessonStep('example');
        break;
      case 'example':
        setLessonStep('theory');
        break;
      case 'theory':
        setMobileTab('curriculum');
        break;
    }
  };

  const getToolIcon = (toolType: string) => {
    switch (toolType) {
      case 'terminal':
        return <Terminal className="w-3.5 h-3.5 text-emerald-400" />;
      case 'wireshark':
        return <Activity className="w-3.5 h-3.5 text-cyan-400" />;
      case 'sandbox_sqli':
      case 'sandbox_rce':
      case 'sandbox_idor':
      case 'sandbox_xss':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />;
      case 'ux_security':
        return <Palette className="w-3.5 h-3.5 text-purple-400" />;
      case 'soc_log':
        return <Activity className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Award className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  const currentStepMeta = LESSON_STEPS.find((s) => s.id === lessonStep) || LESSON_STEPS[0];

  return (
    <div className="w-full h-full flex flex-col bg-[#070b14] overflow-hidden select-none">
      {/* Mobile Top View Switcher (Mục Lục vs Bài Đang Học) */}
      <div className="lg:hidden flex items-center justify-between p-2 bg-[#0c1220] border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-1.5 w-full">
          <button
            onClick={() => {
              sound.playClick();
              setMobileTab('curriculum');
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all min-h-[44px] cursor-pointer ${
              mobileTab === 'curriculum'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Mục Lục ({CURRICULUM_LESSONS.length} Bài)</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setMobileTab('lesson');
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all min-h-[44px] cursor-pointer ${
              mobileTab === 'lesson'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Bài {activeLesson.id}: {activeLesson.title.split(':')[0]}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 w-full h-full flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* SIDEBAR: DANH SÁCH BÀI HỌC (28% desktop, full on mobile when active) */}
        <div
          className={`w-full lg:w-[28%] h-full flex flex-col border-r border-slate-800 bg-[#090d16] shrink-0 min-h-0 ${
            mobileTab === 'curriculum' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Header Sidebar */}
          <div className="p-3.5 border-b border-slate-800 bg-[#0c1220] flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Lộ Trình Tuyến Tính</span>
              </h2>
              <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                Hoàn thành: {completedLessons.length}/{CURRICULUM_LESSONS.length} bài
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleResetProgress}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800/80 text-slate-400 hover:text-rose-400 border border-slate-700/60 transition-colors cursor-pointer"
                title="Làm mới tiến độ học về Bài 1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Làm Mới</span>
              </button>
            </div>
          </div>

          {/* List of Lessons grouped by Module */}
          <div className="flex-1 overflow-y-auto p-2 space-y-4">
            {MODULES_INFO.map((mod) => {
              const moduleLessons = CURRICULUM_LESSONS.filter((l) => l.moduleId === mod.id);
              return (
                <div key={mod.id} className="space-y-1.5">
                  <div className="px-2 pt-1 pb-1">
                    <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                      {mod.name}
                    </span>
                    <span className="text-[10px] text-slate-500 line-clamp-1">{mod.desc}</span>
                  </div>

                  <div className="space-y-1">
                    {moduleLessons.map((lesson) => {
                      const isUnlocked = unlockedLessons.includes(lesson.id);
                      const isCompleted = completedLessons.includes(lesson.id);
                      const isActive = activeLessonId === lesson.id;

                      return (
                        <div
                          key={lesson.id}
                          onClick={() => handleSelectLesson(lesson.id)}
                          className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center gap-2.5 min-h-[48px] ${
                            isActive
                              ? 'bg-slate-800/90 border-emerald-500/60 text-white shadow-sm'
                              : isUnlocked
                              ? 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700 cursor-pointer'
                              : 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-60 cursor-not-allowed'
                          }`}
                        >
                          <div className="w-6 h-6 rounded-md bg-slate-950 flex items-center justify-center shrink-0 border border-slate-800">
                            {isCompleted ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : isUnlocked ? (
                              getToolIcon(lesson.toolType)
                            ) : (
                              <Lock className="w-3 h-3 text-slate-600" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold truncate leading-tight">
                              {lesson.title}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate mt-0.5">
                              {lesson.subtitle}
                            </div>
                          </div>

                          {isActive && (
                            <ChevronRight className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MAIN LESSON VIEW (72% desktop, full on mobile when active) */}
        <div
          className={`w-full lg:w-[72%] h-full flex flex-col bg-[#070b14] overflow-hidden min-h-0 ${
            mobileTab === 'lesson' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Top Headline Bar */}
          <div className="px-3 sm:px-4 py-2.5 bg-[#0c1220] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider truncate">
                {activeLesson.moduleName}
              </div>
              <h2 className="text-xs sm:text-sm md:text-base font-bold text-white flex items-center gap-2 mt-0.5 truncate">
                <span className="truncate">{activeLesson.title}</span>
                {completedLessons.includes(activeLesson.id) && (
                  <span className="text-[10px] sm:text-[11px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/60 px-2 py-0.5 rounded-md flex items-center gap-1 font-semibold shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ĐÃ HOÀN THÀNH
                  </span>
                )}
              </h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Desktop View Switcher: Từng bước vs Tất cả */}
              <div className="hidden md:flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-lg">
                <button
                  onClick={() => {
                    sound.playClick();
                    setViewMode('step');
                  }}
                  className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
                    viewMode === 'step' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Chế độ học tập trung từng bước (chống ngợp)"
                >
                  Từng Bước
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    setViewMode('all');
                  }}
                  className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
                    viewMode === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Xem toàn bộ bài học trên một trang"
                >
                  Xem Hết
                </button>
              </div>

              <span className="text-xs font-mono font-bold text-slate-300 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md">
                Bài {activeLesson.id}/{CURRICULUM_LESSONS.length}
              </span>
            </div>
          </div>

          {/* Mobile & Desktop Segmented Stepper / Navigation Tabs */}
          <div className="px-2 sm:px-3 py-1.5 bg-[#0a0f1c] border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {LESSON_STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = lessonStep === step.id;
              const isPassedQuiz = step.id === 'quiz' && completedLessons.includes(activeLesson.id);
              const isPassedCtf = step.id === 'ctf' && ctfStatus === 'success';

              return (
                <button
                  key={step.id}
                  onClick={() => {
                    sound.playClick();
                    setLessonStep(step.id);
                    if (viewMode === 'all') setViewMode('step');
                  }}
                  className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all border cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 text-white border-emerald-500/60 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:bg-slate-800/40 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? step.accentColor : 'text-slate-400'}`} />
                  <span>{step.shortLabel}</span>
                  {isPassedQuiz && <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-0.5" />}
                  {isPassedCtf && <Check className="w-3 h-3 text-emerald-400 ml-0.5" />}
                </button>
              );
            })}
          </div>

          {/* Main Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 pb-24 lg:pb-6 space-y-5">
            {/* 1. LÝ THUYẾT NỀN TẢNG (THEORY) */}
            {(viewMode === 'all' || lessonStep === 'theory') && (
              <div className="p-4 sm:p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-cyan-300 uppercase tracking-wide">
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    <span>1. Lý Thuyết Nền Tảng & Bản Chất Kỹ Thuật</span>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400/80 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded">
                    Bước 1/5
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {activeLesson.theory.plainExplanation}
                </p>

                <div className="p-3 sm:p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Các điểm cốt lõi cần nhớ:
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside leading-relaxed pl-1">
                    {activeLesson.theory.summary.map((point, idx) => (
                      <li key={idx} className="marker:text-cyan-400">{point}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 font-medium flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Điểm mấu chốt:</strong> {activeLesson.theory.keyTakeaway}</span>
                </div>

                {viewMode === 'step' && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleNextStep}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm"
                    >
                      <span>Xem Code Mẫu Đối Chiếu</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 2. VÍ DỤ MẪU (CODE WALKTHROUGH) */}
            {(viewMode === 'all' || lessonStep === 'example') && (
              <div className="p-4 sm:p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-wide">
                    <Code2 className="w-4 h-4 text-amber-400" />
                    <span>2. Ví Dụ Mẫu: Đối Chiếu Code Có Lỗi vs Đã Vá</span>
                  </div>
                  <span className="text-[11px] font-mono text-amber-400/80 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
                    Bước 2/5
                  </span>
                </div>

                <div className="text-xs sm:text-sm font-semibold text-slate-200">
                  {activeLesson.example.title}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Vulnerable Code Box */}
                  {activeLesson.example.vulnerableCode && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-rose-300">
                        <span className="flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Mã nguồn có lỗ hổng:
                        </span>
                        <button
                          onClick={() => handleCopyCode(activeLesson.example.vulnerableCode || '', 'vuln')}
                          className="flex items-center gap-1 text-slate-400 hover:text-white cursor-pointer px-2 py-0.5 rounded bg-slate-800/60"
                        >
                          {copiedCodeSnippet === 'vuln' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedCodeSnippet === 'vuln' ? 'Đã chép' : 'Sao chép'}</span>
                        </button>
                      </div>
                      <pre className="p-3 rounded-lg bg-black/90 font-mono text-[11px] text-rose-200/90 overflow-x-auto border border-rose-900/40 leading-relaxed select-text">
                        {activeLesson.example.vulnerableCode}
                      </pre>
                      <p className="text-[11px] text-slate-400 leading-relaxed italic">
                        {activeLesson.example.vulnerableExplanation}
                      </p>
                    </div>
                  )}

                  {/* Secure Code Box */}
                  {activeLesson.example.secureCode && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-emerald-300">
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Mã nguồn đã vá an toàn:
                        </span>
                        <button
                          onClick={() => handleCopyCode(activeLesson.example.secureCode || '', 'sec')}
                          className="flex items-center gap-1 text-slate-400 hover:text-white cursor-pointer px-2 py-0.5 rounded bg-slate-800/60"
                        >
                          {copiedCodeSnippet === 'sec' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedCodeSnippet === 'sec' ? 'Đã chép' : 'Sao chép'}</span>
                        </button>
                      </div>
                      <pre className="p-3 rounded-lg bg-black/90 font-mono text-[11px] text-emerald-200/90 overflow-x-auto border border-emerald-900/40 leading-relaxed select-text">
                        {activeLesson.example.secureCode}
                      </pre>
                      <p className="text-[11px] text-slate-400 leading-relaxed italic">
                        {activeLesson.example.secureExplanation}
                      </p>
                    </div>
                  )}
                </div>

                {viewMode === 'step' && (
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      onClick={handlePrevStep}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Quay Lại Lý Thuyết</span>
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm"
                    >
                      <span>Vào Bàn Thực Hành</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 3. BÀN THỰC HÀNH TƯƠNG TÁC (WORKBENCH) */}
            {(viewMode === 'all' || lessonStep === 'workbench') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-300 uppercase tracking-wide">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span>3. Bàn Thực Hành Tương Tác Trực Tiếp</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                      Mục tiêu: {activeLesson.practice.objective}
                    </span>

                    <button
                      onClick={() => setIsFullscreenWorkbench(!isFullscreenWorkbench)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                    >
                      {isFullscreenWorkbench ? (
                        <>
                          <Minimize2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Thu nhỏ</span>
                        </>
                      ) : (
                        <>
                          <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Toàn Màn Hình</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Embedded Workbench Frame (Clean, zero scroll trap when on step view) */}
                <div
                  className={`rounded-xl border border-slate-800 bg-black overflow-hidden flex flex-col shadow-lg ${
                    isFullscreenWorkbench
                      ? 'fixed inset-0 z-50 p-2 sm:p-4 bg-[#070b14]/95 backdrop-blur-md'
                      : lessonStep === 'workbench'
                      ? 'h-[500px] sm:h-[560px]'
                      : 'h-[460px] sm:h-[500px]'
                  }`}
                >
                  {isFullscreenWorkbench && (
                    <div className="h-10 px-3 bg-[#0c1220] border-b border-slate-800 flex items-center justify-between shrink-0 mb-1 rounded-t-lg">
                      <span className="text-xs font-bold text-white flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400" />
                        Toàn Màn Hình: Bài {activeLesson.id} - {activeLesson.title}
                      </span>
                      <button
                        onClick={() => setIsFullscreenWorkbench(false)}
                        className="flex items-center gap-1 px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-md text-xs font-semibold cursor-pointer"
                      >
                        <Minimize2 className="w-3.5 h-3.5" />
                        <span>Đóng Toàn Màn Hình</span>
                      </button>
                    </div>
                  )}

                  <div className="flex-1 w-full h-full min-h-0 overflow-hidden flex flex-col">
                    {activeLesson.toolType === 'terminal' && <HackerTerminalTab />}
                    {activeLesson.toolType === 'wireshark' && <PacketInspectorTab />}
                    {(activeLesson.toolType === 'sandbox_sqli' ||
                      activeLesson.toolType === 'sandbox_rce' ||
                      activeLesson.toolType === 'sandbox_idor' ||
                      activeLesson.toolType === 'sandbox_xss') && <SandboxTab />}
                    {activeLesson.toolType === 'ux_security' && <UxSecurityTab />}
                    {activeLesson.toolType === 'soc_log' && <SocLogMatrixTab />}
                    {(activeLesson.toolType === 'writeup' || activeLesson.toolType === 'capstone') && (
                      <RoadmapTab />
                    )}
                  </div>
                </div>

                {viewMode === 'step' && (
                  <div className="pt-1 flex items-center justify-between">
                    <button
                      onClick={handlePrevStep}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Xem Code Mẫu</span>
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm"
                    >
                      <span>Làm Thử Thách Cướp Cờ (CTF)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 4. CƯỚP CỜ (CTF CHALLENGE) */}
            {(viewMode === 'all' || lessonStep === 'ctf') && (
              <div className="p-4 sm:p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3.5 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-rose-300 uppercase tracking-wide">
                    <Flag className="w-4 h-4 text-rose-400" />
                    <span>4. Thử Thách Cướp Cờ (CTF Challenge)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowCtfHint(!showCtfHint)}
                      className="text-xs text-amber-400 hover:text-amber-300 underline cursor-pointer"
                    >
                      {showCtfHint ? 'Ẩn gợi ý' : 'Xem gợi ý'}
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {activeLesson.ctf.scenario}
                </p>

                {showCtfHint && (
                  <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 leading-relaxed">
                    💡 <strong>Gợi ý giải cờ:</strong> {activeLesson.ctf.hint}
                  </div>
                )}

                {/* CTF Submission Form */}
                <form onSubmit={handleVerifyCtf} className="flex flex-col sm:flex-row gap-2 pt-1">
                  <input
                    type="text"
                    value={ctfInput}
                    onChange={(e) => setCtfInput(e.target.value)}
                    placeholder="Dán hoặc nhập cờ tìm được trong Bàn Thực Hành dạng FLAG{...}"
                    className="flex-1 px-3.5 py-2.5 rounded-lg bg-black/60 border border-slate-700 font-mono text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500 min-h-[44px]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-semibold transition-colors shrink-0 cursor-pointer min-h-[44px]"
                  >
                    Kiểm Tra Cờ
                  </button>
                </form>

                {ctfStatus === 'success' && (
                  <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-500/50 text-xs text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span><strong>Thành công xuất sắc!</strong> {activeLesson.ctf.secretReward}</span>
                    </div>
                    {viewMode === 'step' && (
                      <button
                        onClick={handleNextStep}
                        className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>Sang Trắc Nghiệm</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}

                {ctfStatus === 'error' && (
                  <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/50 text-xs text-rose-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Cờ chưa chính xác! Hãy kiểm tra lại kết quả trong Bàn thực hành hoặc dùng nút &quot;⚡ Điền Thử Cờ Mẫu&quot;.</span>
                  </div>
                )}

                {viewMode === 'step' && ctfStatus !== 'success' && (
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      onClick={handlePrevStep}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Quay Lại Thực Hành</span>
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm"
                    >
                      <span>Vào Bài Trắc Nghiệm</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 5. PHỎNG VẤN TUYỂN DỤNG & EXIT CHALLENGE */}
            {(viewMode === 'all' || lessonStep === 'quiz') && (
              <div className="p-4 sm:p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-purple-300 uppercase tracking-wide">
                    <Briefcase className="w-4 h-4 text-purple-400" />
                    <span>5. Phỏng Vấn Tuyển Dụng & Trắc Nghiệm Mở Khóa Bài</span>
                  </div>
                  <span className="text-[11px] font-mono text-purple-400/80 bg-purple-950/40 border border-purple-800/40 px-2 py-0.5 rounded">
                    Bước 5/5
                  </span>
                </div>

                {/* Interview Question Box */}
                <div className="p-3.5 sm:p-4 rounded-lg bg-amber-950/20 border border-amber-800/40 space-y-2">
                  <div className="text-xs font-bold text-amber-300 uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Câu hỏi phỏng vấn thực tế:
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-white">
                    &quot;{activeLesson.interview.question}&quot;
                  </div>
                  <div className="p-2.5 rounded bg-black/60 text-xs text-slate-300 leading-relaxed">
                    <strong className="text-amber-400">Câu trả lời mẫu:</strong> {activeLesson.interview.answer}
                  </div>
                  <div className="text-[11px] text-amber-300/90 italic">
                    💡 Mẹo ghi điểm: {activeLesson.interview.interviewerTip}
                  </div>
                </div>

                {/* Exit Challenge Quiz */}
                <form onSubmit={handleSubmitExitChallenge} className="space-y-3 pt-2">
                  <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-rose-400" />
                    <span>{activeLesson.exitChallenge.question}</span>
                  </div>

                  <div className="space-y-2 font-mono">
                    {activeLesson.exitChallenge.options.map((opt) => {
                      const isSelected = selectedChallengeOption === opt.id;
                      return (
                        <label
                          key={opt.id}
                          onClick={() => sound.playClick()}
                          className={`flex items-start gap-3 p-3 sm:p-3.5 rounded-lg border cursor-pointer transition-all min-h-[48px] ${
                            isSelected
                              ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-sm'
                              : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`challenge-${activeLesson.id}`}
                            value={opt.id}
                            checked={isSelected}
                            onChange={() => setSelectedChallengeOption(opt.id)}
                            className="mt-1 accent-emerald-500 w-4 h-4"
                          />
                          <span className="text-xs sm:text-sm leading-snug">{opt.text}</span>
                        </label>
                      );
                    })}
                  </div>

                  {challengeFeedback.status !== 'idle' && (
                    <div
                      className={`p-3 rounded-lg text-xs leading-relaxed ${
                        challengeFeedback.status === 'success'
                          ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-500/60'
                          : 'bg-rose-950/60 text-rose-200 border border-rose-500/60'
                      }`}
                    >
                      {challengeFeedback.message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!selectedChallengeOption}
                    className={`w-full py-3.5 rounded-lg font-bold text-xs sm:text-sm transition-all min-h-[48px] flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                      selectedChallengeOption
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <span>Xác Nhận Đáp Án & Mở Khóa Bài Kế Tiếp</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {viewMode === 'step' && (
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      onClick={handlePrevStep}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Quay Lại Cướp Cờ</span>
                    </button>
                    {completedLessons.includes(activeLesson.id) && (
                      <button
                        onClick={() => {
                          if (activeLesson.id < CURRICULUM_LESSONS.length) {
                            setActiveLessonId(activeLesson.id + 1);
                          } else {
                            onOpenGraduationModal();
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm"
                      >
                        <span>{activeLesson.id < CURRICULUM_LESSONS.length ? 'Qua Bài Kế Tiếp' : 'Xem Bằng Tốt Nghiệp'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sticky Bottom Thumb Action Bar on Mobile */}
          <div className="lg:hidden sticky bottom-0 left-0 right-0 p-2.5 bg-[#080d1a]/95 backdrop-blur-md border-t border-slate-800 z-30 shadow-2xl flex items-center justify-between gap-2 shrink-0">
            {/* Prev Step Button */}
            <button
              onClick={handlePrevStep}
              className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold min-h-[44px] cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-slate-400" />
              <span>{lessonStep === 'theory' ? 'Mục lục' : 'Lùi'}</span>
            </button>

            {/* Step Counter Indicator */}
            <div className="flex flex-col items-center justify-center px-1">
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                {currentStepMeta.index}/5: {currentStepMeta.shortLabel}
              </span>
              <div className="flex items-center gap-1 mt-1">
                {LESSON_STEPS.map((s) => (
                  <span
                    key={s.id}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      s.id === lessonStep
                        ? 'bg-emerald-400 w-3.5'
                        : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Next Step / Action Button */}
            {lessonStep === 'quiz' ? (
              <button
                onClick={() => {
                  if (completedLessons.includes(activeLesson.id)) {
                    if (activeLesson.id < CURRICULUM_LESSONS.length) {
                      setActiveLessonId(activeLesson.id + 1);
                    } else {
                      onOpenGraduationModal();
                    }
                  } else {
                    // Scroll to submit quiz
                    const quizForm = document.querySelector('form');
                    quizForm?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold min-h-[44px] shadow-md shadow-emerald-950/60 cursor-pointer"
              >
                <span>
                  {completedLessons.includes(activeLesson.id)
                    ? activeLesson.id < CURRICULUM_LESSONS.length
                      ? 'Bài Kế Tiếp ➔'
                      : 'Nhận Bằng 🏆'
                    : 'Nộp Đáp Án'}
                </span>
              </button>
            ) : (
              <button
                onClick={handleNextStep}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold min-h-[44px] shadow-md shadow-emerald-950/60 cursor-pointer"
              >
                <span>
                  {lessonStep === 'theory'
                    ? 'Code Mẫu ➔'
                    : lessonStep === 'example'
                    ? 'Thực Hành ➔'
                    : lessonStep === 'workbench'
                    ? 'Cướp Cờ ➔'
                    : 'Trắc Nghiệm ➔'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
