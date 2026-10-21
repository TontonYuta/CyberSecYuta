import { RoadmapMilestone } from '../types';

export const ROADMAP_MILESTONES: RoadmapMilestone[] = [
  {
    id: 'phase-1',
    phase: 'Giai đoạn 1',
    weeks: 'Tuần 1 - 2',
    title: 'Nền Tảng Mạng Máy Tính & Phân Tích Gói Tin (Networking & Packet Analysis)',
    summary: 'Nắm vững mô hình OSI, TCP/IP stack, bắt và mổ xẻ gói tin bằng Wireshark và tcpdump.',
    skills: [
      { id: 'p1-1', name: 'Mô hình OSI & TCP/IP 4 tầng', completed: true, description: 'Phân định rõ ràng nhiệm vụ từ tầng Physical đến Application' },
      { id: 'p1-2', name: 'TCP 3-Way Handshake & Flag bit', completed: true, description: 'Cơ chế SYN, SYN-ACK, ACK, FIN, RST và cách tính Seq/Ack number' },
      { id: 'p1-3', name: 'Giao thức DNS, ARP, DHCP', completed: false, description: 'Phân giải tên miền, ARP cache poisoning và phân bổ IP subnet' },
      { id: 'p1-4', name: 'Wireshark Display Filters', completed: false, description: 'Lọc tcp.flags.syn==1, http.request.method=="POST", ip.addr==' },
    ],
    labRecommendations: ['Lab Wireshark TCP Stream Reassembly', 'Tấn công ARP Spoofing mô phỏng', 'Phân tích mã hóa TLS 1.3 ClientHello'],
  },
  {
    id: 'phase-2',
    phase: 'Giai đoạn 2',
    weeks: 'Tuần 3 - 4',
    title: 'Linux Internals, Bash Scripting & Leo Quyền SUID (Privilege Escalation)',
    summary: 'Quản trị dòng lệnh Linux, cơ chế phân quyền Unix (rwx), SUID bit và khai thác GTFOBins.',
    skills: [
      { id: 'p2-1', name: 'Linux File Permissions & Inodes', completed: true, description: 'Chmod, chown, sticky bit và cấu trúc /etc/passwd, /etc/shadow' },
      { id: 'p2-2', name: 'Bash Scripting cho Pentester', completed: false, description: 'Viết công cụ quét port tự động và parse log regex' },
      { id: 'p2-3', name: 'Leo thang đặc quyền SUID / Sudo', completed: false, description: 'Khai thác sudo -l (NOPASSWD) và GTFOBins (find, vim, base64)' },
      { id: 'p2-4', name: 'LinPEAS & Công cụ tự động Enumeration', completed: false, description: 'Đọc và phân loại phát hiện từ script tự động thu thập thông tin' },
    ],
    labRecommendations: ['Hacker Terminal CTF Room', 'Khai thác Linux Wildcard Injection', 'Cron Job Hijacking'],
  },
  {
    id: 'phase-3',
    phase: 'Giai đoạn 3',
    weeks: 'Tuần 5 - 7',
    title: 'Bảo Mật Ứng Dụng Web & OWASP Top 10 (Web App Security)',
    summary: 'Thực hành các kỹ thuật tấn công và phòng thủ web hiện đại: SQLi, XSS, IDOR, SSRF, Command Injection.',
    skills: [
      { id: 'p3-1', name: 'SQL Injection (Auth Bypass, UNION, Blind)', completed: true, description: 'Vượt qua xác thực và dump database bằng Prepared Statements' },
      { id: 'p3-2', name: 'OS Command Injection (RCE)', completed: true, description: 'Chèn ký tự phân cách lệnh và khắc phục bằng Whitelist & subprocess' },
      { id: 'p3-3', name: 'Broken Access Control & IDOR', completed: false, description: 'Kiểm soát truy cập cấp đối tượng (BOLA) và xác thực quyền sở hữu' },
      { id: 'p3-4', name: 'Cross-Site Scripting (Stored & Reflected)', completed: false, description: 'Contextual Output Encoding và Content Security Policy (CSP)' },
      { id: 'p3-5', name: 'CSRF & Session Hijacking', completed: false, description: 'Anti-CSRF Tokens, cờ SameSite, HttpOnly và Secure flags' },
    ],
    labRecommendations: ['Exploit Sandbox ACME Portal', 'PortSwigger Web Security Academy Labs', 'Xây dựng Secure Input Validator'],
  },
  {
    id: 'phase-4',
    phase: 'Giai đoạn 4',
    weeks: 'Tuần 8 - 9',
    title: 'Penetration Testing, Trinh Sát Mạng & Quản Lý Lỗ Hổng (Network Pentest)',
    summary: 'Sử dụng Nmap, Metasploit, Burp Suite và các kỹ thuật reconnaissance hiện đại.',
    skills: [
      { id: 'p4-1', name: 'Nmap Scanning Techniques (-sS, -sV, -sC)', completed: false, description: 'Quét cổng tàng hình, dò phiên bản dịch vụ và NSE scripts' },
      { id: 'p4-2', name: 'Burp Suite Professional Workflow', completed: false, description: 'Repeater, Intruder, Match & Replace, Extension BApps' },
      { id: 'p4-3', name: 'Active Directory Fundamentals', completed: false, description: 'Kerberoasting, AS-REP Roasting, BloodHound mapping' },
      { id: 'p4-4', name: 'Quản lý lỗ hổng (Vulnerability Assessment)', completed: false, description: 'Sử dụng Nessus / OpenVAS và chấm điểm CVSS v3.1' },
    ],
    labRecommendations: ['TryHackMe Jr Penetration Tester Path', 'HackTheBox Starting Point Machines', 'AD Attack Emulation'],
  },
  {
    id: 'phase-5',
    phase: 'Giai đoạn 5',
    weeks: 'Tuần 10 - 11',
    title: 'SOC Operations, Phân Tích Sự Cố & Threat Hunting (Blue Team Defense)',
    summary: 'Triển khai SIEM, phân tích cảnh báo EDR, viết luật Sigma/Suricata và phản ứng sự cố.',
    skills: [
      { id: 'p5-1', name: 'SIEM Log Triage & Correlation', completed: false, description: 'Phân tích nhật ký WAF, Auth, Nginx, Snort IDS và EDR' },
      { id: 'p5-2', name: 'Khung MITRE ATT&CK Matrix', completed: false, description: 'Ánh xạ hành vi kẻ tấn công từ Initial Access đến Exfiltration' },
      { id: 'p5-3', name: 'Kỹ năng Phản ứng Sự cố (Incident Response)', completed: false, description: 'Quy trình 6 bước NIST: Cô lập máy chủ, chặn IP, bảo toàn bằng chứng' },
      { id: 'p5-4', name: 'Viết luật phát hiện (Sigma & Yara Rules)', completed: false, description: 'Định nghĩa chữ ký phát hiện hành vi bất thường' },
    ],
    labRecommendations: ['SOC Log Matrix Triage Arena', 'Phân tích mã độc cơ bản trên Any.Run', 'Điều tra dấu vết tấn công Ransomware'],
  },
  {
    id: 'phase-6',
    phase: 'Giai đoạn 6',
    weeks: 'Tuần 12',
    title: 'Kiến Trúc An Ninh Zero Trust & Luyện Thi Chứng Chỉ (Security Engineering)',
    summary: 'Thiết kế kiến trúc phòng thủ chiều sâu (Defense-in-Depth), DevSecOps CI/CD và báo cáo CTF.',
    skills: [
      { id: 'p6-1', name: 'Nguyên lý Zero Trust (Never Trust, Always Verify)', completed: false, description: 'Micro-segmentation, Identity-first security, Least Privilege' },
      { id: 'p6-2', name: 'DevSecOps & SAST/DAST CI/CD Pipeline', completed: false, description: 'Tích hợp Semgrep, Trivy, SonarQube vào quy trình deploy' },
      { id: 'p6-3', name: 'Kỹ năng viết Báo cáo Đánh giá Lỗ hổng (Writeup)', completed: false, description: 'Feynman Technique: Giải thích kỹ thuật rõ ràng cho Ban Giám đốc' },
      { id: 'p6-4', name: 'Lộ trình chứng chỉ (CompTIA Security+, OSCP, CEH)', completed: false, description: 'Ôn luyện bộ câu hỏi kịch bản thực tế' },
    ],
    labRecommendations: ['Feynman Technique Writeup Builder', 'Mock Executive Security Briefing', 'Xây dựng Portfolio Security Engineer'],
  },
];

