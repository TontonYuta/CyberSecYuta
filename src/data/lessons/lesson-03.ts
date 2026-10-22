import { CurriculumLesson } from './types';

export const lesson03: CurriculumLesson = {
  id: 3,
  moduleId: 1,
  moduleName: 'Module 1: Nền Tảng Kỹ Thuật (Foundation)',
  title: 'Bài 3: Bắt tay TCP 3 bước & Kính hiển vi gói tin Wireshark',
  subtitle: 'Phân tích cơ chế bắt tay SYN ➔ SYN-ACK ➔ ACK và cách thức dữ liệu di chuyển trên dây cáp mạng',
  toolType: 'wireshark',
  theory: {
    summary: [
      'Giao thức TCP (Transmission Control Protocol) là xương sống của Web, hoạt động theo cơ chế hướng kết nối (Connection-oriented) tin cậy.',
      'Quá trình bắt tay 3 bước (Three-way Handshake): 1. Client gửi cờ SYN ➔ 2. Server phản hồi SYN-ACK ➔ 3. Client xác nhận ACK. Sau đó kênh truyền mới chính thức mở.',
      'Wireshark là công cụ giám sát gói tin số 1 thế giới, phân rã gói tin theo mô hình 7 tầng OSI: Tầng 2 (Ethernet MAC), Tầng 3 (IP), Tầng 4 (TCP/UDP Port), Tầng 7 (Payload HTTP/DNS).',
    ],
    plainExplanation:
      'Giao tiếp qua mạng giống như hai người gọi điện thoại: Bạn nhấc máy nói "Alo nghe rõ không?" (SYN); người bên kia đáp "Nghe rõ, bên bạn có nghe không?" (SYN-ACK); bạn bảo "Nghe rõ!" (ACK). Chỉ khi đủ 3 câu chào đó thì câu chuyện chính (dữ liệu web, mật khẩu, hình ảnh) mới bắt đầu được truyền đi.',
    keyTakeaway: 'Nếu không thấy gói tin ACK thứ 3, kết nối TCP chưa hoàn tất; đây cũng là cách thức kẻ tấn công thực hiện SYN Flood DDoS.',
  },
  example: {
    title: 'Ví dụ: Dấu hiệu tấn công SYN Flood làm cạn kiệt tài nguyên máy chủ',
    vulnerableCode: `# Kẻ tấn công liên tục gửi hàng triệu gói SYN giả mạo IP mà không gửi lại ACK:
IP 198.51.100.42.54321 > 10.0.0.1.80: Flags [S], seq 1000000
IP 198.51.100.43.54322 > 10.0.0.1.80: Flags [S], seq 2000000
# Server mở trạng thái SYN_RECV treo đầy bộ nhớ RAM (Backlog Queue đầy)`,
    vulnerableExplanation:
      'Mỗi gói SYN khiến máy chủ phải cấp phát một vùng nhớ trong hàng đợi half-open connection. Nếu hàng đợi đầy, người dùng thật sẽ bị chặn hoàn toàn (Denial of Service).',
    secureCode: `# Kích hoạt tính năng bảo vệ SYN Cookies trên nhân Linux:
sysctl -w net.ipv4.tcp_syncookies=1
# Hoặc thiết lập luật tường lửa giới hạn tốc độ (Rate Limit) qua iptables / nftables:
iptables -A INPUT -p tcp --syn -m limit --limit 20/s --limit-burst 50 -j ACCEPT`,
    secureExplanation:
      'SYN Cookies mã hóa trạng thái kết nối vào số Sequence Number ban đầu, giúp máy chủ không phải tiêu tốn bộ nhớ lưu trạng thái cho tới khi nhận được ACK hợp lệ từ client.',
  },
  practice: {
    objective: 'Quan sát sơ đồ Bắt tay 3 bước TCP SYN ➔ SYN-ACK ➔ ACK, sau đó phân tích các tầng OSI trong Packet Inspector.',
    steps: [
      'Bước 1: Chuyển sang tab Packet Inspector.',
      'Bước 2: Bấm nút "Bắt Đầu Kết Nối TCP" để xem hoạt họa 3 bước bắt tay.',
      'Bước 3: Chọn một gói tin HTTP GET trong bảng danh sách để giải mã cấu trúc Header tầng 3 (IP) và tầng 4 (TCP).',
      'Bước 4: Xem bảng mã Hex dump để thấy dữ liệu nhị phân thực tế chuyển động.',
    ],
    hint: 'Gói tin số #1 luôn mang cờ [SYN], gói số #2 mang cờ [SYN, ACK] và gói số #3 là [ACK].',
  },
  ctf: {
    scenario: 'Một phiên truyền tin bí mật đã diễn ra. Hãy tìm số cổng đích (Destination Port) của dịch vụ Web Server trong luồng gói tin TCP.',
    flag: 'FLAG{tcp_handshake_port_80_captured}',
    hint: 'Cổng mặc định của giao thức HTTP không mã hóa là cổng 80.',
    secretReward: 'Tuyệt vời! Bạn đã làm chủ kiến trúc gói tin mạng từ tầng Physical lên tới tầng Application.',
  },
  interview: {
    question: 'Hãy giải thích cặn kẽ vì sao TCP lại cần đến 3 bước bắt tay (Three-way Handshake) thay vì chỉ cần 2 bước?',
    answer:
      'TCP cần 3 bước để cả hai bên độc lập đồng thuận về số thứ tự gói tin ban đầu (Initial Sequence Number - ISN) và xác nhận rằng cả hai chiều truyền/nhận đều hoạt động bình thường. Nếu chỉ có 2 bước, khi một gói SYN cũ bị trễ trên mạng vô tình đến sau, server sẽ mở kết nối ảo gây lãng phí tài nguyên dù client không hề yêu cầu.',
    interviewerTip: 'Nhắc đến khái niệm "Duplicate SYN packet prevention" và "Sequence Number synchronization".',
  },
  exitChallenge: {
    question: 'Trong quá trình bắt tay 3 bước TCP, cờ (Flag) nào được máy chủ phản hồi lại ngay sau khi nhận được yêu cầu kết nối đầu tiên từ client?',
    options: [
      { id: 'a', text: 'FIN-ACK' },
      { id: 'b', text: 'RST' },
      { id: 'c', text: 'SYN-ACK' },
      { id: 'd', text: 'PSH' },
    ],
    correctOptionId: 'c',
    explanation: 'Khi client gửi cờ SYN, server sẽ đồng thời xác nhận (ACK) và đề xuất kết nối của mình (SYN), tạo thành gói SYN-ACK.',
  },

  // Backward compatibility
  theorySummary: [
    'Giao thức TCP là xương sống của Web, hoạt động theo cơ chế hướng kết nối (Connection-oriented) tin cậy.',
    'Quá trình bắt tay 3 bước: 1. SYN ➔ 2. SYN-ACK ➔ 3. ACK.',
    'Wireshark phân rã gói tin theo mô hình 7 tầng OSI: Tầng 2, Tầng 3, Tầng 4, Tầng 7.',
  ],
  taskObjective: 'Bật tab Packet Inspector, quan sát cơ chế Bắt tay 3 bước TCP và phân tích gói tin HTTP GET.',
  interviewQuestion: {
    question: 'Vì sao TCP cần 3 bước bắt tay thay vì chỉ 2 bước?',
    answer: 'TCP cần 3 bước để cả hai bên đồng thuận số Sequence Number và xác nhận cả 2 chiều truyền đều thông suốt, tránh kết nối ma do gói SYN cũ trễ.',
    interviewerTip: 'Nhắc đến Sequence Number synchronization.',
  },
};
