import React, { useState, useEffect } from 'react';
import { CURRICULUM_LESSONS, MODULES_INFO, CurriculumLesson } from '../data/curriculumData';
import { sound } from '../utils/audio';
import { HackerTerminalTab } from './HackerTerminalTab';
import { PacketInspectorTab } from './PacketInspectorTab';
import { SandboxTab } from './SandboxTab';
import { SocLogMatrixTab } from './SocLogMatrixTab';
import { RoadmapTab } from './RoadmapTab';
import {
  Lock,
  CheckCircle2,
  ChevronRight,
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
} from 'lucide-react';

interface LinearAcademyViewProps {
  onOpenGraduationModal: () => void;
  onUpdateCompletedCount: (count: number) => void;
}

export const LinearAcademyView: React.FC<LinearAcademyViewProps> = ({
  onOpenGraduationModal,
  onUpdateCompletedCount,
}) => {
  // Unlocked & Completed lesson IDs stored in localStorage
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
  const [demoMode, setDemoMode] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'curriculum' | 'lesson'>('lesson');
  const [isFullscreenWorkbench, setIsFullscreenWorkbench] = useState<boolean>(false);

  // Exit challenge selected option
  const [selectedChallengeOption, setSelectedChallengeOption] = useState<string>('');
  const [challengeFeedback, setChallengeFeedback] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });

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

  // Reset challenge option when active lesson changes
  useEffect(() => {
    setSelectedChallengeOption('');
    setChallengeFeedback({ status: 'idle', message: '' });
  }, [activeLessonId]);

  const handleSelectLesson = (lessonId: number) => {
    const isUnlocked = demoMode || unlockedLessons.includes(lessonId);
    if (!isUnlocked) {
      sound.playError();
      return;
    }
    sound.playClick();
    setActiveLessonId(lessonId);
    setMobileTab('lesson'); // Auto-switch to lesson view on mobile
  };

  const handleToggleDemoMode = () => {
    sound.playClick();
    const nextState = !demoMode;
    setDemoMode(nextState);
    if (nextState) {
      // Unlock all 12 lessons
      const allIds = CURRICULUM_LESSONS.map((l) => l.id);
      setUnlockedLessons(allIds);
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

      // Mark current lesson as completed
      if (!completedLessons.includes(activeLessonId)) {
        setCompletedLessons((prev) => [...prev, activeLessonId]);
      }

      // Unlock next lesson
      const nextId = activeLessonId + 1;
      if (nextId <= 12 && !unlockedLessons.includes(nextId)) {
        setUnlockedLessons((prev) => [...prev, nextId]);
      }

      // If finished lesson 12, celebrate graduation!
      if (activeLessonId === 12) {
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
        message: 'Chưa chính xác! Hãy đọc lại tóm tắt lý thuyết hoặc kiểm tra công cụ thực hành và thử lại.',
      });
    }
  };

  const handleResetProgress = () => {
    sound.playClick();
    setUnlockedLessons([1]);
    setCompletedLessons([]);
    setActiveLessonId(1);
    setDemoMode(false);
  };

  return (
    <div className="flex-1 w-full min-h-0 overflow-hidden flex flex-col bg-[#0b0f19]">
      {/* Mobile Sub-Navigation Bar for Lesson List vs Active Lesson (Visible only on < lg) */}
      <div className="lg:hidden px-3 py-2 bg-[#0e1424] border-b border-[#1e293b] flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center p-1 bg-slate-950/80 border border-slate-800 rounded-xl w-full gap-1">
          <button
            onClick={() => {
              sound.playClick();
              setMobileTab('curriculum');
            }}
            className={`flex-1 py-2 px-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'curriculum'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>12 Bài Học ({completedLessons.length}/12)</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setMobileTab('lesson');
            }}
            className={`flex-1 py-2 px-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer min-w-0 ${
              mobileTab === 'lesson'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/60 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">Bài {activeLesson.id}: {activeLesson.title}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0 overflow-hidden flex flex-col lg:flex-row">
        {/* SIDEBAR TRÁI: CÂY 12 BÀI HỌC TUYẾN TÍNH - 28% on desktop, full on mobile when active */}
        <div
          className={`w-full lg:w-[28%] h-full flex flex-col border-r border-[#1e293b] bg-[#0c1222] overflow-hidden ${
            mobileTab === 'curriculum' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Sidebar Header & Demo Mode Toggle */}
          <div className="p-3.5 bg-[#0e1628] border-b border-[#1e293b] flex items-center justify-between shrink-0">
            <div>
              <div className="text-xs font-bold text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Cây Lộ Trình 12 Bài Học</span>
              </div>
              <div className="text-xs font-mono text-slate-400 mt-0.5">
                Hoàn thành từng bài để mở khóa bài tiếp
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleToggleDemoMode}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
                  demoMode
                    ? 'bg-amber-950/90 text-amber-300 border-amber-500/70 font-bold shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
                title="Bật chế độ mở khóa toàn bộ bài học để xem nhanh"
              >
                {demoMode ? 'Đã Mở Hết' : 'Mở Hết'}
              </button>

              <button
                onClick={handleResetProgress}
                className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer rounded-lg hover:bg-slate-800"
                title="Đặt lại tiến độ bài học về Bài 1"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 12 Lessons List Grouped by 4 Modules (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-3.5 space-y-4">
            {MODULES_INFO.map((mod) => {
              const moduleLessons = CURRICULUM_LESSONS.filter((l) => l.moduleId === mod.id);

              return (
                <div key={mod.id} className="space-y-2">
                  <div className="px-2.5 py-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider bg-slate-900/80 rounded-lg border border-slate-800/80 flex items-center justify-between">
                    <span className="truncate">{mod.name}</span>
                  </div>

                  <div className="space-y-1.5">
                    {moduleLessons.map((lesson) => {
                      const isUnlocked = demoMode || unlockedLessons.includes(lesson.id);
                      const isCompleted = completedLessons.includes(lesson.id);
                      const isActive = activeLessonId === lesson.id;

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => handleSelectLesson(lesson.id)}
                          disabled={!isUnlocked}
                          className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-start justify-between gap-2.5 cursor-pointer min-h-[52px] ${
                            isActive
                              ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/40'
                              : isCompleted
                              ? 'bg-slate-900/90 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-850'
                              : isUnlocked
                              ? 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:text-white hover:border-slate-700'
                              : 'bg-black/20 border-slate-900/60 text-slate-600 cursor-not-allowed opacity-50'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="mt-0.5 shrink-0">
                              {isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-950" />
                              ) : isUnlocked ? (
                                <span className="w-4 h-4 rounded-full border border-slate-500 flex items-center justify-center text-[10px] font-mono font-bold text-slate-300">
                                  {lesson.id}
                                </span>
                              ) : (
                                <Lock className="w-4 h-4 text-slate-600" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold truncate leading-snug text-slate-100">
                                {lesson.title}
                              </div>
                              <div className="text-xs text-slate-400 truncate mt-0.5">
                                {lesson.subtitle}
                              </div>
                            </div>
                          </div>

                          {isActive && (
                            <ChevronRight className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* KHUNG HỌC TẬP CHÍNH (3 BƯỚC CHO MỖI BÀI HỌC) - 72% on desktop, full on mobile when active */}
        <div
          className={`w-full lg:w-[72%] h-full flex flex-col bg-[#0b0f19] overflow-hidden min-h-0 ${
            mobileTab === 'lesson' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Lesson Breadcrumb & Headline Bar */}
          <div className="px-3.5 py-3 bg-[#0e1628] border-b border-[#1e293b] flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-sm">
            <div>
              <div className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wide">
                {activeLesson.moduleName}
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2 mt-0.5">
                <span>{activeLesson.title}</span>
                {completedLessons.includes(activeLesson.id) && (
                  <span className="text-xs font-mono bg-emerald-950/90 text-emerald-300 border border-emerald-500/80 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ĐÃ HOÀN THÀNH
                  </span>
                )}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                Bài {activeLesson.id}/12
              </span>
            </div>
          </div>

          {/* Scrollable Main Area (Step 1 -> Step 2 -> Step 3) */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-5">
            {/* BƯỚC 1: LÝ THUYẾT 3 PHÚT & CÂU HỎI PHỎNG VẤN TUYỂN DỤNG */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-extrabold text-slate-200 uppercase tracking-wide">
                <span className="w-6 h-6 rounded-full bg-blue-950 border border-blue-500/80 flex items-center justify-center text-blue-300 text-xs font-bold shadow-sm">
                  1
                </span>
                <span>Bước 1: Lý Thuyết 3 Phút & Câu Hỏi Phỏng Vấn Tuyển Dụng</span>
              </div>

              {/* Quick 3-Minute Summary */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-[#0f172a] border border-[#1e293b] space-y-2 text-xs sm:text-sm shadow-sm">
                <div className="font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>Tóm tắt bản chất kỹ thuật cốt lõi:</span>
                </div>
                <ul className="space-y-2 text-slate-300 list-disc list-inside leading-relaxed text-xs sm:text-sm pl-1">
                  {activeLesson.theorySummary.map((item, idx) => (
                    <li key={idx} className="marker:text-blue-400">
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Yellow/Amber Highlight Box: Interview Question */}
              <div className="p-4 sm:p-5 rounded-xl bg-amber-950/20 border-2 border-amber-500/40 space-y-3 shadow-md">
                <div className="flex items-center gap-2 font-bold text-amber-300 uppercase tracking-wide text-xs sm:text-sm">
                  <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
                  <span>Câu Hỏi Phỏng Vấn Nhà Tuyển Dụng:</span>
                </div>
                <div className="font-bold text-white text-sm sm:text-base leading-snug">
                  &quot;{activeLesson.interviewQuestion.question}&quot;
                </div>

                <div className="p-3.5 rounded-lg bg-black/60 border border-amber-800/40 space-y-1.5">
                  <span className="text-xs font-mono text-amber-400 uppercase font-extrabold block">
                    ★ Câu trả lời mẫu đạt chuẩn tuyển dụng:
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {activeLesson.interviewQuestion.answer}
                  </p>
                </div>

                <div className="text-xs sm:text-sm text-amber-300 font-medium italic flex items-start gap-1.5 pt-0.5">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Mẹo ghi điểm phỏng vấn: {activeLesson.interviewQuestion.interviewerTip}</span>
                </div>
              </div>
            </div>

            {/* BƯỚC 2: BÀN THỰC HÀNH TƯƠNG TÁC TÍCH HỢP SẴN */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-extrabold text-slate-200 uppercase tracking-wide">
                  <span className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-500/80 flex items-center justify-center text-emerald-300 text-xs font-bold shadow-sm">
                    2
                  </span>
                  <span>Bước 2: Bàn Thực Hành Tương Tác Trực Tiếp</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                    Mục tiêu: {activeLesson.taskObjective}
                  </span>

                  {/* Focus / Fullscreen Mode Toggle for Workbench */}
                  <button
                    onClick={() => setIsFullscreenWorkbench(!isFullscreenWorkbench)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-colors cursor-pointer shadow-sm"
                    title={isFullscreenWorkbench ? "Thu nhỏ bàn thực hành" : "Phóng to toàn màn hình bàn thực hành"}
                  >
                    {isFullscreenWorkbench ? (
                      <>
                        <Minimize2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="hidden sm:inline">Thu nhỏ</span>
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

              {/* Embedded Workbenches Container */}
              <div
                className={`rounded-xl border border-[#1e293b] bg-black overflow-hidden shadow-2xl flex flex-col ${
                  isFullscreenWorkbench
                    ? 'fixed inset-0 z-50 p-2 sm:p-4 bg-[#0b0f19]/95 backdrop-blur-md'
                    : 'h-[500px] sm:h-[540px]'
                }`}
              >
                {isFullscreenWorkbench && (
                  <div className="h-10 px-3 bg-[#0e1628] border-b border-[#1e293b] flex items-center justify-between shrink-0 mb-1 rounded-t-lg">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      Chế Độ Toàn Màn Hình - Bàn Thực Hành Bài {activeLesson.id}: {activeLesson.title}
                    </span>
                    <button
                      onClick={() => setIsFullscreenWorkbench(false)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                    >
                      <Minimize2 className="w-3.5 h-3.5" />
                      <span>Đóng Toàn Màn Hình</span>
                    </button>
                  </div>
                )}

                <div className="flex-1 w-full h-full min-h-0 overflow-hidden flex flex-col rounded-b-lg">
                  {/* Tool router based on active lesson */}
                  {(activeLesson.toolType === 'terminal') && <HackerTerminalTab />}
                  {(activeLesson.toolType === 'wireshark') && <PacketInspectorTab />}
                  {(activeLesson.toolType === 'sandbox_sqli' ||
                    activeLesson.toolType === 'sandbox_rce' ||
                    activeLesson.toolType === 'sandbox_idor' ||
                    activeLesson.toolType === 'sandbox_xss') && <SandboxTab />}
                  {(activeLesson.toolType === 'soc_log') && <SocLogMatrixTab />}
                  {(activeLesson.toolType === 'writeup' || activeLesson.toolType === 'capstone') && (
                    <RoadmapTab />
                  )}
                </div>
              </div>
            </div>

            {/* BƯỚC 3: EXIT CHALLENGE / CỔNG MỞ KHÓA BÀI KẾ TIẾP */}
            <div className="space-y-3 pt-3 border-t border-[#1e293b]">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-extrabold text-slate-200 uppercase tracking-wide">
                <span className="w-6 h-6 rounded-full bg-purple-950 border border-purple-500/80 flex items-center justify-center text-purple-300 text-xs font-bold shadow-sm">
                  3
                </span>
                <span>Bước 3: Exit Challenge (Cổng Đánh Giá & Mở Khóa Bài)</span>
              </div>

              <form
                onSubmit={handleSubmitExitChallenge}
                className="p-4 sm:p-5 rounded-xl bg-[#0f172a] border border-[#1e293b] space-y-4 shadow-sm"
              >
                <div className="font-bold text-white text-xs sm:text-sm leading-snug">
                  {activeLesson.exitChallenge.question}
                </div>

                {/* Options Cards */}
                <div className="space-y-2 font-mono">
                  {activeLesson.exitChallenge.options.map((opt) => {
                    const isSelected = selectedChallengeOption === opt.id;
                    return (
                      <label
                        key={opt.id}
                        onClick={() => sound.playClick()}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all min-h-[50px] ${
                          isSelected
                            ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-md shadow-emerald-950/50'
                            : 'bg-slate-900/70 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-850'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`challenge-${activeLesson.id}`}
                          value={opt.id}
                          checked={isSelected}
                          onChange={(e) => setSelectedChallengeOption(e.target.value)}
                          className="mt-1 w-4 h-4 accent-emerald-500 cursor-pointer"
                        />
                        <span className="text-xs sm:text-sm font-medium leading-relaxed flex-1">
                          {opt.text}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {/* Challenge feedback message */}
                {challengeFeedback.status !== 'idle' && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs sm:text-sm font-mono flex items-start gap-2.5 ${
                      challengeFeedback.status === 'success'
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                        : 'bg-red-950/80 border-red-500 text-red-200'
                    }`}
                  >
                    {challengeFeedback.status === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-relaxed">{challengeFeedback.message}</span>
                  </div>
                )}

                {/* Action Button */}
                <button
                  type="submit"
                  disabled={!selectedChallengeOption}
                  className="w-full h-12 px-5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-40 text-white font-extrabold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/80 border border-emerald-400/40 active:scale-[0.99]"
                >
                  <Unlock className="w-4 h-4" />
                  <span>
                    {activeLesson.id === 12
                      ? 'Nộp Bài & Hoàn Thành Khóa Học (Mở Chứng Chỉ Tốt Nghiệp) 🎓'
                      : 'Nộp Bài & Mở Khóa Bài Tiếp Theo 🔓'}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
