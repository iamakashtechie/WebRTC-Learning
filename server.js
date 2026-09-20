const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;

// Create standard HTTP server
const server = http.createServer((req, res) => {
  // Global CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. Long Polling Endpoint
  if (req.url === '/poll') {
    console.log(`[${new Date().toLocaleTimeString()}] [Long Polling] Client connected to /poll - waiting...`);

    const timer = setTimeout(() => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          success: true,
          message: 'Hello from Long Polling!',
          timestamp: new Date().toISOString(),
        })
      );
      console.log(`[${new Date().toLocaleTimeString()}] [Long Polling] Response delivered.`);
    }, 3000);

    req.on('close', () => clearTimeout(timer));
    return;
  }

  // 2. Server-Sent Events (SSE) Endpoint
  if (req.url === '/events') {
    console.log(`[${new Date().toLocaleTimeString()}] [SSE] Client connected to /events`);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    res.write(`data: ${JSON.stringify({ message: 'SSE Connection Established', timestamp: new Date().toISOString() })}\n\n`);

    let counter = 1;
    const interval = setInterval(() => {
      const payload = {
        id: counter++,
        message: 'Real-time update from server via SSE',
        timestamp: new Date().toISOString(),
      };
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
      console.log(`[${new Date().toLocaleTimeString()}] [SSE] Pushed event #${payload.id}`);
    }, 2000);

    req.on('close', () => {
      console.log(`[${new Date().toLocaleTimeString()}] [SSE] Client disconnected.`);
      clearInterval(interval);
      res.end();
    });
    return;
  }

  // 3. Serve Frontend Testing Dashboard (public/index.html)
  const filePath = req.url === '/' ? path.join(__dirname, 'public', 'index.html') : path.join(__dirname, 'public', req.url);

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
    };

    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(content);
  });
});

// 4. WebSocket Server (attached to the same HTTP server)
const wss = new WebSocket.Server({ server });

wss.on('connection', (socket, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log(`[${new Date().toLocaleTimeString()}] [WebSocket] Client connected from ${clientIp}`);

  socket.send(
    JSON.stringify({
      type: 'WELCOME',
      message: 'Welcome to the WebSocket server! Connection is live.',
      timestamp: new Date().toISOString(),
    })
  );

  socket.on('message', (data) => {
    const rawMessage = data.toString();
    console.log(`[${new Date().toLocaleTimeString()}] [WebSocket] Received: ${rawMessage}`);

    socket.send(
      JSON.stringify({
        type: 'ECHO_RESPONSE',
        received: rawMessage,
        serverTime: new Date().toISOString(),
      })
    );
  });

  socket.on('close', () => {
    console.log(`[${new Date().toLocaleTimeString()}] [WebSocket] Client disconnected.`);
  });

  socket.on('error', (err) => {
    console.error(`[${new Date().toLocaleTimeString()}] [WebSocket] Socket error:`, err.message);
  });
});

// Start unified server
server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Unified RTC Server running on port ${PORT}`);
  console.log(`📊 UI Dashboard : http://localhost:${PORT}`);
  console.log(`🔄 Long Polling : http://localhost:${PORT}/poll`);
  console.log(`📡 SSE Stream   : http://localhost:${PORT}/events`);
  console.log(`⚡ WebSocket    : ws://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
