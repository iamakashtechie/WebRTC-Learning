/**
 * Server-Sent Events (SSE) Server Example
 * 
 * Concept:
 * 1. Client initiates a persistent, unidirectional HTTP connection using `EventSource('/events')`.
 * 2. Server responds with HTTP 200 and Content-Type: `text/event-stream`.
 * 3. Connection stays OPEN continuously (`Connection: keep-alive`).
 * 4. Server pushes data chunks formatted as: `data: <content>\n\n`.
 * 5. If connection drops, modern browsers automatically attempt reconnection!
 * 
 * Unidirectional: Server -> Client only.
 * Learning Reference: Chai aur Code
 */

const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {
  // Set CORS headers for browser testing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  if (req.url === '/events') {
    console.log(`[${new Date().toLocaleTimeString()}] Client connected via SSE (/events)`);

    // Standard headers required for Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    // Send an initial handshake message
    res.write(`data: ${JSON.stringify({ message: 'SSE Connection Established', timestamp: new Date().toISOString() })}\n\n`);

    // Stream updates periodically every 2 seconds
    let counter = 1;
    const interval = setInterval(() => {
      const payload = {
        id: counter++,
        message: 'Real-time update from server via SSE',
        timestamp: new Date().toISOString(),
      };
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
      console.log(`[${new Date().toLocaleTimeString()}] Pushed SSE event #${payload.id}`);
    }, 2000);

    // Clean up when client disconnects
    req.on('close', () => {
      console.log(`[${new Date().toLocaleTimeString()}] SSE Client disconnected. Cleaning up interval.`);
      clearInterval(interval);
      res.end();
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Server is running. Connect to /events using EventSource for SSE.');
  }
});

server.listen(PORT, () => {
  console.log(`SSE server running at http://localhost:${PORT}`);
  console.log(`SSE endpoint: http://localhost:${PORT}/events`);
});