import React, { useState, useEffect, useRef } from 'react';
import { CAPTURED_PACKETS } from '../data/packetData';
import { NetworkPacket } from '../types';
import {
  Activity,
  Layers,
  Binary,
  ArrowRight,
  Filter,
  RefreshCw,
  Play,
  SkipForward,
  ChevronDown,
  ChevronRight,
  Server,
  Laptop,
  CheckCircle2,
  X,
  ExternalLink,
  Search,
  Copy,
} from 'lucide-react';

export const PacketInspectorTab: React.FC = () => {
  const [packets] = useState<NetworkPacket[]>(CAPTURED_PACKETS);
  const [selectedPacketId, setSelectedPacketId] = useState<number>(3);
  const [filterText, setFilterText] = useState<string>('');
  const [mobileTab, setMobileTab] = useState<'packets' | 'handshake' | 'details'>('packets');

  // 3-Way Handshake Animation state
  // Step 1: Client -> Server (SYN)
  // Step 2: Server -> Client (SYN-ACK)
  // Step 3: Client -> Server (ACK)
  const [handshakeStep, setHandshakeStep] = useState<number>(1);
  const [isPlayingHandshake, setIsPlayingHandshake] = useState<boolean>(false);
  const [animationSpeed, setAnimationSpeed] = useState<1 | 2>(1);
  const [packetProgress, setPacketProgress] = useState<number>(0); // 0% to 100% position on the wire

  // Follow TCP Stream modal
  const [isFollowStreamOpen, setIsFollowStreamOpen] = useState<boolean>(false);
  const [streamSearchQuery, setStreamSearchQuery] = useState<string>('');
  const [copiedStream, setCopiedStream] = useState<boolean>(false);

  // Expanded layer tree items
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    frame: true,
    ethernet: true,
    ip: true,
    transport: true,
    app: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Animation loop for Handshake
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlayingHandshake) return;

    let start: number | null = null;
    const duration = 2000 / animationSpeed;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      setPacketProgress(progress * 100);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Step finished, transition to next step
        setTimeout(() => {
          setHandshakeStep((prev) => {
            if (prev < 3) {
              setPacketProgress(0);
              return prev + 1;
            } else {
              setIsPlayingHandshake(false);
              setPacketProgress(100);
              return 3;
            }
          });
        }, 400);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlayingHandshake, handshakeStep, animationSpeed]);

  const handleStartHandshake = () => {
    setHandshakeStep(1);
    setPacketProgress(0);
    setIsPlayingHandshake(true);
  };

  const handleNextStep = () => {
    setIsPlayingHandshake(false);
    setPacketProgress(100);
    setHandshakeStep((prev) => (prev < 3 ? prev + 1 : 1));
  };

  // Filter evaluation logic
  const filteredPackets = packets.filter((p) => {
    const q = filterText.trim().toLowerCase();
    if (!q) return true;

    // Wireshark filter syntax matches
    if (q.includes('ip.addr ==') || q.includes('ip.addr==')) {
      const targetIp = q.split('==')[1]?.trim().replace(/['"]/g, '');
      return p.sourceIp.includes(targetIp) || p.destIp.includes(targetIp);
    }
    if (q.includes('tcp.flags.syn == 1') && q.includes('tcp.flags.ack == 0')) {
      return (
        p.protocol === 'TCP' &&
        p.flags?.includes('SYN') &&
        !p.flags?.includes('ACK')
      );
    }
    if (q.includes('http.request.method == "post"') || q.includes('http.request.method == \'post\'') || q.includes('http.request.method=="post"')) {
      return p.protocol === 'HTTP' && p.info.toUpperCase().includes('POST');
    }
    if (q.includes('frame contains') || q.includes('contains')) {
      const term = q.split('contains')[1]?.trim().replace(/['"]/g, '') || '';
      return (
        p.info.toLowerCase().includes(term) ||
        p.payloadAscii.toLowerCase().includes(term) ||
        (p.details.appPayload?.body && p.details.appPayload.body.toLowerCase().includes(term))
      );
    }

    // Generic fallback keyword filter
    return (
      p.protocol.toLowerCase().includes(q) ||
      p.sourceIp.includes(q) ||
      p.destIp.includes(q) ||
      p.info.toLowerCase().includes(q) ||
      p.payloadAscii.toLowerCase().includes(q)
    );
  });

  const selectedPacket = packets.find((p) => p.id === selectedPacketId) || packets[0];

  // Helper to get Wireshark style row color
  const getProtocolRowStyle = (protocol: string, isSelected: boolean, isAttack: boolean) => {
    if (isSelected) {
      return 'bg-blue-600 text-white font-medium';
    }
    if (isAttack) {
      return 'bg-red-950/40 text-red-300 hover:bg-red-900/40';
    }
    switch (protocol) {
      case 'HTTP':
        return 'bg-emerald-950/30 text-emerald-200 hover:bg-emerald-900/30';
      case 'TCP':
        return 'bg-sky-950/20 text-sky-200 hover:bg-sky-900/20';
      case 'DNS':
        return 'bg-indigo-950/30 text-indigo-200 hover:bg-indigo-900/30';
      case 'ARP':
        return 'bg-amber-950/25 text-amber-200 hover:bg-amber-900/25';
      case 'TLSv1.3':
        return 'bg-purple-950/25 text-purple-200 hover:bg-purple-900/25';
      default:
        return 'hover:bg-neutral-900 text-neutral-300';
    }
  };

  const handleCopyStream = () => {
    const streamContent = `Client Request:
POST /api/v1/auth/login HTTP/1.1
Host: acme-corp.internal
User-Agent: Mozilla/5.0 (X11; Linux x86_64)
Content-Type: application/x-www-form-urlencoded
Content-Length: 42

username=admin'--&password=super_secret_pass

Server Response:
HTTP/1.1 200 OK
Server: Apache/2.4.52 (Ubuntu)
Set-Cookie: session=root_admin_token_998; Path=/
Content-Type: application/json

{"status":"authenticated","user":"admin","role":"SUPERADMIN","secret":"sk_live_acme_master_99218"}`;
    navigator.clipboard.writeText(streamContent);
    setCopiedStream(true);
    setTimeout(() => setCopiedStream(false), 2000);
  };

  return (
    <div className="flex-1 w-full h-full min-h-0 overflow-hidden flex flex-col bg-[#0b0f19]">
      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden px-3 py-2 bg-[#0e1424] border-b border-[#1e293b] flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center p-1 bg-slate-950/80 border border-slate-800 rounded-xl w-full gap-1">
          <button
            onClick={() => {
              sound.playClick();
              setMobileTab('handshake');
            }}
            className={`flex-1 py-2 px-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
              mobileTab === 'handshake'
                ? 'bg-blue-600/30 text-blue-200 border border-blue-500/60 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>Bắt Tay TCP</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setMobileTab('packets');
            }}
            className={`flex-1 py-2 px-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
              mobileTab === 'packets'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/60 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Gói Tin ({filteredPackets.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setMobileTab('details');
            }}
            className={`flex-1 py-2 px-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
              mobileTab === 'details'
                ? 'bg-purple-950/80 text-purple-200 border border-purple-500/60 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>OSI & Hex</span>
          </button>
        </div>
      </div>

      {/* 1. KHUNG TRỰC QUAN HÓA BẮT TAY 3 BƯỚC */}
      <div
        className={`p-3 sm:p-3.5 bg-[#0e1628] border-b border-[#1e293b] shrink-0 select-none shadow-sm ${
          mobileTab === 'handshake' ? 'block' : 'hidden md:block'
        }`}
      >
        <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wide">
              Trực Quan Hóa Bắt Tay 3 Bước (TCP 3-Way Handshake)
            </span>
            <span className="text-xs font-mono text-slate-400 border border-slate-700 bg-slate-900 rounded-lg px-2 py-0.5">
              RFC 793
            </span>
          </div>

          {/* Handshake Playback Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleStartHandshake}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Chạy Lại Bắt Tay</span>
            </button>

            <button
              onClick={handleNextStep}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-all cursor-pointer active:scale-95"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>Bước Kế Tiếp</span>
            </button>

            {/* Speed toggle: 1x / 2x */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
              <button
                onClick={() => setAnimationSpeed(1)}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  animationSpeed === 1 ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                1x
              </button>
              <button
                onClick={() => setAnimationSpeed(2)}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  animationSpeed === 2 ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                2x
              </button>
            </div>
          </div>
        </div>

        {/* Animated Wire Visualization Canvas */}
        <div className="relative bg-[#070b14] border border-[#1e293b] rounded-xl p-3 overflow-hidden shadow-inner">
          <div className="flex items-center justify-between relative z-10 gap-2">
            {/* Entity 1: Client Left */}
            <div className="w-36 sm:w-48 bg-[#0f172a] border border-slate-800 rounded-xl p-2 sm:p-2.5 flex items-center gap-2 shadow-md shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-950/80 border border-blue-500/50 flex items-center justify-center text-blue-400 shrink-0">
                <Laptop className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-100 truncate">Client Host</div>
                <div className="text-[11px] font-mono text-blue-400 font-bold truncate">192.168.1.50</div>
                <div className="text-[10px] font-mono text-slate-400">
                  State: <span className="font-bold text-emerald-400">{handshakeStep === 3 ? 'ESTABLISHED' : 'SYN_SENT'}</span>
                </div>
              </div>
            </div>

            {/* Middle: Transmission Wire with animated packet */}
            <div className="flex-1 mx-2 sm:mx-4 relative h-14 flex items-center">
              {/* Wire physical line */}
              <div className="w-full h-1 bg-slate-800 rounded-full relative">
                <div className="absolute inset-0 bg-blue-500/30 rounded-full" />
              </div>

              {/* Animated flying packet packet tag */}
              <div
                className="absolute top-1/2 -translate-y-1/2 transition-all duration-100 ease-out z-20"
                style={{
                  left:
                    handshakeStep === 1 || handshakeStep === 3
                      ? `${packetProgress}%`
                      : `${100 - packetProgress}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold whitespace-nowrap shadow-lg flex items-center gap-1.5 border ${
                    handshakeStep === 1
                      ? 'bg-blue-900 border-blue-400 text-blue-100 shadow-blue-950/60'
                      : handshakeStep === 2
                      ? 'bg-purple-900 border-purple-400 text-purple-100 shadow-purple-950/60'
                      : 'bg-emerald-900 border-emerald-400 text-emerald-100 shadow-emerald-950/60'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  <span>
                    {handshakeStep === 1 && 'Gói 1: [SYN] Seq=0'}
                    {handshakeStep === 2 && 'Gói 2: [SYN, ACK] Seq=0 Ack=1'}
                    {handshakeStep === 3 && 'Gói 3: [ACK] Seq=1 Ack=1'}
                  </span>
                </div>
              </div>
            </div>

            {/* Entity 2: Web Server Right */}
            <div className="w-36 sm:w-48 bg-[#0f172a] border border-slate-800 rounded-xl p-2 sm:p-2.5 flex items-center gap-2 shadow-md shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-950/80 border border-purple-500/50 flex items-center justify-center text-purple-400 shrink-0">
                <Server className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-100 truncate">Web Server</div>
                <div className="text-[11px] font-mono text-purple-400 font-bold truncate">10.0.0.1:80</div>
                <div className="text-[10px] font-mono text-slate-400">
                  State: <span className="font-bold text-emerald-400">{handshakeStep === 1 ? 'LISTEN' : handshakeStep === 2 ? 'SYN_RCVD' : 'ESTABLISHED'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stepper Status Bar explanation */}
          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400 flex-wrap gap-2">
            <div className="flex items-center gap-2 font-bold text-xs">
              <span className={handshakeStep === 1 ? 'text-blue-300' : 'text-slate-600'}>
                1. SYN
              </span>
              <span>➔</span>
              <span className={handshakeStep === 2 ? 'text-purple-300' : 'text-slate-600'}>
                2. SYN-ACK
              </span>
              <span>➔</span>
              <span className={handshakeStep === 3 ? 'text-emerald-300' : 'text-slate-600'}>
                3. ACK
              </span>
            </div>
            <span className="text-emerald-400 flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {handshakeStep === 3 ? 'Kênh truyền dữ liệu đã sẵn sàng' : 'Đang thiết lập phiên TCP'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. BẢNG DANH SÁCH GÓI TIN BẮT ĐƯỢC (Wireshark Packet List Table) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Wireshark Display Filter Bar with Suggestions */}
        <div className="px-3 sm:px-4 py-2.5 bg-[#0e1628] border-b border-[#1e293b] flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex-1 min-w-[280px] flex items-center bg-[#070b14] border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-mono focus-within:border-emerald-500 transition-colors shadow-sm">
            <Filter className="w-4 h-4 text-emerald-400 mr-2 shrink-0" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder='Lọc gói tin ... vd: ip.addr == 192.168.1.50 hoặc frame contains "password"'
              className="w-full bg-transparent outline-none text-white text-xs sm:text-sm"
            />
            {filterText && (
              <button
                onClick={() => setFilterText('')}
                className="text-slate-400 hover:text-white ml-2 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
            <span className="text-slate-400 text-xs font-bold shrink-0">Lọc nhanh:</span>
            <button
              onClick={() => setFilterText('ip.addr == 192.168.1.50')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:border-blue-500 hover:text-blue-200 transition-colors shrink-0 font-bold cursor-pointer"
            >
              ip.addr == 192.168.1.50
            </button>
            <button
              onClick={() => setFilterText('tcp.flags.syn == 1 && tcp.flags.ack == 0')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:border-amber-500 hover:text-amber-200 transition-colors shrink-0 font-bold cursor-pointer"
              title="Phát hiện quét cổng SYN scan"
            >
              tcp.flags.syn == 1
            </button>
            <button
              onClick={() => setFilterText('http.request.method == "POST"')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:border-emerald-500 hover:text-emerald-200 transition-colors shrink-0 font-bold cursor-pointer"
            >
              http.request.method == &quot;POST&quot;
            </button>
            <button
              onClick={() => setFilterText('frame contains "password"')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:border-red-500 hover:text-red-200 transition-colors shrink-0 font-bold cursor-pointer"
            >
              contains &quot;password&quot;
            </button>
          </div>

          {/* Follow TCP Stream Action Button */}
          <button
            onClick={() => setIsFollowStreamOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer shrink-0 active:scale-95"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Follow TCP Stream</span>
            <span className="sm:hidden">Stream</span>
          </button>
        </div>

        {/* Packet Table Stream */}
        <div
          className={`overflow-y-auto border-b border-[#1e293b] bg-[#070b14] ${
            mobileTab === 'packets' ? 'flex-1' : 'hidden md:block md:h-[40%]'
          }`}
        >
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[620px] text-left font-mono text-xs border-collapse select-none">
              <thead className="bg-[#0e1628] text-slate-300 sticky top-0 border-b border-[#1e293b] text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-2 px-3 w-12">No.</th>
                  <th className="py-2 px-3 w-20">Time</th>
                  <th className="py-2 px-3 w-36">Source</th>
                  <th className="py-2 px-3 w-36">Destination</th>
                  <th className="py-2 px-3 w-24">Protocol</th>
                  <th className="py-2 px-3 w-16 text-right">Length</th>
                  <th className="py-2 px-3">Info</th>
                </tr>
              </thead>
              <tbody>
                {filteredPackets.map((pkt) => {
                  const isSelected = pkt.id === selectedPacketId;
                  const isAttack =
                    pkt.info.includes('SQL INJECTION') ||
                    pkt.info.includes('EXPLOIT') ||
                    pkt.info.includes('Scan') ||
                    pkt.info.includes('Spoofing');

                  const rowColorClass = getProtocolRowStyle(pkt.protocol, isSelected, isAttack);

                  return (
                    <tr
                      key={pkt.id}
                      onClick={() => {
                        setSelectedPacketId(pkt.id);
                        if (window.innerWidth < 768) {
                          setMobileTab('details');
                        }
                      }}
                      className={`cursor-pointer transition-colors border-b border-black/20 ${rowColorClass}`}
                    >
                      <td className="py-2 px-3 text-slate-300 font-bold">{pkt.id}</td>
                      <td className="py-2 px-3 tabular-nums">{pkt.time}</td>
                      <td className="py-2 px-3 truncate">{pkt.sourceIp}</td>
                      <td className="py-2 px-3 truncate">{pkt.destIp}</td>
                      <td className="py-2 px-3 font-bold">{pkt.protocol}</td>
                      <td className="py-2 px-3 text-right tabular-nums">{pkt.length}</td>
                      <td className="py-2 px-3 truncate">{pkt.info}</td>
                    </tr>
                  );
                })}
                {filteredPackets.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 font-sans text-xs sm:text-sm">
                      Không có gói tin nào khớp với bộ lọc &quot;{filterText}&quot;. Hãy thử nhấn một gợi ý lọc phía trên.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. KHUNG CHI TIẾT GÓI TIN & HEX DUMP (Bottom Half) */}
        <div
          className={`overflow-hidden bg-[#0c1222] flex-col md:flex-row ${
            mobileTab === 'details' ? 'flex-1 flex' : 'hidden md:flex md:h-[60%]'
          }`}
        >
          {/* Layer Accordion Tree (Frame ➔ Ethernet ➔ IP ➔ TCP ➔ HTTP) */}
          <div className="w-full md:w-1/2 h-full border-r border-[#1e293b] overflow-y-auto p-3 sm:p-4 text-xs sm:text-sm font-mono space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-300 uppercase tracking-wide">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>Mổ Xẻ Các Tầng Gói Tin #{selectedPacket.id}</span>
              </div>
              <button
                onClick={() => setIsFollowStreamOpen(true)}
                className="text-xs text-blue-400 hover:text-blue-300 underline font-sans font-bold cursor-pointer"
              >
                Xem luồng TCP Stream
              </button>
            </div>

            {/* Frame Layer */}
            <div className="border border-slate-800 rounded-xl bg-[#0f172a] overflow-hidden shadow-sm">
              <button
                onClick={() => toggleSection('frame')}
                className="w-full px-3 py-2 flex items-center justify-between text-left text-slate-200 hover:bg-slate-800/60 cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  {expandedSections.frame ? (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="font-bold text-slate-100 truncate">
                    {selectedPacket.details.frame}
                  </span>
                </div>
              </button>
            </div>

            {/* Ethernet II */}
            <div className="border border-slate-800 rounded-xl bg-[#0f172a] overflow-hidden shadow-sm">
              <button
                onClick={() => toggleSection('ethernet')}
                className="w-full px-3 py-2 flex items-center justify-between text-left text-slate-200 hover:bg-slate-800/60 cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  {expandedSections.ethernet ? (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="font-bold text-slate-100 truncate">
                    Ethernet II, Src: {selectedPacket.details.ethernet.srcMac}, Dst:{' '}
                    {selectedPacket.details.ethernet.dstMac}
                  </span>
                </div>
              </button>
              {expandedSections.ethernet && (
                <div className="px-5 py-2.5 text-xs text-slate-300 border-t border-slate-800 space-y-1 bg-black/40">
                  <div>Destination: <span className="font-bold text-slate-100">{selectedPacket.details.ethernet.dstMac}</span></div>
                  <div>Source: <span className="font-bold text-slate-100">{selectedPacket.details.ethernet.srcMac}</span></div>
                  <div>Type: <span className="font-bold text-blue-400">{selectedPacket.details.ethernet.type}</span></div>
                </div>
              )}
            </div>

            {/* IP Layer */}
            <div className="border border-slate-800 rounded-xl bg-[#0f172a] overflow-hidden shadow-sm">
              <button
                onClick={() => toggleSection('ip')}
                className="w-full px-3 py-2 flex items-center justify-between text-left text-slate-200 hover:bg-slate-800/60 cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  {expandedSections.ip ? (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="font-bold text-slate-100 truncate">
                    Internet Protocol Version {selectedPacket.details.ipHeader.version}, Src:{' '}
                    {selectedPacket.sourceIp}, Dst: {selectedPacket.destIp}
                  </span>
                </div>
              </button>
              {expandedSections.ip && (
                <div className="px-5 py-2.5 text-xs text-slate-300 border-t border-slate-800 space-y-1 bg-black/40">
                  <div>Version: {selectedPacket.details.ipHeader.version}</div>
                  <div>Header Length: {selectedPacket.details.ipHeader.headerLength} bytes</div>
                  <div>Time to Live (TTL): {selectedPacket.details.ipHeader.ttl}</div>
                  <div>Protocol: {selectedPacket.details.ipHeader.protocolNum} ({selectedPacket.protocol})</div>
                  <div>Header Checksum: <span className="text-emerald-400 font-bold">{selectedPacket.details.ipHeader.checksum} [Correct]</span></div>
                </div>
              )}
            </div>

            {/* Transport Layer */}
            <div className="border border-slate-800 rounded-xl bg-[#0f172a] overflow-hidden shadow-sm">
              <button
                onClick={() => toggleSection('transport')}
                className="w-full px-3 py-2 flex items-center justify-between text-left text-slate-200 hover:bg-slate-800/60 cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  {expandedSections.transport ? (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="font-bold text-slate-100 truncate">
                    Transmission Control Protocol, Src Port: {selectedPacket.sourcePort}, Dst Port:{' '}
                    {selectedPacket.destPort}
                  </span>
                </div>
              </button>
              {expandedSections.transport && (
                <div className="px-5 py-2.5 text-xs text-slate-300 border-t border-slate-800 space-y-1 bg-black/40">
                  <div>Source Port: <span className="text-blue-400 font-bold">{selectedPacket.sourcePort}</span></div>
                  <div>Destination Port: <span className="text-purple-400 font-bold">{selectedPacket.destPort}</span></div>
                  <div>Flags: <span className="text-amber-400 font-bold">{selectedPacket.details.transportHeader.flagsStr}</span></div>
                  {selectedPacket.seq !== undefined && <div>Sequence Number: {selectedPacket.seq}</div>}
                  {selectedPacket.ack !== undefined && <div>Acknowledgment Number: {selectedPacket.ack}</div>}
                  <div>Window Size: {selectedPacket.details.transportHeader.windowSize}</div>
                </div>
              )}
            </div>

            {/* Application Payload */}
            {selectedPacket.details.appPayload && (
              <div className="border border-slate-800 rounded-xl bg-[#0f172a] overflow-hidden shadow-sm">
                <button
                  onClick={() => toggleSection('app')}
                  className="w-full px-3 py-2 flex items-center justify-between text-left text-slate-200 hover:bg-slate-800/60 cursor-pointer"
                >
                  <div className="flex items-center gap-2 truncate">
                    {expandedSections.app ? (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span className="font-bold text-amber-300 truncate">
                      Hypertext Transfer Protocol / Payload Data
                    </span>
                  </div>
                </button>
                {expandedSections.app && (
                  <div className="px-5 py-2.5 text-xs text-slate-300 border-t border-slate-800 space-y-1 bg-black/40">
                    {selectedPacket.details.appPayload.rawHeaders && (
                      <div className="text-slate-400 font-mono text-xs">
                        {Object.entries(selectedPacket.details.appPayload.rawHeaders).map(
                          ([k, v]) => (
                            <div key={k}>
                              <span className="text-slate-500 font-bold">{k}:</span> {v}
                            </div>
                          )
                        )}
                      </div>
                    )}
                    {selectedPacket.details.appPayload.body && (
                      <div className="p-2.5 bg-black/80 border border-slate-800 rounded-lg text-amber-200 break-all font-mono font-bold">
                        {selectedPacket.details.appPayload.body}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hex & ASCII Representation */}
          <div className="w-full md:w-1/2 h-full overflow-y-auto p-3 sm:p-4 text-xs font-mono bg-[#070b14] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-300 uppercase tracking-wide mb-2 shrink-0">
              <div className="flex items-center gap-2">
                <Binary className="w-4 h-4 text-emerald-400" />
                <span>Hexadecimal Byte Dump & ASCII</span>
              </div>
              <span className="text-slate-400 text-xs font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Length: {selectedPacket.length} bytes
              </span>
            </div>

            <div className="flex-1 bg-black border border-slate-800 rounded-xl p-3 overflow-x-auto text-xs leading-relaxed shadow-inner">
              <div className="text-slate-500 mb-1 select-none text-xs font-bold">
                Offset (h)  00 01 02 03 04 05 06 07  08 09 0A 0B 0C 0D 0E 0F  ASCII
              </div>
              <div className="text-emerald-400 font-mono whitespace-pre select-text">
                00000000    {selectedPacket.payloadHex.slice(0, 48)}    |{selectedPacket.payloadAscii.slice(0, 16)}|
              </div>
              {selectedPacket.payloadHex.length > 48 && (
                <div className="text-emerald-400 font-mono whitespace-pre select-text">
                  00000010    {selectedPacket.payloadHex.slice(48, 96)}    |{selectedPacket.payloadAscii.slice(16, 32)}|
                </div>
              )}
              {selectedPacket.payloadHex.length > 96 && (
                <div className="text-emerald-400 font-mono whitespace-pre select-text">
                  00000020    {selectedPacket.payloadHex.slice(96)}    |{selectedPacket.payloadAscii.slice(32)}|
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. MODAL FOLLOW TCP STREAM (Wireshark Classic Red / Blue Window) */}
      {isFollowStreamOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6">
          <div className="w-full max-w-4xl bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl flex flex-col h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-4 py-3 bg-[#0e1628] border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-red-400" />
                <h3 className="text-xs sm:text-sm font-bold text-white font-mono">
                  Wireshark · Follow TCP Stream (Stream #0)
                </h3>
                <span className="text-xs font-mono text-slate-300 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-lg">
                  192.168.1.50:49152 ⇄ 10.0.0.1:80
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyStream}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg border border-slate-600 flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedStream ? 'Đã sao chép!' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => setIsFollowStreamOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stream Content Viewport */}
            <div className="flex-1 p-4 bg-[#0a0a0d] overflow-y-auto font-mono text-xs leading-relaxed select-text space-y-4">
              {/* Red: Client Request Payload */}
              <div className="p-3 bg-red-950/20 border border-red-900/40 rounded text-red-400">
                <div className="text-[10px] text-red-500 font-bold uppercase tracking-wider mb-1 select-none flex items-center justify-between">
                  <span>[Client Data: 192.168.1.50:49152 ➔ 10.0.0.1:80 (396 bytes)]</span>
                  <span>HTTP POST</span>
                </div>
                <div className="whitespace-pre-wrap">
                  {`POST /api/v1/auth/login HTTP/1.1
Host: acme-corp.internal
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Content-Type: application/x-www-form-urlencoded
Content-Length: 42
Origin: http://acme-corp.internal
Connection: keep-alive
Referer: http://acme-corp.internal/login

username=admin'--&password=super_secret_pass`}
                </div>
              </div>

              {/* Blue: Server Response Payload */}
              <div className="p-3 bg-blue-950/20 border border-blue-900/40 rounded text-blue-400">
                <div className="text-[10px] text-blue-500 font-bold uppercase tracking-wider mb-1 select-none flex items-center justify-between">
                  <span>[Server Response: 10.0.0.1:80 ➔ 192.168.1.50:49152 (522 bytes)]</span>
                  <span>HTTP 200 OK</span>
                </div>
                <div className="whitespace-pre-wrap">
                  {`HTTP/1.1 200 OK
Date: Wed, 21 Oct 2026 07:44:12 GMT
Server: Apache/2.4.52 (Ubuntu)
Set-Cookie: session=root_admin_token_998; Path=/; HttpOnly
Content-Type: application/json
Content-Length: 148
Connection: close

{
  "status": "authenticated",
  "user": "admin",
  "role": "SUPERADMIN",
  "secret": "sk_live_acme_master_99218",
  "message": "Welcome back Super Administrator"
}`}
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="px-4 py-2 bg-[#18181c] border-t border-[#27272a] flex items-center justify-between text-xs font-mono text-neutral-400 shrink-0">
              <div className="flex items-center gap-4">
                <span>
                  Entire conversation: <strong className="text-white">918 bytes</strong>
                </span>
                <span className="text-red-400">Client: 396 B</span>
                <span className="text-blue-400">Server: 522 B</span>
              </div>
              <button
                onClick={() => setIsFollowStreamOpen(false)}
                className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs transition-colors"
              >
                Đóng Cửa Sổ (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
