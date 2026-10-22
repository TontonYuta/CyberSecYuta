import React, { useState, useEffect } from 'react';
import { SCENARIOS } from '../data/sandboxScenarios';
import { ScenarioId, SecurityMode, ExecutionResult } from '../types';
import { sound } from '../utils/audio';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Lock,
  Globe,
  Terminal,
  FileCode,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Info,
  Server,
  Zap,
} from 'lucide-react';

export const SandboxTab: React.FC = () => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<ScenarioId>('sqli');
  const [securityMode, setSecurityMode] = useState<SecurityMode>('vulnerable');
  const [mobileTab, setMobileTab] = useState<'code' | 'target'>('target');

  // Input states for current active scenario
  const [urlInput, setUrlInput] = useState<string>('');
  const [formInputs, setFormInputs] = useState<Record<string, string>>({
    username: '',
    password: '',
    host: '127.0.0.1',
    id: '1001',
    q: '',
  });

  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedFlag, setCopiedFlag] = useState<string | null>(null);
  const [copiedPayloadId, setCopiedPayloadId] = useState<string | null>(null);

  const currentScenario = SCENARIOS.find((s) => s.id === selectedScenarioId) || SCENARIOS[0];

  // Reset or initialize URL & inputs when scenario changes
  useEffect(() => {
    setUrlInput(currentScenario.urlDefault);
    setExecutionResult(null);

    if (selectedScenarioId === 'sqli') {
      setFormInputs((prev) => ({ ...prev, username: '', password: '' }));
    } else if (selectedScenarioId === 'cmd_injection') {
      setFormInputs((prev) => ({ ...prev, host: '127.0.0.1' }));
    } else if (selectedScenarioId === 'idor') {
      setFormInputs((prev) => ({ ...prev, id: '1001' }));
      setUrlInput('https://medicare-portal.health.org/patient/records?id=1001');
    } else if (selectedScenarioId === 'xss') {
      setFormInputs((prev) => ({ ...prev, q: 'invoice' }));
      setUrlInput('https://helpdesk.fintech-global.com/search?q=invoice');
    }
  }, [selectedScenarioId, currentScenario]);

  // Handle payload load
  const handleApplyPayload = (payloadStr: string, targetField?: string) => {
    sound.playClick();
    setMobileTab('target');
    if (selectedScenarioId === 'sqli') {
      setFormInputs((prev) => ({ ...prev, username: payloadStr, password: 'password123' }));
    } else if (selectedScenarioId === 'cmd_injection') {
      setFormInputs((prev) => ({ ...prev, host: payloadStr }));
    } else if (selectedScenarioId === 'idor') {
      setFormInputs((prev) => ({ ...prev, id: payloadStr }));
      setUrlInput(`https://medicare-portal.health.org/patient/records?id=${payloadStr}`);
    } else if (selectedScenarioId === 'xss') {
      setFormInputs((prev) => ({ ...prev, q: payloadStr }));
      setUrlInput(`https://helpdesk.fintech-global.com/search?q=${encodeURIComponent(payloadStr)}`);
    }
  };

  // Execute exploit / mock submit
  const handleExecuteAttack = () => {
    sound.playClick();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const isPatched = securityMode === 'patched';
      if (!isPatched) {
        sound.playSuccess();
      } else {
        sound.playClick();
      }

      if (selectedScenarioId === 'sqli') {
        const u = formInputs.username || '';
        const isSqliAttempt =
          u.includes("'") ||
          u.includes('--') ||
          u.toUpperCase().includes('UNION') ||
          u.toUpperCase().includes('OR 1=1');

        if (isPatched) {
          if (isSqliAttempt) {
            setExecutionResult({
              status: 'mitigated',
              httpStatus: 401,
              message: 'Invalid credentials or user not found. Parameterized query safely treated quotes as literal data.',
              defenseExplanation: 'Cơ sở dữ liệu thực thi câu truy vấn Prepared Statement ("SELECT ... WHERE username = ?"). Dấu nháy đơn và từ khóa OR/UNION không thể phá vỡ cú pháp logic SQL.',
              timestamp: new Date().toLocaleTimeString(),
            });
          } else if (u === 'admin' && formInputs.password === 'masterAdmin2026!') {
            setExecutionResult({
              status: 'success',
              httpStatus: 200,
              message: 'Authentication Successful as Admin (Legitimate Credentials).',
              defenseExplanation: 'Đăng nhập thành công với mật khẩu hợp lệ và bcrypt verify an toàn.',
              dataOutput: { user: 'admin', role: 'SUPERADMIN', session: 'sess_sec_991823' },
              timestamp: new Date().toLocaleTimeString(),
            });
          } else {
            setExecutionResult({
              status: 'invalid',
              httpStatus: 401,
              message: 'Invalid username or password.',
              defenseExplanation: 'Truy vấn không tìm thấy người dùng khớp trong DB.',
              timestamp: new Date().toLocaleTimeString(),
            });
          }
        } else {
          // Vulnerable
          if (isSqliAttempt) {
            const isUnion = u.toUpperCase().includes('UNION');
            const leakedUsers = [
              { id: 1, username: 'admin', role: 'SUPERADMIN', api_secret: 'sk_live_acme_master_99218', password_hash: '$2b$12$eX4mPLeH4sH...' },
              { id: 2, username: 'db_manager', role: 'DBA', api_secret: 'sk_live_db_operator_10022', password_hash: '$2b$12$K89sJkL2...' },
              { id: 3, username: 'cfo_audit', role: 'AUDITOR', api_secret: 'sk_live_cfo_vault_7721', password_hash: '$2b$12$Z09vLmN8...' },
            ];

            setExecutionResult({
              status: 'success',
              httpStatus: 200,
              message: isUnion
                ? 'EXPLOIT SUCCESSFUL: Database Schema & Records Dumped via UNION Attack!'
                : 'EXPLOIT SUCCESSFUL: SQL Authentication Bypassed! Logged in as SUPERADMIN.',
              dataOutput: isUnion ? leakedUsers : { user: 'admin', role: 'SUPERADMIN', token: 'SESSION_ROOT_ADMIN_TOKEN_EXPLOITED' },
              rawConsole: [
                `[DEBUG SQL EXEC]: SELECT id, username, role, api_secret FROM users WHERE username = '${u}' AND password = '${formInputs.password}'`,
                '[SQLITE ENGINE]: Query parsed successfully. Condition evaluated to TRUE or UNION returned secondary result set.',
                '[CRITICAL]: Zero credential check performed. Admin session issued.',
              ],
              flagRevealed: 'FLAG{sqli_auth_bypass_union_select_pwned}',
              defenseExplanation: 'Chuỗi f-string trong mã nguồn Python đã ghép nối trực tiếp chuỗi của hacker vào cú pháp SQL, biến mệnh đề WHERE thành điều kiện luôn đúng hoặc mở rộng UNION.',
              timestamp: new Date().toLocaleTimeString(),
            });
          } else {
            setExecutionResult({
              status: 'invalid',
              httpStatus: 401,
              message: 'Authentication failed. Please provide valid credentials.',
              defenseExplanation: 'Không phát hiện payload SQLi. Đăng nhập thất bại bình thường.',
              timestamp: new Date().toLocaleTimeString(),
            });
          }
        }
      } else if (selectedScenarioId === 'cmd_injection') {
        const host = formInputs.host || '';
        const isCmdInjection =
          host.includes(';') ||
          host.includes('&&') ||
          host.includes('|') ||
          host.includes('`') ||
          host.includes('$(');

        if (isPatched) {
          if (isCmdInjection || !/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/.test(host.trim())) {
            setExecutionResult({
              status: 'mitigated',
              httpStatus: 400,
              message: 'HTTP 400 Bad Request: Invalid IP Address format. Special shell metacharacters (; && |) are strictly prohibited.',
              defenseExplanation: 'Hàm validate_ip_address() đã chặn đứng dữ liệu đầu vào. Ngoài ra subprocess.run(..., shell=False) truyền tham số dưới dạng Array nên hệ điều hành không bao giờ phân tích dấu chấm phẩy thành lệnh mới.',
              timestamp: new Date().toLocaleTimeString(),
            });
          } else {
            setExecutionResult({
              status: 'success',
              httpStatus: 200,
              message: `PING ${host} (56 bytes of data). 2 packets transmitted, 2 received, 0% packet loss, time 1002ms.`,
              rawConsole: [
                `PING ${host} (${host}) 56(84) bytes of data.`,
                `64 bytes from ${host}: icmp_seq=1 ttl=118 time=14.2 ms`,
                `64 bytes from ${host}: icmp_seq=2 ttl=118 time=13.8 ms`,
                `--- ${host} ping statistics ---`,
                `2 packets transmitted, 2 received, 0% packet loss, rtt min/avg/max = 13.8/14.0/14.2 ms`,
              ],
              defenseExplanation: 'Lệnh ping thực thi an toàn với shell=False và IP hợp lệ.',
              timestamp: new Date().toLocaleTimeString(),
            });
          }
        } else {
          // Vulnerable
          if (isCmdInjection) {
            let fakeOutput = [
              `PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.`,
              `64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.034 ms`,
            ];

            if (host.includes('whoami')) {
              fakeOutput.push('root');
              fakeOutput.push('[UID=0(root) GID=0(root) GROUPS=0(root)]');
            } else if (host.includes('/etc/passwd')) {
              fakeOutput.push('root:x:0:0:root:/root:/bin/bash');
              fakeOutput.push('daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin');
              fakeOutput.push('www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin');
              fakeOutput.push('sec-engineer:x:1000:1000:Security Engineer,,,:/home/sec-engineer:/bin/bash');
              fakeOutput.push('backup-admin:x:1001:1001::/home/backup-admin:/bin/bash');
            } else if (host.includes('SECRET')) {
              fakeOutput.push('AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY');
              fakeOutput.push('DATABASE_URL=postgres://master_admin:P@ssw0rd9912@prod-db.internal:5432/main');
              fakeOutput.push('JWT_HMAC_SECRET=b63ef299a004419cb7d10e82f4');
            } else {
              fakeOutput.push('Linux prod-netops-srv 6.1.0-21-amd64 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux');
              fakeOutput.push('total 48');
              fakeOutput.push('drwxr-xr-x  5 root root  4096 Oct 21 07:12 .');
              fakeOutput.push('-rwxr-xr-x  1 root root 18492 Oct 21 07:11 server.py');
              fakeOutput.push('-rw-------  1 root root   256 Oct 21 07:10 flag.txt');
            }

            setExecutionResult({
              status: 'success',
              httpStatus: 200,
              message: 'EXPLOIT SUCCESSFUL: Remote Code Execution (RCE) via Shell Metacharacter!',
              rawConsole: fakeOutput,
              flagRevealed: 'FLAG{rce_command_injection_shell_bypass_pwned}',
              defenseExplanation: 'subprocess.Popen với shell=True đã cho phép shell Linux phân tách dấu chấm phẩy (;) hoặc ống dẫn (|) và thực thi lệnh nguy hiểm với toàn quyền của tiến trình web.',
              timestamp: new Date().toLocaleTimeString(),
            });
          } else {
            setExecutionResult({
              status: 'success',
              httpStatus: 200,
              message: `PING ${host}: 2 packets transmitted, 2 received.`,
              rawConsole: [`PING ${host}: 64 bytes from ${host}: icmp_seq=1 ttl=64 time=0.04 ms`],
              defenseExplanation: 'Lệnh ping tiêu chuẩn thực thi bình thường.',
              timestamp: new Date().toLocaleTimeString(),
            });
          }
        }
      } else if (selectedScenarioId === 'idor') {
        const idVal = formInputs.id || '1001';
        setUrlInput(`https://medicare-portal.health.org/patient/records?id=${idVal}`);

        if (isPatched) {
          if (idVal === '1001') {
            setExecutionResult({
              status: 'success',
              httpStatus: 200,
              message: 'Record retrieved successfully (Owner: Alex Mercer - Authorized).',
              dataOutput: {
                recordId: '1001',
                patientName: 'Alex Mercer (You)',
                dob: '1992-04-15',
                bloodType: 'O+',
                diagnosis: 'Routine Annual Physical Examination - Healthy',
                unpaidBillingBalance: '$0.00',
                attendingPhysician: 'Dr. Gregory House, M.D.',
              },
              defenseExplanation: 'Người dùng sở hữu hợp pháp hồ sơ ID 1001 (khớp authenticatedUser.id từ JWT session). Cho phép truy cập.',
              timestamp: new Date().toLocaleTimeString(),
            });
          } else {
            setExecutionResult({
              status: 'mitigated',
              httpStatus: 403,
              message: 'HTTP 403 Forbidden: Access Denied! You do not have permissions to access patient record #' + idVal,
              defenseExplanation: 'Hệ thống đã kiểm tra quyền sở hữu ở backend ("WHERE id = ? AND (patient_id = ? OR role = ...)") và phát hiện ID phiên không trùng khớp với chủ sở hữu bản ghi.',
              timestamp: new Date().toLocaleTimeString(),
            });
          }
        } else {
          // Vulnerable
          if (idVal === '1001') {
            setExecutionResult({
              status: 'success',
              httpStatus: 200,
              message: 'Own patient record loaded.',
              dataOutput: {
                recordId: '1001',
                patientName: 'Alex Mercer (You)',
                dob: '1992-04-15',
                diagnosis: 'Routine Checkup - Normal',
                unpaidBillingBalance: '$0.00',
              },
              defenseExplanation: 'Bản ghi của chính người dùng.',
              timestamp: new Date().toLocaleTimeString(),
            });
          } else if (idVal === '1002') {
            setExecutionResult({
              status: 'success',
              httpStatus: 200,
              message: 'EXPLOIT SUCCESSFUL: Leaked Medical Record for Sarah Connor (IDOR Bypass)!',
              dataOutput: {
                recordId: '1002',
                patientName: 'Sarah Connor',
                ssn: '***-**-8812',
                diagnosis: 'Severe Cybernetic Trauma / Post-Traumatic Stress',
                prescriptions: ['Xanax 2mg', 'Morphine 10mg IV'],
                unpaidBillingBalance: '$14,820.50 (Overdue)',
                insurancePolicy: 'Cyberdyne Health Preferred #881923',
              },
              flagRevealed: 'FLAG{idor_broken_access_control_bola_2026}',
              defenseExplanation: 'Chỉ bằng cách thay đổi ?id=1002 trên URL, kẻ tấn công đã đọc trộm toàn bộ bệnh án và hóa đơn nhạy cảm vì backend không đối chiếu danh tính người yêu cầu.',
              timestamp: new Date().toLocaleTimeString(),
            });
          } else if (idVal === '9999' || idVal === '1337') {
            setExecutionResult({
              status: 'success',
              httpStatus: 200,
              message: 'EXPLOIT SUCCESSFUL: VIP Hospital Director Executive Dossier Leaked!',
              dataOutput: {
                recordId: idVal,
                patientName: 'Dr. Arthur Vance (Chief Executive Officer)',
                securityClearance: 'TOP_SECRET_MEDICAL_DIRECTOR',
                confidentialNotes: 'Underwent experimental neurological stem-cell therapy in Zurich facility.',
                vipEmergencyContact: '+1 (555) 019-2831 (Encrypted Satellite)',
                privateVaultKeyId: 'VAULT_DIRECTOR_KEY_9921',
              },
              flagRevealed: 'FLAG{idor_broken_access_control_bola_2026}',
              defenseExplanation: 'IDOR nghiêm trọng trên tài khoản quản trị VIP cấp cao nhất.',
              timestamp: new Date().toLocaleTimeString(),
            });
          } else {
            setExecutionResult({
              status: 'invalid',
              httpStatus: 404,
              message: 'Patient record #' + idVal + ' not found in registry.',
              defenseExplanation: 'Không có bản ghi tương ứng.',
              timestamp: new Date().toLocaleTimeString(),
            });
          }
        }
      } else if (selectedScenarioId === 'xss') {
        const q = formInputs.q || '';
        const isXssAttempt =
          q.includes('<script>') ||
          q.includes('<img') ||
          q.includes('<svg') ||
          q.includes('onerror=') ||
          q.includes('onload=') ||
          q.includes('document.cookie');

        if (isPatched) {
          setExecutionResult({
            status: isXssAttempt ? 'mitigated' : 'success',
            httpStatus: 200,
            message: isXssAttempt
              ? 'XSS MITIGATED: Payload rendered safely as plain escaped text (&lt;script&gt;). Content Security Policy active.'
              : `Found 3 articles matching "${q}".`,
            defenseExplanation: 'Hệ thống sử dụng cú pháp EJS an toàn <%= %> để tự động chuyển ký tự < > thành thực thể HTML entity (&lt; &gt;). Trình duyệt xem đây là chuỗi văn bản thông thường chứ không bao giờ thực thi thành code.',
            timestamp: new Date().toLocaleTimeString(),
          });
        } else {
          // Vulnerable
          if (isXssAttempt) {
            setExecutionResult({
              status: 'success',
              httpStatus: 200,
              message: 'EXPLOIT SUCCESSFUL: Reflected Cross-Site Scripting (XSS) Executed in Browser Context!',
              cookieStolen: 'session_auth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjdXN0b21lcl84MTEyIiwicm9sZSI6InVzZXIifQ.x892fLa78129; bank_account=ACME_491823901',
              flagRevealed: 'FLAG{xss_stored_reflected_csp_defense_2026}',
              defenseExplanation: 'Mã nguồn sử dụng <%- %> (in thô) khiến trình duyệt coi chuỗi nhập vào là mã HTML/JS hợp lệ. Đoạn script đã chạy ngầm và đọc sạch document.cookie.',
              timestamp: new Date().toLocaleTimeString(),
            });
          } else {
            setExecutionResult({
              status: 'success',
              httpStatus: 200,
              message: `Found 2 results for "${q}".`,
              defenseExplanation: 'Từ khóa tìm kiếm bình thường không chứa mã độc.',
              timestamp: new Date().toLocaleTimeString(),
            });
          }
        }
      }
    }, 400);
  };

  const handleCopyPayload = (payload: string, id: string) => {
    navigator.clipboard.writeText(payload);
    setCopiedPayloadId(id);
    setTimeout(() => setCopiedPayloadId(null), 1500);
  };

  return (
    <div className="flex-1 w-full h-full min-h-0 overflow-hidden flex flex-col bg-[#0b0f19]">
      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden px-3 py-2 bg-[#0e1424] border-b border-[#1e293b] flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center p-1 bg-slate-950/80 border border-slate-800 rounded-xl w-full gap-1">
          <button
            onClick={() => {
              sound.playClick();
              setMobileTab('code');
            }}
            className={`flex-1 py-2 px-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'code'
                ? 'bg-blue-600/30 text-blue-200 border border-blue-500/50 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Mã Nguồn & Lỗ Hổng</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setMobileTab('target');
            }}
            className={`flex-1 py-2 px-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'target'
                ? 'bg-red-950/80 text-red-200 border border-red-500/60 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4 text-red-400 shrink-0" />
            <span>Mục Tiêu & Khai Thác</span>
          </button>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0 overflow-hidden flex flex-col lg:flex-row">
        {/* LEFT PANE: Lab Selector, Security Mode Switch & Source Code Inspector */}
        <div
          className={`w-full lg:w-[48%] h-full flex flex-col border-r border-[#1e293b] bg-[#0c1222] overflow-hidden ${
            mobileTab === 'code' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Sub-header 1: Vulnerability Selector Strip */}
          <div className="p-3 sm:p-3.5 border-b border-[#1e293b] bg-[#0e1628]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Chọn Lỗ Hổng Thực Hành (OWASP Lab)
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                {currentScenario.cwe.split(':')[0]}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {SCENARIOS.map((sc) => {
                const isSelected = sc.id === selectedScenarioId;
                return (
                  <button
                    key={sc.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedScenarioId(sc.id);
                    }}
                    className={`p-2.5 text-left rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between gap-2 cursor-pointer min-h-[46px] ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-950/50 ring-1 ring-blue-500/40'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-mono text-xs text-blue-400 font-bold shrink-0">
                        [{sc.index}]
                      </span>
                      <span className="truncate font-bold text-slate-100">{sc.title.split('(')[0]}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono shrink-0 px-1.5 py-0.5 rounded-md font-bold ${
                        sc.severity === 'Critical'
                          ? 'text-red-300 bg-red-950/80 border border-red-800'
                          : 'text-amber-300 bg-amber-950/80 border border-amber-800'
                      }`}
                    >
                      {sc.severity}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub-header 2: Mode Switch Toggle: Vulnerable vs Patched */}
          <div className="px-3 sm:px-3.5 py-2.5 border-b border-[#1e293b] bg-[#0c1426] flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-slate-200">Trạng thái mã nguồn:</span>

            {/* Big Interactive Dual Toggle */}
            <div className="flex items-center p-1 bg-slate-950/90 border border-slate-800 rounded-xl gap-1">
              <button
                onClick={() => {
                  sound.playClick();
                  setSecurityMode('vulnerable');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  securityMode === 'vulnerable'
                    ? 'bg-red-950 text-red-200 border border-red-500/80 shadow-sm shadow-red-950/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>Có Lỗ Hổng</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setSecurityMode('patched');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  securityMode === 'patched'
                    ? 'bg-emerald-950 text-emerald-200 border border-emerald-500/80 shadow-sm shadow-emerald-950/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Đã Vá An Toàn</span>
              </button>
            </div>
          </div>

          {/* Code Viewer Panel with syntax lines and vulnerability callout */}
          <div className="flex-1 overflow-y-auto flex flex-col p-3 sm:p-3.5">
            <div className="flex items-center justify-between pb-2 text-xs text-slate-300 border-b border-slate-800 mb-2">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-blue-400" />
                <span className="font-mono font-bold text-slate-200">
                  {securityMode === 'vulnerable'
                    ? currentScenario.vulnerableCode.filename
                    : currentScenario.patchedCode.filename}
                </span>
              </div>
              <span
                className={`text-xs font-mono font-bold ${
                  securityMode === 'vulnerable' ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {securityMode === 'vulnerable' ? '● Unsanitized Code' : '● Parameterized & Protected'}
              </span>
            </div>

            {/* Syntax code block */}
            <div className="bg-[#050811] border border-[#1e293b] rounded-xl font-mono text-xs sm:text-sm leading-relaxed p-3 overflow-x-auto shadow-inner flex-1">
              {securityMode === 'vulnerable'
                ? currentScenario.vulnerableCode.lines.map((line, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start py-0.5 px-1.5 rounded ${
                        line.isVulnerable
                          ? 'bg-red-950/60 text-red-100 border-l-2 border-red-500 font-semibold'
                          : 'text-slate-300'
                      }`}
                    >
                      <span className="w-7 shrink-0 select-none text-slate-500 text-right pr-2 text-xs">
                        {idx + 1}
                      </span>
                      <span className="whitespace-pre flex-1">{line.text || ' '}</span>
                      {line.note && (
                        <span className="text-xs text-amber-300 italic ml-2 select-none shrink-0">
                          # {line.note}
                        </span>
                      )}
                    </div>
                  ))
                : currentScenario.patchedCode.lines.map((line, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start py-0.5 px-1.5 rounded ${
                        line.isPatched
                          ? 'bg-emerald-950/60 text-emerald-100 border-l-2 border-emerald-500 font-semibold'
                          : 'text-slate-300'
                      }`}
                    >
                      <span className="w-7 shrink-0 select-none text-slate-500 text-right pr-2 text-xs">
                        {idx + 1}
                      </span>
                      <span className="whitespace-pre flex-1">{line.text || ' '}</span>
                      {line.note && (
                        <span className="text-xs text-emerald-300 italic ml-2 select-none shrink-0">
                          # {line.note}
                        </span>
                      )}
                    </div>
                  ))}
            </div>

            {/* Vulnerability Explanation & Impact Footer */}
            <div className="mt-3 p-3 rounded-xl bg-[#0f172a] border border-[#1e293b] text-xs sm:text-sm text-slate-300 shrink-0">
              <div className="flex items-center gap-2 font-bold text-slate-100 mb-1">
                <Info className="w-4 h-4 text-blue-400" />
                <span>Cơ chế bảo mật & Nguyên lý:</span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {securityMode === 'vulnerable'
                  ? currentScenario.fullDesc
                  : currentScenario.defenseOverview}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Mock Target Browser Window, Quick Payloads & Exploit Result (52% on desktop) */}
        <div
          className={`w-full lg:w-[52%] h-full flex flex-col bg-[#0b0f19] overflow-hidden ${
            mobileTab === 'target' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Quick Payload Toolbar */}
          <div className="px-3 sm:px-4 py-2 bg-[#0e1628] border-b border-[#1e293b] flex items-center justify-between gap-2 overflow-x-auto shrink-0">
            <div className="flex items-center gap-1.5 shrink-0 text-xs font-bold text-slate-300">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Nạp Payload mẫu:</span>
            </div>
            <div className="flex items-center gap-1.5">
              {currentScenario.payloads.map((pl) => (
                <div key={pl.id} className="flex items-center shrink-0">
                  <button
                    onClick={() => handleApplyPayload(pl.payload, pl.targetField)}
                    className="px-2.5 py-1.5 text-xs font-mono font-bold bg-slate-900 border border-slate-700 hover:border-amber-500 hover:text-amber-200 text-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-sm"
                    title={pl.description}
                  >
                    {pl.label}
                  </button>
                  <button
                    onClick={() => handleCopyPayload(pl.payload, pl.id)}
                    className="p-1.5 text-slate-400 hover:text-white ml-0.5 cursor-pointer"
                    title="Copy payload"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Mock Browser Container */}
          <div className="flex-1 flex flex-col m-2.5 sm:m-3.5 rounded-xl border border-[#1e293b] bg-[#0f172a] overflow-hidden shadow-2xl">
            {/* Browser Chrome Header (Address bar, controls) */}
            <div className="h-11 bg-[#0e1628] border-b border-[#1e293b] px-3 flex items-center gap-2.5 shrink-0 select-none">
              {/* Traffic Lights dots */}
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>

              {/* Back / Forward / Refresh controls */}
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  className="p-1 hover:text-white rounded transition-colors"
                  title="Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  className="p-1 hover:text-white rounded transition-colors"
                  title="Forward"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleExecuteAttack}
                  className="p-1 hover:text-white rounded transition-colors cursor-pointer"
                  title="Reload"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* URL Omnibox */}
              <div className="flex-1 flex items-center bg-[#070b14] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-mono text-slate-200 focus-within:border-emerald-500 transition-colors">
                <Lock className="w-3.5 h-3.5 text-emerald-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full bg-transparent outline-none text-white text-xs sm:text-sm font-mono"
                  placeholder={currentScenario.urlPlaceholder}
                />
              </div>
            </div>

            {/* Browser Viewport Content */}
            <div className="flex-1 p-3.5 sm:p-5 overflow-y-auto bg-[#0a0f1d] flex flex-col">
              {/* Target App Bar Banner */}
              <div className="border-b border-slate-800 pb-3 mb-4 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    {currentScenario.mockAppContext.appTitle}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {currentScenario.mockAppContext.description}
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 rounded-lg px-2 py-0.5">
                  Host: {currentScenario.mockAppContext.serverHost}
                </span>
              </div>

              {/* SCENARIO 1: SQL Injection Login Mock Form */}
              {selectedScenarioId === 'sqli' && (
                <div className="max-w-md mx-auto w-full p-4 sm:p-5 rounded-xl border border-slate-800 bg-[#0f172a] my-auto shadow-lg">
                  <div className="text-center mb-4">
                    <h4 className="text-sm sm:text-base font-bold text-white">
                      ACME Enterprise Single Sign-On
                    </h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Cổng đăng nhập hệ thống thông tin nhân sự và cơ sở dữ liệu
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-slate-200 mb-1">
                        Tên người dùng (Username / SQL injection point)
                      </label>
                      <input
                        type="text"
                        value={formInputs.username}
                        onChange={(e) =>
                          setFormInputs((prev) => ({ ...prev, username: e.target.value }))
                        }
                        placeholder="admin or admin' --"
                        className="w-full h-11 px-3 bg-[#070b14] border border-slate-700 rounded-xl font-mono text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-slate-200 mb-1">
                        Mật khẩu (Password)
                      </label>
                      <input
                        type="password"
                        value={formInputs.password}
                        onChange={(e) =>
                          setFormInputs((prev) => ({ ...prev, password: e.target.value }))
                        }
                        placeholder="••••••••••••"
                        className="w-full h-11 px-3 bg-[#070b14] border border-slate-700 rounded-xl font-mono text-sm text-white focus:outline-none focus:border-slate-500"
                      />
                    </div>

                    <button
                      onClick={handleExecuteAttack}
                      disabled={isLoading}
                      className="w-full h-11 sm:h-12 px-4 mt-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-950/60 active:scale-[0.99]"
                    >
                      {isLoading ? (
                        <span>Đang xác thực truy vấn SQL...</span>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          <span>Gửi Yêu Cầu Đăng Nhập (Execute Query)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* SCENARIO 2: OS Command Injection Ping Tool */}
              {selectedScenarioId === 'cmd_injection' && (
                <div className="max-w-lg mx-auto w-full p-4 sm:p-5 rounded-xl border border-slate-800 bg-[#0f172a] my-auto shadow-lg">
                  <div className="mb-3.5">
                    <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <Server className="w-4 h-4 text-emerald-400" />
                      Network Connectivity Diagnostics
                    </h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Công cụ gửi gói tin ICMP echo request để kiểm tra khả năng định tuyến máy chủ.
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-slate-200 mb-1">
                        Địa chỉ máy chủ đích (Target Host / IP Address)
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={formInputs.host}
                          onChange={(e) =>
                            setFormInputs((prev) => ({ ...prev, host: e.target.value }))
                          }
                          placeholder="127.0.0.1 or 127.0.0.1; whoami"
                          className="flex-1 h-11 px-3 bg-[#070b14] border border-slate-700 rounded-xl font-mono text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        />
                        <button
                          onClick={handleExecuteAttack}
                          disabled={isLoading}
                          className="h-11 px-5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold rounded-xl text-xs sm:text-sm transition-all shrink-0 cursor-pointer shadow-md"
                        >
                          {isLoading ? 'Đang ping...' : 'Chạy Chẩn Đoán'}
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400">
                      Lệnh thực thi máy chủ: <code className="text-slate-200 font-bold">ping -c 2 {'{target_host}'}</code>
                    </div>
                  </div>
                </div>
              )}

              {/* SCENARIO 3: IDOR Medical Record Viewer */}
              {selectedScenarioId === 'idor' && (
                <div className="max-w-lg mx-auto w-full p-4 sm:p-5 rounded-xl border border-slate-800 bg-[#0f172a] my-auto shadow-lg">
                  <div className="mb-3.5 flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-white">
                        MediCare Patient File Portal
                      </h4>
                      <p className="text-xs text-slate-300">
                        Tài khoản phiên làm việc: <span className="text-emerald-400 font-mono font-bold">Alex Mercer (ID: 1001)</span>
                      </p>
                    </div>
                    <span className="text-xs font-mono bg-blue-950/80 text-blue-300 border border-blue-700 px-2 py-0.5 rounded-lg font-bold">
                      Standard Patient
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-slate-200 mb-1">
                        Mã số hồ sơ bệnh án (Query Parameter: ?id=...)
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={formInputs.id}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormInputs((prev) => ({ ...prev, id: val }));
                            setUrlInput(`https://medicare-portal.health.org/patient/records?id=${val}`);
                          }}
                          placeholder="1001, 1002, 9999"
                          className="flex-1 h-11 px-3 bg-[#070b14] border border-slate-700 rounded-xl font-mono text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        />
                        <button
                          onClick={handleExecuteAttack}
                          disabled={isLoading}
                          className="h-11 px-5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold rounded-xl text-xs sm:text-sm transition-all shrink-0 cursor-pointer shadow-md"
                        >
                          {isLoading ? 'Đang truy vấn...' : 'Tải Hồ Sơ'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SCENARIO 4: Reflected XSS Search */}
              {selectedScenarioId === 'xss' && (
                <div className="max-w-lg mx-auto w-full p-4 sm:p-5 rounded-xl border border-slate-800 bg-[#0f172a] my-auto shadow-lg">
                  <div className="mb-3.5">
                    <h4 className="text-sm sm:text-base font-bold text-white">
                      FinTech Help Desk Knowledgebase
                    </h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Tìm kiếm tài liệu hướng dẫn và câu hỏi thường gặp về thanh toán.
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-slate-200 mb-1">
                        Từ khóa tìm kiếm (Search Query Param: ?q=...)
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={formInputs.q}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormInputs((prev) => ({ ...prev, q: val }));
                            setUrlInput(`https://helpdesk.fintech-global.com/search?q=${encodeURIComponent(val)}`);
                          }}
                          placeholder="invoice or <script>alert(1)</script>"
                          className="flex-1 h-11 px-3 bg-[#070b14] border border-slate-700 rounded-xl font-mono text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        />
                        <button
                          onClick={handleExecuteAttack}
                          disabled={isLoading}
                          className="h-11 px-5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold rounded-xl text-xs sm:text-sm transition-all shrink-0 cursor-pointer shadow-md"
                        >
                          {isLoading ? 'Đang tìm...' : 'Tìm Kiếm'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* EXECUTION RESULT DISPLAY / EXPLOIT BANNER */}
              {executionResult && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  {/* Result Status Banner */}
                  <div
                    className={`p-3.5 sm:p-4 rounded-xl border mb-3 flex items-start justify-between gap-3 ${
                      executionResult.status === 'success' && securityMode === 'vulnerable'
                        ? 'bg-red-950/80 border-red-500 text-red-100 shadow-lg shadow-red-950/50'
                        : executionResult.status === 'mitigated'
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-100 shadow-lg shadow-emerald-950/50'
                        : 'bg-slate-900 border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {executionResult.status === 'success' && securityMode === 'vulnerable' ? (
                        <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      ) : executionResult.status === 'mitigated' ? (
                        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs sm:text-sm uppercase tracking-wide">
                            {executionResult.status === 'success' && securityMode === 'vulnerable'
                              ? 'EXPLOIT SUCCESSFUL'
                              : executionResult.status === 'mitigated'
                              ? 'ATTACK MITIGATED'
                              : 'RESPONSE RECEIVED'}
                          </span>
                          <span className="font-mono text-xs bg-black/60 px-2 py-0.5 rounded-md border border-white/10 font-bold">
                            HTTP {executionResult.httpStatus}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm mt-1 font-semibold leading-relaxed">
                          {executionResult.message}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-mono text-slate-400 shrink-0">
                      {executionResult.timestamp}
                    </span>
                  </div>

                  {/* Leaked Flag (if CTF solved) */}
                  {executionResult.flagRevealed && securityMode === 'vulnerable' && (
                    <div className="mb-3 p-3 rounded-xl bg-amber-950/50 border border-amber-500/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs sm:text-sm shadow-md">
                      <div className="flex items-center gap-2 text-amber-200 flex-wrap">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="font-bold">Mã cờ chiến thắng (CTF Flag):</span>
                        <code className="font-mono bg-black/80 px-2 py-1 rounded text-amber-300 font-extrabold select-all">
                          {executionResult.flagRevealed}
                        </code>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(executionResult.flagRevealed!);
                          sound.playClick();
                          setCopiedFlag(executionResult.flagRevealed!);
                          setTimeout(() => setCopiedFlag(null), 2000);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0"
                      >
                        {copiedFlag === executionResult.flagRevealed ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span>Đã sao chép cờ!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Chạm để sao chép cờ</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Console Output or Leaked DB Records */}
                  {executionResult.rawConsole && (
                    <div className="mb-3 rounded-xl bg-black border border-slate-800 p-3 font-mono text-xs sm:text-sm text-green-400 overflow-x-auto">
                      <div className="text-slate-500 text-xs mb-1 font-bold">
                        [Server Terminal STDOUT]
                      </div>
                      {executionResult.rawConsole.map((line, i) => (
                        <div key={i} className="whitespace-pre">
                          {line}
                        </div>
                      ))}
                    </div>
                  )}

                  {executionResult.cookieStolen && (
                    <div className="mb-3 p-3 rounded-xl bg-red-950/50 border border-red-500/50 text-xs sm:text-sm font-mono text-red-200">
                      <div className="font-bold text-red-300 mb-1 flex items-center gap-2">
                        <Terminal className="w-4 h-4" />
                        <span>Exfiltrated Document Cookie:</span>
                      </div>
                      <div className="bg-black/70 p-2.5 rounded-lg text-xs break-all border border-red-900/50">
                        {executionResult.cookieStolen}
                      </div>
                    </div>
                  )}

                  {executionResult.dataOutput && (
                    <div className="mb-3 rounded-xl bg-black/90 border border-slate-800 p-3 text-xs sm:text-sm">
                      <div className="text-slate-300 font-bold mb-1">
                        Dữ liệu phản hồi từ máy chủ (JSON Response Payload):
                      </div>
                      <pre className="font-mono text-xs text-slate-200 overflow-x-auto bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                        {JSON.stringify(executionResult.dataOutput, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Defense analysis callout */}
                  <div className="text-xs sm:text-sm text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800 leading-relaxed">
                    <span className="font-bold text-white">Phân tích phòng thủ: </span>
                    {executionResult.defenseExplanation}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
