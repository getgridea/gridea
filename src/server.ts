import express from 'express'

export default function initServer() {
  const app = express()
  let server: any = null

  function listen(port: number) {
    server = app.listen(port, 'localhost').on('error', (err: NodeJS.ErrnoException) => {
      if (err) {
        console.log(`Preview server port ${port} is busy, trying with port ${port + 1}`)
        listen(port + 1)
      }
    }).on('listening', () => {
      app.set('port', port)
      console.log(`Preview server is running on port : ${port}`)
    })
  }

  listen(4000)

  return {
    server,
    app,
  }
}
