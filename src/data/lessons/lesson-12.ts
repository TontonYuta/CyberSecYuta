import { CurriculumLesson } from './types';

export const lesson12: CurriculumLesson = {
  id: 12,
  moduleId: 4,
  moduleName: 'Module 4: Đồ Án Tốt Nghiệp & Dự Tuyển Việc Làm (Capstone)',
  title: 'Bài 12: Kỹ thuật Feynman & Viết báo cáo Security Writeup chuyên nghiệp',
  subtitle: 'Chuyển hóa tri thức kỹ thuật thành văn bản báo cáo đạt chuẩn công ty bảo mật và hồ sơ Portfolio GitHub',
  toolType: 'writeup',
  theory: {
    summary: [
      'Kỹ thuật học Feynman: Cách tốt nhất để hiểu sâu một lỗ hổng bảo mật là giải thích nó cho một người không rành kỹ thuật (như một đứa trẻ 10 tuổi hoặc Giám đốc điều hành kinh doanh) bằng ngôn ngữ giản dị, không biệt ngữ.',
      'Cấu trúc một bản Báo cáo Lỗ hổng (Security Vulnerability Report / Writeup) chuẩn quốc tế: 1. Executive Summary (Tóm tắt cho ban lãnh đạo) ➔ 2. Technical Vulnerability Details & CVSS Score ➔ 3. Step-by-Step Proof of Concept (PoC) ➔ 4. Business Impact ➔ 5. Remediation Plan (Đề xuất vá lỗi cụ thể).',
      'Portfolio cá nhân là vũ khí số 1 khi xin việc Junior Pentester / SOC: 3 bài Writeup chỉn chu trên GitHub có giá trị thực tế cao hơn nhiều chứng chỉ lý thuyết.',
    ],
    plainExplanation:
      'Làm chuyên gia an ninh mạng không chỉ có việc ngồi gõ code trong phòng tối. Khi bạn tìm ra một lỗ hổng nguy hiểm, bạn phải viết một bản báo cáo sao cho Giám đốc công ty (người không biết lập trình) hiểu được: "Nếu không sửa cái này, công ty sẽ mất bao nhiêu tiền và uy tín sẽ bị ảnh hưởng thế nào!". Kỹ thuật Feynman dạy bạn biến những thuật ngữ rối rắm thành câu chuyện dễ hiểu, thuyết phục mọi người cùng chung tay bảo vệ hệ thống.',
    keyTakeaway: 'Kỹ năng trình bày và viết báo cáo quyết định 70% mức lương và cơ hội thăng tiến của một kỹ sư an ninh mạng.',
  },
  example: {
    title: 'Ví dụ: Mẫu báo cáo PoC chuẩn mực cho một lỗ hổng bảo mật',
    vulnerableCode: `# Cấu trúc Báo Cáo Bảo Mật (Vulnerability Assessment Report):
Tiêu đề: Lỗ hổng RCE không xác thực trên Endpoint /api/ping
Mức độ nghiêm trọng: Nghiêm trọng (Critical - CVSS 9.8)
Phạm vi ảnh hưởng: https://api.company.com/v1/ping

1. Tóm tắt điều hành (Executive Summary):
Lỗ hổng cho phép kẻ tấn công ngoài Internet thực thi mã tùy ý trên máy chủ mà không cần đăng nhập.

2. Các bước tái hiện (Proof-of-Concept):
curl -X POST https://api.company.com/v1/ping -d 'ip=127.0.0.1; whoami'
Kết quả: Máy chủ trả về "www-data" trong phản hồi.

3. Khuyến nghị khắc phục (Remediation):
Chuyển đổi từ hàm exec() sang execFile() với danh sách đối số cố định.`,
    vulnerableExplanation:
      'Bản báo cáo thiếu rõ ràng hoặc chỉ đưa mỗi dòng payload sẽ khiến đội lập trình viên bối rối không biết tái hiện và không biết mức độ nguy hiểm đối với doanh nghiệp.',
    secureCode: `# Quy tắc viết báo cáo thuyết phục:
1. Luôn ghi rõ mã CVSS và phân loại rủi ro (Nghiêm trọng / Cao / Trung bình / Thấp).
2. Các bước PoC phải đảm bảo bất kỳ kỹ sư nào làm theo cũng ra cùng một kết quả.
3. Kèm theo ảnh chụp màn hình bằng chứng (Screenshots) và đề xuất đoạn mã vá cụ thể.`,
    secureExplanation:
      'Một báo cáo chuyên nghiệp giúp rút ngắn thời gian phản ứng từ hàng tuần xuống chỉ còn vài giờ, bảo vệ an toàn cho cả doanh nghiệp.',
  },
  practice: {
    objective: 'Trong tab "Lộ Trình & Writeup Studio", viết một bài tóm tắt về lỗ hổng SQL Injection hoặc IDOR bằng phương pháp Feynman, sau đó xuất ra tệp Markdown (.MD).',
    steps: [
      'Bước 1: Chuyển sang tab "Lộ Trình & Writeup Studio".',
      'Bước 2: Cuộn xuống phần "Feynman Writeup Studio".',
      'Bước 3: Chọn lỗ hổng bạn muốn viết bài tóm tắt.',
      'Bước 4: Điền phần giải thích bình dân, cơ chế tấn công và phương án vá lỗi.',
      'Bước 5: Bấm nút "Xuất File Markdown (.MD)" để tải bài viết về máy cá nhân đưa vào Portfolio.',
    ],
    hint: 'Hãy giải thích sao cho một người bạn không học IT cũng có thể hiểu được.',
  },
  ctf: {
    scenario: 'Hội đồng chuyên môn yêu cầu bạn nộp một bài tóm tắt kỹ thuật. Hãy tải về bài viết Writeup đầu tiên của bạn để nhận cờ.',
    flag: 'FLAG{feynman_security_writeup_master_2026}',
    hint: 'Điền thông tin vào Feynman Writeup Studio và bấm nút sao chép hoặc xuất Markdown.',
    secretReward: 'Chúc mừng bạn! Bạn đã hoàn thành kỹ năng mềm quan trọng nhất của một chuyên gia an toàn thông tin.',
  },
  interview: {
    question: 'Hãy giải thích lỗ hổng SQL Injection cho một Giám đốc Kinh doanh (hoàn toàn không có kiến thức kỹ thuật về lập trình) sao cho họ đồng ý cấp ngân sách bảo mật để vá lỗi?',
    answer:
      '"Thưa anh/chị, trang web bán hàng của chúng ta hiện nay giống như một quầy lễ tân nhận phiếu đặt hàng viết tay từ khách hàng. Thông thường, khách hàng chỉ ghi \'Tôi muốn mua 1 chiếc áo thun\'. Tuy nhiên, do nhân viên lễ tân của chúng ta chưa được hướng dẫn kỹ, một khách hàng xấu tính có thể viết thêm vào tờ giấy: \'Tôi mua 1 chiếc áo thun, và nhân tiện mang toàn bộ danh sách 50.000 khách hàng VIP cùng số thẻ ngân hàng của họ ra đây cho tôi\'. Khi nhân viên mang tờ giấy đó vào kho, kho hàng đã ngoan ngoãn đưa hết dữ liệu ra cho kẻ gian. Nếu chúng ta không trang bị thêm quy trình kiểm tra phiếu đặt hàng (chỉ tốn khoảng 2 ngày làm việc), công ty sẽ đối mặt với nguy cơ bị rò rỉ dữ liệu khách hàng, bị phạt vi phạm quy định dữ liệu và mất toàn bộ uy tín thương hiệu trên thị trường."',
    interviewerTip: 'Nhà tuyển dụng đánh giá cao khả năng dùng ẩn dụ đời thường và quy đổi rủi ro kỹ thuật thành rủi ro tài chính/thương hiệu của doanh nghiệp.',
  },
  exitChallenge: {
    question: 'Trong cấu trúc một bản Báo cáo đánh giá bảo mật (Vulnerability Assessment Report), mục nào quan trọng nhất đối với ban lãnh đạo điều hành doanh nghiệp (C-Level)?',
    options: [
      { id: 'a', text: 'Executive Summary (Tóm tắt điều hành & Tác động kinh doanh)' },
      { id: 'b', text: 'Bảng mã Hex nhị phân của gói tin' },
      { id: 'c', text: 'Mã nguồn C++ của công cụ khai thác' },
      { id: 'd', text: 'Danh sách các cổng mạng đóng' },
    ],
    correctOptionId: 'a',
    explanation: 'Executive Summary tóm tắt ngắn gọn rủi ro, thiệt hại tiềm tàng và hành động cần thiết bằng ngôn ngữ phi kỹ thuật để lãnh đạo đưa ra quyết định.',
  },

  // Backward compatibility
  theorySummary: [
    'Kỹ thuật Feynman: Giải thích lỗ hổng bằng ngôn ngữ giản dị nhất.',
    'Báo cáo chuẩn gồm: Executive Summary, CVSS, PoC từng bước, Tác động & Phương án vá.',
    'Writeup chỉn chu trên GitHub là vũ khí số 1 khi xin việc làm.',
  ],
  taskObjective: 'Viết bài tóm tắt Feynman trong Writeup Studio và xuất file Markdown.',
  interviewQuestion: {
    question: 'Cách giải thích SQLi cho Giám đốc kinh doanh không biết kỹ thuật?',
    answer: 'Dùng ẩn dụ quầy lễ tân nhận phiếu đặt hàng bị kẻ gian viết thêm lệnh lấy trộm danh bạ VIP; gắn với rủi ro tài chính và uy tín.',
    interviewerTip: 'Đánh giá khả năng chuyển đổi rủi ro kỹ thuật sang tác động kinh doanh.',
  },
};
