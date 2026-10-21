export interface LessonExitChallenge {
  question: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
}

export interface CurriculumLesson {
  id: number;
  moduleId: 1 | 2 | 3 | 4;
  moduleName: string;
  title: string;
  subtitle: string;
  toolType: 'terminal' | 'wireshark' | 'sandbox_sqli' | 'sandbox_rce' | 'sandbox_idor' | 'sandbox_xss' | 'soc_log' | 'writeup' | 'capstone';
  theorySummary: string[];
  interviewQuestion: {
    question: string;
    answer: string;
    interviewerTip: string;
  };
  taskObjective: string;
  exitChallenge: LessonExitChallenge;
}

export const MODULES_INFO = [
  { id: 1, name: 'Module 1: Nền Tảng Kỹ Thuật (Foundation)', desc: 'Linux CLI, Phân quyền tệp, TCP/IP & Giao thức Web HTTP' },
  { id: 2, name: 'Module 2: Kỹ Năng Junior Penetration Tester (Web AppSec)', desc: 'Khai thác & Phòng thủ lỗ hổng OWASP Top 10 thực chiến' },
  { id: 3, name: 'Module 3: Kỹ Năng Junior SOC Analyst (Phòng Thủ & Điều Tra Số)', desc: 'Phân tích log tấn công, điều tra chuỗi sự cố & viết báo cáo' },
  { id: 4, name: 'Module 4: Đồ Án Tốt Nghiệp & Dự Tuyển Việc Làm (Capstone)', desc: 'Boot-to-Root Machine, đánh giá năng lực & xuất hồ sơ Portfolio xin việc' },
];

