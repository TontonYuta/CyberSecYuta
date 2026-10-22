export interface LessonExitChallenge {
  question: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
}

export interface LessonTheory {
  summary: string[];
  plainExplanation: string;
  keyTakeaway: string;
}

export interface LessonExample {
  title: string;
  vulnerableCode?: string;
  vulnerableExplanation?: string;
  secureCode?: string;
  secureExplanation?: string;
}

export interface LessonPractice {
  objective: string;
  steps: string[];
  hint?: string;
}

export interface LessonCTF {
  scenario: string;
  flag: string;
  hint: string;
  secretReward: string;
}

export interface LessonInterview {
  question: string;
  answer: string;
  interviewerTip: string;
}

export type LessonToolType =
  | 'terminal'
  | 'wireshark'
  | 'sandbox_sqli'
  | 'sandbox_rce'
  | 'sandbox_idor'
  | 'sandbox_xss'
  | 'soc_log'
  | 'writeup'
  | 'capstone'
  | 'ux_security';

export interface CurriculumLesson {
  id: number;
  moduleId: 1 | 2 | 3 | 4 | 5;
  moduleName: string;
  title: string;
  subtitle: string;
  toolType: LessonToolType;
  theory: LessonTheory;
  example: LessonExample;
  practice: LessonPractice;
  ctf: LessonCTF;
  interview: LessonInterview;
  exitChallenge: LessonExitChallenge;

  // Backward-compatibility getters
  theorySummary?: string[];
  taskObjective?: string;
  interviewQuestion?: {
    question: string;
    answer: string;
    interviewerTip: string;
  };
}

export interface ModuleInfo {
  id: number;
  name: string;
  desc: string;
  badge: string;
}
