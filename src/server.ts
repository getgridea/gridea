import express from 'express'
import http from 'http'
import { AddressInfo } from 'net'

export default function initServer(SitePath: string) {
  const server = express()
  server.use(express.static(SitePath))
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
