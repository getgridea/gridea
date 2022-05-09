import { IApplicationDb } from '../../interfaces/application'

const { HttpProxyAgent, HttpsProxyAgent } = require('hpagent')
const get = require('simple-get')

export default class GitProxy {
  db: IApplicationDb

  constructor(appInstance: any) {
    this.db = appInstance.db
    // console.log('instance git proxy',this.db.setting)
  }

  public async request({
    url,
    method,
    headers,
    body,
  }: {
    url: any;
    method: any;
    headers: any;
    body: any;
  }) {
    const { setting } = this.db
    body = await this.mergeBuffers(body)
    const proxy = url.startsWith('https:')
      ? { Agent: HttpsProxyAgent }
      : { Agent: HttpProxyAgent }
    const agent = setting.enabledProxy === 'proxy'
      ? new proxy.Agent({
        proxy: `http://${setting.proxyPath}:${setting.proxyPort}`,
      })
      : undefined
    // const agent = new proxy.Agent({ proxy: 'http://127.0.0.1:1081' })
    return new Promise((resolve, reject) => get(
      {
        url,
        method,
        agent,
        headers,
        body,
      },
      (err: any, res: any) => (err ? reject(err) : resolve(this.transformResponse(res))),
    ))
  }

  private async mergeBuffers(data: any[] | Uint8Array) {
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

  private async transformResponse(res: {
    url: any;
    method: any;
    statusCode: any;
    statusMessage: any;
    headers: any;
  }) {
    const {
      url, method, statusCode, statusMessage, headers,
    } = res
    return {
      url,
      method,
      statusCode,
      statusMessage,
      headers,
      body: res,
    }
  }
}
