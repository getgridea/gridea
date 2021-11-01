import express from 'express'

export default function initServer() {
  const app = express()
  let server: any = null

  function listen(port: number) {
    server = app.listen(port, 'localhost').on('error', (err: NodeJS.ErrnoException) => {
      if (err) {
        if (err.message === 'getaddrinfo ENOTFOUND localhost') {
          // Fixed: 修复渲染服务在找不到 localhost 时崩溃问题
          console.log('\x1B[31m%s\x1B[0m', 'Localhost is not found so that the preview server is not working. Please check your hosts file and then restart the application.')
        } else {
          console.log(`Preview server port ${port} is busy, trying with port ${port + 1}`)
          listen(port + 1)
        }
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