export interface FeynmanTopic {
  id: string;
  name: string;
  category: string;
  question: string;
  mustIncludeTerms: string[];
  sampleGoodExplanation: string;
}

export const FEYNMAN_TOPICS: FeynmanTopic[] = [
  {
    id: 'sqli',
    name: 'SQL Injection (SQLi)',
    category: 'Web Security',
    question: 'Hãy giải thích SQL Injection cho một lập trình viên mới vào nghề: Nó xảy ra như thế nào và tại sao Prepared Statement giải quyết triệt để?',
    mustIncludeTerms: ['câu lệnh', 'tham số', 'nối chuỗi', 'prepared statement', 'dữ liệu'],
    sampleGoodExplanation: 'SQL Injection xảy ra khi ta trộn lẫn mã lệnh SQL với dữ liệu đầu vào của người dùng bằng cách nối chuỗi trực tiếp. Giống như việc nhận một tờ đơn khai báo họ tên nhưng người khai lại viết thêm lệnh hủy đơn vào đó. Để phòng vệ, ta dùng Prepared Statement: cơ sở dữ liệu sẽ dịch cú pháp câu lệnh trước thành khuôn mẫu cố định, sau đó mới điền dữ liệu người dùng vào như những tham số cô lập, loại bỏ hoàn toàn khả năng dữ liệu bị hiểu nhầm thành câu lệnh.',
  },
  {
    id: 'xss',
    name: 'Cross-Site Scripting (XSS)',
    category: 'Web Security',
    question: 'Giải thích cơ chế XSS và vì sao cờ HttpOnly trên Cookie lại quan trọng?',
    mustIncludeTerms: ['javascript', 'trình duyệt', 'httponly', 'cookie', 'mã hóa'],
    sampleGoodExplanation: 'XSS là khi kẻ tấn công lừa trình duyệt của nạn nhân chạy một đoạn mã JavaScript do hắn cài cắm vào trang web. Vì trình duyệt tin tưởng mã đến từ website đó, script độc hại có thể đọc trộm cookie đăng nhập hoặc mạo danh người dùng. Khi ta bật cờ HttpOnly cho Cookie, trình duyệt sẽ nghiêm cấm JavaScript truy cập biến document.cookie, ngăn chặn hoàn toàn nguy cơ kẻ tấn công đánh cắp phiên làm việc qua XSS.',
  },
  {
    id: 'idor',
    name: 'IDOR (Broken Access Control)',
    category: 'Access Control',
    question: 'IDOR là gì? Vì sao việc chỉ dùng số thứ tự ID đơn giản trên URL lại tiềm ẩn hiểm họa lớn?',
    mustIncludeTerms: ['tham số', 'quyền', 'xác thực', 'session', 'kiểm tra'],
    sampleGoodExplanation: 'IDOR (Insecure Direct Object Reference) xảy ra khi ứng dụng sử dụng trực tiếp một định danh như số thứ tự bản ghi trên URL (ví dụ ?id=1002) mà ở phía máy chủ lại không kiểm tra xem người dùng hiện tại có quyền sở hữu dữ liệu đó hay không. Bất kỳ ai chỉ cần thay đổi số ID là có thể đọc trộm thông tin của người khác. Cách khắc phục là luôn xác minh quyền sở hữu ở backend dựa trên thông tin phiên (session/token) của người dùng đã xác thực.',
  },
  {
    id: 'zero_trust',
    name: 'Kiến Trúc Zero Trust',
    category: 'Security Architecture',
    question: 'Triết lý cốt lõi của Zero Trust là gì? So sánh nó với mô hình bảo mật truyền thống hình pháo đài (Perimeter Defense)?',
    mustIncludeTerms: ['xác thực', 'đặc quyền tối thiểu', 'mạng nội bộ', 'tin tưởng', 'liên tục'],
    sampleGoodExplanation: 'Mô hình pháo đài truyền thống cho rằng bất kỳ thiết bị nào đã lọt vào mạng nội bộ đều an toàn và đáng tin cậy. Zero Trust đảo ngược hoàn toàn điều đó với phương châm "Never Trust, Always Verify" (Không bao giờ tin tưởng, luôn luôn xác thực). Mọi yêu cầu truy cập, dù xuất phát từ bên trong hay ngoài công ty, đều phải được xác thực danh tính liên tục, mã hóa đường truyền và chỉ được cấp đặc quyền tối thiểu (Least Privilege) vừa đủ để làm việc.',
  },
];
