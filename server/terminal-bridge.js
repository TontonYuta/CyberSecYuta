import http from 'http';
import { WebSocketServer } from 'ws';
import { spawn } from 'child_process';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');
const TUNNEL_INFO_FILE = path.resolve(__dirname, '.tunnel-info.json');

const PORT = 3001;
const HOST = '0.0.0.0'; // Binds to all network interfaces

// Detect all non-internal IPv4 addresses
function getNetworkIps() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push({ name, address: iface.address });
      }
    }
  }
  return ips;
}

const networkIps = getNetworkIps();
const primaryLanIp = networkIps[0]?.address || '127.0.0.1';

// Cloudflare Tunnel state
let cloudflaredProcess = null;
let activeTunnelUrl = null;

// Find cloudflared binary
function findCloudflaredBin() {
  const candidates = [
    path.join(os.homedir(), '.local/bin/cloudflared'),
    '/usr/local/bin/cloudflared',
    '/usr/bin/cloudflared',
  ];
  for (const binPath of candidates) {
    if (fs.existsSync(binPath)) {
      return binPath;
    }
  }
  return 'cloudflared'; // fallback to PATH
}

function startCloudflareTunnel() {
  const bin = findCloudflaredBin();
  console.log(`[Cloudflare Tunnel] Spawning quick tunnel via: ${bin}`);

  try {
    cloudflaredProcess = spawn(bin, ['tunnel', '--url', `http://127.0.0.1:${PORT}`]);

    const handleOutput = (data) => {
      const text = data.toString();
      // Match https://xxx.trycloudflare.com
      const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
      if (match && !activeTunnelUrl) {
        activeTunnelUrl = match[0];
        console.log(`\n======================================================`);
        console.log(`🌐 [Cloudflare Tunnel] Public Remote URL Ready:`);
        console.log(`   ${activeTunnelUrl}`);
        console.log(`   WebSocket: ${activeTunnelUrl.replace('https://', 'wss://')}/bash`);
        console.log(`======================================================\n`);

        try {
          fs.writeFileSync(
            TUNNEL_INFO_FILE,
            JSON.stringify({
              tunnelUrl: activeTunnelUrl,
              wsUrl: `${activeTunnelUrl.replace('https://', 'wss://')}/bash`,
              startedAt: new Date().toISOString(),
            }, null, 2)
          );
        } catch {
          // Ignore
        }
      }
    };

    cloudflaredProcess.stdout.on('data', handleOutput);
    cloudflaredProcess.stderr.on('data', handleOutput);

    cloudflaredProcess.on('exit', (code) => {
      console.log(`[Cloudflare Tunnel] Process exited with code ${code}`);
      activeTunnelUrl = null;
    });
  } catch (err) {
    console.warn('[Cloudflare Tunnel] Failed to start cloudflared:', err.message);
  }
}

// Basic MIME types dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

