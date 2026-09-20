const WebSocket = require('ws')

const server = new WebSocket.Server({ port: 3000 })

server.on('connection', (socket) => {
  console.log('Client connected')

  socket.send('Welcome to the WebSocket server!')

  socket.on('message', (message) => {
    // console.log(`Received message: ${message}`)
    console.log(message)
    // socket.send(`Echo: ${message}`)
    socket.send("Hello from server")
  })
})

console.log(`WebSocket server is listening on port 3000 => ws://localhost:3000`)