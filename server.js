const http = require('http');
const fs   = require('fs');
const path = require('path');
const WebSocket = require('ws');

// ── Static file server ───────────────────────────────────────────────────────
const HTML = path.join(__dirname, 'index.html');

const httpServer = http.createServer((req, res) => {
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    fs.readFile(HTML, (err, data) => {
      if (err) { res.writeHead(500); res.end('Server error'); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

// ── WebSocket server ─────────────────────────────────────────────────────────
const wss = new WebSocket.Server({ server: httpServer });

// rooms: Map<code, { players: [ws|null, ws|null] }>
const rooms = new Map();

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

function relay(room, sender, msg) {
  const json = JSON.stringify(msg);
  room.players.forEach(p => {
    if (p && p !== sender && p.readyState === WebSocket.OPEN) p.send(json);
  });
}

function cleanRoom(ws) {
  if (!ws.roomCode) return;
  const room = rooms.get(ws.roomCode);
  if (!room) return;
  relay(room, ws, { type: 'disconnected' });
  const idx = room.players.indexOf(ws);
  if (idx !== -1) room.players[idx] = null;
  if (room.players.every(p => !p)) rooms.delete(ws.roomCode);
}

wss.on('connection', ws => {
  ws.isAlive  = true;
  ws.roomCode = null;
  ws.pi       = -1;

  ws.on('pong', () => { ws.isAlive = true; });

  ws.on('message', raw => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    switch (msg.type) {

      // ── Create a new room ─────────────────────────────────────────────────
      case 'create': {
        let code;
        do { code = genCode(); } while (rooms.has(code));
        const room = { players: [ws, null] };
        rooms.set(code, room);
        ws.roomCode = code;
        ws.pi = 0;
        ws.send(JSON.stringify({ type: 'created', code }));
        break;
      }

      // ── Join an existing room ─────────────────────────────────────────────
      case 'join': {
        const code = (msg.code || '').toUpperCase().trim();
        const room = rooms.get(code);
        if (!room) {
          ws.send(JSON.stringify({ type: 'error', text: '방을 찾을 수 없습니다' }));
          return;
        }
        if (room.players[1]) {
          ws.send(JSON.stringify({ type: 'error', text: '방이 꽉 찼습니다' }));
          return;
        }
        room.players[1] = ws;
        ws.roomCode = code;
        ws.pi = 1;
        // Tell both clients to start
        room.players[0].send(JSON.stringify({ type: 'start', pi: 0 }));
        room.players[1].send(JSON.stringify({ type: 'start', pi: 1 }));
        break;
      }

      // ── Game action (relay to opponent) ───────────────────────────────────
      case 'act': {
        if (!ws.roomCode) return;
        const room = rooms.get(ws.roomCode);
        if (!room) return;
        relay(room, ws, { type: 'opp_act', act: msg.act });
        break;
      }
    }
  });

  ws.on('close',  () => cleanRoom(ws));
  ws.on('error', () => cleanRoom(ws));
});

// Keepalive ping/pong every 25 s (prevents idle disconnects on Render free tier)
const hbInterval = setInterval(() => {
  wss.clients.forEach(ws => {
    if (!ws.isAlive) { ws.terminate(); return; }
    ws.isAlive = false;
    ws.ping();
  });
}, 25_000);

wss.on('close', () => clearInterval(hbInterval));

// ── Listen ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Age of War server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