export const CURRICULUM_LESSONS: CurriculumLesson[] = [
  // MODULE 1: NỀN TẢNG KỸ THUẬT
  {
    id: 1,
    moduleId: 1,
    moduleName: 'Module 1: Nền Tảng Kỹ Thuật (Foundation)',
    title: 'Bài 1: Dòng lệnh Linux CLI & Quản trị tệp (OverTheWire Bandit style)',
    subtitle: 'Nắm vững các câu lệnh quản trị hệ thống Unix cốt lõi cho kỹ sư an ninh mạng',
    toolType: 'terminal',
    theorySummary: [
      'Linux là hệ điều hành thống trị 95% máy chủ Internet, tường lửa và thiết bị bảo mật.',
      'Cấu trúc thư mục Linux là một cây đơn nhất xuất phát từ gốc (/), không chia ổ C:\\ hay D:\\ như Windows.',
      'Các câu lệnh thiết yếu: whoami (xem danh tính), id (xem nhóm quyền), pwd (thư mục hiện tại), ls -la (xem tệp ẩn và phân quyền), cat (đọc tệp), grep (tìm chuỗi).',
    ],
    interviewQuestion: {
      question: 'Khi đăng nhập vào một máy chủ Linux lạ trong bài test tuyển dụng Pentester/SOC, 3 lệnh đầu tiên bạn sẽ gõ là gì và tại sao?',
      answer: 'Tôi sẽ gõ "whoami" và "id" để xác định danh tính và quyền hạn hiện tại (có thuộc nhóm sudo/root không); sau đó gõ "uname -a" để kiểm tra phiên bản nhân kernel xem có lỗ hổng đã biết không; và gõ "pwd" kèm "ls -la" để định hướng thư mục làm việc.',
      interviewerTip: 'Nhà tuyển dụng muốn kiểm tra xem bạn có thói quen "Enumeration First" (thu thập thông tin trước khi hành động) hay không.',
    },
    taskObjective: 'Mở Hacker Terminal bên dưới, gõ lệnh "whoami", "id" và đọc file "cat /etc/passwd".',
    exitChallenge: {
      question: 'Tệp tin nào trên hệ thống Linux lưu trữ danh sách các tài khoản người dùng và thư mục home của họ?',
      options: [
        { id: 'a', text: '/etc/shadow' },
        { id: 'b', text: '/etc/passwd' },
        { id: 'c', text: '/var/log/auth.log' },
        { id: 'd', text: '/bin/bash' },
      ],
      correctOptionId: 'b',
      explanation: '/etc/passwd là tệp mở cho mọi người dùng đọc chứa danh sách tài khoản người dùng, còn hash mật khẩu được bảo vệ trong /etc/shadow.',
    },
  },
  {
    id: 2,
    moduleId: 1,
    moduleName: 'Module 1: Nền Tảng Kỹ Thuật (Foundation)',
    title: 'Bài 2: Phân quyền tệp (chmod, SUID) & Leo quyền root cơ bản',
    subtitle: 'Hiểu cơ chế rwx (Read-Write-Execute), SUID bit và cách phát hiện quyền thực thi sudo NOPASSWD',
    toolType: 'terminal',
    theorySummary: [
      'Mỗi tệp tin Linux có 3 nhóm quyền: Owner (u), Group (g), Others (o) với các bit r (4), w (2), x (1).',
      'Bit SUID (Set User ID, cờ 4000): Khi thực thi tệp tin có cờ SUID, tiến trình con sẽ chạy với đặc quyền của chủ sở hữu tệp (thường là root) thay vì quyền của người dùng gọi nó.',
      'Lỗ hổng Sudo NOPASSWD: Nếu tệp tin nhị phân quản trị như find, vim được cấu hình chạy sudo không cần mật khẩu, kẻ tấn công có thể lợi dụng để spawn shell root (GTFOBins).',
    ],
    interviewQuestion: {
      question: 'Bit SUID là gì? Vì sao việc cấu hình SUID trên các trình biên dịch hoặc lệnh tiện ích lại tiềm ẩn nguy cơ bảo mật nghiêm trọng?',
      answer: 'SUID (Set Owner User ID upon execution) cho phép người thực thi tạm thời mượn quyền của chủ sở hữu tệp tin (thường là root). Nếu tệp đó có chức năng chạy script ngoài hoặc chỉnh sửa file hệ thống (như vim, find, bash), kẻ tấn công có thể chèn lệnh tùy ý để chiếm quyền điều khiển root vĩnh viễn.',
      interviewerTip: 'Nhấn mạnh câu trả lời bằng ví dụ thực tế về dự án GTFOBins.',
    },
    taskObjective: 'Chạy lệnh "sudo -l" trong Hacker Terminal để phát hiện quyền find NOPASSWD và khai thác "sudo find . -exec /bin/sh \\;".',
    exitChallenge: {
      question: 'Khi thực hiện lệnh "sudo -l" và phát hiện dòng "(root) NOPASSWD: /usr/bin/find", kỹ thuật nào giúp leo lên root ngay lập tức?',
      options: [
        { id: 'a', text: 'sudo find . -exec /bin/sh \\;' },
        { id: 'b', text: 'chmod 777 /etc/passwd' },
        { id: 'c', text: 'cat /etc/shadow' },
        { id: 'd', text: 'nmap 127.0.0.1' },
      ],
      correctOptionId: 'a',
      explanation: 'Tham số -exec của lệnh find được thực thi với đặc quyền của người gọi (root qua sudo), khởi tạo tiến trình /bin/sh với quyền UID=0.',
    },
  },
  {
    id: 3,
    moduleId: 1,
    moduleName: 'Module 1: Nền Tảng Kỹ Thuật (Foundation)',
    title: 'Bài 3: Bắt tay TCP 3 bước & Kính hiển vi gói tin Wireshark',
    subtitle: 'Phân tích cơ chế bắt tay SYN ➔ SYN-ACK ➔ ACK và cách thức dữ liệu di chuyển trên dây cáp mạng',
    toolType: 'wireshark',
    theorySummary: [
      'Giao thức TCP (Transmission Control Protocol) là giao thức hướng kết nối (connection-oriented), đảm bảo dữ liệu truyền đi không mất mát.',
      '3 bước bắt tay: Bước 1 Client gửi SYN (Seq=0), Bước 2 Server gửi SYN-ACK (Seq=0, Ack=1), Bước 3 Client gửi ACK (Seq=1, Ack=1).',
      'Wireshark hiển thị 5 tầng: Frame (Physical) ➔ Ethernet II (Data Link / MAC) ➔ IPv4 (Network) ➔ TCP (Transport) ➔ HTTP (Application).',
    ],
    interviewQuestion: {
      question: 'Hãy giải thích cơ chế TCP 3-Way Handshake và cho biết cuộc tấn công SYN Flood lợi dụng sơ hở nào trong quá trình này?',
      answer: 'TCP Handshake gồm 3 bước: Client gửi SYN, Server cấp phát tài nguyên và phản hồi SYN-ACK, Client xác nhận ACK để mở phiên kết nối. Tấn công SYN Flood lợi dụng việc Server phải giữ trạng thái bán mở (Half-open / SYN_RCVD) và chờ đợi timeout; kẻ tấn công gửi hàng triệu gói SYN với IP giả mạo khiến bộ đệm server cạn kiệt, gây từ chối dịch vụ (DoS).',
      interviewerTip: 'Nhắc đến giải pháp phòng vệ "SYN Cookies" để ghi điểm tuyệt đối.',
    },
    taskObjective: 'Bật khung bắt tay 3 bước bên dưới, nhấn "Chạy lại bắt tay" và quan sát gói tin di chuyển giữa 192.168.1.50 và 10.0.0.1:80.',
    exitChallenge: {
      question: 'Trong bước thứ 2 của TCP Handshake, máy chủ gửi phản hồi có những cờ (flag bits) nào được bật?',
      options: [
        { id: 'a', text: 'Chỉ cờ SYN' },
        { id: 'b', text: 'Cờ SYN và cờ ACK' },
        { id: 'c', text: 'Cờ ACK và cờ FIN' },
        { id: 'd', text: 'Cờ RST (Reset)' },
      ],
      correctOptionId: 'b',
      explanation: 'Máy chủ đồng thời đồng bộ hóa Seq của mình (SYN) và xác nhận đã nhận được Seq của client (ACK).',
    },
  },
  {
    id: 4,
    moduleId: 1,
    moduleName: 'Module 1: Nền Tảng Kỹ Thuật (Foundation)',
    title: 'Bài 4: Giao thức Web HTTP, Cookie & Kỹ thuật bắt Proxy',
    subtitle: 'Mổ xẻ bản tin HTTP POST truyền thông tin đăng nhập và cơ chế bảo vệ của HTTPS/TLS',
    toolType: 'wireshark',
    theorySummary: [
      'Giao thức HTTP 1.1 truyền dữ liệu dạng văn bản thô (Plaintext). Bất kỳ ai trên cùng đường truyền mạng đều có thể bắt và đọc được mật khẩu.',
      'Headers quan trọng: Host, Content-Type, User-Agent, Set-Cookie (lưu session xác thực).',
      'Chức năng "Follow TCP Stream" trong Wireshark cho phép lắp ghép các đoạn phân mảnh TCP thành luồng hội thoại hoàn chỉnh giữa Client và Server.',
    ],
    interviewQuestion: {
      question: 'Sự khác biệt giữa HTTP và HTTPS ở mức độ gói tin là gì? Kẻ tấn công trên cùng mạng Wi-Fi có thể xem được những gì nếu website dùng HTTP?',
      answer: 'HTTP chạy trên cổng 80 không mã hóa, mọi thông tin như URL, Headers, Cookie, và mật khẩu POST đều đọc được bằng Wireshark. HTTPS chạy trên cổng 443 bọc dữ liệu trong tầng mã hóa TLS 1.3; kẻ nghe lén trên cùng mạng chỉ thấy các khối byte mã hóa ngẫu nhiên và địa chỉ IP đích.',
      interviewerTip: 'Nhà tuyển dụng muốn thấy bạn hiểu rõ tầm quan trọng của cờ HttpOnly và Secure trên Cookie.',
    },
    taskObjective: 'Trong bảng gói tin bên dưới, click vào nút "Follow TCP Stream" để đọc mật khẩu và cookie quản trị viên rò rỉ dạng plaintext.',
    exitChallenge: {
      question: 'Bộ lọc nào trong Wireshark giúp lọc ra chính xác các bản tin gửi dữ liệu HTTP POST lên máy chủ?',
      options: [
        { id: 'a', text: 'ip.addr == 192.168.1.50' },
        { id: 'b', text: 'http.request.method == "POST"' },
        { id: 'c', text: 'tcp.port == 443' },
        { id: 'd', text: 'arp.opcode == 1' },
      ],
      correctOptionId: 'b',
      explanation: 'Biểu thức http.request.method == "POST" là chuẩn Wireshark để lọc các gói tin HTTP gửi dữ liệu form hoặc credentials.',
    },
  },

  // MODULE 2: KỸ NĂNG JUNIOR PENETRATION TESTER (WEB APPSEC)
  {
    id: 5,
    moduleId: 2,
    moduleName: 'Module 2: Kỹ Năng Junior Penetration Tester (Web AppSec)',
    title: 'Bài 5: SQL Injection — Bypass đăng nhập & Trích xuất dữ liệu',
    subtitle: 'Khai thác lỗi nối chuỗi SQL f-string và áp dụng Prepared Statement phòng vệ triệt để',
    toolType: 'sandbox_sqli',
    theorySummary: [
      'Lỗ hổng xuất hiện khi dữ liệu người dùng nhập được nối trực tiếp vào câu lệnh SQL thay vì truyền qua tham số hóa.',
      'Cơ chế khai thác: Dấu nháy đơn (\') dùng để thoát khỏi chuỗi dữ liệu, dấu -- dùng để vô hiệu hóa phần kiểm tra mật khẩu phía sau.',
      'Phương pháp phòng thủ duy nhất đạt chuẩn: Sử dụng Prepared Statements (Parameterized Queries).',
    ],
    interviewQuestion: {
      question: 'Vì sao việc lọc ký tự đặc biệt (Blacklisting) như dấu nháy đơn không đủ an toàn để chống SQL Injection, và giải pháp triệt để là gì?',
      answer: 'Bộ lọc Blacklist luôn có thể bị vượt qua bằng các kỹ thuật mã hóa (Hex, URL encoding, Double URL encode) hoặc lỗi logic cú pháp. Giải pháp triệt để và duy nhất là Prepared Statements: cơ sở dữ liệu sẽ phân tích cú pháp câu lệnh trước, sau đó coi toàn bộ input người dùng là dữ liệu đơn thuần, không bao giờ thực thi nó thành lệnh.',
      interviewerTip: 'Nhấn mạnh nguyên tắc: "Phân tách rõ ràng giữa Mã lệnh (Code) và Dữ liệu (Data)".',
    },
    taskObjective: 'Chọn kịch bản SQLi, nạp payload "admin\' --" để bypass đăng nhập, sau đó bật chế độ Patched để xem cách Prepared Statement chặn đứng cuộc tấn công.',
    exitChallenge: {
      question: 'Đoạn mã Python nào sau đây phòng chống SQL Injection chuẩn mực nhất?',
      options: [
        { id: 'a', text: 'cursor.execute(f"SELECT * FROM users WHERE user = \'{username}\'")' },
        { id: 'b', text: 'cursor.execute("SELECT * FROM users WHERE user = " + username.replace("\'", ""))' },
        { id: 'c', text: 'cursor.execute("SELECT * FROM users WHERE user = ?", (username,))' },
        { id: 'd', text: 'cursor.execute("SELECT * FROM users WHERE user = \'" + username + "\'")' },
      ],
      correctOptionId: 'c',
      explanation: 'Sử dụng dấu giữ chỗ (?) và truyền tuple (username,) là cú pháp Parameterized Query an toàn tuyệt đối.',
    },
  },
  {
    id: 6,
    moduleId: 2,
    moduleName: 'Module 2: Kỹ Năng Junior Penetration Tester (Web AppSec)',
    title: 'Bài 6: OS Command Injection — Khai thác RCE trên công cụ Ping',
    subtitle: 'Chèn ký tự điều khiển shell (; , && , |) và khắc phục bằng subprocess array arguments',
    toolType: 'sandbox_rce',
    theorySummary: [
      'Xảy ra khi ứng dụng chuyển input của người dùng trực tiếp vào shell hệ thống thông qua các hàm như system(), popen(), shell=True.',
      'Kẻ tấn công có thể chèn dấu phân cách lệnh (; hoặc &&) để ép máy chủ chạy lệnh thứ hai như whoami hoặc cat /etc/passwd.',
      'Phòng ngự: Tắt shell=True, truyền tham số dưới dạng Array List và kiểm tra định dạng IP chặt chẽ bằng thư viện ipaddress.',
    ],
    interviewQuestion: {
      question: 'Phân biệt Command Injection và Remote Code Execution (RCE)? Cách phòng tránh Command Injection trong môi trường lập trình hiện đại?',
      answer: 'Command Injection là một dạng cụ thể của RCE, trong đó kẻ tấn công chèn lệnh trực tiếp vào shell của hệ điều hành máy chủ. Để phòng chống, lập trình viên không bao giờ được gọi trực tiếp shell hệ thống (như shell=True trong Python hay eval trong PHP); luôn truyền đối số dưới dạng mảng cố định và áp dụng Whitelisting xác thực đầu vào.',
      interviewerTip: 'Luôn đưa ra giải pháp "Avoid shell execution" thay vì chỉ nói "Lọc ký tự".',
    },
    taskObjective: 'Nhập payload "127.0.0.1; whoami" vào công cụ Ping chẩn đoán để đọc thông tin UID root, sau đó chuyển sang Patched Mode để xem cơ chế xác thực IP.',
    exitChallenge: {
      question: 'Trong Python, cấu hình nào giúp lệnh thực thi an toàn trước Command Injection?',
      options: [
        { id: 'a', text: 'subprocess.Popen(cmd, shell=True)' },
        { id: 'b', text: 'subprocess.run(["ping", "-c", "2", host], shell=False)' },
        { id: 'c', text: 'os.system("ping -c 2 " + host)' },
        { id: 'd', text: 'eval("ping " + host)' },
      ],
      correctOptionId: 'b',
      explanation: 'shell=False ngăn hệ điều hành khởi chạy shell thông dịch, còn mảng đối số cô lập biến host thành tham số đơn thuần.',
    },
  },
  {
    id: 7,
    moduleId: 2,
    moduleName: 'Module 2: Kỹ Năng Junior Penetration Tester (Web AppSec)',
    title: 'Bài 7: IDOR (Broken Access Control) — Đọc trộm hồ sơ bệnh án',
    subtitle: 'Khai thác tham số URL (?id=...) và triển khai kiểm soát truy cập cấp đối tượng (BOLA/Ownership Check)',
    toolType: 'sandbox_idor',
    theorySummary: [
      'IDOR (Insecure Direct Object Reference) là lỗ hổng thuộc nhóm A01:2021 - Broken Access Control trong bảng xếp hạng OWASP Top 10.',
      'Xuất hiện khi máy chủ nhận tham số định danh (như ?id=1002) mà không đối chiếu xem session hiện tại có quyền sở hữu bản ghi đó không.',
      'Hậu quả: Rò rỉ dữ liệu y tế, tài chính nhạy cảm hoặc sửa đổi hồ sơ người khác.',
    ],
    interviewQuestion: {
      question: 'IDOR là gì? Làm thế nào để ngăn chặn IDOR một cách có hệ thống trong ứng dụng RESTful API?',
      answer: 'IDOR xảy ra khi ứng dụng sử dụng trực tiếp định danh do người dùng cung cấp để truy vấn dữ liệu mà thiếu bước xác thực quyền sở hữu (Ownership Verification). Để ngăn chặn, mọi API endpoint phải lấy User ID từ JWT/Session đã xác thực ở backend và thêm điều kiện lọc: "WHERE resource_id = ? AND owner_id = current_user.id".',
      interviewerTip: 'Nhấn mạnh: "Không bao giờ tin tưởng ID gửi lên từ client".',
    },
    taskObjective: 'Thay đổi tham số ID từ 1001 sang 1002 hoặc 9999 (Giám đốc bệnh viện) để đọc bệnh án bí mật, sau đó bật Patched Mode để xem thông báo chặn 403 Forbidden.',
    exitChallenge: {
      question: 'Mã trạng thái HTTP nào là chuẩn mực nhất khi phát hiện một người dùng cố tình truy cập tài nguyên không thuộc quyền sở hữu của họ?',
      options: [
        { id: 'a', text: '200 OK' },
        { id: 'b', text: '401 Unauthorized' },
        { id: 'c', text: '403 Forbidden' },
        { id: 'd', text: '500 Internal Server Error' },
      ],
      correctOptionId: 'c',
      explanation: '403 Forbidden chỉ ra rằng máy chủ hiểu danh tính người dùng nhưng từ chối cấp quyền truy cập vào đối tượng yêu cầu.',
    },
  },
  {
    id: 8,
    moduleId: 2,
    moduleName: 'Module 2: Kỹ Năng Junior Penetration Tester (Web AppSec)',
    title: 'Bài 8: Cross-Site Scripting (XSS) — Đánh cắp Cookie & Session',
    subtitle: 'Chèn mã JavaScript độc hại vào trang web, đánh cắp document.cookie và cấu hình HttpOnly',
    toolType: 'sandbox_xss',
    theorySummary: [
      'Reflected XSS xảy ra khi dữ liệu người dùng gửi lên được máy chủ in thẳng ra giao diện HTML mà không mã hóa ký tự đặc biệt (<, >, ", \').',
      'Script độc hại chạy trong ngữ cảnh trình duyệt của nạn nhân và có thể đọc trộm Cookie phiên, gửi về máy chủ của tin tặc.',
      'Phòng ngự: HTML Entity Encoding, bật cờ Cookie HttpOnly (ngăn JavaScript đọc cookie) và Content Security Policy (CSP).',
    ],
    interviewQuestion: {
      question: 'Cờ HttpOnly trên Cookie hoạt động như thế nào để giảm thiểu thiệt hại từ cuộc tấn công XSS?',
      answer: 'Khi Cookie được gán cờ HttpOnly, trình duyệt sẽ nghiêm cấm mã JavaScript (document.cookie) truy cập vào giá trị cookie đó. Nếu website bị dính lỗ hổng XSS, kẻ tấn công dù chèn được script cũng không thể đánh cắp Cookie phiên để thực hiện Session Hijacking.',
      interviewerTip: 'Kết hợp giải thích thêm cờ Secure và SameSite để thể hiện kiến thức toàn diện.',
    },
    taskObjective: 'Nhập payload "<script>alert(document.cookie)</script>" vào ô tìm kiếm Helpdesk để xem popup đánh cắp phiên, sau đó chuyển sang Patched Mode.',
    exitChallenge: {
      question: 'Để ngăn chặn JavaScript đọc trộm Cookie xác thực phiên làm việc khi xảy ra lỗi XSS, lập trình viên cần thiết lập cờ nào?',
      options: [
        { id: 'a', text: 'SameSite=Lax' },
        { id: 'b', text: 'HttpOnly' },
        { id: 'c', text: 'Secure' },
        { id: 'd', text: 'Path=/' },
      ],
      correctOptionId: 'b',
      explanation: 'Cờ HttpOnly chỉ thị cho trình duyệt cô lập cookie khỏi các API phía client như document.cookie.',
    },
  },

  // MODULE 3: KỸ NĂNG JUNIOR SOC ANALYST (PHÒNG THỦ & ĐIỀU TRA SỐ)
  {
    id: 9,
    moduleId: 3,
    moduleName: 'Module 3: Kỹ Năng Junior SOC Analyst (Phòng Thủ & Điều Tra Số)',
    title: 'Bài 9: Phân tích Log Web Server — Nhận diện rà quét & tấn công',
    subtitle: 'Đọc cấu trúc Apache Common Log Format, phát hiện dấu vết Nikto Scanner và SQLi Injection',
    toolType: 'soc_log',
    theorySummary: [
      'Một dòng Apache Log chuẩn gồm: IP nguồn, Thời gian, Phương thức & Đường dẫn URI, Mã HTTP Status, Dung lượng byte trả về, User-Agent.',
      'Dấu hiệu rà quét: Một IP gửi hàng chục truy vấn liên tiếp trong vài giây với các đường dẫn nhạy cảm (/robots.txt, /admin.php, /.env).',
      'Dấu hiệu SQLi: Mã lỗi 500 kèm các từ khóa UNION, SELECT, OR 1=1 trong query string.',
    ],
    interviewQuestion: {
      question: 'Khi phân tích một file log Apache hàng triệu dòng, làm thế nào bạn tìm ra IP đang thực hiện tấn công dò quét một cách nhanh nhất?',
      answer: 'Tôi sử dụng các công cụ dòng lệnh Linux như grep, awk, sort, uniq: "awk \'{print $1}\' access.log | sort | uniq -c | sort -nr | head -n 10" để tìm các IP có tần suất gửi request cao bất thường; sau đó lọc theo mã lỗi 404 và User-Agent để phát hiện công cụ quét tự động.',
      interviewerTip: 'Thể hiện kỹ năng CLI thực chiến của một SOC Analyst.',
    },
    taskObjective: 'Quan sát danh sách 25 dòng Apache Access Log bên dưới, tìm địa chỉ IP 185.220.101.5 và xem User-Agent Nikto.',
    exitChallenge: {
      question: 'Khi thấy dòng log "GET /view?file=../../../../etc/passwd HTTP/1.1 400 310", đây là dấu hiệu của kỹ thuật tấn công nào?',
      options: [
        { id: 'a', text: 'Cross-Site Scripting (XSS)' },
        { id: 'b', text: 'Directory Traversal (Path Traversal)' },
        { id: 'c', text: 'DDoS Amplification' },
        { id: 'd', text: 'ARP Spoofing' },
      ],
      correctOptionId: 'b',
      explanation: 'Chuỗi ../../../../ là dấu hiệu kinh điển của Directory Traversal nhằm thoát khỏi thư mục web root để đọc file hệ thống.',
    },
  },
  {
    id: 10,
    moduleId: 3,
    moduleName: 'Module 3: Kỹ Năng Junior SOC Analyst (Phòng Thủ & Điều Tra Số)',
    title: 'Bài 10: Điều tra dấu vết sự cố & Phân tích chuỗi tấn công',
    subtitle: 'Xác định điểm thỏa hiệp (Point of Compromise) khi Web Shell trả về mã 200 OK và thực thi lệnh',
    toolType: 'soc_log',
    theorySummary: [
      'Trong điều tra sự cố, mã HTTP 200 OK trên các file script lạ trong thư mục /uploads/ là bằng chứng xác thực (Indicator of Compromise - IoC) nguy cấp nhất.',
      'Kẻ tấn công sau khi upload web shell sẽ thực hiện "Host Fingerprinting" bằng các lệnh: id, whoami, uname -a trước khi kết nối Reverse Shell.',
      'Hành động ứng phó khẩn cấp: Cách ly máy chủ (Isolate Host), chặn IP tại tường lửa, và thu hồi toàn bộ token phiên.',
    ],
    interviewQuestion: {
      question: 'Bạn nhận được cảnh báo nghi ngờ máy chủ bị cài Web Shell. Bạn sẽ điều tra và xử lý sự cố này theo quy trình nào?',
      answer: 'Tôi tuân thủ quy trình 6 bước của NIST: 1. Xác thực bằng chứng trong access log (tìm request 200 OK vào file php trong thư mục upload); 2. Cách ly máy chủ khỏi mạng để ngăn lây lan (Containment); 3. Lưu giữ bằng chứng bộ nhớ và file shell để điều tra forensics; 4. Xóa bỏ web shell và vá lỗ hổng upload (Eradication); 5. Khôi phục dịch vụ an toàn từ backup (Recovery); 6. Lập báo cáo sự cố (Post-Incident Review).',
      interviewerTip: 'Chuẩn quy trình NIST / SANS Incident Response là điều mọi giám đốc an ninh (CISO) tìm kiếm.',
    },
    taskObjective: 'Hoàn thành bài trắc nghiệm điều tra sự cố SOC ở khung bên phải để đạt 100 điểm phân tích.',
    exitChallenge: {
      question: 'Trong 25 dòng log máy chủ, dòng log nào xác nhận kẻ tấn công đã cài đặt và thực thi thành công Web Shell trên hệ thống?',
      options: [
        { id: 'a', text: 'GET /robots.txt 200' },
        { id: 'b', text: 'POST /portal/upload.php 302' },
        { id: 'c', text: 'GET /uploads/shell.php?cmd=id 200' },
        { id: 'd', text: 'GET /view?file=../../../../etc/passwd 400' },
      ],
      correctOptionId: 'c',
      explanation: 'Mã 200 trả về kèm tham số cmd=id trên file shell.php là bằng chứng kẻ tấn công đang thực thi lệnh shell trực tiếp.',
    },
  },
  {
    id: 11,
    moduleId: 3,
    moduleName: 'Module 3: Kỹ Năng Junior SOC Analyst (Phòng Thủ & Điều Tra Số)',
    title: 'Bài 11: Soạn thảo báo cáo kỹ thuật 3 phần (Feynman Writeup)',
    subtitle: 'Kỹ năng trình bày nguyên nhân cốt lõi (Root Cause), chuỗi khai thác (Exploit Chain) và giải pháp (Remediation)',
    toolType: 'writeup',
    theorySummary: [
      'Báo cáo kỹ thuật (Writeup) là sản phẩm quan trọng nhất của Pentester và Security Engineer đối với khách hàng và cấp quản lý.',
      'Cấu trúc chuẩn 3 phần: Phần 1 - Root Cause (Nguyên nhân mã nguồn), Phần 2 - Exploit Chain (Chuỗi hành động tái hiện), Phần 3 - Remediation (Giải pháp phòng vệ).',
      'Kỹ thuật Feynman: Giải thích rõ ràng, súc tích, mạch lạc để cả lập trình viên và giám đốc kỹ thuật đều nắm bắt được mức độ rủi ro.',
    ],
    interviewQuestion: {
      question: 'Tại sao phần Remediation trong báo cáo bảo mật lại quan trọng hơn cả việc tìm ra lỗ hổng?',
      answer: 'Mục đích cuối cùng của kiểm thử xâm nhập không phải là tấn công, mà là giúp tổ chức nâng cao mức độ an toàn. Nếu Pentester chỉ tìm ra lỗ hổng mà không đưa ra giải pháp khắc phục cụ thể, khả thi và phù hợp với kiến trúc hệ thống, rủi ro bảo mật vẫn tồn tại nguyên vẹn.',
      interviewerTip: 'Nhà tuyển dụng đánh giá rất cao thái độ bảo vệ tổ chức thay vì tính hiếu thắng của "hacker".',
    },
    taskObjective: 'Chọn một mẫu báo cáo (SQLi, RCE hoặc PrivEsc) trong Writeup Studio bên dưới và nhấn "Sao Chép Markdown".',
    exitChallenge: {
      question: 'Thành phần nào KHÔNG THỂ THIẾU trong một báo cáo phát hiện lỗ hổng bảo mật chuyên nghiệp?',
      options: [
        { id: 'a', text: 'Chỉ trích lập trình viên viết code kém' },
        { id: 'b', text: 'Root Cause, Các bước tái hiện (PoC) và Biện pháp khắc phục (Remediation)' },
        { id: 'c', text: 'Thông tin cá nhân của quản trị viên hệ thống' },
        { id: 'd', text: 'Mã nguồn toàn bộ dự án của khách hàng' },
      ],
      correctOptionId: 'b',
      explanation: 'Root Cause, PoC tái hiện và Hướng dẫn khắc phục cụ thể là 3 trụ cột bắt buộc của mọi báo cáo pentest chuẩn mực.',
    },
  },

  // MODULE 4: ĐỒ ÁN TỐT NGHIỆP & DỰ TUYỂN VIỆC LÀM (CAPSTONE)
  {
    id: 12,
    moduleId: 4,
    moduleName: 'Module 4: Đồ Án Tốt Nghiệp & Dự Tuyển Việc Làm (Capstone)',
    title: 'Bài 12: Đồ án tổng hợp Boot-to-Root Machine & Hoàn thiện Hồ Sơ Tuyển Dụng',
    subtitle: 'Tổng hợp chuỗi kỹ năng: Trinh sát mạng ➔ Khai thác RCE ➔ Leo quyền root ➔ Đạt chuẩn tốt nghiệp',
    toolType: 'capstone',
    theorySummary: [
      'Đồ án Boot-to-Root kiểm tra năng lực toàn diện của một ứng viên: từ mạng (Nmap), ứng dụng web, đến phân quyền nhân hệ điều hành Linux.',
      'Học viên hoàn thành bài học này sẽ được cấp chứng chỉ "CyberSec Practical Security Engineer" có mã xác thực Hash.',
      'Sẵn sàng đính kèm Hồ sơ năng lực (Portfolio of 5 Verified Writeups) và Radar Chart vào CV gửi các nhà tuyển dụng công nghệ.',
    ],
    interviewQuestion: {
      question: 'Bạn hãy tóm tắt một dự án hoặc cỗ máy Boot-to-Root phức tạp nhất mà bạn từng giải quyết từ đầu đến cuối?',
      answer: 'Trong chương trình đào tạo CyberSec Studio, tôi đã thực hiện bài lab tổng hợp: Bắt đầu từ trinh sát cổng dịch vụ Apache/SSH bằng Nmap; phát hiện lỗ hổng OS Command Injection trên tham số ping để lấy low-privilege shell www-data; sau đó kiểm toán sudoers phát hiện quyền find NOPASSWD và leo lên quyền root cao nhất; cuối cùng thu hồi bằng chứng và viết báo cáo khắc phục.',
      interviewerTip: 'Đây là câu hỏi kinh điển trong mọi buổi phỏng vấn vị trí Junior Pentester / Security Engineer.',
    },
    taskObjective: 'Xác nhận toàn bộ năng lực đã học, mở khóa nút Tốt nghiệp để nhận Chứng chỉ và xuất trọn bộ hồ sơ xin việc.',
    exitChallenge: {
      question: 'Theo nguyên tắc phòng thủ chiều sâu (Defense-in-Depth), biện pháp nào dưới đây bảo vệ hệ thống trước cả Web Attack và Privilege Escalation?',
      options: [
        { id: 'a', text: 'Chỉ cần cài một phần mềm diệt virus trên máy tính' },
        { id: 'b', text: 'Chạy web app dưới quyền người dùng đặc quyền tối thiểu (Least Privilege), phân đoạn mạng và cập nhật bản vá thường xuyên' },
        { id: 'c', text: 'Giấu cổng dịch vụ SSH sang cổng khác và không cần mật khẩu' },
        { id: 'd', text: 'Tắt toàn bộ file nhật ký access.log để tăng tốc độ máy chủ' },
      ],
      correctOptionId: 'b',
      explanation: 'Nguyên tắc Least Privilege đảm bảo ngay cả khi web app bị dính RCE, kẻ tấn công cũng không thể dễ dàng leo quyền hoặc truy cập tài nguyên nhạy cảm.',
    },
  },
];
