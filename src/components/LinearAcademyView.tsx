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
    <div className="flex-1 w-full min-h-0 overflow-hidden flex flex-col bg-[#09090b]">
      {/* Mobile Sub-Navigation Bar for Lesson List vs Active Lesson (Visible only on < lg) */}
      <div className="lg:hidden px-2.5 py-1.5 bg-[#121215] border-b border-[#27272a] flex items-center justify-between shrink-0">
        <div className="flex items-center p-0.5 bg-black border border-neutral-800 rounded-lg w-full">
          <button
            onClick={() => {
              sound.playClick();
              setMobileTab('curriculum');
            }}
            className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'curriculum'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>12 Bài Học ({completedLessons.length}/12)</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setMobileTab('lesson');
            }}
            className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer min-w-0 ${
              mobileTab === 'lesson'
                ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-600/50 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Bài {activeLesson.id}: {activeLesson.title}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0 overflow-hidden flex flex-col lg:flex-row">
        {/* SIDEBAR TRÁI: CÂY 12 BÀI HỌC TUYẾN TÍNH - 28% on desktop, full on mobile when active */}
        <div
          className={`w-full lg:w-[28%] h-full flex flex-col border-r border-[#27272a] bg-[#0c0c0e] overflow-hidden ${
            mobileTab === 'curriculum' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Sidebar Header & Demo Mode Toggle */}
          <div className="p-3 bg-[#121215] border-b border-[#27272a] flex items-center justify-between shrink-0">
            <div>
              <div className="text-xs font-bold text-neutral-100 uppercase tracking-wide flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cây Lộ Trình 12 Bài Học</span>
              </div>
              <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
                Hoàn thành từng bài để mở khóa bài tiếp
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleToggleDemoMode}
                className={`px-2 py-1 text-[10px] font-mono rounded border transition-colors cursor-pointer ${
                  demoMode
                    ? 'bg-amber-950/80 text-amber-300 border-amber-600/60 font-bold'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                }`}
                title="Bật chế độ mở khóa toàn bộ bài học để xem nhanh"
              >
                {demoMode ? 'Đã Mở Hết' : 'Mở Hết'}
              </button>

              <button
                onClick={handleResetProgress}
                className="p-1 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                title="Đặt lại tiến độ bài học về Bài 1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 12 Lessons List Grouped by 4 Modules (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
            {MODULES_INFO.map((mod) => {
              const moduleLessons = CURRICULUM_LESSONS.filter((l) => l.moduleId === mod.id);

              return (
                <div key={mod.id} className="space-y-1.5">
                  <div className="px-2 py-1 text-[11px] font-bold text-neutral-400 uppercase tracking-wider bg-black/40 rounded border border-neutral-900 flex items-center justify-between">
                    <span className="truncate">{mod.name}</span>
                  </div>

                  <div className="space-y-1">
                    {moduleLessons.map((lesson) => {
                      const isUnlocked = demoMode || unlockedLessons.includes(lesson.id);
                      const isCompleted = completedLessons.includes(lesson.id);
                      const isActive = activeLessonId === lesson.id;

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => handleSelectLesson(lesson.id)}
                          disabled={!isUnlocked}
                          className={`w-full text-left p-2 rounded-md border text-xs transition-all flex items-start justify-between gap-2 cursor-pointer ${
                            isActive
                              ? 'bg-emerald-950/60 border-emerald-500/80 text-white shadow-md'
                              : isCompleted
                              ? 'bg-[#121215] border-neutral-800 text-neutral-300 hover:border-neutral-700'
                              : isUnlocked
                              ? 'bg-[#0f0f13] border-neutral-800/80 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                              : 'bg-black/20 border-neutral-900/60 text-neutral-600 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <div className="flex items-start gap-2 min-w-0">
                            <div className="mt-0.5 shrink-0">
                              {isCompleted ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-950" />
                              ) : isUnlocked ? (
                                <span className="w-3.5 h-3.5 rounded-full border border-neutral-600 flex items-center justify-center text-[9px] font-mono font-bold text-neutral-400">
                                  {lesson.id}
                                </span>
                              ) : (
                                <Lock className="w-3.5 h-3.5 text-neutral-600" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold truncate leading-tight">
                                {lesson.title}
                              </div>
                              <div className="text-[10px] text-neutral-500 truncate mt-0.5">
                                {lesson.subtitle}
                              </div>
                            </div>
                          </div>

                          {isActive && (
                            <ChevronRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
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
          className={`w-full lg:w-[72%] h-full flex flex-col bg-[#09090b] overflow-hidden min-h-0 ${
            mobileTab === 'lesson' ? 'flex' : 'hidden lg:flex'
          }`}
        >
        {/* Lesson Breadcrumb & Headline Bar */}
        <div className="p-3 bg-[#111114] border-b border-[#27272a] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div>
            <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wide">
              {activeLesson.moduleName}
            </div>
            <h2 className="text-sm font-bold text-neutral-100 flex items-center gap-2 mt-0.5">
              <span>{activeLesson.title}</span>
              {completedLessons.includes(activeLesson.id) && (
                <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-600/60 px-2 py-0.2 rounded flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ĐÃ HOÀN THÀNH
                </span>
              )}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-neutral-400">
              Bài {activeLesson.id}/12
            </span>
          </div>
        </div>

        {/* Scrollable Main Area (Step 1 -> Step 2 -> Step 3) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* BƯỚC 1: LÝ THUYẾT 3 PHÚT & CÂU HỎI PHỎNG VẤN TUYỂN DỤNG */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-200 uppercase tracking-wide">
              <span className="w-5 h-5 rounded-full bg-blue-950 border border-blue-600/60 flex items-center justify-center text-blue-300 text-[11px]">
                1
              </span>
              <span>Bước 1: Lý Thuyết 3 Phút & Câu Hỏi Phỏng Vấn Tuyển Dụng</span>
            </div>

            {/* Quick 3-Minute Summary */}
            <div className="p-3 rounded-lg bg-[#121215] border border-neutral-800 space-y-1.5 text-xs">
              <div className="font-semibold text-neutral-200">Tóm tắt bản chất kỹ thuật:</div>
              <ul className="space-y-1 text-neutral-300 list-disc list-inside text-[11px] leading-relaxed">
                {activeLesson.theorySummary.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Yellow/Amber Highlight Box: Interview Question */}
            <div className="p-3.5 rounded-lg bg-amber-950/25 border border-amber-500/50 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-300 uppercase tracking-wide">
                <Briefcase className="w-4 h-4 text-amber-400" />
                <span>💼 Câu Hỏi Phỏng Vấn Thường Gặp Của Nhà Tuyển Dụng:</span>
              </div>
              <div className="font-medium text-amber-100 text-xs">
                &quot;{activeLesson.interviewQuestion.question}&quot;
              </div>

              <div className="p-2.5 rounded bg-black/60 border border-amber-900/40 space-y-1">
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">
                  Câu trả lời mẫu đạt chuẩn tuyển dụng:
                </span>
                <p className="text-[11px] text-neutral-200 leading-relaxed">
                  {activeLesson.interviewQuestion.answer}
                </p>
              </div>

              <div className="text-[10px] text-amber-300/80 italic flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Mẹo ghi điểm: {activeLesson.interviewQuestion.interviewerTip}</span>
              </div>
            </div>
          </div>

          {/* BƯỚC 2: BÀN THỰC HÀNH TƯƠNG TÁC TÍCH HỢP SẴN */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-200 uppercase tracking-wide">
                <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-600/60 flex items-center justify-center text-emerald-300 text-[11px]">
                  2
                </span>
                <span>Bước 2: Bàn Thực Hành Tương Tác Trực Tiếp</span>
              </div>
              <span className="text-[11px] font-mono text-neutral-400">
                Mục tiêu: {activeLesson.taskObjective}
              </span>
            </div>

            {/* Embedded Workbenches */}
            <div className="h-[460px] rounded-lg border border-[#27272a] bg-black overflow-hidden shadow-xl flex flex-col">
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

          {/* BƯỚC 3: EXIT CHALLENGE / CỔNG MỞ KHÓA BÀI KẾ TIẾP */}
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-200 uppercase tracking-wide">
              <span className="w-5 h-5 rounded-full bg-purple-950 border border-purple-600/60 flex items-center justify-center text-purple-300 text-[11px]">
                3
              </span>
              <span>Bước 3: Exit Challenge (Cổng Đánh Giá & Mở Khóa)</span>
            </div>

            <form
              onSubmit={handleSubmitExitChallenge}
              className="p-4 rounded-lg bg-[#121215] border border-neutral-800 space-y-3 text-xs"
            >
              <div className="font-semibold text-neutral-100 text-xs">
                {activeLesson.exitChallenge.question}
              </div>

              {/* Options */}
              <div className="space-y-1.5 font-mono">
                {activeLesson.exitChallenge.options.map((opt) => (
                  <label
                    key={opt.id}
                    onClick={() => sound.playClick()}
                    className={`flex items-center gap-2.5 p-2 rounded border cursor-pointer transition-colors ${
                      selectedChallengeOption === opt.id
                        ? 'bg-neutral-800 border-neutral-600 text-white'
                        : 'bg-black/30 border-neutral-800/80 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`challenge-${activeLesson.id}`}
                      value={opt.id}
                      checked={selectedChallengeOption === opt.id}
                      onChange={(e) => setSelectedChallengeOption(e.target.value)}
                      className="accent-emerald-500"
                    />
                    <span>{opt.text}</span>
                  </label>
                ))}
              </div>

              {/* Challenge feedback message */}
              {challengeFeedback.status !== 'idle' && (
                <div
                  className={`p-2.5 rounded border text-xs font-mono flex items-start gap-2 ${
                    challengeFeedback.status === 'success'
                      ? 'bg-emerald-950/70 border-emerald-500/80 text-emerald-200'
                      : 'bg-red-950/70 border-red-500/80 text-red-200'
                  }`}
                >
                  {challengeFeedback.status === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <span>{challengeFeedback.message}</span>
                </div>
              )}

              {/* Action Button */}
              <button
                type="submit"
                disabled={!selectedChallengeOption}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Unlock className="w-4 h-4" />
                <span>
                  {activeLesson.id === 12
                    ? 'Nộp Bài & Hoàn Thành Khóa Học (Mở Chứng Chỉ) 🎓'
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
