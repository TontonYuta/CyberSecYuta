import { CurriculumLesson } from './types';

export const lesson06: CurriculumLesson = {
  id: 6,
  moduleId: 2,
  moduleName: 'Module 2: Kỹ Năng Junior Penetration Tester (Web AppSec)',
  title: 'Bài 6: XSS (Cross-Site Scripting) - Đánh cắp phiên & Kịch bản thực thi JS độc hại',
  subtitle: 'Phân biệt Reflected, Stored và DOM XSS; cách mã hóa Context-Aware Output Encoding và chính sách CSP',
  toolType: 'sandbox_xss',
  theory: {
    summary: [
      'XSS (Cross-Site Scripting) xảy ra khi ứng dụng web nhận dữ liệu đầu vào không an toàn và in trực tiếp ra mã HTML/JS mà không qua mã hóa (Contextual Output Encoding).',
      '3 biến thể XSS chính: Reflected (phản xạ qua URL parameter), Stored (lưu trữ vĩnh viễn trong CSDL bài viết/comment), DOM-based (thao tác trực tiếp trên DOM qua JS document.write, innerHTML).',
      'Chiến lược phòng ngự đa tầng: Context-aware HTML Entity Encoding (chuyển < thành &lt;), bật cờ HttpOnly cho cookie, và triển khai Header Content-Security-Policy (CSP).',
    ],
    plainExplanation:
      'Trình duyệt web coi mọi đoạn mã JavaScript gửi về từ máy chủ là hợp lệ và được phép thực thi toàn quyền. Nếu trang web cho phép người dùng gõ bình luận chứa thẻ "<script>", kẻ xấu có thể nhúng mã gián điệp vào. Bất kỳ ai mở trang web đó lên xem bình luận cũng sẽ vô tình chạy đoạn mã độc hại trong trình duyệt của mình, làm mất sạch thông tin cá nhân và tài khoản.',
    keyTakeaway: 'Luôn mã hóa dữ liệu đầu ra phù hợp với ngữ cảnh hiển thị (HTML, Attribute, JavaScript, CSS) và thiết lập chính sách CSP nghiêm ngặt.',
  },
  example: {
    title: 'Ví dụ: Lỗ hổng innerHTML gây Stored XSS và cách phòng thủ an toàn với textContent',
    vulnerableCode: `// Hiển thị bình luận của người dùng bằng innerHTML nguy hiểm:
const commentBox = document.getElementById('comment-box');
commentBox.innerHTML = userComment; // Nếu userComment = "<img src=x onerror=alert(1)>"
// Trình duyệt lập tức phân tích và thực thi mã JavaScript độc hại!`,
    vulnerableExplanation:
      'Gán trực tiếp chuỗi vào innerHTML khiến trình duyệt kích hoạt bộ phân tích HTML Parser, biến các thẻ HTML và thuộc tính sự kiện độc hại (onerror, onload) thành mã thực thi.',
    secureCode: `// Sử dụng thuộc tính an toàn textContent (hoặc thư viện DOMPurify):
const commentBox = document.getElementById('comment-box');
commentBox.textContent = userComment; // Trình duyệt coi toàn bộ là văn bản thuần túy

// Hoặc sử dụng DOMPurify để làm sạch mã HTML nếu bắt buộc phải cho phép định dạng:
import DOMPurify from 'dompurify';
commentBox.innerHTML = DOMPurify.sanitize(userComment);`,
    secureExplanation:
      'Thuộc tính textContent tự động triệt tiêu mọi khả năng thực thi thẻ script. Nếu bắt buộc hỗ trợ rich text, DOMPurify sẽ quét và loại bỏ mọi thẻ/thuộc tính nguy hiểm.',
  },
  practice: {
    objective: 'Trong Sandbox Thực Hành, chuyển sang kịch bản XSS, nhập chuỗi khai thác "<script>alert(document.cookie)</script>" hoặc payload thẻ ảnh "<img src=x onerror=alert(1)>" để kích hoạt cửa sổ cảnh báo.',
    steps: [
      'Bước 1: Chuyển sang tab Bàn Thực Hành (Sandbox).',
      'Bước 2: Chọn kịch bản "Cross-Site Scripting (XSS)".',
      'Bước 3: Nhập bình luận: <img src=x onerror=alert(1)> vào ô nội dung.',
      'Bước 4: Nhấn Gửi bình luận và quan sát mã JavaScript độc hại được thực thi trong trình duyệt.',
      'Bước 5: Chuyển sang chế độ "Đã Vá An Toàn" để xem cách HTML Encoding bảo vệ người dùng.',
    ],
    hint: 'Thử cả payload sự kiện thẻ ảnh onerror khi thẻ <script> bị bộ lọc sơ sài loại bỏ.',
  },
  ctf: {
    scenario: 'Hộp thư phản hồi khách hàng đang bị lỗi hiển thị innerHTML. Hãy nhúng mã độc JavaScript để trích xuất cờ phiên làm việc ẩn trong Cookie.',
    flag: 'FLAG{xss_stored_reflected_csp_defense_2026}',
    hint: 'Sử dụng payload <script>alert(document.cookie)</script> hoặc xem mã nguồn Sandbox.',
    secretReward: 'Tuyệt vời! Bạn đã nắm vững cơ chế tiêm mã Client-side và lá chắn phòng vệ Context-Aware Encoding.',
  },
  interview: {
    question: 'Content-Security-Policy (CSP) là gì? Làm thế nào CSP có thể giảm thiểu rủi ro khi trang web đã lỡ xuất hiện lỗ hổng XSS?',
    answer:
      'CSP là một HTTP Response Header cho phép máy chủ quy định rõ ràng những nguồn tài nguyên nào (scripts, images, styles, iframes) được phép tải và thực thi trên trình duyệt. Ngay cả khi kẻ tấn công đã nhúng thành công đoạn mã độc hại vào trang web, một chính sách CSP nghiêm ngặt (ví dụ: cấm \'unsafe-inline\', chỉ cho phép script có nonce mật mã hoặc xuất phát từ domain tin cậy) sẽ chặn đứng trình duyệt không cho thực thi đoạn script đó, và ngăn chặn trình duyệt gửi dữ liệu đánh cắp ra server của kẻ tấn công qua chỉ thị connect-src.',
    interviewerTip: 'Nhắc đến các chỉ thị CSP cốt lõi: script-src, default-src, connect-src, và cơ chế Nonce-based CSP.',
  },
  exitChallenge: {
    question: 'Phương thức gán giá trị nào sau đây trong JavaScript thuần (Vanilla JS) an toàn trước lỗ hổng XSS khi hiển thị chuỗi do người dùng nhập vào giao diện?',
    options: [
      { id: 'a', text: 'element.innerHTML = userInput;' },
      { id: 'b', text: 'document.write(userInput);' },
      { id: 'c', text: 'element.textContent = userInput;' },
      { id: 'd', text: 'eval(userInput);' },
    ],
    correctOptionId: 'c',
    explanation: 'element.textContent gán dữ liệu dạng chuỗi văn bản thuần túy, trình duyệt sẽ không phân tích cú pháp HTML hay thực thi bất kỳ thẻ script nào.',
  },

  // Backward compatibility
  theorySummary: [
    'XSS xảy ra khi dữ liệu người dùng được in thẳng ra giao diện không qua mã hóa.',
    '3 biến thể XSS chính: Reflected, Stored, DOM-based.',
    'Phòng ngự đa tầng: Context-aware Output Encoding, HttpOnly cookie, Content-Security-Policy (CSP).',
  ],
  taskObjective: 'Trong Sandbox XSS, kích hoạt mã độc bằng thẻ ảnh <img src=x onerror=alert(1)> và chuyển sang chế độ đã vá.',
  interviewQuestion: {
    question: 'CSP là gì và bảo vệ chống XSS như thế nào?',
    answer: 'CSP là HTTP Header hạn chế nguồn script được phép chạy. Nếu cấu hình cấm unsafe-inline, script độc hại sẽ bị trình duyệt từ chối thực thi.',
    interviewerTip: 'Nhắc đến script-src và CSP nonce.',
  },
};
