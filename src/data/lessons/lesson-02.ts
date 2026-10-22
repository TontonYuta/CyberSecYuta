import { CurriculumLesson } from './types';

export const lesson02: CurriculumLesson = {
  id: 2,
  moduleId: 1,
  moduleName: 'Module 1: Nền Tảng Kỹ Thuật (Foundation)',
  title: 'Bài 2: Phân quyền tệp (chmod, SUID) & Leo quyền root cơ bản',
  subtitle: 'Hiểu cơ chế rwx (Read-Write-Execute), SUID bit và cách phát hiện quyền thực thi sudo NOPASSWD',
  toolType: 'terminal',
  theory: {
    summary: [
      'Mỗi tệp tin Linux có 3 nhóm quyền: Owner (u), Group (g), Others (o) với các bit r (4), w (2), x (1).',
      'Bit SUID (Set User ID, cờ 4000): Khi thực thi tệp tin có cờ SUID, tiến trình con sẽ chạy với đặc quyền của chủ sở hữu tệp (thường là root) thay vì quyền của người dùng gọi nó.',
      'Lỗ hổng Sudo NOPASSWD: Nếu tệp tin nhị phân quản trị như find, vim được cấu hình chạy sudo không cần mật khẩu, kẻ tấn công có thể lợi dụng để spawn shell root (GTFOBins).',
    ],
    plainExplanation:
      'Trong Linux, không phải ai cũng được sửa tệp của người khác. Mỗi file có chìa khóa riêng: r là đọc, w là sửa, x là chạy. Nguy hiểm nhất là khi cấp quyền "chạy hộ quyền sếp" (SUID) hoặc cho phép chạy lệnh sudo mà không hỏi mật khẩu (NOPASSWD). Kẻ xấu chỉ cần dùng chính các lệnh như "find" hay "vim" là biến thành ông chủ root ngay lập tức.',
    keyTakeaway: 'Luôn chạy lệnh "sudo -l" đầu tiên khi muốn kiểm tra khả năng leo quyền trên hệ thống Linux.',
  },
  example: {
    title: 'Ví dụ: Lỗi cấu hình /etc/sudoers cho phép chạy find không mật khẩu',
    vulnerableCode: `# File cấu hình /etc/sudoers bị hở sườn:
www-data ALL=(ALL) NOPASSWD: /usr/bin/find

# Khai thác leo quyền root ngay lập tức (kỹ thuật GTFOBins):
$ sudo find . -exec /bin/sh \\;
# whoami
root`,
    vulnerableExplanation:
      'Cấu hình NOPASSWD cho các công cụ có cờ chạy lệnh bên ngoài (như -exec của find) cho phép user bất kỳ mở một shell root trực tiếp.',
    secureCode: `# Cấu hình an toàn trong /etc/sudoers:
# 1. Bắt buộc nhập mật khẩu khi dùng sudo:
www-data ALL=(ALL) ALL
# 2. Hoặc chỉ cho phép chạy các script cụ thể có tham số cố định, không cấp NOPASSWD cho binary hệ thống.`,
    secureExplanation:
      'Áp dụng nguyên tắc đặc quyền tối thiểu (Least Privilege). Tuyệt đối không đưa các binary như find, vim, awk, nmap vào danh sách NOPASSWD.',
  },
  practice: {
    objective: 'Chạy lệnh "sudo -l" trong Hacker Terminal để phát hiện quyền find NOPASSWD và leo lên quyền root bằng "sudo find . -exec /bin/sh \\;".',
    steps: [
      'Bước 1: Trong Terminal, gõ "sudo -l" để xem danh sách quyền hạn được cấp.',
      'Bước 2: Nhận diện dòng lệnh "(root) NOPASSWD: /usr/bin/find".',
      'Bước 3: Nhập lệnh leo quyền: "sudo find . -exec /bin/sh \\;".',
      'Bước 4: Kiểm tra lại danh tính với "whoami" (kết quả phải là root). Đọc cờ tại "cat /root/flag.txt".',
    ],
    hint: 'Bạn có thể dùng nút phím tắt "sudo find" trên bàn phím ảo di động để thao tác nhanh.',
  },
  ctf: {
    scenario: 'Máy chủ web nội bộ bị cấu hình sai sudoers. Nhiệm vụ của bạn là leo lên root và chiếm cờ được cất giữ trong /root/flag.txt.',
    flag: 'FLAG{gtfobins_sudo_find_root_pwned_2026}',
    hint: 'Chạy "sudo find . -exec /bin/sh \\;" sau đó gõ "cat /root/flag.txt".',
    secretReward: 'Tuyệt vời! Bạn đã thành thạo kỹ thuật leo quyền (Privilege Escalation) kinh điển của dân Pentester.',
  },
  interview: {
    question: 'Bit SUID là gì? Vì sao việc cấu hình SUID trên các trình biên dịch hoặc lệnh tiện ích lại tiềm ẩn nguy cơ bảo mật nghiêm trọng?',
    answer:
      'SUID (Set Owner User ID upon execution) cho phép người thực thi tạm thời mượn quyền của chủ sở hữu tệp tin (thường là root). Nếu tệp đó có chức năng chạy script ngoài hoặc chỉnh sửa file hệ thống (như vim, find, bash), kẻ tấn công có thể chèn lệnh tùy ý để chiếm quyền điều khiển root vĩnh viễn.',
    interviewerTip: 'Nhấn mạnh câu trả lời bằng ví dụ thực tế về dự án GTFOBins (gtfobins.github.io).',
  },
  exitChallenge: {
    question: 'Khi thực hiện lệnh "sudo -l" và phát hiện dòng "(root) NOPASSWD: /usr/bin/find", kỹ thuật nào giúp leo lên root ngay lập tức?',
    options: [
      { id: 'a', text: 'sudo find . -exec /bin/sh \\;' },
      { id: 'b', text: 'chmod 777 /etc/passwd' },
      { id: 'c', text: 'cat /etc/shadow' },
      { id: 'd', text: 'nmap 127.0.0.1' },
    ],
    correctOptionId: 'a',
    explanation: 'Tham số -exec của lệnh find được thực thi với đặc quyền của người gọi (root qua sudo), khởi tạo tiến trình /bin/sh với quyền UID=0.',
  },

  // Backward compatibility
  theorySummary: [
    'Mỗi tệp tin Linux có 3 nhóm quyền: Owner (u), Group (g), Others (o) với các bit r (4), w (2), x (1).',
    'Bit SUID (Set User ID, cờ 4000): Tiến trình con chạy với đặc quyền của chủ sở hữu tệp.',
    'Lỗ hổng Sudo NOPASSWD cho phép spawn shell root thông qua các tiện ích hệ thống (GTFOBins).',
  ],
  taskObjective: 'Chạy lệnh "sudo -l" trong Hacker Terminal để phát hiện quyền find NOPASSWD và khai thác "sudo find . -exec /bin/sh \\;".',
  interviewQuestion: {
    question: 'Bit SUID là gì? Vì sao cấu hình SUID trên binary tiện ích lại nguy hiểm?',
    answer: 'SUID cho phép người chạy mượn quyền root. Nếu binary có tính năng mở shell ngoài như find/vim, kẻ tấn công sẽ chiếm quyền root vĩnh viễn.',
    interviewerTip: 'Nhắc đến dự án GTFOBins.',
  },
};
