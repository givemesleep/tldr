import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { createRequire } from 'module';
import { getCommandInfo, tldrReady } from './man.js';
import { SYSADMIN_COMMANDS, BEST_PRACTICES } from './sysadmin.js';
import cors from 'cors';
import os from 'os';

// node-pty is a native CJS module — must load via require() in ESM/tsx context
const require = createRequire(import.meta.url);
const pty = require('node-pty') as typeof import('node-pty');

const MAX_SESSIONS = 10;
let activeSessions = 0;

// Lock CORS to the client origin; override with CLIENT_ORIGIN env var in production
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const app = express();
app.use(cors({ origin: allowedOrigin }));

app.get('/api/sysadmin', (_req, res) => {
  res.json(SYSADMIN_COMMANDS);
});

app.get('/api/command/:name', async (req, res) => {
  const { name } = req.params;
  if (!/^[a-zA-Z0-9._+-]+$/.test(name)) return res.status(400).json({ error: 'Invalid command name' });
  try {
    await tldrReady;
    const info = await getCommandInfo(name);
    if (!info) return res.status(404).json({ error: 'Command not found' });
    const bestPractices = BEST_PRACTICES[name] || [];
    res.json({ ...info, bestPractices });
  } catch (e) {
    res.status(500).json({ error: 'Internal error' });
  }
});

// WebSocket terminal
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer, path: '/terminal' });

wss.on('connection', (ws: WebSocket) => {
  // Enforce session cap to prevent resource exhaustion
  if (activeSessions >= MAX_SESSIONS) {
    ws.send('\r\n\x1b[31mServer busy: too many active terminal sessions.\x1b[0m\r\n');
    ws.close();
    return;
  }
  activeSessions++;

  const isWin = os.platform() === 'win32';
  const shell = isWin ? 'powershell.exe' : (process.env.SHELL || '/bin/bash');

  let ptyProcess: pty.IPty | null = null;
  try {
    ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-256color',
      cols: 80,
      rows: 24,
      cwd: process.env.HOME || process.cwd(),
      env: process.env as { [key: string]: string },
    });
  } catch (err) {
    ws.send('\r\n\x1b[31mFailed to start shell.\x1b[0m\r\n');
    ws.close();
    return;
  }

  ptyProcess.onData((data: string) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(data);
  });

  ptyProcess.onExit(() => {
    if (ws.readyState === WebSocket.OPEN) ws.close();
  });

  ws.on('message', (msg: Buffer) => {
    const raw = msg.toString();
    try {
      const parsed = JSON.parse(raw);
      if (parsed.type === 'resize' && ptyProcess) {
        ptyProcess.resize(parsed.cols, parsed.rows);
        return;
      }
    } catch { /* not JSON — treat as terminal input */ }
    ptyProcess?.write(raw);
  });

  ws.on('close', () => {
    activeSessions = Math.max(0, activeSessions - 1);
    ptyProcess?.kill();
    ptyProcess = null;
  });
});

const port = process.env.PORT || 3001;
httpServer.listen(port, () => {
  process.stdout.write(`Server running on http://localhost:${port}\n`);
});
