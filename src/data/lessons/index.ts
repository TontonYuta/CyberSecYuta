import { CurriculumLesson, ModuleInfo } from './types';
import { lesson01 } from './lesson-01';
import { lesson02 } from './lesson-02';
import { lesson03 } from './lesson-03';
import { lesson04 } from './lesson-04';
import { lesson05 } from './lesson-05';
import { lesson06 } from './lesson-06';
import { lesson07 } from './lesson-07';
import { lesson08 } from './lesson-08';
import { lesson09 } from './lesson-09';
import { lesson10 } from './lesson-10';
import { lesson11 } from './lesson-11';
import { lesson12 } from './lesson-12';
import { lesson13 } from './lesson-13';

export * from './types';

export const MODULES_INFO: ModuleInfo[] = [
  {
    id: 1,
    name: 'Module 1: Nền Tảng Kỹ Thuật (Foundation)',
    desc: 'Linux CLI, Phân quyền tệp, TCP/IP & Giao thức Web HTTP',
    badge: 'Căn Bản',
  },
  {
    id: 2,
    name: 'Module 2: Kỹ Năng Junior Penetration Tester (Web AppSec & UX/UI Security)',
    desc: 'Khai thác & Phòng thủ lỗ hổng OWASP Top 10, Clickjacking & UI Redressing',
    badge: 'Tấn Công & Phòng Thủ Web',
  },
  {
    id: 3,
    name: 'Module 3: Kỹ Năng Junior SOC Analyst (Phòng Thủ & Điều Tra Số)',
    desc: 'Phân tích log tấn công, điều tra chuỗi sự cố Kill Chain & Threat Hunting',
    badge: 'Phòng Thủ & Điều Tra',
  },
  {
    id: 4,
    name: 'Module 4: Đồ Án Tốt Nghiệp & Dự Tuyển Việc Làm (Capstone)',
    desc: 'Boot-to-Root Machine, đánh giá năng lực & xuất hồ sơ Portfolio xin việc',
    badge: 'Tốt Nghiệp & Tuyển Dụng',
  },
];

export const CURRICULUM_LESSONS: CurriculumLesson[] = [
  lesson01,
  lesson02,
  lesson03,
  lesson04,
  lesson05,
  lesson06,
  lesson07,
  lesson08,
  lesson09,
  lesson10,
  lesson11,
  lesson12,
  lesson13,
];

export function getLessonById(id: number): CurriculumLesson | undefined {
  return CURRICULUM_LESSONS.find((l) => l.id === id);
}

export function getLessonsByModule(moduleId: number): CurriculumLesson[] {
  return CURRICULUM_LESSONS.filter((l) => l.moduleId === moduleId);
}
