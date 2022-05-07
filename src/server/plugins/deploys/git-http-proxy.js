'use strict'

const { HttpProxyAgent, HttpsProxyAgent } = require('hpagent')
const get = require('simple-get')

async function request({
  url, method, headers, body,
}) {
  body = await mergeBuffers(body)
  // const proxy = url.startsWith('https:')
  //   // ? { Agent: HttpsProxyAgent, url: process.env.https_proxy }
  //   // : { Agent: HttpProxyAgent, url: process.env.http_proxy }
  // const agent = proxy.url ? new proxy.Agent({ proxy: proxy.url }) : undefined
  const proxy = { Agent: HttpsProxyAgent }
  const agent = new proxy.Agent({ proxy: 'http://127.0.0.1:1081' })
  return new Promise((resolve, reject) => get({
    url, method, agent, headers, body,
  }, (err, res) => (err ? reject(err) : resolve(transformResponse(res)))))
}
async function mergeBuffers(data) {
  if (!Array.isArray(data)) return data
  if (data.length === 1 && data[0] instanceof Buffer) return data[0]
  const buffers = []
  let offset = 0
  let size = 0
  for await (const chunk of data) {
    buffers.push(chunk)
    size += chunk.byteLength
  }
  data = new Uint8Array(size)
  for (const buffer of buffers) {
    data.set(buffer, offset)
    offset += buffer.byteLength
  }
  return Buffer.from(data.buffer)
}
function transformResponse(res) {
  const {
    url, method, statusCode, statusMessage, headers,
  } = res
  return {
    url, method, statusCode, statusMessage, headers, body: res,
  }
}
module.exports = { request }
