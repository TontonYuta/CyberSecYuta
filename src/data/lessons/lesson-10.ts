import { CurriculumLesson } from './types';

export const lesson10: CurriculumLesson = {
  id: 10,
  moduleId: 3,
  moduleName: 'Module 3: Kỹ Năng Junior SOC Analyst (Phòng Thủ & Điều Tra Số)',
  title: 'Bài 10: Phân tích điều tra Log máy chủ Apache & Dò tìm dấu vết tấn công',
  subtitle: 'Cấu trúc định dạng Combined Log Format, nhận diện dấu vết quét web tự động và phân loại sự cố (Triage)',
  toolType: 'soc_log',
  theory: {
    summary: [
      'Nhật ký truy cập (Access Log) là "hộp đen" ghi lại toàn bộ hoạt động của máy chủ web, định dạng phổ biến nhất là NCSA Combined Log Format: IP - - [Timestamp] "METHOD /uri HTTP/1.1" Status Bytes "Referer" "User-Agent".',
      'Dấu vết nhận diện các công cụ dò quét tự động: User-Agent bất thường (như "sqlmap/1.7", "Nikto/2.1", "DirBuster", "python-requests/2.x") hoặc các User-Agent giả lập bị lỗi định dạng.',
      'Quy trình sàng lọc sự cố (Triage): Đánh giá mã HTTP (200 OK kèm dung lượng byte lớn thường biểu thị tấn công thành công; 404/403 biểu thị bị chặn hoặc không tìm thấy đường dẫn).',
    ],
    plainExplanation:
      'Log máy chủ giống như camera an ninh quay lại từng người bước vào cửa hàng. Mỗi dòng log cho biết: Khách đến từ đâu (địa chỉ IP), đến lúc mấy giờ, họ muốn xem món đồ gì (đường dẫn URL), họ đi bằng xe gì (User-Agent) và bảo vệ có cho vào hay đuổi ra (mã phản hồi 200 hay 403). Người phân tích SOC giống như trinh thám xem lại băng ghi hình để tìm ra tên trộm.',
    keyTakeaway: 'Luôn chú ý đến sự bất thường về tần suất truy cập đột biến và các chuỗi ký tự lạ trong URI (như ../, UNION, SELECT, <script>).',
  },
  example: {
    title: 'Ví dụ: Dấu vết tấn công dò quét SQLi tự động bằng công cụ sqlmap trong Apache Log',
    vulnerableCode: `# Dòng log thể hiện cuộc tấn công quét tự động vào tham số id:
192.168.1.105 - - [22/Oct/2026:01:15:32 +0700] "GET /products.php?id=1%20AND%201=1 HTTP/1.1" 200 4520 "-" "sqlmap/1.7#stable"
192.168.1.105 - - [22/Oct/2026:01:15:33 +0700] "GET /products.php?id=1%20AND%201=2 HTTP/1.1" 200 120 "-" "sqlmap/1.7#stable"
192.168.1.105 - - [22/Oct/2026:01:15:34 +0700] "GET /products.php?id=1%20UNION%20SELECT%20username,password%20FROM%20users HTTP/1.1" 200 9850 "-" "sqlmap/1.7#stable"`,
    vulnerableExplanation:
      'Chênh lệch dung lượng byte (từ 120 bytes khi sai điều kiện vọt lên 9850 bytes khi UNION SELECT thành công) là dấu hiệu rõ ràng cho thấy dữ liệu đã bị trích xuất.',
    secureCode: `# Phản ứng tức thời của kỹ sư SOC (Containment Action):
# 1. Chặn IP tấn công trên tường lửa iptables:
iptables -I INPUT -s 192.168.1.105 -j DROP

# 2. Cấu hình WAF (ModSecurity / Cloudflare) tự động chặn User-Agent chứa "sqlmap":
SecRule REQUEST_HEADERS:User-Agent "@contains sqlmap" "id:1001,phase:1,deny,status:403"`,
    secureExplanation:
      'Kỹ sư SOC cần cô lập IP của kẻ tấn công ngay lập tức để chặn việc tiếp tục rò rỉ dữ liệu, sau đó thông báo cho đội lập trình viên để vá lỗ hổng ở tầng mã nguồn.',
  },
  practice: {
    objective: 'Trong tab "Ma Trận Log SOC", quan sát bảng 25 dòng nhật ký truy cập thực tế, tìm các dòng có User-Agent mang tên công cụ tấn công và hoàn thành bài thi Triage Quiz.',
    steps: [
      'Bước 1: Chuyển sang tab "Ma Trận Log SOC".',
      'Bước 2: Tìm kiếm các dòng log có mã phản hồi 200 OK với URL chứa dấu vết tấn công SQLi hoặc XSS.',
      'Bước 3: Ghi nhận địa chỉ IP của kẻ tấn công và User-Agent đáng ngờ.',
      'Bước 4: Hoàn thành 3 câu hỏi trắc nghiệm Sàng lọc sự cố (Triage Quiz) ở bên dưới.',
    ],
    hint: 'Lọc các dòng có User-Agent chứa "sqlmap" hoặc "Nikto".',
  },
  ctf: {
    scenario: 'Hệ thống phát hiện xâm nhập vừa lưu lại một vụ tấn công nghiêm trọng. Hãy tìm địa chỉ IP của kẻ tấn công bằng công cụ sqlmap để xác thực cờ.',
    flag: 'FLAG{soc_analyst_apache_log_triage_2026}',
    hint: 'Tìm IP trong bảng log có User-Agent sqlmap: 192.168.1.105.',
    secretReward: 'Tuyệt vời! Bạn đã làm chủ kỹ năng đọc hiểu và điều tra dấu vết số (Digital Forensics) của một chuyên viên SOC Analyst thực thụ.',
  },
  interview: {
    question: 'Khi nhận được một cảnh báo Alert từ hệ thống SIEM thông báo có một địa chỉ IP lạ quét hàng trăm đường dẫn nhạy cảm trên máy chủ Web, 3 bước hành động đầu tiên của bạn là gì?',
    answer:
      'Bước 1 (Xác minh - Verification): Tôi sẽ kiểm tra log chi tiết để xác định đây có phải là False Positive không (do pentest nội bộ hay quét định kỳ) và xem các request đó nhận mã trạng thái gì (nếu toàn 404/403 thì chưa bị xâm nhập, nếu có 200 OK thì cần kiểm tra xem có payload nào thành công không). Bước 2 (Ngăn chặn - Containment): Nếu xác định là tấn công thật, tôi sẽ phối hợp chặn ngay địa chỉ IP đó trên Firewall/WAF hoặc vô hiệu hóa tài khoản liên quan. Bước 3 (Điều tra sâu & Báo cáo - Eradication & Reporting): Rà soát lại toàn bộ timeline hoạt động của IP đó từ trước tới nay xem kẻ tấn công đã làm những gì, lập báo cáo sự cố và đề xuất bản vá.',
    interviewerTip: 'Nhớ viện dẫn quy trình ứng cứu sự cố chuẩn NIST SP 800-61 (Preparation -> Detection/Analysis -> Containment -> Eradication -> Recovery -> Lessons Learned).',
  },
  exitChallenge: {
    question: 'Trong định dạng Combined Log Format của máy chủ web, thành phần nào tiết lộ thông tin về trình duyệt hoặc công cụ phần mềm mà máy khách đang sử dụng để gửi yêu cầu?',
    options: [
      { id: 'a', text: 'HTTP Referer' },
      { id: 'b', text: 'User-Agent' },
      { id: 'c', text: 'Content-Length' },
      { id: 'd', text: 'Status Code' },
    ],
    correctOptionId: 'b',
    explanation: 'User-Agent là chuỗi ký tự mà máy khách gửi lên để khai báo danh tính phần mềm, trình duyệt hoặc công cụ tự động (như curl, sqlmap, Chrome).',
  },

  // Backward compatibility
  theorySummary: [
    'Log máy chủ là hộp đen ghi lại toàn bộ hoạt động truy cập.',
    'Nhận diện công cụ quét tự động qua User-Agent: sqlmap, Nikto, DirBuster.',
    'Quy trình sàng lọc (Triage): Đối chiếu mã HTTP và kích thước byte.',
  ],
  taskObjective: 'Trong tab Ma Trận Log SOC, quan sát các dòng log và hoàn thành bài thi Triage Quiz.',
  interviewQuestion: {
    question: '3 bước đầu tiên khi nhận alert SIEM về IP quét hàng loạt?',
    answer: '1. Xác minh False Positive & mã phản hồi; 2. Ngăn chặn chặn IP trên Firewall/WAF; 3. Điều tra timeline và lập báo cáo theo chuẩn NIST.',
    interviewerTip: 'Nhắc đến NIST SP 800-61.',
  },
};
