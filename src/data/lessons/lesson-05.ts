import { CurriculumLesson } from './types';

export const lesson05: CurriculumLesson = {
  id: 5,
  moduleId: 2,
  moduleName: 'Module 2: Kỹ Năng Junior Penetration Tester (Web AppSec)',
  title: 'Bài 5: SQL Injection (SQLi) - Khai thác Auth Bypass & Trích xuất dữ liệu',
  subtitle: 'Cơ chế ghép chuỗi SQL nguy hiểm, kỹ thuật bẻ gãy câu truy vấn và cách phòng thủ tuyệt đối bằng Prepared Statements',
  toolType: 'sandbox_sqli',
  theory: {
    summary: [
      'SQL Injection (SQLi) xảy ra khi dữ liệu người dùng nhập vào được ghép trực tiếp vào câu lệnh truy vấn cơ sở dữ liệu mà không được tham số hóa.',
      'Kỹ thuật Auth Bypass kinh điển: "admin\' OR \'1\'=\'1" hoặc "admin\' --" biến mệnh đề WHERE luôn luôn đúng, đăng nhập thành công vào tài khoản quản trị mà không cần mật khẩu.',
      'Phòng thủ duy nhất đạt chuẩn: Sử dụng câu truy vấn tham số hóa (Parameterized Queries / Prepared Statements) hoặc ORM chuẩn.',
    ],
    plainExplanation:
      'Hãy tưởng tượng câu lệnh SQL như một bức thư yêu cầu kho hàng xuất đồ. Thay vì chỉ điền tên món hàng vào ô trống, kẻ gian gõ thêm: "Một chiếc áo; VÀ XUẤT LUÔN TOÀN BỘ KHO VÀNG CHO TÔI!". Nếu người thủ kho (cơ sở dữ liệu) chỉ biết đọc bức thư từ đầu đến cuối như một mệnh lệnh duy nhất, họ sẽ làm theo lời kẻ gian. Cơ chế Prepared Statement tách biệt hoàn toàn giữa "khung lệnh" và "dữ liệu điền vào".',
    keyTakeaway: 'Dữ liệu người dùng (User Input) không bao giờ được phép trở thành một phần của cú pháp lệnh SQL thực thi.',
  },
  example: {
    title: 'Ví dụ: Lỗ hổng ghép chuỗi SQL và cách vá bằng Prepared Statements',
    vulnerableCode: `// Lập trình viên ghép chuỗi String Concatenation trực tiếp:
const query = "SELECT * FROM users WHERE username = '" + req.body.username + 
              "' AND password = '" + req.body.password + "'";
// Input độc hại: admin' --
// Câu lệnh SQL thực tế bị bẻ cong:
// SELECT * FROM users WHERE username = 'admin' --' AND password = '...'`,
    vulnerableExplanation:
      'Dấu nháy đơn (\') ngắt chuỗi dữ liệu sớm, và dấu hai gạch ngang (--) biến toàn bộ phần kiểm tra mật khẩu phía sau thành chú thích vô hại, bỏ qua bước xác thực.',
    secureCode: `// Sử dụng Prepared Statement (Tham số hóa với ký tự giữ chỗ ? hoặc $1):
const sql = "SELECT id, username, role FROM users WHERE username = ? AND password_hash = ?";
const [rows] = await db.execute(sql, [req.body.username, hashedPassword]);`,
    secureExplanation:
      'Driver cơ sở dữ liệu sẽ gửi câu lệnh SQL đi biên dịch cấu trúc trước. Chuỗi nhập vào chỉ được coi là giá trị văn bản thuần túy (Data Literal), không thể làm thay đổi cấu trúc luận lý của câu lệnh.',
  },
  practice: {
    objective: 'Trong Sandbox Thực Hành, chuyển sang kịch bản SQLi, nhập chuỗi bypass "admin\' OR \'1\'=\'1" để đăng nhập trái phép vào hệ thống.',
    steps: [
      'Bước 1: Chuyển sang tab Bàn Thực Hành (Sandbox).',
      'Bước 2: Chọn kịch bản "SQL Injection (SQLi)".',
      'Bước 3: Nhập Username: "admin\' OR \'1\'=\'1" và Password tùy ý.',
      'Bước 4: Bấm nút "Gửi Yêu Cầu Đăng Nhập" và quan sát phản hồi cơ sở dữ liệu trả về toàn bộ dữ liệu người dùng.',
      'Bước 5: Chuyển sang chế độ "Đã Vá An Toàn" để xem cách Prepared Statement vô hiệu hóa payload này.',
    ],
    hint: 'Dấu nháy đơn (\') giúp bạn thoát khỏi vùng chuỗi ký tự ban đầu.',
  },
  ctf: {
    scenario: 'Hệ thống đăng nhập của cổng thanh toán nội bộ đang bị lỗi ghép chuỗi SQL. Hãy khai thác Auth Bypass để lấy cờ lưu trong trường ghi chú của tài khoản Admin.',
    flag: 'FLAG{sqli_auth_bypass_union_select_pwned}',
    hint: 'Nhập admin\' OR \'1\'=\'1 vào ô Username và bấm Đăng nhập.',
    secretReward: 'Tuyệt đỉnh! Bạn đã thấu suốt cách thức kẻ tấn công bẻ gãy logic xác thực của cơ sở dữ liệu.',
  },
  interview: {
    question: 'Vì sao việc kiểm tra đầu vào (Input Blacklisting hoặc Regex sanitize) lại KHÔNG được coi là giải pháp phòng vệ triệt để chống SQL Injection?',
    answer:
      'Blacklisting (danh sách đen) luôn thất bại vì ngôn ngữ SQL vô cùng phong phú và có vô số cách để vượt qua các bộ lọc ký tự (như sử dụng mã hóa Hex, URL encoding, chú thích lồng nhau /*!50000...*/, hoặc các hàm toán học). Giải pháp triệt để duy nhất là sử dụng Prepared Statements (Parameterized Queries), vì cơ chế này phân tách hoàn toàn mã lệnh (Code) và dữ liệu (Data) ở cấp độ động cơ cơ sở dữ liệu.',
    interviewerTip: 'Nhớ trích dẫn nguyên lý "Tách rời Code và Data" (Separation of Code and Data).',
  },
  exitChallenge: {
    question: 'Phương pháp nào sau đây là cách phòng thủ chuẩn mực và triệt để nhất để loại bỏ hoàn toàn lỗ hổng SQL Injection trong mã nguồn ứng dụng?',
    options: [
      { id: 'a', text: 'Chỉ chặn từ khóa OR và AND bằng biểu thức chính quy Regex' },
      { id: 'b', text: 'Sử dụng Prepared Statements (Tham số hóa câu truy vấn)' },
      { id: 'c', text: 'Mã hóa cơ sở dữ liệu bằng AES-256' },
      { id: 'd', text: 'Chuyển cổng cơ sở dữ liệu từ 3306 sang 8080' },
    ],
    correctOptionId: 'b',
    explanation: 'Prepared Statements gửi câu truy vấn đến cơ sở dữ liệu để biên dịch cấu trúc trước, sau đó mới truyền tham số dữ liệu vào, ngăn ngừa triệt để việc thay đổi logic SQL.',
  },

  // Backward compatibility
  theorySummary: [
    'SQL Injection (SQLi) xảy ra khi dữ liệu người dùng được ghép trực tiếp vào chuỗi truy vấn.',
    'Kỹ thuật Auth Bypass kinh điển: "admin\' OR \'1\'=\'1" bỏ qua kiểm tra mật khẩu.',
    'Phòng thủ duy nhất đạt chuẩn: Sử dụng Prepared Statements (Parameterized Queries).',
  ],
  taskObjective: 'Trong Sandbox, chọn kịch bản SQLi, nhập chuỗi bypass "admin\' OR \'1\'=\'1" để đăng nhập vào hệ thống.',
  interviewQuestion: {
    question: 'Vì sao Input Sanitization không thể thay thế Prepared Statements trong phòng chống SQLi?',
    answer: 'Bộ lọc danh sách đen luôn có thể bị vượt qua do sự đa dạng của cú pháp SQL. Chỉ có Prepared Statements mới phân tách hoàn toàn giữa Code và Data.',
    interviewerTip: 'Nhắc đến Separation of Code and Data.',
  },
};
