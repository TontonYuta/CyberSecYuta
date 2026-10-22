import { CurriculumLesson } from './types';

export const lesson09: CurriculumLesson = {
  id: 9,
  moduleId: 2,
  moduleName: 'Module 2: Kỹ Năng Junior Penetration Tester (Web AppSec)',
  title: 'Bài 9: Clickjacking, UI Redressing & Bảo Mật Giao Diện Web UX/UI',
  subtitle: 'Cách kẻ tấn công thao túng thị giác (Visual Deception), lồng iframe vô hình và nguyên tắc thiết kế UI/UX phòng thủ',
  toolType: 'ux_security',
  theory: {
    summary: [
      'Clickjacking (còn gọi là UI Redressing) là kỹ thuật tấn công đánh lừa thị giác người dùng bằng cách chèn một trang web mục tiêu nhạy cảm vào một thẻ <iframe> trong suốt (opacity: 0) nằm đè lên một nút bấm mồi chài (như "Bấm để nhận quà", "Chơi game trúng thưởng").',
      'Khi người dùng click vào nút bấm mồi chài thấy trên màn hình, cú click thực chất được truyền thẳng vào nút bấm nhạy cảm bên dưới của iframe (như "Xác nhận chuyển tiền", "Xóa tài khoản", "Cấp quyền truy cập camera").',
      'Lớp phòng thủ chuẩn mực: Sử dụng HTTP Response Header "Content-Security-Policy: frame-ancestors \'none\'" hoặc "X-Frame-Options: DENY" để cấm các website khác nhúng trang web của bạn vào iframe.',
      'Nguyên lý UX/UI phòng thủ (Anti-Slop): Loại bỏ các thiết kế mập mờ (Dark Patterns), đảm bảo độ tương phản cao, xác nhận 2 bước cho các hành động phá hủy, và bảo vệ giao diện trước kỹ thuật thao túng con trỏ chuột (Cursor Hijacking).',
    ],
    plainExplanation:
      'Hãy tưởng tượng bạn nhìn thấy một tờ giấy ghi "Bấm vào đây để nhận 1 triệu đồng". Nhưng người ta lại dán đè lên trên một tấm kính trong suốt tuyệt đối, và trên tấm kính đó chính là nút "Ký tên chuyển nhượng toàn bộ nhà đất cho kẻ lừa đảo". Bạn hí hửng bấm tay vào chữ nhận tiền, nhưng thực ra ngón tay bạn vừa ấn vào nút ký giấy bán nhà! Đó chính là cách Clickjacking hoạt động.',
    keyTakeaway: 'Luôn gửi kèm tiêu đề "Content-Security-Policy: frame-ancestors \'none\'" trên mọi trang web có chứa thao tác hoặc dữ liệu nhạy cảm.',
  },
  example: {
    title: 'Ví dụ: Kịch bản tấn công Clickjacking và cách cấu hình Header bảo vệ',
    vulnerableCode: `<!-- Trang web của kẻ tấn công (attacker.com): -->
<div style="position: relative; width: 400px; height: 300px;">
  <!-- Nút mồi chài người dùng nhìn thấy: -->
  <button style="position: absolute; top: 100px; left: 100px; z-index: 1;">
    🎁 Bấm Nhận Quà 100.000 VNĐ
  </button>
  <!-- Iframe trang web ngân hàng bị chỉnh độ mờ bằng 0 nằm đè lên đúng tọa độ: -->
  <iframe src="https://bank.com/transfer?to=attacker&amount=10000000"
          style="position: absolute; top: 0; left: 0; opacity: 0.0001; z-index: 2; width: 400px; height: 300px;">
  </iframe>
</div>`,
    vulnerableExplanation:
      'Nạn nhân nghĩ rằng mình đang bấm nút nhận quà, nhưng thực chất đã click trúng nút "Chuyển tiền" trong phiên đăng nhập ngân hàng đang mở sẵn ở iframe.',
    secureCode: `// Cấu hình HTTP Security Headers trên máy chủ (Node.js / Nginx / Express):
// Cách 1: Tiêu chuẩn hiện đại Content-Security-Policy (Khuyên dùng)
res.setHeader('Content-Security-Policy', "frame-ancestors 'none';");

// Cách 2: Tiêu đề di sản X-Frame-Options (Tương thích trình duyệt cũ)
res.setHeader('X-Frame-Options', 'DENY');

// Hoặc chỉ cho phép nhúng trong cùng một tên miền chính thống:
// Content-Security-Policy: frame-ancestors 'self';`,
    secureExplanation:
      'Khi trình duyệt nhìn thấy chỉ thị frame-ancestors \'none\', nó sẽ từ chối hoàn toàn việc hiển thị trang web bên trong bất kỳ thẻ iframe nào của bên thứ ba.',
  },
  practice: {
    objective: 'Trải nghiệm Lab tương tác Clickjacking trong tab "Bảo Mật Giao Diện & UX/UI": Kéo thanh Opacity để nhìn thấu lớp iframe ẩn và bật chế độ phòng thủ X-Frame-Options.',
    steps: [
      'Bước 1: Chuyển sang mục "Bảo Mật Giao Diện & UX/UI".',
      'Bước 2: Tìm phần "Phòng Thí Nghiệm Clickjacking & UI Redressing".',
      'Bước 3: Kéo thanh trượt "Độ Mờ Lớp Iframe" từ 0% lên 100% để quan sát nút nhạy cảm ẩn bên dưới.',
      'Bước 4: Bấm vào nút "Bật Header frame-ancestors: \'none\'" để thấy trình duyệt bảo vệ và chặn hiển thị iframe độc hại.',
    ],
    hint: 'Kéo thanh Opacity lên 80% là thấy ngay chiếc bẫy tinh vi của kẻ tấn công.',
  },
  ctf: {
    scenario: 'Một cổng thanh toán trực tuyến quên không bật header chống lồng khung. Hãy tìm thuộc tính CSS nào quyết định độ vô hình của lớp phủ giao diện trong cuộc tấn công Clickjacking để giải cờ.',
    flag: 'FLAG{clickjacking_ui_redressing_frame_ancestors_none}',
    hint: 'Thuộc tính kiểm soát độ trong suốt là opacity: 0; và header phòng thủ là frame-ancestors.',
    secretReward: 'Chúc mừng bạn! Bạn đã hoàn thành chuyên đề đặc biệt về Bảo mật Giao diện UX/UI và Chống thao túng thị giác người dùng.',
  },
  interview: {
    question: 'Clickjacking khác gì với CSRF? Tại sao việc trang bị CSRF Token đôi khi vẫn không thể bảo vệ người dùng nếu thiếu Header chống clickjacking?',
    answer:
      'Trong CSRF, kẻ tấn công tự động gửi một HTTP Request giả mạo ngầm mà người dùng không hề hay biết hay click vào (sử dụng form tự submit hoặc thẻ img). Trong khi đó, Clickjacking bắt buộc phải có cú click chuột thực tế của người dùng, nhưng cú click đó bị đánh lừa vào một tọa độ khác. Vì cú click chuột là do chính người dùng thực hiện hợp lệ trên giao diện gốc của trang web trong iframe, nên form gốc đã có sẵn CSRF Token hợp lệ trong HTML; do đó CSRF Token hoàn toàn bị vượt qua nếu không có tiêu đề frame-ancestors / X-Frame-Options.',
    interviewerTip: 'Nhấn mạnh: CSRF Token bảo vệ trước request ngầm, nhưng bất lực trước Clickjacking vì nạn nhân tự tay click vào form thật.',
  },
  exitChallenge: {
    question: 'Chỉ thị nào trong Content-Security-Policy (CSP) là tiêu chuẩn hiện đại nhất để ngăn chặn triệt để cuộc tấn công Clickjacking?',
    options: [
      { id: 'a', text: "frame-ancestors 'none'" },
      { id: 'b', text: "script-src 'unsafe-inline'" },
      { id: 'c', text: "object-src 'self'" },
      { id: 'd', text: "connect-src *" },
    ],
    correctOptionId: 'a',
    explanation: "Chỉ thị frame-ancestors 'none' cấm mọi trang web khác nhúng website vào thẻ iframe, frame hoặc object, thay thế hoàn toàn header cũ X-Frame-Options.",
  },

  // Backward compatibility
  theorySummary: [
    'Clickjacking đánh lừa thị giác người dùng bằng iframe trong suốt (opacity: 0).',
    'Nạn nhân tưởng bấm nút nhận quà nhưng thực chất bấm vào nút nhạy cảm bị che khuất.',
    'Phòng thủ: Content-Security-Policy: frame-ancestors \'none\' hoặc X-Frame-Options: DENY.',
  ],
  taskObjective: 'Trải nghiệm phòng lab Clickjacking trong mục UX/UI, kéo thanh Opacity và kích hoạt frame-ancestors.',
  interviewQuestion: {
    question: 'Tại sao CSRF Token không ngăn được Clickjacking?',
    answer: 'Vì người dùng trực tiếp click vào trang thật được nhúng trong iframe, nên form đã có sẵn CSRF Token hợp lệ.',
    interviewerTip: 'Phân biệt request ngầm (CSRF) vs cú click thật của người dùng (Clickjacking).',
  },
};
