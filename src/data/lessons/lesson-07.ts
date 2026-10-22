import { CurriculumLesson } from './types';

export const lesson07: CurriculumLesson = {
  id: 7,
  moduleId: 2,
  moduleName: 'Module 2: Kỹ Năng Junior Penetration Tester (Web AppSec)',
  title: 'Bài 7: IDOR (Insecure Direct Object References) & Leo quyền ngang',
  subtitle: 'Khai thác tham số đối tượng trực tiếp không qua kiểm soát truy cập (Broken Access Control)',
  toolType: 'sandbox_idor',
  theory: {
    summary: [
      'IDOR (Insecure Direct Object References) là lỗ hổng thuộc nhóm Broken Access Control (Hạng mục #1 OWASP Top 10).',
      'Xảy ra khi ứng dụng sử dụng định danh đối tượng do người dùng cung cấp (như ?user_id=105 hoặc /api/invoice/4500) để truy xuất tài nguyên trực tiếp mà quên kiểm tra quyền sở hữu của người dùng hiện tại.',
      'Phòng thủ triệt để: Triển khai kiểm tra phân quyền chặt chẽ tại tầng nghiệp vụ Server-side (Session.userId === Object.ownerId) hoặc sử dụng định danh UUID v4 ngẫu nhiên, không thể đoán được.',
    ],
    plainExplanation:
      'Tưởng tượng bạn vào khách sạn và nhận được chìa khóa phòng số 101. Khi đi dọc hành lang, bạn thấy phòng 102 và thử cắm chìa khóa phòng mình vào thì... cửa phòng 102 mở toang! Lỗi IDOR chính là như vậy: máy chủ chỉ kiểm tra xem bạn có đăng nhập hay chưa, chứ không kiểm tra xem bạn có phải là chủ nhân thực sự của căn phòng bạn đang muốn mở hay không.',
    keyTakeaway: 'Luôn xác minh người đang yêu cầu có quyền sở hữu tài nguyên đó hay không ngay tại truy vấn cơ sở dữ liệu ở phía máy chủ.',
  },
  example: {
    title: 'Ví dụ: Lỗ hổng API tải hóa đơn theo ID và cách vá bằng kiểm tra Session UserId',
    vulnerableCode: `// API tra cứu hóa đơn không kiểm tra quyền sở hữu:
app.get('/api/invoice/:id', async (req, res) => {
  const invoice = await db.findInvoiceById(req.params.id);
  // Nguy hiểm chết người: Ai đổi số :id trên URL cũng đọc được hóa đơn của người khác!
  return res.json(invoice);
});`,
    vulnerableExplanation:
      'Hệ thống tin tưởng tuyệt đối tham số :id từ URL của người dùng mà không so sánh với ID người dùng đang đăng nhập trong Session.',
    secureCode: `// API an toàn có kiểm tra phân quyền (Ownership Authorization):
app.get('/api/invoice/:id', authMiddleware, async (req, res) => {
  // Chỉ tìm hóa đơn thuộc về chính tài khoản đang đăng nhập:
  const invoice = await db.findOne({
    id: req.params.id,
    userId: req.session.currentUserId // Ràng buộc bắt buộc quyền sở hữu
  });
  if (!invoice) {
    return res.status(404).json({ error: 'Không tìm thấy hóa đơn hoặc bạn không có quyền truy cập' });
  }
  return res.json(invoice);
});`,
    secureExplanation:
      'Luôn bổ sung điều kiện truy vấn "userId === currentUserId" từ phiên xác thực tin cậy phía máy chủ, ngăn chặn việc chỉ sửa số ID trên URL.',
  },
  practice: {
    objective: 'Trong Sandbox Thực Hành, chuyển sang kịch bản IDOR, chỉnh sửa tham số User ID từ 102 thành 101 (hoặc số khác) để đọc trộm hồ sơ lương bí mật của đồng nghiệp.',
    steps: [
      'Bước 1: Chuyển sang tab Bàn Thực Hành (Sandbox).',
      'Bước 2: Chọn kịch bản "IDOR (Insecure Direct Object Reference)".',
      'Bước 3: Đổi ID hồ sơ trên thanh địa chỉ giả lập từ "102" thành "101".',
      'Bước 4: Nhấn nút xem hồ sơ để thấy thông tin nhạy cảm của người dùng khác bị lộ.',
      'Bước 5: Chuyển sang chế độ "Đã Vá An Toàn" để xem hệ thống từ chối truy cập trái phép.',
    ],
    hint: 'Kẻ tấn công thường sử dụng công cụ như Burp Suite Intruder để quét hàng loạt ID liên tiếp.',
  },
  ctf: {
    scenario: 'Hệ thống quản lý nhân sự đang bị lỗi kiểm soát truy cập đối tượng. Hãy tìm và đọc hồ sơ nhân sự của Giám đốc điều hành có ID=100 để thu thập cờ bí mật.',
    flag: 'FLAG{idor_broken_access_control_bola_2026}',
    hint: 'Thay đổi tham số user_id trên URL thành 100 hoặc 101.',
    secretReward: 'Xuất sắc! Bạn đã làm chủ phương pháp phát hiện lỗ hổng Broken Access Control phổ biến nhất trên các ứng dụng Web hiện đại.',
  },
  interview: {
    question: 'IDOR và BOLA (Broken Object Level Authorization) khác nhau như thế nào? Việc thay thế số tự tăng (Auto-increment ID) bằng UUID v4 có thực sự triệt tiêu được lỗ hổng IDOR không?',
    answer:
      'BOLA là thuật ngữ chuẩn được OWASP sử dụng cho API Security Top 10, trong khi IDOR là thuật ngữ truyền thống của Web AppSec; bản chất kỹ thuật của hai khái niệm này là tương đương. Việc đổi sang UUID v4 làm kẻ tấn công khó đoán mò ID hơn (Security by Obscurity), nhưng KHÔNG giải quyết được gốc rễ vấn đề: nếu một kẻ tấn công thu thập được UUID của nạn nhân (qua chia sẻ link, log, mạng xã hội) mà server không kiểm tra quyền sở hữu, kẻ đó vẫn truy cập được tài nguyên. Do đó, kiểm tra quyền hạn chặt chẽ ở tầng Server-side mới là giải pháp duy nhất triệt tiêu hoàn toàn lỗ hổng.',
    interviewerTip: 'Nhấn mạnh luận điểm: UUID chỉ tăng độ khó dò quét, không thay thế được logic Authorization.',
  },
  exitChallenge: {
    question: 'Giải pháp căn cơ và chuẩn xác nhất để ngăn ngừa lỗ hổng IDOR trong kiến trúc RESTful API là gì?',
    options: [
      { id: 'a', text: 'Chỉ mã hóa tham số ID bằng thuật toán Base64 trên đường dẫn URL' },
      { id: 'b', text: 'Kiểm tra quyền sở hữu tài nguyên ở tầng Server-side dựa trên phiên đăng nhập tin cậy của người dùng' },
      { id: 'c', text: 'Chặn người dùng mở công cụ F12 (DevTools)' },
      { id: 'd', text: 'Sử dụng giao thức HTTPS' },
    ],
    correctOptionId: 'b',
    explanation: 'Chỉ có việc xác minh danh tính và quyền sở hữu tài nguyên trực tiếp tại Server-side mới bảo đảm người dùng không thể can thiệp vào dữ liệu của người khác.',
  },

  // Backward compatibility
  theorySummary: [
    'IDOR thuộc nhóm Broken Access Control (#1 OWASP Top 10).',
    'Xảy ra khi ứng dụng tin tưởng định danh đối tượng mà không kiểm tra quyền sở hữu.',
    'Phòng thủ triệt để: Kiểm tra quyền sở hữu tại Server-side kết hợp UUID v4.',
  ],
  taskObjective: 'Trong Sandbox IDOR, đổi User ID từ 102 thành 101 để đọc hồ sơ lương của người khác.',
  interviewQuestion: {
    question: 'UUID v4 có giải quyết triệt để IDOR không?',
    answer: 'Không. UUID chỉ làm kẻ tấn công khó đoán số ID, nhưng nếu có được link thì vẫn mở được nếu server không kiểm tra quyền sở hữu.',
    interviewerTip: 'Nhắc đến luận điểm Security by Obscurity.',
  },
};