// 1. Create HTTP server for health-check, status info, and serving SPA
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const urlPath = req.url?.split('?')[0] || '/';

  // API status route
  if (urlPath === '/status' || urlPath === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'online',
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        user: os.userInfo().username,
        homeDir: os.homedir(),
        shell: process.env.SHELL || '/bin/bash',
        lanIp: primaryLanIp,
        allIps: networkIps,
        port: PORT,
        mobileUrl: `http://${primaryLanIp}:${PORT}`,
        wsUrl: `ws://${primaryLanIp}:${PORT}/bash`,
        tunnelUrl: activeTunnelUrl,
        tunnelWsUrl: activeTunnelUrl ? `${activeTunnelUrl.replace('https://', 'wss://')}/bash` : null,
        isTunnelActive: !!activeTunnelUrl,
        time: new Date().toISOString(),
      })
    );
    return;
  }

  // Static file serving from dist folder
  if (fs.existsSync(DIST_DIR)) {
    let filePath = path.join(DIST_DIR, urlPath === '/' ? 'index.html' : urlPath);

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(DIST_DIR, 'index.html');
    }

    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      try {
        const fileContent = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(fileContent);
        return;
      } catch (err) {
        console.error('File read error:', err.message);
      }
    }
  }

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>CyberSecYuta Terminal Bridge</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; background: #070b14; color: #f1f5f9; padding: 24px; text-align: center; }
          .card { max-width: 540px; margin: 40px auto; background: #0e1424; border: 1px solid #1e293b; border-radius: 12px; padding: 24px; }
          h2 { color: #10b981; margin-top: 0; }
          code { background: #000; padding: 3px 8px; border-radius: 6px; color: #38bdf8; font-size: 13px; }
          p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>✅ CyberSecYuta Remote Bridge & Tunnel Đang Hoạt Động</h2>
          <p>Máy chủ: <strong>${os.hostname()}</strong> (${os.userInfo().username})</p>
          <p>IP Wi-Fi LAN: <code>${primaryLanIp}:${PORT}</code></p>
          ${
            activeTunnelUrl
              ? `<p>Cloudflare Tunnel 4G/5G: <br><a href="${activeTunnelUrl}" style="color: #06b6d4; font-weight: bold; text-decoration: underline;" target="_blank">${activeTunnelUrl}</a></p>`
              : '<p>Đang kết nối Cloudflare Tunnel...</p>'
          }
        </div>
      </body>
    </html>
  `);
});

// 2. Attach WebSocket Server
const wss = new WebSocketServer({ server, path: '/bash' });

console.log(`[CyberSecYuta Bash Bridge] Initializing bridge on ${HOST}:${PORT}`);

wss.on('connection', (ws, req) => {
  const remoteAddress = req.socket.remoteAddress;
  console.log(`[CyberSecYuta] Client connected to real bash from ${remoteAddress}`);

  let currentWorkingDir = os.homedir();
  const shell = process.env.SHELL || '/bin/bash';

  // Send welcome handshake
  ws.send(
    JSON.stringify({
      type: 'handshake',
      message: `Đã kết nối trực tiếp với Bash máy tính (${os.userInfo().username}@${os.hostname()})`,
      cwd: currentWorkingDir,
      user: os.userInfo().username,
      hostname: os.hostname(),
      lanIp: primaryLanIp,
      tunnelUrl: activeTunnelUrl,
    })
  );

  // Spawn persistent bash process
  const bashProcess = spawn(shell, ['-i'], {
    env: { ...process.env, TERM: 'xterm-256color', PS1: '' },
    cwd: currentWorkingDir,
  });

  bashProcess.stdout.on('data', (data) => {
    ws.send(
      JSON.stringify({
        type: 'output',
        data: data.toString('utf8'),
      })
    );
  });

  bashProcess.stderr.on('data', (data) => {
    ws.send(
      JSON.stringify({
        type: 'stderr',
        data: data.toString('utf8'),
      })
    );
  });

  bashProcess.on('exit', (code) => {
    ws.send(
      JSON.stringify({
        type: 'exit',
        code,
        message: `Bash process exited with code ${code}`,
      })
    );
  });

  ws.on('message', (message) => {
    try {
      const payload = JSON.parse(message.toString());

      if (payload.type === 'command') {
        const cmd = payload.command;
        if (cmd === 'clear') {
          ws.send(JSON.stringify({ type: 'clear' }));
          return;
        }
        bashProcess.stdin.write(cmd + '\n');
      } else if (payload.type === 'raw') {
        bashProcess.stdin.write(payload.data);
      }
    } catch {
      bashProcess.stdin.write(message.toString() + '\n');
    }
  });

  ws.on('close', () => {
    console.log('[CyberSecYuta] Client disconnected. Terminating bash process.');
    bashProcess.kill();
  });

  ws.on('error', (err) => {
    console.error('[CyberSecYuta] WebSocket error:', err.message);
    bashProcess.kill();
  });
});

server.listen(PORT, HOST, () => {
  console.log(`\n======================================================`);
  console.log(`✅ [CyberSecYuta] Real Local Bash Bridge is LIVE!`);
  console.log(`   - Máy tính cục bộ: http://127.0.0.1:${PORT}`);
  console.log(`   - Điện thoại cùng Wi-Fi: http://${primaryLanIp}:${PORT}`);
  console.log(`======================================================\n`);

  // Start Cloudflare Tunnel automatically
  startCloudflareTunnel();
});

// Clean termination
const cleanup = () => {
  if (cloudflaredProcess) {
    cloudflaredProcess.kill();
  }
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
