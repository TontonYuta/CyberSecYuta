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
              flagRevealed: 'flag{sQL1_1nj3ct10n_auth_byp4ss_succ3ss}',
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
              flagRevealed: 'flag{rC3_c0mm4nd_1nj3ct10n_pwn3d}',
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
              flagRevealed: 'flag{1d0r_br0k3n_0bj3ct_auth_l34k}',
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
              flagRevealed: 'flag{1d0r_v1p_d1r3ct0r_d0ss13r}',
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
              flagRevealed: 'flag{xss_s3ss10n_c00k13_st0l3n_c2}',
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
    <div className="flex-1 w-full h-full min-h-0 overflow-hidden flex flex-col bg-[#09090b]">
      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden px-2.5 py-1.5 bg-[#121215] border-b border-[#27272a] flex items-center justify-between shrink-0">
        <div className="flex items-center p-0.5 bg-black border border-neutral-800 rounded-lg w-full">
          <button
            onClick={() => {
              sound.playClick();
              setMobileTab('code');
            }}
            className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'code'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>Mã Nguồn & Lỗ Hổng</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setMobileTab('target');
            }}
            className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'target'
                ? 'bg-red-950/80 text-red-200 border border-red-600/50 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>Mục Tiêu & Khai Thác</span>
          </button>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0 overflow-hidden flex flex-col lg:flex-row">
        {/* LEFT PANE: Lab Selector, Security Mode Switch & Source Code Inspector */}
        <div
          className={`w-full lg:w-[48%] h-full flex flex-col border-r border-[#27272a] bg-[#0c0c0e] overflow-hidden ${
            mobileTab === 'code' ? 'flex' : 'hidden lg:flex'
          }`}
        >
        {/* Sub-header 1: Vulnerability Selector Strip */}
        <div className="p-3 border-b border-[#27272a] bg-[#121215]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Chọn Lỗ Hổng Thực Hành (Scenario)
            </span>
            <span className="text-[11px] font-mono text-neutral-500">
              {currentScenario.cwe.split(':')[0]}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {SCENARIOS.map((sc) => {
              const isSelected = sc.id === selectedScenarioId;
              return (
                <button
                  key={sc.id}
                  onClick={() => setSelectedScenarioId(sc.id)}
                  className={`px-2.5 py-2 text-left rounded border transition-all text-xs flex items-center justify-between ${
                    isSelected
                      ? 'bg-neutral-800 border-neutral-600 text-white shadow-sm'
                      : 'bg-neutral-900/60 border-neutral-800/80 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-[10px] text-neutral-400 font-semibold">
                      [{sc.index}]
                    </span>
                    <span className="truncate font-medium">{sc.title.split('(')[0]}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono shrink-0 px-1 rounded ${
                      sc.severity === 'Critical'
                        ? 'text-red-400 bg-red-950/40'
                        : 'text-amber-400 bg-amber-950/40'
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
        <div className="px-3 py-2.5 border-b border-[#27272a] bg-[#0f0f12] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-neutral-300">Trạng thái mã nguồn:</span>
          </div>

          {/* Big Interactive Dual Toggle */}
          <div className="flex items-center p-0.5 bg-neutral-950 border border-neutral-800 rounded-md">
            <button
              onClick={() => setSecurityMode('vulnerable')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
                securityMode === 'vulnerable'
                  ? 'bg-red-950/80 text-red-200 border border-red-600/50 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
              <span>Có Lỗ Hổng (Vulnerable)</span>
            </button>

            <button
              onClick={() => setSecurityMode('patched')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
                securityMode === 'patched'
                  ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-600/50 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Đã Vá An Toàn (Patched)</span>
            </button>
          </div>
        </div>

        {/* Code Viewer Panel with syntax lines and vulnerability callout */}
        <div className="flex-1 overflow-y-auto flex flex-col p-3">
          <div className="flex items-center justify-between pb-2 text-xs text-neutral-400 border-b border-neutral-800/80 mb-2">
            <div className="flex items-center gap-2">
              <FileCode className="w-3.5 h-3.5 text-neutral-400" />
              <span className="font-mono text-neutral-300">
                {securityMode === 'vulnerable'
                  ? currentScenario.vulnerableCode.filename
                  : currentScenario.patchedCode.filename}
              </span>
            </div>
            <span
              className={`text-[11px] font-mono font-medium ${
                securityMode === 'vulnerable' ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {securityMode === 'vulnerable' ? '● Unsanitized Code' : '● Parameterized & Protected'}
            </span>
          </div>

          {/* Syntax code block */}
          <div className="bg-[#070709] border border-[#27272a] rounded font-mono text-[11px] leading-relaxed p-3 overflow-x-auto shadow-inner flex-1">
            {securityMode === 'vulnerable'
              ? currentScenario.vulnerableCode.lines.map((line, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start py-0.5 px-1 rounded ${
                      line.isVulnerable
                        ? 'bg-red-950/50 text-red-200 border-l-2 border-red-500 font-semibold'
                        : 'text-neutral-300'
                    }`}
                  >
                    <span className="w-6 shrink-0 select-none text-neutral-600 text-right pr-2 text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="whitespace-pre flex-1">{line.text || ' '}</span>
                    {line.note && (
                      <span className="text-[10px] text-neutral-500 italic ml-2 select-none shrink-0">
                        # {line.note}
                      </span>
                    )}
                  </div>
                ))
              : currentScenario.patchedCode.lines.map((line, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start py-0.5 px-1 rounded ${
                      line.isPatched
                        ? 'bg-emerald-950/50 text-emerald-200 border-l-2 border-emerald-500 font-semibold'
                        : 'text-neutral-300'
                    }`}
                  >
                    <span className="w-6 shrink-0 select-none text-neutral-600 text-right pr-2 text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="whitespace-pre flex-1">{line.text || ' '}</span>
                    {line.note && (
                      <span className="text-[10px] text-neutral-500 italic ml-2 select-none shrink-0">
                        # {line.note}
                      </span>
                    )}
                  </div>
                ))}
          </div>

          {/* Vulnerability Explanation & Impact Footer */}
          <div className="mt-3 p-2.5 rounded bg-[#121215] border border-[#27272a] text-xs text-neutral-300 shrink-0">
            <div className="flex items-center gap-1.5 font-semibold text-neutral-200 mb-1">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span>Cơ chế bảo mật & Nguyên lý:</span>
            </div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              {securityMode === 'vulnerable'
                ? currentScenario.fullDesc
                : currentScenario.defenseOverview}
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Mock Target Browser Window, Quick Payloads & Exploit Result (52% on desktop) */}
      <div
        className={`w-full lg:w-[52%] h-full flex flex-col bg-[#09090b] overflow-hidden ${
          mobileTab === 'target' ? 'flex' : 'hidden lg:flex'
        }`}
      >
        {/* Quick Payload Toolbar */}
        <div className="px-3 py-2 bg-[#121215] border-b border-[#27272a] flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1.5 shrink-0 text-xs font-medium text-neutral-400">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Nạp Payload mẫu:</span>
          </div>
          <div className="flex items-center gap-1.5">
            {currentScenario.payloads.map((pl) => (
              <div key={pl.id} className="flex items-center shrink-0">
                <button
                  onClick={() => handleApplyPayload(pl.payload, pl.targetField)}
                  className="px-2 py-1 text-[11px] font-mono bg-neutral-900 border border-neutral-700/80 hover:border-amber-500/60 hover:text-amber-200 text-neutral-300 rounded transition-colors whitespace-nowrap"
                  title={pl.description}
                >
                  {pl.label}
                </button>
                <button
                  onClick={() => handleCopyPayload(pl.payload, pl.id)}
                  className="p-1 text-neutral-500 hover:text-neutral-300 ml-0.5"
                  title="Copy payload"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Mock Browser Container */}
        <div className="flex-1 flex flex-col m-3 rounded-lg border border-[#27272a] bg-[#121215] overflow-hidden shadow-2xl">
          {/* Browser Chrome Header (Address bar, controls) */}
          <div className="h-10 bg-[#16161a] border-b border-[#27272a] px-3 flex items-center gap-3 shrink-0 select-none">
            {/* Traffic Lights dots */}
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>

            {/* Back / Forward / Refresh controls */}
            <div className="flex items-center gap-1 text-neutral-500">
              <button
                className="p-1 hover:text-neutral-300 rounded transition-colors"
                title="Back"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                className="p-1 hover:text-neutral-300 rounded transition-colors"
                title="Forward"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleExecuteAttack}
                className="p-1 hover:text-neutral-300 rounded transition-colors"
                title="Reload"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* URL Omnibox */}
            <div className="flex-1 flex items-center bg-[#09090b] border border-neutral-800 rounded px-2.5 py-1 text-xs font-mono text-neutral-300 focus-within:border-neutral-600 transition-colors">
              <Lock className="w-3 h-3 text-emerald-500 mr-1.5 shrink-0" />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full bg-transparent outline-none text-neutral-200 text-xs"
                placeholder={currentScenario.urlPlaceholder}
              />
            </div>
          </div>

          {/* Browser Viewport Content */}
          <div className="flex-1 p-4 overflow-y-auto bg-[#0e0e11] flex flex-col">
            {/* Target App Bar Banner */}
            <div className="border-b border-neutral-800 pb-3 mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  {currentScenario.mockAppContext.appTitle}
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  {currentScenario.mockAppContext.description}
                </p>
              </div>
              <span className="text-[10px] font-mono text-neutral-500 border border-neutral-800 rounded px-2 py-0.5">
                Target Host: {currentScenario.mockAppContext.serverHost}
              </span>
            </div>

            {/* SCENARIO 1: SQL Injection Login Mock Form */}
            {selectedScenarioId === 'sqli' && (
              <div className="max-w-md mx-auto w-full p-4 rounded-md border border-neutral-800 bg-[#141418] my-auto">
                <div className="text-center mb-4">
                  <h4 className="text-sm font-semibold text-neutral-200">
                    ACME Enterprise Single Sign-On
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    Cổng đăng nhập hệ thống thông tin nhân sự và cơ sở dữ liệu
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Tên người dùng (Username / SQL injection point)
                    </label>
                    <input
                      type="text"
                      value={formInputs.username}
                      onChange={(e) =>
                        setFormInputs((prev) => ({ ...prev, username: e.target.value }))
                      }
                      placeholder="admin or admin' --"
                      className="w-full px-3 py-1.5 bg-[#09090b] border border-neutral-700 rounded font-mono text-xs text-neutral-200 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Mật khẩu (Password)
                    </label>
                    <input
                      type="password"
                      value={formInputs.password}
                      onChange={(e) =>
                        setFormInputs((prev) => ({ ...prev, password: e.target.value }))
                      }
                      placeholder="••••••••••••"
                      className="w-full px-3 py-1.5 bg-[#09090b] border border-neutral-700 rounded font-mono text-xs text-neutral-200 focus:outline-none focus:border-neutral-500"
                    />
                  </div>

                  <button
                    onClick={handleExecuteAttack}
                    disabled={isLoading}
                    className="w-full py-2 px-4 mt-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <span>Đang xác thực truy vấn SQL...</span>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>Gửi Yêu Cầu Đăng Nhập (Execute Query)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* SCENARIO 2: OS Command Injection Ping Tool */}
            {selectedScenarioId === 'cmd_injection' && (
              <div className="max-w-lg mx-auto w-full p-4 rounded-md border border-neutral-800 bg-[#141418] my-auto">
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-400" />
                    Network Connectivity Diagnostics
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    Công cụ gửi gói tin ICMP echo request để kiểm tra khả năng định tuyến máy chủ.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Địa chỉ máy chủ đích (Target Host / IP Address)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formInputs.host}
                        onChange={(e) =>
                          setFormInputs((prev) => ({ ...prev, host: e.target.value }))
                        }
                        placeholder="127.0.0.1 or 127.0.0.1; whoami"
                        className="flex-1 px-3 py-1.5 bg-[#09090b] border border-neutral-700 rounded font-mono text-xs text-neutral-200 focus:outline-none focus:border-red-500"
                      />
                      <button
                        onClick={handleExecuteAttack}
                        disabled={isLoading}
                        className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded text-xs transition-colors shrink-0 cursor-pointer"
                      >
                        {isLoading ? 'Đang ping...' : 'Chạy Chẩn Đoán'}
                      </button>
                    </div>
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    Lệnh thực thi máy chủ: <code className="text-neutral-400">ping -c 2 {'{target_host}'}</code>
                  </div>
                </div>
              </div>
            )}

            {/* SCENARIO 3: IDOR Medical Record Viewer */}
            {selectedScenarioId === 'idor' && (
              <div className="max-w-lg mx-auto w-full p-4 rounded-md border border-neutral-800 bg-[#141418] my-auto">
                <div className="mb-3 flex items-center justify-between border-b border-neutral-800 pb-2">
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-200">
                      MediCare Patient File Portal
                    </h4>
                    <p className="text-xs text-neutral-400">
                      Tài khoản phiên làm việc: <span className="text-emerald-400 font-mono">Alex Mercer (ID: 1001)</span>
                    </p>
                  </div>
                  <span className="text-[10px] font-mono bg-blue-950/60 text-blue-300 border border-blue-800 px-2 py-0.5 rounded">
                    Role: Standard Patient
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Mã số hồ sơ bệnh án (Query Parameter: ?id=...)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formInputs.id}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormInputs((prev) => ({ ...prev, id: val }));
                          setUrlInput(`https://medicare-portal.health.org/patient/records?id=${val}`);
                        }}
                        placeholder="1001, 1002, 9999"
                        className="flex-1 px-3 py-1.5 bg-[#09090b] border border-neutral-700 rounded font-mono text-xs text-neutral-200 focus:outline-none focus:border-red-500"
                      />
                      <button
                        onClick={handleExecuteAttack}
                        disabled={isLoading}
                        className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded text-xs transition-colors shrink-0 cursor-pointer"
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
              <div className="max-w-lg mx-auto w-full p-4 rounded-md border border-neutral-800 bg-[#141418] my-auto">
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-neutral-200">
                    FinTech Help Desk Knowledgebase
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    Tìm kiếm tài liệu hướng dẫn và câu hỏi thường gặp về thanh toán.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Từ khóa tìm kiếm (Search Query Param: ?q=...)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formInputs.q}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormInputs((prev) => ({ ...prev, q: val }));
                          setUrlInput(`https://helpdesk.fintech-global.com/search?q=${encodeURIComponent(val)}`);
                        }}
                        placeholder="invoice or <script>alert(1)</script>"
                        className="flex-1 px-3 py-1.5 bg-[#09090b] border border-neutral-700 rounded font-mono text-xs text-neutral-200 focus:outline-none focus:border-red-500"
                      />
                      <button
                        onClick={handleExecuteAttack}
                        disabled={isLoading}
                        className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded text-xs transition-colors shrink-0 cursor-pointer"
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
              <div className="mt-4 pt-4 border-t border-neutral-800">
                {/* Result Status Banner */}
                <div
                  className={`p-3 rounded-md border mb-3 flex items-start justify-between gap-3 ${
                    executionResult.status === 'success' && securityMode === 'vulnerable'
                      ? 'bg-red-950/70 border-red-500 text-red-200 shadow-lg shadow-red-950/40'
                      : executionResult.status === 'mitigated'
                      ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200 shadow-lg shadow-emerald-950/40'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-300'
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
                        <span className="font-bold text-xs uppercase tracking-wide">
                          {executionResult.status === 'success' && securityMode === 'vulnerable'
                            ? 'EXPLOIT SUCCESSFUL'
                            : executionResult.status === 'mitigated'
                            ? 'ATTACK MITIGATED'
                            : 'RESPONSE RECEIVED'}
                        </span>
                        <span className="font-mono text-[10px] bg-black/50 px-1.5 py-0.5 rounded border border-white/10">
                          HTTP {executionResult.httpStatus}
                        </span>
                      </div>
                      <p className="text-xs mt-1 font-medium">{executionResult.message}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-neutral-400 shrink-0">
                    {executionResult.timestamp}
                  </span>
                </div>

                {/* Leaked Flag (if CTF solved) */}
                {executionResult.flagRevealed && securityMode === 'vulnerable' && (
                  <div className="mb-3 p-2.5 rounded bg-amber-950/40 border border-amber-500/50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-amber-300">
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      <span className="font-semibold">Lab CTF Flag Captured:</span>
                      <code className="font-mono bg-black/60 px-2 py-0.5 rounded text-amber-200 font-bold">
                        {executionResult.flagRevealed}
                      </code>
                    </div>
                  </div>
                )}

                {/* Console Output or Leaked DB Records */}
                {executionResult.rawConsole && (
                  <div className="mb-3 rounded bg-black border border-neutral-800 p-2.5 font-mono text-[11px] text-green-400 overflow-x-auto">
                    <div className="text-neutral-500 text-[10px] mb-1">
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
                  <div className="mb-3 p-2.5 rounded bg-red-950/40 border border-red-500/40 text-xs font-mono text-red-200">
                    <div className="font-semibold text-red-300 mb-1 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Exfiltrated Document Cookie:</span>
                    </div>
                    <div className="bg-black/60 p-2 rounded text-[11px] break-all border border-red-900/40">
                      {executionResult.cookieStolen}
                    </div>
                  </div>
                )}

                {executionResult.dataOutput && (
                  <div className="mb-3 rounded bg-black/80 border border-neutral-800 p-2.5 text-xs">
                    <div className="text-neutral-400 font-semibold mb-1">
                      Dữ liệu phản hồi từ máy chủ (JSON Response Payload):
                    </div>
                    <pre className="font-mono text-[11px] text-neutral-300 overflow-x-auto bg-neutral-950 p-2 rounded border border-neutral-900">
                      {JSON.stringify(executionResult.dataOutput, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Defense analysis callout */}
                <div className="text-xs text-neutral-400 bg-neutral-900/70 p-2.5 rounded border border-neutral-800">
                  <span className="font-semibold text-neutral-200">Phân tích phòng thủ: </span>
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
