# 🛡️ CyberSecYuta — Hands-on Cybersecurity Academy & Visual Lab

<div align="center">

[![React 19](https://img.shields.io/badge/React-19-blue.svg?logo=react)](https://react.dev/)
[![Vite 6](https://img.shields.io/badge/Vite-6-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![TailwindCSS 4](https://img.shields.io/badge/TailwindCSS-v4-06B6D4.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black.svg?logo=vercel)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

**Nền tảng học tập an ninh mạng trực quan, tương tác cao với lộ trình 12 bài thực chiến chuẩn nghề, tích hợp Exploit Sandbox, Hacker Terminal GTFOBins, Wireshark Packet Inspector, SOC Log Matrix và Cấp chứng chỉ Portfolio.**

[Trải nghiệm Trực Tuyến](#-triển-khai-nhanh-với-vercel) • [Lộ Trình 12 Bài Học](#-lộ-trình-12-bài-học-tuyến-tính) • [Công Cụ Thực Hành](#-hệ-thống-công-cụ-thực-hành) • [Cài Đặt Cục Bộ](#-cài-đặt--chạy-cục-bộ)

</div>

---

## 🌟 Tổng Quan Dự Án

**CyberSecYuta** là một học viện và phòng lab thực hành an ninh mạng độc lập, chạy 100% trên nền tảng web hiện đại. Ứng dụng giải quyết triệt để rào cản cài đặt môi trường phức tạp (không cần máy ảo Kali Linux nặng nề hay thiết lập Docker cồng kềnh) bằng cách mô phỏng trực quan các môi trường khai thác và phòng thủ thực tế.

### 🎯 2 Chế Độ Trải Nghiệm Linh Hoạt
1. **Học Viện Tuyến Tính (Linear Academy)**: Hệ thống 12 bài học tuần tự từ căn bản đến nâng cao. Mỗi bài gồm 3 bước:
   - **Bước 1:** Lý thuyết tinh gọn 3 phút & Câu hỏi phỏng vấn tuyển dụng thực tế.
   - **Bước 2:** Bàn thực hành tương tác trực tiếp (Sandbox, Terminal, Wireshark, SOC Matrix).
   - **Bước 3:** Exit Challenge (Cổng trắc nghiệm bản chất để mở khóa bài tiếp theo).
2. **Chế Độ Tự Do (Sandbox Mode)**: Tự do truy cập toàn bộ 5 phân hệ công cụ để kiểm thử payload, bắt gói tin, leo thang đặc quyền và viết báo cáo pentest.

---

## 🧭 Lộ Trình 12 Bài Học Tuyến Tính

| Module | Bài | Tên Bài Học & Mục Tiêu Kỹ Thuật | Công Cụ Lab |
| :--- | :---: | :--- | :--- |
| **M1: Nền Tảng & Hệ Thống** | 01 | Nhập môn Dòng lệnh Linux & Thao tác File | `Terminal CLI` |
| | 02 | Đặc quyền File, SUID Bit & GTFOBins Leo Quyền Root | `Terminal CLI` |
| | 03 | Mô hình OSI & Bắt tay 3 bước TCP Handshake | `Wireshark Inspector` |
| **M2: Khai Thác Lỗ Hổng Web** | 04 | SQL Injection: Vượt qua xác thực (Auth Bypass) | `Exploit Sandbox` |
| | 05 | SQL Injection: Trích xuất dữ liệu qua UNION Attack | `Exploit Sandbox` |
| | 06 | Command Injection (RCE): Thực thi lệnh OS từ xa | `Exploit Sandbox` |
| | 07 | IDOR: Đọc trộm hồ sơ bệnh án qua Broken Object Level Auth | `Exploit Sandbox` |
| | 08 | XSS Phản xạ: Đánh cắp Cookie & Thực thi Script trình duyệt | `Exploit Sandbox` |
| **M3: Phòng Thủ & Giám Sát SOC**| 09 | Phân tích Nhật ký Truy cập Web (Apache Access Logs) | `SOC Log Matrix` |
| | 10 | Điều tra Sự cố & Ánh xạ Chiến thuật MITRE ATT&CK | `SOC Log Matrix` |
| **M4: Báo Cáo & Chuẩn Nghề** | 11 | Kỹ thuật Viết Báo Cáo Lỗ Hổng Chuẩn Quốc Tế | `Writeup Studio` |
| | 12 | Tổng Kết Toàn Diện & Xuất Hồ Sơ Portfolio Tuyển Dụng | `Graduation Hub` |

---

## 🛠️ Hệ Thống Công Cụ Thực Hành

### 1. ⚡ Exploit Sandbox (OWASP Top 10)
- **Chế độ kép Vulnerable vs Patched**: Chuyển đổi trực tiếp giữa mã nguồn có lỗ hổng (dùng chuỗi nối `f-string`, `shell=True`, in thô `<%- %>`) và mã nguồn đã vá an toàn (`Prepared Statements`, `shell=False`, HTML entity encoding).
- **Mô phỏng trình duyệt web**: Thanh URL Omnibox tương tác, nạp payload mẫu chỉ với 1 click.
- **Phát hiện cờ CTF**: Tự động mở khóa flag khi khai thác thành công.

### 2. 💻 Hacker Terminal & GTFOBins Simulator
- Giả lập terminal Linux xterm chân thực với màu nền đen sâu, font **JetBrains Mono** và con trỏ nhấp nháy xanh.
- Hỗ trợ đầy đủ lệnh: `sudo -l`, `whoami`, `id`, `ls`, `cat /etc/passwd`, `nmap`, `clear`.
- Mô phỏng kỹ thuật leo quyền qua `sudo find . -exec /bin/sh \;` để nâng đặc quyền từ `www-data (UID=33)` lên `root (EUID=0)`.

### 3. 🦈 Wireshark Packet Inspector
- **Trực quan hóa bắt tay 3 bước TCP**: Hoạt họa đồ họa luồng gói tin giữa Client và Server (SYN $\to$ SYN-ACK $\to$ ACK) kèm Sequence/Ack numbers.
- **Bảng gói tin Wireshark**: Lọc gói theo cú pháp thực tế (`tcp.port == 80`, `http`, `attack`).
- **Phân tách 5 tầng gói tin (OSI layers)** & Trình giải mã nhị phân **Hex Dump**.
- **Follow TCP Stream**: Tái hiện toàn bộ nội dung cuộc hội thoại HTTP.

### 4. 🛡️ SOC Log Matrix
- Giám sát luồng nhật ký máy chủ Apache CLF (Common Log Format) với 25 bản ghi thực tế.
- Đấu trường câu hỏi phân tích sự cố (Triage Quiz) rèn luyện tư duy nhận diện dấu vết IP tấn công, quét lỗ hổng Nikto, và payload SQLi.

### 5. 🗺️ 90-Day Roadmap & Feynman Writeup Studio
- Bản đồ kỹ năng 4 giai đoạn chuẩn bị cho các chứng chỉ CompTIA Security+, CEH, eJPT và OSCP.
- Trình tạo báo cáo kiểm thử xâm nhập 3 phần (Nguyên nhân cốt lõi $\to$ Chuỗi khai thác $\to$ Khắc phục).
- Xuất báo cáo trực tiếp ra định dạng **Markdown (.md)** đính kèm hồ sơ xin việc.

### 6. 🎓 Verified Credential & Radar Chart
- Chứng chỉ tốt nghiệp chuẩn hóa kèm **Mã xác thực Credential** và ngày cấp.
- Biểu đồ mạng nhện SVG (Radar Chart) đánh giá 4 trụ cột năng lực.

---

## 📱 Thiết Kế UX/UI & Tối Ưu Mobile (Responsive)

- **100% Mobile Ready**: Tự động kích hoạt thanh điều hướng phụ thông minh dạng segmented pill trên điện thoại và máy tính bảng.
- **Không tràn màn hình (Zero Horizontal Overflow)**: Bảng dữ liệu tự động cho phép cuộn ngang mượt mà.
- **Web Audio API**: Tích hợp âm thanh phản hồi xúc giác (click, keypress, exploit success, error tone) hoàn toàn tự sinh qua Web Audio API không tốn băng thông tải file âm thanh.
- **Khả năng chọn văn bản (Text Selection)**: Tối ưu hóa để sinh viên có thể tự do bôi đen, sao chép câu lệnh, mã hash và payload.

---

## 💻 Cài Đặt & Chạy Cục Bộ

### Yêu Cầu Tiên Quyết
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### Các Bước Thực Hiện

```bash
# 1. Clone repository về máy
git clone https://github.com/TontonYuta/CyberSecYuta.git
cd CyberSecYuta

# 2. Cài đặt các gói phụ thuộc
npm install

# 3. Chạy môi trường phát triển (Development Server)
npm run dev
# Truy cập tại: http://localhost:3000

# 4. Kiểm tra TypeScript & Build bản phát hành (Production Build)
npm run build
npm run preview
```

---

## 🚀 Triển Khai Nhanh Với Vercel

Dự án được tối ưu hóa sẵn cho **Vercel** thông qua cấu hình `vite.config.ts`:

```bash
# Cài đặt Vercel CLI (nếu chưa có)
npm i -g vercel

# Triển khai trực tiếp
vercel --prod
```

Hoặc kết nối trực tiếp repository [GitHub CyberSecYuta](https://github.com/TontonYuta/CyberSecYuta) trên giao diện Vercel Dashboard với các thiết lập mặc định:
- **Framework Preset:** `Vite`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

---

## 📄 Giấy Phép & Bản Quyền

Dự án được phát hành dưới giấy phép [MIT License](LICENSE).  
Xây dựng và phát triển bởi **[TontonYuta](https://github.com/TontonYuta)** — 2026.
