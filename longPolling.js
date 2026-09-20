/**
 * Long Polling Server Example
 * 
 * Concept:
 * 1. Client sends an HTTP request to the server.
 * 2. Instead of responding immediately, the server HOLDS the connection open
 *    until new data is available or a timeout occurs (simulated here with setTimeout).
 * 3. Once data is ready, server responds and terminates the HTTP connection.
 * 4. Client receives the response, processes the data, and IMMEDIATELY sends a new request.
 * 
 * Learning Reference: Chai aur Code
 */

const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {
  // Enable CORS for browser client testing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/poll') {
    console.log(`[${new Date().toLocaleTimeString()}] Client connected to /poll - holding connection...`);

    // Simulate waiting for an event / new data (3 seconds delay)
    const timer = setTimeout(() => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      });
      res.end(
        JSON.stringify({
          success: true,
          message: `Hello from Long Polling!`,
          timestamp: new Date().toISOString(),
        })
      );
      console.log(`[${new Date().toLocaleTimeString()}] Responded to client and closed connection.`);
    }, 3000);

    // Clean up timer if client disconnects early
    req.on('close', () => {
      clearTimeout(timer);
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Server is running. Send a GET request to /poll to test long polling.');
  }
});

server.listen(PORT, () => {
  console.log(`Long Polling server running at http://localhost:${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/poll`);
});