import { CurriculumLesson } from './types';

export const lesson08: CurriculumLesson = {
  id: 8,
  moduleId: 2,
  moduleName: 'Module 2: Kỹ Năng Junior Penetration Tester (Web AppSec)',
  title: 'Bài 8: Command Injection (RCE) - Vượt bộ lọc Shell Metacharacters',
  subtitle: 'Lỗ hổng thực thi mã từ xa nguy hiểm nhất (CVSS 10.0) qua các ký tự nối lệnh shell: ;, &&, ||, $(...)',
  toolType: 'sandbox_rce',
  theory: {
    summary: [
      'Command Injection xảy ra khi ứng dụng chuyển tiếp chuỗi dữ liệu người dùng vào hàm thực thi lệnh của hệ điều hành (như exec(), system(), popen(), child_process.exec()) mà không qua kiểm tra hoặc tham số hóa.',
      'Các ký tự nối lệnh Shell Metacharacters nguy hiểm: ; (ngắt lệnh), && (lệnh kế tiếp nếu lệnh trước thành công), || (lệnh kế tiếp nếu trước đó lỗi), | (pipe), `...` hoặc $(...) (thực thi subshell lồng).',
      'Phòng thủ chuẩn mực: Tránh hoàn toàn việc gọi system shell. Sử dụng các hàm API an toàn có danh sách đối số tách biệt (như child_process.execFile hoặc spawn không có cờ shell: true) kết hợp danh sách trắng nghiêm ngặt.',
    ],
    plainExplanation:
      'Tưởng tượng trang web có tính năng "Kiểm tra mạng bằng lệnh Ping IP". Thay vì chỉ gõ "8.8.8.8", kẻ tấn công gõ: "8.8.8.8 ; cat /etc/shadow". Nếu máy chủ ngây thơ đem nguyên chuỗi này ném vào cửa sổ dòng lệnh Linux, hệ thống sẽ vừa ping xong là lập tức chạy tiếp lệnh đọc mật khẩu hệ thống của bạn.',
    keyTakeaway: 'Tuyệt đối không truyền chuỗi người dùng vào môi trường shell (tránh xa exec() và shell: true).',
  },
  example: {
    title: 'Ví dụ: Tính năng Ping IP gọi hàm child_process.exec() không an toàn',
    vulnerableCode: `// Lập trình viên gọi hàm exec() nối chuỗi trực tiếp:
const { exec } = require('child_process');
app.post('/api/ping', (req, res) => {
  const ip = req.body.ip; // Ví dụ: 8.8.8.8 ; whoami
  exec('ping -c 2 ' + ip, (err, stdout) => {
    res.send(stdout);
  });
});`,
    vulnerableExplanation:
      'Dấu chấm phẩy (;) cho phép ngắt lệnh ping và thực thi bất kỳ lệnh Linux nào theo sau với quyền của tiến trình web server (www-data).',
    secureCode: `// Sử dụng execFile hoặc spawn với mảng tham số cố định, không khởi động shell:
const { execFile } = require('child_process');
const net = require('net');

app.post('/api/ping', (req, res) => {
  const ip = req.body.ip;
  // 1. Kiểm tra tính hợp lệ bằng Regex IP chuẩn:
  if (!net.isIP(ip)) {
    return res.status(400).send('Địa chỉ IP không hợp lệ!');
  }
  // 2. Truyền tham số dưới dạng mảng (không qua /bin/sh):
  execFile('ping', ['-c', '2', ip], (err, stdout) => {
    res.send(stdout);
  });
});`,
    secureExplanation:
      'Hàm execFile gọi trực tiếp tệp nhị phân /bin/ping mà không qua shell trung gian (/bin/sh). Ký tự chấm phẩy hay dấu gạch nối sẽ chỉ được coi là đối số tên máy chủ lỗi của lệnh ping.',
  },
  practice: {
    objective: 'Trong Sandbox Thực Hành, chuyển sang kịch bản Command Injection (RCE), nối lệnh bằng ký tự "127.0.0.1; whoami" hoặc "127.0.0.1; cat /etc/passwd" để thực thi mã tùy ý.',
    steps: [
      'Bước 1: Chuyển sang tab Bàn Thực Hành (Sandbox).',
      'Bước 2: Chọn kịch bản "Command Injection (RCE)".',
      'Bước 3: Nhập vào ô Ping IP: "127.0.0.1; whoami".',
      'Bước 4: Nhấn nút "Thực Thi Lệnh Ping" và quan sát kết quả trả về lệnh whoami chạy trực tiếp trên máy chủ.',
      'Bước 5: Chuyển sang chế độ "Đã Vá An Toàn" để xem hệ thống chặn đứng ký tự nối lệnh.',
    ],
    hint: 'Bạn có thể thử các ký tự khác như "127.0.0.1 && id" hoặc "127.0.0.1 | uname -a".',
  },
  ctf: {
    scenario: 'Máy chủ quản trị mạng có tính năng Ping chẩn đoán đường truyền. Hãy chèn lệnh shell để tìm cờ bí mật được lưu trong biến môi trường FLAG_RCE của hệ thống.',
    flag: 'FLAG{rce_command_injection_shell_bypass_pwned}',
    hint: 'Nhập payload: 127.0.0.1; echo $FLAG_RCE hoặc xem kết quả trong Sandbox RCE.',
    secretReward: 'Tuyệt đỉnh! Bạn đã chinh phục lỗ hổng nguy hiểm nhất trong bảng xếp hạng an ninh phần mềm toàn cầu.',
  },
  interview: {
    question: 'Hãy phân biệt sự khác nhau căn bản giữa exec() và execFile()/spawn() trong môi trường Node.js dưới góc độ an toàn thông tin?',
    answer:
      'Hàm exec() mặc định sẽ khởi tạo một tiến trình shell hệ thống (/bin/sh trên Unix, cmd.exe trên Windows) và truyền toàn bộ chuỗi lệnh vào đó để phân tích cú pháp; điều này làm nảy sinh nguy cơ Command Injection nếu chuỗi lệnh chứa shell metacharacters (; && || ` $). Ngược lại, execFile() hoặc spawn() mặc định gọi trực tiếp tệp nhị phân thực thi mà không spawn shell trung gian, và truyền các tham số dưới dạng một mảng (array of arguments), biến mọi ký tự đặc biệt thành đối số dữ liệu văn bản thuần túy, loại bỏ hoàn toàn khả năng chèn thêm lệnh ngoài.',
    interviewerTip: 'Nhớ nhắc tới việc spawn có cờ { shell: true } cũng sẽ tái tạo lại lỗ hổng y hệt như exec.',
  },
  exitChallenge: {
    question: 'Ký tự nào sau đây thường được tin tặc sử dụng phổ biến nhất để ngắt câu lệnh ban đầu và nối thêm một câu lệnh thứ hai trong cuộc tấn công Command Injection trên Linux?',
    options: [
      { id: 'a', text: 'Dấu chấm phẩy (;) hoặc hai dấu và (&&)' },
      { id: 'b', text: 'Dấu thăng (#)' },
      { id: 'c', text: 'Dấu hoa thị (*)' },
      { id: 'd', text: 'Dấu gạch dưới (_)' },
    ],
    correctOptionId: 'a',
    explanation: 'Dấu chấm phẩy (;) dùng để phân tách hai lệnh thực thi tuần tự, còn (&&) thực thi lệnh kế tiếp khi lệnh đầu tiên kết thúc thành công trong Bash.',
  },

  // Backward compatibility
  theorySummary: [
    'Command Injection xảy ra khi dữ liệu người dùng được truyền vào shell hệ thống.',
    'Các ký tự nối lệnh nguy hiểm: ;, &&, ||, |, $(...).',
    'Phòng thủ chuẩn mực: Sử dụng execFile/spawn với danh sách đối số mảng, không dùng shell.',
  ],
  taskObjective: 'Trong Sandbox RCE, nhập payload "127.0.0.1; whoami" để thực thi mã tùy ý và xem chế độ đã vá.',
  interviewQuestion: {
    question: 'Phân biệt exec() và execFile() trong Node.js dưới góc độ an toàn thông tin?',
    answer: 'exec() luôn spawn một shell hệ thống nên dính Command Injection khi nối chuỗi. execFile() gọi thẳng binary bằng mảng tham số nên an toàn.',
    interviewerTip: 'Cảnh báo về cờ { shell: true } trong spawn.',
  },
};
