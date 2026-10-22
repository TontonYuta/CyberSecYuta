export type ActiveTab = 'sandbox' | 'packets' | 'terminal' | 'soc' | 'roadmap' | 'ux_security';

export type ScenarioId = 'sqli' | 'cmd_injection' | 'idor' | 'xss';

export type SecurityMode = 'vulnerable' | 'patched';

export interface ScenarioPayload {
  id: string;
  label: string;
  payload: string;
  description: string;
  targetField?: string;
}

export interface ScenarioData {
  id: ScenarioId;
  index: string;
  title: string;
  cwe: string;
  owaspCategory: string;
  severity: 'Critical' | 'High' | 'Medium';
  cvss: number;
  shortDesc: string;
  fullDesc: string;
  impact: string;
  defenseOverview: string;
  urlDefault: string;
  urlPlaceholder: string;
  vulnerableCode: {
    language: string;
    filename: string;
    lines: { text: string; isVulnerable?: boolean; note?: string }[];
  };
  patchedCode: {
    language: string;
    filename: string;
    lines: { text: string; isPatched?: boolean; note?: string }[];
  };
  payloads: ScenarioPayload[];
  mockAppContext: {
    appTitle: string;
    category: string;
    serverHost: string;
    description: string;
  };
}

export interface ExecutionResult {
  status: 'idle' | 'success' | 'mitigated' | 'invalid';
  httpStatus: number;
  message: string;
  dataOutput?: any;
  rawConsole?: string[];
  cookieStolen?: string;
  flagRevealed?: string;
  defenseExplanation: string;
  timestamp: string;
}

// Packet Inspector types
export interface NetworkPacket {
  id: number;
  time: string;
  sourceIp: string;
  sourcePort: number;
  destIp: string;
  destPort: number;
  protocol: 'TCP' | 'HTTP' | 'TLSv1.3' | 'DNS' | 'ARP';
  length: number;
  info: string;
  flags?: string[];
  seq?: number;
  ack?: number;
  payloadHex: string;
  payloadAscii: string;
  details: {
    frame: string;
    ethernet: { srcMac: string; dstMac: string; type: string };
    ipHeader: { version: number; headerLength: number; ttl: number; protocolNum: number; checksum: string };
    transportHeader: { srcPort: number; dstPort: number; flagsStr: string; windowSize: number };
    appPayload?: { rawHeaders?: Record<string, string>; body?: string };
  };
}

// SOC Matrix types
export type LogSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface SocLogEvent {
  id: string;
  timestamp: string;
  source: 'WAF' | 'Syslog-Auth' | 'Snort-IDS' | 'Nginx-Access' | 'EDR-Agent' | 'CloudTrail';
  severity: LogSeverity;
  eventCategory: 'Authentication' | 'Web Attack' | 'Network Recon' | 'Privilege Escalation' | 'Data Exfiltration';
  sourceIp: string;
  destIp: string;
  destPort: number;
  user: string;
  message: string;
  rawLog: string;
  mitreTactic: string;
  mitreTechnique: string;
  status: 'unresolved' | 'investigating' | 'contained' | 'false_positive';
  iocDetails: {
    reputation: 'Malicious' | 'Suspicious' | 'Clean';
    country: string;
    asn: string;
    matchedPattern: string;
  };
}

// Roadmap types
export interface RoadmapMilestone {
  id: string;
  phase: string;
  title: string;
  weeks: string;
  summary: string;
  skills: { id: string; name: string; completed: boolean; description: string }[];
  labRecommendations: string[];
}
