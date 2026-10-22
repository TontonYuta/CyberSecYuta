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

const PORT = 3001;
const HOST = '0.0.0.0'; // Binds to all network interfaces so mobile phones on the same Wi-Fi can connect

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

// Basic MIME types dictionary for static file serving
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

// 1. Create HTTP server for health-check, status info, and serving SPA for mobile
const server = http.createServer((req, res) => {
  // Enable full CORS for cross-origin mobile clients and local dev
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
        time: new Date().toISOString(),
      })
    );
    return;
  }

  // Static file serving from dist folder (if built)
  if (fs.existsSync(DIST_DIR)) {
    let filePath = path.join(DIST_DIR, urlPath === '/' ? 'index.html' : urlPath);

    // If file doesn't exist, fallback to index.html for SPA router
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
          .card { max-width: 500px; margin: 40px auto; background: #0e1424; border: 1px solid #1e293b; border-radius: 12px; padding: 24px; }
          h2 { color: #10b981; margin-top: 0; }
          code { background: #000; padding: 3px 8px; border-radius: 6px; color: #38bdf8; font-size: 14px; }
          p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>✅ CyberSecYuta Bash Bridge Đang Hoạt Động</h2>
          <p>Máy chủ: <strong>${os.hostname()}</strong> (${os.userInfo().username})</p>
          <p>IP Mạng Cục Bộ (Wi-Fi): <code>${primaryLanIp}</code></p>
          <p>Cổng (Port): <code>${PORT}</code></p>
          <p>Để dùng bash qua điện thoại, hãy mở CyberSecYuta trên điện thoại và chọn kết nối tới <code>${primaryLanIp}:${PORT}</code></p>
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

  // Handle incoming commands
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
  console.log(`   - Điện thoại kết nối qua Wi-Fi LAN:`);
  networkIps.forEach((ip) => {
    console.log(`     * http://${ip.address}:${PORT} (${ip.name})`);
  });
  console.log(`   - WebSocket: ws://${primaryLanIp}:${PORT}/bash`);
  console.log(`======================================================\n`);
});
