import express from 'express'

export default function initServer() {
  const server = express()
  function listen(port: number) {
    server.listen(port, 'localhost').on('error', (err: NodeJS.ErrnoException) => {
      if (err) {
        console.log(`Express port ${port} is busy, trying with port ${port + 1}`)
        listen(port + 1)
      }
    }).on('listening', () => {
      server.set('port', port)
      console.log(`Express server is running on port : ${port}`)
    })
  }
  listen(4000)
  return server
}
