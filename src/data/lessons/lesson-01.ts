import { CurriculumLesson } from './types';

export const lesson01: CurriculumLesson = {
  id: 1,
  moduleId: 1,
  moduleName: 'Module 1: Nền Tảng Kỹ Thuật (Foundation)',
  title: 'Bài 1: Dòng lệnh Linux CLI & Quản trị tệp (OverTheWire Bandit style)',
  subtitle: 'Nắm vững các câu lệnh quản trị hệ thống Unix cốt lõi cho kỹ sư an ninh mạng',
  toolType: 'terminal',
  theory: {
    summary: [
      'Linux là hệ điều hành thống trị 95% máy chủ Internet, tường lửa và thiết bị bảo mật.',
      'Cấu trúc thư mục Linux là một cây đơn nhất xuất phát từ gốc (/), không chia ổ C:\\ hay D:\\ như Windows.',
      'Các câu lệnh thiết yếu: whoami (xem danh tính), id (xem nhóm quyền), pwd (thư mục hiện tại), ls -la (xem tệp ẩn và phân quyền), cat (đọc tệp), grep (tìm chuỗi).',
    ],
    plainExplanation:
      'Hãy tưởng tượng máy chủ Linux như một tòa nhà không có chuột máy tính, bạn chỉ giao tiếp bằng văn bản qua màn hình đen chữ trắng (Terminal). Muốn điều tra hay bảo vệ hệ thống, bạn phải biết mình là ai (whoami), đang đứng ở tầng nào (pwd), xung quanh có tài liệu gì bị giấu không (ls -la) và mở tài liệu ra đọc (cat).',
    keyTakeaway: 'Luôn kiểm tra quyền hạn (whoami, id) và thư mục làm việc (pwd) ngay khi bước chân vào một máy chủ.',
  },
  example: {
    title: 'Ví dụ: Đọc file cấu hình bị ẩn và tìm kiếm tài khoản nhạy cảm',
    vulnerableCode: `# Kẻ quản trị lưu mật khẩu trong file ẩn ở thư mục cá nhân:
$ ls
Desktop Documents Downloads
$ ls -la
drwxr-xr-x 4 user user 4096 Oct 22 .
drwxr-xr-x 3 root root 4096 Oct 20 ..
-rw-r--r-- 1 user user  120 Oct 22 .db_secret_creds`,
    vulnerableExplanation:
      'Lệnh ls thông thường không hiện file bắt đầu bằng dấu chấm (.). Quản trị viên tưởng file đã an toàn, nhưng pentester dùng lệnh ls -la hoặc ls -a là phát hiện ngay lập tức.',
    secureCode: `# Quản trị an toàn: Không lưu mật khẩu plain-text trên ổ đĩa.
# Sử dụng biến môi trường được mã hóa hoặc Vault dịch vụ:
export DATABASE_PASSWORD="$(vault read -field=password secret/db)"`,
    secureExplanation:
      'Chỉ lưu biến môi trường tạm thời hoặc sử dụng công cụ quản lý khóa (HashiCorp Vault, AWS Secrets Manager) thay vì ghi file cấu hình dạng text trần.',
  },
  practice: {
    objective: 'Mở Hacker Terminal bên dưới, gõ lệnh "whoami", "id", liệt kê file ẩn với "ls -la" và đọc file "cat /etc/passwd".',
    steps: [
      'Bước 1: Chuyển sang Hacker Terminal (hoặc kết nối Bash thật trên máy tính của bạn).',
      'Bước 2: Gõ lệnh "whoami" và "id" để kiểm tra danh tính tài khoản.',
      'Bước 3: Gõ "ls -la" để khám phá thư mục làm việc hiện tại.',
      'Bước 4: Đọc danh sách tài khoản người dùng bằng lệnh "cat /etc/passwd".',
    ],
    hint: 'Nếu dùng Bash thật trên laptop, bạn có thể gõ "cat /etc/os-release" để xem phiên bản Linux đang chạy.',
  },
  ctf: {
    scenario: 'Quản trị viên đã để quên một mẩu giấy ghi chú chứa mã cờ bí mật trong thư mục /var/www/html/.flag_backup.txt.',
    flag: 'FLAG{linux_cli_bandit_explorer_2026}',
    hint: 'Sử dụng lệnh "cat /var/www/html/.flag_backup.txt" hoặc dùng "grep" để tìm kiếm chuỗi FLAG.',
    secretReward: 'Xuất sắc! Bạn đã làm chủ khả năng dò tìm file ẩn và đọc cấu hình hệ thống trên dòng lệnh Linux.',
  },
  interview: {
    question: 'Khi đăng nhập vào một máy chủ Linux lạ trong bài test tuyển dụng Pentester/SOC, 3 lệnh đầu tiên bạn sẽ gõ là gì và tại sao?',
    answer:
      'Tôi sẽ gõ "whoami" và "id" để xác định danh tính và quyền hạn hiện tại (có thuộc nhóm sudo/root không); sau đó gõ "uname -a" để kiểm tra phiên bản nhân kernel xem có lỗ hổng đã biết không; và gõ "pwd" kèm "ls -la" để định hướng thư mục làm việc.',
    interviewerTip: 'Nhà tuyển dụng muốn kiểm tra xem bạn có thói quen "Enumeration First" (thu thập thông tin trước khi hành động) hay không.',
  },
  exitChallenge: {
    question: 'Tệp tin nào trên hệ thống Linux lưu trữ danh sách các tài khoản người dùng và thư mục home của họ?',
    options: [
      { id: 'a', text: '/etc/shadow' },
      { id: 'b', text: '/etc/passwd' },
      { id: 'c', text: '/var/log/auth.log' },
      { id: 'd', text: '/bin/bash' },
    ],
    correctOptionId: 'b',
    explanation: '/etc/passwd là tệp mở cho mọi người dùng đọc chứa danh sách tài khoản người dùng, còn hash mật khẩu được bảo vệ trong /etc/shadow.',
  },

  // Backward compatibility
  theorySummary: [
    'Linux là hệ điều hành thống trị 95% máy chủ Internet, tường lửa và thiết bị bảo mật.',
    'Cấu trúc thư mục Linux là một cây đơn nhất xuất phát từ gốc (/), không chia ổ C:\\ hay D:\\ như Windows.',
    'Các câu lệnh thiết yếu: whoami (xem danh tính), id (xem nhóm quyền), pwd (thư mục hiện tại), ls -la (xem tệp ẩn và phân quyền), cat (đọc tệp), grep (tìm chuỗi).',
  ],
  taskObjective: 'Mở Hacker Terminal bên dưới, gõ lệnh "whoami", "id" và đọc file "cat /etc/passwd".',
  interviewQuestion: {
    question: 'Khi đăng nhập vào một máy chủ Linux lạ trong bài test tuyển dụng Pentester/SOC, 3 lệnh đầu tiên bạn sẽ gõ là gì và tại sao?',
    answer: 'Tôi sẽ gõ "whoami" và "id" để xác định danh tính và quyền hạn hiện tại; sau đó gõ "uname -a" và "pwd" kèm "ls -la".',
    interviewerTip: 'Nhà tuyển dụng muốn kiểm tra xem bạn có thói quen "Enumeration First" hay không.',
  },
};
