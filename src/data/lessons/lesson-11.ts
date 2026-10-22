import { CurriculumLesson } from './types';

export const lesson11: CurriculumLesson = {
  id: 11,
  moduleId: 3,
  moduleName: 'Module 3: Kỹ Năng Junior SOC Analyst (Phòng Thủ & Điều Tra Số)',
  title: 'Bài 11: Chuỗi tấn công Cyber Kill Chain & Kỹ thuật Săn lùng mối đe dọa (Threat Hunting)',
  subtitle: 'Bám sát khung MITRE ATT&CK, dựng lại dòng thời gian sự cố (Incident Timeline) từ bước Recon đến Chiếm quyền',
  toolType: 'soc_log',
  theory: {
    summary: [
      'Mô hình Cyber Kill Chain (Lockheed Martin) chia một chiến dịch tấn công thành 7 giai đoạn: 1. Reconnaissance (Trinh sát) ➔ 2. Weaponization (Vũ khí hóa) ➔ 3. Delivery (Phát tán) ➔ 4. Exploitation (Khai thác) ➔ 5. Installation (Cài cắm mã độc) ➔ 6. Command & Control - C2 (Điều khiển) ➔ 7. Actions on Objectives (Phá hoại hoặc đánh cắp dữ liệu).',
      'Khung MITRE ATT&CK là từ điển chiến thuật và kỹ thuật tấn công thực tế được chuẩn hóa toàn cầu, giúp SOC ánh xạ chính xác hành vi của các nhóm gián điệp APT.',
      'Threat Hunting chủ động: Không ngồi chờ cảnh báo SIEM, kỹ sư bảo mật chủ động giả định hệ thống đã bị xâm nhập (Assume Breach) và truy tìm các dấu hiệu bất thường (IoC - Indicator of Compromise, IoA - Indicator of Attack).',
    ],
    plainExplanation:
      'Một tên trộm không bao giờ bỗng nhiên xuất hiện trong két sắt của bạn. Hắn phải đi dạo quanh nhà để ngắm nghía cửa sổ (Trinh sát), chuẩn bị xà beng (Vũ khí hóa), trèo qua hàng rào (Khai thác), cài một cửa ngách bí mật (Cài cắm backdoor) và cuối cùng mới bê két sắt đi (Hành động mục tiêu). Chuỗi Kill Chain giúp người phòng thủ chặn đứng tên trộm ở bất kỳ bước nào trước khi hắn kịp lấy cắp tài sản.',
    keyTakeaway: 'Chặn đứng kẻ tấn công càng sớm ở những bước đầu của chuỗi Kill Chain thì thiệt hại cho doanh nghiệp càng tiệm cận bằng 0.',
  },
  example: {
    title: 'Ví dụ: Dựng lại dòng thời gian một vụ xâm nhập Web Server qua Log',
    vulnerableCode: `# Timeline trích xuất từ nhiều nguồn log khác nhau:
1) 08:00:15 - IP 203.0.113.50 gửi hàng nghìn request /admin, /wp-admin (Reconnaissance)
2) 08:05:40 - Phát hiện gói POST /api/upload chứa file webshell "cmd.php" (Weaponization/Delivery)
3) 08:06:10 - Gửi GET /uploads/cmd.php?cmd=whoami -> trả về www-data (Exploitation/Installation)
4) 08:12:00 - Xuất hiện kết nối TCP outbound từ server ra IP lạ cổng 4444 (Command & Control / Reverse Shell)
5) 08:15:30 - Lệnh mysqldump xuất toàn bộ CSDL khách hàng ra tệp zip (Actions on Objectives)`,
    vulnerableExplanation:
      'Dòng thời gian rõ ràng chứng minh kẻ tấn công đã hoàn tất toàn bộ 7 bước của Cyber Kill Chain và lấy cắp thành công dữ liệu.',
    secureCode: `# Quy tắc phát hiện sớm (Early Detection Rule) với Sigma / Splunk:
# Phát hiện và tự động cắt đứt tại Bước 4 (chặn tải file thực thi vào thư mục upload):
alert tcp any any -> $HTTP_SERVERS $HTTP_PORTS (
  msg:"WEB-ATTACK PHP file upload in uploads directory";
  flow:to_server,established;
  content:"filename="; pcre:"/\\.php[0-9]?$/i";
  classtype:web-application-attack;
  sid:1000201; rev:1;
)`,
    secureExplanation:
      'Ngăn chặn ngay tại khâu tải tệp (Upload) sẽ triệt tiêu khả năng kẻ tấn công thực thi mã (Exploitation) và dựng kênh điều khiển (C2).',
  },
  practice: {
    objective: 'Trong tab Ma Trận Log SOC, xác định các giai đoạn của một vụ tấn công và xây dựng báo cáo chuỗi sự cố tóm tắt.',
    steps: [
      'Bước 1: Chuyển sang tab "Ma Trận Log SOC".',
      'Bước 2: Tìm chuỗi các request liên tiếp từ cùng một địa chỉ IP.',
      'Bước 3: Nhận diện bước dò quét ban đầu và bước khai thác thành công.',
      'Bước 4: Đối chiếu với mô hình 7 bước của Cyber Kill Chain.',
    ],
    hint: 'Tìm thời điểm bắt đầu xuất hiện các request quét tự động và thời điểm xuất hiện lệnh thực thi.',
  },
  ctf: {
    scenario: 'Đội săn mối đe dọa (Threat Hunters) phát hiện một kết nối C2 bí mật. Hãy xác định tên chiến thuật đầu tiên trong Cyber Kill Chain để mở cờ.',
    flag: 'FLAG{reconnaissance_weaponization_killchain_2026}',
    hint: 'Giai đoạn đầu tiên là Reconnaissance (Trinh sát).',
    secretReward: 'Xuất sắc! Bạn đã sở hữu tư duy phân tích chiến thuật cấp cao của một Chuyên gia Phòng thủ Không gian mạng.',
  },
  interview: {
    question: 'Khái niệm "Assume Breach" (Giả định hệ thống đã bị xâm nhập) trong chiến lược Zero Trust và Threat Hunting có ý nghĩa gì đối với công việc của một SOC Analyst?',
    answer:
      '"Assume Breach" là tư duy cho rằng tường lửa và các lớp phòng vệ ngoại vi chắc chắn sẽ có lúc bị chọc thủng. Thay vì chủ quan tin rằng hệ thống an toàn tuyệt đối khi chưa thấy chuông báo động, kỹ sư SOC chủ động giả định kẻ tấn công đã hiện diện bên trong mạng nội bộ. Từ đó, người phân tích liên tục săn lùng dấu vết di chuyển ngang (Lateral Movement), leo thang đặc quyền (Privilege Escalation), và các lưu lượng C2 ngầm, áp dụng nguyên tắc kiểm tra liên tục mọi truy cập (Never Trust, Always Verify).',
    interviewerTip: 'Nhấn mạnh 3 nguyên lý trụ cột của Zero Trust: Verify Explicitly, Use Least Privilege, và Assume Breach.',
  },
  exitChallenge: {
    question: 'Trong mô hình Cyber Kill Chain của Lockheed Martin, giai đoạn nào là lúc kẻ tấn công thực hiện việc trinh sát, thu thập thông tin mục tiêu như IP, cổng mở và email nhân viên?',
    options: [
      { id: 'a', text: 'Command and Control' },
      { id: 'b', text: 'Weaponization' },
      { id: 'c', text: 'Reconnaissance' },
      { id: 'd', text: 'Actions on Objectives' },
    ],
    correctOptionId: 'c',
    explanation: 'Reconnaissance (Trinh sát) là bước mở đầu tiên quyết của mọi chiến dịch tấn công nhằm thu thập thông tin về nạn nhân trước khi tiến hành vũ khí hóa và khai thác.',
  },

  // Backward compatibility
  theorySummary: [
    'Mô hình Cyber Kill Chain gồm 7 bước từ Reconnaissance đến Actions on Objectives.',
    'Khung MITRE ATT&CK là từ điển chuẩn hóa chiến thuật tấn công thực tế.',
    'Threat Hunting chủ động hoạt động theo nguyên lý Assume Breach.',
  ],
  taskObjective: 'Dựng timeline chuỗi sự cố trong Ma Trận Log SOC và hoàn thành câu hỏi về Kill Chain.',
  interviewQuestion: {
    question: 'Ý nghĩa của tư duy Assume Breach trong SOC Analyst?',
    answer: 'Giả định kẻ tấn công đã lọt vào mạng nội bộ, chủ động săn lùng dấu vết di chuyển ngang và kênh C2 thay vì ngồi chờ chuông báo.',
    interviewerTip: 'Nhắc đến 3 nguyên lý Zero Trust.',
  },
};
