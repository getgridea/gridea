import express from 'express'

let server: any = null

export default function initServer() {
  const app = express()
  function listen(port: number) {
    server = app.listen(port, 'localhost').on('error', (err: NodeJS.ErrnoException) => {
      if (err) {
        console.log(`Express port ${port} is busy, trying with port ${port + 1}`)
        listen(port + 1)
      }
    }).on('listening', () => {
      app.set('port', port)
      console.log(`Express server is running on port : ${port}`)
    })
  }
  listen(4000)
  return app
}

export const previewServer = server
