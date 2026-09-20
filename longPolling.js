const http = require('http')
const server = http.createServer((req, res) => {
  if (req.url === '/poll') {
    setTimeout(() => {
      res.writeHead(200, { 
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({ 
        message: `Hello from long polling! ${new Date().toISOString()}`
      }))
    }, 3000)
  } else {
    res.writeHead(200)
    res.end('Server is running. Use /poll for long polling.')
  }
})

server.listen(3000, () => {
  console.log(`Server is listening on port 3000 => http://localhost:3000`)
})