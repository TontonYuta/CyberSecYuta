import http from 'http';
import { WebSocketServer } from 'ws';
import { spawn } from 'child_process';
import os from 'os';

const PORT = 3001;
const HOST = '127.0.0.1'; // Binds to localhost only for security

// 1. Create HTTP server for health-check and status info
const server = http.createServer((req, res) => {
  // Enable CORS for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/status' || req.url === '/api/status') {
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
        time: new Date().toISOString(),
      })
    );
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('CyberSecYuta Local Terminal Bridge');
});

// 2. Attach WebSocket Server
const wss = new WebSocketServer({ server, path: '/bash' });

console.log(`[CyberSecYuta Bash Bridge] Initializing bridge on http://${HOST}:${PORT}`);

wss.on('connection', (ws, req) => {
  const remoteAddress = req.socket.remoteAddress;
  console.log(`[CyberSecYuta] Client connected to real bash from ${remoteAddress}`);

  let currentWorkingDir = os.homedir();
  const shell = process.env.SHELL || '/bin/bash';

  // Send welcome handshake
  ws.send(
    JSON.stringify({
      type: 'handshake',
      message: `Đã kết nối trực tiếp với Bash máy tính cục bộ (${os.userInfo().username}@${os.hostname()})`,
      cwd: currentWorkingDir,
      user: os.userInfo().username,
      hostname: os.hostname(),
    })
  );

  // Spawn a persistent bash process for this session
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

  // Handle incoming commands from frontend
  ws.on('message', (message) => {
    try {
      const payload = JSON.parse(message.toString());

      if (payload.type === 'command') {
        const cmd = payload.command;
        if (cmd === 'clear') {
          ws.send(JSON.stringify({ type: 'clear' }));
          return;
        }

        // Write command into the live bash process
        bashProcess.stdin.write(cmd + '\n');
      } else if (payload.type === 'raw') {
        bashProcess.stdin.write(payload.data);
      }
    } catch {
      // If raw text
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
  console.log(`✅ [CyberSecYuta] Real Local Bash Bridge is running at:`);
  console.log(`   - HTTP:      http://${HOST}:${PORT}/status`);
  console.log(`   - WebSocket: ws://${HOST}:${PORT}/bash`);
});
