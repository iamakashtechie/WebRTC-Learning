const http = require('http')
const server = http.createServer((req, res) => {
  if (req.url === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    })
    const interval = setInterval(() => {
      res.write(`data: ${new Date().toISOString()}\n\n`)
    }, 2000)

    req.on('close', () => {
      clearInterval(interval)
      res.end()
    })
  } else {
    res.writeHead(200)
    res.end('Server is running. Use /events for server-sent events.')
  }
})

server.listen(3000, () => {
  console.log(`Server is listening on port 3000 => http://localhost:3000`)
})