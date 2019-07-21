import express from 'express'

export default function createServer(SitePath: string) {
  const server = express()
  server.use(express.static(SitePath))
  server.listen(9999, () => console.log('Express listening on port 9999'))
}
