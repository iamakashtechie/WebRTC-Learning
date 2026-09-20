/**
 * WebSocket Server Example
 * 
 * Concept:
 * 1. Client initiates an HTTP request with `Upgrade: websocket` headers (Handshake).
 * 2. Server accepts and upgrades the connection to the WebSocket protocol (ws:// or wss://).
 * 3. A persistent, full-duplex TCP connection is established.
 * 4. Both client and server can send and receive lightweight frames at any time with minimal overhead.
 * 
 * Bidirectional: Client <---> Server
 * Learning Reference: Chai aur Code
 */

const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;
const server = new WebSocket.Server({ port: PORT });

server.on('connection', (socket, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log(`[${new Date().toLocaleTimeString()}] New WebSocket client connected from ${clientIp}`);

  // Send a welcome message to newly connected client
  socket.send(
    JSON.stringify({
      type: 'WELCOME',
      message: 'Welcome to the WebSocket server! Connection is live.',
      timestamp: new Date().toISOString(),
    })
  );

  // Listen for messages from the client
  socket.on('message', (data) => {
    const rawMessage = data.toString();
    console.log(`[${new Date().toLocaleTimeString()}] Received from client: ${rawMessage}`);

    // Echo back or respond to client
    const response = {
      type: 'ECHO_RESPONSE',
      received: rawMessage,
      serverTime: new Date().toISOString(),
    };

    socket.send(JSON.stringify(response));
  });

  // Handle client disconnection
  socket.on('close', () => {
    console.log(`[${new Date().toLocaleTimeString()}] WebSocket client disconnected.`);
  });

  // Handle errors
  socket.on('error', (err) => {
    console.error(`[${new Date().toLocaleTimeString()}] Socket error:`, err.message);
  });
});

console.log(`WebSocket server is listening on port ${PORT} => ws://localhost:${PORT}`);